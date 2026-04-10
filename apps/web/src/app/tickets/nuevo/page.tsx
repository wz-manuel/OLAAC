import { redirect } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { CreateTicketForm } from '@/components/tickets/create-ticket-form'

export const metadata = { title: 'Nuevo reporte de accesibilidad' }

export default async function NuevoTicketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/tickets/nuevo')

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/tickets" className="text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
          ← Volver a tickets
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Nuevo reporte de accesibilidad</h1>
        <p className="mt-1 text-sm text-gray-500">
          Describe la barrera de accesibilidad que encontraste. Recibirás un folio de seguimiento.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <CreateTicketForm />
      </div>
    </div>
  )
}
