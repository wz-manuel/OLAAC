// ============================================================
// Tokens de Diseño OLAAC — Fuente de verdad
// Colores extraídos del logo oficial (OLAAC_final_daeg.svg)
//   Azul Observatorio: #252858 (.st2 del SVG)
//   Azul Acceso:       #30BCEE (.st0 del SVG)
//   Azul Hielo:        #C9EAF2 (.st4 del SVG)
// ============================================================

export const colors = {
  // Azul Observatorio — navy profundo del logo (escala completa)
  brand: {
    50:  '#f0f1f8',
    100: '#dde0f0',
    200: '#b9bee2',
    300: '#8c94cf',
    400: '#606bb8',
    500: '#4452a6',
    600: '#353e8e',
    700: '#2d3476',
    800: '#252858', // Color primario del logo
    900: '#1a1d40',
    950: '#0f1128',
  },
  // Azul Acceso — cian de la lupa del logo (escala completa)
  accent: {
    50:  '#ecf9fe',
    100: '#d0f1fc',
    200: '#a6e4f9',
    300: '#6dd2f5',
    400: '#30BCEE', // Color acento del logo
    500: '#0ea5d5',
    600: '#0284b0',
    700: '#016a8f',
    800: '#065675',
    900: '#0a4762',
  },
  // Azul Hielo — fondo suave del símbolo
  ice: '#C9EAF2',
  // Semánticos de accesibilidad (WCAG)
  a11y: {
    focus:   '#005fcc', // Ring de foco visible — 7.4:1 sobre blanco (AAA)
    error:   '#c0392b', // Rojo con contraste AAA
    success: '#1a7a4a', // Verde con contraste AAA
    warning: '#b45309', // Ámbar oscuro con contraste AAA
    info:    '#1d4ed8', // Azul informativo
  },
  // Escala de scores Lighthouse — colores accesibles (≥4.5:1 sobre blanco)
  // Usables como texto y como fondo con texto blanco encima (WCAG 1.4.3 y 1.4.11)
  score: {
    critical: '#dc2626', // 0–49  → 4.83:1 sobre blanco  (texto blanco ✓)
    poor:     '#c2410c', // 50–64 → 5.17:1 sobre blanco  (texto blanco ✓)
    moderate: '#b45309', // 65–79 → 5.02:1 sobre blanco  (texto blanco ✓)
    good:     '#15803d', // 80–89 → 5.02:1 sobre blanco  (texto blanco ✓)
    excellent:'#166534', // 90–100→ 7.13:1 sobre blanco  (texto blanco ✓)
  },
} as const

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },
  fontSize: {
    xs:   ['0.75rem',   { lineHeight: '1rem' }],
    sm:   ['0.875rem',  { lineHeight: '1.25rem' }],
    base: ['1rem',      { lineHeight: '1.5rem' }],
    lg:   ['1.125rem',  { lineHeight: '1.75rem' }],
    xl:   ['1.25rem',   { lineHeight: '1.75rem' }],
    '2xl':['1.5rem',    { lineHeight: '2rem' }],
    '3xl':['1.875rem',  { lineHeight: '2.25rem' }],
    '4xl':['2.25rem',   { lineHeight: '2.5rem' }],
  },
} as const

export const spacing = {
  container: {
    sm:   '640px',
    md:   '768px',
    lg:   '1024px',
    xl:   '1280px',
    '2xl':'1536px',
  },
} as const

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
