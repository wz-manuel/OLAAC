import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ApplicationForm } from '@/components/voluntarios/application-form'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Solicitar ser auditor voluntario — OLAAC',
  description: 'Envía tu solicitud para unirte al programa de auditores voluntarios de accesibilidad de OLAAC.',
}

export default async function InscribirsePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/voluntarios/inscribirse')

  // Si ya tiene solicitud, redirigir al panel
  const { data: application } = await supabase
    .from('volunteer_applications')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (application) redirect('/voluntarios/mi-panel')

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              href="/voluntarios"
              className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
            >
              Programa de auditores
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-900" aria-current="page">Solicitud</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Solicitar ser auditor voluntario</h1>
        <p className="mt-2 text-gray-600">
          Cuéntanos quién eres y por qué quieres contribuir a la accesibilidad digital en América Latina.
          El equipo OLAAC revisará tu solicitud y te contactará por correo electrónico.
        </p>
      </header>

      <ApplicationForm />
    </div>
  )
}
