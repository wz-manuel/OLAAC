'use client'

import { Button, Input, Label, Toast } from '@olaac/ui'
import Link from 'next/link'
import * as React from 'react'
import { useFormState, useFormStatus } from 'react-dom'

import { solicitarAuditoria, type SolicitarAuditoriaState } from '@/lib/actions/scores'

// ──────────────────────────────────────────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────────────────────────────────────────

const INITIAL_STATE: SolicitarAuditoriaState = { error: null }

const PAISES_LATAM = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia',
  'Costa Rica', 'Cuba', 'Ecuador', 'El Salvador', 'Guatemala',
  'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay',
  'Perú', 'República Dominicana', 'Uruguay', 'Venezuela',
] as const

// ──────────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ──────────────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────────────────────

/**
 * SolicitarUrlForm — Formulario de solicitud de ingreso al dashboard de scores.
 *
 * Flujo de éxito:
 *   1. Server Action devuelve { success: true, folio, ticketId }
 *   2. useEffect detecta el cambio y abre el Toast
 *   3. El Toast muestra el folio OLAAC-YYYY-XXXX con enlace al ticket
 *   4. El formulario se reemplaza por un estado de confirmación con CTA
 *
 * WCAG:
 *   - 1.3.1: todos los campos con <label> asociado (htmlFor)
 *   - 2.1.1: navegación completa por teclado
 *   - 4.1.3: errores y éxito anunciados con aria-live / role="alert"
 *   - 2.4.3: foco gestionado al mostrar el estado de éxito (useRef + focus)
 */
export function SolicitarUrlForm() {
  const [state, action] = useFormState(solicitarAuditoria, INITIAL_STATE)
  const [toastOpen, setToastOpen] = React.useState(false)
  const successRef = React.useRef<HTMLDivElement>(null)

  // Abrir Toast cuando el Server Action devuelve éxito
  React.useEffect(() => {
    if (state.success && state.folio) {
      setToastOpen(true)
      // Mover el foco al panel de confirmación (WCAG 2.4.3)
      // requestAnimationFrame asegura que el DOM ya renderizó el nuevo estado
      requestAnimationFrame(() => successRef.current?.focus())
    }
  }, [state.success, state.folio])

  // ── Estado de éxito — reemplaza el formulario ──────────────────────────
  if (state.success && state.folio && state.ticketId) {
    return (
      <Toast.Provider swipeDirection="right" duration={10_000}>
        <div
          ref={successRef}
          tabIndex={-1}
          className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-6 focus-visible:outline-none"
          role="status"
          aria-label="Solicitud enviada correctamente"
        >
          {/* Icono de éxito */}
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
              <p className="font-semibold text-green-800">¡Solicitud enviada correctamente!</p>
              <p className="text-sm text-green-700">
                Folio de seguimiento:{' '}
                <strong className="font-mono">{state.folio}</strong>
              </p>
            </div>
          </div>

          <p className="text-sm text-green-700">
            El equipo OLAAC revisará tu solicitud. Puedes consultar el estado en cualquier momento
            desde el sistema de tickets.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/tickets/${state.ticketId}`}>
                Ver mi ticket ({state.folio})
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/scores">Volver al dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Toast — anuncio inmediato para tecnologías asistivas */}
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
        >
          <div className="flex-1 space-y-1">
            <Toast.Title className="text-sm font-semibold text-gray-900">
              Solicitud recibida
            </Toast.Title>
            <Toast.Description className="text-sm text-gray-600">
              Tu folio es{' '}
              <span className="font-mono font-semibold text-gray-900">{state.folio}</span>.
              El equipo OLAAC te contactará pronto.
            </Toast.Description>
          </div>
          <Toast.Close
            aria-label="Cerrar notificación"
            className="shrink-0 rounded p-1 text-gray-500 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc]"
          >
            <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </Toast.Close>
        </Toast.Root>

        <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2 focus-visible:outline-none" />
      </Toast.Provider>
    )
  }

  // ── Formulario ─────────────────────────────────────────────────────────
  return (
    <form action={action} noValidate className="space-y-6" aria-label="Formulario de solicitud de auditoría de accesibilidad">

      {/* Error global */}
      {state.error && !state.success && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {/* Nombre del sitio */}
      <div className="space-y-1.5">
        <Label htmlFor="nombre_sitio">
          Nombre del sitio o institución{' '}
          <span aria-hidden="true" className="text-red-600">*</span>
        </Label>
        <Input
          id="nombre_sitio"
          name="nombre_sitio"
          type="text"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.nombre_sitio}
          aria-describedby={state.fieldErrors?.nombre_sitio ? 'error-nombre' : 'hint-nombre'}
          placeholder="Ej: Instituto Mexicano del Seguro Social"
          autoComplete="organization"
        />
        {state.fieldErrors?.nombre_sitio ? (
          <p id="error-nombre" role="alert" className="text-xs text-red-600">
            {state.fieldErrors.nombre_sitio}
          </p>
        ) : (
          <p id="hint-nombre" className="text-xs text-gray-500">
            Nombre oficial del organismo o institución propietaria del sitio.
          </p>
        )}
      </div>

      {/* URL */}
      <div className="space-y-1.5">
        <Label htmlFor="url">
          URL del sitio{' '}
          <span aria-hidden="true" className="text-red-600">*</span>
        </Label>
        <Input
          id="url"
          name="url"
          type="url"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.url}
          aria-describedby={state.fieldErrors?.url ? 'error-url' : 'hint-url'}
          placeholder="https://www.ejemplo.gob.mx"
          autoComplete="url"
        />
        {state.fieldErrors?.url ? (
          <p id="error-url" role="alert" className="text-xs text-red-600">
            {state.fieldErrors.url}
          </p>
        ) : (
          <p id="hint-url" className="text-xs text-gray-500">
            URL completa del sitio o página que deseas incluir en la auditoría.
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
          <option value="" disabled>Selecciona el país…</option>
          {PAISES_LATAM.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {state.fieldErrors?.pais && (
          <p id="error-pais" role="alert" className="text-xs text-red-600">
            {state.fieldErrors.pais}
          </p>
        )}
      </div>

      {/* Motivo */}
      <div className="space-y-1.5">
        <Label htmlFor="motivo">
          Motivo de la solicitud{' '}
          <span aria-hidden="true" className="text-red-600">*</span>
        </Label>
        <textarea
          id="motivo"
          name="motivo"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.motivo}
          aria-describedby={state.fieldErrors?.motivo ? 'error-motivo' : 'hint-motivo'}
          rows={4}
          placeholder="¿Por qué es importante auditar este sitio? ¿Qué barreras de accesibilidad has identificado? ¿A qué población impacta?"
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-600"
        />
        {state.fieldErrors?.motivo ? (
          <p id="error-motivo" role="alert" className="text-xs text-red-600">
            {state.fieldErrors.motivo}
          </p>
        ) : (
          <p id="hint-motivo" className="text-xs text-gray-500">
            Mínimo 20 caracteres. Esta información ayuda al equipo OLAAC a priorizar las auditorías.
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  )
}
