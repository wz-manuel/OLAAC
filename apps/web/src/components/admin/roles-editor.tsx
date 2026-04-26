'use client'

import { useOptimistic, useState, useTransition } from 'react'

import { updateUserRoles, type RolUsuario } from '@/lib/actions/admin-roles'

const ALL_ROLES: { value: RolUsuario; label: string; description: string }[] = [
  { value: 'general',    label: 'General',    description: 'Acceso básico al observatorio' },
  { value: 'estudiante', label: 'Estudiante', description: 'Acceso a cursos de la Academia' },
  { value: 'voluntario', label: 'Voluntario', description: 'Puede solicitar unirse como auditor' },
  { value: 'auditor',    label: 'Auditor',    description: 'Auditor certificado OLAAC' },
]

interface RolesEditorProps {
  userId: string
  nombre: string
  currentRoles: RolUsuario[]
}

export function RolesEditor({ userId, nombre, currentRoles }: RolesEditorProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<RolUsuario>>(new Set(currentRoles))
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [optimisticRoles, setOptimisticRoles] = useOptimistic(currentRoles)

  function toggle(role: RolUsuario) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(role)) {
        if (next.size === 1) return prev // always keep at least one role
        next.delete(role)
      } else {
        next.add(role)
      }
      return next
    })
  }

  function handleSave() {
    const roles = Array.from(selected)
    setError(null)

    startTransition(async () => {
      setOptimisticRoles(roles)
      const result = await updateUserRoles(userId, roles, { error: null }, new FormData())
      if (result.error) {
        setError(result.error)
        setOptimisticRoles(currentRoles)
      } else {
        setOpen(false)
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap gap-1">
        {optimisticRoles.map(role => (
          <span
            key={role}
            className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200"
          >
            {ALL_ROLES.find(r => r.value === role)?.label ?? role}
          </span>
        ))}
        <button
          type="button"
          onClick={() => {
            setSelected(new Set(currentRoles))
            setOpen(true)
          }}
          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
          aria-label={`Editar roles de ${nombre}`}
        >
          Editar
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`roles-dialog-title-${userId}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2
              id={`roles-dialog-title-${userId}`}
              className="text-base font-semibold text-gray-900 mb-1"
            >
              Editar roles
            </h2>
            <p className="text-sm text-gray-500 mb-4">{nombre}</p>

            <fieldset>
              <legend className="sr-only">Roles disponibles</legend>
              <div className="space-y-3">
                {ALL_ROLES.map(role => {
                  const checked = selected.has(role.value)
                  const isLastSelected = selected.size === 1 && checked

                  return (
                    <label
                      key={role.value}
                      className={[
                        'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                        checked
                          ? 'border-[#005fcc] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300',
                        isLastSelected ? 'opacity-60 cursor-not-allowed' : '',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(role.value)}
                        disabled={isLastSelected}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#005fcc] focus:ring-[#005fcc]"
                        aria-label={role.label}
                        aria-describedby={`role-desc-${role.value}`}
                      />
                      <div>
                        <span className="block text-sm font-medium text-gray-900">
                          {role.label}
                        </span>
                        <span
                          id={`role-desc-${role.value}`}
                          className="block text-xs text-gray-500"
                        >
                          {role.description}
                        </span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-5 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="rounded-lg bg-[#252858] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a1c3e] disabled:opacity-50"
              >
                {isPending ? 'Guardando…' : 'Guardar roles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
