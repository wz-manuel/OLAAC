'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrgRegistroState {
  error: string | null
  fieldErrors?: Partial<Record<
    'nombre_organizacion' | 'tipo' | 'sitio_web' | 'contacto_nombre' | 'contacto_email' | 'pais',
    string
  >>
  success?: boolean
}

export interface SolicitudState {
  error: string | null
  fieldErrors?: Partial<Record<'nivel_solicitado', string>>
  success?: boolean
  folio?: string
}

export interface EtapaState {
  error: string | null
  success?: boolean
}

// ─── registrarOrganizacion ────────────────────────────────────────────────────

export async function registrarOrganizacion(
  _prevState: OrgRegistroState,
  formData: FormData
): Promise<OrgRegistroState> {
  const nombre_organizacion = formData.get('nombre_organizacion')?.toString().trim() ?? ''
  const tipo                = formData.get('tipo')?.toString().trim() ?? ''
  const sitio_web           = formData.get('sitio_web')?.toString().trim() ?? ''
  const descripcion         = formData.get('descripcion')?.toString().trim() || null
  const logo_url            = formData.get('logo_url')?.toString().trim() || null
  const contacto_nombre     = formData.get('contacto_nombre')?.toString().trim() ?? ''
  const contacto_email      = formData.get('contacto_email')?.toString().trim() ?? ''
  const contacto_telefono   = formData.get('contacto_telefono')?.toString().trim() || null
  const pais                = formData.get('pais')?.toString().trim() ?? ''

  const fieldErrors: OrgRegistroState['fieldErrors'] = {}

  if (!nombre_organizacion) fieldErrors.nombre_organizacion = 'El nombre de la organización es obligatorio'
  if (!tipo)                fieldErrors.tipo = 'Selecciona el tipo de organización'
  if (!sitio_web)           fieldErrors.sitio_web = 'El sitio web es obligatorio'
  if (!contacto_nombre)     fieldErrors.contacto_nombre = 'El nombre del contacto es obligatorio'
  if (!contacto_email)      fieldErrors.contacto_email = 'El correo de contacto es obligatorio'
  if (!pais)                fieldErrors.pais = 'El país es obligatorio'

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Corrige los campos marcados antes de continuar', fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para registrar tu organización' }

  const { error } = await supabase
    .from('organizaciones_distintivo')
    .insert({
      user_id: user.id,
      nombre_organizacion,
      tipo: tipo as 'publica' | 'privada' | 'mixta' | 'ong',
      sitio_web,
      descripcion,
      logo_url,
      contacto_nombre,
      contacto_email,
      contacto_telefono,
      pais,
    })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya tienes una organización registrada. Accede desde tu panel.' }
    }
    return { error: `Error al registrar la organización: ${error.message}` }
  }

  revalidatePath('/distintivo/mi-organizacion')
  redirect('/distintivo/mi-organizacion')
}

// ─── enviarSolicitud ──────────────────────────────────────────────────────────

export async function enviarSolicitud(
  _prevState: SolicitudState,
  formData: FormData
): Promise<SolicitudState> {
  const nivel_solicitado = formData.get('nivel_solicitado')?.toString().trim() ?? ''

  if (!['oro', 'platino', 'diamante'].includes(nivel_solicitado)) {
    return { error: 'Selecciona un nivel de distintivo válido', fieldErrors: { nivel_solicitado: 'Nivel inválido' } }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para enviar la solicitud' }

  const { data: org } = await supabase
    .from('organizaciones_distintivo')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!org) return { error: 'Primero debes registrar tu organización' }

  // Verificar que no haya una solicitud activa
  const { data: activa } = await supabase
    .from('solicitudes_distintivo')
    .select('id, estado')
    .eq('organizacion_id', org.id)
    .not('estado', 'in', '(rechazada,revocada)')
    .maybeSingle()

  if (activa) {
    return { error: 'Ya tienes una solicitud activa. Consulta su estado en tu panel.' }
  }

  const { data: solicitud, error: insertError } = await supabase
    .from('solicitudes_distintivo')
    .insert({
      organizacion_id: org.id,
      nivel_solicitado: nivel_solicitado as 'oro' | 'platino' | 'diamante',
      estado: 'enviada' as const,
      folio: '',
    })
    .select('folio')
    .single()

  if (insertError) return { error: `Error al enviar la solicitud: ${insertError.message}` }

  revalidatePath('/distintivo/mi-organizacion')
  redirect(`/distintivo/mi-organizacion?enviada=1`)
}

// ─── actualizarEtapa (admin/sistema) ─────────────────────────────────────────

