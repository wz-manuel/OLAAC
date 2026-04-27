import Link from 'next/link'

const SOCIAL_LINKS = [
  {
    href: 'mailto:hola@olaac.org',
    label: 'Correo electrónico: hola@olaac.org',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    href: 'https://www.linkedin.com/company/olaac/',
    label: 'LinkedIn de OLAAC',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    href: 'https://x.com/a11yLatam',
    label: 'X (antes Twitter) de OLAAC',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    href: 'https://www.facebook.com/ObservatorioOLAC',
    label: 'Facebook de OLAAC',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    href: 'https://www.youtube.com/@A11YLatam/',
    label: 'YouTube de OLAAC',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
]

const FOOTER_LINKS = [
  {
    titulo: 'Observatorio',
    links: [
      { href: '/scores', label: 'Scores de accesibilidad' },
      { href: '/reportes', label: 'Reportes regionales' },
      { href: '/datos-abiertos', label: 'API y datos abiertos' },
      { href: '/marco-legal', label: 'Marco legal' },
    ],
  },
  {
    titulo: 'Programa',
    links: [
      { href: '/distintivo', label: 'Distintivo de Accesibilidad' },
      { href: '/tickets', label: 'Reportar barreras' },
      { href: '/voluntarios', label: 'Ser auditor voluntario' },
    ],
  },
  {
    titulo: 'OLAAC',
    links: [
      { href: '/sobre-el-observatorio', label: 'Sobre el observatorio' },
      { href: '/blog', label: 'Blog' },
      { href: '/contacto', label: 'Contacto' },
      { href: '/aviso-legal', label: 'Aviso legal' },
      { href: '/politica-privacidad', label: 'Privacidad' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">

      {/* Banner de donación */}
      <div className="bg-[#252858] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-sm font-semibold text-white">
              OLAAC es independiente y sin publicidad
            </p>
            <p className="mt-0.5 text-xs text-blue-200">
              Nos financiamos con donativos de personas y organizaciones que creen en la accesibilidad.
            </p>
          </div>
          <Link
            href="/donativos"
            className="shrink-0 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-[#252858] transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#252858]"
          >
            Apoyar el proyecto →
          </Link>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {FOOTER_LINKS.map((grupo) => (
            <nav key={grupo.titulo} aria-label={grupo.titulo}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {grupo.titulo}
              </p>
              <ul className="space-y-2">
                {grupo.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gray-600 hover:text-[#005fcc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Redes sociales y correo */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
          <nav aria-label="Redes sociales de OLAAC">
            <ul className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ href, label, icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    aria-label={label}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="text-gray-400 transition-colors hover:text-[#005fcc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                  >
                    {icon}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href="mailto:hola@olaac.org"
            className="text-xs text-gray-500 hover:text-[#005fcc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
          >
            hola@olaac.org
          </a>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} OLAAC — Observatorio Latinoamericano de Accesibilidad
          </p>
          <Link
            href="/donativos"
            className="text-xs font-medium text-[#005fcc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
          >
            Haz un donativo
          </Link>
        </div>
      </div>
    </footer>
  )
}
