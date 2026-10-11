import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'

import { CompleteProfileForm } from '@/components/profile/complete-profile-form'
import { routing } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata() {
  const t = await getTranslations('profile')
  return { title: t('metaTitle') }
}

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next: rawNext } = await searchParams
  // Sólo aceptar paths relativos — rechazar URLs absolutas o protocol-relative (//)
  const next = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sin sesión → login
  if (!user) {
    const locale = await getLocale()
    const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`
    redirect(`${localePrefix}/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`)
  }

  // Ya tiene perfil → continuar
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile) redirect(next)

  const t = await getTranslations('profile')

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-gray-500">{t('subtitle')}</p>
        </div>

        <CompleteProfileForm email={user.email ?? ''} redirectTo={next} />
      </div>
    </div>
  )
}
