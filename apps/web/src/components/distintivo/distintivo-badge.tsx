import { cn } from '@olaac/ui'

type BadgeNivel = 'oro' | 'platino' | 'diamante'

interface DistintivoBadgeProps {
  nivel: BadgeNivel
  nombreOrganizacion?: string
  folio?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const NIVEL_CONFIG: Record<BadgeNivel, {
  label: string
  color: string
  ring: string
  bg: string
  icon: string
  ariaLabel: string
}> = {
  oro: {
    label: 'Oro',
    color: 'text-amber-700',
    ring: 'ring-amber-400',
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    icon: '★',
    ariaLabel: 'Nivel Oro',
  },
  platino: {
    label: 'Platino',
    color: 'text-slate-600',
    ring: 'ring-slate-400',
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
    icon: '◆',
    ariaLabel: 'Nivel Platino',
  },
  diamante: {
    label: 'Diamante',
    color: 'text-[#005fcc]',
    ring: 'ring-[#30BCEE]',
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    icon: '◈',
    ariaLabel: 'Nivel Diamante',
  },
}

const SIZE_CLASSES = {
  sm:  { wrapper: 'w-16 h-16', icon: 'text-xl', label: 'text-[9px]', org: 'hidden' },
  md:  { wrapper: 'w-24 h-24', icon: 'text-3xl', label: 'text-xs', org: 'hidden' },
  lg:  { wrapper: 'w-36 h-36', icon: 'text-5xl', label: 'text-sm', org: 'text-xs' },
  xl:  { wrapper: 'w-48 h-48', icon: 'text-7xl', label: 'text-base', org: 'text-sm' },
}

export function DistintivoBadge({
  nivel,
  nombreOrganizacion,
  folio: _folio,
  size = 'md',
  className,
}: DistintivoBadgeProps) {
  const config = NIVEL_CONFIG[nivel]
  const sizes  = SIZE_CLASSES[size]

  return (
    <div
      role="img"
      aria-label={`Distintivo de Accesibilidad OLAAC — ${config.ariaLabel}${nombreOrganizacion ? ` otorgado a ${nombreOrganizacion}` : ''}`}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-full ring-4',
        config.bg,
        config.ring,
        sizes.wrapper,
        className
      )}
    >
      <span aria-hidden="true" className={cn('leading-none', config.color, sizes.icon)}>
        {config.icon}
      </span>
      <span className={cn('mt-1 font-bold uppercase tracking-wide', config.color, sizes.label)}>
        {config.label}
      </span>
      {nombreOrganizacion && (
        <span className={cn('px-1 text-center text-gray-500', sizes.org)}>
          {nombreOrganizacion}
        </span>
      )}
    </div>
  )
}

// ─── Chip/pill variant ────────────────────────────────────────────────────────

export function DistintivoChip({ nivel }: { nivel: BadgeNivel }) {
  const config = NIVEL_CONFIG[nivel]
  const chipColors: Record<BadgeNivel, string> = {
    oro:      'bg-amber-100 text-amber-800 ring-1 ring-amber-300',
    platino:  'bg-slate-100 text-slate-700 ring-1 ring-slate-300',
    diamante: 'bg-blue-100 text-[#005fcc] ring-1 ring-blue-300',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        chipColors[nivel]
      )}
    >
      <span aria-hidden="true">{config.icon}</span>
      Distintivo {config.label}
    </span>
  )
}
