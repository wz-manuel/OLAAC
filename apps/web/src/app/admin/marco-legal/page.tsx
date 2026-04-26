import type { Metadata } from 'next'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Marco legal — Admin OLAAC' }

type LegislacionRow = Tables<'legislacion_pais'>

const SANCION_STYLES: Record<string, string> = {
  alto:    'bg-red-100 text-red-800 border border-red-200',
  medio:   'bg-amber-100 text-amber-800 border border-amber-200',
  bajo:    'bg-blue-100 text-blue-800 border border-blue-200',
  ninguno: 'bg-gray-100 text-gray-600 border border-gray-200',
}

const SANCION_LABEL: Record<string, string> = {
  alto: 'Alta', medio: 'Media', bajo: 'Baja', ninguno: 'Ninguna',
}

function getFlagEmoji(isoCode: string): string {
  const codePoints = [...isoCode.toUpperCase()].map(
    (c) => 0x1f1e6 + c.charCodeAt(0) - 65,
  )
  return String.fromCodePoint(...codePoints)
}

export default async function AdminMarcoLegalPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('legislacion_pais')
    .select('*')
    .order('nivel_sancion', { ascending: false })
    .order('pais', { ascending: true })

  const leyes = (data ?? []) as LegislacionRow[]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Marco legal por país</h2>
          <p className="mt-1 text-sm text-gray-500">
            Legislación de accesibilidad digital vigente en América Latina.{' '}
            {leyes.length} {leyes.length === 1 ? 'país registrado' : 'países registrados'}.
          </p>
        </div>
        <Link
          href="/marco-legal"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
          </svg>
          Ver página pública
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error al cargar datos: {error.message}
        </p>
      )}

      {/* Tabla de legislación */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table
          className="min-w-full divide-y divide-gray-200 text-sm"
          aria-label="Marco legal de accesibilidad por país"
        >
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                País
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Ley / Norma
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">
                Sectores obligados
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                Sanción
              </th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden lg:table-cell">
                Actualizado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leyes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                  No hay legislación registrada.
                </td>
              </tr>
            ) : (
              leyes.map((ley) => (
                <tr key={ley.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">{getFlagEmoji(ley.iso_code)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{ley.pais}</p>
                        <p className="text-xs font-mono text-gray-400">{ley.iso_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{ley.ley_nombre}</p>
                    <p className="mt-0.5 max-w-xs text-xs text-gray-500 line-clamp-2">{ley.ley_descripcion}</p>
                    {ley.url_referencia && (
                      <a
                        href={ley.url_referencia}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                      >
                        Ver texto oficial ↗
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {ley.obliga_sector.map((s) => (
                        <span
                          key={s}
                          className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 capitalize"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        SANCION_STYLES[ley.nivel_sancion] ?? SANCION_STYLES.ninguno
                      }`}
                    >
                      {SANCION_LABEL[ley.nivel_sancion] ?? ley.nivel_sancion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {ley.vigente ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
                        Vigente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" aria-hidden="true" />
                        Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                    <time dateTime={ley.updated_at}>
                      {new Date(ley.updated_at).toLocaleDateString('es-MX')}
                    </time>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Nota sobre edición */}
      <p className="mt-4 text-xs text-gray-500">
        Para agregar o modificar legislación, usa directamente el editor de Supabase o contacta al
        equipo técnico. La tabla <code className="rounded bg-gray-100 px-1 font-mono">legislacion_pais</code>{' '}
        admite insert/update vía RLS de administradores autenticados.
      </p>
    </div>
  )
}
