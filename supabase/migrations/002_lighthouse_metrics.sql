-- ============================================================
-- OLAAC — Migración 002: Tabla lighthouse_metrics
-- Motor de sincronización batch (toolchain/lighthouse-audit)
-- ============================================================
-- Propósito: almacena el snapshot más reciente por sitio auditado.
-- El upsert usa `alias` como clave de conflicto: siempre se guarda
-- únicamente el último resultado de cada sitio.
-- ============================================================

create table lighthouse_metrics (
  id               uuid primary key default gen_random_uuid(),

  -- Identificación del sitio (provienen del CSV)
  alias            text not null unique,           -- slug único, clave de upsert
  url              text not null,
  nombre_sitio     text not null,
  pais             text not null,
  categoria        text not null,
  subcategoria     text,

  -- Resultados de accesibilidad (solo se audita esta categoría)
  accessibility_score numeric(5,2)
    check (accessibility_score between 0 and 100),

  -- Violaciones filtradas: solo impacto 'critical' o 'serious' (axe-core)
  critical_issues  jsonb not null default '[]'::jsonb,

  -- Metadatos de la ejecución
  measured_at      timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- Índices para consultas del dashboard
create index idx_lh_metrics_alias        on lighthouse_metrics(alias);
create index idx_lh_metrics_pais         on lighthouse_metrics(pais);
create index idx_lh_metrics_categoria    on lighthouse_metrics(categoria);
create index idx_lh_metrics_score        on lighthouse_metrics(accessibility_score);
create index idx_lh_metrics_measured_at  on lighthouse_metrics(measured_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
-- Lectura pública (igual que accessibility_scores).
-- Escritura solo con service_role (el script usa SUPABASE_SERVICE_ROLE_KEY).
alter table lighthouse_metrics enable row level security;

create policy "lh_metrics_select_all"
  on lighthouse_metrics for select using (true);

-- INSERT/UPDATE/DELETE queda reservado al service_role,
-- que bypassa RLS automáticamente en Supabase.

-- ============================================================
-- Vista auxiliar: ranking de accesibilidad por país
-- ============================================================
create view v_a11y_ranking_by_pais as
select
  pais,
  round(avg(accessibility_score), 1) as avg_score,
  count(*)                            as total_sitios,
  count(*) filter (where accessibility_score < 50) as criticos
from lighthouse_metrics
group by pais
order by avg_score desc;
