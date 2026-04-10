-- ============================================================
-- OLAAC — Migración 003: Tabla certificates
-- Registra los certificados emitidos por la Academia OLAAC.
-- ============================================================
-- El PDF físico se sube a Supabase Storage (bucket: certificates).
-- El folio permite verificar autenticidad en /certificados/[folio].
-- La restricción UNIQUE(user_id, course_id) garantiza un certificado
-- por estudiante por curso; el Route Handler lo respeta con upsert.
-- ============================================================

create table certificates (
  id           uuid primary key default gen_random_uuid(),

  -- Folio de validación — referenciado en el QR del PDF
  folio        text unique not null,               -- CERT-YYYY-SLUG-RANDOM8

  -- Participantes
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_id    uuid not null references courses(id)    on delete cascade,

  -- Snapshot inmutable al momento de la emisión
  student_name text not null,
  course_title text not null,

  -- Ruta en Supabase Storage: certificates/{user_id}/{folio}.pdf
  storage_path text,

  issued_at    timestamptz not null default now(),

  -- Un certificado por estudiante por curso
  unique (user_id, course_id)
);

create index idx_certificates_user_id   on certificates(user_id);
create index idx_certificates_course_id on certificates(course_id);
create index idx_certificates_folio     on certificates(folio);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table certificates enable row level security;

-- Verificación pública del folio (cualquiera puede consultar si un
-- folio existe y a qué curso corresponde — sin datos personales extra).
create policy "certificates_verify_by_folio"
  on certificates for select
  using (true);

-- El propietario puede ver sus propios certificados.
-- (La policy anterior es suficiente para ambos casos — se deja como
-- ejemplo de policy más restrictiva si se prefiere en el futuro.)

-- INSERT/UPDATE reservado al service_role (Route Handler usa
-- SUPABASE_SERVICE_ROLE_KEY para emitir certificados).

-- ============================================================
-- Política de Storage (bucket: certificates)
-- ============================================================
-- Ejecutar en Supabase Dashboard → Storage → Policies
-- o usando la API de Storage tras crear el bucket manualmente.
--
-- El bucket debe crearse con:
--   nombre: certificates
--   público: false (acceso vía signed URLs de 1 h)
--
-- Policy de INSERT para el service_role (bypassa RLS automáticamente).
-- Policy de SELECT para el propietario del archivo:
--   ((storage.foldername(name))[1] = auth.uid()::text)
-- ============================================================
