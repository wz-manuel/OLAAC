'use client'

import { useCallback, useEffect, useRef } from 'react'

type Politeness = 'polite' | 'assertive'

/**
 * useAnnounce — Envía mensajes a lectores de pantalla vía aria-live.
 * - 'polite': el lector espera a que el usuario termine antes de anunciar.
 * - 'assertive': interrumpe inmediatamente (usar con moderación).
 */
export function useAnnounce() {
  const regionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.setAttribute('aria-live', 'polite')
    el.setAttribute('aria-atomic', 'true')
    el.setAttribute('aria-relevant', 'additions text')
    // Visualmente oculto pero accesible para AT
    el.style.cssText =
      'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0'
    document.body.appendChild(el)
    regionRef.current = el
    return () => {
      document.body.removeChild(el)
    }
  }, [])

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    if (!regionRef.current) return
    regionRef.current.setAttribute('aria-live', politeness)
    regionRef.current.textContent = ''
    // Doble requestAnimationFrame para forzar re-anuncio del mismo texto
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (regionRef.current) regionRef.current.textContent = message
      })
    })
  }, [])

  return { announce }
}
