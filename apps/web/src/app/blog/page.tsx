import Link from 'next/link'
import type { Metadata } from 'next'

import { getAllPosts, excerptFromMarkdown } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Novedades',
  description: 'Entradas del blog del Observatorio Latinoamericano de Accesibilidad: eventos, guías WCAG, análisis y recursos de accesibilidad digital.',
}

// Categorías del blog detectadas en el JSON
const CATEGORIA_COLORS: Record<string, string> = {
  'Eventos y actividades':             'bg-blue-100 text-blue-800',
  'WCAG':                              'bg-purple-100 text-purple-800',
  'Generalidades sobre accesibilidad': 'bg-green-100 text-green-800',
  'Análisis de accesibilidad':         'bg-yellow-100 text-yellow-800',
  'Sin categoría':                     'bg-gray-100 text-gray-600',
}

export default function BlogPage() {
  const posts = getAllPosts().sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Novedades</h1>
      <p className="mt-2 text-gray-500">
        {posts.length} publicacion{posts.length !== 1 ? 'es' : ''} del observatorio
      </p>

      <ul className="mt-10 divide-y divide-gray-100" aria-label="Lista de entradas del blog">
        {posts.map((post) => {
          const excerpt = excerptFromMarkdown(post.contenido_markdown)
          const categoria = post.categorias[0]
          const colorClass = categoria ? (CATEGORIA_COLORS[categoria] ?? 'bg-gray-100 text-gray-600') : null

          return (
            <li key={post.slug} className="py-8">
              <article aria-labelledby={`post-${post.slug}`}>
                <div className="flex flex-wrap items-center gap-2">
                  {categoria && colorClass && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
                      {categoria}
                    </span>
                  )}
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500 border border-gray-200">
                      #{tag}
                    </span>
                  ))}
                </div>

                <h2
                  id={`post-${post.slug}`}
                  className="mt-3 text-xl font-semibold text-gray-900"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                  >
                    {post.titulo}
                  </Link>
                </h2>

                {excerpt && (
                  <p className="mt-2 text-sm leading-7 text-gray-600 line-clamp-3">{excerpt}</p>
                )}

                <div className="mt-4 flex items-center gap-4">
                  <time dateTime={post.fecha} className="text-xs text-gray-400">
                    {new Date(post.fecha).toLocaleDateString('es-MX', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </time>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-medium text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                    aria-label={`Leer "${post.titulo}"`}
                  >
                    Leer entrada →
                  </Link>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
