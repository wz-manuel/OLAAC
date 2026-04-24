import { type NextRequest, NextResponse } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

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

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

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
