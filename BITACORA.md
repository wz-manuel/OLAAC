# Bitácora de Desarrollo — OLAAC Monorepo

**Proyecto:** Observatorio Latinoamericano de Accesibilidad (OLAAC)  
**Fecha de inicio:** 2026-04-09  
**Estado actual:** Entorno de desarrollo inicializado y verificado

---

## Contexto

Migración del sitio oficial de OLAAC desde WordPress a un stack moderno. OLAAC es un organismo de control social que realiza diagnósticos de accesibilidad en entornos digitales y físicos. La accesibilidad no es una característica opcional en este proyecto: es el producto.

---

## Sesión 1 — 2026-04-09

### Objetivos de la sesión

1. Crear la estructura base del monorepo con Turborepo.
2. Configurar todos los paquetes con sus dependencias.
3. Instalar dependencias y verificar que el entorno compila y pasa lint sin errores.

---

### Entorno de desarrollo

| Herramienta | Versión |
|---|---|
| Node.js | v20.19.5 |
| pnpm | 9.1.4 |
| Turbo | 2.9.5 |
| TypeScript | 5.9.3 |

---

### Arquitectura del monorepo

```
webolaac/
├── apps/
│   ├── web/              → Sitio principal + sistema de tickets (puerto 3000)
│   └── academy/          → LMS educativo — Academia OLAAC (puerto 3001)
├── packages/
│   ├── ui/               → @olaac/ui — Sistema de Diseño Accesible
│   ├── tsconfig/         → @olaac/tsconfig — Configuraciones TypeScript base
│   └── eslint-config/    → @olaac/eslint-config — Reglas de lint compartidas
├── supabase/
│   ├── config.toml       → Configuración de entorno local Supabase
│   └── migrations/
│       └── 001_initial_schema.sql
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .prettierrc
```

---

### Stack tecnológico implementado

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | Next.js 14 (App Router) | RSC + streaming; rutas de servidor para Supabase |
| Monorepo | Turborepo 2 + pnpm workspaces | Caché de tareas, ejecución paralela |
| UI / Accesibilidad | Radix UI Primitives | Gestión nativa de foco, ARIA y teclado |
| Estilos | Tailwind CSS 3 | Utilidades; tokens centralizados en `@olaac/ui` |
| Variantes de componentes | class-variance-authority | Variantes type-safe sin CSS-in-JS |
| Backend / DB | Supabase (PostgreSQL) | Auth, RLS, real-time; SDK SSR para Next.js |
| Tablas de datos | TanStack Table v8 | Tablas headless para scores Lighthouse |
| Validación de formularios | react-hook-form + Zod | Validación accesible con mensajes de error asociados |
| Linting de accesibilidad | eslint-plugin-jsx-a11y | Todas las reglas en modo `error` (no `warn`) |
| Auditorías CI | @lhci/cli (Lighthouse CI) | Score mínimo 0.95 en accesibilidad |
| Iconografía | lucide-react | SVG accesibles, tree-shakeable |

---

### Archivos creados por capa

#### Configuración raíz

| Archivo | Propósito |
|---|---|
| `package.json` | Scripts globales Turbo; `packageManager: pnpm@9.1.4` |
| `turbo.json` | Pipeline: `build → lint → type-check → test → lhci` |
| `pnpm-workspace.yaml` | Declara `apps/*` y `packages/*` como workspaces |
| `.gitignore` | Excluye `.next`, `dist`, `.turbo`, `.lighthouseci`, `.env` |
| `.prettierrc` | Formato: sin semicolons, comillas simples, `prettier-plugin-tailwindcss` |

#### `packages/tsconfig`

Tres configuraciones TypeScript heredables:

- `base.json` — Configuración estricta base (strict, isolatedModules, noUncheckedIndexedAccess)
- `nextjs.json` — Extiende base; agrega plugins Next.js y JSX preserve
- `react-library.json` — Extiende base; JSX react-jsx para librerías

#### `packages/eslint-config`

- `index.js` — Reglas base: TypeScript + React + **jsx-a11y en modo `error`** + import/order
- `next.js` — Extiende index; agrega `next/core-web-vitals`

Reglas de accesibilidad activadas como `error` (selección):

```
jsx-a11y/alt-text, aria-props, click-events-have-key-events,
heading-has-content, html-has-lang, interactive-supports-focus,
label-has-associated-control, mouse-events-have-key-events,
no-noninteractive-tabindex, role-has-required-aria-props,
tabindex-no-positive ...
```

#### `packages/ui` — Sistema de Diseño Accesible

