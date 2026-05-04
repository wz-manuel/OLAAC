-- ============================================================
-- Migración 017 — Security hardening: funciones, vistas y RLS
-- Fuente: Supabase Security Advisor (db advisors --linked)
-- ============================================================

-- ─── 1. Revocar EXECUTE de funciones peligrosas ───────────────────────────────

-- add_role_to_user con SECURITY DEFINER es accesible por anon y authenticated
-- vía /rest/v1/rpc/add_role_to_user → cualquier usuario puede escalar el rol
-- de cualquier otra cuenta. Solo debe llamarse desde service_role.
REVOKE EXECUTE ON FUNCTION public.add_role_to_user(uuid, public.rol_usuario)
  FROM anon, authenticated;

-- Las siguientes funciones no necesitan ser llamadas por el rol anon.
-- authenticated las conserva porque las usan políticas RLS y server actions.
REVOKE EXECUTE ON FUNCTION public.get_user_roles() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(public.rol_usuario) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- ─── 2. Añadir SET search_path a todas las funciones ─────────────────────────
-- Sin search_path fijo una función SECURITY DEFINER puede ser redirigida si
-- alguien crea objetos con el mismo nombre en un schema prioritario.

CREATE OR REPLACE FUNCTION public.generate_ticket_folio()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  year text := to_char(now(), 'YYYY');
  seq  int;