export async function actualizarEtapa(
  solicitudId: string,
  etapa: string,
  estado: string,
  extras?: { ticket_id?: string; curso_id?: string; notas?: string }
): Promise<EtapaState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('etapas_progreso')
    .upsert({
      solicitud_id: solicitudId,
      etapa: etapa as 'concientizacion' | 'capacitacion' | 'auditoria' | 'remediacion' | 'design_ops' | 'politicas' | 'declaratoria',
      estado: estado as 'pendiente' | 'en_curso' | 'completada' | 'omitida',
      ...(extras?.ticket_id && { ticket_id: extras.ticket_id }),
      ...(extras?.curso_id && { curso_id: extras.curso_id }),
      ...(extras?.notas && { notas: extras.notas }),
      ...(estado === 'completada' && { fecha_completada: new Date().toISOString() }),
      ...(estado === 'en_curso' && { fecha_inicio: new Date().toISOString() }),
    }, { onConflict: 'solicitud_id,etapa' })

  if (error) return { error: error.message }

  revalidatePath(`/admin/distintivos/${solicitudId}`)
  revalidatePath('/distintivo/mi-organizacion/progreso')
  return { error: null, success: true }
}

// ─── aprobarSolicitud (admin) ─────────────────────────────────────────────────

export async function aprobarSolicitud(solicitudId: string): Promise<EtapaState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const etapas: string[] = [
    'concientizacion', 'capacitacion', 'auditoria',
    'remediacion', 'design_ops', 'politicas', 'declaratoria',
  ]

  const { error: updError } = await supabase
    .from('solicitudes_distintivo')
    .update({
      estado: 'aprobada_para_programa',
      etapa_actual: 'concientizacion',
      fecha_inicio_programa: new Date().toISOString(),
    })
    .eq('id', solicitudId)

  if (updError) return { error: updError.message }

  // Crear filas de etapas_progreso para cada etapa
  const rows = etapas.map(etapa => ({
    solicitud_id: solicitudId,
    etapa: etapa as 'concientizacion' | 'capacitacion' | 'auditoria' | 'remediacion' | 'design_ops' | 'politicas' | 'declaratoria',
    estado: 'pendiente' as const,
  }))

  await supabase.from('etapas_progreso').insert(rows)

  revalidatePath(`/admin/distintivos/${solicitudId}`)
  revalidatePath('/admin/distintivos')
  return { error: null, success: true }
}

// ─── emitirDistintivo (admin) ─────────────────────────────────────────────────

export async function emitirDistintivo(
  solicitudId: string,
  nivelOtorgado: string,
  metricas: {
    tareas_accesibles: number
    flujos_accesibles: number
    experiencias_accesibles: number
    total_tareas: number
    total_flujos: number
    total_experiencias: number
  }
): Promise<EtapaState & { folio?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: solicitud } = await supabase
    .from('solicitudes_distintivo')
    .select('organizacion_id, nivel_solicitado')
    .eq('id', solicitudId)
    .single()

  if (!solicitud) return { error: 'Solicitud no encontrada' }

  const { data: criterio } = await supabase
    .from('criterios_distintivo')
    .select('vigencia_meses')
    .eq('nivel', nivelOtorgado as 'oro' | 'platino' | 'diamante')
    .single()

  const vigenciaMeses = criterio?.vigencia_meses ?? 12
  const fechaEmision = new Date()
  const fechaVencimiento = new Date(fechaEmision)
  fechaVencimiento.setMonth(fechaVencimiento.getMonth() + vigenciaMeses)

  const embedHtml = `<a href="https://olaac.org/distintivo/verificar/{{folio}}" target="_blank" rel="noopener noreferrer" title="Distintivo de Accesibilidad OLAAC — Nivel ${nivelOtorgado}">
  <img src="https://olaac.org/api/distintivo/badge/{{folio}}.svg" alt="Distintivo de Accesibilidad OLAAC nivel ${nivelOtorgado}" width="120" height="120" />
</a>`

  const { data: distintivo, error: emitirError } = await supabase
    .from('distintivos_emitidos')
    .insert({
      solicitud_id: solicitudId,
      organizacion_id: solicitud.organizacion_id,
      nivel: nivelOtorgado as 'oro' | 'platino' | 'diamante',
      folio: '',
      embed_html: embedHtml,
      fecha_vencimiento: fechaVencimiento.toISOString(),
    })
    .select('folio')
    .single()

  if (emitirError) return { error: emitirError.message }

  await supabase
    .from('solicitudes_distintivo')
    .update({
      estado: 'distintivo_emitido' as const,
      nivel_otorgado: nivelOtorgado as 'oro' | 'platino' | 'diamante',
      fecha_emision: fechaEmision.toISOString(),
      ...metricas,
    })
    .eq('id', solicitudId)

  revalidatePath(`/admin/distintivos/${solicitudId}`)
  revalidatePath('/admin/distintivos')
  revalidatePath('/distintivo/mi-organizacion')

  return { error: null, success: true, folio: distintivo.folio }
}

// ─── rechazarSolicitud (admin) ────────────────────────────────────────────────

export async function rechazarSolicitud(
  solicitudId: string,
  notas: string
): Promise<EtapaState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('solicitudes_distintivo')
    .update({ estado: 'rechazada', notas_admin: notas })
    .eq('id', solicitudId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/distintivos/${solicitudId}`)
  revalidatePath('/admin/distintivos')
  return { error: null, success: true }
}
