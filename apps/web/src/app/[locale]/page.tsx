import { Button } from '@olaac/ui'
import type { Metadata } from 'next'
import Link from 'next/link'


import { getAllPosts, excerptFromMarkdown } from '@/lib/content'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'OLAAC — Observatorio Latinoamericano de Accesibilidad',
  description:
    'Mecanismo de control social que realiza diagnósticos y seguimiento técnico e independiente sobre accesibilidad en entornos, productos y servicios digitales y físicos.',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 90) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

function scoreBg(score: number | null): string {
  if (score === null) return 'bg-gray-100'
  if (score >= 90) return 'bg-green-50 border-green-200'
  if (score >= 50) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient()
  const latestPosts = getAllPosts()
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 3)

  // Scores: top 5 por accessibility_score (datos reales de Lighthouse)
  const { data: topScores } = await supabase
    .from('lighthouse_metrics')
    .select('alias, nombre_sitio, pais, accessibility_score')
    .not('accessibility_score', 'is', null)
    .order('accessibility_score', { ascending: false })
    .limit(5)

  // Academia: curso principal publicado
  const { data: featuredCourse } = await supabase
    .from('courses')
    .select('id, slug, titulo, descripcion')
    .eq('published', true)
    .limit(1)
    .single()

  // Tickets: conteo de reportes abiertos (muestra actividad)
  const { count: openTickets } = await supabase
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'abierto')

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="bg-[#252858] px-4 py-20 text-white sm:px-6"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h1 id="hero-heading" className="text-4xl font-bold tracking-tight sm:text-5xl">
            Trabajamos por la accesibilidad en Latinoamérica
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            El Observatorio Latinoamericano de Accesibilidad (OLAAC) es un mecanismo de
            control social que diagnostica y da seguimiento al cumplimiento de la
            accesibilidad en entornos digitales y físicos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#252858]"
            >
              <Link href="/tickets/nuevo">Reportar un problema</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white text-[#252858] hover:bg-blue-50"
            >
              <Link href="/sobre-el-observatorio/unirme-al-observatorio">Unirme al equipo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── ¿Qué es OLAAC? ───────────────────────────────────────────────── */}
      <section
        aria-labelledby="proposito-heading"
        className="mx-auto max-w-5xl px-4 py-16 sm:px-6"
      >
        <h2 id="proposito-heading" className="text-center text-2xl font-semibold text-gray-900">
          ¿Qué es OLAAC?
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              title: 'Diagnosticamos',
              desc: 'Realizamos auditorías técnicas independientes de accesibilidad en sitios web, aplicaciones y espacios físicos.',
            },
            {
              title: 'Informamos',
              desc: 'Publicamos informes públicos de Campañas de Informes de Accesibilidad (CIA) para orientar equipos de trabajo.',
            },
            {
              title: 'Vigilamos',
              desc: 'Monitoreamos el cumplimiento de normativas y políticas públicas en materia de accesibilidad a nivel regional.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dashboard de Scores ───────────────────────────────────────────── */}
      <section
        aria-labelledby="scores-heading"
        className="bg-gray-50 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="scores-heading" className="text-2xl font-semibold text-gray-900">
                Dashboard de Accesibilidad
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Ranking en tiempo real de sitios latinoamericanos auditados con Lighthouse
              </p>
            </div>
            <Link
              href="/scores"
              className="text-sm font-medium text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
            >
              Ver ranking completo →
            </Link>
          </div>

          {topScores && topScores.length > 0 ? (
            <ol
              className="mt-8 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white"
              aria-label="Top 5 sitios por score de accesibilidad"
            >
              {topScores.map((site, idx) => (
                <li key={site.alias} className="flex items-center gap-4 px-5 py-4">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500"
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/scores/${site.alias}`}
                      className="text-sm font-medium text-gray-900 hover:text-[#005fcc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                    >
                      {site.nombre_sitio}
                    </Link>
                    <p className="text-xs text-gray-400">{site.pais}</p>
                  </div>
                  <div
                    className={`flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${scoreBg(site.accessibility_score)} ${scoreColor(site.accessibility_score)}`}
                    aria-label={`Score: ${site.accessibility_score ?? 'N/A'}`}
                  >
                    {site.accessibility_score ?? '—'}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-400">
              Los datos del ranking se actualizan cada domingo de forma automática.
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/scores/solicitar-url"
              className="inline-flex items-center rounded-md border border-[#005fcc] px-4 py-2 text-sm font-medium text-[#005fcc] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
            >
              Solicitar auditoría de tu sitio
            </Link>
          </div>
        </div>
      </section>

      {/* ── Academia ─────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="academia-heading"
        className="mx-auto max-w-5xl px-4 py-16 sm:px-6"
      >
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="grid sm:grid-cols-2">
            {/* Texto */}
            <div className="p-8 sm:p-10">
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#252858]">
                Academia OLAAC
              </span>
              <h2 id="academia-heading" className="mt-4 text-2xl font-bold text-gray-900">
                Fórmate en accesibilidad digital
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Cursos diseñados por expertos en accesibilidad. Aprende las WCAG, herramientas
                de evaluación y cómo construir productos digitales inclusivos. Al completar
                cada curso recibes un certificado verificable.
              </p>

              {featuredCourse && (
                <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Curso destacado
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {featuredCourse.titulo}
                  </p>
                  {featuredCourse.descripcion && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {featuredCourse.descripcion}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <a href={`${process.env['NEXT_PUBLIC_ACADEMY_URL'] ?? 'http://localhost:3001'}/cursos`}>
                    Ver cursos disponibles
                  </a>
                </Button>
              </div>
            </div>

            {/* Stat decorativa */}
            <div
              className="flex flex-col items-center justify-center gap-6 bg-[#252858] p-8 text-white sm:p-10"
              aria-hidden="true"
            >
              <div className="text-center">
                <p className="text-5xl font-extrabold">100%</p>
                <p className="mt-2 text-sm text-blue-200">Certificados verificables</p>
              </div>
              <div className="h-px w-16 bg-blue-400 opacity-40" />
              <div className="text-center">
                <p className="text-5xl font-extrabold">WCAG</p>
                <p className="mt-2 text-sm text-blue-200">2.1 Nivel AA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sistema de Tickets ───────────────────────────────────────────── */}
      <section
        aria-labelledby="tickets-heading"
        className="bg-gray-50 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* CTA principal */}
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <h2 id="tickets-heading" className="text-xl font-semibold text-gray-900">
                ¿Encontraste una barrera de accesibilidad?
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Informa al observatorio. Con tu reporte ayudamos a que organizaciones
                responsables conozcan las barreras y puedan corregirlas. Todos los
                reportes son públicos y reciben seguimiento técnico.
              </p>
              <Button asChild className="mt-6">
                <Link href="/tickets/nuevo">Abrir nuevo reporte</Link>
              </Button>
            </div>

            {/* Estado del sistema */}
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <h3 className="text-lg font-semibold text-gray-900">Estado del sistema</h3>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Reportes abiertos</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {openTickets ?? 0}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Sitios monitoreados</dt>
                  <dd className="text-sm font-semibold text-gray-900">51</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Países cubiertos</dt>
                  <dd className="text-sm font-semibold text-gray-900">14</dd>
                </div>
              </dl>
              <Link
                href="/tickets/mis-reportes"
                className="mt-6 block text-sm font-medium text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
              >
                Ver mis reportes →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Donativo ─────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="donativo-heading"
        className="border-y border-[#005fcc]/20 bg-[#005fcc]/5 px-4 py-10 sm:px-6"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#005fcc]">
              Somos independientes
            </p>
            <h2 id="donativo-heading" className="mt-1 text-xl font-bold text-gray-900">
              OLAAC no tiene publicidad ni fondos institucionales
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Nos financian personas y organizaciones que creen que la accesibilidad digital
              debe ser pública, medible y exigible. Con un donativo mensual ayudas a mantener
              el observatorio y a financiar becas para organizaciones sin recursos.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/donativos"
              className="inline-flex items-center rounded-lg bg-[#005fcc] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0050b0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
            >
              Hacer un donativo
            </Link>
            <Link
              href="/sobre-el-observatorio"
              className="inline-flex items-center rounded-lg border border-[#005fcc] px-5 py-2.5 text-sm font-semibold text-[#005fcc] transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
            >
              Conocer más
            </Link>
          </div>
        </div>
      </section>

      {/* ── Últimas entradas ─────────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section
          aria-labelledby="blog-heading"
          className="mx-auto max-w-5xl px-4 py-16 sm:px-6"
        >
          <div className="flex items-center justify-between">
            <h2 id="blog-heading" className="text-2xl font-semibold text-gray-900">
              Novedades
            </h2>
            <Link
              href="/blog"
              className="text-sm text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
            >
              Ver todas →
            </Link>
          </div>
          <ul
            className="mt-8 grid gap-6 sm:grid-cols-3"
            aria-label="Últimas entradas del blog"
          >
            {latestPosts.map((post) => {
              const excerpt = excerptFromMarkdown(post.contenido_markdown, 120)
              return (
                <li key={post.slug}>
                  <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
                    {post.categorias[0] && (
                      <span className="text-xs font-medium uppercase tracking-wide text-[#005fcc]">
                        {post.categorias[0]}
                      </span>
                    )}
                    <h3 className="mt-2 flex-1 text-base font-semibold leading-snug text-gray-900">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                      >
                        {post.titulo}
                      </Link>
                    </h3>
                    {excerpt && (
                      <p className="mt-2 text-xs leading-6 text-gray-500 line-clamp-3">
                        {excerpt}
                      </p>
                    )}
                    <time dateTime={post.fecha} className="mt-3 text-xs text-gray-400">
                      {new Date(post.fecha).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </article>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}
