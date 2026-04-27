import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ApplicationForm } from '@/components/distintivo/application-form'
import { SolicitudNivelForm } from '@/components/distintivo/solicitud-nivel-form'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Solicitar Distintivo de Accesibilidad — OLAAC',
}

export default async function SolicitarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/distintivo/solicitar')

  const { data: org } = await supabase
    .from('organizaciones_distintivo')
    .select('id, nombre_organizacion')
    .eq('user_id', user.id)
    .maybeSingle()

  // Si ya tiene org, verificar si tiene solicitud activa
  if (org) {
    const { data: solActiva } = await supabase
      .from('solicitudes_distintivo')
      .select('id')
      .eq('organizacion_id', org.id)
      .not('estado', 'in', '(rechazada,revocada)')
      .maybeSingle()

    if (solActiva) redirect('/distintivo/mi-organizacion')
  }

  const { data: criterios } = await supabase
    .from('criterios_distintivo')
    .select('*')
    .order('min_porcentaje_accesibilidad', { ascending: true })

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#005fcc]">
          Distintivo de Accesibilidad
        </p>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {org ? `Solicitar distintivo — ${org.nombre_organizacion}` : 'Registrar tu organización'}
        </h1>
        <p className="mt-2 text-gray-600">
          {org
            ? 'Selecciona el nivel al que aspiras. El equipo OLAAC revisará tu solicitud e iniciará el programa.'
            : 'Primero necesitamos conocer a tu organización. Completa los siguientes datos para continuar.'}
        </p>
      </header>

      {/* Indicador de pasos */}
      <nav aria-label="Pasos de la solicitud" className="mb-8">
        <ol className="flex gap-2 text-sm">
          <li className={`flex items-center gap-1.5 font-medium ${!org ? 'text-[#005fcc]' : 'text-gray-500 line-through'}`}>
            <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-current text-xs text-white">1</span>
            Datos de la organización
          </li>
          <li aria-hidden="true" className="text-gray-300">→</li>
          <li className={`flex items-center gap-1.5 font-medium ${org ? 'text-[#005fcc]' : 'text-gray-500'}`}>
            <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-current text-xs text-white">2</span>
            Nivel solicitado
          </li>
        </ol>
      </nav>

      {!org ? (
        <ApplicationForm />
      ) : (
        <SolicitudNivelForm criterios={criterios ?? []} orgNombre={org.nombre_organizacion} />
      )}
    </div>
  )
}
