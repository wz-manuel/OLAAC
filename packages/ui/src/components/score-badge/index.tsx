import * as React from 'react'

import { getScoreColor, getScoreLabel } from '../../tokens'
import { cn } from '../../lib/utils'

interface ScoreBadgeProps {
  score: number
  label?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * ScoreBadge — Visualiza un score de accesibilidad (0-100) con color semántico.
 * Usado en las tablas de auditorías Lighthouse de OLAAC.
 * Incluye aria-label para lectores de pantalla.
 */
export function ScoreBadge({ score, label, showLabel = true, size = 'md', className }: ScoreBadgeProps) {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)))
  const color = getScoreColor(clampedScore)
  const scoreLabel = label ?? getScoreLabel(clampedScore)

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
  }

  return (
    <div
      className={cn('flex flex-col items-center gap-1', className)}
      role="img"
      aria-label={`Score de accesibilidad: ${clampedScore} de 100 — ${scoreLabel}`}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold text-white',
          sizeClasses[size]
        )}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      >
        {clampedScore}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-600 dark:text-gray-400" aria-hidden="true">
          {scoreLabel}
        </span>
      )}
    </div>
  )
}
