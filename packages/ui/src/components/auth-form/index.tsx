'use client'

import * as React from 'react'

import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'

export interface AuthFormProps {
  /** Acción del servidor o handler que recibe el email y dispara el Magic Link o el código */
  onSubmit: (email: string) => Promise<{ error?: string }>
  /**
   * Verifica el código de un solo uso enviado por correo. Si se pasa, tras enviar
   * el email se muestra un segundo paso para escribir el código; si no, solo
   * se muestra el mensaje de éxito del Magic Link.
   */
  onVerify?: (email: string, token: string) => Promise<{ error?: string }>
  /** Texto del campo de origen para el redirect post-login */
  appName?: string
  /** Textos de la interfaz — por defecto en español; pásalos traducidos en apps multilingües */
  labels?: Partial<AuthFormLabels>
}

export interface AuthFormLabels {
  formAriaLabel: string
  email: string
  emailPlaceholder: string
  emailHint: string
  submit: string
  submitting: string
  submittingSr: string
  /** Texto que precede al email en el mensaje de éxito */
  success: string
  successNote: string
  /** Paso del código (solo con onVerify) */
  codeFormAriaLabel: string
  code: string
  codeHint: string
  verify: string
  verifying: string
  verifyingSr: string
  changeEmail: string
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

/**
 * AuthForm — Formulario de autenticación via Email Magic Link o código de un solo uso.
 *
 * Cumplimiento WCAG:
 * - 1.3.1: <label> vinculado con htmlFor/id
 * - 3.3.1: errores identificados y descritos con aria-describedby
 * - 4.1.3: mensajes de estado anunciados con aria-live="polite"
 * - 2.4.3: al pasar al paso del código, el foco se mueve al campo del código
 * - 2.4.7: foco visible heredado de primitivas Button e Input
 */
export function AuthForm({ onSubmit, onVerify, appName = 'OLAAC', labels }: AuthFormProps) {
  const l: AuthFormLabels = {
    formAriaLabel: `Iniciar sesión en ${appName}`,
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@correo.gob.mx',
    emailHint: 'Te enviaremos un enlace mágico — no necesitas contraseña.',
    submit: 'Enviar enlace de acceso',
    submitting: 'Enviando…',
    submittingSr: 'Enviando enlace…',
    success: 'Revisa tu correo — te enviamos un enlace de acceso a',
    successNote: 'El enlace expira en 1 hora. Puedes cerrar esta ventana.',
    codeFormAriaLabel: `Verificar código de acceso a ${appName}`,
    code: 'Código de verificación',
    codeHint: 'Escribe el código de 6 dígitos que llegó a tu correo.',
    verify: 'Verificar y entrar',
    verifying: 'Verificando…',
    verifyingSr: 'Verificando código…',
    changeEmail: 'Usar otro correo',
    ...labels,
  }

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

  if (state === 'success' && onVerify) {
    return (
      <CodeStep
        email={email}
        labels={l}
        onVerify={onVerify}
        onChangeEmail={() => setState('idle')}
      />
    )
  }

  if (state === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-green-200 bg-green-50 p-6 text-center"
      >
        <p className="text-sm font-medium text-green-800">
          {l.success}{' '}
          <strong>{email}</strong>.
        </p>
        <p className="mt-1 text-xs text-green-700">
          {l.successNote}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label={l.formAriaLabel}>
      <div className="space-y-1.5">
        <Label htmlFor="auth-email">
          {l.email}
        </Label>
        <Input
          id="auth-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder={l.emailPlaceholder}
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
            {l.emailHint}
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
            <span className="sr-only">{l.submittingSr}</span>
            <span aria-hidden="true">{l.submitting}</span>
          </>
        ) : (
          l.submit
        )}
      </Button>
    </form>
  )
}

interface CodeStepProps {
  email: string
  labels: AuthFormLabels
  onVerify: (email: string, token: string) => Promise<{ error?: string }>
  onChangeEmail: () => void
}

/** Segundo paso: confirma el envío y pide el código de un solo uso. */
function CodeStep({ email, labels: l, onVerify, onChangeEmail }: CodeStepProps) {
  const [token, setToken] = React.useState('')
  const [state, setState] = React.useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = React.useState('')

  const codeRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => codeRef.current?.focus(), [])

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    // Si la verificación redirige, la navegación ocurre sin volver aquí
    const { error } = await onVerify(email, token)

    if (error) {
      setState('error')
      setErrorMsg(error)
      codeRef.current?.focus()
    }
  }

  return (
    <div className="space-y-5">
      <div role="status" aria-live="polite" className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          {l.success}{' '}
          <strong>{email}</strong>.
        </p>
        <p className="mt-1 text-xs text-green-700">
          {l.successNote}
        </p>
      </div>

      <form onSubmit={handleVerify} noValidate className="space-y-5" aria-label={l.codeFormAriaLabel}>
        <div className="space-y-1.5">
          <Label htmlFor="auth-code">
            {l.code}
          </Label>
          <Input
            ref={codeRef}
            id="auth-code"
            type="text"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={10}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
            disabled={state === 'loading'}
            required
            aria-required="true"
            aria-invalid={state === 'error' ? 'true' : undefined}
            aria-describedby={state === 'error' ? 'auth-code-error' : 'auth-code-hint'}
          />
          {state !== 'error' && (
            <p id="auth-code-hint" className="text-xs text-gray-500">
              {l.codeHint}
            </p>
          )}
        </div>

        <p
          id="auth-code-error"
          role="alert"
          aria-live="assertive"
          className={state === 'error' ? 'text-sm font-medium text-red-700' : 'sr-only'}
        >
          {state === 'error' ? errorMsg : ''}
        </p>

        <Button
          type="submit"
          className="w-full"
          disabled={state === 'loading' || token.length < 6}
          aria-disabled={state === 'loading' || token.length < 6}
        >
          {state === 'loading' ? (
            <>
              <span className="sr-only">{l.verifyingSr}</span>
              <span aria-hidden="true">{l.verifying}</span>
            </>
          ) : (
            l.verify
          )}
        </Button>

        <button
          type="button"
          onClick={onChangeEmail}
          className="w-full text-center text-sm text-[#005fcc] underline underline-offset-2 hover:text-[#004db3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        >
          {l.changeEmail}
        </button>
      </form>
    </div>
  )
}
