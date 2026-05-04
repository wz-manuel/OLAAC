-- ============================================================
-- Migración 018 — Revocar EXECUTE de funciones sensibles
-- CREATE OR REPLACE en la migración 017 re-aplicó los default
-- privileges del schema (anon + authenticated). Este script
-- aplica el REVOKE después de que las funciones ya existen.
-- ============================================================

-- add_role_to_user: escala privilegios de usuarios → solo service_role
REVOKE EXECUTE ON FUNCTION public.add_role_to_user(uuid, public.rol_usuario)
  FROM anon, authenticated;

-- Las siguientes no necesitan ser expuestas vía REST API al rol anon.
-- El rol authenticated las conserva para uso interno en RLS y server actions.
REVOKE EXECUTE ON FUNCTION public.get_user_roles() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(public.rol_usuario) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
