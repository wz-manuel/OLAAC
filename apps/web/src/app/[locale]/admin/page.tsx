import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Resumen — Admin OLAAC' }

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const [
    { count: pendingApps },
    { count: enFormacion },
    { count: certificados },
    { count: ticketsSinAsignar },
    { count: ticketsEnProgreso },
  ] = await Promise.all([
    supabase
      .from('volunteer_applications')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente'),
    supabase
      .from('auditor_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'en_formacion'),
    supabase
      .from('auditor_profiles')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['certificado', 'activo']),
    supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .is('assigned_to', null)
      .not('estado', 'in', '("resuelto","cerrado")'),
    supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .not('assigned_to', 'is', null)
      .not('estado', 'in', '("resuelto","cerrado","en_revision")'),
  ])

  const KPIs = [
    {
      label: 'Solicitudes pendientes',
      value: pendingApps ?? 0,
      href: '/admin/voluntarios?filtro=pendiente',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      valueColor: 'text-amber-700',
    },
    {
      label: 'Auditores en formación',
      value: enFormacion ?? 0,
      href: '/admin/voluntarios?filtro=aprobado',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
      valueColor: 'text-blue-700',
    },
    {
      label: 'Auditores certificados',
      value: certificados ?? 0,
      href: '/admin/voluntarios?filtro=certificado',
      color: 'bg-green-50 border-green-200 text-green-900',
      valueColor: 'text-green-700',
    },
    {
      label: 'Tickets sin asignar',
      value: ticketsSinAsignar ?? 0,
      href: '/admin/tickets?filtro=sin_asignar',
      color: 'bg-red-50 border-red-200 text-red-900',
      valueColor: 'text-red-700',
    },
    {
      label: 'Tickets en progreso',
      value: ticketsEnProgreso ?? 0,
      href: '/admin/tickets',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      valueColor: 'text-purple-700',
    },
  ]

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Resumen</h2>

      <section aria-label="Indicadores clave">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {KPIs.map(kpi => (
            <li key={kpi.label}>
              <Link
                href={kpi.href}
                className={`block rounded-lg border p-5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded-lg ${kpi.color}`}
              >
                <p className={`text-3xl font-bold ${kpi.valueColor}`}>{kpi.value}</p>
                <p className="mt-1 text-sm font-medium">{kpi.label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="acciones-heading" className="mt-10">
        <h2 id="acciones-heading" className="mb-4 text-base font-semibold text-gray-900">
          Accesos rápidos
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { href: '/admin/voluntarios',       label: 'Revisar solicitudes',      desc: 'Aprueba o rechaza solicitudes de nuevos voluntarios' },
            { href: '/admin/ruta-de-formacion', label: 'Diseñar ruta de formación', desc: 'Selecciona los cursos requeridos para la certificación' },
            { href: '/admin/tickets',           label: 'Asignar auditorías',        desc: 'Distribuye tickets entre los auditores certificados' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-gray-200 bg-white p-5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded-lg"
            >
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
