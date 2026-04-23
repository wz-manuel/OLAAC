'use client'

import { useFormState, useFormStatus } from 'react-dom'

import { addCourseToPath, removeCourseFromPath, updatePathCourse, type AdminActionState } from '@/lib/actions/admin'

// ─── Shared ──────────────────────────────────────────────────────────────────

const INITIAL: AdminActionState = { error: null }

function SubmitBtn({ label, variant = 'default' }: { label: string; variant?: 'default' | 'danger' | 'outline' }) {
  const { pending } = useFormStatus()
  const styles = {
    default:  'bg-[#005fcc] text-white hover:bg-[#004db3]',
    danger:   'bg-white text-red-700 border border-red-300 hover:bg-red-50',
    outline:  'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  }[variant]

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] ${styles}`}
    >
      {pending ? '…' : label}
    </button>
  )
}

// ─── AddToPathButton ─────────────────────────────────────────────────────────

export function AddToPathButton({ courseId }: { courseId: string }) {
  const bound = addCourseToPath.bind(null, courseId)
  const [state, action] = useFormState(bound, INITIAL)

  if (state.success) return <span className="text-xs text-green-700 font-medium">Añadido</span>

  return (
    <form action={action}>
      {state.error && <p role="alert" className="mb-1 text-xs text-red-600">{state.error}</p>}
      <SubmitBtn label="Añadir a la ruta" />
    </form>
  )
}

// ─── RemoveFromPathButton ─────────────────────────────────────────────────────

export function RemoveFromPathButton({ pathId }: { pathId: string }) {
  const bound = removeCourseFromPath.bind(null, pathId)
  const [state, action] = useFormState(bound, INITIAL)

  if (state.success) return <span className="text-xs text-gray-500">Eliminado</span>

  return (
    <form action={action}>
      {state.error && <p role="alert" className="mb-1 text-xs text-red-600">{state.error}</p>}
      <SubmitBtn label="Eliminar" variant="danger" />
    </form>
  )
}

// ─── UpdatePathCourseForm ─────────────────────────────────────────────────────

interface UpdatePathCourseFormProps {
  pathId: string
  currentOrden: number
  currentObligatorio: boolean
}

export function UpdatePathCourseForm({ pathId, currentOrden, currentObligatorio }: UpdatePathCourseFormProps) {
  const bound = updatePathCourse.bind(null, pathId)
  const [state, action] = useFormState(bound, INITIAL)

  return (
    <form action={action} className="flex items-center gap-3">
      {state.error && <p role="alert" className="text-xs text-red-600">{state.error}</p>}

      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
        <input
          type="number"
          name="orden"
          defaultValue={currentOrden}
          min={0}
          aria-label="Orden en la ruta"
          className="w-14 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#005fcc]"
        />
        <span>orden</span>
      </label>

      <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          name="obligatorio"
          defaultChecked={currentObligatorio}
          className="rounded border-gray-300 text-[#005fcc] focus:ring-[#005fcc]"
        />
        Obligatorio
      </label>

      <SubmitBtn label={state.success ? 'Guardado' : 'Guardar'} variant="outline" />
    </form>
  )
}
