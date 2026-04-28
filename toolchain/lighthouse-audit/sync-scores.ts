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
  const lhPromise = lighthouse(url, {
    port: chromePort,
    output: 'json',
    logLevel: 'error', // suprime ruido de Lighthouse en los logs
    onlyCategories: ['accessibility'],
    formFactor: 'desktop',
    screenEmulation: { disabled: true },
    throttlingMethod: 'provided',      // sin throttling artificial — más rápido
    disableStorageReset: false,
    locale: 'es-419',                  // español latinoamericano para titles y explanations
  })

  // Evita "unhandled rejection" si el timeout gana la carrera y Lighthouse
  // falla después: el error queda suprimido aquí en lugar de crashear el proceso.
  lhPromise.catch(() => {})

  const result = await Promise.race([
    lhPromise,
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
// Supabase: escritura de resultados
// ──────────────────────────────────────────────────────────────────────────────

function createSupabaseClient(supabaseUrl: string, serviceRoleKey: string) {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

async function upsertMetrics(
  supabaseUrl: string,
  serviceRoleKey: string,
  rows: AuditResult[]
): Promise<void> {
  const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

  const { error } = await supabase
    .from('lighthouse_metrics')
    .upsert(rows, {
      onConflict: 'alias',        // clave de upsert: alias único por sitio
      ignoreDuplicates: false,    // actualizar siempre con el resultado más reciente
    })

  if (error) throw new Error(`Supabase upsert falló: ${error.message}`)
}

async function insertSnapshots(
  supabaseUrl: string,
  serviceRoleKey: string,
  rows: AuditResult[]
): Promise<void> {
  const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

  // Insertamos en lighthouse_snapshots — sin onConflict, cada auditoría
  // genera una fila nueva para preservar el historial completo.
  const { error } = await supabase
    .from('lighthouse_snapshots')
    .insert(
      rows.map(({ alias, url, nombre_sitio, pais, categoria, subcategoria, accessibility_score, critical_issues, measured_at }) => ({
        alias, url, nombre_sitio, pais, categoria, subcategoria,
        accessibility_score, critical_issues, measured_at,
      }))
    )

  if (error) throw new Error(`Supabase insert snapshots falló: ${error.message}`)
}

// ──────────────────────────────────────────────────────────────────────────────
// Suprimir excepciones de protocolo CDP que escapan al event loop
//
// Cuando un sitio agota el timeout, Lighthouse sigue corriendo en background
// con la conexión Chrome abierta. Al matar Chrome para reiniciarlo, los
// callbacks pendientes del CDP lanzan "Protocol error / Target closed" como
// excepciones NO capturables vía .catch() porque provienen de listeners del
// WebSocket, no de cadenas de promesas. Las suprimimos aquí para que no
// maten el proceso; cualquier otra excepción no capturada sí lo termina.
// ──────────────────────────────────────────────────────────────────────────────

process.on('uncaughtException', (err) => {
  const msg = err?.message ?? ''
  if (msg.includes('Protocol error') || msg.includes('Target closed') || msg.includes('Session closed')) {
    // Residuo de Lighthouse en background tras el reinicio de Chrome — ignorar.
    return
  }
  // Cualquier otra excepción sí debe terminar el proceso.
  console.error('Error fatal no capturado:', err)
  process.exit(1)
})

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
      'timeout': { type: 'string', default: '100000' },
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

  // ── Lanzar Chrome ────────────────────────────────────────────────────────
  const chromeFlags = [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-extensions',
  ]

  async function launchChrome() {
    const instance = await chromeLauncher.launch({ chromeFlags })
    log.success(`Chrome PID ${instance.pid} en puerto ${instance.port}`)
    return instance
  }

  log.group('Iniciando Chrome headless')
  let chrome = await launchChrome()
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

        // Reiniciar Chrome para limpiar cualquier estado corrupto antes del
        // siguiente sitio (un timeout o crash de protocolo puede dejar el
        // proceso interno en estado inválido).
        try { await chrome.kill() } catch { /* ya muerto */ }
        if (i < sites.length - 1) {
          log.group('Reiniciando Chrome')
          try {
            chrome = await launchChrome()
          } catch (launchErr) {
            const launchMsg = launchErr instanceof Error ? launchErr.message : String(launchErr)
            log.error(`No se pudo relanzar Chrome: ${launchMsg}`)
            const remaining = sites.slice(i + 1).map((s) => s.alias)
            summary.skipped.push(...remaining)
            log.endGroup()
            break
          }
          log.endGroup()
        }
      }

      log.endGroup()
    }
  } finally {
    // Chrome siempre se cierra, incluso si hay errores
    try { await chrome.kill() } catch { /* ya muerto si se reinició en el último sitio */ }
    log.info('Chrome cerrado.')
  }

  // ── Escritura en Supabase ────────────────────────────────────────────────
  if (results.length > 0) {
    if (isDryRun) {
      log.group(`DRY RUN — ${results.length} filas que se escribirían en Supabase`)
      results.forEach((r) =>
        log.info(`${r.alias}: score=${r.accessibility_score} issues=${r.critical_issues.length}`)
      )
      log.endGroup()
    } else {
      log.group(`Escribiendo ${results.length} filas en Supabase`)
      try {
        await upsertMetrics(supabaseUrl!, serviceRoleKey!, results)
        log.success('lighthouse_metrics — upsert completado.')
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        log.error(msg)
        summary.failed.push('supabase-upsert')
      }
      try {
        await insertSnapshots(supabaseUrl!, serviceRoleKey!, results)
        log.success('lighthouse_snapshots — insert completado.')
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        log.error(`Snapshot insert no crítico: ${msg}`)
        // No añadimos a summary.failed — un fallo en snapshots no debe
        // marcar el job como fallido porque lighthouse_metrics ya se guardó.
      }
      log.endGroup()
    }
  }

  // ── Resumen final ────────────────────────────────────────────────────────
  log.group('Resumen')
  log.info(`Total:     ${summary.total}`)
  log.info(`Exitosos:  ${summary.succeeded}`)
  log.info(`Timeouts:  ${summary.failed.length}${summary.failed.length ? ' → ' + summary.failed.join(', ') : ''}`)
  if (summary.skipped.length) log.info(`Omitidos:  ${summary.skipped.join(', ')}`)
  log.endGroup()

  // Solo se considera un fallo real (exit 1 → email de GitHub) cuando:
  // - Supabase no pudo escribir (supabase-upsert en failed), o
  // - Ningún sitio fue auditado exitosamente.
  // Los timeouts por sitios lentos son advertencias, no fallos del pipeline.
  const hasFatalError = summary.failed.includes('supabase-upsert') || summary.succeeded === 0
  if (hasFatalError) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Error fatal:', err)
  process.exit(1)
})
