-- 007_distintivo_accesibilidad.sql
-- Módulo: Distintivo de Accesibilidad OLAAC
-- Tablas: organizaciones_distintivo, solicitudes_distintivo, etapas_progreso,
--         criterios_distintivo, distintivos_emitidos

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE public.badge_nivel AS ENUM ('oro', 'platino', 'diamante');

CREATE TYPE public.tipo_organizacion AS ENUM ('publica', 'privada', 'mixta', 'ong');

CREATE TYPE public.solicitud_distintivo_status AS ENUM (
  'borrador',
  'enviada',
  'en_revision',
  'aprobada_para_programa',
  'en_programa',
  'auditada',
  'distintivo_emitido',
  'rechazada',
  'suspendida',
  'revocada'
);

CREATE TYPE public.etapa_programa AS ENUM (
  'concientizacion',
  'capacitacion',
  'auditoria',
  'remediacion',
  'design_ops',
  'politicas',
  'declaratoria'
);

CREATE TYPE public.etapa_estado AS ENUM (
  'pendiente',
  'en_curso',
  'completada',
  'omitida'
);

-- ─── organizaciones_distintivo ───────────────────────────────────────────────
-- Perfil de la organización que solicita el distintivo.
-- Un usuario puede registrar una sola organización (UNIQUE en user_id).