BEGIN
  SELECT count(*) + 1 INTO seq
  FROM public.tickets
  WHERE to_char(created_at, 'YYYY') = year;
  NEW.folio := 'OLAAC-' || year || '-' || lpad(seq::text, 4, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_distintivo_folio()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  yr  text := to_char(now(), 'YYYY');
  seq integer;
BEGIN
  SELECT count(*) + 1 INTO seq
  FROM public.solicitudes_distintivo
  WHERE to_char(created_at, 'YYYY') = yr;
  NEW.folio := 'DIST-' || yr || '-' || lpad(seq::text, 4, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_badge_folio()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.folio := 'BADGE-' || to_char(now(), 'YYYY') || '-'
    || upper(substr(md5(gen_random_uuid()::text), 1, 8));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles()
RETURNS public.rol_usuario[] LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT roles FROM public.user_profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(role_to_check public.rol_usuario)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role_to_check = ANY(roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.add_role_to_user(target_user_id uuid, new_role public.rol_usuario)
RETURNS void LANGUAGE sql SECURITY DEFINER
SET search_path = public AS $$
  UPDATE public.user_profiles
  SET roles = array_append(roles, new_role)
  WHERE user_id = target_user_id
    AND NOT (new_role = ANY(roles));
$$;

-- ─── 3. Corregir vistas SECURITY DEFINER → security_invoker ──────────────────
-- PostgreSQL 15+: WITH (security_invoker = true) fuerza que la vista evalúe
-- RLS con los permisos del usuario que consulta, no del creador de la vista.
-- Las tablas subyacentes son de lectura pública, por lo que el impacto es
-- preventivo; garantiza corrección si en el futuro se restringe el acceso.

-- v_cobertura_resumen depende de v_cobertura_pais: primero drop en orden inverso.
DROP VIEW IF EXISTS public.v_cobertura_resumen;
DROP VIEW IF EXISTS public.v_cobertura_pais;

CREATE VIEW public.v_cobertura_pais WITH (security_invoker = true) AS
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
  COALESCE(a.sitios_auditados, 0)                                    AS sitios_auditados,
  LEAST(100,
    ROUND(COALESCE(a.sitios_auditados, 0)::numeric / cc.umbral_minimo * 100)
  )::integer                                                          AS porcentaje,
  COALESCE(a.sitios_auditados, 0) >= cc.umbral_minimo                AS cumple_umbral
FROM   public.cobertura_config cc
LEFT JOIN actual a ON a.pais = cc.pais AND a.categoria = cc.categoria;

CREATE VIEW public.v_cobertura_resumen WITH (security_invoker = true) AS
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

CREATE OR REPLACE VIEW public.v_cobertura_legal WITH (security_invoker = true) AS
SELECT
  lp.pais,
  lp.iso_code,
  lp.ley_nombre,
  lp.nivel_sancion,
  lp.obliga_sector,
  lp.vigente,
  count(lm.alias)                                        AS total_sitios_auditados,
  round(avg(lm.accessibility_score), 1)                  AS avg_score,
  count(*) FILTER (WHERE lm.accessibility_score < 50)    AS sitios_criticos,
  count(*) FILTER (WHERE lm.accessibility_score >= 90)   AS sitios_excelentes
FROM public.legislacion_pais lp
LEFT JOIN public.lighthouse_metrics lm ON lm.pais = lp.pais
GROUP BY lp.pais, lp.iso_code, lp.ley_nombre, lp.nivel_sancion, lp.obliga_sector, lp.vigente
ORDER BY total_sitios_auditados DESC;

CREATE OR REPLACE VIEW public.v_a11y_ranking_by_pais WITH (security_invoker = true) AS
SELECT
  pais,
  round(avg(accessibility_score), 1) AS avg_score,
  count(*)                            AS total_sitios,
  count(*) FILTER (WHERE accessibility_score < 50) AS criticos
FROM public.lighthouse_metrics
GROUP BY pais
ORDER BY avg_score DESC;

-- ─── 4. Optimizar RLS: (select auth.uid()) elimina re-evaluación por fila ─────
-- auth.uid() en USING/WITH CHECK se re-evalúa por cada fila del resultado.
-- Envolverlo en (select ...) permite al planner cachearlo una vez por query.

-- tickets
DROP POLICY IF EXISTS "tickets_select" ON public.tickets;
DROP POLICY IF EXISTS "tickets_insert" ON public.tickets;
DROP POLICY IF EXISTS "tickets_update" ON public.tickets;

CREATE POLICY "tickets_select" ON public.tickets
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "tickets_insert" ON public.tickets
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "tickets_update" ON public.tickets
  FOR UPDATE
  USING ((SELECT auth.uid()) = created_by OR (SELECT auth.uid()) = assigned_to);

-- accessibility_scores
DROP POLICY IF EXISTS "scores_insert_auth" ON public.accessibility_scores;
CREATE POLICY "scores_insert_auth" ON public.accessibility_scores
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- enrollments
DROP POLICY IF EXISTS "enrollments_own" ON public.enrollments;
CREATE POLICY "enrollments_own" ON public.enrollments
  USING  ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- lesson_progress
DROP POLICY IF EXISTS "lesson_progress_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_own" ON public.lesson_progress
  USING  ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ticket_events
DROP POLICY IF EXISTS "ticket_events_auth_read"   ON public.ticket_events;
DROP POLICY IF EXISTS "ticket_events_auth_insert" ON public.ticket_events;

CREATE POLICY "ticket_events_auth_read" ON public.ticket_events
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "ticket_events_auth_insert" ON public.ticket_events
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- volunteer_applications
DROP POLICY IF EXISTS "vol_app_own" ON public.volunteer_applications;
CREATE POLICY "vol_app_own" ON public.volunteer_applications
  FOR ALL
  USING  ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- auditor_profiles
DROP POLICY IF EXISTS "auditor_profile_select" ON public.auditor_profiles;
DROP POLICY IF EXISTS "auditor_profile_update" ON public.auditor_profiles;

CREATE POLICY "auditor_profile_select" ON public.auditor_profiles
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "auditor_profile_update" ON public.auditor_profiles
  FOR UPDATE
  USING  ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- audit_submissions
DROP POLICY IF EXISTS "audit_sub_own"               ON public.audit_submissions;
DROP POLICY IF EXISTS "audit_sub_ticket_owner_read" ON public.audit_submissions;

CREATE POLICY "audit_sub_own" ON public.audit_submissions
  FOR ALL
  USING (
    auditor_id IN (
      SELECT id FROM public.auditor_profiles WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    auditor_id IN (
      SELECT id FROM public.auditor_profiles WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "audit_sub_ticket_owner_read" ON public.audit_submissions
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM public.tickets WHERE created_by = (SELECT auth.uid())
    )
  );

-- admin_users
DROP POLICY IF EXISTS "admin_self_read" ON public.admin_users;
CREATE POLICY "admin_self_read" ON public.admin_users
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- organizaciones_distintivo
DROP POLICY IF EXISTS "org_dist_own" ON public.organizaciones_distintivo;
CREATE POLICY "org_dist_own" ON public.organizaciones_distintivo
  FOR ALL
  USING  ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- solicitudes_distintivo
DROP POLICY IF EXISTS "sol_dist_own" ON public.solicitudes_distintivo;
CREATE POLICY "sol_dist_own" ON public.solicitudes_distintivo
  FOR ALL
  USING (
    organizacion_id IN (
      SELECT id FROM public.organizaciones_distintivo
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    organizacion_id IN (
      SELECT id FROM public.organizaciones_distintivo
      WHERE user_id = (SELECT auth.uid())
    )
  );

-- etapas_progreso
DROP POLICY IF EXISTS "etapas_progreso_own" ON public.etapas_progreso;
CREATE POLICY "etapas_progreso_own" ON public.etapas_progreso
  FOR ALL
  USING (
    solicitud_id IN (
      SELECT s.id FROM public.solicitudes_distintivo s
      JOIN   public.organizaciones_distintivo o ON o.id = s.organizacion_id
      WHERE  o.user_id = (SELECT auth.uid())
    )
  );

-- user_profiles
DROP POLICY IF EXISTS "usuario_select_propio" ON public.user_profiles;
DROP POLICY IF EXISTS "usuario_insert_propio" ON public.user_profiles;
DROP POLICY IF EXISTS "usuario_update_propio" ON public.user_profiles;

CREATE POLICY "usuario_select_propio" ON public.user_profiles
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "usuario_insert_propio" ON public.user_profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "usuario_update_propio" ON public.user_profiles
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- legislacion_pais
DROP POLICY IF EXISTS "legislacion_insert_admin" ON public.legislacion_pais;
DROP POLICY IF EXISTS "legislacion_update_admin" ON public.legislacion_pais;
DROP POLICY IF EXISTS "legislacion_delete_admin" ON public.legislacion_pais;

CREATE POLICY "legislacion_insert_admin" ON public.legislacion_pais
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
  );

CREATE POLICY "legislacion_update_admin" ON public.legislacion_pais
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
  );

CREATE POLICY "legislacion_delete_admin" ON public.legislacion_pais
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
  );

-- audit_wcag_results
DROP POLICY IF EXISTS "audit_wcag_own"               ON public.audit_wcag_results;
DROP POLICY IF EXISTS "audit_wcag_ticket_owner_read" ON public.audit_wcag_results;

CREATE POLICY "audit_wcag_own" ON public.audit_wcag_results
  FOR ALL
  USING (
    audit_submission_id IN (
      SELECT s.id FROM public.audit_submissions s
      JOIN   public.auditor_profiles ap ON s.auditor_id = ap.id
      WHERE  ap.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    audit_submission_id IN (
      SELECT s.id FROM public.audit_submissions s
      JOIN   public.auditor_profiles ap ON s.auditor_id = ap.id
      WHERE  ap.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "audit_wcag_ticket_owner_read" ON public.audit_wcag_results
  FOR SELECT USING (
    audit_submission_id IN (
      SELECT s.id FROM public.audit_submissions s
      JOIN   public.tickets t ON s.ticket_id = t.id
      WHERE  t.created_by = (SELECT auth.uid())
    )
  );

-- lessons_enrolled_read (introducida en migración 016)
DROP POLICY IF EXISTS "lessons_enrolled_read" ON public.lessons;
CREATE POLICY "lessons_enrolled_read" ON public.lessons
  FOR SELECT USING (
    published = true
    AND course_id IN (
      SELECT course_id FROM public.enrollments WHERE user_id = (SELECT auth.uid())
    )
  );
