import { AuthForm, OlaacLogo } from '@olaac/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Iniciar sesión — OLAAC' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(next ?? '/')

  async function sendMagicLink(email: string): Promise<{ error?: string }> {
    'use server'
    const supabase = await createClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // login solo — no crear cuentas nuevas desde aquí
        emailRedirectTo: redirectTo,
      },
    })

    if (error) {
      // Si el usuario no existe, sugerirle que se registre
      if (error.message.toLowerCase().includes('signups not allowed') || error.status === 422) {
        return { error: 'No encontramos una cuenta con ese correo. ¿Quieres crear una?' }
      }
      return { error: error.message }
    }
    return {}
  }

  // Sólo aceptar paths relativos — rechazar URLs absolutas o protocol-relative (//)
  const destino = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
  // /registro/completar pide nombre y país si faltan; si ya hay perfil, continúa al destino.
  // Se calcula fuera de la acción para que su closure capture sólo cadenas serializables.
  const afterLogin = `/registro/completar?next=${encodeURIComponent(destino)}`

  async function verifyCode(email: string, token: string): Promise<{ error?: string }> {
    'use server'
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (error) return { error: 'El código no es válido o ha expirado. Revísalo o solicita uno nuevo.' }

    redirect(afterLogin)
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" aria-label="OLAAC — Inicio">
            <OlaacLogo width={130} height={37} />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-brand-900">Inicia sesión</h1>
            <p className="mt-0.5 text-sm text-gray-500">Te enviamos un código de acceso a tu correo</p>
          </div>
        </div>

        {error === 'auth_callback_failed' && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            El código o enlace de acceso no es válido o ha expirado. Solicita uno nuevo.
          </p>
        )}

        <AuthForm
          onSubmit={sendMagicLink}
          onVerify={verifyCode}
          appName="OLAAC"
          labels={{
            emailHint: 'Te enviaremos un código de acceso; no necesitas contraseña.',
            submit: 'Enviar código de acceso',
            submittingSr: 'Enviando código…',
            success: 'Te enviamos un código de acceso a',
            successNote: 'El código expira en 1 hora. Si no lo ves, revisa la carpeta de spam.',
            code: 'Código de acceso',
          }}
        />

        <div className="text-center space-y-1">
          <p className="text-sm text-gray-500">
            ¿Eres nuevo en OLAAC?{' '}
            <Link
              href={`/registro${next ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="font-medium text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
            >
              Crea tu cuenta
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
