'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { completarPerfil } from '@/lib/actions/registro'

const PAISES_LATAM = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala',
  'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay',
  'Perú', 'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela',
  'España', 'Otro',
]

interface CompletarPerfilFormProps {
  email: string
  redirectTo: string
}

export function CompletarPerfilForm({ email, redirectTo }: CompletarPerfilFormProps) {
  const router = useRouter()
  const [nombre, setNombre] = React.useState('')
  const [pais, setPais]     = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError]   = React.useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await completarPerfil({ nombre, pais })

    setLoading(false)
    if (result.error) { setError(result.error); return }

    router.refresh()
    router.push(redirectTo)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-label="Completar perfil OLAAC">
      <p className="text-sm text-gray-600">
        Sesión iniciada como <strong>{email}</strong>. Completa tu perfil para continuar.
      </p>

      <div className="space-y-1.5">
        <label htmlFor="cp-nombre" className="block text-sm font-medium text-gray-700">
          Nombre completo <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="cp-nombre"
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
        <label htmlFor="cp-pais" className="block text-sm font-medium text-gray-700">
          País <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="cp-pais"
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
        <p role="alert" className="text-sm font-medium text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !nombre.trim() || !pais}
        aria-disabled={loading || !nombre.trim() || !pais}
        className="w-full rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
      >
        {loading ? 'Guardando…' : 'Guardar y continuar →'}
      </button>
    </form>
  )
}
