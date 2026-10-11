import { SkipLink } from '@olaac/ui'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'

import { SiteHeader } from '@/components/site-header'
import { routing, type Locale } from '@/i18n/routing'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = routing.locales.includes(params.locale as Locale) ? params.locale : routing.defaultLocale
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: { template: t.raw('titleTemplate'), default: t('defaultTitle') },
    description: t('description'),
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

  if (!routing.locales.includes(locale as Locale)) notFound()

  setRequestLocale(locale)

  const messages = await getMessages()
  const t = await getTranslations('nav')

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SkipLink href="#main-content">{t('skipLink')}</SkipLink>
          <SiteHeader />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
