/**
 * sync-scores.ts — Motor de sincronización de scores de accesibilidad
 * ====================================================================
 * Lee urls.csv, ejecuta Lighthouse (solo categoría de Accesibilidad)
 * para cada sitio, filtra violaciones de impacto crítico/grave y
 * hace upsert en la tabla `lighthouse_metrics` de Supabase.
 *
 * Uso:
 *   pnpm audit:sync              # ejecución normal
 *   pnpm audit:sync --dry-run    # simula sin escribir a Supabase
 *
 * Variables de entorno requeridas:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY    # bypassa RLS para escritura masiva
 *
 * Nota de arquitectura:
 *   Se usa la Lighthouse Node API en lugar de `lhci collect` por URL
 *   porque el API permite reutilizar una sola instancia de Chrome para
 *   todo el batch (más rápido, menor consumo de memoria) y devuelve
 *   el resultado directamente en memoria sin archivos temporales.
 *   El archivo lighthouserc.json sigue disponible para uso manual en CI.
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { parse as parseCsv } from 'csv-parse/sync'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { createClient } from '@supabase/supabase-js'

// ──────────────────────────────────────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────────────────────────────────────

interface CsvRow {
  nombre_sitio: string
  url: string
  alias: string
  pais: string
  categoria: string
  subcategoria?: string
}

interface CriticalIssue {
  auditId: string
  impact: 'critical' | 'serious'
  title: string
  affectedCount: number
  /** Hasta 5 nodos afectados para no inflar el JSONB */
  nodes: Array<{
    snippet: string
    label: string
    explanation?: string
  }>
}

interface AuditResult {
  alias: string
  url: string
  nombre_sitio: string
  pais: string
  categoria: string
  subcategoria: string | null
  accessibility_score: number | null
  critical_issues: CriticalIssue[]
  measured_at: string
}

interface RunSummary {
  total: number
  succeeded: number
  failed: string[]
  skipped: string[]
}

// Resultado interno de Lighthouse (solo los campos que nos interesan)
interface LhrAudit {
  id?: string
  score: number | null
  scoreDisplayMode: string
  title: string
  description?: string
  details?: {
    type: string
    items?: Array<Record<string, unknown>>
  }
}

interface LhrReport {
  categories: {
    accessibility?: { score: number | null }
  }
  audits: Record<string, LhrAudit>
}

// ──────────────────────────────────────────────────────────────────────────────
// Mapeo de audit IDs de Lighthouse → impacto axe-core
// Fuente: https://github.com/nicedoc/lighthouse/blob/master/core/audits/
// Solo se incluyen los de impacto 'critical' o 'serious' — el resto se ignora.
// ──────────────────────────────────────────────────────────────────────────────

const IMPACT_MAP: Readonly<Record<string, 'critical' | 'serious'>> = {
  // ── CRITICAL ──────────────────────────────────────────────────────────────
  'aria-allowed-attr':          'critical', // Atributos ARIA deben ser válidos para el rol
  'aria-hidden-body':           'critical', // [aria-hidden="true"] no puede estar en <body>
  'aria-required-attr':         'critical', // Atributos ARIA requeridos deben estar presentes
  'aria-required-children':     'critical', // Roles ARIA deben tener hijos requeridos
  'aria-required-parent':       'critical', // Roles ARIA deben estar en el contexto correcto
  'aria-roles':                 'critical', // Roles ARIA deben ser válidos
  'aria-valid-attr':            'critical', // Atributos ARIA deben existir
  'aria-valid-attr-value':      'critical', // Valores de atributos ARIA deben ser válidos
  'button-name':                'critical', // Los botones deben tener nombre accesible
  'duplicate-id-aria':          'critical', // IDs referenciados por ARIA deben ser únicos
  'image-alt':                  'critical', // Imágenes deben tener texto alternativo
  'input-image-alt':            'critical', // <input type="image"> debe tener texto alt
  'label':                      'critical', // Campos de formulario deben tener etiqueta
  'select-name':                'critical', // <select> debe tener nombre accesible
  'video-caption':              'critical', // Videos deben tener subtítulos (<track>)

  // ── SERIOUS ───────────────────────────────────────────────────────────────
  'bypass':                     'serious',  // Debe existir mecanismo para saltar bloques
  'color-contrast':             'serious',  // Contraste de color mínimo 4.5:1
  'color-contrast-enhanced':    'serious',  // Contraste mejorado 7:1 (AAA)
  'document-title':             'serious',  // El documento debe tener <title>
  'duplicate-id-active':        'serious',  // Elementos activos focusables con IDs únicos
  'frame-title':                'serious',  // <frame>/<iframe> deben tener título
  'html-has-lang':              'serious',  // <html> debe tener atributo lang
  'html-lang-valid':            'serious',  // lang de <html> debe ser válido (BCP 47)
  'link-name':                  'serious',  // Los enlaces deben tener nombre discernible
  'scrollable-region-focusable':'serious',  // Regiones con scroll deben ser focusables
  'td-headers-attr':            'serious',  // <td headers> debe referenciar <th> válidos
  'th-has-data-cells':          'serious',  // <th> deben tener celdas de datos asociadas
} as const

