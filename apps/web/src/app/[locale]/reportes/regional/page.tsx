import type { Metadata } from 'next'
import Link from 'next/link'

import { fetchReportData, scoreColor, scoreLabel, formatDateLong } from '@/lib/reports/data'

export const metadata: Metadata = {
  title: 'Informe Regional LATAM — Accesibilidad Digital | OLAAC',
  description: 'Informe de accesibilidad web de América Latina: rankings por país y sitio, scores Lighthouse y violaciones WCAG detectadas.',
}

export const revalidate = 3600

export default async function ReporteRegionalPage() {
  const data = await fetchReportData()
  const { stats, countries, sites } = data
  const year = new Date().getFullYear()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

      {/* Breadcrumb */}
      <nav aria-label="Miga de pan">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li><Link href="/reportes" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">Reportes</Link></li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-700" aria-current="page">Regional LATAM {year}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mt-4 mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#252858]">
            Informe de Accesibilidad Digital
            <span className="block text-lg font-normal text-gray-500">América Latina · {year}</span>
          </h1>
          {stats.last_audit && (
            <p className="mt-1 text-xs text-gray-500">
              Datos al{' '}
              <time dateTime={stats.last_audit}>{formatDateLong(stats.last_audit)}</time>
            </p>
          )}
        </div>
        <a
          href="/reportes/regional/pdf"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#252858] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#2d3476] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 transition-colors"
          aria-label="Descargar informe regional como PDF"
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
          { value: String(stats.countries_count), label: 'Países', sub: ' de LATAM' },
          { value: String(stats.critical_sites), label: 'Sitios críticos', sub: ' (< 50)', danger: stats.critical_sites > 0 },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-[#252858]">
              {kpi.value}
              <span className="text-sm font-normal text-gray-500">{kpi.sub}</span>
            </p>
            <p className={`mt-0.5 text-xs ${kpi.danger ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{kpi.label}</p>
          </div>
        ))}
      </section>

      {/* Ranking por país */}
      <section aria-labelledby="countries-heading" className="mb-8">
        <h2 id="countries-heading" className="mb-4 text-base font-semibold text-gray-900">Ranking por país</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-[#252858] text-white">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium">País</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium">Sitios</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium">Score prom.</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium hidden sm:table-cell">Calificación</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium">Críticos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {countries.map((c, i) => (
                <tr key={c.pais} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link href={`/reportes/paises/${encodeURIComponent(c.pais)}`} className="hover:text-[#005fcc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
                      {c.pais}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{c.total_sitios}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: scoreColor(c.avg_score) }}
                    >
                      {c.avg_score ?? 'N/D'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs hidden sm:table-cell" style={{ color: scoreColor(c.avg_score) }}>
                    {scoreLabel(c.avg_score)}
                  </td>
                  <td className={`px-4 py-3 text-center text-xs font-medium ${c.criticos > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {c.criticos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top 10 sitios */}
      <section aria-labelledby="sites-heading" className="mb-8">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="sites-heading" className="text-base font-semibold text-gray-900">
            Ranking de sitios ({sites.length} auditados)
          </h2>
          <Link href="/scores" className="text-xs text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
            Ver todos →
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium">#</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium">Sitio</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium hidden sm:table-cell">País</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sites.slice(0, 20).map((site, i) => (
                <tr key={site.alias} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/scores/${site.alias}`} className="font-medium text-gray-900 hover:text-[#005fcc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
                      {site.nombre_sitio}
                    </Link>
                    <p className="text-xs text-gray-500">{site.categoria}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell">{site.pais}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: scoreColor(site.accessibility_score) }}
                    >
                      {site.accessibility_score !== null ? Math.round(site.accessibility_score) : 'N/D'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sites.length > 20 && (
            <div className="border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-500">
              {sites.length - 20} sitios más incluidos en el PDF completo.
            </div>
          )}
        </div>
      </section>

      {/* CTA descarga */}
      <div className="rounded-xl border border-[#252858]/20 bg-[#f0f4ff] p-6 text-center">
        <p className="mb-3 font-semibold text-[#252858]">Descarga el informe completo en PDF</p>
        <p className="mb-4 text-sm text-gray-600">Incluye todos los sitios, ranking por país, escala de scores y notas metodológicas.</p>
        <a
          href="/reportes/regional/pdf"
          className="inline-flex items-center gap-2 rounded-lg bg-[#252858] px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#2d3476] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 transition-colors"
        >
          Descargar PDF · LATAM {year}
        </a>
      </div>
    </div>
  )
}
