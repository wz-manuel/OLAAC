import { OlaacLogo, UserNav } from '@olaac/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { LanguageSwitcher } from '@/components/language-switcher'
import { createClient } from '@/lib/supabase/server'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 rounded"
            aria-label="OLAAC — Inicio"
          >
            <OlaacLogo width={120} height={34} />
          </Link>
          <SiteNav />
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user?.email && (
            <UserNav email={user.email} onSignOut={signOut} />
          )}
        </div>
      </div>
    </header>
  )
}

function SiteNav() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations('nav')

  const links = [
    { href: '/scores',         label: t('scores') },
    { href: '/tickets',        label: t('tickets') },
    { href: '/distintivo',     label: t('distintivo') },
    { href: '/reportes',       label: t('reportes') },
    { href: '/marco-legal',    label: t('marcoLegal') },
    { href: '/datos-abiertos', label: t('api') },
  ]

  return (
    <nav aria-label={t('ariaLabel')}>
      <ul className="flex items-center gap-4">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-sm text-brand-600 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
            >
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/donativos"
            className="rounded-md bg-[#005fcc]/10 px-3 py-1 text-sm font-medium text-[#005fcc] transition-colors hover:bg-[#005fcc]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
          >
            {t('donativos')}
          </Link>
        </li>
      </ul>
    </nav>
  )
}
