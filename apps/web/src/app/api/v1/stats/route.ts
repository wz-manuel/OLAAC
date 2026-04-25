import { publicDb, apiOk, apiError, apiOptions } from '@/lib/api/v1'

export function OPTIONS() {
  return apiOptions()
}

export async function GET() {
  const db = publicDb()

  const { data, error } = await db
    .from('lighthouse_metrics')
    .select('pais, accessibility_score, measured_at')

  if (error) return apiError('DB_ERROR', error.message, 500)

  const rows = data ?? []
  const scores = rows.map((r) => r.accessibility_score).filter((s): s is number => s !== null)
  const countries = new Set(rows.map((r) => r.pais)).size
  const lastAudit = rows.reduce<string | null>((max, r) =>
    !max || r.measured_at > max ? r.measured_at : max, null)

  const avg = scores.length
    ? Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10
    : null

  return apiOk({
    avg_score:      avg,
    total_sitios:   rows.length,
    critical_sites: scores.filter((s) => s < 50).length,
    countries_count: countries,
    last_audit:     lastAudit,
  })
}
