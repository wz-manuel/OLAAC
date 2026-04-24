import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * Callback de Supabase Auth (Magic Link / OTP).
 * Intercambia el code PKCE por sesión, verifica que el usuario tenga
 * perfil creado y redirige al destino (o a completar registro si falta).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

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
          .single()

        // Usuario sin perfil (entró por Magic Link directo) → completar registro
        if (!profile) {
          const completarUrl = new URL('/registro/completar', origin)
          if (next !== '/') completarUrl.searchParams.set('next', next)
          return NextResponse.redirect(completarUrl.toString())
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
