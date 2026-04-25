import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchReportData, scoreColor } from '@/lib/reports/data'

export const metadata: Metadata = {
  title: 'Reportes institucionales — Accesibilidad digital | OLAAC',
  description:
    'Informes descargables en PDF sobre el estado de la accesibilidad web en América Latina: regional, por país y por sector.',
}

export const revalidate = 3600

export default async function ReportesPage() {
  const data = await fetchReportData()
  const { countries, stats } = data
  const year = new Date().getFullYear()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

      {/* Header */}
      <header className="mb-8">
        <div className="mb-2 inline-flex items-center rounded-full bg-[#252858]/10 px-3 py-1 text-xs font-medium text-[#252858]">
          Datos abiertos · CC BY 4.0
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes institucionales</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-2xl">
          Informes descargables en PDF sobre el estado de la accesibilidad web
          en sitios públicos de América Latina. Actualizados cada semana. Libres para usar,
          citar y distribuir.
        </p>
      </header>

      {/* Reporte regional */}
      <section aria-labelledby="regional-heading" className="mb-8">
        <h2 id="regional-heading" className="mb-4 text-base font-semibold text-gray-900">
          Informe regional
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                América Latina · {year}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {stats.total_sitios} sitios · {stats.countries_count} países · score promedio{' '}
                <strong style={{ color: scoreColor(stats.avg_score) }}>
                  {stats.avg_score ?? 'N/D'}/100
                </strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/reportes/regional"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] transition-colors"
              >
                Ver informe
              </Link>
              <a
                href="/reportes/regional/pdf"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#252858] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d3476] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 transition-colors"
              >
                <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                PDF
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Reportes por país */}
      <section aria-labelledby="countries-heading">
        <h2 id="countries-heading" className="mb-4 text-base font-semibold text-gray-900">
          Informes por país
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {countries.map((c) => (
            <div
              key={c.pais}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-gray-900">{c.pais}</p>
                <p className="text-xs text-gray-500">
                  {c.total_sitios} sitios ·{' '}
                  <span style={{ color: scoreColor(c.avg_score) }}>
                    {c.avg_score ?? 'N/D'}/100
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/reportes/paises/${encodeURIComponent(c.pais)}`}
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] transition-colors"
                >
                  Ver
                </Link>
                <a
                  href={`/reportes/paises/${encodeURIComponent(c.pais)}/pdf`}
                  className="inline-flex items-center gap-1 rounded-md bg-[#252858] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2d3476] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-1 transition-colors"
                  aria-label={`Descargar informe de ${c.pais} en PDF`}
                >
                  <svg className="h-3 w-3" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                  </svg>
                  PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nota de uso */}
      <aside className="mt-8 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        Todos los informes están disponibles bajo licencia{' '}
        <strong>CC BY 4.0</strong>. También puedes acceder a los datos crudos en{' '}
        <Link href="/datos-abiertos" className="text-[#005fcc] underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
          la API pública
        </Link>.
      </aside>
    </div>
  )
}
