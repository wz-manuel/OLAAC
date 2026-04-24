'use server'

import { revalidatePath } from 'next/cache'

import { getAdminUser } from '@/lib/admin'
import {
  notifyTicketAsignadoAdmin,
  notifyVoluntarioAprobado,
  notifyVoluntarioRechazado,
} from '@/lib/email'
import { createClient } from '@/lib/supabase/server'
import type { Enums } from '@/lib/supabase/types'

export interface AdminActionState {
  error: string | null
  success?: boolean
}

// ─── Helper: verifica admin y devuelve cliente ────────────────────────────────

async function requireAdmin() {
  const admin = await getAdminUser()
  if (!admin) throw new Error('No tienes permisos de administrador')
  const supabase = await createClient()
  return { supabase, admin }
}

// ─── Gestión de solicitudes de voluntarios ────────────────────────────────────

export async function approveApplication(
  applicationId: string,
  nombreCompleto: string,
  pais: string,
  _prevState: AdminActionState,
  _formData: FormData
): Promise<AdminActionState> {
  try {
    const { supabase, admin } = await requireAdmin()

    // Obtener el user_id del solicitante
    const { data: application, error: fetchError } = await supabase
      .from('volunteer_applications')
      .select('user_id, estado')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) return { error: 'Solicitud no encontrada' }
    if (application.estado !== 'pendiente') return { error: 'La solicitud ya fue procesada' }

    // Crear perfil de auditor (INSERT)
    const { error: profileError } = await supabase
      .from('auditor_profiles')
      .insert({
        user_id:         application.user_id,
        nombre_completo: nombreCompleto,
        pais:            pais,
        estado:          'en_formacion',
      })

    if (profileError && profileError.code !== '23505') {
      return { error: `Error al crear perfil: ${profileError.message}` }
    }

    // Actualizar estado de la solicitud
    const { error: updateError } = await supabase
      .from('volunteer_applications')
      .update({
        estado:      'aprobado',
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin.id,
      })
      .eq('id', applicationId)

    if (updateError) return { error: `Error al actualizar solicitud: ${updateError.message}` }

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('email, nombre_completo')
      .eq('user_id', application.user_id)
      .maybeSingle()

    if (userProfile) {
      await notifyVoluntarioAprobado({
        to: userProfile.email,
        nombre: userProfile.nombre_completo,
        userId: application.user_id,
      })
    }

    revalidatePath('/admin/voluntarios')
    revalidatePath(`/admin/voluntarios/${application.user_id}`)
    return { error: null, success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function rejectApplication(
  applicationId: string,
  _prevState: AdminActionState,
  _formData: FormData
): Promise<AdminActionState> {
  try {
    const { supabase, admin } = await requireAdmin()

    const { data: application } = await supabase
      .from('volunteer_applications')
      .select('user_id')
      .eq('id', applicationId)
      .maybeSingle()

    const { error } = await supabase
      .from('volunteer_applications')
      .update({
        estado:      'rechazado',
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin.id,
      })
      .eq('id', applicationId)
      .eq('estado', 'pendiente')

    if (error) return { error: error.message }

    if (application) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('email, nombre_completo')
        .eq('user_id', application.user_id)
        .maybeSingle()

      if (userProfile) {
        await notifyVoluntarioRechazado({
          to: userProfile.email,
          nombre: userProfile.nombre_completo,
          userId: application.user_id,
        })
      }
    }

    revalidatePath('/admin/voluntarios')
    return { error: null, success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ─── Gestión de ruta de formación ─────────────────────────────────────────────

export async function addCourseToPath(
  courseId: string,
  _prevState: AdminActionState,
  _formData: FormData
): Promise<AdminActionState> {
  try {
    const { supabase } = await requireAdmin()

    // Calcular el siguiente orden
    const { data: existing } = await supabase
      .from('auditor_learning_path')
      .select('orden')
      .order('orden', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrden = (existing?.orden ?? -1) + 1

    const { error } = await supabase
      .from('auditor_learning_path')
      .insert({ course_id: courseId, orden: nextOrden })

    if (error) {
      if (error.code === '23505') return { error: 'Este curso ya está en la ruta' }
      return { error: error.message }
    }

    revalidatePath('/admin/ruta-de-formacion')
    return { error: null, success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function removeCourseFromPath(
  pathId: string,
  _prevState: AdminActionState,
  _formData: FormData
): Promise<AdminActionState> {
  try {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
      .from('auditor_learning_path')
      .delete()
      .eq('id', pathId)

    if (error) return { error: error.message }

    revalidatePath('/admin/ruta-de-formacion')
    return { error: null, success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function updatePathCourse(
  pathId: string,
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const { supabase } = await requireAdmin()

    const ordenRaw = formData.get('orden')?.toString()
    const obligatorio = formData.get('obligatorio') === 'on'
    const orden = ordenRaw ? parseInt(ordenRaw, 10) : undefined

    const updates: Record<string, unknown> = { obligatorio }
    if (orden !== undefined && !isNaN(orden)) updates.orden = orden

    const { error } = await supabase
      .from('auditor_learning_path')
      .update(updates)
      .eq('id', pathId)

    if (error) return { error: error.message }

    revalidatePath('/admin/ruta-de-formacion')
    return { error: null, success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

// ─── Gestión de tickets ───────────────────────────────────────────────────────

export async function assignTicket(
  ticketId: string,
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const { supabase, admin } = await requireAdmin()

    const auditorUserId = formData.get('auditor_user_id')?.toString()
    if (!auditorUserId) return { error: 'Selecciona un auditor' }

    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: auditorUserId, estado: 'en_progreso' })
      .eq('id', ticketId)

    if (error) return { error: error.message }

    await supabase.from('ticket_events').insert({
      ticket_id: ticketId,
      user_id:   admin.id,
      evento:    'Ticket asignado a auditor',
      payload:   { auditor_user_id: auditorUserId },
    })

    const [{ data: ticket }, { data: auditorProfile }] = await Promise.all([
      supabase.from('tickets').select('folio, titulo, prioridad').eq('id', ticketId).maybeSingle(),
      supabase.from('user_profiles').select('email, nombre_completo').eq('user_id', auditorUserId).maybeSingle(),
    ])

    if (ticket && auditorProfile) {
      await notifyTicketAsignadoAdmin({
        to:          auditorProfile.email,
        userId:      auditorUserId,
        nombreAdmin: auditorProfile.nombre_completo,
        folio:       ticket.folio,
        titulo:      ticket.titulo,
        prioridad:   ticket.prioridad,
      })
    }

    revalidatePath('/admin/tickets')
    revalidatePath(`/tickets/${ticketId}`)
    return { error: null, success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function unassignTicket(
  ticketId: string,
  _prevState: AdminActionState,
  _formData: FormData
): Promise<AdminActionState> {
  try {
    const { supabase, admin } = await requireAdmin()

    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: null, estado: 'abierto' })
      .eq('id', ticketId)

    if (error) return { error: error.message }

    await supabase.from('ticket_events').insert({
      ticket_id: ticketId,
      user_id:   admin.id,
      evento:    'Asignación de auditor removida',
      payload:   null,
    })

    revalidatePath('/admin/tickets')
    revalidatePath(`/tickets/${ticketId}`)
    return { error: null, success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function updateTicketStatus(
  ticketId: string,
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const { supabase, admin } = await requireAdmin()

    const estado = formData.get('estado')?.toString() as Enums<'ticket_status'> | undefined
    if (!estado) return { error: 'Selecciona un estado' }

    const updates: Record<string, unknown> = { estado }
    if (estado === 'resuelto') updates.resolved_at = new Date().toISOString()

    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)

    if (error) return { error: error.message }

    await supabase.from('ticket_events').insert({
      ticket_id: ticketId,
      user_id:   admin.id,
      evento:    `Estado cambiado a ${estado}`,
      payload:   { nuevo_estado: estado },
    })

    revalidatePath('/admin/tickets')
    revalidatePath(`/tickets/${ticketId}`)
    return { error: null, success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}
