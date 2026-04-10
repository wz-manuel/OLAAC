'use client'

import * as React from 'react'

import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'

export interface AuthFormProps {
  /** Acción del servidor o handler que recibe el email y dispara el Magic Link */
  onSubmit: (email: string) => Promise<{ error?: string }>
  /** Texto del campo de origen para el redirect post-login */
  appName?: string
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

/**
 * AuthForm — Formulario de autenticación via Email Magic Link.
 *
 * Cumplimiento WCAG:
 * - 1.3.1: <label> vinculado con htmlFor/id
 * - 3.3.1: errores identificados y descritos con aria-describedby
 * - 4.1.3: mensajes de estado anunciados con aria-live="polite"
 * - 2.4.7: foco visible heredado de primitivas Button e Input
 */
export function AuthForm({ onSubmit, appName = 'OLAAC' }: AuthFormProps) {
  const [email, setEmail] = React.useState('')
  const [state, setState] = React.useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = React.useState('')

  const statusRef = React.useRef<HTMLParagraphElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    const { error } = await onSubmit(email)

    if (error) {
      setState('error')
      setErrorMsg(error)
    } else {
      setState('success')
    }
  }

  if (state === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-green-200 bg-green-50 p-6 text-center"
      >
        <p className="text-sm font-medium text-green-800">
          Revisa tu correo — te enviamos un enlace de acceso a{' '}
          <strong>{email}</strong>.
        </p>
        <p className="mt-1 text-xs text-green-700">
          El enlace expira en 1 hora. Puedes cerrar esta ventana.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label={`Iniciar sesión en ${appName}`}>
      <div className="space-y-1.5">
        <Label htmlFor="auth-email">
          Correo electrónico
        </Label>
        <Input
          id="auth-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="tu@correo.gob.mx"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'loading'}
          required
          aria-required="true"
          aria-invalid={state === 'error' ? 'true' : undefined}
          aria-describedby={state === 'error' ? 'auth-error' : 'auth-hint'}
        />
        {state !== 'error' && (
          <p id="auth-hint" className="text-xs text-gray-500">
            Te enviaremos un enlace mágico — no necesitas contraseña.
          </p>
        )}
      </div>

      {/* Región de errores — aria-live anuncia cambios a lectores de pantalla */}
      <p
        id="auth-error"
        ref={statusRef}
        role="alert"
        aria-live="assertive"
        className={
          state === 'error'
            ? 'text-sm font-medium text-red-700'
            : 'sr-only'
        }
      >
        {state === 'error' ? errorMsg : ''}
      </p>

      <Button
        type="submit"
        className="w-full"
        disabled={state === 'loading' || !email}
        aria-disabled={state === 'loading' || !email}
      >
        {state === 'loading' ? (
          <>
            <span className="sr-only">Enviando enlace…</span>
            <span aria-hidden="true">Enviando…</span>
          </>
        ) : (
          'Enviar enlace de acceso'
        )}
      </Button>
    </form>
  )
}
