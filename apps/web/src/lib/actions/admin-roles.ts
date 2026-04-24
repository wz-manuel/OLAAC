'use server'

import { revalidatePath } from 'next/cache'

import { getAdminUser } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import type { Enums } from '@/lib/supabase/types'

export type RolUsuario = Enums<'rol_usuario'>

export interface UserWithProfile {
  userId: string
  email: string
  nombreCompleto: string
  pais: string | null
  roles: RolUsuario[]
  onboardingComplete: boolean
  createdAt: string
}

export interface AdminRolesState {
  error: string | null
  success?: boolean
}

async function requireAdmin() {
  const admin = await getAdminUser()
  if (!admin) throw new Error('No tienes permisos de administrador')
  const supabase = await createClient()
  return { supabase, admin }
}

export async function getUsersWithProfiles(opts?: {
  search?: string
  page?: number
  pageSize?: number
}): Promise<{ users: UserWithProfile[]; total: number; error: string | null }> {
  try {
    const { supabase } = await requireAdmin()

    const page     = opts?.page ?? 1
    const pageSize = opts?.pageSize ?? 20
    const from     = (page - 1) * pageSize
    const to       = from + pageSize - 1

    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (opts?.search) {
      query = query.or(
        `nombre_completo.ilike.%${opts.search}%,email.ilike.%${opts.search}%`
      )
    }

    const { data, error, count } = await query

    if (error) return { users: [], total: 0, error: error.message }

    const users: UserWithProfile[] = (data ?? []).map(row => ({
      userId:             row.user_id,
      email:              row.email,
      nombreCompleto:     row.nombre_completo,
      pais:               row.pais,
      roles:              row.roles as RolUsuario[],
      onboardingComplete: row.onboarding_complete,
      createdAt:          row.created_at,
    }))

    return { users, total: count ?? 0, error: null }
  } catch (e) {
    return { users: [], total: 0, error: (e as Error).message }
  }
}

export async function updateUserRoles(
  userId: string,
  roles: RolUsuario[],
  _prevState: AdminRolesState,
  _formData: FormData
): Promise<AdminRolesState> {
  try {
    const { supabase } = await requireAdmin()

    if (!Array.isArray(roles) || roles.length === 0) {
      return { error: 'El usuario debe tener al menos un rol' }
    }

    const validRoles: RolUsuario[] = ['general', 'voluntario', 'auditor', 'estudiante']
    const invalid = roles.filter(r => !validRoles.includes(r))
    if (invalid.length > 0) {
      return { error: `Roles inválidos: ${invalid.join(', ')}` }
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ roles })
      .eq('user_id', userId)

    if (error) return { error: error.message }

    revalidatePath('/admin/usuarios')
    return { error: null, success: true }
  } catch (e) {
    return { error: (e as Error).message }
  }
}
