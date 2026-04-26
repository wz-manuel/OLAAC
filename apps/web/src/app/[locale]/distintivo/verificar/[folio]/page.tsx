import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DistintivoBadge } from '@/components/distintivo/distintivo-badge'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ folio: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { folio } = await params
  return {
    title: `Verificación de Distintivo ${folio} — OLAAC`,
    description: 'Verifica la autenticidad del Distintivo de Accesibilidad OLAAC.',
  }
}

export default async function VerificarDistintivoPage({ params }: Props) {
  const { folio } = await params
  const supabase = await createClient()

  const { data: distintivo } = await supabase
    .from('distintivos_emitidos')
    .select(`
      folio,
      nivel,
      fecha_emision,
      fecha_vencimiento,
      vigente,
      motivo_revocacion,
      organizaciones_distintivo (
        nombre_organizacion,
        sitio_web,
        tipo,
        pais
      )
    `)
    .eq('folio', folio)
    .maybeSingle()

  if (!distintivo) notFound()

  const org = distintivo.organizaciones_distintivo as {
    nombre_organizacion: string
    sitio_web: string
    tipo: string
    pais: string
  } | null

  const isVigente = distintivo.vigente &&
    new Date(distintivo.fecha_vencimiento) > new Date()

  const TIPO_LABEL: Record<string, string> = {
    publica: 'Pública', privada: 'Privada', mixta: 'Mixta', ong: 'OSC / ONG',
  }

  const NIVEL_LABEL: Record<string, string> = {
    oro: 'Oro', platino: 'Platino', diamante: 'Diamante',
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {/* Estado de verificación */}
      <div
        className={[
          'mb-8 rounded-xl border p-6 text-center',
          isVigente
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50',
        ].join(' ')}
        role="status"
        aria-live="polite"
      >
        <span className="text-4xl" aria-hidden="true">
          {isVigente ? '✓' : '✗'}
        </span>
        <p className={`mt-2 text-lg font-bold ${isVigente ? 'text-green-800' : 'text-red-800'}`}>
          {isVigente ? 'Distintivo válido y vigente' : 'Distintivo no vigente'}
        </p>
        {!isVigente && distintivo.motivo_revocacion && (
          <p className="mt-1 text-sm text-red-600">{distintivo.motivo_revocacion}</p>
        )}
      </div>

      {/* Datos del distintivo */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col items-center gap-6 border-b border-gray-100 p-8 sm:flex-row sm:items-start">
          <DistintivoBadge
            nivel={distintivo.nivel as 'oro' | 'platino' | 'diamante'}
            size="xl"
          />
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              {org?.nombre_organizacion ?? 'Organización'}
            </h1>
            <p className="text-base text-gray-600">
              Distintivo de Accesibilidad OLAAC — Nivel{' '}
              <strong>{NIVEL_LABEL[distintivo.nivel] ?? distintivo.nivel}</strong>
            </p>
            {org && (
              <p className="text-sm text-gray-500">
                {TIPO_LABEL[org.tipo] ?? org.tipo} · {org.pais}
              </p>
            )}
            {org?.sitio_web && (
              <a
                href={org.sitio_web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#005fcc] hover:underline"
              >
                {org.sitio_web}
              </a>
            )}
          </div>
        </div>

        <dl className="divide-y divide-gray-100 p-6">
          <div className="flex justify-between py-3 text-sm">
            <dt className="text-gray-500">Folio de verificación</dt>
            <dd className="font-mono font-medium text-gray-900">{distintivo.folio}</dd>
          </div>
          <div className="flex justify-between py-3 text-sm">
            <dt className="text-gray-500">Fecha de emisión</dt>
            <dd className="text-gray-900">
              {new Date(distintivo.fecha_emision).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </dd>
          </div>
          <div className="flex justify-between py-3 text-sm">
            <dt className="text-gray-500">Vigente hasta</dt>
            <dd className={isVigente ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
              {new Date(distintivo.fecha_vencimiento).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </dd>
          </div>
          <div className="flex justify-between py-3 text-sm">
            <dt className="text-gray-500">Emisor</dt>
            <dd className="text-gray-900">Observatorio Latinoamericano de Accesibilidad (OLAAC)</dd>
          </div>
        </dl>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        Este distintivo fue emitido por{' '}
        <Link href="/" className="underline hover:text-gray-700">
          OLAAC
        </Link>{' '}
        tras un proceso de evaluación independiente de accesibilidad digital.
      </p>
    </div>
  )
}
