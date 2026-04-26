import { Button } from '@olaac/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

import { BadgeLevelCard } from '@/components/distintivo/badge-level-card'
import { ProgramStages } from '@/components/distintivo/program-stages'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Distintivo de Accesibilidad — OLAAC',
  description:
    'Obtén el Distintivo de Accesibilidad OLAAC. Programa de certificación con plan de inicio gratuito y becas de descuento para organizaciones de América Latina.',
}

const PLANES = [
  {
    id: 'inicio',
    nombre: 'Plan de Inicio',
    precio: 'Gratis',
    subprecio: 'sin costo, siempre',
    descripcion:
      'Ideal para organizaciones que quieren comenzar el camino hacia la accesibilidad. Incluye las etapas de concientización y capacitación, un diagnóstico básico y acceso al soporte comunitario.',
    items: [
      'Etapas de concientización y capacitación',
      'Diagnóstico básico con Lighthouse',
      'Acceso a cursos de la Academia OLAAC',
      'Soporte comunitario',
    ],
    cta: 'Solicitar plan de inicio',
    ctaVariant: 'outline' as const,
    destacado: false,
  },
  {
    id: 'completo',
    nombre: 'Plan Completo',
    precio: 'Desde USD 350',
    subprecio: 'pago único por proceso',
    descripcion:
      'El programa completo de 7 etapas para obtener el Distintivo (Oro, Platino o Diamante). Incluye auditoría independiente, seguimiento dedicado y emisión del sello verificado.',
    items: [
      'Las 7 etapas del programa',
      'Auditoría por auditores certificados',
      'Soporte dedicado vía tickets',
      'Distintivo con verificación pública',
      'Vigencia 12 a 24 meses según nivel',
    ],
    cta: 'Iniciar proceso completo',
    ctaVariant: 'default' as const,
    destacado: true,
  },
  {
    id: 'beca',
    nombre: 'Beca OLAAC',
    precio: 'Hasta 100 % off',
    subprecio: 'sujeto a aprobación',
    descripcion:
      'Para ONGs, organizaciones de personas con discapacidad y organismos públicos con recursos limitados. Aplica a una beca de descuento y accede al programa completo sin costo o con reducción significativa.',
    items: [
      'Descuento del 50 % al 100 %',
      'Mismo programa que el Plan Completo',
      'Aprobación en 5 días hábiles',
      'Prioridad para organizaciones de PcD',
    ],
    cta: 'Aplicar a una beca',
    ctaVariant: 'outline' as const,
    destacado: false,
  },
]

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

      {/* Planes */}
      <section aria-labelledby="planes-heading" className="mb-16">
        <h2 id="planes-heading" className="mb-2 text-2xl font-bold text-gray-900">
          Planes de acceso
        </h2>
        <p className="mb-8 text-gray-600">
          El programa tiene un costo que cubre la auditoría, el acompañamiento y la
          emisión del distintivo. Si tu organización no puede asumir ese costo, tienes
          dos alternativas sin pagar.
        </p>
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANES.map((plan) => (
            <div
              key={plan.id}
              className={[
                'relative flex flex-col rounded-xl border p-6',
                plan.destacado
                  ? 'border-[#005fcc] ring-1 ring-[#005fcc] bg-[#005fcc]/5'
                  : 'border-gray-200 bg-white',
              ].join(' ')}
            >
              {plan.destacado && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#005fcc] px-3 py-0.5 text-xs font-semibold text-white">
                  Más completo
                </span>
              )}
              <p className="text-xs font-semibold uppercase tracking-wide text-[#005fcc]">
                {plan.nombre}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-gray-900">{plan.precio}</p>
              <p className="text-xs text-gray-500">{plan.subprecio}</p>
              <p className="mt-4 flex-1 text-sm text-gray-600">{plan.descripcion}</p>
              <ul className="mt-5 space-y-2">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 shrink-0 text-[#005fcc]" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild variant={plan.ctaVariant} className="w-full">
                  <Link href={plan.id === 'beca' ? '/contacto?asunto=beca-distintivo' : ctaHref}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-gray-500">
          ¿Tu organización financia becas para otras?{' '}
          <Link href="/donativos" className="text-[#005fcc] underline-offset-2 hover:underline">
            Conoce cómo apoyar el fondo de becas →
          </Link>
        </p>
      </section>

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
          Empieza con el plan gratuito o solicita una beca si tu organización no tiene
          recursos. Acompañamos a cada organización durante todo el programa.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contacto?asunto=beca-distintivo">Solicitar beca</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
