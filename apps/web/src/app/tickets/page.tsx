import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@olaac/ui'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/tickets/status-badge'
import { PriorityBadge } from '@/components/tickets/priority-badge'

export const metadata = { title: 'Tickets de accesibilidad' }

export default async function TicketsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/tickets')

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, folio, titulo, categoria, prioridad, estado, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tickets de accesibilidad</h1>
          <p className="mt-1 text-sm text-gray-500">Reportes abiertos en el sistema</p>
        </div>
        <Button asChild>
          <Link href="/tickets/nuevo">Nuevo reporte</Link>
        </Button>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error al cargar tickets: {error.message}
        </p>
      )}

      {!tickets?.length ? (
        <p className="py-12 text-center text-sm text-gray-500">No hay tickets registrados aún.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200" aria-label="Lista de tickets de accesibilidad">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Folio</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Título</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden sm:table-cell">Categoría</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Prioridad</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Estado</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-gray-500">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                    >
                      {ticket.folio}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link href={`/tickets/${ticket.id}`} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
                      {ticket.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize hidden sm:table-cell">{ticket.categoria}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={ticket.prioridad} /></td>
                  <td className="px-4 py-3"><StatusBadge status={ticket.estado} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                    {new Date(ticket.created_at).toLocaleDateString('es-MX')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
