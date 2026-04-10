import data from '../../../../olaac_contenido_extraido.json'

export interface ContentItem {
  titulo: string
  slug: string
  fecha: string
  estado: string
  categorias: string[]
  tags: string[]
  imagenes: { src: string; alt: string }[]
  contenido_markdown: string
}

const paginas = data.paginas_estaticas as ContentItem[]
const entradas = data.entradas_blog as ContentItem[]

export function getPageBySlug(slug: string): ContentItem | undefined {
  return paginas.find((p) => p.slug === slug)
}

export function getPostBySlug(slug: string): ContentItem | undefined {
  return entradas.find((p) => p.slug === slug)
}

export function getAllPosts(): ContentItem[] {
  return entradas.filter((p) => p.estado === 'publish')
}

export function getAllPages(): ContentItem[] {
  return paginas.filter((p) => p.estado === 'publish')
}

/** Extrae los primeros 160 caracteres de contenido como excerpt para SEO */
export function excerptFromMarkdown(markdown: string, maxLength = 160): string {
  return markdown
    .replace(/#{1,6}\s+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`!]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, maxLength)
}
