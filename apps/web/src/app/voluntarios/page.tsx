import { Button } from '@olaac/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Programa de Auditores Voluntarios — OLAAC',
  description:
    'Únete al Observatorio como auditor voluntario de accesibilidad digital. Fórmate, certifícate y contribuye a un entorno digital más inclusivo en América Latina.',
}

const PASOS = [
  {
    numero: '01',
    titulo: 'Solicita unirte',
    descripcion:
      'Completa el formulario de solicitud y cuéntanos por qué quieres contribuir a la accesibilidad digital.',
  },
  {
    numero: '02',
    titulo: 'Cursa la ruta de formación',
    descripcion:
      'Completa los cursos de la Academia OLAAC: fundamentos WCAG, uso de tecnologías asistivas y metodología de auditoría.',
  },
  {
    numero: '03',
    titulo: 'Obtén tu certificación',
    descripcion:
      'Al completar la ruta, verifica tu certificación desde tu panel. Quedarás habilitado para recibir tickets de auditoría.',
  },
  {
    numero: '04',
    titulo: 'Audita y comparte resultados',
    descripcion:
      'Recibe tickets asignados, realiza la auditoría del sitio y envía tus hallazgos a través del sistema.',
  },
]

const REQUISITOS = [
  'Tener cuenta registrada en OLAAC',
  'Motivación genuina por la inclusión digital',
  'Disponibilidad de 2-4 horas semanales',
  'Completar la ruta de formación de la Academia',
]

export default async function VoluntariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si el usuario ya tiene una solicitud, ir directamente al panel
  let yaInscrito = false
  if (user) {
    const { data } = await supabase
      .from('volunteer_applications')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    yaInscrito = !!data
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <header className="mb-12 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[#005fcc]">
          Programa de auditores
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Conviértete en auditor voluntario de accesibilidad
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Forma parte del equipo que monitorea y mejora la accesibilidad digital en América Latina.
          Fórmate, certifícate y contribuye desde tu país.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {yaInscrito ? (
            <Button asChild>
              <Link href="/voluntarios/mi-panel">Ver mi panel de auditor</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={user ? '/voluntarios/inscribirse' : '/login?next=/voluntarios/inscribirse'}>
                Solicitar ser auditor
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="https://academy.olaac.org/cursos" target="_blank" rel="noopener noreferrer">
              Ver cursos de formación
            </Link>
          </Button>
        </div>
      </header>

      {/* Pasos */}
      <section aria-labelledby="pasos-heading" className="mb-14">
        <h2 id="pasos-heading" className="mb-8 text-center text-xl font-semibold text-gray-900">
          ¿Cómo funciona el programa?
        </h2>
        <ol className="grid gap-6 sm:grid-cols-2">
          {PASOS.map(paso => (
            <li
              key={paso.numero}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <span
                className="mb-3 block text-2xl font-bold text-[#005fcc]"
                aria-hidden="true"
              >
                {paso.numero}
              </span>
              <h3 className="text-base font-semibold text-gray-900">{paso.titulo}</h3>
              <p className="mt-2 text-sm text-gray-600">{paso.descripcion}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Requisitos */}
      <section
        aria-labelledby="requisitos-heading"
        className="mb-14 rounded-lg border border-gray-200 bg-gray-50 p-8"
      >
        <h2 id="requisitos-heading" className="mb-4 text-lg font-semibold text-gray-900">
          Requisitos para participar
        </h2>
        <ul className="space-y-3">
          {REQUISITOS.map(req => (
            <li key={req} className="flex items-start gap-3 text-sm text-gray-700">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-[#005fcc]"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              {req}
            </li>
          ))}
        </ul>
      </section>

      {/* Impacto */}
      <section aria-labelledby="impacto-heading" className="mb-14">
        <h2 id="impacto-heading" className="mb-6 text-xl font-semibold text-gray-900">
          Tu contribución importa
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { valor: '+50', label: 'sitios auditados en LATAM' },
            { valor: '14', label: 'países bajo monitoreo' },
            { valor: 'WCAG 2.2', label: 'estándar que aplicamos' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-6 text-center"
            >
              <p className="text-3xl font-bold text-[#005fcc]">{stat.valor}</p>
              <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section
        aria-labelledby="cta-heading"
        className="rounded-lg border border-[#005fcc]/20 bg-[#005fcc]/5 p-8 text-center"
      >
        <h2 id="cta-heading" className="text-lg font-semibold text-gray-900">
          ¿Listo para empezar?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          El proceso es completamente gratuito y puedes participar desde cualquier país de América Latina.
        </p>
        <div className="mt-6">
          {yaInscrito ? (
            <Button asChild>
              <Link href="/voluntarios/mi-panel">Ver mi panel de auditor</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={user ? '/voluntarios/inscribirse' : '/login?next=/voluntarios/inscribirse'}>
                Enviar mi solicitud
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