**Tokens (`src/tokens/index.ts`)**

- Paleta de marca OLAAC (50–950)
- Colores semánticos de accesibilidad: `focus (#005fcc)`, `error`, `success`, `warning`
- Escala de scores Lighthouse: `critical / poor / moderate / good / excellent`
- Helpers `getScoreColor(score)` y `getScoreLabel(score)`

**Componentes implementados**

| Componente | Descripción | WCAG |
|---|---|---|
| `SkipLink` | Enlace "Saltar al contenido", visible solo al recibir foco | 2.4.1 |
| `Button` | Variantes: default, destructive, outline, secondary, ghost, link | 2.4.7 |
| `Badge` | Etiqueta de estado con variantes semánticas | — |
| `Card` | Contenedor con Header, Title, Description, Content, Footer | 1.3.1 |
| `Dialog` | Modal accesible basado en Radix; botón de cierre con `sr-only` | 2.1.1 |
| `Input` | Campo con `aria-invalid` y ring de foco visible | 1.3.1 |
| `Label` | Asociado a inputs vía Radix Label Primitive | 1.3.1 |
| `Table` | Con `role="region"`, `aria-label`, `<caption>` | 1.3.1 |
| `ScoreBadge` | Círculo de score con `role="img"` y `aria-label` descriptivo | 1.1.1 |
| Radix namespace exports | `DropdownMenu`, `NavigationMenu`, `Select`, `Tabs`, `Toast`, `Tooltip` | 2.1.1 |

**Hooks de accesibilidad (`src/hooks/`)**

| Hook | Propósito | WCAG |
|---|---|---|
| `useAnnounce` | Envía mensajes a lectores de pantalla via `aria-live` | 4.1.3 |
| `useReducedMotion` | Detecta `prefers-reduced-motion: reduce` | 2.3.3 |
| `useFocusTrap` | Atrapa foco en contenedores custom (no Radix) | 2.1.2 |

#### `apps/web`

| Archivo | Contenido |
|---|---|
| `src/app/layout.tsx` | Layout raíz: `html[lang="es"]`, `SkipLink`, `<main id="main-content">` |
| `src/app/globals.css` | Estilos base: `*:focus-visible`, `prefers-reduced-motion`, utilidad `sr-only` |
| `tailwind.config.ts` | Extiende tokens de `@olaac/ui`; incluye paths del sistema de diseño |
| `src/lib/supabase/client.ts` | Cliente Supabase para componentes del navegador |
| `src/lib/supabase/server.ts` | Cliente Supabase para Server Components (cookies SSR) |
| `src/lib/supabase/types.ts` | Tipos TypeScript del esquema de base de datos |
| `lighthouserc.js` | Audita `/`, `/tickets`, `/diagnosticos`; score mínimo `0.95` en a11y |
| `.env.example` | Variables de entorno necesarias (Supabase URL + keys) |

#### `apps/academy`

Estructura inicial equivalente a `apps/web` con:
- Layout accesible (`SkipLink`, `html[lang="es"]`)
- `lighthouserc.js` con regla adicional `video-caption: error` (contenido educativo en video)

#### `supabase/migrations/001_initial_schema.sql`

**Módulo Tickets:**
- Tabla `tickets` con estados (`abierto → cerrado`), prioridades, categorías
- Folio automático generado por trigger: `OLAAC-2024-0001`
- Tabla `ticket_events` para historial de cambios de estado
- RLS: cualquier usuario autenticado puede crear; solo creador/asignado puede actualizar

**Módulo Scores:**
- Tabla `accessibility_scores` con scores por categoría Lighthouse
- Campo `violations: jsonb` para detalle de violaciones axe-core
- Índices en `url` y `measured_at` para queries eficientes

**Módulo Academia LMS:**
- Tablas `courses`, `lessons`, `enrollments`, `lesson_progress`
- RLS: cada usuario accede únicamente a su propio progreso
- Tipo enum `lesson_type`: video, lectura, ejercicio, evaluacion

---

### Problemas encontrados y soluciones

#### 1. Dependencias internas no resueltas por npm

**Síntoma:** `ERR_PNPM_FETCH_404 — @olaac/tsconfig: Not Found`  
**Causa:** Las dependencias internas usaban `"*"` como versión; pnpm requiere el protocolo `workspace:*` para resolver paquetes del monorepo sin consultar el registry externo.  
**Solución:** Reemplazar `"*"` por `"workspace:*"` en todos los `package.json` que referencian paquetes internos.

