import type { Metadata } from 'next'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Voluntarios — Admin OLAAC' }

const ESTADO_STYLES: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  aprobado:  'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
}

const AUDITOR_STATUS: Record<string, string> = {
  en_formacion: 'En formación',
  certificado:  'Certificado',
  activo:       'Activo',
  inactivo:     'Inactivo',
  suspendido:   'Suspendido',
}

export default async function AdminVoluntariosPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>
}) {
  const { filtro } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('volunteer_applications')
    .select('id, user_id, nombre_completo, pais, email_contacto, estado, created_at')
    .order('created_at', { ascending: false })

  if (filtro === 'pendiente' || filtro === 'aprobado' || filtro === 'rechazado') {
    query = query.eq('estado', filtro)
  }

  const { data: applications } = await query

  // Cargar perfiles de auditores para mostrar estado de formación
  const { data: profiles } = await supabase
    .from('auditor_profiles')
    .select('user_id, estado, certified_at')

  const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p]))

  const FILTROS = [
    { label: 'Todos',     value: undefined },
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Aprobados',  value: 'aprobado' },
    { label: 'Rechazados', value: 'rechazado' },
  ]

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Voluntarios</h2>
        <p className="text-sm text-gray-500">{applications?.length ?? 0} solicitudes</p>
      </div>

      {/* Filtros */}
      <nav aria-label="Filtrar solicitudes" className="mb-5">
        <ul className="flex gap-2">
          {FILTROS.map(f => {
            const isActive = filtro === f.value || (f.value === undefined && !filtro)
            const href = f.value ? `/admin/voluntarios?filtro=${f.value}` : '/admin/voluntarios'
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

      {!applications?.length ? (
        <p className="py-12 text-center text-sm text-gray-500">No hay solicitudes con este filtro.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table
            className="min-w-full divide-y divide-gray-200"
            aria-label="Lista de solicitudes de voluntarios"
          >
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Nombre</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden sm:table-cell">País</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hidden md:table-cell">Contacto</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Solicitud</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Perfil</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {applications.map(app => {
                const profile = profileMap.get(app.user_id)
                return (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <Link
                        href={`/admin/voluntarios/${app.user_id}`}
                        className="hover:text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                      >
                        {app.nombre_completo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{app.pais}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{app.email_contacto ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_STYLES[app.estado] ?? 'bg-gray-100 text-gray-700'}`}>
                        {app.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {profile ? (
                        <span className="font-medium">
                          {AUDITOR_STATUS[profile.estado] ?? profile.estado}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(app.created_at).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
