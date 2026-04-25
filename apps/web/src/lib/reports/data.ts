import { publicDb, issueCount } from '@/lib/api/v1'

// ── Tipos de datos del reporte ────────────────────────────────────────────────

export interface ReportSite {
  alias: string
  nombre_sitio: string
  url: string
  pais: string
  categoria: string
  subcategoria: string | null
  accessibility_score: number | null
  issues: { critical: number; serious: number }
  measured_at: string
}

export interface CountryStat {
  pais: string
  avg_score: number | null
  total_sitios: number
  criticos: number
}

export interface ReportData {
  title: string
  subtitle: string
  generated_at: string
  pais?: string
  sites: ReportSite[]
  countries: CountryStat[]
  stats: {
    avg_score: number | null
    total_sitios: number
    critical_sites: number
    countries_count: number
    last_audit: string | null
  }
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

export async function fetchReportData(pais?: string): Promise<ReportData> {
  const db = publicDb()
  const year = new Date().getFullYear()

  let query = db
    .from('lighthouse_metrics')
    .select('alias, url, nombre_sitio, pais, categoria, subcategoria, accessibility_score, critical_issues, measured_at')

  if (pais) query = query.ilike('pais', pais)

  const { data } = await query.order('accessibility_score', { ascending: false, nullsFirst: false })

  const rows = data ?? []

  const sites: ReportSite[] = rows.map((row) => ({
    alias:               row.alias,
    nombre_sitio:        row.nombre_sitio,
    url:                 row.url,
    pais:                row.pais,
    categoria:           row.categoria,
    subcategoria:        row.subcategoria,
    accessibility_score: row.accessibility_score,
    issues:              issueCount(row.critical_issues),
    measured_at:         row.measured_at,
  }))

  // Estadísticas por país
  const countryMap = new Map<string, { scores: number[]; total: number }>()
  for (const site of sites) {
    const entry = countryMap.get(site.pais) ?? { scores: [], total: 0 }
    entry.total++
    if (site.accessibility_score !== null) entry.scores.push(site.accessibility_score)
    countryMap.set(site.pais, entry)
  }

  const countries: CountryStat[] = Array.from(countryMap.entries())
    .map(([p, { scores, total }]) => ({
      pais: p,
      avg_score: scores.length
        ? Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10
        : null,
      total_sitios: total,
      criticos: scores.filter((s) => s < 50).length,
    }))
    .sort((a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0))

  const scores = sites
    .map((s) => s.accessibility_score)
    .filter((s): s is number => s !== null)

  const lastAudit = rows.reduce<string | null>(
    (max, r) => (!max || r.measured_at > max ? r.measured_at : max),
    null
  )

  const avg = scores.length
    ? Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10
    : null

  return {
    title: pais
      ? `Informe de Accesibilidad Digital — ${pais}`
      : 'Informe de Accesibilidad Digital — América Latina',
    subtitle: pais
      ? `Estado de la accesibilidad web en ${pais} · ${year}`
      : `Estado de la accesibilidad web en la región · ${year}`,
    generated_at: new Date().toISOString(),
    pais,
    sites,
    countries,
    stats: {
      avg_score:      avg,
      total_sitios:   sites.length,
      critical_sites: scores.filter((s) => s < 50).length,
      countries_count: countryMap.size,
      last_audit:     lastAudit,
    },
  }
}

// ── Helpers de formateo ───────────────────────────────────────────────────────

export function scoreLabel(score: number | null): string {
  if (score === null) return 'N/D'
  if (score >= 90) return 'Excelente'
  if (score >= 80) return 'Bueno'
  if (score >= 65) return 'Moderado'
  if (score >= 50) return 'Deficiente'
  return 'Crítico'
}

export function scoreColor(score: number | null): string {
  if (score === null) return '#9ca3af'
  if (score >= 90) return '#15803d'
  if (score >= 80) return '#16a34a'
  if (score >= 65) return '#b45309'
  if (score >= 50) return '#c2410c'
  return '#dc2626'
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
