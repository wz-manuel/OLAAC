'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import * as React from 'react'

import { completarPerfil, type CompletarPerfilError } from '@/lib/actions/profile'

// Mismos valores que el registro de olaac.org (se guardan tal cual en user_profiles.pais)
const PAISES_LATAM = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala',
  'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay',
  'Perú', 'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela',
  'España', 'Otro',
]

const ERROR_KEYS = {
  sesion: 'errorSesion',
  nombre: 'errorNombre',
  pais: 'errorPais',
  guardar: 'errorGuardar',
} as const satisfies Record<CompletarPerfilError, string>

interface CompleteProfileFormProps {
  email: string
  /** Ruta relativa ya validada (puede incluir prefijo de idioma) */
  redirectTo: string
}

export function CompleteProfileForm({ email, redirectTo }: CompleteProfileFormProps) {
  const t = useTranslations('profile')
  const router = useRouter()
  const [nombre, setNombre] = React.useState('')
  const [pais, setPais] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<CompletarPerfilError | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await completarPerfil({ nombre, pais })

    setLoading(false)
    if (result.error) { setError(result.error); return }

    router.refresh()
    router.push(redirectTo)
  }

  const disabled = loading || nombre.trim().length < 2 || !pais

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label={t('formAriaLabel')}>
      <p className="text-sm text-gray-600">
        {t.rich('sesionComo', { email, strong: (chunks) => <strong>{chunks}</strong> })}
      </p>

      <div className="space-y-1.5">
        <label htmlFor="cp-nombre" className="block text-sm font-medium text-gray-700">
          {t('nombre')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="cp-nombre"
          type="text"
          autoComplete="name"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          aria-required="true"
          aria-invalid={error === 'nombre' ? 'true' : undefined}
          aria-describedby={error ? 'cp-error' : undefined}
          minLength={2}
          placeholder={t('nombrePlaceholder')}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="cp-pais" className="block text-sm font-medium text-gray-700">
          {t('pais')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="cp-pais"
          autoComplete="country-name"
          value={pais}
          onChange={e => setPais(e.target.value)}
          required
          aria-required="true"
          aria-invalid={error === 'pais' ? 'true' : undefined}
          aria-describedby={error ? 'cp-error' : undefined}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        >
          <option value="">{t('paisPlaceholder')}</option>
          {PAISES_LATAM.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {error && (
        <p id="cp-error" role="alert" className="text-sm font-medium text-red-700">
          {t(ERROR_KEYS[error])}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled}
        aria-disabled={disabled}
        aria-busy={loading}
        className="w-full rounded-lg bg-[#252858] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2d3476] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
      >
        {loading ? t('guardando') : t('guardar')}
      </button>
    </form>
  )
}
