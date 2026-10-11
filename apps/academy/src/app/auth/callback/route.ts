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
  // Sólo aceptar paths relativos — rechazar URLs absolutas o protocol-relative (//)
  const rawNext = searchParams.get('next') ?? '/'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
