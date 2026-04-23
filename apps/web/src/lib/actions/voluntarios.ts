'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApplicationState {
  error: string | null
  fieldErrors?: Partial<Record<'nombre_completo' | 'pais' | 'motivacion', string>>
  success?: boolean
}

export interface CertificationState {
  error: string | null
  certified?: boolean
  pendingCourses?: string[]
}

export interface AuditResultState {
  error: string | null
  fieldErrors?: Partial<Record<'resumen', string>>
  success?: boolean
}

// ─── submitApplication ────────────────────────────────────────────────────────

export async function submitApplication(
  _prevState: ApplicationState,
  formData: FormData
): Promise<ApplicationState> {
  const nombre_completo     = formData.get('nombre_completo')?.toString().trim() ?? ''
  const pais                = formData.get('pais')?.toString().trim() ?? ''
  const motivacion          = formData.get('motivacion')?.toString().trim() ?? ''
  const experiencia_previa  = formData.get('experiencia_previa')?.toString().trim() || null

  const fieldErrors: ApplicationState['fieldErrors'] = {}

  if (!nombre_completo) fieldErrors.nombre_completo = 'Tu nombre completo es obligatorio'
  if (!pais)            fieldErrors.pais = 'Selecciona tu país'
  if (!motivacion) {
    fieldErrors.motivacion = 'La motivación es obligatoria'
  } else if (motivacion.length < 50) {
    fieldErrors.motivacion = `Describe tu motivación con al menos 50 caracteres (tienes ${motivacion.length})`
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Corrige los campos marcados antes de continuar', fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para enviar tu solicitud' }

  const { error } = await supabase
    .from('volunteer_applications')
    .insert({ user_id: user.id, email_contacto: user.email ?? null, nombre_completo, pais, motivacion, experiencia_previa })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya tienes una solicitud registrada. Consulta el estado en tu panel.' }
    }
    return { error: `Error al enviar la solicitud: ${error.message}` }
  }

  revalidatePath('/voluntarios/mi-panel')
  return { error: null, success: true }
}

// ─── checkCertification ───────────────────────────────────────────────────────
// Verifica si el auditor completó todos los cursos obligatorios del learning
// path. Si es así, actualiza su perfil a 'certificado'.

export async function checkCertification(
  _prevState: CertificationState,
  _formData: FormData
): Promise<CertificationState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const { data: profile } = await supabase
    .from('auditor_profiles')
    .select('id, estado')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { error: 'No tienes un perfil de auditor activo' }

  if (profile.estado === 'certificado' || profile.estado === 'activo') {
    return { error: null, certified: true }
  }

  // Obtener cursos obligatorios del learning path con sus títulos
  const { data: pathCourses } = await supabase
    .from('auditor_learning_path')
    .select('course_id, courses(titulo)')
    .eq('obligatorio', true)

  if (!pathCourses || pathCourses.length === 0) {
    return { error: 'No hay cursos requeridos configurados aún. Contacta al equipo OLAAC.' }
  }

  const courseIds = pathCourses.map(p => p.course_id)

  const { data: completions } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('user_id', user.id)
    .eq('estado', 'completado')
    .in('course_id', courseIds)

  const completedIds = new Set((completions ?? []).map(c => c.course_id))
  const pendingCourses = pathCourses
    .filter(p => !completedIds.has(p.course_id))
    .map(p => {
      const course = p.courses as { titulo: string } | null
      return course?.titulo ?? p.course_id
    })

  if (pendingCourses.length > 0) {
    return { error: null, certified: false, pendingCourses }
  }

  const { error: updateError } = await supabase
    .from('auditor_profiles')
    .update({ estado: 'certificado', certified_at: new Date().toISOString() })
    .eq('id', profile.id)

  if (updateError) return { error: `Error al actualizar tu perfil: ${updateError.message}` }

  revalidatePath('/voluntarios/mi-panel')
  return { error: null, certified: true }
}

// ─── submitAuditResult ────────────────────────────────────────────────────────

export async function submitAuditResult(
  ticketId: string,
  _prevState: AuditResultState,
  formData: FormData
): Promise<AuditResultState> {
  const resumen         = formData.get('resumen')?.toString().trim() ?? ''
  const hallazgosRaw    = formData.get('hallazgos')?.toString().trim() ?? ''
  const recomendaciones = formData.get('recomendaciones')?.toString().trim() || null

  const fieldErrors: AuditResultState['fieldErrors'] = {}

  if (!resumen) {
    fieldErrors.resumen = 'El resumen ejecutivo es obligatorio'
  } else if (resumen.length < 30) {
    fieldErrors.resumen = `El resumen debe tener al menos 30 caracteres (tienes ${resumen.length})`
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Corrige los campos marcados', fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para enviar resultados' }

  const { data: profile } = await supabase
    .from('auditor_profiles')
    .select('id, estado')
    .eq('user_id', user.id)
    .single()

  if (!profile || !['certificado', 'activo'].includes(profile.estado)) {
    return { error: 'Solo auditores certificados pueden enviar resultados de auditoría' }
  }

  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, assigned_to')
    .eq('id', ticketId)
    .single()

  if (!ticket) return { error: 'Ticket no encontrado' }
  if (ticket.assigned_to !== user.id) {
    return { error: 'Este ticket no está asignado a ti' }
  }

  // Parsear hallazgos: una línea por hallazgo → array de { descripcion }
  const hallazgos = hallazgosRaw
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(descripcion => ({ descripcion }))

  const { error: insertError } = await supabase
    .from('audit_submissions')
    .insert({ ticket_id: ticketId, auditor_id: profile.id, resumen, hallazgos, recomendaciones })

  if (insertError) {
    if (insertError.code === '23505') {
      return { error: 'Ya enviaste resultados de auditoría para este ticket' }
    }
    return { error: `Error al guardar los resultados: ${insertError.message}` }
  }

  await supabase.from('ticket_events').insert({
    ticket_id: ticketId,
    user_id: user.id,
    evento: 'Resultados de auditoría enviados',
    payload: { auditor_id: profile.id, resumen_preview: resumen.slice(0, 120) },
  })

  // El ticket pasa a en_revision para que el equipo OLAAC revise los resultados
  await supabase
    .from('tickets')
    .update({ estado: 'en_revision' })
    .eq('id', ticketId)
    .eq('assigned_to', user.id)

  revalidatePath(`/tickets/${ticketId}`)
  revalidatePath('/voluntarios/mi-panel')

  return { error: null, success: true }
}
