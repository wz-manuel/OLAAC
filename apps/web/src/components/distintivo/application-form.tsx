'use client'

import { useActionState } from 'react'
import { Button } from '@olaac/ui'

import { registrarOrganizacion, type OrgRegistroState } from '@/lib/actions/distintivo'

const TIPOS = [
  { value: 'publica',  label: 'Pública' },
  { value: 'privada',  label: 'Privada' },
  { value: 'mixta',    label: 'Mixta' },
  { value: 'ong',      label: 'OSC / ONG' },
]

const PAISES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala',
  'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay',
  'Perú', 'República Dominicana', 'Uruguay', 'Venezuela',
]

const INITIAL: OrgRegistroState = { error: null }

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p role="alert" className="mt-1 text-xs text-red-600" id={`err-${msg.slice(0, 10)}`}>
      {msg}
    </p>
  )
}

export function ApplicationForm() {
  const [state, action, pending] = useActionState(registrarOrganizacion, INITIAL)

  return (
    <form action={action} noValidate className="space-y-8">
      {state.error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Datos de la organización */}
      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-gray-900">Datos de la organización</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre_organizacion" className="block text-sm font-medium text-gray-700">
              Nombre de la organización <span aria-hidden="true">*</span>
            </label>
            <input
              id="nombre_organizacion"
              name="nombre_organizacion"
              type="text"
              required
              autoComplete="organization"
              aria-describedby={state.fieldErrors?.nombre_organizacion ? 'err-nombre' : undefined}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
            />
            <FieldError msg={state.fieldErrors?.nombre_organizacion} />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
              Tipo de organización <span aria-hidden="true">*</span>
            </label>
            <select
              id="tipo"
              name="tipo"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
            >
              <option value="">Selecciona…</option>
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <FieldError msg={state.fieldErrors?.tipo} />
          </div>

          <div>
            <label htmlFor="sitio_web" className="block text-sm font-medium text-gray-700">
              Sitio web <span aria-hidden="true">*</span>
            </label>
            <input
              id="sitio_web"
              name="sitio_web"
              type="url"
              required
              placeholder="https://ejemplo.org"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
            />
            <FieldError msg={state.fieldErrors?.sitio_web} />
          </div>

          <div>
            <label htmlFor="pais" className="block text-sm font-medium text-gray-700">
              País <span aria-hidden="true">*</span>
            </label>
            <select
              id="pais"
              name="pais"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
            >
              <option value="">Selecciona…</option>
              {PAISES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <FieldError msg={state.fieldErrors?.pais} />
          </div>
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
            Descripción breve <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows={3}
            maxLength={500}
            placeholder="¿Qué hace tu organización y a quién sirve?"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
          />
        </div>
      </fieldset>

      {/* Persona de contacto */}
      <fieldset className="space-y-5">
        <legend className="text-base font-semibold text-gray-900">Persona de contacto</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contacto_nombre" className="block text-sm font-medium text-gray-700">
              Nombre completo <span aria-hidden="true">*</span>
            </label>
            <input
              id="contacto_nombre"
              name="contacto_nombre"
              type="text"
              required
              autoComplete="name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
            />
            <FieldError msg={state.fieldErrors?.contacto_nombre} />
          </div>

          <div>
            <label htmlFor="contacto_email" className="block text-sm font-medium text-gray-700">
              Correo electrónico <span aria-hidden="true">*</span>
            </label>
            <input
              id="contacto_email"
              name="contacto_email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
            />
            <FieldError msg={state.fieldErrors?.contacto_email} />
          </div>

          <div>
            <label htmlFor="contacto_telefono" className="block text-sm font-medium text-gray-700">
              Teléfono <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              id="contacto_telefono"
              name="contacto_telefono"
              type="tel"
              autoComplete="tel"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#005fcc] focus:outline-none focus:ring-1 focus:ring-[#005fcc]"
            />
          </div>
        </div>
      </fieldset>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? 'Registrando…' : 'Registrar organización y continuar'}
      </Button>
    </form>
  )
}
