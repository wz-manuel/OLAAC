import { type NextRequest, NextResponse } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'
import { checkRateLimit } from '@/lib/rate-limit'

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/tickets',
  '/admin',
  '/voluntarios/inscribirse',
  '/voluntarios/mi-panel',
  '/distintivo/mi-organizacion',
  '/distintivo/solicitar',
  '/registro/completar',
]

// Rutas de autenticación (no redirigir si ya hay sesión hacia ellas, excepto /registro)
const AUTH_ROUTES = ['/login']

// 120 req/min por IP para la API pública v1
const API_V1_RATE_LIMIT  = 120
const API_V1_WINDOW_MS   = 60 * 1000

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Rate limiting en /api/v1/* ────────────────────────────────────────────
  if (pathname.startsWith('/api/v1')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'anonymous'

    const rl = checkRateLimit(`api:${ip}`, API_V1_RATE_LIMIT, API_V1_WINDOW_MS)

    if (!rl.success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Límite: 120 req/min por IP.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit':     String(API_V1_RATE_LIMIT),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset':     String(Math.ceil(rl.resetAt / 1000)),
            'Retry-After':           String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        },
      )
    }

    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit',     String(API_V1_RATE_LIMIT))
    response.headers.set('X-RateLimit-Remaining', String(rl.remaining))
    response.headers.set('X-RateLimit-Reset',     String(Math.ceil(rl.resetAt / 1000)))
    return response
  }

  const { supabaseResponse, user } = await updateSession(request)

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si ya está autenticado e intenta entrar al login, redirigir al inicio
  if (AUTH_ROUTES.includes(pathname) && user) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/'
    homeUrl.searchParams.delete('next')
    return NextResponse.redirect(homeUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
