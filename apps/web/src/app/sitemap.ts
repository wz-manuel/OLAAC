import type { MetadataRoute } from 'next'
import { getAllPages, getAllPosts } from '@/lib/content'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://olaac.org'

// Mapeo de slugs a rutas reales en el App Router
const SLUG_TO_PATH: Record<string, string> = {
  inicio:                         '/',
  blog:                           '/blog',
  'sobre-el-observatorio':        '/sobre-el-observatorio',
  'unirme-al-observatorio':       '/sobre-el-observatorio/unirme-al-observatorio',
  proyectos:                      '/proyectos',
  informaralobservatorio:         '/proyectos/informar',
  'herramientas-y-recursos':      '/herramientas-y-recursos',
  'evaluadores-de-accesibilidad-web': '/herramientas-y-recursos/evaluadores-de-accesibilidad-web',
  'que-es-accesibilidad':         '/que-es-accesibilidad',
  contacto:                       '/contacto',
  'aviso-legal':                  '/aviso-legal',
  'politica-de-cookies':          '/politica-de-cookies',
  'politica-privacidad':          '/politica-privacidad',
}

// Prioridad relativa por sección
const PRIORITY: Record<string, number> = {
  '/':                1.0,
  '/blog':            0.9,
  '/proyectos/informar': 0.9,
  '/sobre-el-observatorio': 0.8,
  '/proyectos':       0.8,
  '/herramientas-y-recursos': 0.7,
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getAllPages()
  const posts = getAllPosts()

  const staticEntries: MetadataRoute.Sitemap = pages
    .filter((p) => SLUG_TO_PATH[p.slug])
    .map((p) => {
      const path = SLUG_TO_PATH[p.slug]!
      return {
        url: `${BASE_URL}${path}`,
        lastModified: new Date(p.fecha),
        changeFrequency: path === '/' ? 'weekly' : 'monthly',
        priority: PRIORITY[path] ?? 0.6,
      }
    })

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.fecha),
    changeFrequency: 'yearly',
    priority: 0.7,
  }))

  return [...staticEntries, ...blogEntries]
}
