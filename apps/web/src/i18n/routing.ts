import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['es', 'en', 'pt'],
  defaultLocale: 'es',
  localePrefix: 'as-needed', // español sin prefijo, /en y /pt con prefijo
})

export type Locale = (typeof routing.locales)[number]
