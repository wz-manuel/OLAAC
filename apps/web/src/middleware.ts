import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

import { routing } from '@/i18n/routing'
import { checkRateLimit } from '@/lib/rate-limit'
import { updateSession } from '@/lib/supabase/middleware'

const handleI18nRouting = createIntlMiddleware(routing)

const PROTECTED_ROUTES = [
  '/tickets',
  '/admin',
  '/voluntarios/inscribirse',
  '/voluntarios/mi-panel',
  '/distintivo/mi-organizacion',
  '/distintivo/solicitar',
  '/registro/completar',
]

const API_V1_RATE_LIMIT = 120
const API_V1_WINDOW_MS  = 60 * 1000

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|pt)(\/|$)/, '/') || '/'
}

function getLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(en|pt)(\/|$)/)
  return match ? `/${match[1]}` : ''
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/v1')) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        'anonymous'
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
    return NextResponse.next()
  }

  if (pathname.startsWith('/auth/')) return NextResponse.next()

  const intlResponse = handleI18nRouting(request)
  const isI18nRedirect = intlResponse.status >= 300 && intlResponse.status < 400

  const { supabaseResponse, user } = await updateSession(request)

  if (isI18nRedirect) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return intlResponse
  }

  const cleanPath = stripLocale(pathname)
  const localePrefix = getLocalePrefix(pathname)

  const isProtected = PROTECTED_ROUTES.some((r) => cleanPath.startsWith(r))

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = `${localePrefix}/login`
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (cleanPath === '/login' && user) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = localePrefix || '/'
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
