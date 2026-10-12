-- ============================================================
-- Migración 024 — Preguntas de control por lección (academia)
-- ============================================================
-- Una lección con preguntas en quiz_questions solo se completa al
-- aprobar su cuestionario. Las respuestas correctas no pueden vivir en
-- lessons.contenido (legible por anónimos vía "lessons_public_read"),
-- así que van en una tabla sin lectura para estudiantes y la
-- calificación ocurre dentro de la base:
--
--   get_lesson_quiz(lesson)            → preguntas y opciones, sin la clave
--   submit_lesson_quiz(lesson, resp.)  → califica, registra el intento y,
--                                        si aprueba, completa la lección
--
-- Un disparador en lesson_progress impide marcar como completada una
-- lección con cuestionario sin un intento aprobado: la política
-- "lesson_progress_own" permite escribir esa tabla desde el cliente.

-- ─── 1. Umbral de aprobación por lección ─────────────────────────────────────

ALTER TABLE public.lessons
  ADD COLUMN quiz_min_pct smallint NOT NULL DEFAULT 80
  CHECK (quiz_min_pct BETWEEN 1 AND 100);

-- ─── 2. quiz_questions ───────────────────────────────────────────────────────

CREATE TABLE public.quiz_questions (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  orden       int  not null,
  enunciado   text not null,
  opciones    jsonb not null
              check (jsonb_typeof(opciones) = 'array' and jsonb_array_length(opciones) >= 2),
  correcta    smallint not null check (correcta >= 0), -- índice (base 0) dentro de opciones
  explicacion text not null,
  created_at  timestamptz not null default now(),
  unique (lesson_id, orden)
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Sin política de lectura para estudiantes: solo admins (o service_role con bypass)
CREATE POLICY "quiz_questions_admin_all"
  ON public.quiz_questions FOR ALL
  TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── 3. quiz_attempts ────────────────────────────────────────────────────────

CREATE TABLE public.quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  respuestas jsonb not null,
  aciertos   int not null,
  total      int not null,
  aprobado   boolean not null,
  created_at timestamptz not null default now()
);

CREATE INDEX idx_quiz_attempts_user_lesson ON public.quiz_attempts(user_id, lesson_id);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Solo lectura del propio historial; los intentos se insertan desde submit_lesson_quiz
CREATE POLICY "quiz_attempts_owner_select"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ─── 4. get_lesson_quiz ──────────────────────────────────────────────────────
-- SECURITY DEFINER: bypasea la RLS de quiz_questions, pero solo entrega las
-- preguntas a quien está inscrito en el curso y nunca la columna `correcta`.

CREATE OR REPLACE FUNCTION public.get_lesson_quiz(p_lesson_id uuid)
RETURNS TABLE (
  id        uuid,
  orden     int,
  enunciado text,
  opciones  jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT q.id, q.orden, q.enunciado, q.opciones
  FROM quiz_questions q
  JOIN lessons l ON l.id = q.lesson_id
  WHERE q.lesson_id = p_lesson_id
    AND l.published
    AND EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = l.course_id AND e.user_id = auth.uid()
    )
  ORDER BY q.orden;
$$;

REVOKE EXECUTE ON FUNCTION public.get_lesson_quiz(uuid) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_lesson_quiz(uuid) TO authenticated;

-- ─── 5. submit_lesson_quiz ───────────────────────────────────────────────────
-- p_respuestas: objeto { "<id de pregunta>": <índice elegido> }.
-- Devuelve { aprobado, aciertos, total, min_pct, detalle: [{ id, acierto,
-- explicacion, correcta }] }; `correcta` solo se revela al aprobar.

