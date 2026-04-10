import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { getAllPosts, getPostBySlug, excerptFromMarkdown } from '@/lib/content'
import { MarkdownRenderer } from '@/components/markdown-renderer'

interface Props {
  params: Promise<{ slug: string }>
}

/** SSG: genera rutas estáticas para todas las entradas del blog */
export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

/** SEO: título + descripción extraídos del JSON */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const description = excerptFromMarkdown(post.contenido_markdown)
  const image = post.imagenes[0]?.src

  return {
    title: post.titulo,
    description,
    openGraph: {
      title: post.titulo,
      description,
      type: 'article',
      publishedTime: post.fecha,
      ...(image ? { images: [{ url: image, alt: post.imagenes[0]?.alt ?? post.titulo }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.titulo,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const categoria = post.categorias[0]

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="mb-8 text-sm text-gray-500">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/blog" className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
              Novedades
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900" aria-current="page">{post.titulo}</li>
        </ol>
      </nav>

      <article aria-labelledby="post-title">
        {/* Categoría y tags */}
        {(categoria || post.tags.length > 0) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {categoria && (
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {categoria}
              </span>
            )}
            {post.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-500">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <h1 id="post-title" className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
          {post.titulo}
        </h1>

        <time
          dateTime={post.fecha}
          className="mt-4 block text-sm text-gray-400"
        >
          {new Date(post.fecha).toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </time>

        <hr className="my-8 border-gray-200" />

        <MarkdownRenderer content={post.contenido_markdown} />
      </article>

      {/* Navegación al final */}
      <div className="mt-12 border-t border-gray-100 pt-8">
        <Link
          href="/blog"
          className="text-sm text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          ← Volver a Novedades
        </Link>
      </div>
    </div>
  )
}
