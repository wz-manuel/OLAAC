-- ============================================================
-- Migración 022 — Políticas de admin solo para `authenticated`
-- ============================================================
-- Problema: las migraciones 017–019 revocaron EXECUTE de is_admin() a
-- anon y PUBLIC, pero las políticas RLS que la invocan seguían aplicando
-- a todos los roles. Postgres evalúa todas las políticas permisivas de
-- una tabla, así que cualquier lectura anónima fallaba con
-- "permission denied for function is_admin" (42501) — incluso en tablas
-- con lectura pública como courses y lessons (catálogo de la academia).
--
-- Fix: limitar al rol authenticated toda política que invoque is_admin().
-- Un visitante anónimo nunca es admin, por lo que no cambia quién puede
-- ver o escribir qué; solo deja de evaluarse la función para anon.
-- Se mantiene la revocación de EXECUTE (is_admin no queda expuesta vía RPC).

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND 'public' = ANY (roles)
      AND (qual ILIKE '%is_admin()%' OR with_check ILIKE '%is_admin()%')
  LOOP
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO authenticated',
      pol.policyname, pol.schemaname, pol.tablename
    );
    RAISE NOTICE 'Política % en %.% restringida a authenticated',
      pol.policyname, pol.schemaname, pol.tablename;
  END LOOP;
END $$;
