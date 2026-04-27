'use client'

import { Button, Label } from '@olaac/ui'
import * as React from 'react'
import { useFormState, useFormStatus } from 'react-dom'

import { submitAuditResult, type AuditResultState } from '@/lib/actions/voluntarios'

import { WcagCriteriaPanel } from './wcag-criteria-panel'

interface AuditResultFormProps {
  ticketId: string
  ticketFolio: string
}

const INITIAL_STATE: AuditResultState = { error: null }

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
          <span className="sr-only">Enviando resultados, por favor espera…</span>
          <span aria-hidden="true">Enviando…</span>
        </>
      ) : (
        'Enviar resultados de auditoría'
      )}
    </Button>
  )
}

export function AuditResultForm({ ticketId, ticketFolio }: AuditResultFormProps) {
  const boundAction = submitAuditResult.bind(null, ticketId)
  const [state, action] = useFormState(boundAction, INITIAL_STATE)
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
        aria-label="Resultados enviados correctamente"
        className="rounded-lg border border-green-200 bg-green-50 p-5 focus-visible:outline-none"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100"
            aria-hidden="true"
          >
            <svg className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <p className="font-semibold text-green-800">Resultados enviados</p>
            <p className="text-sm text-green-700">
              El ticket <span className="font-mono">{ticketFolio}</span> ha pasado a revisión por el equipo OLAAC.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form
      action={action}
      noValidate
      className="space-y-6"
      aria-label={`Formulario de resultados de auditoría para el ticket ${ticketFolio}`}
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

      {/* Resumen ejecutivo */}
      <div className="space-y-1.5">
        <Label htmlFor="resumen">
          Resumen ejecutivo{' '}
          <span aria-hidden="true" className="text-red-600">*</span>
        </Label>
        <textarea
          id="resumen"
          name="resumen"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.resumen}
          aria-describedby={state.fieldErrors?.resumen ? 'error-resumen' : 'hint-resumen'}
          rows={4}
          placeholder="Describe el estado general de accesibilidad del sitio: qué encontraste, qué impacto tiene para los usuarios y cuál es la gravedad global."
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 aria-[invalid=true]:border-red-600"
        />
        {state.fieldErrors?.resumen ? (
          <p id="error-resumen" role="alert" className="text-xs text-red-600">
            {state.fieldErrors.resumen}
          </p>
        ) : (
          <p id="hint-resumen" className="text-xs text-gray-500">
            Mínimo 30 caracteres. Escribe en lenguaje claro para audiencias no técnicas.
          </p>
        )}
      </div>

      {/* Recomendaciones */}
      <div className="space-y-1.5">
        <Label htmlFor="recomendaciones">
          Recomendaciones{' '}
          <span className="text-xs font-normal text-gray-500">(opcional)</span>
        </Label>
        <textarea
          id="recomendaciones"
          name="recomendaciones"
          rows={3}
          aria-describedby="hint-recomendaciones"
          placeholder="Pasos accionables, priorizados por impacto. Se compartirán con el equipo OLAAC."
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
        />
        <p id="hint-recomendaciones" className="text-xs text-gray-500">
          ¿Qué acciones concretas debería tomar el equipo responsable del sitio?
        </p>
      </div>

      {/* Panel de criterios WCAG estructurados */}
      <div className="border-t border-gray-100 pt-5">
        <WcagCriteriaPanel />
        <p className="mt-2 text-xs text-gray-500">
          Evalúa los criterios que apliquen al sitio. Los criterios de medios (audio/vídeo) puedes marcarlos como
          N/A si el sitio no tiene ese tipo de contenido.
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}
