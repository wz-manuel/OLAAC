'use client'

import { useEffect, useState } from 'react'

/**
 * useReducedMotion — Detecta la preferencia del usuario por movimiento reducido.
 * Úsalo para deshabilitar animaciones cuando prefers-reduced-motion: reduce.
 * Requisito WCAG 2.1 — Criterio 2.3.3 (Animación desde interacciones).
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}
