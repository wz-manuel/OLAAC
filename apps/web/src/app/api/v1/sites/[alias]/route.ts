import type { NextRequest } from 'next/server'
import { publicDb, apiOk, apiError, apiOptions, issueDetail } from '@/lib/api/v1'

export function OPTIONS() {
  return apiOptions()
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { alias: string } }
) {
  const { alias } = params

  if (!/^[a-z0-9-]+$/.test(alias))
    return apiError('INVALID_PARAM', '`alias` debe ser alfanumérico en minúsculas con guiones.', 400)

  const db = publicDb()

  const { data, error } = await db
    .from('lighthouse_metrics')
    .select('*')
    .eq('alias', alias)
    .single()

  if (error?.code === 'PGRST116') return apiError('NOT_FOUND', `No se encontró el sitio "${alias}".`, 404)
  if (error) return apiError('DB_ERROR', error.message, 500)

  return apiOk({
    alias:               data.alias,
    nombre_sitio:        data.nombre_sitio,
    url:                 data.url,
    pais:                data.pais,
    categoria:           data.categoria,
    subcategoria:        data.subcategoria,
    accessibility_score: data.accessibility_score,
    issues:              issueDetail(data.critical_issues),
    measured_at:         data.measured_at,
  })
}
