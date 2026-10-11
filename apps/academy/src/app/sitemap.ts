import { createClient } from '@supabase/supabase-js'
import type { MetadataRoute } from 'next'

import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import type { Database } from '@/lib/supabase/types'

const BASE_URL = process.env.NEXT_PUBLIC_ACADEMY_URL ?? 'https://academia.olaac.org'

// El catálogo cambia poco: regenerar como máximo una vez por hora
export const revalidate = 3600

/** Entrada con sus equivalentes por idioma (hreflang) */
function entry(
  href: string,
  rest: Pick<MetadataRoute.Sitemap[number], 'lastModified' | 'changeFrequency' | 'priority'>,
): MetadataRoute.Sitemap[number] {
  const url = (locale: string) => `${BASE_URL}${getPathname({ href, locale })}`
  return {
    url: url(routing.defaultLocale),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((locale) => [locale, url(locale)])),
    },
    ...rest,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Cliente anónimo sin cookies: solo ve cursos publicados (RLS)
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  )

  const { data: courses } = await supabase
    .from('courses')
    .select('slug, updated_at')
    .eq('published', true)
    .order('created_at', { ascending: true })

  return [
    entry('/', { changeFrequency: 'weekly', priority: 1 }),
    entry('/cursos', { changeFrequency: 'weekly', priority: 0.9 }),
    ...(courses ?? []).map((course) =>
      entry(`/cursos/${course.slug}`, {
        lastModified: new Date(course.updated_at),
        changeFrequency: 'monthly',
        priority: 0.8,
      }),
    ),
  ]
}
