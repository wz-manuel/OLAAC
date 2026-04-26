'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

// ──────────────────────────────────────────────────────────────────────────────
// Tipos del estado del formulario
// ──────────────────────────────────────────────────────────────────────────────

export interface SolicitarAuditoriaState {
  error: string | null
  fieldErrors?: Partial<Record<'nombre_sitio' | 'url' | 'pais' | 'motivo', string>>
  // Estado de éxito — la UI muestra el Toast con el folio
  success?: boolean
  folio?: string
  ticketId?: string
}

// ──────────────────────────────────────────────────────────────────────────────
// Server Action: solicitar ingreso de URL al dashboard de scores
// ──────────────────────────────────────────────────────────────────────────────
// No hace redirect() en éxito: devuelve { success, folio, ticketId } para que
// el cliente muestre el Toast con el folio generado por el trigger de la BD.
// ──────────────────────────────────────────────────────────────────────────────

export async function solicitarAuditoria(
  _prevState: SolicitarAuditoriaState,
  formData: FormData
): Promise<SolicitarAuditoriaState> {
  // ── Extracción de campos ─────────────────────────────────────────────────
  const nombre_sitio = formData.get('nombre_sitio')?.toString().trim() ?? ''
  const url          = formData.get('url')?.toString().trim() ?? ''
  const pais         = formData.get('pais')?.toString().trim() ?? ''
  const motivo       = formData.get('motivo')?.toString().trim() ?? ''

  // ── Validación ───────────────────────────────────────────────────────────
  const fieldErrors: SolicitarAuditoriaState['fieldErrors'] = {}

  if (!nombre_sitio) {
    fieldErrors.nombre_sitio = 'El nombre del sitio es obligatorio'
  }

  if (!url) {
    fieldErrors.url = 'La URL es obligatoria'
  } else {
    try {
      const parsed = new URL(url)
      // Permitir solo http/https — rechazar data:, javascript:, etc.
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        fieldErrors.url = 'La URL debe comenzar con http:// o https://'
      }
    } catch {
      fieldErrors.url = 'Ingresa una URL válida (ej: https://ejemplo.gob.mx)'
    }
  }

  if (!pais) {
    fieldErrors.pais = 'Selecciona el país de origen del sitio'
  }

  if (!motivo) {
    fieldErrors.motivo = 'El motivo de la solicitud es obligatorio'
  } else if (motivo.length < 20) {
    fieldErrors.motivo = 'El motivo debe tener al menos 20 caracteres'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Corrige los campos marcados antes de continuar', fieldErrors }
  }

  // ── Autenticación ────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tu sesión expiró. Vuelve a iniciar sesión e intenta de nuevo.' }

  // ── Inserción en tickets ─────────────────────────────────────────────────
  // ticket_status no tiene valor 'recibido' — se usa 'abierto' (estado inicial)
  // El folio OLAAC-YYYY-XXXX es generado por el trigger set_ticket_folio
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      titulo:       `[Solicitud de ingreso] ${nombre_sitio}`,
      descripcion:  `Solicitud de ingreso al dashboard para la URL: ${url}\n\n**País:** ${pais}\n\n**Motivo:**\n${motivo}`,
      categoria:    'digital',
      prioridad:    'media',
      estado:       'abierto',
      url_afectada: url,
      created_by:   user.id,
      folio:        '', // El trigger BEFORE INSERT lo sobreescribe con OLAAC-YYYY-XXXX
    })
    .select('id, folio')
    .single()

  if (error) return { error: `Error al enviar la solicitud: ${error.message}` }

  revalidatePath('/tickets')
  revalidatePath('/tickets/mis-reportes')

  return {
    error: null,
    success: true,
    folio: data.folio,
    ticketId: data.id,
  }
}
