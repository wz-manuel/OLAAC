import { Button, ScoreBadge } from '@olaac/ui'
import Link from 'next/link'

import { KpiCards } from '@/components/scores/kpi-cards'
import { LegalBadge } from '@/components/scores/legal-badge'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/types'

export const metadata = { title: 'Scores de accesibilidad' }

// Revalida cada hora — datos públicos actualizados semanalmente por el cron
export const revalidate = 3600

type LighthouseMetricRow = Pick<
  Tables<'lighthouse_metrics'>,
  'id' | 'alias' | 'url' | 'nombre_sitio' | 'pais' | 'categoria' | 'subcategoria' | 'accessibility_score' | 'measured_at'
>

type LegislacionRow = Pick<
  Tables<'legislacion_pais'>,
  'pais' | 'iso_code' | 'ley_nombre' | 'nivel_sancion' | 'obliga_sector'
>

export default async function ScoresDashboardPage() {
  const supabase = await createClient()

  // Lectura pública — RLS permite select a todos (scores_select_all policy)
  const [{ data, error }, { data: leyes }] = await Promise.all([
    supabase
      .from('lighthouse_metrics')
      .select('id, alias, url, nombre_sitio, pais, categoria, subcategoria, accessibility_score, measured_at')
      .order('measured_at', { ascending: false })
      .limit(100),
    supabase
      .from('legislacion_pais')
      .select('pais, iso_code, ley_nombre, nivel_sancion, obliga_sector')
      .eq('vigente', true),
  ])

  // Índice por país para lookup O(1) en la tabla
  const legislacionByPais = new Map<string, LegislacionRow>()
  for (const ley of (leyes ?? []) as LegislacionRow[]) {
    legislacionByPais.set(ley.pais, ley)
  }

  const rows = (data ?? []) as unknown as LighthouseMetricRow[]

  // ── KPIs ────────────────────────────────────────────────────────────────
  const scored = rows.filter((r) => r.accessibility_score !== null)
  const avgA11y = scored.length
    ? scored.reduce((sum, r) => sum + (r.accessibility_score ?? 0), 0) / scored.length
    : null

  const totalSites    = new Set(rows.map((r) => r.alias)).size
  const lastMeasuredAt = rows[0]?.measured_at ?? null

  // Alertas críticas: score < 50 en el registro más reciente por alias
  const latestByAlias = new Map<string, LighthouseMetricRow>()
  for (const row of rows) {
    if (!latestByAlias.has(row.alias)) latestByAlias.set(row.alias, row)
  }
  const criticalCount = [...latestByAlias.values()].filter(
    (r) => (r.accessibility_score ?? 100) < 50
  ).length

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Scores de accesibilidad</h1>
          <p className="mt-1 text-sm text-gray-500">
            Resultados públicos de auditorías Lighthouse realizadas por OLAAC.
            Actualizados cada domingo.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/scores/solicitar-url">Solicitar auditoría de URL</Link>
        </Button>
      </div>

      {/* Error de carga */}
      {error && (
        <p role="alert" className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No fue posible cargar los scores. Por favor intenta más tarde.
        </p>
      )}

      {/* KPI cards */}
      <KpiCards
        avgA11y={avgA11y !== null && !isNaN(avgA11y) ? avgA11y : null}
        totalSites={totalSites}
        lastMeasuredAt={lastMeasuredAt}
        criticalCount={criticalCount}
      />

      {/* Tabla de sitios */}
      <section aria-label="Listado de sitios auditados" className="mt-8">
        <h2 className="mb-3 text-base font-medium text-gray-700">
          Sitios monitoreados{' '}
          {rows.length > 0 && (
            <span className="font-normal text-gray-500">({rows.length})</span>
          )}
        </h2>

        {!rows.length ? (
          <p className="py-12 text-center text-sm text-gray-500" role="status">
            No hay auditorías registradas aún.{' '}
            <Link href="/scores/solicitar-url" className="text-[#005fcc] underline">
              ¿Quieres solicitar la primera?
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table
              className="min-w-full divide-y divide-gray-200 text-sm"
              aria-label="Tabla de scores de accesibilidad por sitio"
            >
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Sitio
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden sm:table-cell">
                    País
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden xl:table-cell">
                    Marco legal
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">
                    Categoría
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                    Accesibilidad
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden lg:table-cell">
                    Medido
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[14rem]" title={row.nombre_sitio}>
                        {row.nombre_sitio}
                      </p>
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 block font-mono text-xs text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded truncate max-w-[14rem]"
                        title={row.url}
                      >
                        {row.url}
                        <span className="sr-only"> (abre en nueva pestaña)</span>
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                      {row.pais}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {(() => {
                        const ley = legislacionByPais.get(row.pais)
                        return ley ? (
                          <LegalBadge legislacion={ley} compact />
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                      <span>{row.categoria}</span>
                      {row.subcategoria && (
                        <span className="ml-1 text-xs text-gray-500">· {row.subcategoria}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.accessibility_score !== null ? (
                        <ScoreBadge score={row.accessibility_score} size="sm" showLabel={false} />
                      ) : (
                        <span className="text-gray-300" aria-label="Sin dato">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                      <time dateTime={row.measured_at}>
                        {new Date(row.measured_at).toLocaleDateString('es-MX')}
                      </time>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/scores/${row.alias}`}
                        className="text-xs text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
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

      {/* Enlace a cobertura geográfica */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
        <span className="font-medium text-gray-900">¿Qué tan representativos son estos datos? </span>
        Consulta los{' '}
        <Link
          href="/cobertura"
          className="font-medium text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          criterios de cobertura geográfica
        </Link>
        {' '}para ver cuántos sitios auditamos por país y sector.
      </div>
    </div>
  )
}
