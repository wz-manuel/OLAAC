import type { Metadata } from 'next'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { SolicitudStatusBadge } from '@/components/distintivo/solicitud-status-badge'
import { DistintivoChip } from '@/components/distintivo/distintivo-badge'

export const metadata: Metadata = { title: 'Distintivos — Admin OLAAC' }

export default async function AdminDistintivosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado } = await searchParams
  const supabase = await createClient()

  type SolicitudStatus =
    | 'borrador' | 'enviada' | 'en_revision' | 'aprobada_para_programa'
    | 'en_programa' | 'auditada' | 'distintivo_emitido' | 'rechazada'
    | 'suspendida' | 'revocada'

  const VALID_STATES: SolicitudStatus[] = [
    'borrador', 'enviada', 'en_revision', 'aprobada_para_programa',
    'en_programa', 'auditada', 'distintivo_emitido', 'rechazada',
    'suspendida', 'revocada',
  ]

  let query = supabase
    .from('solicitudes_distintivo')
    .select(`
      id,
      folio,
      estado,
      nivel_solicitado,
      nivel_otorgado,
      fecha_solicitud,
      etapa_actual,
      organizaciones_distintivo (
        nombre_organizacion,
        tipo,
        pais,
        sitio_web
      )
    `)
    .order('fecha_solicitud', { ascending: false })

  if (estado && VALID_STATES.includes(estado as SolicitudStatus)) {
    query = query.eq('estado', estado as SolicitudStatus)
  }

  const { data: solicitudes } = await query

  const FILTROS = [
    { label: 'Todas',         value: undefined },
    { label: 'Enviadas',      value: 'enviada' },
    { label: 'En revisión',   value: 'en_revision' },
    { label: 'En programa',   value: 'en_programa' },
    { label: 'Emitidas',      value: 'distintivo_emitido' },
    { label: 'Rechazadas',    value: 'rechazada' },
  ]

  const ETAPA_LABEL: Record<string, string> = {
    concientizacion: 'Concientización',
    capacitacion:    'Capacitación',
    auditoria:       'Auditoría',
    remediacion:     'Remediación',
    design_ops:      'Design Ops',
    politicas:       'Políticas',
    declaratoria:    'Declaratoria',
  }

  const TIPO_LABEL: Record<string, string> = {
    publica: 'Pública', privada: 'Privada', mixta: 'Mixta', ong: 'ONG',
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Distintivos</h2>
        <p className="text-sm text-gray-500">{solicitudes?.length ?? 0} solicitudes</p>
      </div>

      <nav aria-label="Filtrar solicitudes" className="mb-5">
        <ul className="flex flex-wrap gap-2">
          {FILTROS.map(f => {
            const isActive = estado === f.value || (f.value === undefined && !estado)
            const href = f.value ? `/admin/distintivos?estado=${f.value}` : '/admin/distintivos'
            return (
              <li key={f.label}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] ${
                    isActive
                      ? 'bg-[#005fcc] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {!solicitudes?.length ? (
        <p className="py-12 text-center text-sm text-gray-500">
          No hay solicitudes con este filtro.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table
            className="min-w-full divide-y divide-gray-200"
            aria-label="Lista de solicitudes de distintivo"
          >
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Organización</th>
                <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:table-cell">Tipo / País</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Nivel</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Estado</th>
                <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 md:table-cell">Etapa</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {solicitudes.map(s => {
                const org = s.organizaciones_distintivo as {
                  nombre_organizacion: string
                  tipo: string
                  pais: string
                } | null

                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <Link
                        href={`/admin/distintivos/${s.id}`}
                        className="hover:text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                      >
                        {org?.nombre_organizacion ?? '—'}
                      </Link>
                      <p className="font-mono text-xs text-gray-400">{s.folio}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-gray-600 sm:table-cell">
                      {TIPO_LABEL[org?.tipo ?? ''] ?? org?.tipo ?? '—'} · {org?.pais ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {s.nivel_otorgado ? (
                        <DistintivoChip nivel={s.nivel_otorgado as 'oro' | 'platino' | 'diamante'} />
                      ) : (
                        <span className="text-xs text-gray-400">
                          Solicita: {s.nivel_solicitado}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <SolicitudStatusBadge estado={s.estado as Parameters<typeof SolicitudStatusBadge>[0]['estado']} />
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-gray-600 md:table-cell">
                      {s.etapa_actual ? (ETAPA_LABEL[s.etapa_actual] ?? s.etapa_actual) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(s.fecha_solicitud).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
