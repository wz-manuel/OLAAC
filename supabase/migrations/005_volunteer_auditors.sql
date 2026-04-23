-- 005_volunteer_auditors.sql
-- Programa de Auditores Voluntarios OLAAC
-- Tablas: volunteer_applications, auditor_profiles, auditor_learning_path, audit_submissions

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE public.auditor_status AS ENUM (
  'en_formacion',
  'certificado',
  'activo',
  'inactivo',
  'suspendido'
);

CREATE TYPE public.application_status AS ENUM (
  'pendiente',
  'aprobado',
  'rechazado'
);

-- ─── volunteer_applications ───────────────────────────────────────────────────
-- Solicitud inicial de un usuario para unirse como auditor voluntario.
-- UNIQUE en user_id: una solicitud activa por usuario.
-- El equipo OLAAC aprueba/rechaza desde el panel de Supabase.

CREATE TABLE public.volunteer_applications (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid        NOT NULL UNIQUE
                                 REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo    text        NOT NULL,
  pais               text        NOT NULL,
  motivacion         text        NOT NULL
                                 CHECK (char_length(motivacion) >= 50),
  experiencia_previa text,
  estado             public.application_status NOT NULL DEFAULT 'pendiente',
  created_at         timestamptz NOT NULL DEFAULT now(),
  reviewed_at        timestamptz,
  reviewed_by        uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ─── auditor_profiles ────────────────────────────────────────────────────────
-- Perfil del auditor, creado por el equipo OLAAC al aprobar la solicitud.
-- Estado: en_formacion → certificado → activo (ciclo normal).

CREATE TABLE public.auditor_profiles (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL UNIQUE
                              REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo text        NOT NULL,
  pais            text        NOT NULL,
  estado          public.auditor_status NOT NULL DEFAULT 'en_formacion',
  certified_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── auditor_learning_path ───────────────────────────────────────────────────
-- Cursos requeridos para obtener la certificación de auditor.
-- Gestionado por el equipo OLAAC directamente en Supabase.

CREATE TABLE public.auditor_learning_path (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid    NOT NULL UNIQUE
              REFERENCES public.courses(id) ON DELETE CASCADE,
  orden       integer NOT NULL DEFAULT 0,
  obligatorio boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── audit_submissions ───────────────────────────────────────────────────────
-- Resultados de auditoría enviados por auditores certificados/activos.
-- Un auditor solo puede enviar resultados una vez por ticket (UNIQUE).

CREATE TABLE public.audit_submissions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       uuid        NOT NULL
                              REFERENCES public.tickets(id) ON DELETE CASCADE,
  auditor_id      uuid        NOT NULL
                              REFERENCES public.auditor_profiles(id) ON DELETE RESTRICT,
  resumen         text        NOT NULL
                              CHECK (char_length(resumen) >= 30),
  hallazgos       jsonb       NOT NULL DEFAULT '[]'::jsonb,
  recomendaciones text,
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ticket_id, auditor_id)
);

-- ─── Trigger: updated_at en auditor_profiles ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auditor_profiles_updated_at
  BEFORE UPDATE ON public.auditor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditor_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditor_learning_path  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_submissions      ENABLE ROW LEVEL SECURITY;

-- volunteer_applications: cada usuario gestiona su propia solicitud
CREATE POLICY "vol_app_own"
  ON public.volunteer_applications
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- auditor_profiles: el usuario lee su propio perfil y puede actualizarlo
-- (la acción checkCertification actualiza estado vía la sesión del usuario)
CREATE POLICY "auditor_profile_select"
  ON public.auditor_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "auditor_profile_update"
  ON public.auditor_profiles
  FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- auditor_learning_path: lectura pública — cualquier usuario puede ver la ruta
CREATE POLICY "learning_path_public_read"
  ON public.auditor_learning_path
  FOR SELECT
  USING (true);

-- audit_submissions: el auditor gestiona sus propios envíos
CREATE POLICY "audit_sub_own"
  ON public.audit_submissions
  FOR ALL
  USING (
    auditor_id IN (
      SELECT id FROM public.auditor_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auditor_id IN (
      SELECT id FROM public.auditor_profiles WHERE user_id = auth.uid()
    )
  );

-- audit_submissions: el creador del ticket puede leer los resultados
CREATE POLICY "audit_sub_ticket_owner_read"
  ON public.audit_submissions
  FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM public.tickets WHERE created_by = auth.uid()
    )
  );
