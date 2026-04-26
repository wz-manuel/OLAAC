-- 012_wcag_criterios.sql
-- Metodología WCAG 2.1 AA — catálogo de criterios y resultados estructurados por auditoría

-- ─── Enum de resultado por criterio ──────────────────────────────────────────

CREATE TYPE public.wcag_result_enum AS ENUM (
  'cumple',
  'no_cumple',
  'no_aplica',
  'no_evaluado'
);

-- ─── wcag_criterios — catálogo estático ──────────────────────────────────────
-- Poblado una vez. No requiere escritura por usuarios.

CREATE TABLE public.wcag_criterios (
  codigo    text PRIMARY KEY,
  nivel     text NOT NULL CHECK (nivel IN ('A', 'AA')),
  principio text NOT NULL CHECK (principio IN ('Perceptible', 'Operable', 'Comprensible', 'Robusto')),
  directriz text NOT NULL,
  nombre    text NOT NULL,
  es_21     boolean NOT NULL DEFAULT false
);

-- ─── audit_wcag_results — resultados por criterio ────────────────────────────
-- Un registro por (auditoría × criterio evaluado).

CREATE TABLE public.audit_wcag_results (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_submission_id uuid        NOT NULL
                                  REFERENCES public.audit_submissions(id) ON DELETE CASCADE,
  criterio_codigo     text        NOT NULL
                                  REFERENCES public.wcag_criterios(codigo),
  resultado           public.wcag_result_enum NOT NULL DEFAULT 'no_evaluado',
  notas               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(audit_submission_id, criterio_codigo)
);

-- Puntuación WCAG calculada en el momento de envío (cumple / (cumple + no_cumple))
ALTER TABLE public.audit_submissions
  ADD COLUMN puntaje_wcag numeric(4,3) CHECK (puntaje_wcag >= 0 AND puntaje_wcag <= 1);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.wcag_criterios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_wcag_results ENABLE ROW LEVEL SECURITY;

-- El catálogo es de lectura pública
CREATE POLICY "wcag_criterios_public_read"
  ON public.wcag_criterios FOR SELECT USING (true);

-- El auditor gestiona sus propios resultados
CREATE POLICY "audit_wcag_own"
  ON public.audit_wcag_results
  FOR ALL
  USING (
    audit_submission_id IN (
      SELECT s.id FROM public.audit_submissions s
      JOIN   public.auditor_profiles ap ON s.auditor_id = ap.id
      WHERE  ap.user_id = auth.uid()
    )
  )
  WITH CHECK (
    audit_submission_id IN (
      SELECT s.id FROM public.audit_submissions s
      JOIN   public.auditor_profiles ap ON s.auditor_id = ap.id
      WHERE  ap.user_id = auth.uid()
    )
  );

-- El creador del ticket puede leer los resultados WCAG de sus tickets
CREATE POLICY "audit_wcag_ticket_owner_read"
  ON public.audit_wcag_results FOR SELECT
  USING (
    audit_submission_id IN (
      SELECT s.id FROM public.audit_submissions s
      JOIN   public.tickets t ON s.ticket_id = t.id
      WHERE  t.created_by = auth.uid()
    )
  );

-- ─── Seed: 50 criterios WCAG 2.1 niveles A y AA ──────────────────────────────

