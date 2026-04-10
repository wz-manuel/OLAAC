<div align="center">

<!-- Replace with actual logo once brand assets are available -->
<!-- <img src="apps/web/public/logo-olaac.svg" alt="OLAAC — Observatorio Latinoamericano de Accesibilidad" width="200" /> -->

# OLAAC

### Observatorio Latinoamericano de Accesibilidad

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/olaac/olaac/accessibility-audit.yml?label=Accessibility%20Audit)](https://github.com/olaac/olaac/actions)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![Accessibility: WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-005fcc)](https://www.w3.org/WAI/WCAG21/quickref/)

</div>

---

## Misión

OLAAC es un organismo de control social sin fines de lucro que realiza diagnósticos de accesibilidad en entornos digitales y físicos de América Latina. Generamos datos públicos, formamos profesionales y promovemos estándares de inclusión para que ninguna persona quede excluida por razones de discapacidad.

**La accesibilidad no es una característica opcional en este proyecto: es el producto.**

---

## Estructura del repositorio

Este es un monorepo gestionado con [Turborepo](https://turbo.build) y [pnpm workspaces](https://pnpm.io/workspaces).

```
olaac/
├── apps/
│   ├── web/          # Sitio público — olaac.org (Next.js 14)
│   └── academy/      # Academia LMS — academia.olaac.org (Next.js 14)
├── packages/
│   ├── ui/           # Biblioteca de componentes accesibles (@olaac/ui)
│   ├── tsconfig/     # Configuraciones TypeScript compartidas
│   └── eslint-config/# Reglas ESLint + eslint-plugin-jsx-a11y
├── toolchain/
│   └── lighthouse-audit/ # Motor de auditoría batch de accesibilidad
└── supabase/
    └── migrations/   # Esquema de base de datos versionado
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) (App Router, Server Components) |
| Monorepo | [Turborepo](https://turbo.build) + pnpm workspaces |
| Base de datos | [Supabase](https://supabase.com) (PostgreSQL + RLS + Storage) |
| Estilos | [Tailwind CSS](https://tailwindcss.com) v3 |
| Componentes | [Radix UI](https://www.radix-ui.com) primitivos + `@olaac/ui` |
| Tipos | TypeScript 5 (strict) |
| Certificados | `@react-pdf/renderer` + QR code |
| Auditorías | Lighthouse Node API + axe-core |
| CI/CD | GitHub Actions + Vercel |

---

## Inicio rápido

### Requisitos previos

- Node.js >= 20
- pnpm >= 9
- Cuenta en Supabase (gratuita)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/olaac/olaac.git
cd olaac

# Instalar dependencias de todos los workspaces
pnpm install
```

### Variables de entorno

Copia los archivos de ejemplo en cada aplicación:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/academy/.env.example apps/academy/.env.local
```

Edita cada `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # Solo servidor
```

### Aplicar migraciones de base de datos

```bash
npx supabase link --project-ref <tu-project-ref>
npx supabase db push
```

### Desarrollo local

```bash
# Levantar todos los servicios en paralelo (web: 3000, academy: 3001)
pnpm dev

# O por separado
pnpm --filter @olaac/web dev
pnpm --filter @olaac/academy dev
```

### Otros comandos útiles

```bash
pnpm build          # Build de producción (todos los workspaces)
pnpm type-check     # Verificación de tipos TypeScript
pnpm lint           # ESLint en todos los workspaces
pnpm audit:sync     # Ejecutar auditoría Lighthouse batch
pnpm audit:dry-run  # Dry-run sin escritura a la base de datos
pnpm storage:test   # Verificar conectividad con Supabase Storage
```

---

## Accesibilidad primero

OLAAC es un proyecto **Accessibility-First**. Esto no es un objetivo aspiracional, sino un requisito no negociable en cada pull request.

### Estándares implementados

- **WCAG 2.1 Nivel AA** — en todas las interfaces públicas
- **Score Lighthouse >= 95** en la categoría de accesibilidad (verificado por CI)
- **Contraste mínimo 4.5:1** en texto normal, 3:1 en texto grande
- **Navegación por teclado** completa con indicadores `focus-visible`
- **ARIA semántico** — sin roles redundantes ni atributos decorativos innecesarios
- **HTML nativo** preferido sobre componentes JavaScript cuando cumple el mismo rol (ej. `<details>/<summary>` en lugar de acordeones custom)

### Herramientas de auditoría

| Herramienta | Uso |
|---|---|
| [axe-core](https://github.com/dequelabs/axe-core) | Detección automatizada de violaciones WCAG en CI |
| [Lighthouse](https://developer.chrome.com/docs/lighthouse) | Score de accesibilidad + auditoría de rendimiento |
| [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) | Reglas de accesibilidad en tiempo de escritura |
| Motor batch propio | Audita 50+ sitios latinoamericanos semanalmente |

### Pipeline de CI/CD de accesibilidad

El workflow `.github/workflows/accessibility-audit.yml` ejecuta cada domingo a medianoche UTC:

1. Auditoría Lighthouse de todos los sitios en `toolchain/lighthouse-audit/urls.csv`
2. Extracción de violaciones críticas y graves (axe-core)
3. Upsert de resultados en la tabla `lighthouse_metrics`
4. Los datos quedan disponibles públicamente en [olaac.org/scores](https://olaac.org/scores)

---

## Módulos principales

### Dashboard de Scores (`apps/web`)

Panel público en `/scores` con ranking de accesibilidad de sitios latinoamericanos. Cualquier organización puede solicitar la inclusión de su URL desde `/scores/solicitar-url`.

### Academia OLAAC (`apps/academy`)

LMS de formación en accesibilidad digital y física. Incluye:
- Cursos con seguimiento de progreso por lección
- Emisión automatizada de certificados PDF con folio único y código QR de verificación
- Página pública de verificación de certificados en `/certificados/[folio]`

### Sistema de Tickets (`apps/web`)

Gestión de solicitudes de auditoría y reportes de barreras de accesibilidad.

---

## Contribuir

Las contribuciones son bienvenidas. Por favor revisa [`CONTRIBUTING.md`](CONTRIBUTING.md) antes de abrir un PR.

**Requisito fundamental:** todo código nuevo debe mantener o mejorar el score de accesibilidad. Un PR que introduzca violaciones WCAG detectadas por axe-core o que baje el score de Lighthouse no será aprobado.

---

## Licencia

[MIT](LICENSE) — Observatorio Latinoamericano de Accesibilidad, 2026.

---

<div align="center">
  <sub>Construido con la convicción de que la web debe ser para todas las personas.</sub>
</div>
