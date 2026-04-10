import * as React from 'react'
import { cn } from '../../lib/utils'
import { ScoreBadge } from '../score-badge'

export interface A11yScore {
  url: string
  score_total: number | null
  score_a11y: number | null
  score_perf: number | null
  score_seo: number | null
  score_bp: number | null
  measured_at: string
}

export interface A11yDataTableProps {
  scores: A11yScore[]
  caption?: string
  className?: string
}

/**
 * A11yDataTable — Tabla accesible de scores de Lighthouse / axe-core.
 *
 * WCAG:
 * - 1.3.1: <caption> describe la tabla; <th scope> identifica encabezados
 * - 1.4.3: contraste mínimo en badges vía ScoreBadge
 * - 2.1.1: navegable completamente por teclado
 */
export function A11yDataTable({ scores, caption, className }: A11yDataTableProps) {
  if (!scores.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-500" role="status">
        No hay scores registrados aún.
      </p>
    )
  }

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-gray-200', className)}>
      <table className="min-w-full divide-y divide-gray-200 bg-white text-sm" aria-label={caption}>
        {caption && (
          <caption className="px-4 py-3 text-left text-sm font-medium text-gray-700">
            {caption}
          </caption>
        )}
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">URL</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">Total</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500">Accesibilidad</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500 hidden sm:table-cell">Rendimiento</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">SEO</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">Buenas prácticas</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden lg:table-cell">Medido</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {scores.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-gray-600">
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                >
                  {row.url}
                </a>
              </td>
              <td className="px-4 py-3 text-center">
                <ScoreCell value={row.score_total} />
              </td>
              <td className="px-4 py-3 text-center">
                <ScoreCell value={row.score_a11y} highlight />
              </td>
              <td className="px-4 py-3 text-center hidden sm:table-cell">
                <ScoreCell value={row.score_perf} />
              </td>
              <td className="px-4 py-3 text-center hidden md:table-cell">
                <ScoreCell value={row.score_seo} />
              </td>
              <td className="px-4 py-3 text-center hidden md:table-cell">
                <ScoreCell value={row.score_bp} />
              </td>
              <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                {new Date(row.measured_at).toLocaleDateString('es-MX')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ScoreCell({ value, highlight }: { value: number | null; highlight?: boolean }) {
  if (value === null) return <span className="text-gray-300">—</span>

  const color =
    value >= 90 ? 'text-green-700 bg-green-50' :
    value >= 50 ? 'text-yellow-700 bg-yellow-50' :
                  'text-red-700 bg-red-50'

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
        color,
        highlight && 'ring-1 ring-current'
      )}
      aria-label={`Score: ${value}`}
    >
      {value}
    </span>
  )
}
