'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import type { Enums } from '@/lib/supabase/types'

export interface TicketFormState {
  error: string | null
  fieldErrors?: Partial<Record<'titulo' | 'descripcion' | 'categoria' | 'prioridad', string>>
}

export async function createTicket(
  _prevState: TicketFormState,
  formData: FormData
): Promise<TicketFormState> {
  const titulo = formData.get('titulo')?.toString().trim() ?? ''
  const descripcion = formData.get('descripcion')?.toString().trim() ?? ''
  const categoria = formData.get('categoria')?.toString() as Enums<'ticket_category'>
  const prioridad = formData.get('prioridad')?.toString() as Enums<'ticket_priority'>
  const url_afectada = formData.get('url_afectada')?.toString().trim() || null

  // Validación básica
  const fieldErrors: TicketFormState['fieldErrors'] = {}
  if (!titulo) fieldErrors.titulo = 'El título es obligatorio'
  if (!descripcion) fieldErrors.descripcion = 'La descripción es obligatoria'
  if (!categoria) fieldErrors.categoria = 'Selecciona una categoría'
  if (!prioridad) fieldErrors.prioridad = 'Selecciona una prioridad'

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Corrige los campos marcados', fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Debes iniciar sesión para reportar un ticket' }

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      titulo,
      descripcion,
      categoria,
      prioridad,
      url_afectada,
      created_by: user.id,
      folio: '', // el trigger BEFORE INSERT lo sobreescribe con OLAAC-YYYY-XXXX
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/tickets')
  revalidatePath('/tickets/mis-reportes')
  redirect(`/tickets/${data.id}`)
}
