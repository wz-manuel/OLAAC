-- ============================================================
-- Migración 023 — Verificación de certificados por folio vía RPC
-- ============================================================
-- Problema: la política "certificates_verify_by_folio" (migración 003)
-- usaba USING (true), por lo que cualquier visitante anónimo podía
-- listar TODOS los certificados vía REST: nombre del estudiante,
-- user_id y storage_path.
--
-- Fix: la lectura directa de la tabla queda limitada al propietario.
-- La verificación pública (/certificados/[folio]) pasa por una función
-- que exige conocer el folio exacto y solo devuelve los campos que
-- muestra la página.

DROP POLICY IF EXISTS "certificates_verify_by_folio" ON public.certificates;

CREATE POLICY "certificates_owner_select"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- SECURITY DEFINER: corre como owner y bypasea la RLS anterior.
CREATE OR REPLACE FUNCTION public.verify_certificate(p_folio text)
RETURNS TABLE (
  folio        text,
  student_name text,
  course_title text,
  issued_at    timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.folio, c.student_name, c.course_title, c.issued_at
  FROM certificates c
  WHERE c.folio = p_folio;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
