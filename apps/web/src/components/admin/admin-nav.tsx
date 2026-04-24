'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin',                   label: 'Resumen' },
  { href: '/admin/voluntarios',       label: 'Voluntarios' },
  { href: '/admin/ruta-de-formacion', label: 'Ruta de formación' },
  { href: '/admin/tickets',           label: 'Tickets' },
  { href: '/admin/distintivos',       label: 'Distintivos' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegación del panel de administración"
      className="border-b border-gray-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ul className="flex gap-1 overflow-x-auto" role="list">
          {NAV_ITEMS.map(item => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'inline-block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-[#005fcc] text-[#005fcc]'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
