-- ─────────────────────────────────────────────────────────────────────────────
-- 010_lighthouse_snapshots.sql
-- Series temporales de auditorías Lighthouse
--
-- Problema: lighthouse_metrics hace UPSERT por alias — solo guarda el snapshot
-- más reciente. Esta tabla guarda TODOS los snapshots con su timestamp, lo que
-- permite mostrar tendencias históricas en el dashboard de detalle.
--
-- Relación: lighthouse_metrics (1) ←→ (N) lighthouse_snapshots
-- ─────────────────────────────────────────────────────────────────────────────

create table lighthouse_snapshots (
  id                  uuid        primary key default gen_random_uuid(),
  alias               text        not null,
  url                 text        not null,
  nombre_sitio        text        not null,
  pais                text        not null,
  categoria           text        not null,
  subcategoria        text,
  accessibility_score numeric(5,2) check (accessibility_score between 0 and 100),
  critical_issues     jsonb       not null default '[]'::jsonb,
  measured_at         timestamptz not null default now()
);

comment on table lighthouse_snapshots is
  'Historial completo de auditorías Lighthouse por sitio. '
  'lighthouse_metrics guarda solo el último resultado (upsert por alias); '
  'esta tabla acumula todos los snapshots para mostrar tendencias temporales.';

-- ─── Índices ─────────────────────────────────────────────────────────────────

-- Búsqueda principal: historial de un alias ordenado por fecha
create index idx_lh_snapshots_alias_measured
  on lighthouse_snapshots (alias, measured_at desc);

-- Útil para dashboards globales ordenados por fecha
create index idx_lh_snapshots_measured_at
  on lighthouse_snapshots (measured_at desc);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table lighthouse_snapshots enable row level security;

-- Lectura pública (misma política que lighthouse_metrics)
create policy "lh_snapshots_select_all"
  on lighthouse_snapshots for select
  using (true);

-- INSERT/UPDATE/DELETE: solo service_role (sync-scores.ts usa service_role_key)

-- ─── Backfill: primer snapshot desde datos actuales ───────────────────────────
-- Copia el estado actual de lighthouse_metrics como punto de partida histórico
-- para que la gráfica muestre algo inmediatamente tras aplicar la migración.

insert into lighthouse_snapshots (
  alias, url, nombre_sitio, pais, categoria,
  subcategoria, accessibility_score, critical_issues, measured_at
)
select
  alias, url, nombre_sitio, pais, categoria,
  subcategoria, accessibility_score, critical_issues, measured_at
from lighthouse_metrics;
