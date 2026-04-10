import { SkipLink } from '@olaac/ui'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  title: { template: '%s | Academia OLAAC', default: 'Academia OLAAC — Formación en Accesibilidad' },
  description: 'Aprende accesibilidad digital y física con el Observatorio Latinoamericano de Accesibilidad.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <SkipLink href="#main-content" />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  )
}
