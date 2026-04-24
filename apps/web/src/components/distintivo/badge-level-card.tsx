import { DistintivoBadge } from './distintivo-badge'

type BadgeNivel = 'oro' | 'platino' | 'diamante'

interface Criterio {
  nivel: BadgeNivel
  min_tareas_accesibles: number
  min_flujos_accesibles: number
  min_experiencias_accesibles: number
  min_porcentaje_accesibilidad: number
  descripcion: string | null
  beneficios: string[]
}

interface BadgeLevelCardProps {
  criterio: Criterio
  selected?: boolean
  onSelect?: (nivel: BadgeNivel) => void
  interactive?: boolean
}

const NIVEL_LABEL: Record<BadgeNivel, string> = {
  oro:      'Oro',
  platino:  'Platino',
  diamante: 'Diamante',
}

const NIVEL_BORDER: Record<BadgeNivel, string> = {
  oro:      'border-amber-200 bg-amber-50/40',
  platino:  'border-slate-200 bg-slate-50/40',
  diamante: 'border-blue-200 bg-blue-50/40',
}

const NIVEL_SELECTED: Record<BadgeNivel, string> = {
  oro:      'ring-2 ring-amber-400 border-amber-400',
  platino:  'ring-2 ring-slate-400 border-slate-400',
  diamante: 'ring-2 ring-[#005fcc] border-[#005fcc]',
}

export function BadgeLevelCard({ criterio, selected, onSelect, interactive }: BadgeLevelCardProps) {
  const { nivel, min_tareas_accesibles, min_flujos_accesibles, min_experiencias_accesibles, min_porcentaje_accesibilidad, descripcion, beneficios } = criterio

  const borderClass = selected ? NIVEL_SELECTED[nivel] : NIVEL_BORDER[nivel]

  const Tag = interactive ? 'button' : 'article'

  return (
    <Tag
      {...(interactive && {
        type: 'button' as const,
        onClick: () => onSelect?.(nivel),
        'aria-pressed': selected,
      })}
      className={[
        'flex flex-col gap-4 rounded-xl border p-6 text-left transition-all',
        interactive ? 'cursor-pointer hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2' : '',
        borderClass,
      ].join(' ')}
    >
      <div className="flex items-center gap-4">
        <DistintivoBadge nivel={nivel} size="md" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Nivel {NIVEL_LABEL[nivel]}
          </h3>
          {descripcion && (
            <p className="mt-1 text-sm text-gray-600">{descripcion}</p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-white/60 p-3 text-center">
          <dt className="text-xs text-gray-500">Tareas accesibles</dt>
          <dd className="mt-0.5 text-xl font-bold text-gray-900">≥{min_tareas_accesibles}</dd>
        </div>
        <div className="rounded-lg bg-white/60 p-3 text-center">
          <dt className="text-xs text-gray-500">Flujos accesibles</dt>
          <dd className="mt-0.5 text-xl font-bold text-gray-900">≥{min_flujos_accesibles}</dd>
        </div>
        <div className="rounded-lg bg-white/60 p-3 text-center">
          <dt className="text-xs text-gray-500">Experiencias</dt>
          <dd className="mt-0.5 text-xl font-bold text-gray-900">≥{min_experiencias_accesibles}</dd>
        </div>
        <div className="rounded-lg bg-white/60 p-3 text-center">
          <dt className="text-xs text-gray-500">Accesibilidad</dt>
          <dd className="mt-0.5 text-xl font-bold text-gray-900">≥{min_porcentaje_accesibilidad}%</dd>
        </div>
      </dl>

      {beneficios.length > 0 && (
        <ul className="space-y-1.5" aria-label={`Beneficios del nivel ${NIVEL_LABEL[nivel]}`}>
          {beneficios.map(b => (
            <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-[#005fcc]"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              {b}
            </li>
          ))}
        </ul>
      )}
    </Tag>
  )
}