CREATE TABLE public.organizaciones_distintivo (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL UNIQUE
                                   REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_organizacion  text        NOT NULL,
  tipo                 public.tipo_organizacion NOT NULL,
  sitio_web            text        NOT NULL,
  descripcion          text,
  logo_url             text,
  contacto_nombre      text        NOT NULL,
  contacto_email       text        NOT NULL,
  contacto_telefono    text,
  pais                 text        NOT NULL DEFAULT 'México',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ─── criterios_distintivo ────────────────────────────────────────────────────
-- Umbrales por nivel de badge. Administrados desde el panel OLAAC.

CREATE TABLE public.criterios_distintivo (
  id                          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  nivel                       public.badge_nivel NOT NULL UNIQUE,
  min_tareas_accesibles       integer       NOT NULL,
  min_flujos_accesibles       integer       NOT NULL,
  min_experiencias_accesibles integer       NOT NULL,
  min_porcentaje_accesibilidad numeric(5,2) NOT NULL,
  descripcion                 text,
  beneficios                  text[]        NOT NULL DEFAULT '{}',
  vigencia_meses              integer       NOT NULL DEFAULT 12,
  created_at                  timestamptz   NOT NULL DEFAULT now()
);

-- Criterios iniciales por nivel
INSERT INTO public.criterios_distintivo
  (nivel, min_tareas_accesibles, min_flujos_accesibles, min_experiencias_accesibles, min_porcentaje_accesibilidad, descripcion, beneficios)
VALUES
  (
    'oro', 10, 5, 3, 25.00,
    'Distintivo de acceso para organizaciones que inician su camino hacia la accesibilidad digital.',
    ARRAY[
      'Sello verificado en sitio web',
      'Mención en el directorio OLAAC',
      'Certificado digital de accesibilidad'
    ]
  ),
  (
    'platino', 25, 15, 8, 50.00,
    'Reconocimiento para organizaciones con un compromiso maduro y procesos establecidos de accesibilidad.',
    ARRAY[
      'Sello verificado en sitio web',
      'Mención destacada en el directorio OLAAC',
      'Certificado digital de accesibilidad',
      'Reporte de accesibilidad personalizado',
      'Acceso prioritario a auditorías'
    ]
  ),
  (
    'diamante', 50, 30, 15, 75.00,
    'La máxima distinción OLAAC para organizaciones líderes en accesibilidad e inclusión digital en Latinoamérica.',
    ARRAY[
      'Sello verificado en sitio web',
      'Mención de honor en el directorio OLAAC',
      'Certificado digital y físico de accesibilidad',
      'Reporte ejecutivo de accesibilidad',
      'Mentoría en Design Ops de accesibilidad',
      'Representación en foros OLAAC',
      'Acceso a red de expertos'
    ]
  );

-- ─── solicitudes_distintivo ──────────────────────────────────────────────────
-- Solicitud principal. Una organización puede tener múltiples solicitudes
-- históricas; solo una activa a la vez (estado NOT IN ('revocada','rechazada')).

CREATE TABLE public.solicitudes_distintivo (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  folio                 text        UNIQUE NOT NULL,
  organizacion_id       uuid        NOT NULL
                                    REFERENCES public.organizaciones_distintivo(id) ON DELETE RESTRICT,
  nivel_solicitado      public.badge_nivel NOT NULL,
  nivel_otorgado        public.badge_nivel,
  estado                public.solicitud_distintivo_status NOT NULL DEFAULT 'borrador',
  etapa_actual          public.etapa_programa,

  -- Métricas de accesibilidad (llenadas en auditoría)
  tareas_accesibles     integer     NOT NULL DEFAULT 0,
  flujos_accesibles     integer     NOT NULL DEFAULT 0,
  experiencias_accesibles integer   NOT NULL DEFAULT 0,
  total_tareas          integer     NOT NULL DEFAULT 0,
  total_flujos          integer     NOT NULL DEFAULT 0,
  total_experiencias    integer     NOT NULL DEFAULT 0,

  -- Conexiones con otros módulos
  ticket_id             uuid        REFERENCES public.tickets(id) ON DELETE SET NULL,
  auditor_id            uuid        REFERENCES public.auditor_profiles(id) ON DELETE SET NULL,

  -- Fechas
  fecha_solicitud       timestamptz NOT NULL DEFAULT now(),
  fecha_inicio_programa timestamptz,
  fecha_auditoria       timestamptz,
  fecha_emision         timestamptz,

  notas_admin           text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_solicitudes_org     ON public.solicitudes_distintivo(organizacion_id);
CREATE INDEX idx_solicitudes_estado  ON public.solicitudes_distintivo(estado);
CREATE INDEX idx_solicitudes_folio   ON public.solicitudes_distintivo(folio);

-- Trigger: folio automático  DIST-YYYY-NNNN
CREATE OR REPLACE FUNCTION public.generate_distintivo_folio()
RETURNS trigger LANGUAGE plpgsql AS $$
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

CREATE TRIGGER trg_distintivo_folio
  BEFORE INSERT ON public.solicitudes_distintivo
  FOR EACH ROW EXECUTE FUNCTION public.generate_distintivo_folio();

-- ─── etapas_progreso ────────────────────────────────────────────────────────
-- Una fila por etapa × solicitud. Registra avance del programa.
-- Se conecta con cursos de la Academia y tickets del sistema.

CREATE TABLE public.etapas_progreso (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id         uuid        NOT NULL
                                   REFERENCES public.solicitudes_distintivo(id) ON DELETE CASCADE,
  etapa                public.etapa_programa NOT NULL,
  estado               public.etapa_estado NOT NULL DEFAULT 'pendiente',

  -- Conexión con Academia (capacitación)
  curso_id             uuid        REFERENCES public.courses(id) ON DELETE SET NULL,
  enrollment_completado boolean    NOT NULL DEFAULT false,

  -- Conexión con Tickets (auditoría / remediación)
  ticket_id            uuid        REFERENCES public.tickets(id) ON DELETE SET NULL,

  fecha_inicio         timestamptz,
  fecha_completada     timestamptz,
  notas                text,
  archivos_evidencia   text[]      NOT NULL DEFAULT '{}',

  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE(solicitud_id, etapa)
);

-- ─── distintivos_emitidos ────────────────────────────────────────────────────
-- Registro oficial del badge emitido. Fuente de verdad para verificación pública.

CREATE TABLE public.distintivos_emitidos (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id      uuid        NOT NULL UNIQUE
                                REFERENCES public.solicitudes_distintivo(id) ON DELETE RESTRICT,
  organizacion_id   uuid        NOT NULL
                                REFERENCES public.organizaciones_distintivo(id) ON DELETE RESTRICT,
  nivel             public.badge_nivel NOT NULL,
  folio             text        UNIQUE NOT NULL,

  badge_svg_url     text,
  badge_pdf_url     text,
  embed_html        text,

  fecha_emision     timestamptz NOT NULL DEFAULT now(),
  fecha_vencimiento timestamptz NOT NULL,

  vigente           boolean     NOT NULL DEFAULT true,
  motivo_revocacion text,
  fecha_revocacion  timestamptz,

  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_distintivos_org     ON public.distintivos_emitidos(organizacion_id);
CREATE INDEX idx_distintivos_folio   ON public.distintivos_emitidos(folio);
CREATE INDEX idx_distintivos_vigente ON public.distintivos_emitidos(vigente);

-- Trigger: folio de badge  BADGE-YYYY-HEX8
CREATE OR REPLACE FUNCTION public.generate_badge_folio()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.folio := 'BADGE-' || to_char(now(), 'YYYY') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_badge_folio
  BEFORE INSERT ON public.distintivos_emitidos
  FOR EACH ROW WHEN (NEW.folio IS NULL OR NEW.folio = '')
  EXECUTE FUNCTION public.generate_badge_folio();

-- ─── Trigger: updated_at ─────────────────────────────────────────────────────

CREATE TRIGGER trg_organizaciones_distintivo_updated_at
  BEFORE UPDATE ON public.organizaciones_distintivo
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_solicitudes_distintivo_updated_at
  BEFORE UPDATE ON public.solicitudes_distintivo
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.organizaciones_distintivo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_distintivo    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapas_progreso           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criterios_distintivo      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distintivos_emitidos      ENABLE ROW LEVEL SECURITY;

-- organizaciones_distintivo: el usuario gestiona su propia organización
CREATE POLICY "org_dist_own"
  ON public.organizaciones_distintivo
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- solicitudes_distintivo: la organización gestiona sus solicitudes
CREATE POLICY "sol_dist_own"
  ON public.solicitudes_distintivo
  FOR ALL
  USING (
    organizacion_id IN (
      SELECT id FROM public.organizaciones_distintivo WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organizacion_id IN (
      SELECT id FROM public.organizaciones_distintivo WHERE user_id = auth.uid()
    )
  );

-- etapas_progreso: lectura/escritura por organización dueña de la solicitud
CREATE POLICY "etapas_progreso_own"
  ON public.etapas_progreso
  FOR ALL
  USING (
    solicitud_id IN (
      SELECT s.id FROM public.solicitudes_distintivo s
      JOIN public.organizaciones_distintivo o ON o.id = s.organizacion_id
      WHERE o.user_id = auth.uid()
    )
  );

-- criterios_distintivo: lectura pública
CREATE POLICY "criterios_dist_public_read"
  ON public.criterios_distintivo
  FOR SELECT
  USING (true);

-- distintivos_emitidos: lectura pública (verificación), escritura por admin
CREATE POLICY "distintivos_public_read"
  ON public.distintivos_emitidos
  FOR SELECT
  USING (true);
