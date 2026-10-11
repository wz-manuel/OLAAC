import { OlaacLogo, UserNav } from '@olaac/ui'
import { getLocale, getTranslations } from 'next-intl/server'

import { LanguageSwitcher } from '@/components/language-switcher'
import { Link, redirect } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect({ href: '/login', locale: await getLocale() })
  }

  const t = await getTranslations('nav')

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 rounded"
            aria-label={t('homeAriaLabel')}
          >
            <OlaacLogo width={120} height={34} />
          </Link>
          <span className="text-xs font-medium text-accent-500 border border-accent-300 rounded px-2 py-0.5">
            {t('academiaBadge')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user?.email && (
            <UserNav
              email={user.email}
              onSignOut={signOut}
              labels={{
                signedInAs: t('sesionComo', { email: user.email }),
                signOut: t('cerrarSesion'),
                signingOut: t('cerrandoSesion'),
              }}
            />
          )}
        </div>
      </div>
    </header>
  )
}