// ──────────────────────────────────────────────────────────────────────────────
// Utilidades de logging compatibles con GitHub Actions
// ──────────────────────────────────────────────────────────────────────────────

const isCI = process.env['CI'] === 'true'

const log = {
  group: (title: string) => {
    if (isCI) console.log(`::group::${title}`)
    else console.log(`\n▶  ${title}`)
  },
  endGroup: () => {
    if (isCI) console.log('::endgroup::')
  },
  info: (msg: string) => console.log(`   ${msg}`),
  success: (msg: string) => console.log(`   ✓ ${msg}`),
  warn: (msg: string) => {
    if (isCI) console.log(`::warning::${msg}`)
    else console.warn(`   ⚠ ${msg}`)
  },
  error: (msg: string) => {
    if (isCI) console.log(`::error::${msg}`)
    else console.error(`   ✗ ${msg}`)
  },
}

// ──────────────────────────────────────────────────────────────────────────────
// Parseo del CSV
// ──────────────────────────────────────────────────────────────────────────────

function loadCsv(csvPath: string): CsvRow[] {
  const raw = readFileSync(csvPath, 'utf-8')

  const rows = parseCsv(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    comment: '#',
  }) as Record<string, string>[]

  const validated: CsvRow[] = []
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue
    const lineNum = i + 2 // encabezado es línea 1

    const required = ['nombre_sitio', 'url', 'alias', 'pais', 'categoria'] as const
    const missing = required.filter((k) => !row[k]?.trim())

    if (missing.length > 0) {
      errors.push(`Línea ${lineNum}: faltan campos obligatorios: ${missing.join(', ')}`)
      continue
    }

    try {
      new URL(row['url']!)
    } catch {
      errors.push(`Línea ${lineNum}: URL inválida "${row['url']}"`)
      continue
    }

    if (!/^[a-z0-9-]+$/.test(row['alias']!)) {
      errors.push(`Línea ${lineNum}: alias "${row['alias']}" debe ser lowercase alfanumérico con guiones`)
      continue
    }

    validated.push({
      nombre_sitio: row['nombre_sitio']!,
      url: row['url']!,
      alias: row['alias']!,
      pais: row['pais']!,
      categoria: row['categoria']!,
      subcategoria: row['subcategoria']?.trim() || undefined,
    })
  }

  if (errors.length > 0) {
    log.warn(`CSV — ${errors.length} fila(s) con errores omitidas:`)
    errors.forEach((e) => log.warn(`  ${e}`))
  }

  return validated
}

// ──────────────────────────────────────────────────────────────────────────────
// Extracción de violaciones críticas/graves del LHR
// ──────────────────────────────────────────────────────────────────────────────

