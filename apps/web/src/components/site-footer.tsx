import Link from 'next/link'

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

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">
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
