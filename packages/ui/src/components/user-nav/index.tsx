'use client'

import * as React from 'react'

import { Button } from '../button'

export interface UserNavProps {
  email: string
  onSignOut: () => Promise<void>
}

/**
 * UserNav — Muestra el email del usuario autenticado y un botón de cierre de sesión.
 * WCAG 2.4.6: el botón describe su acción claramente.
 */
export function UserNav({ email, onSignOut }: UserNavProps) {
  const [pending, setPending] = React.useState(false)

  async function handleSignOut() {
    setPending(true)
    await onSignOut()
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-gray-600 sm:block" aria-label={`Sesión iniciada como ${email}`}>
        {email}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        aria-disabled={pending}
        onClick={handleSignOut}
      >
        {pending ? 'Cerrando…' : 'Cerrar sesión'}
      </Button>
    </div>
  )
}