function extractCriticalIssues(audits: Record<string, LhrAudit>): CriticalIssue[] {
  const issues: CriticalIssue[] = []

  for (const [auditId, audit] of Object.entries(audits)) {
    // Solo auditorías fallidas (score === 0) con modo binario
    if (audit.scoreDisplayMode !== 'binary' || audit.score !== 0) continue

    const impact = IMPACT_MAP[auditId]
    if (!impact) continue // Impacto no mapeado (moderate/minor/informativo) — omitir

    const rawItems = audit.details?.items ?? []

    const nodes: CriticalIssue['nodes'] = rawItems
      .slice(0, 5) // máx 5 nodos para no inflar el JSONB
      .map((item) => {
        const node = (item['node'] ?? item) as Record<string, unknown>
        return {
          snippet: String(node['snippet'] ?? node['html'] ?? ''),
          label: String(node['nodeLabel'] ?? node['label'] ?? ''),
          explanation: node['explanation'] ? String(node['explanation']) : undefined,
        }
      })
      .filter((n) => n.snippet || n.label)

    issues.push({
      auditId,
      impact,
      title: audit.title,
      affectedCount: rawItems.length,
      nodes,
    })
  }

  // Ordenar: critical primero, luego por número de elementos afectados (desc)
  return issues.sort((a, b) => {
    if (a.impact !== b.impact) return a.impact === 'critical' ? -1 : 1
    return b.affectedCount - a.affectedCount
  })
}

// ──────────────────────────────────────────────────────────────────────────────
// Lighthouse: auditoría de un sitio
// ──────────────────────────────────────────────────────────────────────────────

