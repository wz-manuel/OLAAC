import type { Metadata } from 'next'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Cobertura geográfica — Admin OLAAC' }

function flagEmoji(iso: string) {
  return [...iso.toUpperCase()].map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('')
}

const CATEGORIA_LABEL: Record<string, string> = {
  gobierno:       'Gobierno',
  educacion:      'Educación',
  privado:        'Sector privado',
  salud:          'Salud',
  sociedad_civil: 'Sociedad civil',
}

export default async function AdminCoberturaPage() {
  const supabase = await createClient()

  const [resumenResult, detalleResult] = await Promise.all([
    supabase.from('v_cobertura_resumen').select('*'),
    supabase
      .from('v_cobertura_pais')
      .select('*')
      .order('pais')
      .order('categoria'),
  ])

  const paises  = resumenResult.data ?? []
  const detalle = detalleResult.data ?? []

  const totalAuditados = paises.reduce((s, p) => s + (p.auditados_total ?? 0), 0)
  const totalMeta      = paises.reduce((s, p) => s + (p.meta_total ?? 0), 0)
  const pctGlobal      = totalMeta > 0 ? Math.min(100, Math.round((totalAuditados / totalMeta) * 100)) : 0
  const paisesCompletos = paises.filter(p => (p.porcentaje_global ?? 0) >= 100).length

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Cobertura geográfica</h2>
          <p className="mt-1 text-sm text-gray-500">
            Representatividad del observatorio por país y sector. Umbrales definidos en migración 013.
          </p>
        </div>
        <Link
          href="/cobertura"
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

      {/* Stats rápidas */}
      <dl className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Países rastreados',  value: paises.length },
          { label: 'Sitios auditados',   value: totalAuditados },
          { label: 'Meta total',         value: totalMeta },
          { label: 'Cobertura global',   value: `${pctGlobal}%` },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {/* Resumen por país */}
      <section aria-labelledby="resumen-heading" className="mb-8">
        <h3 id="resumen-heading" className="mb-3 text-base font-semibold text-gray-900">
          Resumen por país ({paisesCompletos} de {paises.length} completos)
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">País</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Auditados</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Meta</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">%</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">Sectores</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paises.map(p => {
                const pct = p.porcentaje_global ?? 0
                return (
                  <tr key={p.pais ?? ''} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      <span className="mr-1.5" role="img" aria-hidden="true">{flagEmoji(p.iso_code ?? '')}</span>
                      {p.pais}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{p.auditados_total ?? 0}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.meta_total ?? 0}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${pct >= 100 ? 'text-green-700' : pct >= 50 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {pct}%
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {p.categorias_completas ?? 0}/{p.categorias_total ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {pct >= 100
                        ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Completa</span>
                        : pct >= 50
                          ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">En progreso</span>
                          : pct > 0
                            ? <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Iniciando</span>
                            : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Sin datos</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detalle por país + sector */}
      <section aria-labelledby="detalle-heading">
        <h3 id="detalle-heading" className="mb-3 text-base font-semibold text-gray-900">
          Detalle por sector ({detalle.length} configuraciones)
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">País</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Sector</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Auditados</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Umbral</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">%</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detalle.map((row, i) => {
                const aud  = row.sitios_auditados ?? 0
                const meta = row.umbral_minimo ?? 0
                const pct  = row.porcentaje ?? 0
                return (
                  <tr key={`${row.pais}-${row.categoria}-${i}`} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-gray-900">
                      <span className="mr-1.5" role="img" aria-hidden="true">{flagEmoji(row.iso_code ?? '')}</span>
                      {row.pais}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{CATEGORIA_LABEL[row.categoria ?? ''] ?? row.categoria}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{aud}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{meta}</td>
                    <td className={`px-4 py-2.5 text-right font-medium ${row.cumple_umbral ? 'text-green-700' : aud > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {pct}%
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {row.cumple_umbral
                        ? <span aria-label="Umbral alcanzado" className="text-green-600">✓</span>
                        : <span aria-label="Umbral no alcanzado" className="text-gray-300">○</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Los umbrales se actualizan editando la tabla <code className="rounded bg-gray-100 px-1">cobertura_config</code> directamente en Supabase o aplicando una nueva migración.
        </p>
      </section>
    </div>
  )
}
