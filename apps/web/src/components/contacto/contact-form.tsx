'use client'

import * as React from 'react'
import { useFormState, useFormStatus } from 'react-dom'

import { ASUNTOS_CONTACTO, enviarContacto, type ContactarState } from '@/lib/actions/contactar'

const INITIAL_STATE: ContactarState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full rounded-lg bg-brand-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
    >
      {pending ? (
        <><span className="sr-only">Enviando mensaje…</span><span aria-hidden="true">Enviando…</span></>
      ) : (
        'Enviar mensaje'
      )}
    </button>
  )
}

export function ContactForm() {
  const [state, action] = useFormState(enviarContacto, INITIAL_STATE)

  if (state.folio) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="space-y-4 rounded-xl border border-brand-100 bg-brand-50 p-8 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-800 text-white text-2xl" aria-hidden="true">
          ✓
        </div>
        <div>
          <p className="text-lg font-semibold text-brand-900">¡Mensaje recibido!</p>
          <p className="mt-1 text-sm text-brand-700">
            Tu folio de seguimiento es:
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-brand-800">
            {state.folio}
          </p>
        </div>
        <p className="text-sm text-gray-600">
          Te enviamos una copia a tu correo. Nuestro equipo revisará tu mensaje y te responderá a la brevedad.
        </p>
      </div>
    )
  }

  return (
    <form action={action} noValidate className="space-y-5" aria-label="Formulario de contacto OLAAC">

      {state.error && !state.fieldErrors && (
        <p role="alert" aria-live="assertive" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {/* Nombre */}
      <div className="space-y-1.5">
        <label htmlFor="cnt-nombre" className="block text-sm font-medium text-gray-700">
          Nombre completo <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="cnt-nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.nombre}
          aria-describedby={state.fieldErrors?.nombre ? 'err-nombre' : undefined}
          placeholder="Tu nombre completo"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 aria-[invalid=true]:border-red-500"
        />
        {state.fieldErrors?.nombre && (
          <p id="err-nombre" className="text-xs text-red-600">{state.fieldErrors.nombre}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="cnt-email" className="block text-sm font-medium text-gray-700">
          Correo electrónico <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="cnt-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.email}
          aria-describedby={state.fieldErrors?.email ? 'err-email' : 'hint-email'}
          placeholder="tu@correo.com"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 aria-[invalid=true]:border-red-500"
        />
        {state.fieldErrors?.email ? (
          <p id="err-email" className="text-xs text-red-600">{state.fieldErrors.email}</p>
        ) : (
          <p id="hint-email" className="text-xs text-gray-500">Te enviaremos una copia de tu mensaje y el folio de seguimiento.</p>
        )}
      </div>

      {/* Asunto */}
      <div className="space-y-1.5">
        <label htmlFor="cnt-asunto" className="block text-sm font-medium text-gray-700">
          Asunto <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="cnt-asunto"
          name="asunto"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.asunto}
          defaultValue=""
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 aria-[invalid=true]:border-red-500"
        >
          <option value="" disabled>Selecciona un asunto…</option>
          {ASUNTOS_CONTACTO.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
        {state.fieldErrors?.asunto && (
          <p className="text-xs text-red-600">{state.fieldErrors.asunto}</p>
        )}
      </div>

      {/* Mensaje */}
      <div className="space-y-1.5">
        <label htmlFor="cnt-mensaje" className="block text-sm font-medium text-gray-700">
          Mensaje <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea
          id="cnt-mensaje"
          name="mensaje"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.mensaje}
          aria-describedby={state.fieldErrors?.mensaje ? 'err-mensaje' : 'hint-mensaje'}
          rows={5}
          maxLength={2000}
          placeholder="Describe tu consulta, sugerencia o reporte con el mayor detalle posible."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 aria-[invalid=true]:border-red-500"
        />
        {state.fieldErrors?.mensaje ? (
          <p id="err-mensaje" className="text-xs text-red-600">{state.fieldErrors.mensaje}</p>
        ) : (
          <p id="hint-mensaje" className="text-xs text-gray-500">Máximo 2,000 caracteres.</p>
        )}
      </div>

      <SubmitButton />
    </form>
  )
}
