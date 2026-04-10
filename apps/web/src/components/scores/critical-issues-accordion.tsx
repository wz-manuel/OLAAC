'use client'

import * as React from 'react'
import { cn } from '@olaac/ui'

// Estructura generada por toolchain/lighthouse-audit/sync-scores.ts
// y almacenada en lighthouse_metrics.critical_issues (JSONB)
export interface CriticalIssue {
  auditId: string
  impact: 'critical' | 'serious'
  title: string
  affectedCount: number
  nodes: Array<{
    snippet: string
    label: string
    explanation?: string
  }>
}

interface CriticalIssuesAccordionProps {
  issues: unknown // JSONB crudo — se valida en runtime
  className?: string
}

const IMPACT_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  serious:  'bg-orange-100 text-orange-800 border-orange-200',
}

const IMPACT_LABEL: Record<string, string> = {
  critical: 'Crítico',
  serious:  'Grave',
}

/**
 * CriticalIssuesAccordion — Renderiza las violaciones de alto impacto
 * (critical / serious) almacenadas en lighthouse_metrics.critical_issues.
 *
 * WCAG:
 * - 4.1.3: <details>/<summary> nativos — accesibles sin JS
 * - 1.3.1: impacto comunicado con texto, no solo color
 * - 1.4.3: contraste mínimo AA en todos los badges
 * - 2.1.1: navegación completa por teclado (elementos HTML nativos)
 * - 4.1.2: role="list" en <ul> para comunicar estructura a AT
 */
export function CriticalIssuesAccordion({ issues, className }: CriticalIssuesAccordionProps) {
  const items = parseIssues(issues)

  if (!items.length) {
    return (
      <p
        role="status"
        className={cn(
          'rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800',
          className
        )}
      >
        No se detectaron violaciones de impacto crítico o grave en esta auditoría.
      </p>
    )
  }

  const criticalCount = items.filter((i) => i.impact === 'critical').length
  const seriousCount  = items.filter((i) => i.impact === 'serious').length

  return (
    <section
      aria-label={`${items.length} violaciones de alto impacto detectadas`}
      className={cn('space-y-3', className)}
    >
      {/* Resumen de conteos — aria-live para notificar si se actualiza */}
      <p className="text-sm text-gray-500" aria-live="polite">
        {items.length === 1
          ? '1 violación encontrada'
          : `${items.length} violaciones encontradas`}
        {criticalCount > 0 && (
          <span className="ml-2 font-medium text-red-700">
            · {criticalCount} crítica{criticalCount !== 1 ? 's' : ''}
          </span>
        )}
        {seriousCount > 0 && (
          <span className="ml-2 font-medium text-orange-700">
            · {seriousCount} grave{seriousCount !== 1 ? 's' : ''}
          </span>
        )}
      </p>

      <ul className="space-y-2" role="list">
        {items.map((issue, idx) => (
          <li key={`${issue.auditId}-${idx}`}>
            <details className="group rounded-lg border border-gray-200 bg-white">
              <summary
                className={cn(
                  'flex cursor-pointer select-none items-center gap-3 rounded-lg px-4 py-3',
                  'text-sm font-medium text-gray-800',
                  'hover:bg-gray-50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-inset'
                )}
              >
                {/* Badge de impacto — con texto, no solo color (WCAG 1.3.1) */}
                <span
                  className={cn(
                    'shrink-0 rounded border px-1.5 py-0.5 text-xs font-semibold',
                    IMPACT_BADGE[issue.impact] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                  )}
                >
                  {IMPACT_LABEL[issue.impact] ?? issue.impact}
                </span>

                <span className="flex-1 min-w-0">
                  {/* ID de la regla en monoespaciado */}
                  <span className="block font-mono text-xs text-gray-500">{issue.auditId}</span>
                  {/* Título legible */}
                  <span className="block text-sm text-gray-800 truncate" title={issue.title}>
                    {issue.title}
                  </span>
                </span>

                {/* Contador de elementos afectados */}
                {issue.affectedCount > 0 && (
                  <span
                    className="shrink-0 text-xs text-gray-400 tabular-nums"
                    aria-label={`${issue.affectedCount} elemento${issue.affectedCount !== 1 ? 's' : ''} afectado${issue.affectedCount !== 1 ? 's' : ''}`}
                  >
                    {issue.affectedCount} elem.
                  </span>
                )}

                {/* Chevron animado */}
                <svg
                  className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>

              {/* Panel expandible */}
              <div className="space-y-3 border-t border-gray-100 px-4 py-3">
                {issue.nodes.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Elementos afectados ({Math.min(issue.nodes.length, 5)} de {issue.affectedCount})
                    </p>
                    <ul className="space-y-2" role="list">
                      {issue.nodes.slice(0, 5).map((node, nIdx) => (
                        <li key={nIdx} className="rounded-md bg-gray-50 p-3 text-xs">
                          {/* Snippet HTML — preformateado, sin ejecutar */}
                          {node.snippet && (
                            <code
                              className="block break-all font-mono text-gray-700 whitespace-pre-wrap"
                              aria-label="Fragmento HTML afectado"
                            >
                              {node.snippet}
                            </code>
                          )}
                          {node.label && (
                            <p className="mt-1 text-gray-500">
                              <span className="font-medium">Etiqueta:</span> {node.label}
                            </p>
                          )}
                          {node.explanation && (
                            <p className="mt-1 text-gray-500">
                              <span className="font-medium">Corrección sugerida:</span>{' '}
                              {node.explanation}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Link a documentación axe-core */}
                <a
                  href={`https://dequeuniversity.com/rules/axe/4.9/${issue.auditId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-block text-xs text-[#005fcc] underline',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded'
                  )}
                >
                  Ver documentación de la regla &quot;{issue.auditId}&quot;
                  <span className="sr-only"> (abre en nueva pestaña)</span>
                </a>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}

function parseIssues(raw: unknown): CriticalIssue[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (item): item is CriticalIssue =>
      typeof item === 'object' &&
      item !== null &&
      'auditId' in item &&
      'impact' in item &&
      (item.impact === 'critical' || item.impact === 'serious')
  )
}
