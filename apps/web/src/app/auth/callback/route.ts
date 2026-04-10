import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * Callback de Supabase Auth (Magic Link / OAuth).
 * Intercambia el `code` PKCE por una sesión activa y redirige al destino.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Algo falló — redirigir a login con error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
