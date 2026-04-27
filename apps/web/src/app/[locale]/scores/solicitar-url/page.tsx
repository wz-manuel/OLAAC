import Link from 'next/link'
import { redirect } from 'next/navigation'

import { SolicitarUrlForm } from '@/components/scores/solicitar-url-form'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Solicitar auditoría de URL' }

export default async function SolicitarUrlPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/scores/solicitar-url')

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href="/scores"
          className="text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          ← Volver a scores
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">Solicitar auditoría de URL</h1>
        <p className="mt-1 text-sm text-gray-500">
          ¿Conoces un sitio que debería ser auditado? Envía tu solicitud y el equipo OLAAC la revisará.
          Se generará un ticket de seguimiento con folio único.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SolicitarUrlForm />
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Las solicitudes son revisadas por el equipo OLAAC. Recibirás actualizaciones a través del sistema de tickets.
      </p>
    </div>
  )
}
