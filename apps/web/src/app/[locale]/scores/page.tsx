import { Button } from '@olaac/ui'
import Link from 'next/link'

import { KpiCards } from '@/components/scores/kpi-cards'
import { ScoresBrowser } from '@/components/scores/scores-browser'
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

  const rows = (data ?? []) as unknown as LighthouseMetricRow[]
  const legislacion = (leyes ?? []) as LegislacionRow[]

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
            Resultados públicos de pruebas automáticas de accesibilidad realizadas por OLAAC.
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

      {/* Aviso de alcance */}
      <aside
        aria-label="Alcance de las pruebas automáticas"
        className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900"
      >
        <strong className="font-semibold">Estas pruebas no constituyen una auditoría exhaustiva.</strong>{' '}
        Cada medición analiza únicamente la página de inicio mediante criterios automatizables, lo que detecta
        aproximadamente el 30–40 % de los problemas reales de accesibilidad. Una auditoría completa
        incluye la evaluación manual de tareas y flujos sobre una muestra representativa del sitio,
        no solo de la portada.{' '}
        <Link
          href="/scores/solicitar-url"
          className="font-medium underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          Solicitar auditoría completa
        </Link>
        .
      </aside>

      {/* Tabla de sitios con filtro por país */}
      {!rows.length ? (
        <section aria-label="Listado de sitios auditados" className="mt-8">
          <p className="py-12 text-center text-sm text-gray-500" role="status">
            No hay auditorías registradas aún.{' '}
            <Link href="/scores/solicitar-url" className="text-[#005fcc] underline">
              ¿Quieres solicitar la primera?
            </Link>
          </p>
        </section>
      ) : (
        <ScoresBrowser rows={rows} legislacion={legislacion} />
      )}

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
