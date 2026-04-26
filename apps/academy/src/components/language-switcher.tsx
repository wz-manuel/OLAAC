'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

const LOCALE_META: Record<string, { flag: string }> = {
  es: { flag: '🇪🇸' },
  en: { flag: '🇺🇸' },
  pt: { flag: '🇧🇷' },
}

export function LanguageSwitcher() {
  const t = useTranslations('localeSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  const current = LOCALE_META[locale] ?? LOCALE_META['es']!

  return (
    <div className="relative flex items-center">
      <span className="pointer-events-none absolute left-2 select-none text-sm leading-none" aria-hidden="true">
        {current.flag}
      </span>
      <select
        value={locale}
        onChange={handleChange}
        disabled={isPending}
        aria-label={t('ariaLabel')}
        className={[
          'appearance-none rounded-md border border-gray-200 bg-white py-1 pl-7 pr-6 text-xs font-medium text-gray-700',
          'hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]',
          'cursor-pointer transition-opacity',
          isPending ? 'opacity-50' : '',
        ].join(' ')}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc as 'es' | 'en' | 'pt')}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-1.5 h-3 w-3 text-gray-400"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