async function auditSite(
  url: string,
  chromePort: number,
  timeoutMs: number = 60_000
): Promise<{ score: number | null; issues: CriticalIssue[] }> {
  const result = await Promise.race([
    lighthouse(url, {
      port: chromePort,
      output: 'json',
      logLevel: 'error', // suprime ruido de Lighthouse en los logs
      onlyCategories: ['accessibility'],
      formFactor: 'desktop',
      screenEmulation: { disabled: true },
      throttlingMethod: 'provided',      // sin throttling artificial — más rápido
      disableStorageReset: false,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout después de ${timeoutMs / 1000}s`)), timeoutMs)
    ),
  ])

  if (!result?.lhr) throw new Error('Lighthouse no devolvió resultados')

  const lhr = result.lhr as unknown as LhrReport

  const rawScore = lhr.categories.accessibility?.score
  const score = rawScore !== null && rawScore !== undefined
    ? Math.round(rawScore * 100 * 100) / 100  // 2 decimales
    : null

  const issues = extractCriticalIssues(lhr.audits)

  return { score, issues }
}

// ──────────────────────────────────────────────────────────────────────────────
// Supabase: upsert de resultados
// ──────────────────────────────────────────────────────────────────────────────

async function upsertMetrics(
  supabaseUrl: string,
  serviceRoleKey: string,
  rows: AuditResult[]
): Promise<void> {
  // Usamos el service role key: bypassa RLS para escritura masiva
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { error } = await supabase
    .from('lighthouse_metrics')
    .upsert(rows, {
      onConflict: 'alias',        // clave de upsert: alias único por sitio
      ignoreDuplicates: false,    // actualizar siempre con el resultado más reciente
    })

  if (error) throw new Error(`Supabase upsert falló: ${error.message}`)
}

// ──────────────────────────────────────────────────────────────────────────────
// Orquestador principal
// ──────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // ── Argumentos de CLI ────────────────────────────────────────────────────
  const { values: args } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'dry-run': { type: 'boolean', default: false },
      'csv': { type: 'string', default: 'urls.csv' },
      'timeout': { type: 'string', default: '60000' },
    },
    strict: false,
  })

  const isDryRun = Boolean(args['dry-run'])
  const timeoutMs = parseInt(String(args['timeout']), 10)
  const __dir = dirname(fileURLToPath(import.meta.url))
  const csvPath = resolve(__dir, String(args['csv']))

  // ── Variables de entorno ─────────────────────────────────────────────────
  const supabaseUrl = process.env['SUPABASE_URL']
  const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

  if (!isDryRun && (!supabaseUrl || !serviceRoleKey)) {
    console.error(
      '✗ Faltan variables de entorno: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorias.'
    )
    process.exit(1)
  }

  // ── Cargar CSV ───────────────────────────────────────────────────────────
  log.group('OLAAC Lighthouse Sync')
  log.info(`Modo: ${isDryRun ? 'DRY RUN (sin escritura en Supabase)' : 'PRODUCCIÓN'}`)
  log.info(`CSV: ${csvPath}`)
  log.endGroup()

  const sites = loadCsv(csvPath)
  if (sites.length === 0) {
    log.error('El CSV no contiene filas válidas. Abortando.')
    process.exit(1)
  }

  log.group(`Sitios a auditar: ${sites.length}`)
  sites.forEach((s, i) => log.info(`${String(i + 1).padStart(3)}. [${s.alias}] ${s.url}`))
  log.endGroup()

  // ── Lanzar Chrome (una sola vez para todo el batch) ─────────────────────
  log.group('Iniciando Chrome headless')
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-extensions',
    ],
  })
  log.success(`Chrome PID ${chrome.pid} en puerto ${chrome.port}`)
  log.endGroup()

  // ── Procesar cada sitio ─────────────────────────────────────────────────
  const summary: RunSummary = { total: sites.length, succeeded: 0, failed: [], skipped: [] }
  const results: AuditResult[] = []

  try {
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i]!
      const progress = `[${i + 1}/${sites.length}]`

      log.group(`${progress} ${site.alias} — ${site.url}`)

      try {
        const { score, issues } = await auditSite(site.url, chrome.port, timeoutMs)

        const label = score !== null
          ? `score=${score} | críticas=${issues.filter((v) => v.impact === 'critical').length} | graves=${issues.filter((v) => v.impact === 'serious').length}`
          : 'score=N/A'

        log.success(label)

        results.push({
          alias: site.alias,
          url: site.url,
          nombre_sitio: site.nombre_sitio,
          pais: site.pais,
          categoria: site.categoria,
          subcategoria: site.subcategoria ?? null,
          accessibility_score: score,
          critical_issues: issues,
          measured_at: new Date().toISOString(),
        })

        summary.succeeded++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        log.error(`${site.alias}: ${msg}`)
        summary.failed.push(site.alias)
      }

      log.endGroup()
    }
  } finally {
    // Chrome siempre se cierra, incluso si hay errores
    await chrome.kill()
    log.info('Chrome cerrado.')
  }

  // ── Upsert en Supabase ───────────────────────────────────────────────────
  if (results.length > 0) {
    if (isDryRun) {
      log.group(`DRY RUN — ${results.length} filas que se escribirían en lighthouse_metrics`)
      results.forEach((r) =>
        log.info(`${r.alias}: score=${r.accessibility_score} issues=${r.critical_issues.length}`)
      )
      log.endGroup()
    } else {
      log.group(`Upsert en Supabase — ${results.length} filas`)
      try {
        await upsertMetrics(supabaseUrl!, serviceRoleKey!, results)
        log.success('Upsert completado.')
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        log.error(msg)
        summary.failed.push('supabase-upsert')
      }
      log.endGroup()
    }
  }

  // ── Resumen final ────────────────────────────────────────────────────────
  log.group('Resumen')
  log.info(`Total:     ${summary.total}`)
  log.info(`Exitosos:  ${summary.succeeded}`)
  log.info(`Fallidos:  ${summary.failed.length}${summary.failed.length ? ' → ' + summary.failed.join(', ') : ''}`)
  if (summary.skipped.length) log.info(`Omitidos:  ${summary.skipped.join(', ')}`)
  log.endGroup()

  if (summary.failed.length > 0) {
    process.exit(1) // GitHub Actions marcará el job como fallido
  }
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})
