import { Button } from '@olaac/ui'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { StatusBadge } from '@/components/tickets/status-badge'
import { CertificationChecker } from '@/components/voluntarios/certification-checker'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Mi panel de auditor — OLAAC',
}

// ─── Etiquetas de estado legibles ────────────────────────────────────────────

const AUDITOR_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  en_formacion: { label: 'En formación',  color: 'bg-blue-100 text-blue-800' },
  certificado:  { label: 'Certificado',   color: 'bg-green-100 text-green-800' },
  activo:       { label: 'Activo',        color: 'bg-emerald-100 text-emerald-800' },
  inactivo:     { label: 'Inactivo',      color: 'bg-gray-100 text-gray-700' },
  suspendido:   { label: 'Suspendido',    color: 'bg-red-100 text-red-800' },
}

const APPLICATION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendiente: { label: 'En revisión', color: 'bg-amber-100 text-amber-800' },
  aprobado:  { label: 'Aprobada',    color: 'bg-green-100 text-green-800' },
  rechazado: { label: 'Rechazada',   color: 'bg-red-100 text-red-800' },
}

// ─── Sub-componentes de servidor ─────────────────────────────────────────────

function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

export default async function MiPanelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/voluntarios/mi-panel')

  const [
    { data: application },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('volunteer_applications')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('auditor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  // ── Sin solicitud ────────────────────────────────────────────────────────
  if (!application) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <PanelHeader title="Panel de auditor" />
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">Aún no has enviado tu solicitud para ser auditor voluntario.</p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/voluntarios/inscribirse">Enviar solicitud</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const appStatus = APPLICATION_STATUS_LABELS[application.estado] ?? { label: application.estado, color: 'bg-gray-100 text-gray-700' }

  // ── Solicitud rechazada ─────────────────────────────────────────────────
  if (application.estado === 'rechazado') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <PanelHeader title="Panel de auditor" />
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <StatusChip {...appStatus} />
            <p className="text-sm text-red-700 font-medium">Tu solicitud no fue aprobada en esta ocasión.</p>
          </div>
          <p className="mt-3 text-sm text-red-600">
            Si tienes dudas, puedes escribirnos a través del formulario de{' '}
            <Link href="/contacto" className="underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              contacto
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  // ── Solicitud pendiente (sin perfil aún) ────────────────────────────────
  if (application.estado === 'pendiente' && !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <PanelHeader title="Panel de auditor" />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3">
            <StatusChip {...appStatus} />
            <p className="text-sm text-amber-800 font-medium">Tu solicitud está siendo revisada por el equipo OLAAC.</p>
          </div>
          <p className="mt-3 text-sm text-amber-700">
            Recibirás un correo electrónico cuando tu solicitud sea procesada. El proceso suele tomar entre 3 y 7 días hábiles.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-amber-600 font-medium">Solicitud enviada:</dt>
              <dd className="text-amber-800">{new Date(application.created_at).toLocaleDateString('es-MX', { dateStyle: 'long' })}</dd>
            </div>
          </dl>
        </div>
      </div>
    )
  }

  // ── Perfil activo ───────────────────────────────────────────────────────
  if (!profile) return null

  const profileStatus = AUDITOR_STATUS_LABELS[profile.estado] ?? { label: profile.estado, color: 'bg-gray-100 text-gray-700' }
  const isCertified   = profile.estado === 'certificado' || profile.estado === 'activo'

  // Cargar datos adicionales según el estado del perfil
  const [pathResult, enrollmentsResult, assignedTicketsResult] = await Promise.all([
    supabase
      .from('auditor_learning_path')
      .select('id, orden, obligatorio, courses(id, titulo, slug, descripcion)')
      .order('orden'),

    supabase
      .from('enrollments')
      .select('course_id, estado, progress')
      .eq('user_id', user.id),

    isCertified
      ? supabase
          .from('tickets')
          .select('id, folio, titulo, estado, prioridad, created_at, url_afectada')
          .eq('assigned_to', user.id)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as Array<{ id: string; folio: string; titulo: string; estado: string; prioridad: string; created_at: string; url_afectada: string | null }> | null }),
  ])

  const pathCourses    = pathResult.data ?? []
  const enrollmentMap  = new Map((enrollmentsResult.data ?? []).map(e => [e.course_id, e]))
  const assignedTickets = assignedTicketsResult.data ?? []

  // Calcular progreso en la ruta
  const totalObligatorios  = pathCourses.filter(p => p.obligatorio).length
  const completadosCount   = pathCourses.filter(p => {
    const enrollment = enrollmentMap.get(p.courses?.id ?? '')
    return enrollment?.estado === 'completado'
  }).length

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PanelHeader title="Mi panel de auditor" />

      {/* Tarjeta de perfil */}
      <section aria-labelledby="perfil-heading" className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="perfil-heading" className="text-lg font-semibold text-gray-900">
              {profile.nombre_completo}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">{profile.pais}</p>
          </div>
          <StatusChip {...profileStatus} />
        </div>
        {profile.certified_at && (
          <p className="mt-3 text-xs text-gray-500">
            Certificado el{' '}
            {new Date(profile.certified_at).toLocaleDateString('es-MX', { dateStyle: 'long' })}
          </p>
        )}
      </section>

      {/* Ruta de formación */}
      {pathCourses.length > 0 && (
        <section aria-labelledby="ruta-heading" className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="ruta-heading" className="text-base font-semibold text-gray-900">
              Ruta de formación
            </h2>
            <span className="text-sm text-gray-500">
              {completadosCount} / {totalObligatorios} completados
            </span>
          </div>

          {/* Barra de progreso global */}
          <div
            role="progressbar"
            aria-valuenow={totalObligatorios > 0 ? Math.round((completadosCount / totalObligatorios) * 100) : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso en la ruta: ${completadosCount} de ${totalObligatorios} cursos completados`}
            className="mb-5 h-2 w-full overflow-hidden rounded-full bg-gray-200"
          >
            <div
              className="h-full rounded-full bg-[#005fcc] transition-all duration-500"
              style={{ width: totalObligatorios > 0 ? `${(completadosCount / totalObligatorios) * 100}%` : '0%' }}
              aria-hidden="true"
            />
          </div>

          <ol className="space-y-3">
            {pathCourses.map((item, idx) => {
              const course     = item.courses as { id: string; titulo: string; slug: string; descripcion: string | null } | null
              if (!course) return null
              const enrollment = enrollmentMap.get(course.id)
              const completado = enrollment?.estado === 'completado'
              const progreso   = enrollment?.progress ?? 0

              return (
                <li
                  key={item.id}
                  className={`flex items-start gap-4 rounded-lg border p-4 ${
                    completado ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      completado
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                    aria-hidden="true"
                  >
                    {completado ? '✓' : idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900">{course.titulo}</h3>
                      {item.obligatorio && (
                        <span className="text-xs text-gray-500">Obligatorio</span>
                      )}
                    </div>
                    {course.descripcion && (
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{course.descripcion}</p>
                    )}
                    {!completado && progreso > 0 && (
                      <p className="mt-1 text-xs text-[#005fcc]">{progreso}% completado</p>
                    )}
                    {completado && (
                      <p className="mt-1 text-xs text-green-700 font-medium">Completado</p>
                    )}
                  </div>
                  {!completado && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_ACADEMY_URL ?? 'http://localhost:3001'}/cursos/${course.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                      aria-label={`Ir al curso ${course.titulo} en la Academia`}
                    >
                      Ir al curso →
                    </a>
                  )}
                </li>
              )
            })}
          </ol>

          {/* Verificar certificación */}
          {!isCertified && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                ¿Completaste todos los cursos?
              </h3>
              <CertificationChecker />
            </div>
          )}
        </section>
      )}

      {/* Sin ruta configurada */}
      {pathCourses.length === 0 && !isCertified && (
        <section className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-800">
            El equipo OLAAC aún está configurando la ruta de formación. Te notificaremos cuando esté lista.
          </p>
        </section>
      )}

      {/* Tickets asignados */}
      {isCertified && (
        <section aria-labelledby="tickets-heading" className="mb-8">
          <h2 id="tickets-heading" className="mb-4 text-base font-semibold text-gray-900">
            Tickets asignados
          </h2>

          {assignedTickets.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
              <p className="text-sm text-gray-500">
                No tienes tickets asignados en este momento. El equipo OLAAC te asignará auditorías próximamente.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {assignedTickets.map(ticket => (
                <li key={ticket.id} className="rounded-lg border border-gray-200 bg-white">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="block p-4 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#005fcc] rounded-lg"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs text-gray-500">{ticket.folio}</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-900">{ticket.titulo}</p>
                        {ticket.url_afectada && (
                          <p className="mt-0.5 truncate text-xs text-gray-500">{ticket.url_afectada}</p>
                        )}
                      </div>
                      <StatusBadge status={ticket.estado as Parameters<typeof StatusBadge>[0]['status']} />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Asignado el{' '}
                      {new Date(ticket.created_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  )
}

function PanelHeader({ title }: { title: string }) {
  return (
    <header className="mb-8">
      <nav aria-label="Migas de pan" className="mb-4 text-sm text-gray-500">
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
          <li className="font-medium text-gray-900" aria-current="page">Mi panel</li>
        </ol>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    </header>
  )
}
