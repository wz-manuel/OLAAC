import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

import { routing } from '@/i18n/routing'
import { updateSession } from '@/lib/supabase/middleware'

const handleI18nRouting = createIntlMiddleware(routing)

const PROTECTED_PREFIXES = ['/cursos']

function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|pt)(\/|$)/, '/') || '/'
}

function getLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(en|pt)(\/|$)/)
  return match ? `/${match[1]}` : ''
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

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

  const isProtected = PROTECTED_PREFIXES.some((prefix) => cleanPath.startsWith(prefix))

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
