import type { Metadata } from 'next'
import Link from 'next/link'

import { CreateTicketForm } from '@/components/tickets/create-ticket-form'
import { getPageBySlug, excerptFromMarkdown } from '@/lib/content'

const page = getPageBySlug('informaralobservatorio')

export const metadata: Metadata = {
  title: page?.titulo ?? 'Informar al observatorio',
  description: page
    ? excerptFromMarkdown(page.contenido_markdown)
    : 'Reporta sitios web, aplicaciones o lugares con problemas de accesibilidad.',
  openGraph: {
    title: page?.titulo ?? 'Informar al observatorio',
    description: page ? excerptFromMarkdown(page.contenido_markdown) : undefined,
  },
}

export default function InformarPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/proyectos" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              Proyectos
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900" aria-current="page">Informar al observatorio</li>
        </ol>
      </nav>

      {/* Encabezado */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Informar al observatorio</h1>
        <p className="mt-3 text-gray-600 leading-7">
          ¿Encuentras sitios web, aplicaciones o espacios físicos con barreras de accesibilidad?
          Reporta el problema y el observatorio realizará seguimiento para promover cambios.
        </p>
      </div>

      {/* Contexto — qué se puede reportar */}
      <div className="mb-10 rounded-lg border border-blue-100 bg-blue-50 px-5 py-4" role="note" aria-label="Información sobre qué reportar">
        <h2 className="text-sm font-semibold text-blue-900">¿Qué puedes reportar?</h2>
        <ul className="mt-2 space-y-1 text-sm text-blue-800 list-disc pl-4">
          <li>Sitios oficiales de gobierno con barreras de accesibilidad</li>
          <li>Servicios médicos, bancarios o de pagos inaccesibles</li>
          <li>Aplicaciones educativas o de participación social</li>
          <li>Espacios físicos sin condiciones de accesibilidad universal</li>
        </ul>
        <p className="mt-3 text-sm text-blue-700">
          El único requisito es que el sitio, aplicación o lugar esté disponible para usuarios en Latinoamérica.
        </p>
      </div>

      {/* Formulario */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Nuevo reporte</h2>
        <CreateTicketForm />
      </div>

      {/* Política de datos */}
      <p className="mt-6 text-xs text-gray-500 text-center">
        Al enviar aceptas nuestra{' '}
        <Link
          href="/politica-privacidad"
          className="underline hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          política de privacidad
        </Link>.
        Los reportes son revisados por el equipo del observatorio.
      </p>
    </div>
  )
}
