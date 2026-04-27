import { Button } from '@olaac/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { PriorityBadge } from '@/components/tickets/priority-badge'
import { StatusBadge } from '@/components/tickets/status-badge'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Mis reportes' }

export default async function MisReportesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/tickets/mis-reportes')

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, folio, titulo, prioridad, estado, created_at, resolved_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mis reportes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {tickets?.length ?? 0} reporte{tickets?.length !== 1 ? 's' : ''} enviado{tickets?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/tickets/nuevo">Nuevo reporte</Link>
        </Button>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error al cargar reportes: {error.message}
        </p>
      )}

      {!tickets?.length ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">Aún no has enviado ningún reporte.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/tickets/nuevo">Crear tu primer reporte</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3" aria-label="Lista de mis reportes">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/tickets/${ticket.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-gray-500">{ticket.folio}</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-gray-900">{ticket.titulo}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={ticket.prioridad} />
                    <StatusBadge status={ticket.estado} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Creado el {new Date(ticket.created_at).toLocaleDateString('es-MX')}
                  {ticket.resolved_at && ` · Resuelto el ${new Date(ticket.resolved_at).toLocaleDateString('es-MX')}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
