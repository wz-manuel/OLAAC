import { SkipLink } from '@olaac/ui'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // WCAG 1.4.8 — Presentación visual
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
    locale: 'es_LA',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* WCAG 2.4.1 — Evitar bloques: enlace de salto obligatorio */}
        <SkipLink href="#main-content" />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  )
}
