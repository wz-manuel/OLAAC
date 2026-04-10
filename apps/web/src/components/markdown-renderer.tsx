import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

/**
 * MarkdownRenderer — renderiza Markdown con semántica HTML correcta.
 *
 * WCAG:
 * - 1.3.1: jerarquía de headings preservada (h2 → h2, no se salta niveles)
 * - 1.4.1: los links son distinguibles por más que color
 * - Los headings generados de WP vienen como ## (h2), los mantenemos.
 */

const components: Components = {
  // Mantiene la jerarquía semántica — el título de la página es h1
  // así que el contenido empieza en h2
  h1: ({ children }) => <h2 className="mt-8 text-2xl font-semibold text-gray-900">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-8 text-2xl font-semibold text-gray-900">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 text-xl font-semibold text-gray-800">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-5 text-lg font-semibold text-gray-800">{children}</h4>,
  p:  ({ children }) => <p className="mt-4 leading-7 text-gray-700">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc pl-6 space-y-1 text-gray-700">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal pl-6 space-y-1 text-gray-700">{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,
  a:  ({ href, children }) => (
    <a
      href={href}
      className="text-brand-600 underline underline-offset-2 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
      {...(href?.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ''}
      className="mt-6 rounded-lg border border-gray-100 w-full object-cover"
    />
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 border-brand-600 pl-4 italic text-gray-600">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-gray-800">{children}</code>
  ),
  hr: () => <hr className="my-8 border-gray-200" />,
}

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
