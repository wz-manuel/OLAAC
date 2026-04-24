import Link from 'next/link'
import { redirect } from 'next/navigation'

import { OlaacLogo, UserNav } from '@olaac/ui'
import { createClient } from '@/lib/supabase/server'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 rounded"
            aria-label="OLAAC — Inicio"
          >
            <OlaacLogo width={120} height={34} />
          </Link>
          <nav aria-label="Navegación principal">
            <ul className="flex items-center gap-4" role="list">
              <li>
                <Link
                  href="/scores"
                  className="text-sm text-brand-600 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                >
                  Scores
                </Link>
              </li>
              <li>
                <Link
                  href="/tickets"
                  className="text-sm text-brand-600 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                >
                  Tickets
                </Link>
              </li>
              <li>
                <Link
                  href="/distintivo"
                  className="text-sm text-brand-600 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                >
                  Distintivo
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {user?.email && (
          <UserNav email={user.email} onSignOut={signOut} />
        )}
      </div>
    </header>
  )
}
