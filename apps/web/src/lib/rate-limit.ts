/**
 * Rate limiter en-memoria con ventana deslizante.
 * Funciona por instancia de Vercel — protege contra ráfagas por cliente
 * sin necesitar Redis. Para producción de alto tráfico, migrar a Upstash.
 */

interface WindowEntry {
  count: number
  resetAt: number
}

const store = new Map<string, WindowEntry>()

// Limpia entradas vencidas cada 5 minutos para evitar memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number; resetAt: number } {
  cleanup()

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}
