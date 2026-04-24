'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyBienvenida } from '@/lib/email'

export interface EnviarOtpData {
  email: string
  nombre: string
  pais: string
}

export interface VerificarOtpData {
  email: string
  token: string
  nombre: string
  pais: string
}

export interface RegistroResult {
  error?: string
}

/** Envía un código OTP de 6 dígitos al email para verificar la cuenta. */
export async function enviarOtpRegistro(data: EnviarOtpData): Promise<RegistroResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email: data.email,
    options: {
      shouldCreateUser: true,
      data: {
        nombre_completo: data.nombre,
        pais: data.pais,
      },
    },
  })

  if (error) return { error: error.message }
  return {}
}

/** Verifica el OTP, crea la sesión y registra el perfil del usuario. */
export async function verificarOtpYRegistrar(data: VerificarOtpData): Promise<RegistroResult & { nombre?: string }> {
  const supabase = await createClient()

  const { data: authData, error: otpError } = await supabase.auth.verifyOtp({
    email: data.email,
    token: data.token,
    type: 'email',
  })

  if (otpError) {
    if (otpError.message.includes('expired') || otpError.message.includes('invalid')) {
      return { error: 'El código no es válido o ha expirado. Solicita uno nuevo.' }
    }
    return { error: otpError.message }
  }

  const user = authData.user
  if (!user) return { error: 'No se pudo completar la verificación. Intenta de nuevo.' }

  // Crear o actualizar el perfil
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: user.id,
        email: user.email ?? data.email,
        nombre_completo: data.nombre,
        pais: data.pais,
        roles: ['general'],
        onboarding_complete: true,
      },
      { onConflict: 'user_id' }
    )

  if (profileError) return { error: profileError.message }

  await notifyBienvenida({ to: user.email ?? data.email, nombre: data.nombre, userId: user.id })

  return { nombre: data.nombre }
}

/** Completa el perfil de un usuario ya autenticado (vía Magic Link previo). */
export async function completarPerfil(data: {
  nombre: string
  pais: string
}): Promise<RegistroResult> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'Sesión no encontrada. Inicia sesión nuevamente.' }

  const { error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: user.id,
        email: user.email ?? '',
        nombre_completo: data.nombre,
        pais: data.pais,
        roles: ['general'],
        onboarding_complete: true,
      },
      { onConflict: 'user_id' }
    )

  if (error) return { error: error.message }

  await notifyBienvenida({ to: user.email ?? '', nombre: data.nombre, userId: user.id })

  return {}
}
