import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * Callback de Supabase Auth (Magic Link / OAuth).
 * Intercambia el `code` PKCE por una sesión activa, verifica que el usuario
 * tenga perfil y redirige al destino (o a completar el perfil si falta).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Sólo aceptar paths relativos — rechazar URLs absolutas o protocol-relative (//)
  const rawNext = searchParams.get('next') ?? '/'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle()

        // Usuario sin perfil (entró por Magic Link directo) → pedir nombre y país
        if (!profile) {
          const completarUrl = new URL('/perfil/completar', origin)
          if (next !== '/') completarUrl.searchParams.set('next', next)
          return NextResponse.redirect(completarUrl.toString())
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
