import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — Combina clases de Tailwind de forma segura.
 * Uso: cn('base-class', condition && 'conditional-class', props.className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
