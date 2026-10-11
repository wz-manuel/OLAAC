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

// Secciones de la aplicación que no vienen del contenido en markdown
const APP_SECTIONS: Array<{ path: string; priority: number }> = [
  { path: '/scores',         priority: 0.9 },
  { path: '/reportes',       priority: 0.8 },
  { path: '/cobertura',      priority: 0.8 },
  { path: '/marco-legal',    priority: 0.7 },
  { path: '/datos-abiertos', priority: 0.7 },
  { path: '/distintivo',     priority: 0.7 },
  { path: '/voluntarios',    priority: 0.7 },
  { path: '/donativos',      priority: 0.6 },
]

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

  const appEntries: MetadataRoute.Sitemap = APP_SECTIONS.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: 'weekly',
    priority,
  }))

  return [...staticEntries, ...appEntries, ...blogEntries]
}
