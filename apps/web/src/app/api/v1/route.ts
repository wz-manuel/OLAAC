import { apiOk, apiOptions } from '@/lib/api/v1'

export function OPTIONS() {
  return apiOptions()
}

export function GET() {
  return apiOk({
    api: 'OLAAC Accessibility API',
    version: '1.0.0',
    description:
      'API pública del Observatorio Latinoamericano de Accesibilidad. ' +
      'Proporciona datos de auditorías Lighthouse de más de 50 sitios web ' +
      'de gobiernos y universidades de América Latina.',
    base_url: 'https://olaac.org/api/v1',
    docs: 'https://olaac.org/datos-abiertos',
    endpoints: [
      { method: 'GET', path: '/api/v1/sites',                   description: 'Lista de sitios con su score actual' },
      { method: 'GET', path: '/api/v1/sites/:alias',            description: 'Detalle de un sitio específico' },
      { method: 'GET', path: '/api/v1/sites/:alias/history',    description: 'Historial de auditorías de un sitio' },
      { method: 'GET', path: '/api/v1/countries',               description: 'Scores promedio agrupados por país' },
      { method: 'GET', path: '/api/v1/stats',                   description: 'Estadísticas globales del observatorio' },
    ],
    cors: 'open — Access-Control-Allow-Origin: *',
    authentication: 'none',
    rate_limit: '120 requests per minute per IP',
    cache: 's-maxage=3600, stale-while-revalidate=86400',
    license: 'CC BY 4.0',
    contact: 'datos@olaac.org',
  })
}
