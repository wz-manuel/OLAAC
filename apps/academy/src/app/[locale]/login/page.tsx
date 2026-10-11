import { AuthForm } from '@olaac/ui'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'

import { getPathname } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata() {
  const t = await getTranslations('login')
  return { title: t('metaTitle') }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  // Si ya hay sesión, redirigir
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()
  if (user) redirect(next ?? getPathname({ href: '/', locale }))

  const t = await getTranslations('login')

  async function sendMagicLink(email: string): Promise<{ error?: string }> {
    'use server'
    const supabase = await createClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_ACADEMY_URL}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`

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
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-gray-500">
            {t('subtitle')}
          </p>
        </div>
        {error === 'auth_callback_failed' && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {t('errorEnlace')}
          </p>
        )}
        <AuthForm
          onSubmit={sendMagicLink}
          appName="Academia OLAAC"
          labels={{
            formAriaLabel: t('formAria'),
            email: t('email'),
            emailPlaceholder: t('emailPlaceholder'),
            emailHint: t('emailHint'),
            submit: t('enviar'),
            submitting: t('enviando'),
            submittingSr: t('enviandoSr'),
            success: t('exito'),
            successNote: t('exitoNota'),
          }}
        />
      </div>
    </main>
  )
}
