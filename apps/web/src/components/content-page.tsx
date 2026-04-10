import Link from 'next/link'
import { MarkdownRenderer } from './markdown-renderer'

interface Breadcrumb {
  label: string
  href: string
}

interface ContentPageProps {
  titulo: string
  contenido_markdown: string
  breadcrumbs?: Breadcrumb[]
  children?: React.ReactNode
}

/**
 * ContentPage — Layout base para páginas de contenido estático.
 * Reutilizado por todas las páginas que solo renderizan Markdown.
 */
export function ContentPage({ titulo, contenido_markdown, breadcrumbs, children }: ContentPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Migas de pan" className="mb-8 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900" aria-current="page">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <article aria-labelledby="page-title">
        <h1 id="page-title" className="text-3xl font-bold text-gray-900">
          {titulo}
        </h1>

        {contenido_markdown && (
          <MarkdownRenderer content={contenido_markdown} className="mt-6" />
        )}

        {children}
      </article>
    </div>
  )
}
