import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { fetchReportData, scoreColor, scoreLabel, formatDateLong } from '@/lib/reports/data'

interface Props { params: { pais: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pais = decodeURIComponent(params.pais)
  return {
    title: `Informe de Accesibilidad — ${pais} | OLAAC`,
    description: `Estado de la accesibilidad web en ${pais}: ranking de sitios gubernamentales y universitarios auditados por OLAAC.`,
  }
}

export const revalidate = 3600

export default async function ReportePaisPage({ params }: Props) {
  const pais = decodeURIComponent(params.pais)
  const data = await fetchReportData(pais)

  if (data.sites.length === 0) notFound()

  const { stats, sites } = data
  const year = new Date().getFullYear()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

      {/* Breadcrumb */}
      <nav aria-label="Miga de pan">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href="/reportes" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">Reportes</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/reportes/regional" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">Regional LATAM</Link></li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-700" aria-current="page">{pais}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mt-4 mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#252858]">
            {pais}
            <span className="block text-lg font-normal text-gray-500">Informe de accesibilidad web · {year}</span>
          </h1>
          {stats.last_audit && (
            <p className="mt-1 text-xs text-gray-400">
              Datos al <time dateTime={stats.last_audit}>{formatDateLong(stats.last_audit)}</time>
            </p>
          )}
        </div>
        <a
          href={`/reportes/paises/${encodeURIComponent(pais)}/pdf`}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#252858] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#2d3476] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 transition-colors"
          aria-label={`Descargar informe de ${pais} como PDF`}
        >
          <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
          </svg>
          Descargar PDF
        </a>
      </header>

      {/* KPIs */}
      <section aria-label="Estadísticas clave" className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { value: stats.avg_score !== null ? `${stats.avg_score}` : 'N/D', label: 'Score promedio', sub: '/100' },
          { value: String(stats.total_sitios), label: 'Sitios auditados', sub: '' },
          { value: String(stats.countries_count), label: 'Categorías', sub: '' },
          { value: String(stats.critical_sites), label: 'Sitios críticos', sub: ' (< 50)', danger: stats.critical_sites > 0 },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-[#252858]">
              {kpi.value}
              <span className="text-sm font-normal text-gray-400">{kpi.sub}</span>
            </p>
            <p className={`mt-0.5 text-xs ${kpi.danger ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{kpi.label}</p>
          </div>
        ))}
      </section>

      {/* Ranking de sitios */}
      <section aria-labelledby="sites-heading" className="mb-8">
        <h2 id="sites-heading" className="mb-4 text-base font-semibold text-gray-900">
          Sitios auditados en {pais}
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-[#252858] text-white">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium">#</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium">Sitio</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium hidden sm:table-cell">Categoría</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium">Score</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium hidden md:table-cell">Calificación</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium hidden lg:table-cell">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sites.map((site, i) => (
                <tr key={site.alias} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/scores/${site.alias}`} className="font-medium text-gray-900 hover:text-[#005fcc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
                      {site.nombre_sitio}
                    </Link>
                    <p className="text-xs text-gray-400 font-mono">{site.url}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell">
                    {site.categoria}{site.subcategoria ? ` · ${site.subcategoria}` : ''}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: scoreColor(site.accessibility_score) }}
                    >
                      {site.accessibility_score !== null ? Math.round(site.accessibility_score) : 'N/D'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs hidden md:table-cell" style={{ color: scoreColor(site.accessibility_score) }}>
                    {scoreLabel(site.accessibility_score)}
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs text-gray-500 hidden lg:table-cell">
                    {site.issues.critical > 0 && (
                      <span className="text-red-600 font-medium">{site.issues.critical}C</span>
                    )}
                    {site.issues.critical > 0 && site.issues.serious > 0 && ' · '}
                    {site.issues.serious > 0 && (
                      <span className="text-orange-600">{site.issues.serious}G</span>
                    )}
                    {site.issues.critical === 0 && site.issues.serious === 0 && '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nav entre países */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
        <Link href="/reportes/regional" className="text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
          ← Ver informe regional LATAM
        </Link>
        <a
          href={`/reportes/paises/${encodeURIComponent(pais)}/pdf`}
          className="text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          Descargar PDF →
        </a>
      </div>
    </div>
  )
}