INSERT INTO public.wcag_criterios (codigo, nivel, principio, directriz, nombre, es_21) VALUES
-- ── Principio 1: Perceptible ──────────────────────────────────────────────────
('1.1.1',  'A',  'Perceptible', 'Alternativas textuales',   'Contenido no textual',                                    false),
('1.2.1',  'A',  'Perceptible', 'Medios tempodependientes', 'Solo audio y solo vídeo (pregrabado)',                     false),
('1.2.2',  'A',  'Perceptible', 'Medios tempodependientes', 'Subtítulos (pregrabado)',                                  false),
('1.2.3',  'A',  'Perceptible', 'Medios tempodependientes', 'Audiodescripción o medio alternativo (pregrabado)',        false),
('1.2.4',  'AA', 'Perceptible', 'Medios tempodependientes', 'Subtítulos (en directo)',                                  false),
('1.2.5',  'AA', 'Perceptible', 'Medios tempodependientes', 'Audiodescripción (pregrabado)',                            false),
('1.3.1',  'A',  'Perceptible', 'Adaptable',                'Información y relaciones',                                false),
('1.3.2',  'A',  'Perceptible', 'Adaptable',                'Secuencia significativa',                                 false),
('1.3.3',  'A',  'Perceptible', 'Adaptable',                'Características sensoriales',                             false),
('1.3.4',  'AA', 'Perceptible', 'Adaptable',                'Orientación',                                             true),
('1.3.5',  'AA', 'Perceptible', 'Adaptable',                'Identificación del propósito de la entrada',              true),
('1.4.1',  'A',  'Perceptible', 'Distinguible',             'Uso del color',                                           false),
('1.4.2',  'A',  'Perceptible', 'Distinguible',             'Control de audio',                                        false),
('1.4.3',  'AA', 'Perceptible', 'Distinguible',             'Contraste (mínimo)',                                      false),
('1.4.4',  'AA', 'Perceptible', 'Distinguible',             'Cambio de tamaño del texto',                              false),
('1.4.5',  'AA', 'Perceptible', 'Distinguible',             'Imágenes de texto',                                       false),
('1.4.10', 'AA', 'Perceptible', 'Distinguible',             'Reajuste del contenido',                                  true),
('1.4.11', 'AA', 'Perceptible', 'Distinguible',             'Contraste en componentes no textuales',                   true),
('1.4.12', 'AA', 'Perceptible', 'Distinguible',             'Espaciado del texto',                                     true),
('1.4.13', 'AA', 'Perceptible', 'Distinguible',             'Contenido en hover o focus',                              true),
-- ── Principio 2: Operable ─────────────────────────────────────────────────────
('2.1.1',  'A',  'Operable', 'Accesible por teclado',  'Teclado',                                    false),
('2.1.2',  'A',  'Operable', 'Accesible por teclado',  'Sin trampa para el foco del teclado',         false),
('2.1.4',  'A',  'Operable', 'Accesible por teclado',  'Atajos de tecla de carácter',                 true),
('2.2.1',  'A',  'Operable', 'Tiempo suficiente',      'Tiempo ajustable',                            false),
('2.2.2',  'A',  'Operable', 'Tiempo suficiente',      'Poner en pausa, detener, ocultar',            false),
('2.3.1',  'A',  'Operable', 'Convulsiones',           'Tres destellos o por debajo del umbral',      false),
('2.4.1',  'A',  'Operable', 'Navegable',              'Evitar bloques',                              false),
('2.4.2',  'A',  'Operable', 'Navegable',              'Página titulada',                             false),
('2.4.3',  'A',  'Operable', 'Navegable',              'Orden del foco',                              false),
('2.4.4',  'A',  'Operable', 'Navegable',              'Propósito del enlace (en contexto)',          false),
('2.4.5',  'AA', 'Operable', 'Navegable',              'Múltiples vías',                              false),
('2.4.6',  'AA', 'Operable', 'Navegable',              'Encabezados y etiquetas',                     false),
('2.4.7',  'AA', 'Operable', 'Navegable',              'Foco visible',                                false),
('2.5.1',  'A',  'Operable', 'Modalidades de entrada', 'Gestos del puntero',                          true),
('2.5.2',  'A',  'Operable', 'Modalidades de entrada', 'Cancelación del puntero',                     true),
('2.5.3',  'A',  'Operable', 'Modalidades de entrada', 'Etiqueta en el nombre',                       true),
('2.5.4',  'A',  'Operable', 'Modalidades de entrada', 'Actuación por movimiento',                    true),
-- ── Principio 3: Comprensible ─────────────────────────────────────────────────
('3.1.1',  'A',  'Comprensible', 'Legible',                   'Idioma de la página',                                      false),
('3.1.2',  'AA', 'Comprensible', 'Legible',                   'Idioma de las partes',                                     false),
('3.2.1',  'A',  'Comprensible', 'Predecible',                'Con foco',                                                 false),
('3.2.2',  'A',  'Comprensible', 'Predecible',                'Con entrada de datos',                                     false),
('3.2.3',  'AA', 'Comprensible', 'Predecible',                'Navegación coherente',                                     false),
('3.2.4',  'AA', 'Comprensible', 'Predecible',                'Identificación coherente',                                 false),
('3.3.1',  'A',  'Comprensible', 'Entrada de datos asistida', 'Identificación de errores',                                false),
('3.3.2',  'A',  'Comprensible', 'Entrada de datos asistida', 'Etiquetas o instrucciones',                                false),
('3.3.3',  'AA', 'Comprensible', 'Entrada de datos asistida', 'Sugerencia tras error',                                    false),
('3.3.4',  'AA', 'Comprensible', 'Entrada de datos asistida', 'Prevención de errores (legales, financieros, de datos)',   false),
-- ── Principio 4: Robusto ──────────────────────────────────────────────────────
('4.1.1',  'A',  'Robusto', 'Compatible', 'Procesamiento',        false),
('4.1.2',  'A',  'Robusto', 'Compatible', 'Nombre, función, valor', false),
('4.1.3',  'AA', 'Robusto', 'Compatible', 'Mensajes de estado',   true);
