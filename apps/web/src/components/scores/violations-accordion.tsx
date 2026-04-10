'use client'

import * as React from 'react'
import { cn } from '@olaac/ui'

interface AxeViolation {
  id: string
  impact?: 'minor' | 'moderate' | 'serious' | 'critical' | string
  description?: string
  help?: string
  helpUrl?: string
  nodes?: unknown[]
}

interface ViolationsAccordionProps {
  violations: unknown
  className?: string
}

const IMPACT_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  serious:  'bg-orange-100 text-orange-800 border-orange-200',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  minor:    'bg-blue-100 text-blue-800 border-blue-200',
}

const IMPACT_LABELS: Record<string, string> = {
  critical: 'Crítico',
  serious:  'Grave',
  moderate: 'Moderado',
  minor:    'Menor',
}

/**
 * ViolationsAccordion — Muestra las violaciones axe-core del campo JSONB.
 *
 * WCAG:
 * - 4.1.3: cada <details>/<summary> es nativo y accesible por teclado
 * - 1.3.1: impacto comunicado con texto, no solo color
 * - 2.1.1: navegación completa por teclado con elementos HTML nativos
 */
export function ViolationsAccordion({ violations, className }: ViolationsAccordionProps) {
  const items = parseViolations(violations)

  if (!items.length) {
    return (
      <p className={cn('rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800', className)} role="status">
        No se registraron violaciones axe-core en esta auditoría.
      </p>
    )
  }

  return (
    <section aria-label={`${items.length} violaciones de accesibilidad detectadas`} className={cn('space-y-2', className)}>
      <p className="text-sm text-gray-500" aria-live="polite">
        {items.length} {items.length === 1 ? 'violación encontrada' : 'violaciones encontradas'}
      </p>
      <ul className="space-y-2" role="list">
        {items.map((v, i) => (
          <li key={v.id ?? i}>
            <details className="group rounded-lg border border-gray-200 bg-white">
              <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-inset rounded-lg select-none">
                {/* Indicador de impacto */}
                {v.impact && (
                  <span
                    className={cn(
                      'shrink-0 rounded border px-1.5 py-0.5 text-xs font-semibold',
                      IMPACT_STYLES[v.impact] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                    )}
                  >
                    {IMPACT_LABELS[v.impact] ?? v.impact}
                  </span>
                )}
                <span className="flex-1 font-mono text-xs text-gray-700">{v.id}</span>
                {/* Chevron */}
                <svg
                  className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </summary>

              <div className="border-t border-gray-100 px-4 py-3 space-y-2 text-sm text-gray-700">
                {v.help && <p>{v.help}</p>}
                {v.description && v.description !== v.help && (
                  <p className="text-xs text-gray-500">{v.description}</p>
                )}
                {Array.isArray(v.nodes) && v.nodes.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {v.nodes.length} {v.nodes.length === 1 ? 'elemento afectado' : 'elementos afectados'}
                  </p>
                )}
                {v.helpUrl && (
                  <a
                    href={v.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-[#005fcc] underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                  >
                    Más información sobre esta regla
                    <span className="sr-only"> (abre en nueva pestaña)</span>
                  </a>
                )}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  )
}

function parseViolations(raw: unknown): AxeViolation[] {
  if (!raw || !Array.isArray(raw)) return []
  return raw.filter((v): v is AxeViolation => typeof v === 'object' && v !== null && 'id' in v)
}
