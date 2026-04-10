import Link from 'next/link'
import { redirect } from 'next/navigation'

import { UserNav } from '@olaac/ui'
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
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
          >
            OLAAC
          </Link>
          <nav aria-label="Navegación principal">
            <ul className="flex items-center gap-4" role="list">
              <li>
                <Link
                  href="/scores"
                  className="text-sm text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                >
                  Scores
                </Link>
              </li>
              <li>
                <Link
                  href="/tickets"
                  className="text-sm text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
                >
                  Tickets
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
