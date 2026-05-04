-- ============================================================
-- Migración 019 — Revocar EXECUTE de PUBLIC en funciones sensibles
-- El rol anon hereda de PUBLIC. Las migraciones 017/018 revocaron
-- de anon/authenticated pero PUBLIC seguía activo. Esta migración
-- revoca de PUBLIC (el origen del grant) y re-otorga explícitamente
-- solo a los roles que necesitan acceso.
-- ============================================================

-- add_role_to_user: solo service_role/postgres (server actions internas)
-- authenticated ya fue revocado en migración 018.
REVOKE EXECUTE ON FUNCTION public.add_role_to_user(uuid, public.rol_usuario)
  FROM PUBLIC;

-- get_user_roles, has_role, is_admin: revocamos PUBLIC pero mantenemos
-- authenticated (necesario para políticas RLS y server actions).
-- La consulta de production confirma que authenticated ya tiene grant explícito.
REVOKE EXECUTE ON FUNCTION public.get_user_roles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(public.rol_usuario) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
