-- 014_distintivo_reauditoria.sql
-- Brecha 8: Re-auditoría y alertas de regresión para el Distintivo de Accesibilidad
--
-- Agrega trazabilidad de verificaciones periódicas y dos tipos de alerta:
--   · regresion  — score actual cayó por debajo del umbral mínimo del nivel
--   · renovacion — badge vence en ≤ 30 días y aún no se envió el recordatorio

-- ─── Columnas adicionales en distintivos_emitidos ────────────────────────────

ALTER TABLE public.distintivos_emitidos
  ADD COLUMN ultimo_check_at            timestamptz,
  ADD COLUMN ultimo_score               numeric(5,2),
  ADD COLUMN alerta_regresion           boolean NOT NULL DEFAULT false,
  ADD COLUMN alerta_vencimiento_enviada boolean NOT NULL DEFAULT false;

-- ─── distintivo_reauditorias — log de verificaciones ─────────────────────────

CREATE TABLE public.distintivo_reauditorias (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  distintivo_id   uuid        NOT NULL
                              REFERENCES public.distintivos_emitidos(id) ON DELETE CASCADE,
  -- Resultado de la verificación
  tipo            text        NOT NULL
                              CHECK (tipo IN ('ok', 'regresion', 'renovacion', 'sin_datos')),
  url_verificada  text,                     -- URL buscada en lighthouse_metrics
  score_encontrado numeric(5,2),            -- score actual (null si no hay datos)
  score_minimo    numeric(5,2) NOT NULL,    -- umbral mínimo del nivel del badge
  cumple_score    boolean,                  -- score_encontrado >= score_minimo
  alerta_enviada  boolean     NOT NULL DEFAULT false,
  notas           text,
  checked_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reauditoria_distintivo ON public.distintivo_reauditorias(distintivo_id, checked_at DESC);
CREATE INDEX idx_reauditoria_tipo       ON public.distintivo_reauditorias(tipo);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.distintivo_reauditorias ENABLE ROW LEVEL SECURITY;

-- Solo service_role (el cron) escribe; los admins leen via service_role también.
-- Lectura pública no aplica — es un log interno.
-- La columna alerta_regresion en distintivos_emitidos sí es pública (se lee en verificación).
