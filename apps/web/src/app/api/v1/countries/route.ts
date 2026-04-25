import { publicDb, apiOk, apiError, apiOptions } from '@/lib/api/v1'

export function OPTIONS() {
  return apiOptions()
}

export async function GET() {
  const db = publicDb()

  const { data, error } = await db
    .from('lighthouse_metrics')
    .select('pais, accessibility_score')

  if (error) return apiError('DB_ERROR', error.message, 500)

  // Agrupar por país en memoria — la tabla tiene ~50 filas, costo mínimo
  const map = new Map<string, { scores: number[]; total: number }>()

  for (const row of data ?? []) {
    const entry = map.get(row.pais) ?? { scores: [], total: 0 }
    entry.total++
    if (row.accessibility_score !== null) entry.scores.push(row.accessibility_score)
    map.set(row.pais, entry)
  }

  const countries = Array.from(map.entries())
    .map(([pais, { scores, total }]) => ({
      pais,
      avg_score: scores.length
        ? Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10
        : null,
      total_sitios: total,
      criticos: scores.filter((s) => s < 50).length,
    }))
    .sort((a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0))

  return apiOk(countries, { count: countries.length })
}
