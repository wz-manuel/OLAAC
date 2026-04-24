type SolicitudStatus =
  | 'borrador'
  | 'enviada'
  | 'en_revision'
  | 'aprobada_para_programa'
  | 'en_programa'
  | 'auditada'
  | 'distintivo_emitido'
  | 'rechazada'
  | 'suspendida'
  | 'revocada'

interface SolicitudStatusBadgeProps {
  estado: SolicitudStatus
}

const STATUS_MAP: Record<SolicitudStatus, { label: string; className: string }> = {
  borrador:               { label: 'Borrador',             className: 'bg-gray-100 text-gray-600' },
  enviada:                { label: 'Enviada',              className: 'bg-blue-100 text-blue-700' },
  en_revision:            { label: 'En revisión',          className: 'bg-amber-100 text-amber-700' },
  aprobada_para_programa: { label: 'Aprobada',             className: 'bg-teal-100 text-teal-700' },
  en_programa:            { label: 'En programa',          className: 'bg-indigo-100 text-indigo-700' },
  auditada:               { label: 'Auditada',             className: 'bg-purple-100 text-purple-700' },
  distintivo_emitido:     { label: 'Distintivo emitido',  className: 'bg-green-100 text-green-700' },
  rechazada:              { label: 'Rechazada',            className: 'bg-red-100 text-red-700' },
  suspendida:             { label: 'Suspendida',           className: 'bg-orange-100 text-orange-700' },
  revocada:               { label: 'Revocado',             className: 'bg-red-100 text-red-800' },
}

export function SolicitudStatusBadge({ estado }: SolicitudStatusBadgeProps) {
  const { label, className } = STATUS_MAP[estado] ?? { label: estado, className: 'bg-gray-100 text-gray-600' }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
