import { expect, test } from '@playwright/test'

// Tests del contrato de la API pública v1.
// Verifican estructura de respuesta, no valores de datos específicos.
// Estructura real: { data: { ... } } para endpoints de detalle/stats,
//                  { data: [...], meta: { total, count, page, limit } } para colecciones.

test.describe('API pública v1', () => {
  test('GET /api/v1 — devuelve documentación del API', async ({ request }) => {
    const res = await request.get('/api/v1')
    expect(res.status()).toBe(200)
    const body = await res.json()
    // La documentación está envuelta en { data: { api, version, endpoints } }
    expect(body).toHaveProperty('data')
    expect(body.data).toHaveProperty('version')
    expect(body.data).toHaveProperty('endpoints')
    expect(Array.isArray(body.data.endpoints)).toBe(true)
  })

  test('GET /api/v1/stats — devuelve estadísticas globales', async ({ request }) => {
    const res = await request.get('/api/v1/stats')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    const data = body.data
    // Campos reales del endpoint
    expect(data).toHaveProperty('total_sitios')
    expect(data).toHaveProperty('avg_score')
    expect(typeof data.total_sitios).toBe('number')
    expect(typeof data.avg_score).toBe('number')
  })

  test('GET /api/v1/countries — devuelve lista de países', async ({ request }) => {
    const res = await request.get('/api/v1/countries')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /api/v1/sites — devuelve lista de sitios con paginación', async ({ request }) => {
    const res = await request.get('/api/v1/sites')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('meta')
    expect(Array.isArray(body.data)).toBe(true)
    // Campos reales de paginación
    expect(body.meta).toHaveProperty('total')
    expect(body.meta).toHaveProperty('page')
    expect(body.meta).toHaveProperty('limit')
  })

  test('GET /api/v1/sites?pais=MX — filtra por país', async ({ request }) => {
    const res = await request.get('/api/v1/sites?pais=MX')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /api/v1/sites/url-inexistente — devuelve 404', async ({ request }) => {
    const res = await request.get('/api/v1/sites/sitio-que-no-existe-xyz')
    expect(res.status()).toBe(404)
  })

  test('API v1 incluye headers de rate limit', async ({ request }) => {
    const res = await request.get('/api/v1/stats')
    expect(res.headers()['x-ratelimit-limit']).toBeDefined()
    expect(res.headers()['x-ratelimit-remaining']).toBeDefined()
  })

  test('API v1 devuelve Content-Type application/json', async ({ request }) => {
    const res = await request.get('/api/v1/stats')
    expect(res.headers()['content-type']).toContain('application/json')
  })
})
