'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import type { EnviarOtpData, VerificarOtpData } from '@/lib/actions/registro'

const PAISES_LATAM = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala',
  'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay',
  'Perú', 'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela',
  'España', 'Otro',
]

type Step = 'datos' | 'verificar' | 'exito'

interface RegisterFormProps {
  onEnviarOtp: (data: EnviarOtpData) => Promise<{ error?: string }>
  onVerificarOtp: (data: VerificarOtpData) => Promise<{ error?: string; nombre?: string }>
  redirectTo: string
  contexto?: 'voluntario' | 'academia' | 'distintivo' | null
}

const CONTEXTO_LABEL: Record<string, string> = {
  voluntario:  'para unirte como auditor voluntario',
  academia:    'para acceder a los cursos de la Academia',
  distintivo:  'para solicitar el Distintivo de Accesibilidad',
}

export function RegisterForm({ onEnviarOtp, onVerificarOtp, redirectTo, contexto }: RegisterFormProps) {
  const router = useRouter()

  const [step, setStep]       = React.useState<Step>('datos')
  const [loading, setLoading] = React.useState(false)
  const [error, setError]     = React.useState('')
  const [nombre, setNombre]   = React.useState('')
  const [email, setEmail]     = React.useState('')
  const [pais, setPais]       = React.useState('')
  const [otp, setOtp]         = React.useState('')
  const [bienvenida, setBienvenida] = React.useState('')

  const otpInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (step === 'verificar') otpInputRef.current?.focus()
  }, [step])

  async function handleDatos(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await onEnviarOtp({ email, nombre, pais })

    setLoading(false)
    if (result.error) { setError(result.error); return }
    setStep('verificar')
  }

  async function handleVerificar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await onVerificarOtp({ email, token: otp, nombre, pais })

    setLoading(false)
    if (result.error) { setError(result.error); return }

    setBienvenida(result.nombre ?? nombre)
    setStep('exito')
  }

  function handleOtpChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(val)
  }

  // ── Éxito ────────────────────────────────────────────────────────────────────
  if (step === 'exito') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="space-y-5 rounded-xl border border-brand-100 bg-brand-50 p-8 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-800 text-white text-2xl" aria-hidden="true">
          ✓
        </div>
        <div>
          <p className="text-lg font-semibold text-brand-900">¡Bienvenido/a, {bienvenida}!</p>
          <p className="mt-1 text-sm text-brand-600">Tu cuenta ha sido creada y verificada.</p>
        </div>
        <button
          onClick={() => { router.refresh(); router.push(redirectTo) }}
          className="w-full rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        >
          Continuar →
        </button>
      </div>
    )
  }

  // ── Verificar OTP ─────────────────────────────────────────────────────────────
  if (step === 'verificar') {
    return (
      <form onSubmit={handleVerificar} noValidate className="space-y-5" aria-label="Verificar correo electrónico">
        <div className="space-y-1 text-center">
          <p className="text-sm text-gray-600">Enviamos un código de 6 dígitos a</p>
          <p className="font-semibold text-brand-800">{email}</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700">
            Código de verificación
          </label>
          <input
            ref={otpInputRef}
            id="otp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            placeholder="000000"
            required
            aria-required="true"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'otp-error' : 'otp-hint'}
            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
          />
          {!error && (
            <p id="otp-hint" className="text-xs text-gray-500">
              Revisa tu bandeja de entrada y carpeta de spam. El código expira en 1 hora.
            </p>
          )}
        </div>

        {error && (
          <p id="otp-error" role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          aria-disabled={loading || otp.length < 6}
          className="w-full rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        >
          {loading ? (
            <><span className="sr-only">Verificando…</span><span aria-hidden="true">Verificando…</span></>
          ) : (
            'Verificar y crear cuenta'
          )}
        </button>

        <button
          type="button"
          onClick={() => { setStep('datos'); setOtp(''); setError('') }}
          className="w-full text-sm text-brand-600 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:rounded"
        >
          ← Cambiar correo
        </button>
      </form>
    )
  }

  // ── Datos (step 1) ────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleDatos} noValidate className="space-y-4" aria-label="Crear cuenta OLAAC">
      {contexto && (
        <p className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-800 border border-accent-200">
          Estás creando tu cuenta {CONTEXTO_LABEL[contexto]}.
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="reg-nombre" className="block text-sm font-medium text-gray-700">
          Nombre completo <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="reg-nombre"
          type="text"
          autoComplete="name"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          aria-required="true"
          minLength={2}
          placeholder="Tu nombre completo"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
          Correo electrónico <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          aria-required="true"
          placeholder="tu@correo.com"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        />
        <p className="text-xs text-gray-500">
          Te enviaremos un código de verificación. No necesitas contraseña.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reg-pais" className="block text-sm font-medium text-gray-700">
          País <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="reg-pais"
          value={pais}
          onChange={e => setPais(e.target.value)}
          required
          aria-required="true"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        >
          <option value="">Selecciona tu país</option>
          {PAISES_LATAM.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !nombre.trim() || !email || !pais}
        aria-disabled={loading || !nombre.trim() || !email || !pais}
        className="w-full rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
      >
        {loading ? (
          <><span className="sr-only">Enviando código…</span><span aria-hidden="true">Enviando código…</span></>
        ) : (
          'Continuar →'
        )}
      </button>
    </form>
  )
}
