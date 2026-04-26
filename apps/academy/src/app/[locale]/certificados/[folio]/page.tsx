/**
 * Página pública de verificación de certificados.
 * Accesible sin autenticación — cualquiera puede validar un folio.
 * URL: /certificados/CERT-2026-INTACC-A3F8B2C1
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

interface Props {
  params: { folio: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title:       `Verificar certificado ${params.folio}`,
    description: 'Verificación de autenticidad de certificado emitido por la Academia OLAAC.',
    robots:      { index: false }, // no indexar páginas de verificación individuales
  }
}

export default async function CertificateVerifyPage({ params }: Props) {
  const supabase = await createClient()

  const { data: cert } = await supabase
    .from('certificates')
    .select('folio, student_name, course_title, issued_at')
    .eq('folio', params.folio)
    .single()

  if (!cert) notFound()

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div
        className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center"
        role="main"
        aria-labelledby="cert-heading"
      >
        {/* Ícono de verificado */}
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
          aria-hidden="true"
        >
          <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        </div>

        <h1 id="cert-heading" className="text-xl font-bold text-green-800">
          Certificado válido
        </h1>

        <p className="mt-2 text-sm text-green-700">
          Este certificado fue emitido por la Academia OLAAC y es auténtico.
        </p>

        <dl className="mt-6 space-y-3 text-left">
          <div className="rounded-lg bg-white px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Estudiante</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">{cert.student_name}</dd>
          </div>
          <div className="rounded-lg bg-white px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Curso completado</dt>
            <dd className="mt-1 text-base font-semibold text-gray-900">{cert.course_title}</dd>
          </div>
          <div className="rounded-lg bg-white px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Folio</dt>
            <dd className="mt-1 font-mono text-sm font-semibold text-gray-900">{cert.folio}</dd>
          </div>
          <div className="rounded-lg bg-white px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Fecha de emisión</dt>
            <dd className="mt-1 text-sm text-gray-700">
              <time dateTime={cert.issued_at}>{issuedDate}</time>
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-xs text-gray-400">
          Emitido por OLAAC — Observatorio Latinoamericano de Accesibilidad
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/cursos"
          className="text-sm text-[#005fcc] underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          ← Volver a la Academia OLAAC
        </Link>
      </div>
    </div>
  )
}
