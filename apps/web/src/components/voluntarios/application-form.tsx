'use client'

import { Button, Input, Label } from '@olaac/ui'
import Link from 'next/link'
import * as React from 'react'
import { useFormState, useFormStatus } from 'react-dom'

import { submitApplication, type ApplicationState } from '@/lib/actions/voluntarios'

const INITIAL_STATE: ApplicationState = { error: null }

const PAISES_LATAM = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala',
  'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay',
  'Perú', 'República Dominicana', 'Uruguay', 'Venezuela',
] as const

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full sm:w-auto"
    >
      {pending ? (
        <>
          <span className="sr-only">Enviando solicitud, por favor espera…</span>
          <span aria-hidden="true">Enviando…</span>
        </>
      ) : (
        'Enviar solicitud'
      )}
    </Button>
  )
}

export function ApplicationForm() {
  const [state, action] = useFormState(submitApplication, INITIAL_STATE)
  const successRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (state.success) {
      requestAnimationFrame(() => successRef.current?.focus())
    }
  }, [state.success])

  if (state.success) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-label="Solicitud enviada correctamente"
        className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-6 focus-visible:outline-none"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100"
            aria-hidden="true"
          >
            <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <p className="font-semibold text-green-800">¡Solicitud enviada!</p>
            <p className="text-sm text-green-700">El equipo OLAAC revisará tu solicitud y te contactará pronto.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/voluntarios/mi-panel">Ir a mi panel</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/voluntarios">Volver al programa</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      action={action}
      noValidate
      className="space-y-6"
      aria-label="Formulario de solicitud para ser auditor voluntario"
    >
      {state.error && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {/* Nombre completo */}
      <div className="space-y-1.5">
        <Label htmlFor="nombre_completo">
          Nombre completo{' '}
          <span aria-hidden="true" className="text-red-600">*</span>
        </Label>
        <Input
          id="nombre_completo"
          name="nombre_completo"
          type="text"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.nombre_completo}
          aria-describedby={state.fieldErrors?.nombre_completo ? 'error-nombre' : 'hint-nombre'}
          autoComplete="name"
          placeholder="Ej: María García López"
        />
        {state.fieldErrors?.nombre_completo ? (
          <p id="error-nombre" role="alert" className="text-xs text-red-600">
            {state.fieldErrors.nombre_completo}
          </p>
        ) : (
          <p id="hint-nombre" className="text-xs text-gray-500">
            Nombre tal como aparecerá en tu perfil de auditor.
          </p>
        )}
      </div>

      {/* País */}
      <div className="space-y-1.5">
        <Label htmlFor="pais">
          País{' '}
          <span aria-hidden="true" className="text-red-600">*</span>
        </Label>
        <select
          id="pais"
          name="pais"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.pais}
          aria-describedby={state.fieldErrors?.pais ? 'error-pais' : undefined}
          defaultValue=""
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 aria-[invalid=true]:border-red-600"
        >
          <option value="" disabled>Selecciona tu país…</option>
          {PAISES_LATAM.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {state.fieldErrors?.pais && (
          <p id="error-pais" role="alert" className="text-xs text-red-600">
            {state.fieldErrors.pais}
          </p>
        )}
      </div>

      {/* Motivación */}
      <div className="space-y-1.5">
        <Label htmlFor="motivacion">
          Motivación{' '}
          <span aria-hidden="true" className="text-red-600">*</span>
        </Label>
        <textarea
          id="motivacion"
          name="motivacion"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.motivacion}
          aria-describedby={state.fieldErrors?.motivacion ? 'error-motivacion' : 'hint-motivacion'}
          rows={5}
          placeholder="¿Por qué quieres ser auditor de accesibilidad? ¿Qué impacto esperas generar? ¿Tienes experiencia con personas con discapacidad o en tecnología accesible?"
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-600"
        />
        {state.fieldErrors?.motivacion ? (
          <p id="error-motivacion" role="alert" className="text-xs text-red-600">
            {state.fieldErrors.motivacion}
          </p>
        ) : (
          <p id="hint-motivacion" className="text-xs text-gray-500">
            Mínimo 50 caracteres. Esta es la parte más importante de tu solicitud.
          </p>
        )}
      </div>

      {/* Experiencia previa (opcional) */}
      <div className="space-y-1.5">
        <Label htmlFor="experiencia_previa">
          Experiencia previa{' '}
          <span className="text-xs font-normal text-gray-500">(opcional)</span>
        </Label>
        <textarea
          id="experiencia_previa"
          name="experiencia_previa"
          rows={3}
          aria-describedby="hint-experiencia"
          placeholder="Ej: desarrollador web, diseñador UX, docente de TIC, voluntario en organización de discapacidad…"
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        />
        <p id="hint-experiencia" className="text-xs text-gray-500">
          No es requisito. Comparte cualquier experiencia relevante con tecnología, educación o inclusión.
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}
