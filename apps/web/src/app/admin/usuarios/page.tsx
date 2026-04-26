import type { Metadata } from 'next'

import { RolesEditor } from '@/components/admin/roles-editor'
import { getUsersWithProfiles } from '@/lib/actions/admin-roles'

export const metadata: Metadata = { title: 'Usuarios — Admin OLAAC' }


interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function AdminUsuariosPage({ searchParams }: PageProps) {
  const params   = await searchParams
  const search   = params.q?.trim() || undefined
  const page     = Math.max(1, parseInt(params.page ?? '1', 10))
  const pageSize = 20

  const { users, total, error } = await getUsersWithProfiles({ search, page, pageSize })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Usuarios registrados</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} {total === 1 ? 'usuario' : 'usuarios'} en total
          </p>
        </div>

        <form method="GET" className="flex gap-2" role="search">
          <label htmlFor="user-search" className="sr-only">
            Buscar por nombre o correo
          </label>
          <input
            id="user-search"
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Buscar por nombre o correo…"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc] w-64"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#252858] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a1c3e]"
          >
            Buscar
          </button>
          {search && (
            <a
              href="/admin/usuarios"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </a>
          )}
        </form>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-gray-500 text-sm">
            {search ? `No se encontraron usuarios para "${search}"` : 'No hay usuarios registrados aún.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Usuario
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  País
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Roles
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Registro
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{user.nombreCompleto}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.pais ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <RolesEditor
                      userId={user.userId}
                      nombre={user.nombreCompleto}
                      currentRoles={user.roles}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('es', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {user.onboardingComplete ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                        <span aria-hidden="true">●</span> Completo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                        <span aria-hidden="true">○</span> Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Paginación de usuarios" className="mt-4 flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/usuarios?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(page - 1) })}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
              >
                Anterior
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/usuarios?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(page + 1) })}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
              >
                Siguiente
              </a>
            )}
          </div>
        </nav>
      )}
    </div>
  )
}
