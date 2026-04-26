import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminDistintivoActions } from '@/components/admin/distintivos/admin-distintivo-actions'
import { DistintivoBadge } from '@/components/distintivo/distintivo-badge'
import { ProgramStages } from '@/components/distintivo/program-stages'
import { SolicitudStatusBadge } from '@/components/distintivo/solicitud-status-badge'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Revisar solicitud — Distintivos Admin OLAAC' }

export default async function AdminDistintivoDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: solicitud } = await supabase
    .from('solicitudes_distintivo')
    .select(`
      id,
      folio,
      estado,
      nivel_solicitado,
      nivel_otorgado,
      etapa_actual,
      fecha_solicitud,
      fecha_inicio_programa,
      fecha_auditoria,
      fecha_emision,
      tareas_accesibles,
      flujos_accesibles,
      experiencias_accesibles,
      total_tareas,
      total_flujos,
      total_experiencias,
      notas_admin,
      ticket_id,
      auditor_id,
      organizaciones_distintivo (
        id,
        nombre_organizacion,
        tipo,
        sitio_web,
        pais,
        contacto_nombre,
        contacto_email,
        contacto_telefono
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (!solicitud) notFound()

  const { data: etapas } = await supabase
    .from('etapas_progreso')
    .select('etapa, estado, fecha_completada, notas, ticket_id, curso_id')
    .eq('solicitud_id', id)
    .order('created_at', { ascending: true })

  const { data: distintivo } = await supabase
    .from('distintivos_emitidos')
    .select('folio, fecha_emision, fecha_vencimiento, vigente')
    .eq('solicitud_id', id)
    .maybeSingle()

  const { data: auditores } = await supabase
    .from('auditor_profiles')
    .select('id, nombre_completo, estado')
    .in('estado', ['certificado', 'activo'])

  const { data: tickets } = await supabase
    .from('tickets')
    .select('id, folio, titulo, estado')
    .eq('categoria', 'digital')
    .order('created_at', { ascending: false })
    .limit(20)

  const org = solicitud.organizaciones_distintivo as {
    id: string
    nombre_organizacion: string
    tipo: string
    sitio_web: string
    pais: string
    contacto_nombre: string
    contacto_email: string
    contacto_telefono: string | null
  } | null

  const TIPO_LABEL: Record<string, string> = {
    publica: 'Pública', privada: 'Privada', mixta: 'Mixta', ong: 'OSC / ONG',
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/distintivos" className="hover:text-gray-700 hover:underline">
          Distintivos
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-mono text-gray-900">{solicitud.folio}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {org?.nombre_organizacion ?? 'Organización'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {TIPO_LABEL[org?.tipo ?? ''] ?? org?.tipo} · {org?.pais} ·{' '}
            <a href={org?.sitio_web ?? '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {org?.sitio_web}
            </a>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <SolicitudStatusBadge estado={solicitud.estado as Parameters<typeof SolicitudStatusBadge>[0]['estado']} />
            <DistintivoBadge
              nivel={(solicitud.nivel_otorgado ?? solicitud.nivel_solicitado) as 'oro' | 'platino' | 'diamante'}
              size="sm"
            />
            {solicitud.nivel_otorgado && (
              <span className="text-xs text-gray-500">
                (solicitado: {solicitud.nivel_solicitado})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Datos de contacto */}
      <section aria-labelledby="contacto-heading" className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 id="contacto-heading" className="mb-4 text-base font-semibold text-gray-900">
          Datos de contacto
        </h2>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500">Nombre</dt>
            <dd className="text-sm font-medium text-gray-900">{org?.contacto_nombre}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Correo</dt>
            <dd className="text-sm text-gray-900">
              <a href={`mailto:${org?.contacto_email}`} className="hover:underline">
                {org?.contacto_email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Teléfono</dt>
            <dd className="text-sm text-gray-900">{org?.contacto_telefono ?? '—'}</dd>
          </div>
        </dl>
      </section>

      {/* Métricas (si auditada) */}
      {solicitud.total_tareas > 0 && (
        <section aria-labelledby="metricas-heading" className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 id="metricas-heading" className="mb-4 text-base font-semibold text-gray-900">
            Métricas de accesibilidad
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Tareas accesibles', value: solicitud.tareas_accesibles, total: solicitud.total_tareas },
              { label: 'Flujos accesibles', value: solicitud.flujos_accesibles, total: solicitud.total_flujos },
              { label: 'Experiencias', value: solicitud.experiencias_accesibles, total: solicitud.total_experiencias },
            ].map(m => {
              const pct = m.total > 0 ? Math.round((m.value / m.total) * 100) : 0
              return (
                <div key={m.label} className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">{m.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {m.value}
                    <span className="ml-1 text-sm font-normal text-gray-400">/ {m.total}</span>
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-[#005fcc]"
                      style={{ width: `${pct}%` }}
                      aria-label={`${pct}% accesible`}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-gray-500">{pct}%</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Distintivo emitido */}
      {distintivo && (
        <section aria-labelledby="emitido-heading" className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 id="emitido-heading" className="mb-2 text-base font-semibold text-green-800">
            Distintivo emitido
          </h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-green-600">Folio</dt>
              <dd className="font-mono font-medium text-green-900">{distintivo.folio}</dd>
            </div>
            <div>
              <dt className="text-xs text-green-600">Emisión</dt>
              <dd className="text-green-900">
                {new Date(distintivo.fecha_emision).toLocaleDateString('es-MX')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-green-600">Vencimiento</dt>
              <dd className="text-green-900">
                {new Date(distintivo.fecha_vencimiento).toLocaleDateString('es-MX')}
              </dd>
            </div>
          </dl>
          <div className="mt-3">
            <Link
              href={`/distintivo/verificar/${distintivo.folio}`}
              target="_blank"
              className="text-sm text-green-700 hover:underline"
            >
              Ver página de verificación pública →
            </Link>
          </div>
        </section>
      )}

      {/* Progreso de etapas */}
      {etapas && etapas.length > 0 && (
        <section aria-labelledby="etapas-heading" className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 id="etapas-heading" className="mb-6 text-base font-semibold text-gray-900">
            Progreso del programa
          </h2>
          <ProgramStages progreso={etapas} />
        </section>
      )}

      {/* Acciones de administración */}
      <section aria-labelledby="acciones-heading" className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 id="acciones-heading" className="mb-6 text-base font-semibold text-gray-900">
          Acciones de administración
        </h2>
        <AdminDistintivoActions
          solicitudId={id}
          estado={solicitud.estado as string}
          nivelSolicitado={solicitud.nivel_solicitado as string}
          auditores={auditores ?? []}
          tickets={tickets ?? []}
        />
      </section>
    </div>
  )
}
