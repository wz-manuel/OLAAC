'use server'

import { createClient } from '@/lib/supabase/server'

export type CompletarPerfilError = 'sesion' | 'nombre' | 'pais' | 'guardar'

/**
 * Crea el perfil de un usuario ya autenticado (entró por Magic Link sin registro previo).
 * `user_profiles` es la misma tabla que usa olaac.org: el nombre guardado aquí
 * es el que se imprime en los certificados.
 */
export async function completarPerfil(data: {
  nombre: string
  pais: string
}): Promise<{ error?: CompletarPerfilError }> {
  const nombre = data.nombre.trim()
  const pais = data.pais.trim()

  if (nombre.length < 2) return { error: 'nombre' }
  if (!pais) return { error: 'pais' }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'sesion' }

  const { error } = await supabase.from('user_profiles').insert({
    user_id: user.id,
    email: user.email ?? '',
    nombre_completo: nombre,
    pais,
    roles: ['general'],
    onboarding_complete: true,
  })

  // 23505 = ya existe el perfil (p. ej. doble envío): no se sobrescribe
  if (error && error.code !== '23505') {
    console.error('[perfil/completar] insert error:', error.message)
    return { error: 'guardar' }
  }

  return {}
}
