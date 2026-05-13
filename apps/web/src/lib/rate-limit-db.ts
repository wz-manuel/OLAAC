import { createServiceClient } from '@/lib/supabase/server'

/**
 * Rate limiter persistente respaldado por Supabase.
 * A diferencia del rate limiter en memoria (rate-limit.ts), este sobrevive
 * entre workers de Vercel y es consistente en producción distribuida.
 *
 * Usa la función SQL rate_limit_check (SECURITY DEFINER) para un upsert
 * atómico — no hay race conditions entre requests concurrentes.
 *
 * Limitación de free tier: si la llamada a Supabase falla, se permite la
 * request (fail-open) para no bloquear flujos legítimos por errores de red.
 */
export async function checkRateLimitDb(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ success: boolean }> {
  // Redondea hacia abajo al inicio de la ventana actual
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString()

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.rpc('rate_limit_check', {
      p_key: key,
      p_window_start: windowStart,
      p_limit: limit,
    })

    if (error) return { success: true }
    return { success: data === true }
  } catch {
    return { success: true }
  }
}
