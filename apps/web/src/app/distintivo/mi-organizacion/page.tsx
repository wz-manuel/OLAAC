import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@olaac/ui'

import { createClient } from '@/lib/supabase/server'
import { DistintivoBadge } from '@/components/distintivo/distintivo-badge'
import { SolicitudStatusBadge } from '@/components/distintivo/solicitud-status-badge'
import { BadgeEmbedWidget } from '@/components/distintivo/badge-embed-widget'
import { ProgramStages } from '@/components/distintivo/program-stages'

export const metadata: Metadata = {
  title: 'Mi Organización — Distintivo OLAAC',
}

export default async function MiOrganizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ enviada?: string }>
}) {
  const { enviada } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/distintivo/mi-organizacion')

  const { data: org } = await supabase
    .from('organizaciones_distintivo')
    .select('id, nombre_organizacion, tipo, sitio_web, pais, contacto_nombre, contacto_email')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!org) redirect('/distintivo/solicitar')

  const { data: solicitud } = await supabase
    .from('solicitudes_distintivo')
    .select('id, folio, nivel_solicitado, nivel_otorgado, estado, etapa_actual, fecha_solicitud, fecha_inicio_programa')
    .eq('organizacion_id', org.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let distintivo = null
  let etapasProgreso = null

  if (solicitud) {
    if (solicitud.estado === 'distintivo_emitido') {
      const { data } = await supabase
        .from('distintivos_emitidos')
        .select('folio, nivel, fecha_emision, fecha_vencimiento, vigente')
        .eq('solicitud_id', solicitud.id)
        .maybeSingle()
      distintivo = data
    }

    if (['en_programa', 'auditada', 'distintivo_emitido', 'aprobada_para_programa'].includes(solicitud.estado)) {
      const { data } = await supabase
        .from('etapas_progreso')
        .select('etapa, estado, fecha_completada')
        .eq('solicitud_id', solicitud.id)
        .order('created_at', { ascending: true })
      etapasProgreso = data
    }
  }

  const TIPO_LABEL: Record<string, string> = {
    publica: 'Pública', privada: 'Privada', mixta: 'Mixta', ong: 'OSC / ONG',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-[#005fcc]">
          Panel de organización
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{org.nombre_organizacion}</h1>
        <p className="text-sm text-gray-500">
          {TIPO_LABEL[org.tipo] ?? org.tipo} · {org.pais} ·{' '}
          <a href={org.sitio_web} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {org.sitio_web}
          </a>
        </p>
      </header>

      {/* Notificación de solicitud enviada */}
      {enviada === '1' && (
        <div role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Tu solicitud fue enviada correctamente. El equipo OLAAC la revisará pronto.
        </div>
      )}

      {/* Sin solicitud aún */}
      {!solicitud && (
        <div className="mb-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">Aún no has enviado ninguna solicitud de distintivo.</p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/distintivo/solicitar">Solicitar distintivo ahora</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Solicitud activa */}
      {solicitud && (
        <div className="space-y-8">
          {/* Estado de la solicitud */}
          <section aria-labelledby="solicitud-heading" className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="solicitud-heading" className="text-base font-semibold text-gray-900">
                  Solicitud{' '}
                  <span className="font-mono text-sm text-gray-500">{solicitud.folio}</span>
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enviada el{' '}
                  {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-MX', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SolicitudStatusBadge estado={solicitud.estado as Parameters<typeof SolicitudStatusBadge>[0]['estado']} />
                {solicitud.nivel_otorgado ? (
                  <DistintivoBadge nivel={solicitud.nivel_otorgado as 'oro' | 'platino' | 'diamante'} size="sm" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Nivel solicitado:</span>
                    <DistintivoBadge nivel={solicitud.nivel_solicitado as 'oro' | 'platino' | 'diamante'} size="sm" />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Distintivo emitido */}
          {distintivo && solicitud.nivel_otorgado && (
            <section aria-labelledby="badge-heading">
              <h2 id="badge-heading" className="mb-4 text-lg font-semibold text-gray-900">
                Tu distintivo
              </h2>
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                Distintivo vigente hasta{' '}
                <strong>
                  {new Date(distintivo.fecha_vencimiento).toLocaleDateString('es-MX', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </strong>
              </div>
              <BadgeEmbedWidget
                nivel={solicitud.nivel_otorgado as 'oro' | 'platino' | 'diamante'}
                folio={distintivo.folio}
                nombreOrganizacion={org.nombre_organizacion}
              />
            </section>
          )}

          {/* Progreso del programa */}
          {etapasProgreso && etapasProgreso.length > 0 && (
            <section aria-labelledby="progreso-heading">
              <h2 id="progreso-heading" className="mb-6 text-lg font-semibold text-gray-900">
                Progreso en el programa
              </h2>
              <ProgramStages progreso={etapasProgreso} />
            </section>
          )}
        </div>
      )}
    </div>
  )
}
