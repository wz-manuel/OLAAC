import { Badge } from '@olaac/ui'
import type { Enums } from '@/lib/supabase/types'

const PRIORITY_MAP: Record<Enums<'ticket_priority'>, { label: string; variant: 'default' | 'secondary' | 'outline' | 'success' | 'destructive' }> = {
  baja:    { label: 'Baja',    variant: 'outline' },
  media:   { label: 'Media',   variant: 'secondary' },
  alta:    { label: 'Alta',    variant: 'default' },
  critica: { label: 'Crítica', variant: 'destructive' },
}

export function PriorityBadge({ priority }: { priority: Enums<'ticket_priority'> }) {
  const { label, variant } = PRIORITY_MAP[priority] ?? { label: priority, variant: 'outline' }
  return <Badge variant={variant}>{label}</Badge>
}
