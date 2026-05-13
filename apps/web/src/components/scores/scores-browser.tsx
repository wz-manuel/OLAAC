'use client'

import { ScoreBadge } from '@olaac/ui'
import Link from 'next/link'
import { useState } from 'react'

import { LegalBadge } from '@/components/scores/legal-badge'
import type { Tables } from '@/lib/supabase/types'

type LighthouseMetricRow = Pick<
  Tables<'lighthouse_metrics'>,
  'id' | 'alias' | 'url' | 'nombre_sitio' | 'pais' | 'categoria' | 'subcategoria' | 'accessibility_score' | 'measured_at'
>

type LegislacionRow = Pick<
  Tables<'legislacion_pais'>,
  'pais' | 'iso_code' | 'ley_nombre' | 'nivel_sancion' | 'obliga_sector'
>

interface Props {
  rows: LighthouseMetricRow[]
  legislacion: LegislacionRow[]
}

export function ScoresBrowser({ rows, legislacion }: Props) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const legislacionByPais = new Map<string, LegislacionRow>()
  for (const ley of legislacion) {
    legislacionByPais.set(ley.pais, ley)
  }

  const countByCountry = new Map<string, number>()
  for (const row of rows) {
    countByCountry.set(row.pais, (countByCountry.get(row.pais) ?? 0) + 1)
  }
  const countries = [...countByCountry.keys()].sort((a, b) =>
    a.localeCompare(b, 'es')
  )

  const filtered = selectedCountry
    ? rows.filter((r) => r.pais === selectedCountry)
    : rows

  return (
    <section aria-label="Listado de sitios auditados" className="mt-8">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-medium text-gray-700">
          Sitios monitoreados{' '}
          <span className="font-normal text-gray-500">
            {selectedCountry
              ? `(${filtered.length} de ${rows.length})`
              : `(${rows.length})`}
          </span>
        </h2>

        {selectedCountry && (
          <button
            onClick={() => setSelectedCountry(null)}
            className="self-start text-xs text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded sm:self-auto"
          >
            ← Ver todos los países
          </button>
        )}
      </div>

      {/* Filtro por país */}
      <div
        role="group"
        aria-label="Filtrar por país"
        className="mb-4 flex flex-wrap gap-2"
      >
        <button
          onClick={() => setSelectedCountry(null)}
          aria-pressed={selectedCountry === null}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] ${
            selectedCountry === null
              ? 'bg-[#005fcc] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>

        {countries.map((country) => (
          <button
            key={country}
            onClick={() =>
              setSelectedCountry((prev) => (prev === country ? null : country))
            }
            aria-pressed={selectedCountry === country}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] ${
              selectedCountry === country
                ? 'bg-[#005fcc] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {country}
            <span className="ml-1 tabular-nums opacity-70">
              ({countByCountry.get(country)})
            </span>
          </button>
        ))}
      </div>

      {/* Tabla */}
      {!filtered.length ? (
        <p className="py-12 text-center text-sm text-gray-500" role="status">
          No hay auditorías registradas para {selectedCountry}.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table
            className="min-w-full divide-y divide-gray-200 text-sm"
            aria-label={
              selectedCountry
                ? `Sitios auditados en ${selectedCountry}`
                : 'Tabla de scores de accesibilidad por sitio'
            }
          >
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  Sitio
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:table-cell"
                >
                  País
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 xl:table-cell"
                >
                  Marco legal
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 md:table-cell"
                >
                  Categoría
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  Accesibilidad
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 lg:table-cell"
                >
                  Medido
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p
                      className="max-w-[14rem] truncate font-medium text-gray-900"
                      title={row.nombre_sitio}
                    >
                      {row.nombre_sitio}
                    </p>
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 block max-w-[14rem] truncate font-mono text-xs text-[#005fcc] hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
                      title={row.url}
                    >
                      {row.url}
                      <span className="sr-only"> (abre en nueva pestaña)</span>
                    </a>
                  </td>

                  <td className="hidden px-4 py-3 text-sm text-gray-600 sm:table-cell">
                    {row.pais}
                  </td>

                  <td className="hidden px-4 py-3 xl:table-cell">
                    {(() => {
                      const ley = legislacionByPais.get(row.pais)
                      return ley ? (
                        <LegalBadge legislacion={ley} compact />
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )
                    })()}
                  </td>

                  <td className="hidden px-4 py-3 text-sm text-gray-600 md:table-cell">
                    <span>{row.categoria}</span>
                    {row.subcategoria && (
                      <span className="ml-1 text-xs text-gray-500">
                        · {row.subcategoria}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {row.accessibility_score !== null ? (
                      <ScoreBadge
                        score={row.accessibility_score}
                        size="sm"
                        showLabel={false}
                      />
                    ) : (
                      <span className="text-gray-300" aria-label="Sin dato">
                        —
                      </span>
                    )}
                  </td>

                  <td className="hidden px-4 py-3 text-xs text-gray-500 lg:table-cell">
                    <time dateTime={row.measured_at}>
                      {new Date(row.measured_at).toLocaleDateString('es-MX')}
                    </time>
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/scores/${row.alias}`}
                      className="text-xs text-[#005fcc] hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
                      aria-label={`Ver detalle de ${row.nombre_sitio}`}
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
