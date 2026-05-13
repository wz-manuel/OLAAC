-- ============================================================
-- Migración 020 — Remediación de seguridad P1
-- Bitácora: security_remediation_log.md — ítems P1.3
-- ============================================================
-- Problema: auditor_learning_path solo tiene política SELECT pública.
-- Sin política de escritura, los admins no pueden gestionar la ruta
-- de formación desde las server actions (addCourseToPath, etc.)
-- porque usan createClient() que respeta RLS.
-- ============================================================

CREATE POLICY "learning_path_admin_write"
  ON public.auditor_learning_path
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());
