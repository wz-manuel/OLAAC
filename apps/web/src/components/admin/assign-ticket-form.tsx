'use client'

import { useFormState, useFormStatus } from 'react-dom'

import { assignTicket, unassignTicket, updateTicketStatus, type AdminActionState } from '@/lib/actions/admin'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Auditor {
  user_id: string
  nombre_completo: string
  pais: string
}

interface AssignTicketFormProps {
  ticketId: string
  assignedUserId: string | null
  auditors: Auditor[]
}

interface UpdateStatusFormProps {
  ticketId: string
  currentStatus: string
}

const INITIAL: AdminActionState = { error: null }

// ─── SubmitButton ─────────────────────────────────────────────────────────────

function SubmitBtn({ label, variant = 'primary' }: { label: string; variant?: 'primary' | 'secondary' }) {
  const { pending } = useFormStatus()
  const styles =
    variant === 'primary'
      ? 'bg-[#005fcc] text-white hover:bg-[#004db3]'
      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`inline-flex rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] ${styles}`}
    >
      {pending ? 'Procesando…' : label}
    </button>
  )
}

// ─── AssignTicketForm ─────────────────────────────────────────────────────────

export function AssignTicketForm({ ticketId, assignedUserId, auditors }: AssignTicketFormProps) {
  const boundAssign   = assignTicket.bind(null, ticketId)
  const boundUnassign = unassignTicket.bind(null, ticketId)

  const [assignState,   assignAction]   = useFormState(boundAssign,   INITIAL)
  const [unassignState, unassignAction] = useFormState(boundUnassign, INITIAL)

  return (
    <div className="space-y-3">
      <form action={assignAction} className="flex flex-wrap items-end gap-3">
        {assignState.error && (
          <p role="alert" className="w-full text-xs text-red-600">{assignState.error}</p>
        )}
        {assignState.success && (
          <p role="status" className="w-full text-xs text-green-700 font-medium">Asignado correctamente</p>
        )}

        <div className="flex-1 min-w-[180px] space-y-1">
          <label htmlFor={`auditor-${ticketId}`} className="block text-xs font-medium text-gray-700">
            Asignar a auditor
          </label>
          <select
            id={`auditor-${ticketId}`}
            name="auditor_user_id"
            required
            defaultValue={assignedUserId ?? ''}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005fcc]"
            aria-label="Seleccionar auditor certificado"
          >
            <option value="" disabled>Selecciona un auditor…</option>
            {auditors.map(a => (
              <option key={a.user_id} value={a.user_id}>
                {a.nombre_completo} ({a.pais})
              </option>
            ))}
          </select>
        </div>

        <SubmitBtn label="Asignar" />
      </form>

      {assignedUserId && (
        <form action={unassignAction}>
          {unassignState.error && (
            <p role="alert" className="mb-1 text-xs text-red-600">{unassignState.error}</p>
          )}
          <SubmitBtn label="Remover asignación" variant="secondary" />
        </form>
      )}
    </div>
  )
}

// ─── UpdateStatusForm ─────────────────────────────────────────────────────────

const ESTADOS = [
  { value: 'abierto',      label: 'Abierto' },
  { value: 'en_revision',  label: 'En revisión' },
  { value: 'en_progreso',  label: 'En progreso' },
  { value: 'resuelto',     label: 'Resuelto' },
  { value: 'cerrado',      label: 'Cerrado' },
]

export function UpdateStatusForm({ ticketId, currentStatus }: UpdateStatusFormProps) {
  const bound = updateTicketStatus.bind(null, ticketId)
  const [state, action] = useFormState(bound, INITIAL)

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      {state.error && (
        <p role="alert" className="w-full text-xs text-red-600">{state.error}</p>
      )}

      <div className="space-y-1">
        <label htmlFor={`estado-${ticketId}`} className="block text-xs font-medium text-gray-700">
          Estado
        </label>
        <select
          id={`estado-${ticketId}`}
          name="estado"
          defaultValue={currentStatus}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005fcc]"
        >
          {ESTADOS.map(e => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
      </div>

      <SubmitBtn label={state.success ? 'Guardado' : 'Actualizar'} />
    </form>
  )
}
