-- 013_cobertura_geografica.sql
-- Brecha 5: Cobertura geográfica con criterios de representatividad
-- Define umbrales mínimos de sitios por país+categoría y vistas de seguimiento.

-- ─── cobertura_config — umbrales por país y sector ───────────────────────────

CREATE TABLE public.cobertura_config (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pais          text        NOT NULL,
  iso_code      char(2)     NOT NULL,
  categoria     text        NOT NULL CHECK (categoria IN ('gobierno', 'educacion', 'privado', 'salud', 'sociedad_civil')),
  umbral_minimo integer     NOT NULL DEFAULT 10 CHECK (umbral_minimo > 0),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pais, categoria)
);

CREATE TRIGGER trg_cobertura_config_updated_at
  BEFORE UPDATE ON public.cobertura_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.cobertura_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cobertura_config_public_read"
  ON public.cobertura_config FOR SELECT USING (true);

-- ─── v_cobertura_pais — cobertura actual vs objetivo por país+categoría ──────

CREATE VIEW public.v_cobertura_pais AS
WITH actual AS (
  SELECT pais, categoria, COUNT(*)::integer AS sitios_auditados
  FROM   public.lighthouse_metrics
  GROUP  BY pais, categoria
)
SELECT
  cc.pais,
  cc.iso_code,
  cc.categoria,
  cc.umbral_minimo,
  COALESCE(a.sitios_auditados, 0)                                   AS sitios_auditados,
  LEAST(100,
    ROUND(COALESCE(a.sitios_auditados, 0)::numeric / cc.umbral_minimo * 100)
  )::integer                                                         AS porcentaje,
  COALESCE(a.sitios_auditados, 0) >= cc.umbral_minimo               AS cumple_umbral
FROM   public.cobertura_config cc
LEFT JOIN actual a ON a.pais = cc.pais AND a.categoria = cc.categoria;

-- ─── v_cobertura_resumen — resumen agregado por país ─────────────────────────

CREATE VIEW public.v_cobertura_resumen AS
SELECT
  pais,
  iso_code,
  SUM(umbral_minimo)::integer      AS meta_total,
  SUM(sitios_auditados)::integer   AS auditados_total,
  CASE
    WHEN SUM(umbral_minimo) > 0
    THEN LEAST(100,
           ROUND(SUM(sitios_auditados)::numeric / SUM(umbral_minimo) * 100)
         )::integer
    ELSE 0
  END                              AS porcentaje_global,
  COUNT(*) FILTER (WHERE cumple_umbral)::integer  AS categorias_completas,
  COUNT(*)::integer                               AS categorias_total
FROM   public.v_cobertura_pais
GROUP  BY pais, iso_code
ORDER  BY porcentaje_global DESC;

-- ─── Seed: umbrales para 12 países LATAM en 3 sectores ───────────────────────
-- Umbrales diferenciados según tamaño del ecosistema digital del país.
-- Países grandes (> 30 M hab.): 20/15/10 · Medianos: 10/8/5 · Menores: 5/5/3

INSERT INTO public.cobertura_config (pais, iso_code, categoria, umbral_minimo) VALUES
-- ── Países grandes ────────────────────────────────────────────────────────────
('Brasil',    'BR', 'gobierno',  20),
('Brasil',    'BR', 'educacion', 15),
('Brasil',    'BR', 'privado',   10),
('México',    'MX', 'gobierno',  20),
('México',    'MX', 'educacion', 15),
('México',    'MX', 'privado',   10),
('Colombia',  'CO', 'gobierno',  20),
('Colombia',  'CO', 'educacion', 15),
('Colombia',  'CO', 'privado',   10),
('Argentina', 'AR', 'gobierno',  20),
('Argentina', 'AR', 'educacion', 15),
('Argentina', 'AR', 'privado',   10),
-- ── Países medianos ──────────────────────────────────────────────────────────
('Chile',     'CL', 'gobierno',  10),
('Chile',     'CL', 'educacion',  8),
('Chile',     'CL', 'privado',    5),
('Perú',      'PE', 'gobierno',  10),
('Perú',      'PE', 'educacion',  8),
('Perú',      'PE', 'privado',    5),
('Venezuela', 'VE', 'gobierno',  10),
('Venezuela', 'VE', 'educacion',  8),
('Venezuela', 'VE', 'privado',    5),
('Ecuador',   'EC', 'gobierno',  10),
('Ecuador',   'EC', 'educacion',  8),
('Ecuador',   'EC', 'privado',    5),
-- ── Países menores ───────────────────────────────────────────────────────────
('Bolivia',       'BO', 'gobierno',  5),
('Bolivia',       'BO', 'educacion', 5),
('Bolivia',       'BO', 'privado',   3),
('Guatemala',     'GT', 'gobierno',  5),
('Guatemala',     'GT', 'educacion', 5),
('Guatemala',     'GT', 'privado',   3),
('Costa Rica',    'CR', 'gobierno',  5),
('Costa Rica',    'CR', 'educacion', 5),
('Costa Rica',    'CR', 'privado',   3),
('Uruguay',       'UY', 'gobierno',  5),
('Uruguay',       'UY', 'educacion', 5),
('Uruguay',       'UY', 'privado',   3);
