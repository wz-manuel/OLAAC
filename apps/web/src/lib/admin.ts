import { createClient } from '@/lib/supabase/server'

/**
 * Verifica si el usuario de la sesión actual es administrador.
 * Devuelve el user object o null si no está autenticado / no es admin.
 */
export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return data ? user : null
}
