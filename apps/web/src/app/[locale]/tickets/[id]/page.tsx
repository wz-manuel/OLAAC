import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { PriorityBadge } from '@/components/tickets/priority-badge'
import { StatusBadge } from '@/components/tickets/status-badge'
import { AuditResultForm } from '@/components/voluntarios/audit-result-form'
import { createClient } from '@/lib/supabase/server'
import { WCAG_CRITERIOS, PRINCIPIOS, PRINCIPIO_META } from '@/lib/wcag/criterios'

// ─── Resumen de resultados WCAG (Server Component) ───────────────────────────

interface WcagResultRow {
  criterio_codigo: string
  resultado: string
  notas: string | null
}

function WcagResultsSummary({ results }: { results: WcagResultRow[] }) {
  const byCode = new Map(results.map(r => [r.criterio_codigo, r]))

  const COLORES: Record<string, string> = {
    cumple:    'bg-green-100 text-green-800',
    no_cumple: 'bg-red-100 text-red-800',
    no_aplica: 'bg-gray-100 text-gray-600',
  }
  const ETIQUETAS: Record<string, string> = {
    cumple: 'Cumple', no_cumple: 'No cumple', no_aplica: 'N/A',
  }

  return (
    <div className="space-y-3">
      {PRINCIPIOS.map(principio => {
        const criterios = WCAG_CRITERIOS.filter(c => c.principio === principio)
        const evaluados = criterios.filter(c => byCode.has(c.codigo))
        if (evaluados.length === 0) return null

        const meta = PRINCIPIO_META[principio]
        const cumplen   = evaluados.filter(c => byCode.get(c.codigo)?.resultado === 'cumple').length
        const noCumplen = evaluados.filter(c => byCode.get(c.codigo)?.resultado === 'no_cumple').length

        return (
          <details key={principio} className="rounded border border-blue-100">
            <summary className={`flex cursor-pointer list-none items-center justify-between gap-2 rounded px-3 py-2 text-xs font-semibold ${meta.color} ${meta.bg}`}>
              <span>{principio}</span>
              <span className="font-normal text-gray-500">
                {cumplen > 0 && <span className="text-green-700 font-medium">{cumplen}✓ </span>}
                {noCumplen > 0 && <span className="text-red-600 font-medium">{noCumplen}✗ </span>}
                {evaluados.length}/{criterios.length}
              </span>
            </summary>
            <ul className="divide-y divide-blue-50">
              {evaluados.map(c => {
                const r = byCode.get(c.codigo)!
                return (
                  <li key={c.codigo} className="flex flex-col gap-0.5 px-3 py-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span>
                        <span className="font-mono text-gray-500">{c.codigo}</span>
                        {' '}
                        <span className="text-gray-800">{c.nombre}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${COLORES[r.resultado] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ETIQUETAS[r.resultado] ?? r.resultado}
                      </span>
                    </div>
                    {r.notas && (
                      <p className="text-gray-500 pl-12">{r.notas}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          </details>
        )
      })}
    </div>
  )
}

export const metadata = { title: 'Detalle de ticket' }

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/tickets/${id}`)

  const [{ data: ticket }, { data: events }] = await Promise.all([
    supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('ticket_events')
      .select('id, evento, payload, created_at')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!ticket) notFound()

  // Verificar si el usuario es un auditor certificado asignado a este ticket
  const isAssignedAuditor = ticket.assigned_to === user.id
  let auditorProfile = null
  let existingSubmission = null

  if (isAssignedAuditor) {
    const [profileResult, submissionResult] = await Promise.all([
      supabase
        .from('auditor_profiles')
        .select('id, estado')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('audit_submissions')
        .select('id, resumen, recomendaciones, submitted_at, puntaje_wcag, audit_wcag_results(criterio_codigo, resultado, notas)')
        .eq('ticket_id', id)
        .maybeSingle(),
    ])
    auditorProfile = profileResult.data
    existingSubmission = submissionResult.data
  }

  const canSubmitAudit =
    isAssignedAuditor &&
    auditorProfile &&
    (auditorProfile.estado === 'certificado' || auditorProfile.estado === 'activo') &&
    !existingSubmission

  const CATEGORIA_LABELS: Record<string, string> = {
    digital: 'Digital', fisico: 'Físico', comunicacion: 'Comunicación', servicio: 'Servicio',
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/tickets" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">Tickets</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 font-medium" aria-current="page">{ticket.folio}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs text-gray-500">{ticket.folio}</p>
            <h1 className="mt-1 text-xl font-semibold text-gray-900">{ticket.titulo}</h1>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.prioridad} />
            <StatusBadge status={ticket.estado} />
          </div>
        </div>

        <div className="mt-5">
          <h2 className="text-xs font-medium uppercase tracking-wide text-gray-500">Descripción</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{ticket.descripcion}</p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-xs font-medium text-gray-500">Categoría</dt>
            <dd className="mt-0.5 text-gray-700 capitalize">{CATEGORIA_LABELS[ticket.categoria] ?? ticket.categoria}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Creado</dt>
            <dd className="mt-0.5 text-gray-700">{new Date(ticket.created_at).toLocaleDateString('es-MX')}</dd>
          </div>
          {ticket.resolved_at && (
            <div>
              <dt className="text-xs font-medium text-gray-500">Resuelto</dt>
              <dd className="mt-0.5 text-gray-700">{new Date(ticket.resolved_at).toLocaleDateString('es-MX')}</dd>
            </div>
          )}
          {ticket.url_afectada && (
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs font-medium text-gray-500">URL afectada</dt>
              <dd className="mt-0.5 break-all">
                <a
                  href={ticket.url_afectada}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                >
                  {ticket.url_afectada}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Resultados de auditoría ya enviados */}
      {existingSubmission && (
        <section aria-labelledby="resultados-heading" className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="resultados-heading" className="text-sm font-semibold text-blue-900">
              Resultados de auditoría enviados
            </h2>
            {existingSubmission.puntaje_wcag != null && (
              <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${
                existingSubmission.puntaje_wcag >= 0.9
                  ? 'bg-green-100 text-green-800'
                  : existingSubmission.puntaje_wcag >= 0.7
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {Math.round((existingSubmission.puntaje_wcag as number) * 100)}% de conformidad WCAG
              </span>
            )}
          </div>

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs font-medium text-blue-700 uppercase tracking-wide">Resumen ejecutivo</dt>
              <dd className="mt-1 whitespace-pre-wrap text-blue-900">{existingSubmission.resumen}</dd>
            </div>

            {/* Resultados WCAG estructurados */}
            {Array.isArray(existingSubmission.audit_wcag_results) &&
              (existingSubmission.audit_wcag_results as Array<{ criterio_codigo: string; resultado: string; notas: string | null }>).length > 0 && (
              <div>
                <dt className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                  Criterios WCAG evaluados
                </dt>
                <dd className="mt-2">
                  <WcagResultsSummary
                    results={existingSubmission.audit_wcag_results as Array<{ criterio_codigo: string; resultado: string; notas: string | null }>}
                  />
                </dd>
              </div>
            )}

            {existingSubmission.recomendaciones && (
              <div>
                <dt className="text-xs font-medium text-blue-700 uppercase tracking-wide">Recomendaciones</dt>
                <dd className="mt-1 whitespace-pre-wrap text-blue-900">{existingSubmission.recomendaciones}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-blue-700 uppercase tracking-wide">Enviado</dt>
              <dd className="mt-0.5 text-blue-800">
                {new Date(existingSubmission.submitted_at).toLocaleDateString('es-MX', { dateStyle: 'long' })}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* Formulario de resultados de auditoría para auditores asignados */}
      {canSubmitAudit && (
        <section aria-labelledby="auditoria-heading" className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 id="auditoria-heading" className="mb-1 text-base font-semibold text-gray-900">
            Enviar resultados de auditoría
          </h2>
          <p className="mb-5 text-sm text-gray-600">
            Estás asignado como auditor de este ticket. Completa el formulario con tus hallazgos.
          </p>
          <AuditResultForm ticketId={ticket.id} ticketFolio={ticket.folio} />
        </section>
      )}

      {/* Timeline de eventos */}
      {events && events.length > 0 && (
        <section aria-labelledby="timeline-heading" className="mt-6">
          <h2 id="timeline-heading" className="mb-3 text-sm font-semibold text-gray-900">Historial</h2>
          <ol className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm">
                <time className="shrink-0 text-xs text-gray-500 mt-0.5">
                  {new Date(event.created_at).toLocaleDateString('es-MX')}
                </time>
                <p className="text-gray-700">{event.evento}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
