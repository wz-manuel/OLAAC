-- ============================================================
-- Migración 009 — Registro de notificaciones
-- Auditoría de todos los emails enviados vía Amazon SES.
-- ============================================================

CREATE TABLE notification_log (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  email      text        NOT NULL,
  type       text        NOT NULL, -- bienvenida, ticket_creado, voluntario_aprobado, etc.
  subject    text        NOT NULL,
  status     text        NOT NULL DEFAULT 'pending' CHECK (status IN ('sent','failed','skipped')),
  error      text,
  metadata   jsonb,
  sent_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notification_log_user_id_idx ON notification_log (user_id);
CREATE INDEX notification_log_type_idx    ON notification_log (type);
CREATE INDEX notification_log_sent_at_idx ON notification_log (sent_at DESC);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer el log
CREATE POLICY "admin_read_notification_log" ON notification_log
  FOR SELECT USING (is_admin());

-- El servidor (service_role / server actions) puede insertar
CREATE POLICY "server_insert_notification_log" ON notification_log
  FOR INSERT WITH CHECK (true);
