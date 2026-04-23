-- 006_admin_panel.sql
-- Panel de Administración OLAAC
-- Tablas: admin_users
-- Función: is_admin()
-- Columna: volunteer_applications.email_contacto
-- RLS: políticas de acceso admin en tablas del módulo de voluntarios y tickets

-- ─── admin_users ─────────────────────────────────────────────────────────────
-- Tabla de control de administradores. El equipo OLAAC inserta filas directamente
-- desde el panel de Supabase (requiere service_role). Los usuarios admin pueden
-- leer su propia fila para autodetección.

CREATE TABLE public.admin_users (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_self_read"
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- ─── is_admin() ──────────────────────────────────────────────────────────────
-- SECURITY DEFINER + SET search_path = public: evita que la RLS de admin_users
-- bloquee la función cuando se usa dentro de otras políticas RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid());
$$;

-- ─── email_contacto en volunteer_applications ─────────────────────────────────
-- Almacena el email del solicitante en el momento de la inscripción para que
-- el admin pueda contactarlo sin acceder a auth.users directamente.

ALTER TABLE public.volunteer_applications
  ADD COLUMN email_contacto text;

-- ─── RLS: volunteer_applications ─────────────────────────────────────────────

-- Admin puede leer todas las solicitudes
CREATE POLICY "admin_read_vol_apps"
  ON public.volunteer_applications
  FOR SELECT
  USING (public.is_admin());

-- Admin puede actualizar estado, reviewed_at, reviewed_by
CREATE POLICY "admin_update_vol_apps"
  ON public.volunteer_applications
  FOR UPDATE
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── RLS: auditor_profiles ────────────────────────────────────────────────────

-- Admin puede insertar perfiles (al aprobar solicitudes) y gestionar todos
CREATE POLICY "admin_all_auditor_profiles"
  ON public.auditor_profiles
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── RLS: auditor_learning_path ──────────────────────────────────────────────

-- Admin puede escribir en la ruta de formación
CREATE POLICY "admin_write_learning_path"
  ON public.auditor_learning_path
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── RLS: audit_submissions ──────────────────────────────────────────────────

-- Admin puede leer todos los resultados de auditoría
CREATE POLICY "admin_read_audit_submissions"
  ON public.audit_submissions
  FOR SELECT
  USING (public.is_admin());

-- ─── RLS: tickets ────────────────────────────────────────────────────────────

-- Admin puede actualizar cualquier ticket (asignar, cambiar estado)
CREATE POLICY "admin_update_tickets"
  ON public.tickets
  FOR UPDATE
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin puede leer todos los eventos de tickets
ALTER TABLE public.ticket_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ticket_events_auth_read"
  ON public.ticket_events
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "ticket_events_auth_insert"
  ON public.ticket_events
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
