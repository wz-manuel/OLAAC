-- ============================================================
-- Migración 016 — Hardening de seguridad
-- Detectado por Supabase Security Advisor:
--   · courses y lessons sin RLS (crítico)
--   · notification_log con INSERT público permisivo
--   · distintivo_reauditorias sin política de lectura para admins
-- ============================================================

-- ─── 1. courses — habilitar RLS ──────────────────────────────────────────────
-- Sin RLS cualquier cliente con la anon key puede leer cursos no publicados
-- y —en ausencia de políticas— también escribirlos.

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo cursos publicados
CREATE POLICY "courses_public_read"
  ON public.courses FOR SELECT
  USING (published = true);

-- Lectura admin: todos los cursos (borradores incluidos)
CREATE POLICY "courses_admin_read"
  ON public.courses FOR SELECT
  USING (public.is_admin());

-- Escritura: solo service_role (bypass automático) o admin
CREATE POLICY "courses_admin_write"
  ON public.courses FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── 2. lessons — habilitar RLS ──────────────────────────────────────────────

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lectura pública: lecciones publicadas de cursos publicados
CREATE POLICY "lessons_public_read"
  ON public.lessons FOR SELECT
  USING (
    published = true
    AND course_id IN (SELECT id FROM public.courses WHERE published = true)
  );

-- Lectura para usuarios inscritos: pueden leer todas las lecciones publicadas
-- de los cursos en los que están inscritos (independientemente del estado del enrollment)
CREATE POLICY "lessons_enrolled_read"
  ON public.lessons FOR SELECT
  USING (
    published = true
    AND course_id IN (
      SELECT course_id FROM public.enrollments WHERE user_id = auth.uid()
    )
  );

-- Lectura admin: todas las lecciones
CREATE POLICY "lessons_admin_read"
  ON public.lessons FOR SELECT
  USING (public.is_admin());

-- Escritura: solo admins (o service_role con bypass)
CREATE POLICY "lessons_admin_write"
  ON public.lessons FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── 3. notification_log — corregir INSERT permisivo ─────────────────────────
-- La política original WITH CHECK (true) permitía que cualquier usuario
-- anónimo insertara registros arbitrarios en el log de notificaciones.
-- Fix: ses.ts pasa a usar createServiceClient() que bypasea RLS.
-- Esta política ya no es necesaria.

DROP POLICY IF EXISTS "server_insert_notification_log" ON public.notification_log;

-- ─── 4. distintivo_reauditorias — política de lectura para admins ─────────────
-- RLS estaba activo pero sin políticas SELECT → ni siquiera los admins con sesión
-- podían consultar el log de re-auditorías desde el dashboard.

CREATE POLICY "reauditorias_admin_read"
  ON public.distintivo_reauditorias FOR SELECT
  USING (public.is_admin());

-- ─── 5. lighthouse_metrics — verificación (ya cubierto en migración 002) ──────
-- La migración 002 habilita RLS y crea "lh_metrics_select_all".
-- El service_role de GitHub Actions bypasea RLS automáticamente: no se necesita
-- política de INSERT. Si el dashboard aún muestra la alerta después de aplicar
-- esta migración, ejecuta en el SQL Editor:
--
--   SELECT relrowsecurity FROM pg_class WHERE relname = 'lighthouse_metrics';
--   -- debe devolver: t
