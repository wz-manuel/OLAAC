'use server'

import { notifyContactoRecibido } from '@/lib/email'
import { checkRateLimitDb } from '@/lib/rate-limit-db'
import { createServiceClient } from '@/lib/supabase/server'

export interface ContactarState {
  error: string | null
  folio?: string
  fieldErrors?: Partial<Record<'nombre' | 'email' | 'asunto' | 'mensaje', string>>
}

export const ASUNTOS_CONTACTO = [
  { value: 'barrera_digital',    label: 'Barrera de accesibilidad digital',    categoria: 'digital'      as const, titulo: 'Barrera de accesibilidad digital'      },
  { value: 'barrera_fisica',     label: 'Barrera de accesibilidad física',     categoria: 'fisico'       as const, titulo: 'Barrera de accesibilidad física'       },
  { value: 'comunicacion_na',    label: 'Comunicación no accesible',           categoria: 'comunicacion' as const, titulo: 'Comunicación no accesible'             },
  { value: 'servicio_na',        label: 'Servicio no accesible',               categoria: 'servicio'     as const, titulo: 'Servicio no accesible'                 },
  { value: 'distintivo',         label: 'Información sobre el Distintivo',     categoria: 'comunicacion' as const, titulo: 'Consulta: Distintivo de Accesibilidad' },
  { value: 'voluntariado',       label: 'Voluntariado y auditorías',           categoria: 'servicio'     as const, titulo: 'Consulta: Voluntariado y auditorías'   },
  { value: 'academia',           label: 'Academia y formación',                categoria: 'comunicacion' as const, titulo: 'Consulta: Academia y formación'        },
  { value: 'alianza',            label: 'Alianzas y colaboraciones',           categoria: 'comunicacion' as const, titulo: 'Propuesta: Alianza o colaboración'     },
  { value: 'prensa',             label: 'Prensa y medios',                     categoria: 'comunicacion' as const, titulo: 'Solicitud de prensa o medios'          },
  { value: 'otro',               label: 'Otro asunto',                         categoria: 'comunicacion' as const, titulo: 'Consulta general'                      },
] as const

export async function enviarContacto(
  _prev: ContactarState,
  formData: FormData
): Promise<ContactarState> {
  const nombre  = formData.get('nombre')?.toString().trim()  ?? ''
  const email   = formData.get('email')?.toString().trim()   ?? ''
  const asunto  = formData.get('asunto')?.toString()         ?? ''
  const mensaje = formData.get('mensaje')?.toString().trim() ?? ''

  const fieldErrors: ContactarState['fieldErrors'] = {}
  if (!nombre || nombre.length < 2)                           fieldErrors.nombre  = 'Ingresa tu nombre completo'
  if (!email  || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email   = 'Ingresa un correo válido'
  if (!asunto)                                                fieldErrors.asunto  = 'Selecciona un asunto'
  if (!mensaje || mensaje.length < 10)                        fieldErrors.mensaje = 'El mensaje es demasiado corto'
  if (mensaje.length > 2000)                                  fieldErrors.mensaje = 'El mensaje no puede superar 2,000 caracteres'

  if (Object.keys(fieldErrors).length > 0) {
    return { error: 'Corrige los campos marcados', fieldErrors }
  }

  // Rate limit: 5 mensajes por dirección de correo cada 15 minutos
  const rl = await checkRateLimitDb(`contacto:${email.toLowerCase()}`, 5, 15 * 60 * 1000)
  if (!rl.success) {
    return { error: 'Has enviado demasiados mensajes. Espera unos minutos antes de intentarlo de nuevo.' }
  }

  const asuntoData = ASUNTOS_CONTACTO.find(a => a.value === asunto)
  if (!asuntoData) return { error: 'Asunto no válido', fieldErrors: { asunto: 'Selecciona un asunto válido' } }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      titulo:          asuntoData.titulo,
      descripcion:     mensaje,
      categoria:       asuntoData.categoria,
      prioridad:       'media',
      folio:           '',   // trigger BEFORE INSERT genera OLAAC-YYYY-XXXX
      reporter_email:  email,
      reporter_nombre: nombre,
    })
    .select('id, folio')
    .single()

  if (error) return { error: 'No se pudo registrar tu mensaje. Intenta de nuevo.' }

  await notifyContactoRecibido({
    to:      email,
    nombre,
    folio:   data.folio,
    asunto:  asuntoData.label,
    mensaje,
  })

  return { error: null, folio: data.folio }
}
