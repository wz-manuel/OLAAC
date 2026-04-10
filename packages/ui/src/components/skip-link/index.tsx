import * as React from 'react'

import { cn } from '../../lib/utils'

interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

/**
 * SkipLink — Enlace de salto al contenido principal.
 * WCAG 2.1 — Criterio 2.4.1 (Evitar bloques).
 * Visible solo al recibir foco de teclado.
 */
export function SkipLink({ href, children = 'Saltar al contenido principal', className, ...props }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Oculto visualmente pero visible al tener foco
        'sr-only focus:not-sr-only',
        'focus:absolute focus:top-4 focus:left-4 focus:z-[9999]',
        'focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2',
        'focus:text-white focus:ring-2 focus:ring-a11y-focus focus:ring-offset-2',
        'focus:outline-none focus:font-medium',
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}
