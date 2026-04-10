import Link from 'next/link'
import type { Metadata } from 'next'

import { Button } from '@olaac/ui'
import { getAllPosts } from '@/lib/content'

export const metadata: Metadata = {
  title: 'OLAAC — Observatorio Latinoamericano de Accesibilidad',
  description:
    'Mecanismo de control social que realiza diagnósticos y seguimiento técnico e independiente sobre accesibilidad en entornos, productos y servicios digitales y físicos.',
}

export default function HomePage() {
  const latestPosts = getAllPosts().slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section
        aria-labelledby="hero-heading"
        className="bg-brand-600 px-4 py-20 text-white sm:px-6"
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
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-700">
              <Link href="/proyectos/informar">Informar un problema</Link>
            </Button>
            <Button asChild size="lg" className="bg-white text-brand-700 hover:bg-blue-50">
              <Link href="/sobre-el-observatorio/unirme-al-observatorio">Unirme al equipo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Propósito */}
      <section aria-labelledby="proposito-heading" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 id="proposito-heading" className="text-2xl font-semibold text-gray-900 text-center">¿Qué es OLAAC?</h2>
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

      {/* CTA — Informar */}
      <section
        aria-labelledby="informar-heading"
        className="bg-gray-50 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="informar-heading" className="text-2xl font-semibold text-gray-900">
            ¿Conoces un sitio o espacio con problemas de accesibilidad?
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Informa al observatorio. Con tu reporte ayudas a que organizaciones responsables
            conozcan las barreras y puedan corregirlas.
          </p>
          <Button asChild className="mt-6">
            <Link href="/proyectos/informar">Enviar reporte de accesibilidad</Link>
          </Button>
        </div>
      </section>

      {/* Últimas entradas */}
      {latestPosts.length > 0 && (
        <section aria-labelledby="blog-heading" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 id="blog-heading" className="text-2xl font-semibold text-gray-900">Novedades</h2>
            <Link
              href="/blog"
              className="text-sm text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
            >
              Ver todas →
            </Link>
          </div>
          <ul className="mt-8 grid gap-6 sm:grid-cols-3" aria-label="Últimas entradas del blog">
            {latestPosts.map((post) => (
              <li key={post.slug}>
                <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
                  {post.categorias[0] && (
                    <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
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
                  <time
                    dateTime={post.fecha}
                    className="mt-3 text-xs text-gray-400"
                  >
                    {new Date(post.fecha).toLocaleDateString('es-MX', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </time>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
