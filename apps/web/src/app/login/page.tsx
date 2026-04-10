import { redirect } from 'next/navigation'

import { AuthForm } from '@olaac/ui'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Iniciar sesión — OLAAC' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  // Si ya hay sesión, redirigir
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(next ?? '/')

  async function sendMagicLink(email: string): Promise<{ error?: string }> {
    'use server'
    const supabase = await createClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })

    if (error) return { error: error.message }
    return {}
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">OLAAC</h1>
          <p className="text-sm text-gray-500">
            Observatorio de Accesibilidad Digital
          </p>
        </div>
        {error === 'auth_callback_failed' && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            El enlace de acceso no es válido o ha expirado. Solicita uno nuevo.
          </p>
        )}
        <AuthForm onSubmit={sendMagicLink} appName="OLAAC" />
      </div>
    </main>
  )
}
