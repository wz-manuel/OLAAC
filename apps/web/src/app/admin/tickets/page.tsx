import type { Metadata } from 'next'
import Link from 'next/link'

import { AssignTicketForm, UpdateStatusForm } from '@/components/admin/assign-ticket-form'
import { PriorityBadge } from '@/components/tickets/priority-badge'
import { StatusBadge } from '@/components/tickets/status-badge'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Tickets — Admin OLAAC' }

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>
}) {
  const { filtro } = await searchParams
  const supabase = await createClient()

  // Cargar auditores certificados/activos para el select de asignación
  const { data: auditorProfiles } = await supabase
    .from('auditor_profiles')
    .select('user_id, nombre_completo, pais')
    .in('estado', ['certificado', 'activo'])
    .order('nombre_completo')

  const auditors = auditorProfiles ?? []

  // Cargar tickets con filtro
  let ticketsQuery = supabase
    .from('tickets')
    .select('id, folio, titulo, categoria, prioridad, estado, assigned_to, url_afectada, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (filtro === 'sin_asignar') {
    ticketsQuery = ticketsQuery.is('assigned_to', null).not('estado', 'in', '("resuelto","cerrado")')
  } else if (filtro === 'asignados') {
    ticketsQuery = ticketsQuery.not('assigned_to', 'is', null)
  }

  const { data: tickets } = await ticketsQuery

  // Construir mapa auditor user_id → nombre
  const auditorMap = new Map(auditors.map(a => [a.user_id, a.nombre_completo]))

  const FILTROS = [
    { label: 'Todos',        value: undefined },
    { label: 'Sin asignar',  value: 'sin_asignar' },
    { label: 'Asignados',    value: 'asignados' },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tickets</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {auditors.length} auditor{auditors.length !== 1 ? 'es' : ''} disponible{auditors.length !== 1 ? 's' : ''} para asignación
          </p>
        </div>
        <Link
          href="/tickets/nuevo"
          className="rounded-md bg-[#005fcc] px-4 py-2 text-sm font-medium text-white hover:bg-[#004db3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
        >
          Nuevo ticket
        </Link>
      </div>

      {auditors.length === 0 && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No hay auditores certificados disponibles. Aprueba y certifica voluntarios primero.
        </div>
      )}

      {/* Filtros */}
      <nav aria-label="Filtrar tickets" className="mb-5">
        <ul className="flex gap-2">
          {FILTROS.map(f => {
            const isActive = filtro === f.value || (f.value === undefined && !filtro)
            const href = f.value ? `/admin/tickets?filtro=${f.value}` : '/admin/tickets'
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

      {!tickets?.length ? (
        <p className="py-12 text-center text-sm text-gray-500">No hay tickets con este filtro.</p>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <article
              key={ticket.id}
              className="rounded-lg border border-gray-200 bg-white p-5"
              aria-label={`Ticket ${ticket.folio}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-mono text-xs text-gray-400">{ticket.folio}</p>
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="mt-0.5 block text-sm font-medium text-gray-900 hover:text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                  >
                    {ticket.titulo}
                  </Link>
                  {ticket.url_afectada && (
                    <p className="mt-0.5 truncate text-xs text-gray-500 max-w-sm">{ticket.url_afectada}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={ticket.prioridad} />
                  <StatusBadge status={ticket.estado} />
                </div>
              </div>

              {/* Auditor asignado */}
              {ticket.assigned_to && (
                <p className="mb-3 text-xs text-gray-500">
                  Asignado a:{' '}
                  <strong className="text-gray-700">
                    {auditorMap.get(ticket.assigned_to) ?? ticket.assigned_to}
                  </strong>
                </p>
              )}

              {/* Controles */}
              <div className="flex flex-wrap gap-6 border-t border-gray-100 pt-4">
                {auditors.length > 0 && (
                  <AssignTicketForm
                    ticketId={ticket.id}
                    assignedUserId={ticket.assigned_to}
                    auditors={auditors}
                  />
                )}
                <UpdateStatusForm
                  ticketId={ticket.id}
                  currentStatus={ticket.estado}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
