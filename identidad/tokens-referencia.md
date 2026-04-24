# Tokens de Diseño — Referencia para Desarrolladores

Fuente: `packages/ui/src/tokens/index.ts`
Consumidos por: `tailwind.config.ts` en todas las apps del monorepo

---

## Colores de Marca (`colors.brand`)

```typescript
import { colors } from '@olaac/ui/tokens'
```

| Token | Tailwind | HEX | Descripción |
|-------|----------|-----|-------------|
| `brand.50` | `bg-brand-50` | `#f0f1f8` | Fondo hover suave |
| `brand.100` | `bg-brand-100` | `#dde0f0` | Bordes, dividers |
| `brand.200` | `bg-brand-200` | `#b9bee2` | Placeholder |
| `brand.300` | `bg-brand-300` | `#8c94cf` | Texto deshabilitado |
| `brand.400` | `bg-brand-400` | `#606bb8` | Texto secundario |
| `brand.500` | `bg-brand-500` | `#4452a6` | Interactivos secundarios |
| `brand.600` | `bg-brand-600` | `#353e8e` | Hover primario |
| `brand.700` | `bg-brand-700` | `#2d3476` | Active state |
| `brand.800` | `bg-brand-800` | `#252858` | **Logo primario** |
| `brand.900` | `bg-brand-900` | `#1a1d40` | Texto institucional |
| `brand.950` | `bg-brand-950` | `#0f1128` | Máximo contraste |

> `brand.800` (#252858) es el Azul Observatorio — el color exacto del logo.

---

## Colores de Acento (`colors.accent`)

| Token | Tailwind | HEX | Descripción |
|-------|----------|-----|-------------|
| `accent.50` | `bg-accent-50` | `#ecf9fe` | Fondo notificación info |
| `accent.100` | `bg-accent-100` | `#d0f1fc` | Badges secundarios |
| `accent.200` | `bg-accent-200` | `#a6e4f9` | Bordes cards destacadas |
| `accent.300` | `bg-accent-300` | `#6dd2f5` | Íconos decorativos |
| `accent.400` | `bg-accent-400` | `#30BCEE` | **Logo acento (lupa)** |
| `accent.500` | `bg-accent-500` | `#0ea5d5` | CTAs primarios |
| `accent.600` | `bg-accent-600` | `#0284b0` | Hover CTAs |
| `accent.700` | `bg-accent-700` | `#016a8f` | Active CTAs |
| `accent.800` | `bg-accent-800` | `#065675` | Texto sobre fondos cyan |
| `accent.900` | `bg-accent-900` | `#0a4762` | Texto oscuro sobre cyan |

> `accent.400` (#30BCEE) es el Azul Acceso — el cian del símbolo de la lupa.

---

## Colores Semánticos (`colors.a11y`)

| Token | Tailwind | HEX | Contraste sobre blanco |
|-------|----------|-----|------------------------|
| `a11y.focus` | — (CSS var) | `#005fcc` | 7.4:1 (AAA) |
| `a11y.error` | — | `#c0392b` | 5.8:1 (AA) |
| `a11y.success` | — | `#1a7a4a` | 6.1:1 (AA) |
| `a11y.warning` | — | `#b45309` | 4.7:1 (AA) |
| `a11y.info` | — | `#1d4ed8` | 7.2:1 (AAA) |

---

## Colores de Score (`colors.score`)

Todos pasan ≥4.5:1 sobre blanco — seguros como **texto** y como **fondo con texto blanco**.

| Token | HEX | Ratio/blanco | Rango |
|-------|-----|--------------|-------|
| `score.critical` | `#dc2626` | 4.83:1 AA | 0–49 |
| `score.poor` | `#c2410c` | 5.17:1 AA | 50–64 |
| `score.moderate` | `#b45309` | 5.02:1 AA | 65–79 |
| `score.good` | `#15803d` | 5.02:1 AA | 80–89 |
| `score.excellent` | `#166534` | 7.13:1 AAA | 90–100 |

```typescript
import { getScoreColor, getScoreLabel } from '@olaac/ui'

const color = getScoreColor(87)  // '#22c55e'
const label = getScoreLabel(87)  // 'Bueno'
```

---

## Variables CSS Globales

Definidas en `apps/web/src/app/globals.css`:

```css
:root {
  --brand-primary: 237 41% 25%;   /* #252858 — Azul Observatorio */
  --brand-accent:  199 84% 56%;   /* #30BCEE — Azul Acceso */
  --brand-light:   196 52% 87%;   /* #C9EAF2 — Azul Hielo */
  --a11y-focus:    211 100% 40%;  /* #005fcc — foco WCAG 2.4.7 */
}
```

---

## Uso del Componente Logo

```tsx
import { OlaacLogo } from '@olaac/ui'

// Logo completo (símbolo + OLAAC)
<OlaacLogo />

// Solo símbolo (favicon, avatar)
<OlaacLogo variant="symbol" />

// Con tamaño personalizado
<OlaacLogo width={160} height={64} />
```

---

## Tipografía

```css
font-family: 'Inter', system-ui, sans-serif;       /* text institucional */
font-family: 'JetBrains Mono', 'Fira Code', monospace; /* código / datos */
```

Clases Tailwind:
- `font-sans` → Inter
- `font-mono` → JetBrains Mono

---

## Espaciado de Contenedores

| Token | Tailwind | Valor |
|-------|----------|-------|
| `container.sm` | `max-w-sm` | 640px |
| `container.md` | `max-w-md` | 768px |
| `container.lg` | `max-w-lg` | 1024px |
| `container.xl` | `max-w-xl` | 1280px |
| `container.2xl` | `max-w-2xl` | 1536px |

---

*Actualizado automáticamente cuando cambia `packages/ui/src/tokens/index.ts`*
