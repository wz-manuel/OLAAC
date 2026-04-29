-- Soporte para tickets enviados desde el formulario de contacto público
-- (visitantes sin cuenta). Los campos reporter_* almacenan los datos del
-- remitente cuando created_by es NULL.

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS reporter_email  text,
  ADD COLUMN IF NOT EXISTS reporter_nombre text;

-- Política de inserción para el formulario de contacto público.
-- El servidor usa service_role (bypass RLS), pero se documenta el intento
-- como política explícita para visibilidad.
-- (No se necesita una nueva policy: service_role siempre bypasea RLS.)
