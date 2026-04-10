import type { Metadata } from 'next'
import Link from 'next/link'

import { A11yDataTable } from '@olaac/ui'
import { createClient } from '@/lib/supabase/server'
import { getPageBySlug, getPostBySlug, excerptFromMarkdown } from '@/lib/content'
import { MarkdownRenderer } from '@/components/markdown-renderer'

const staticPage = getPageBySlug('evaluadores-de-accesibilidad-web')
const blogPost   = getPostBySlug('evaluadores-automaticos-de-accesibilidad')

export const metadata: Metadata = {
  title: staticPage?.titulo ?? 'Evaluadores de accesibilidad web',
  description: staticPage
    ? excerptFromMarkdown(staticPage.contenido_markdown)
    : 'Herramientas automáticas para evaluar la accesibilidad: Axe, WAVE, Lighthouse y Rocket Validator.',
}

export default async function EvaluadoresPage() {
  // Scores registrados en la DB (puede estar vacío inicialmente)
  const supabase = await createClient()
  const { data: scores } = await supabase
    .from('accessibility_scores')
    .select('url, score_total, score_a11y, score_perf, score_seo, score_bp, measured_at')
    .order('measured_at', { ascending: false })
    .limit(20)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="mb-8 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/herramientas-y-recursos" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              Herramientas y recursos
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900" aria-current="page">Evaluadores de accesibilidad web</li>
        </ol>
      </nav>

      <article aria-labelledby="page-title">
        <h1 id="page-title" className="text-3xl font-bold text-gray-900">
          {staticPage?.titulo ?? 'Evaluadores de accesibilidad web'}
        </h1>

        {staticPage?.contenido_markdown && (
          <MarkdownRenderer content={staticPage.contenido_markdown} className="mt-6" />
        )}

        {/* Tabla de scores del observatorio */}
        <section aria-labelledby="scores-heading" className="mt-12">
          <h2 id="scores-heading" className="text-xl font-semibold text-gray-900">
            Scores registrados por el observatorio
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Resultados de auditorías con Lighthouse realizadas por el equipo OLAAC.
          </p>
          <div className="mt-4">
            <A11yDataTable
              scores={scores ?? []}
              caption="Scores de accesibilidad Lighthouse medidos por OLAAC"
            />
          </div>
        </section>

        {/* Contenido del blog sobre evaluadores automáticos */}
        {blogPost?.contenido_markdown && (
          <section aria-labelledby="evaluadores-auto-heading" className="mt-12">
            <h2 id="evaluadores-auto-heading" className="text-xl font-semibold text-gray-900">
              {blogPost.titulo}
            </h2>
            <MarkdownRenderer content={blogPost.contenido_markdown} />
          </section>
        )}
      </article>
    </div>
  )
}
