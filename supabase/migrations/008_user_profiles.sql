-- ============================================================
-- Migración 008 — Perfiles de usuario y sistema de roles
-- Crea user_profiles como fuente de verdad de datos del usuario
-- y establece los roles posibles en el observatorio.
-- ============================================================

-- Enum de roles disponibles en el observatorio
CREATE TYPE rol_usuario AS ENUM (
  'general',    -- usuario registrado sin rol especial
  'voluntario', -- aplicó o está en proceso como auditor voluntario
  'auditor',    -- auditor voluntario certificado
  'estudiante'  -- inscrito en al menos un curso de la academia
);

-- Tabla de perfiles de usuario
CREATE TABLE user_profiles (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo  text        NOT NULL CHECK (char_length(nombre_completo) >= 2),
  email            text        NOT NULL,
  pais             text,
  roles            rol_usuario[] NOT NULL DEFAULT ARRAY['general']::rol_usuario[],
  onboarding_complete boolean  NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX user_profiles_user_id_idx ON user_profiles (user_id);
CREATE INDEX user_profiles_roles_idx   ON user_profiles USING gin (roles);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Usuario: leer y actualizar su propio perfil
CREATE POLICY "usuario_select_propio" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usuario_insert_propio" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuario_update_propio" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin: leer todos los perfiles
CREATE POLICY "admin_select_perfiles" ON user_profiles
  FOR SELECT USING (is_admin());

-- ── Función helper: obtener roles del usuario actual ─────────────────────────
CREATE OR REPLACE FUNCTION get_user_roles()
RETURNS rol_usuario[] LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT roles FROM user_profiles WHERE user_id = auth.uid();
$$;

-- ── Función helper: verificar si tiene un rol específico ────────────────────
CREATE OR REPLACE FUNCTION has_role(role_to_check rol_usuario)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role_to_check = ANY(roles)
  );
$$;

-- ── Agrega rol 'voluntario' al aprobarse solicitud ───────────────────────────
-- Se invoca desde la server action de aprobación de voluntarios
CREATE OR REPLACE FUNCTION add_role_to_user(target_user_id uuid, new_role rol_usuario)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE user_profiles
  SET roles = array_append(roles, new_role)
  WHERE user_id = target_user_id
    AND NOT (new_role = ANY(roles));
$$;

-- ── Nota de migración ────────────────────────────────────────────────────────
-- Los roles se gestionan así:
--   'general'    → asignado en registro
--   'voluntario' → add_role_to_user() al aprobar volunteer_applications
--   'auditor'    → add_role_to_user() al certificar auditor_profiles
--   'estudiante' → add_role_to_user() al primer enrollment en academy
