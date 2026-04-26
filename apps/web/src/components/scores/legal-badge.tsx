import Link from 'next/link'

import type { Tables } from '@/lib/supabase/types'

type LegislacionRow = Pick<
  Tables<'legislacion_pais'>,
  'ley_nombre' | 'nivel_sancion' | 'obliga_sector' | 'pais' | 'iso_code'
>

interface LegalBadgeProps {
  legislacion: LegislacionRow
  /** Muestra versión compacta (solo ícono + ley) para filas de tabla */
  compact?: boolean
}

const SANCION_COLOR: Record<string, string> = {
  alto:    'bg-red-50 border-red-200 text-red-800',
  medio:   'bg-amber-50 border-amber-200 text-amber-800',
  bajo:    'bg-blue-50 border-blue-200 text-blue-800',
  ninguno: 'bg-gray-50 border-gray-200 text-gray-600',
}

const SANCION_LABEL: Record<string, string> = {
  alto:    'Sanción alta',
  medio:   'Sanción media',
  bajo:    'Sanción baja',
  ninguno: 'Sin sanción',
}

export function LegalBadge({ legislacion, compact = false }: LegalBadgeProps) {
  const colorClass = SANCION_COLOR[legislacion.nivel_sancion] ?? SANCION_COLOR.ninguno

  if (compact) {
    return (
      <Link
        href="/marco-legal"
        className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded ${colorClass}`}
        title={`${legislacion.ley_nombre} — ${SANCION_LABEL[legislacion.nivel_sancion]}`}
      >
        <svg aria-hidden="true" className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1H3V2ZM2 4h12l-1.5 8H3.5L2 4Z" />
          <path d="M6 7.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Z" />
        </svg>
        <span>Obligación legal</span>
      </Link>
    )
  }

  return (
    <div className={`rounded-lg border p-4 ${colorClass}`}>
      <div className="flex items-start gap-3">
        <svg aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1.5a.75.75 0 0 1 .658.393l6.75 12.5A.75.75 0 0 1 16.75 15.5H3.25a.75.75 0 0 1-.658-1.107l6.75-12.5A.75.75 0 0 1 10 1.5ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            Sitio bajo obligación legal — {legislacion.pais}
          </p>
          <p className="mt-1 text-sm">
            {legislacion.ley_nombre} ·{' '}
            <span className="font-medium">{SANCION_LABEL[legislacion.nivel_sancion]}</span>
          </p>
          <p className="mt-1 text-xs opacity-75">
            Sectores obligados: {legislacion.obliga_sector.join(', ')}
          </p>
          <Link
            href="/marco-legal"
            className="mt-2 inline-block text-xs underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:rounded"
          >
            Ver marco legal completo →
          </Link>
        </div>
      </div>
    </div>
  )
}
