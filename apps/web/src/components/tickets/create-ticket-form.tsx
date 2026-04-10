'use client'

import { useFormState, useFormStatus } from 'react-dom'

import { Button, Input, Label } from '@olaac/ui'
import { createTicket, type TicketFormState } from '@/lib/actions/tickets'

const INITIAL_STATE: TicketFormState = { error: null }

const CATEGORIAS = [
  { value: 'digital',      label: 'Digital' },
  { value: 'fisico',       label: 'Físico' },
  { value: 'comunicacion', label: 'Comunicación' },
  { value: 'servicio',     label: 'Servicio' },
]

const PRIORIDADES = [
  { value: 'baja',    label: 'Baja' },
  { value: 'media',   label: 'Media' },
  { value: 'alta',    label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <><span className="sr-only">Enviando reporte…</span><span aria-hidden>Enviando…</span></>
      ) : (
        'Enviar reporte'
      )}
    </Button>
  )
}

export function CreateTicketForm() {
  const [state, action] = useFormState(createTicket, INITIAL_STATE)

  return (
    <form action={action} noValidate className="space-y-6" aria-label="Formulario de nuevo ticket">

      {/* Error global */}
      {state.error && (
        <p role="alert" aria-live="assertive" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {/* Título */}
      <div className="space-y-1.5">
        <Label htmlFor="titulo">Título <span aria-hidden="true" className="text-red-600">*</span></Label>
        <Input
          id="titulo"
          name="titulo"
          type="text"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.titulo}
          aria-describedby={state.fieldErrors?.titulo ? 'error-titulo' : undefined}
          placeholder="Ej: El botón de contraste no funciona en móvil"
        />
        {state.fieldErrors?.titulo && (
          <p id="error-titulo" className="text-xs text-red-600">{state.fieldErrors.titulo}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción <span aria-hidden="true" className="text-red-600">*</span></Label>
        <textarea
          id="descripcion"
          name="descripcion"
          required
          aria-required="true"
          aria-invalid={!!state.fieldErrors?.descripcion}
          aria-describedby={state.fieldErrors?.descripcion ? 'error-descripcion' : 'hint-descripcion'}
          rows={4}
          placeholder="Describe el problema con el mayor detalle posible: pasos para reproducirlo, tecnología asistiva afectada, etc."
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-600"
        />
        {state.fieldErrors?.descripcion ? (
          <p id="error-descripcion" className="text-xs text-red-600">{state.fieldErrors.descripcion}</p>
        ) : (
          <p id="hint-descripcion" className="text-xs text-gray-500">Incluye pasos para reproducir, tecnología asistiva afectada y dispositivo.</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Categoría */}
        <div className="space-y-1.5">
          <Label htmlFor="categoria">Categoría <span aria-hidden="true" className="text-red-600">*</span></Label>
          <select
            id="categoria"
            name="categoria"
            required
            aria-required="true"
            aria-invalid={!!state.fieldErrors?.categoria}
            defaultValue=""
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
          >
            <option value="" disabled>Selecciona…</option>
            {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          {state.fieldErrors?.categoria && (
            <p className="text-xs text-red-600">{state.fieldErrors.categoria}</p>
          )}
        </div>

        {/* Prioridad */}
        <div className="space-y-1.5">
          <Label htmlFor="prioridad">Prioridad <span aria-hidden="true" className="text-red-600">*</span></Label>
          <select
            id="prioridad"
            name="prioridad"
            required
            aria-required="true"
            aria-invalid={!!state.fieldErrors?.prioridad}
            defaultValue="media"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2"
          >
            {PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {state.fieldErrors?.prioridad && (
            <p className="text-xs text-red-600">{state.fieldErrors.prioridad}</p>
          )}
        </div>
      </div>

      {/* URL afectada (opcional) */}
      <div className="space-y-1.5">
        <Label htmlFor="url_afectada">URL afectada <span className="text-gray-400 font-normal text-xs">(opcional)</span></Label>
        <Input
          id="url_afectada"
          name="url_afectada"
          type="url"
          placeholder="https://ejemplo.gob.mx/pagina"
          aria-describedby="hint-url"
        />
        <p id="hint-url" className="text-xs text-gray-500">Pega la URL exacta donde encontraste el problema.</p>
      </div>

      <SubmitButton />
    </form>
  )
}
