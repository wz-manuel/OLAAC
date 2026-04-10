import { Badge } from '@olaac/ui'
import type { Enums } from '@/lib/supabase/types'

const STATUS_MAP: Record<Enums<'ticket_status'>, { label: string; variant: 'default' | 'secondary' | 'outline' | 'success' | 'destructive' }> = {
  abierto:     { label: 'Abierto',      variant: 'default' },
  en_revision: { label: 'En revisión',  variant: 'secondary' },
  en_progreso: { label: 'En progreso',  variant: 'outline' },
  resuelto:    { label: 'Resuelto',     variant: 'success' },
  cerrado:     { label: 'Cerrado',      variant: 'secondary' },
}

export function StatusBadge({ status }: { status: Enums<'ticket_status'> }) {
  const { label, variant } = STATUS_MAP[status] ?? { label: status, variant: 'outline' }
  return <Badge variant={variant}>{label}</Badge>
}
