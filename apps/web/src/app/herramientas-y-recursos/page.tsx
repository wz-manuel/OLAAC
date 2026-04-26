import type { Metadata } from 'next'
import Link from 'next/link'

import { ContentPage } from '@/components/content-page'
import { getPageBySlug } from '@/lib/content'

const page = getPageBySlug('herramientas-y-recursos')

export const metadata: Metadata = {
  title: 'Herramientas y recursos de accesibilidad',
  description: 'Evaluadores automáticos, guías y recursos para auditar y mejorar la accesibilidad web.',
}

export default function HerramientasPage() {
  return (
    <ContentPage
      titulo={page?.titulo ?? 'Herramientas y recursos'}
      contenido_markdown={page?.contenido_markdown ?? ''}
    >
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h2 className="font-semibold text-gray-900">Evaluadores de accesibilidad web</h2>
        <p className="mt-1 text-sm text-gray-600">
          Herramientas automáticas para auditar la accesibilidad de sitios web.
        </p>
        <Link
          href="/herramientas-y-recursos/evaluadores-de-accesibilidad-web"
          className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          Ver evaluadores →
        </Link>
      </div>
    </ContentPage>
  )
}
