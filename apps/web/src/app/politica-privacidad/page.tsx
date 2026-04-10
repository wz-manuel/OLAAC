import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageBySlug, excerptFromMarkdown } from '@/lib/content'
import { ContentPage } from '@/components/content-page'

const page = getPageBySlug('politica-privacidad')

export const metadata: Metadata = {
  title: page?.titulo,
  description: page ? excerptFromMarkdown(page.contenido_markdown) : undefined,
}

export default function Page() {
  if (!page) notFound()
  return <ContentPage titulo={page.titulo} contenido_markdown={page.contenido_markdown} />
}
