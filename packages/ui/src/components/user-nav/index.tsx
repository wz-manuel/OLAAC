'use client'

import * as React from 'react'

import { Button } from '../button'

export interface UserNavProps {
  email: string
  onSignOut: () => Promise<void>
  /** Textos de la interfaz — por defecto en español; pásalos traducidos en apps multilingües */
  labels?: Partial<UserNavLabels>
}

export interface UserNavLabels {
  /** Etiqueta accesible del email, ya con el email interpolado */
  signedInAs: string
  signOut: string
  signingOut: string
}

/**
 * UserNav — Muestra el email del usuario autenticado y un botón de cierre de sesión.
 * WCAG 2.4.6: el botón describe su acción claramente.
 */
export function UserNav({ email, onSignOut, labels }: UserNavProps) {
  const l: UserNavLabels = {
    signedInAs: `Sesión iniciada como ${email}`,
    signOut: 'Cerrar sesión',
    signingOut: 'Cerrando…',
    ...labels,
  }
  const [pending, setPending] = React.useState(false)

  async function handleSignOut() {
    setPending(true)
    await onSignOut()
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-gray-600 sm:block" aria-label={l.signedInAs}>
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
        {pending ? l.signingOut : l.signOut}
      </Button>
    </div>
  )
}
