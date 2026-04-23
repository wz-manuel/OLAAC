import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { AdminNav } from '@/components/admin/admin-nav'
import { getAdminUser } from '@/lib/admin'

export const metadata = { title: 'Panel de administración — OLAAC' }

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser()
  if (!admin) redirect('/')

  return (
    <div>
      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#005fcc]">OLAAC</p>
            <h1 className="text-base font-semibold text-gray-900">Panel de administración</h1>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {admin.email}
          </span>
        </div>
      </div>
      <AdminNav />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
