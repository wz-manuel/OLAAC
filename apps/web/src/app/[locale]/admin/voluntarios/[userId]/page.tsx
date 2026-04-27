import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ApproveRejectButtons } from '@/components/admin/approve-reject-buttons'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Detalle de voluntario — Admin OLAAC' }

const AUDITOR_STATUS_STYLES: Record<string, string> = {
  en_formacion: 'bg-blue-100 text-blue-800',
  certificado:  'bg-green-100 text-green-800',
  activo:       'bg-emerald-100 text-emerald-800',
  inactivo:     'bg-gray-100 text-gray-600',
  suspendido:   'bg-red-100 text-red-800',
}

export default async function AdminVoluntarioDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()

  const [
    { data: application },
    { data: profile },
    { data: pathCourses },
  ] = await Promise.all([
    supabase
      .from('volunteer_applications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('auditor_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('auditor_learning_path')
      .select('course_id, obligatorio, courses(id, titulo, slug)')
      .order('orden'),
  ])

  if (!application) notFound()

  // Enrollments del usuario para los cursos del path
  const courseIds = (pathCourses ?? []).map(p => p.course_id)
  const { data: enrollments } = courseIds.length
    ? await supabase
        .from('enrollments')
        .select('course_id, estado, progress')
        .eq('user_id', userId)
        .in('course_id', courseIds)
    : { data: [] }

  const enrollMap = new Map((enrollments ?? []).map(e => [e.course_id, e]))

  // Audit submissions del auditor
  const { data: submissions } = profile
    ? await supabase
        .from('audit_submissions')
        .select('id, resumen, submitted_at, tickets(folio)')
        .eq('auditor_id', profile.id)
        .order('submitted_at', { ascending: false })
        .limit(10)
    : { data: [] }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/admin/voluntarios" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              Voluntarios
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-900" aria-current="page">{application.nombre_completo}</li>
        </ol>
      </nav>

      {/* Solicitud */}
      <section aria-labelledby="solicitud-heading" className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h2 id="solicitud-heading" className="text-lg font-semibold text-gray-900">{application.nombre_completo}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{application.pais}</p>
            {application.email_contacto && (
              <a
                href={`mailto:${application.email_contacto}`}
                className="mt-0.5 block text-sm text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
              >
                {application.email_contacto}
              </a>
            )}
          </div>
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            application.estado === 'pendiente' ? 'bg-amber-100 text-amber-800' :
            application.estado === 'aprobado'  ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {application.estado}
          </span>
        </div>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Motivación</dt>
            <dd className="mt-1 whitespace-pre-wrap text-gray-700">{application.motivacion}</dd>
          </div>
          {application.experiencia_previa && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Experiencia previa</dt>
              <dd className="mt-1 whitespace-pre-wrap text-gray-700">{application.experiencia_previa}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Solicitud enviada</dt>
            <dd className="mt-1 text-gray-700">
              {new Date(application.created_at).toLocaleDateString('es-MX', { dateStyle: 'long' })}
            </dd>
          </div>
        </dl>

        {application.estado === 'pendiente' && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <ApproveRejectButtons
              applicationId={application.id}
              nombreCompleto={application.nombre_completo}
              pais={application.pais}
            />
          </div>
        )}
      </section>

      {/* Perfil de auditor */}
      {profile && (
        <section aria-labelledby="perfil-heading" className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 id="perfil-heading" className="mb-4 text-base font-semibold text-gray-900">Perfil de auditor</h2>
          <div className="flex items-center gap-3">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${AUDITOR_STATUS_STYLES[profile.estado] ?? 'bg-gray-100 text-gray-700'}`}>
              {profile.estado}
            </span>
            {profile.certified_at && (
              <span className="text-xs text-gray-500">
                Certificado el {new Date(profile.certified_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Progreso en la ruta de formación */}
      {profile && pathCourses && pathCourses.length > 0 && (
        <section aria-labelledby="ruta-heading" className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 id="ruta-heading" className="mb-4 text-base font-semibold text-gray-900">
            Progreso en la ruta de formación
          </h2>
          <ol className="space-y-2">
            {pathCourses.map(item => {
              const course = item.courses as { id: string; titulo: string; slug: string } | null
              if (!course) return null
              const enrollment = enrollMap.get(item.course_id)
              const completado  = enrollment?.estado === 'completado'
              const progreso    = enrollment?.progress ?? 0

              return (
                <li key={item.course_id} className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      completado ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                    aria-hidden="true"
                  >
                    {completado ? '✓' : '○'}
                  </span>
                  <span className={`flex-1 ${completado ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {course.titulo}
                    {item.obligatorio && <span className="ml-1 text-xs text-gray-500">(obligatorio)</span>}
                  </span>
                  {!completado && progreso > 0 && (
                    <span className="text-xs text-[#005fcc]">{Math.round(progreso)}%</span>
                  )}
                  {!completado && !enrollment && (
                    <span className="text-xs text-gray-500">Sin iniciar</span>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {/* Auditorías enviadas */}
      {submissions && submissions.length > 0 && (
        <section aria-labelledby="auditorias-heading" className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 id="auditorias-heading" className="mb-4 text-base font-semibold text-gray-900">
            Auditorías enviadas
          </h2>
          <ol className="space-y-3">
            {submissions.map(sub => {
              const ticket = sub.tickets as { folio: string } | null
              return (
                <li key={sub.id} className="rounded-md border border-gray-100 p-3 text-sm">
                  {ticket && (
                    <p className="font-mono text-xs text-gray-500 mb-1">{ticket.folio}</p>
                  )}
                  <p className="text-gray-700 line-clamp-2">{sub.resumen}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(sub.submitted_at).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                  </p>
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </div>
  )
}
