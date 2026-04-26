import { OlaacLogo } from '@olaac/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { CompletarPerfilForm } from '@/components/registro/completar-perfil-form'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Completa tu perfil — OLAAC' }

export default async function CompletarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sin sesión → login
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`)

  // Ya tiene perfil → continuar
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .single()

  if (profile) redirect(next ?? '/')

  const redirectTo = next ?? '/'

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" aria-label="OLAAC — Inicio">
            <OlaacLogo width={130} height={37} />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-brand-900">Completa tu perfil</h1>
            <p className="mt-0.5 text-sm text-gray-500">Solo te tomará un momento</p>
          </div>
        </div>

        <CompletarPerfilForm
          email={user.email ?? ''}
          redirectTo={redirectTo}
        />
      </div>
    </main>
  )
}
