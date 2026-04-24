type EtapaEstado = 'pendiente' | 'en_curso' | 'completada' | 'omitida'

interface EtapaProgreso {
  etapa: string
  estado: EtapaEstado
  fecha_completada?: string | null
}

interface ProgramStagesProps {
  progreso?: EtapaProgreso[]
}

const ETAPAS = [
  {
    key: 'concientizacion',
    numero: '01',
    titulo: 'Concientización',
    descripcion: 'Sensibilización del equipo directivo y operativo sobre la importancia de la accesibilidad digital e inclusión.',
    icono: '◎',
    conexion: null,
  },
  {
    key: 'capacitacion',
    numero: '02',
    titulo: 'Capacitación',
    descripcion: 'Formación práctica a través de la Academia OLAAC: WCAG 2.2, tecnologías asistivas y buenas prácticas.',
    icono: '◎',
    conexion: 'Academia OLAAC',
  },
  {
    key: 'auditoria',
    numero: '03',
    titulo: 'Auditoría',
    descripcion: 'Un auditor voluntario certificado evalúa el sitio y servicios digitales de la organización contra los criterios WCAG.',
    icono: '◎',
    conexion: 'Sistema de Tickets · Auditores Voluntarios',
  },
  {
    key: 'remediacion',
    numero: '04',
    titulo: 'Remediación',
    descripcion: 'Corrección de barreras de accesibilidad identificadas en la auditoría mediante tickets de seguimiento.',
    icono: '◎',
    conexion: 'Sistema de Tickets',
  },
  {
    key: 'design_ops',
    numero: '05',
    titulo: 'Design Ops de Accesibilidad',
    descripcion: 'Integración de prácticas de accesibilidad en los flujos de diseño y desarrollo de la organización.',
    icono: '◎',
    conexion: null,
  },
  {
    key: 'politicas',
    numero: '06',
    titulo: 'Políticas',
    descripcion: 'Definición y publicación de la política de accesibilidad y plan de acción de la organización.',
    icono: '◎',
    conexion: null,
  },
  {
    key: 'declaratoria',
    numero: '07',
    titulo: 'Declaratoria',
    descripcion: 'Declaración pública del compromiso accesible y publicación de la declaración de conformidad WCAG.',
    icono: '◎',
    conexion: null,
  },
]

const ESTADO_STYLES: Record<EtapaEstado, { dot: string; text: string; label: string }> = {
  pendiente:  { dot: 'bg-gray-200', text: 'text-gray-400', label: 'Pendiente' },
  en_curso:   { dot: 'bg-[#005fcc] animate-pulse', text: 'text-[#005fcc]', label: 'En curso' },
  completada: { dot: 'bg-green-500', text: 'text-green-700', label: 'Completada' },
  omitida:    { dot: 'bg-gray-300', text: 'text-gray-400', label: 'Omitida' },
}

export function ProgramStages({ progreso }: ProgramStagesProps) {
  const progresoMap = new Map(
    (progreso ?? []).map(p => [p.etapa, p])
  )

  return (
    <ol
      className="relative border-l-2 border-gray-200 pl-8 space-y-8"
      aria-label="Etapas del programa de distintivo"
    >
      {ETAPAS.map(etapa => {
        const estado = progresoMap.get(etapa.key)?.estado ?? 'pendiente'
        const style  = ESTADO_STYLES[estado]
        const fechaCompletada = progresoMap.get(etapa.key)?.fecha_completada

        return (
          <li key={etapa.key} className="relative">
            {/* Dot en la línea */}
            <span
              aria-hidden="true"
              className={[
                'absolute -left-[2.65rem] top-1.5 h-4 w-4 rounded-full border-2 border-white',
                style.dot,
              ].join(' ')}
            />

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {etapa.numero}
                </span>
                <h3 className="text-base font-semibold text-gray-900">{etapa.titulo}</h3>
                <span className={['text-xs font-medium', style.text].join(' ')}>
                  {style.label}
                  {fechaCompletada && (
                    <> · {new Date(fechaCompletada).toLocaleDateString('es-MX')}</>
                  )}
                </span>
              </div>

              <p className="text-sm text-gray-600">{etapa.descripcion}</p>

              {etapa.conexion && (
                <p className="mt-1 text-xs font-medium text-[#005fcc]">
                  Conectado con: {etapa.conexion}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
