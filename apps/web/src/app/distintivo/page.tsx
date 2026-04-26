import { Button } from '@olaac/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

import { BadgeLevelCard } from '@/components/distintivo/badge-level-card'
import { ProgramStages } from '@/components/distintivo/program-stages'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Distintivo de Accesibilidad — OLAAC',
  description:
    'Obtén el Distintivo de Accesibilidad OLAAC. Un reconocimiento para organizaciones públicas y privadas comprometidas con la inclusión digital en América Latina.',
}

export default async function DistintivoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: criterios } = await supabase
    .from('criterios_distintivo')
    .select('*')
    .order('min_porcentaje_accesibilidad', { ascending: true })

  let yaRegistrada = false
  let solicitudActiva: { folio: string; estado: string } | null = null

  if (user) {
    const { data: org } = await supabase
      .from('organizaciones_distintivo')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (org) {
      yaRegistrada = true
      const { data: sol } = await supabase
        .from('solicitudes_distintivo')
        .select('folio, estado')
        .eq('organizacion_id', org.id)
        .not('estado', 'in', '(rechazada,revocada)')
        .maybeSingle()
      solicitudActiva = sol ?? null
    }
  }

  const ctaHref = yaRegistrada
    ? '/distintivo/mi-organizacion'
    : user
    ? '/distintivo/solicitar'
    : '/login?next=/distintivo/solicitar'

  const ctaLabel = yaRegistrada
    ? (solicitudActiva ? 'Ver mi solicitud' : 'Iniciar solicitud')
    : 'Registrar mi organización'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <header className="mb-14 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[#005fcc]">
          Programa de certificación
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Distintivo de Accesibilidad OLAAC
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Reconocimiento para organizaciones públicas y privadas que demuestran un compromiso
          real con la inclusión y la accesibilidad digital en América Latina.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/distintivo/verificar">Verificar un distintivo</Link>
          </Button>
        </div>
      </header>

      {/* Niveles */}
      {criterios && criterios.length > 0 && (
        <section aria-labelledby="niveles-heading" className="mb-16">
          <h2 id="niveles-heading" className="mb-2 text-2xl font-bold text-gray-900">
            Niveles del distintivo
          </h2>
          <p className="mb-8 text-gray-600">
            Los niveles se distinguen por el número de tareas, flujos y experiencias accesibles
            que ofrece la organización, evaluados durante la auditoría.
          </p>
          <div className="grid gap-6 lg:grid-cols-1">
            {criterios.map(c => (
              <BadgeLevelCard key={c.nivel} criterio={c} />
            ))}
          </div>
        </section>
      )}

      {/* Programa */}
      <section aria-labelledby="programa-heading" className="mb-16">
        <h2 id="programa-heading" className="mb-2 text-2xl font-bold text-gray-900">
          El programa de certificación
        </h2>
        <p className="mb-8 text-gray-600">
          Cada organización pasa por siete etapas diseñadas para transformar el compromiso
          con la accesibilidad en una práctica institucional sostenida.
        </p>
        <ProgramStages />
      </section>

      {/* Integraciones */}
      <section aria-labelledby="integraciones-heading" className="mb-16">
        <h2 id="integraciones-heading" className="mb-6 text-xl font-semibold text-gray-900">
          Ecosistema OLAAC integrado
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: '🎓',
              titulo: 'Academia OLAAC',
              descripcion: 'La etapa de capacitación usa los cursos de la Academia para formar al equipo en WCAG 2.2 y buenas prácticas.',
              href: 'https://academy.olaac.org',
            },
            {
              icon: '🎟',
              titulo: 'Sistema de Tickets',
              descripcion: 'La auditoría y la remediación generan tickets que permiten dar seguimiento a cada barrera de accesibilidad encontrada.',
              href: '/tickets',
            },
            {
              icon: '🔍',
              titulo: 'Auditores Voluntarios',
              descripcion: 'Auditores certificados de nuestra red de voluntarios realizan la evaluación independiente de la organización.',
              href: '/voluntarios',
            },
          ].map(item => (
            <Link
              key={item.titulo}
              href={item.href}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
            >
              <span className="text-3xl" aria-hidden="true">{item.icon}</span>
              <h3 className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-[#005fcc]">
                {item.titulo}
              </h3>
              <p className="mt-1.5 text-sm text-gray-600">{item.descripcion}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section
        aria-labelledby="cta-heading"
        className="rounded-xl border border-[#005fcc]/20 bg-[#005fcc]/5 p-8 text-center"
      >
        <h2 id="cta-heading" className="text-xl font-bold text-gray-900">
          ¿Tu organización está lista para el distintivo?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          El proceso es completamente gratuito. Acompañamos a cada organización durante todo
          el programa hasta la emisión del sello verificado.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
