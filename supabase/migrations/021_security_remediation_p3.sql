-- ============================================================
-- Migración 021 — Remediación de seguridad P3
-- Bitácora: security_remediation_log.md — ítems P3.1 y P3.2
-- ============================================================

-- ─── P3.1 — Rate limiting persistente con tabla Supabase ─────────────────────

CREATE TABLE public.rate_limit_log (
  key          text        NOT NULL,
  window_start timestamptz NOT NULL,
  count        integer     NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

-- RLS habilitado sin políticas: bloquea acceso directo desde anon/authenticated.
-- La función rate_limit_check usa SECURITY DEFINER (corre como postgres) y
-- bypasea RLS, por lo que el acceso vía la función sigue funcionando.
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Función atómica de rate limit: inserta o incrementa y devuelve si se permite.
CREATE OR REPLACE FUNCTION public.rate_limit_check(
  p_key          text,
  p_window_start timestamptz,
  p_limit        integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  WITH upsert AS (
    INSERT INTO public.rate_limit_log (key, window_start, count)
    VALUES (p_key, p_window_start, 1)
    ON CONFLICT (key, window_start)
    DO UPDATE SET count = rate_limit_log.count + 1
    RETURNING count
  )
  SELECT count INTO current_count FROM upsert;

  RETURN current_count <= p_limit;
END;
$$;

-- Solo service_role puede llamar esta función (server actions via createServiceClient).
-- Se revoca de PUBLIC y de los roles anon/authenticated para evitar abuso via REST.
REVOKE EXECUTE ON FUNCTION public.rate_limit_check(text, timestamptz, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rate_limit_check(text, timestamptz, integer) FROM anon, authenticated;

-- Función de limpieza llamada desde GitHub Actions (pg_cron no disponible en free tier).
-- El workflow accessibility-audit.yml la invoca via REST API cada domingo.
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_log()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limit_log WHERE window_start < NOW() - INTERVAL '2 hours';
$$;

-- Solo service_role puede invocar esta función (GitHub Actions usa service_role_key).
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_log() FROM PUBLIC, anon, authenticated;

-- ─── P3.2 — Restringir tickets_select (privacidad) ────────────────────────────
-- Problema: cualquier usuario autenticado podía leer todos los tickets,
-- incluyendo reporter_email y reporter_nombre de reportes anónimos.
-- Fix: solo el creador, el asignado y los admins pueden ver cada ticket.

DROP POLICY IF EXISTS "tickets_select" ON public.tickets;

CREATE POLICY "tickets_select" ON public.tickets
  FOR SELECT USING (
    created_by  = (SELECT auth.uid()) OR
    assigned_to = (SELECT auth.uid()) OR
    public.is_admin()
  );

-- Igual restricción para ticket_events: solo participantes del ticket y admins.
DROP POLICY IF EXISTS "ticket_events_auth_read" ON public.ticket_events;

CREATE POLICY "ticket_events_auth_read" ON public.ticket_events
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM public.tickets
      WHERE created_by  = (SELECT auth.uid())
         OR assigned_to = (SELECT auth.uid())
    )
    OR public.is_admin()
  );