#### 2. Colisión de nombres en el barrel `@olaac/ui`

**Síntoma:** `TS2308: Module has already exported a member named 'Root'`  
**Causa:** Múltiples primitivas Radix (DropdownMenu, NavigationMenu, Select, Tabs, Toast, Tooltip) exportan los mismos nombres (`Root`, `Content`, `Trigger`, `Portal`, etc.). Un barrel con `export *` de todos ellos genera ambigüedad.  
**Solución:** Usar namespace exports para los componentes Radix: `export * as DropdownMenu from './components/dropdown-menu'`. El consumidor accede como `<DropdownMenu.Root>`.

#### 3. Tipos `readonly` incompatibles con Tailwind Config

**Síntoma:** `Type 'readonly ["Inter", ...]' is not assignable to type 'string[]'`  
**Causa:** Los tokens de `@olaac/ui` usan `as const`, que produce arrays `readonly`. Tailwind espera arrays mutables en su `Config`.  
**Solución:** Definir `fontFamily` y `fontSize` directamente en `tailwind.config.ts` con arrays literales (mutable). Los tokens siguen siendo la fuente de verdad para colores y espaciado.

#### 4. Tipos implícitos en Supabase SSR `setAll`

**Síntoma:** `TS7006: Parameter 'cookiesToSet' implicitly has an 'any' type`  
**Causa:** El método `setAll` en el cliente servidor de Supabase no infería los tipos de sus parámetros en el contexto del callback.  
**Solución:** Anotar el parámetro explícitamente: `cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>`.

#### 5. `react/prop-types` en componentes TypeScript

**Síntoma:** `'className' is missing in props validation`  
**Causa:** La regla `react/prop-types` de ESLint es redundante cuando el proyecto usa TypeScript (los tipos ya validan las props en compilación).  
**Solución:** Añadir `'react/prop-types': 'off'` en `.eslintrc.js` de `packages/ui`.

#### 6. Orden de imports (`import/order`)

**Síntoma:** Errores en layouts y `server.ts` sobre el orden de los grupos de imports.  
**Causa:** La regla ordena alfabéticamente dentro del grupo `external`; `@olaac/ui` (`@`) precede a `next` (`n`), y los type imports deben agruparse con sus pares de valor.  
**Solución:** Reordenar imports como: `@olaac/ui` → `next` (type) → `next/font/google`.

---

### Verificación final

```bash
pnpm turbo run type-check
# Tasks: 3 successful, 3 total — @olaac/ui, @olaac/web, @olaac/academy

pnpm turbo run lint
# Tasks: 3 successful, 3 total — 0 errores en todos los paquetes
```

---

### Commits realizados

| Hash | Mensaje |
|---|---|
| `5f56080` | `chore: initialize OLAAC monorepo — Turborepo + Next.js 14 + Radix UI + Supabase` |
| `93376b4` | `fix: resolve type-check and lint errors across all workspaces` |

---

## Próximos pasos

### Inmediatos (configuración de entorno)

```bash
# 1. Configurar variables de entorno
cp apps/web/.env.example apps/web/.env.local
cp apps/academy/.env.example apps/academy/.env.local
# Editar ambos archivos con las claves de Supabase

# 2. Levantar Supabase local
supabase start
supabase db push  # Aplica migrations/001_initial_schema.sql

# 3. Generar tipos desde el esquema real
supabase gen types typescript --local > apps/web/src/lib/supabase/types.ts

# 4. Iniciar desarrollo
pnpm dev
```

### Módulos a implementar (por prioridad)

1. **Sistema de tickets** (`apps/web`)
   - Página `/tickets/nuevo` — formulario react-hook-form + Zod
   - Página `/tickets/[folio]` — detalle y seguimiento
   - Tabla de tickets con TanStack Table + filtros por estado/prioridad

2. **Tablas de scores** (`apps/web`)
   - Página `/diagnosticos` — tabla dinámica de auditorías Lighthouse
   - Integración con `ScoreBadge` por columna
   - Script CLI para actualizar scores desde terminal (`@lhci/cli`)

3. **Academia LMS** (`apps/academy`)
   - Listado de cursos con progreso por usuario
   - Reproductor de lecciones (video + MDX)
   - Sistema de progreso persitido en Supabase

4. **Autenticación** (ambas apps)
   - Login con Supabase Auth (magic link o proveedor OAuth)
   - Middleware Next.js para proteger rutas privadas

5. **Pipeline CI/CD**
   - GitHub Actions: `type-check → lint → lhci`
   - Lighthouse CI como quality gate en PRs
