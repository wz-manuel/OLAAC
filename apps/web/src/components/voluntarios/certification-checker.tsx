'use client'

import { Button } from '@olaac/ui'
import { useFormState, useFormStatus } from 'react-dom'

import { checkCertification, type CertificationState } from '@/lib/actions/voluntarios'

const INITIAL_STATE: CertificationState = { error: null }

function CheckButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      aria-disabled={pending}
      className="w-full sm:w-auto"
    >
      {pending ? (
        <>
          <span className="sr-only">Verificando, por favor espera…</span>
          <span aria-hidden="true">Verificando…</span>
        </>
      ) : (
        'Verificar mi certificación'
      )}
    </Button>
  )
}

export function CertificationChecker() {
  const [state, action] = useFormState(checkCertification, INITIAL_STATE)

  return (
    <div className="space-y-4">
      {state.error && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      {state.certified === true && !state.error && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          ¡Tu perfil ha sido actualizado a <strong>Certificado</strong>! Recarga la página para ver tu nuevo panel.
        </div>
      )}

      {state.certified === false && state.pendingCourses && state.pendingCourses.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <p className="font-medium">Aún te faltan cursos por completar:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {state.pendingCourses.map(curso => (
              <li key={curso}>{curso}</li>
            ))}
          </ul>
        </div>
      )}

      <form action={action}>
        <CheckButton />
      </form>

      <p className="text-xs text-gray-500">
        Presiona el botón una vez que hayas completado todos los cursos de la ruta de formación.
      </p>
    </div>
  )
}
