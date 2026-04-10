// ============================================================
// Tokens de Diseño OLAAC
// Sirven como fuente de verdad para colores, tipografía y
// espaciado. Son consumidos por tailwind.config.ts.
// ============================================================

export const colors = {
  // Marca OLAAC
  brand: {
    50: '#f0f4ff',
    100: '#dce8ff',
    200: '#bdd1ff',
    300: '#93b1fd',
    400: '#6585f9',
    500: '#4660f3', // Color primario
    600: '#3240e7',
    700: '#2832cc',
    800: '#252ba5',
    900: '#252c83',
    950: '#171a4d',
  },
  // Semánticos de accesibilidad
  a11y: {
    focus: '#005fcc',      // Ring de foco visible (4.5:1 mínimo)
    error: '#c0392b',      // Rojo con contraste AAA
    success: '#1a7a4a',    // Verde con contraste AAA
    warning: '#b45309',    // Ámbar oscuro con contraste AAA
    info: '#1d4ed8',       // Azul informativo
  },
  // Escala de scores Lighthouse / accesibilidad
  score: {
    critical: '#dc2626',  // 0-49
    poor: '#f97316',      // 50-64
    moderate: '#eab308',  // 65-79
    good: '#22c55e',      // 80-89
    excellent: '#16a34a', // 90-100
  },
} as const

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
} as const

export const spacing = {
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

// Score helpers
export type AccessibilityScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export function getScoreColor(score: number): string {
  if (score < 50) return colors.score.critical
  if (score < 65) return colors.score.poor
  if (score < 80) return colors.score.moderate
  if (score < 90) return colors.score.good
  return colors.score.excellent
}

export function getScoreLabel(score: number): string {
  if (score < 50) return 'Crítico'
  if (score < 65) return 'Deficiente'
  if (score < 80) return 'Moderado'
  if (score < 90) return 'Bueno'
  return 'Excelente'
}
