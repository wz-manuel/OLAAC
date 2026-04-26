import type { NextRequest } from 'next/server'

import { publicDb, apiOk, apiError, apiOptions } from '@/lib/api/v1'

export function OPTIONS() {
  return apiOptions()
}

export async function GET(
  request: NextRequest,
  { params }: { params: { alias: string } }
) {
  const { alias } = params
  const { searchParams } = request.nextUrl
  const rawLimit = parseInt(searchParams.get('limit') ?? '52', 10)

  if (!/^[a-z0-9-]+$/.test(alias))
    return apiError('INVALID_PARAM', '`alias` debe ser alfanumérico en minúsculas con guiones.', 400)
  if (isNaN(rawLimit) || rawLimit < 1 || rawLimit > 104)
    return apiError('INVALID_PARAM', '`limit` debe ser un entero entre 1 y 104.', 400)

  const db = publicDb()

  // Verificar que el alias existe
  const { error: notFoundErr } = await db
    .from('lighthouse_metrics')
    .select('alias')
    .eq('alias', alias)
    .single()

  if (notFoundErr?.code === 'PGRST116')
    return apiError('NOT_FOUND', `No se encontró el sitio "${alias}".`, 404)

  const { data, error } = await db
    .from('lighthouse_snapshots')
    .select('measured_at, accessibility_score')
    .eq('alias', alias)
    .order('measured_at', { ascending: true })
    .limit(rawLimit)

  if (error) return apiError('DB_ERROR', error.message, 500)

  return apiOk(data ?? [], { alias, count: (data ?? []).length })
}
