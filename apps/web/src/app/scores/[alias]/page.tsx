import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ScoreBadge, getScoreLabel } from '@olaac/ui'
import { createClient } from '@/lib/supabase/server'
import { CriticalIssuesAccordion, type CriticalIssue } from '@/components/scores/critical-issues-accordion'
import { ScoreTrendChart } from '@/components/scores/score-trend-chart'
import { LegalBadge } from '@/components/scores/legal-badge'
import type { Tables } from '@/lib/supabase/types'

type LighthouseMetric = Tables<'lighthouse_metrics'> & {
  critical_issues: CriticalIssue[] // refinamos el Json genérico al tipo concreto
}

interface Props {
  params: { alias: string }
}

// ──────────────────────────────────────────────────────────────────────────────
// Metadata dinámica
// ──────────────────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lighthouse_metrics')
    .select('nombre_sitio, accessibility_score')
    .eq('alias', params.alias)
    .single()

  if (!data) return { title: 'Sitio no encontrado' }

  const score = data.accessibility_score !== null
    ? `${Math.round(data.accessibility_score)}/100`
    : 'sin score'

  return {
    title: `${data.nombre_sitio} — Accesibilidad ${score}`,
    description: `Score de accesibilidad Lighthouse de ${data.nombre_sitio}: ${score}. Auditado por OLAAC.`,
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Página de detalle
// ──────────────────────────────────────────────────────────────────────────────
export default async function ScoreDetailPage({ params }: Props) {
  const supabase = await createClient()

  const [{ data }, { data: snapshots }] = await Promise.all([
    supabase
      .from('lighthouse_metrics')
      .select('*')
      .eq('alias', params.alias)
      .single(),
    supabase
      .from('lighthouse_snapshots')
      .select('measured_at, accessibility_score')
      .eq('alias', params.alias)
      .order('measured_at', { ascending: true })
      .limit(52),
  ])

  if (!data) notFound()

  // Marco legal del país del sitio
  const { data: legislacion } = await supabase
    .from('legislacion_pais')
    .select('pais, iso_code, ley_nombre, nivel_sancion, obliga_sector')
    .eq('pais', (data as Tables<'lighthouse_metrics'>).pais)
    .eq('vigente', true)
    .maybeSingle()

  const metric = data as LighthouseMetric

  const score    = metric.accessibility_score
  const scoreInt = score !== null ? Math.round(score) : null
  const label    = scoreInt !== null ? getScoreLabel(scoreInt) : 'Sin dato'

  const measuredDate = new Date(metric.measured_at).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const criticalCount = Array.isArray(metric.critical_issues)
    ? metric.critical_issues.filter((i) => i.impact === 'critical').length
    : 0
  const seriousCount = Array.isArray(metric.critical_issues)
    ? metric.critical_issues.filter((i) => i.impact === 'serious').length
    : 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

      {/* Navegación de retorno */}
      <nav aria-label="Miga de pan">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link
              href="/scores"
              className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
            >
              Scores
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate font-medium text-gray-700" aria-current="page">
            {metric.nombre_sitio}
          </li>
        </ol>
      </nav>

      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{metric.nombre_sitio}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span>{metric.pais}</span>
          <span aria-hidden="true">·</span>
          <span>{metric.categoria}{metric.subcategoria ? ` · ${metric.subcategoria}` : ''}</span>
          <span aria-hidden="true">·</span>
          <a
            href={metric.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded break-all"
          >
            {metric.url}
            <span className="sr-only"> (abre en nueva pestaña)</span>
          </a>
        </div>

        <p className="mt-1 text-xs text-gray-400">
          Última auditoría:{' '}
          <time dateTime={metric.measured_at}>{measuredDate}</time>
        </p>
      </header>

      {/* ── KPI principal: Score de Accesibilidad ───────────────────────────── */}
      <section
        aria-label={`Score de accesibilidad: ${scoreInt ?? 'sin dato'} de 100`}
        className="mb-8 flex flex-col items-center gap-6 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:flex-row sm:text-left"
      >
        {scoreInt !== null ? (
          <ScoreBadge score={scoreInt} size="lg" showLabel />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl font-bold text-gray-300" aria-hidden="true">—</span>
            <span className="text-xs text-gray-400">Sin dato</span>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Score de Accesibilidad Lighthouse
          </p>
          {scoreInt !== null ? (
            <>
              <p className="text-3xl font-bold text-gray-900 tabular-nums">
                {scoreInt}
                <span className="ml-1 text-base font-normal text-gray-400">/ 100</span>
              </p>
              <p className="text-sm text-gray-600">
                Calificación: <strong>{label}</strong>
                {criticalCount + seriousCount > 0 && (
                  <span className="ml-2 text-orange-700">
                    · {criticalCount + seriousCount} violacion{criticalCount + seriousCount !== 1 ? 'es' : ''} de alto impacto detectada{criticalCount + seriousCount !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No se pudo calcular el score en esta auditoría.
            </p>
          )}
        </div>
      </section>

      {/* ── Tendencia histórica ──────────────────────────────────────────────── */}
      {snapshots && snapshots.length > 0 && (
        <section aria-labelledby="trend-heading" className="mb-8">
          <h2 id="trend-heading" className="sr-only">Tendencia histórica de accesibilidad</h2>
          <ScoreTrendChart
            snapshots={snapshots}
            siteName={metric.nombre_sitio}
          />
        </section>
      )}

      {/* ── Hallazgos: Critical Issues ───────────────────────────────────────── */}
      <section aria-labelledby="issues-heading" className="mb-8">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="issues-heading" className="text-base font-semibold text-gray-900">
            Violaciones de alto impacto
          </h2>
          {(criticalCount + seriousCount) > 0 && (
            <p className="text-xs text-gray-500 shrink-0">
              {criticalCount > 0 && (
                <span className="font-medium text-red-700">{criticalCount} crítica{criticalCount !== 1 ? 's' : ''}</span>
              )}
              {criticalCount > 0 && seriousCount > 0 && <span> · </span>}
              {seriousCount > 0 && (
                <span className="font-medium text-orange-700">{seriousCount} grave{seriousCount !== 1 ? 's' : ''}</span>
              )}
            </p>
          )}
        </div>
        <CriticalIssuesAccordion issues={metric.critical_issues} />
      </section>

      {/* ── Marco legal ──────────────────────────────────────────────────────── */}
      {legislacion && (
        <section aria-labelledby="marco-legal-heading" className="mb-8">
          <h2 id="marco-legal-heading" className="mb-3 text-base font-semibold text-gray-900">
            Obligación legal de accesibilidad
          </h2>
          <LegalBadge legislacion={legislacion} />
        </section>
      )}

      {/* ── CTA: Academia OLAAC ──────────────────────────────────────────────── */}
      {(criticalCount + seriousCount) > 0 && (
        <aside
          aria-label="Recurso educativo relacionado"
          className="mb-8 rounded-xl border border-[#005fcc]/20 bg-[#f0f4ff] p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-[#252858]">
                ¿No sabes cómo corregir estas violaciones?
              </p>
              <p className="mt-1 text-sm text-[#252858]">
                Aprende en la <strong>Academia OLAAC</strong> — cursos gratuitos sobre WCAG 2.1,
                axe-core y técnicas de desarrollo accesible.
              </p>
            </div>
            <a
              href="http://localhost:3001"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#252858] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#2d3476] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 transition-colors"
            >
              Ir a la Academia OLAAC
              <svg className="ml-2 h-4 w-4" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </aside>
      )}

      {/* ── Solicitar re-auditoría ───────────────────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        ¿Detectas información desactualizada o quieres reportar una barrera?{' '}
        <Link
          href="/tickets/nuevo"
          className="text-[#005fcc] underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          Abre un ticket de accesibilidad
        </Link>
      </div>
    </div>
  )
}
