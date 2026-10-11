import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_ACADEMY_URL ?? 'https://academia.olaac.org'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Las páginas de verificación de certificados se excluyen con noindex, no aquí
      disallow: ['/api/', '/auth/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
