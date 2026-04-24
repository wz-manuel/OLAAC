import Link from 'next/link'
import { redirect } from 'next/navigation'

import { OlaacLogo } from '@olaac/ui'
import { RegisterForm } from '@/components/registro/register-form'
import { enviarOtpRegistro, verificarOtpYRegistrar } from '@/lib/actions/registro'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Crear cuenta — OLAAC' }

const DESTINOS: Record<string, string> = {
  voluntario:  '/voluntarios/inscribirse',
  academia:    '/cursos',
  distintivo:  '/distintivo/mi-organizacion',
}

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; contexto?: string }>
}) {
  const { next, contexto } = await searchParams

  // Si ya tiene sesión y perfil, redirigir
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      redirect(next ?? DESTINOS[contexto ?? ''] ?? '/')
    }
    // Tiene sesión pero sin perfil → completar
    redirect(`/registro/completar${next ? `?next=${encodeURIComponent(next)}` : ''}`)
  }

  const redirectTo = next ?? DESTINOS[contexto ?? ''] ?? '/'
  const ctxKey = contexto as 'voluntario' | 'academia' | 'distintivo' | undefined

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" aria-label="OLAAC — Inicio">
            <OlaacLogo width={130} height={37} />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-brand-900">Crea tu cuenta</h1>
            <p className="mt-0.5 text-sm text-gray-500">Observatorio Latinoamericano de Accesibilidad</p>
          </div>
        </div>

        <RegisterForm
          onEnviarOtp={enviarOtpRegistro}
          onVerificarOtp={verificarOtpYRegistrar}
          redirectTo={redirectTo}
          contexto={ctxKey ?? null}
        />

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link
            href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="font-medium text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
