// ============================================================
// @olaac/ui — Sistema de Diseño Accesible
// Exporta todos los componentes, tokens y hooks públicos.
// ============================================================

// --- Tokens de diseño (colores, tipografía, espaciado) ---
export * from './tokens'

// --- Primitivas de utilidad ---
export * from './lib/utils'

// --- Componentes propios (sin conflictos de nombres) ---
export * from './components/button'
export * from './components/badge'
export * from './components/card'
export * from './components/dialog'
export * from './components/input'
export * from './components/label'
export * from './components/skip-link'
export * from './components/table'
export * from './components/score-badge'

// --- Re-exports de Radix con namespace para evitar colisiones de nombres ---
// Uso: import { DropdownMenu } from '@olaac/ui'; <DropdownMenu.Root> ...
export * as DropdownMenu from './components/dropdown-menu'
export * as NavigationMenu from './components/navigation-menu'
export * as Select from './components/select'
export * as Tabs from './components/tabs'
export * as Toast from './components/toast'
export * as Tooltip from './components/tooltip'

// --- Hooks de accesibilidad ---
export * from './hooks'

// Nota: './components/form' no se re-exporta aquí.
// react-hook-form se usa directamente en apps/web y apps/academy.