CREATE OR REPLACE FUNCTION public.submit_lesson_quiz(p_lesson_id uuid, p_respuestas jsonb)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user      uuid := auth.uid();
  v_course    uuid;
  v_min_pct   int;
  v_total     int;
  v_aciertos  int;
  v_aprobado  boolean;
  v_lecciones int;
  v_hechas    int;
  v_progress  numeric;
  v_detalle   jsonb;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'No autenticado' USING ERRCODE = '28000';
  END IF;

  IF p_respuestas IS NULL OR jsonb_typeof(p_respuestas) <> 'object' THEN
    RAISE EXCEPTION 'Formato de respuestas no válido' USING ERRCODE = '22023';
  END IF;

  SELECT l.course_id, l.quiz_min_pct INTO v_course, v_min_pct
  FROM lessons l
  JOIN courses c ON c.id = l.course_id
  WHERE l.id = p_lesson_id AND l.published AND c.published;

  IF v_course IS NULL THEN
    RAISE EXCEPTION 'Lección no encontrada' USING ERRCODE = 'P0002';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM enrollments e WHERE e.course_id = v_course AND e.user_id = v_user
  ) THEN
    RAISE EXCEPTION 'No estás inscrito en este curso' USING ERRCODE = '42501';
  END IF;

  SELECT count(*),
         count(*) FILTER (WHERE p_respuestas ->> q.id::text = q.correcta::text)
  INTO v_total, v_aciertos
  FROM quiz_questions q
  WHERE q.lesson_id = p_lesson_id;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'La lección no tiene cuestionario' USING ERRCODE = 'P0002';
  END IF;

  v_aprobado := v_aciertos * 100 >= v_total * v_min_pct;

  INSERT INTO quiz_attempts (user_id, lesson_id, respuestas, aciertos, total, aprobado)
  VALUES (v_user, p_lesson_id, p_respuestas, v_aciertos, v_total, v_aprobado);

  IF v_aprobado THEN
    INSERT INTO lesson_progress (lesson_id, user_id, completed, completed_at)
    VALUES (p_lesson_id, v_user, true, now())
    ON CONFLICT (user_id, lesson_id)
    DO UPDATE SET completed = true,
                  completed_at = coalesce(lesson_progress.completed_at, now());

    SELECT count(*) INTO v_lecciones
    FROM lessons l WHERE l.course_id = v_course AND l.published;

    SELECT count(*) INTO v_hechas
    FROM lesson_progress lp
    JOIN lessons l ON l.id = lp.lesson_id
    WHERE lp.user_id = v_user AND lp.completed
      AND l.course_id = v_course AND l.published;

    v_progress := round(v_hechas * 100.0 / v_lecciones);

    UPDATE enrollments e
    SET progress     = v_progress,
        estado       = CASE WHEN v_progress >= 100 THEN 'completado' ELSE 'en_curso' END::enrollment_status,
        completed_at = CASE WHEN v_progress >= 100 THEN coalesce(e.completed_at, now()) ELSE e.completed_at END
    WHERE e.course_id = v_course AND e.user_id = v_user;
  END IF;

  SELECT jsonb_agg(
           jsonb_build_object(
             'id',          q.id,
             'acierto',     coalesce(p_respuestas ->> q.id::text = q.correcta::text, false),
             'explicacion', q.explicacion,
             'correcta',    CASE WHEN v_aprobado THEN q.correcta END
           ) ORDER BY q.orden
         )
  INTO v_detalle
  FROM quiz_questions q
  WHERE q.lesson_id = p_lesson_id;

  RETURN jsonb_build_object(
    'aprobado', v_aprobado,
    'aciertos', v_aciertos,
    'total',    v_total,
    'min_pct',  v_min_pct,
    'detalle',  v_detalle
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_lesson_quiz(uuid, jsonb) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.submit_lesson_quiz(uuid, jsonb) TO authenticated;

-- ─── 6. lesson_progress — exigir cuestionario aprobado ───────────────────────
-- SECURITY DEFINER porque quien escribe lesson_progress no puede leer
-- quiz_questions. submit_lesson_quiz inserta el intento antes de completar.

CREATE OR REPLACE FUNCTION public.enforce_lesson_quiz_passed()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.completed
     AND EXISTS (SELECT 1 FROM quiz_questions q WHERE q.lesson_id = NEW.lesson_id)
     AND NOT EXISTS (
       SELECT 1 FROM quiz_attempts a
       WHERE a.lesson_id = NEW.lesson_id AND a.user_id = NEW.user_id AND a.aprobado
     )
  THEN
    RAISE EXCEPTION 'Esta lección se completa aprobando su cuestionario'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_lesson_quiz_passed() FROM PUBLIC;

CREATE TRIGGER lesson_progress_require_quiz
  BEFORE INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.enforce_lesson_quiz_passed();
