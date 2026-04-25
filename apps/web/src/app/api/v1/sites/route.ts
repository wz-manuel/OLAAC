import type { NextRequest } from 'next/server'
import { publicDb, apiOk, apiError, apiOptions, issueCount } from '@/lib/api/v1'

export function OPTIONS() {
  return apiOptions()
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const country  = searchParams.get('country')  ?? undefined
  const category = searchParams.get('category') ?? undefined
  const rawLimit = parseInt(searchParams.get('limit') ?? '100', 10)
  const rawPage  = parseInt(searchParams.get('page')  ?? '1',   10)

  if (isNaN(rawLimit) || rawLimit < 1 || rawLimit > 200)
    return apiError('INVALID_PARAM', '`limit` debe ser un entero entre 1 y 200.', 400)
  if (isNaN(rawPage) || rawPage < 1)
    return apiError('INVALID_PARAM', '`page` debe ser un entero mayor a 0.', 400)

  const limit  = rawLimit
  const offset = (rawPage - 1) * limit

  const db = publicDb()

  let query = db
    .from('lighthouse_metrics')
    .select('alias, url, nombre_sitio, pais, categoria, subcategoria, accessibility_score, critical_issues, measured_at', { count: 'exact' })

  if (country)  query = query.ilike('pais', country)
  if (category) query = query.ilike('categoria', category)

  const { data, error, count } = await query
    .order('accessibility_score', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (error) return apiError('DB_ERROR', error.message, 500)

  const sites = (data ?? []).map((row) => ({
    alias:              row.alias,
    nombre_sitio:       row.nombre_sitio,
    url:                row.url,
    pais:               row.pais,
    categoria:          row.categoria,
    subcategoria:       row.subcategoria,
    accessibility_score: row.accessibility_score,
    issues:             issueCount(row.critical_issues),
    measured_at:        row.measured_at,
  }))

  return apiOk(sites, {
    total: count ?? 0,
    count: sites.length,
    page:  rawPage,
    limit,
  })
}
