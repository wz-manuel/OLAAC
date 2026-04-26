import { SkipLink } from '@olaac/ui'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import { SiteHeader } from '@/components/site-header'
import { routing, type Locale } from '@/i18n/routing'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    template: '%s | OLAAC',
    default: 'OLAAC — Observatorio Latinoamericano de Accesibilidad',
  },
  description:
    'Organismo de control social que realiza diagnósticos de accesibilidad en entornos digitales y físicos.',
  metadataBase: new URL('https://olaac.org'),
  openGraph: {
    type: 'website',
  },
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

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SkipLink href="#main-content" />
          <SiteHeader />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
