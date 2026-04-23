'use client'

import { useFormState, useFormStatus } from 'react-dom'

import { approveApplication, rejectApplication, type AdminActionState } from '@/lib/actions/admin'

interface ApproveRejectButtonsProps {
  applicationId: string
  nombreCompleto: string
  pais: string
}

const INITIAL: AdminActionState = { error: null }

function ActionButton({
  children,
  variant,
}: {
  children: React.ReactNode
  variant: 'approve' | 'reject'
}) {
  const { pending } = useFormStatus()
  const base = 'inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005fcc] focus-visible:ring-offset-2'
  const styles =
    variant === 'approve'
      ? 'bg-green-600 text-white hover:bg-green-700'
      : 'bg-white text-red-700 border border-red-300 hover:bg-red-50'

  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={`${base} ${styles}`}>
      {pending ? 'Procesando…' : children}
    </button>
  )
}

export function ApproveRejectButtons({ applicationId, nombreCompleto, pais }: ApproveRejectButtonsProps) {
  const boundApprove = approveApplication.bind(null, applicationId, nombreCompleto, pais)
  const boundReject  = rejectApplication.bind(null, applicationId)

  const [approveState, approveAction] = useFormState(boundApprove, INITIAL)
  const [rejectState,  rejectAction]  = useFormState(boundReject,  INITIAL)

  if (approveState.success) {
    return <p role="status" className="text-sm font-medium text-green-700">Solicitud aprobada</p>
  }
  if (rejectState.success) {
    return <p role="status" className="text-sm font-medium text-red-700">Solicitud rechazada</p>
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {approveState.error && (
        <p role="alert" className="w-full text-xs text-red-600">{approveState.error}</p>
      )}
      {rejectState.error && (
        <p role="alert" className="w-full text-xs text-red-600">{rejectState.error}</p>
      )}
      <form action={approveAction}>
        <ActionButton variant="approve">Aprobar solicitud</ActionButton>
      </form>
      <form action={rejectAction}>
        <ActionButton variant="reject">Rechazar</ActionButton>
      </form>
    </div>
  )
}
