-- ============================================================
-- OLAAC — Esquema inicial de base de datos (Supabase/PostgreSQL)
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- Búsqueda de texto completo

-- ============================================================
-- MÓDULO: Tickets de Accesibilidad
-- ============================================================

create type ticket_status as enum ('abierto', 'en_revision', 'en_progreso', 'resuelto', 'cerrado');
create type ticket_priority as enum ('baja', 'media', 'alta', 'critica');
create type ticket_category as enum ('digital', 'fisico', 'comunicacion', 'servicio');

create table tickets (
  id          uuid primary key default uuid_generate_v4(),
  folio       text unique not null, -- OLAAC-2024-XXXX
  titulo      text not null,
  descripcion text not null,
  categoria   ticket_category not null default 'digital',
  prioridad   ticket_priority not null default 'media',
  estado      ticket_status not null default 'abierto',
  url_afectada text,
  created_by  uuid references auth.users(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  resolved_at timestamptz
);

-- Historial de cambios de estado
create table ticket_events (
  id          uuid primary key default uuid_generate_v4(),
  ticket_id   uuid not null references tickets(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  evento      text not null, -- e.g. 'estado_cambiado', 'comentario_agregado'
  payload     jsonb,
  created_at  timestamptz not null default now()
);

-- Función para generar folio automático
create or replace function generate_ticket_folio()
returns trigger as $$
declare
  year text := to_char(now(), 'YYYY');
  seq  int;
begin
  select count(*) + 1 into seq
  from tickets
  where to_char(created_at, 'YYYY') = year;
  new.folio := 'OLAAC-' || year || '-' || lpad(seq::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger set_ticket_folio
  before insert on tickets
  for each row execute procedure generate_ticket_folio();

-- ============================================================
-- MÓDULO: Scores de Accesibilidad (Lighthouse / Auditorías)
-- ============================================================

create table accessibility_scores (
  id              uuid primary key default uuid_generate_v4(),
  url             text not null,
  score_total     numeric(5,2) check (score_total between 0 and 100),
  score_a11y      numeric(5,2) check (score_a11y between 0 and 100),
  score_perf      numeric(5,2) check (score_perf between 0 and 100),
  score_seo       numeric(5,2) check (score_seo between 0 and 100),
  score_bp        numeric(5,2) check (score_bp between 0 and 100),
  violations      jsonb,   -- Detalle de violaciones axe-core
  lhci_report_url text,
  measured_at     timestamptz not null default now(),
  measured_by     uuid references auth.users(id) on delete set null
);

create index idx_scores_url on accessibility_scores(url);
create index idx_scores_measured_at on accessibility_scores(measured_at desc);

-- ============================================================
-- MÓDULO: Academia LMS
-- ============================================================

create type lesson_type as enum ('video', 'lectura', 'ejercicio', 'evaluacion');
create type enrollment_status as enum ('inscrito', 'en_curso', 'completado', 'abandonado');

create table courses (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  titulo      text not null,
  descripcion text,
  thumbnail   text,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table lessons (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references courses(id) on delete cascade,
  titulo      text not null,
  tipo        lesson_type not null default 'lectura',
  contenido   text, -- MDX o URL de video
  orden       int not null default 0,
  duracion_min int, -- duración estimada en minutos
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);

create table enrollments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_id   uuid not null references courses(id) on delete cascade,
  estado      enrollment_status not null default 'inscrito',
  progress    numeric(5,2) not null default 0 check (progress between 0 and 100),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

create table lesson_progress (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lesson_id   uuid not null references lessons(id) on delete cascade,
  completed   boolean not null default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Tickets: cualquier usuario autenticado puede crear; solo asignado/admin puede actualizar
alter table tickets enable row level security;
create policy "tickets_select" on tickets for select using (auth.uid() is not null);
create policy "tickets_insert" on tickets for insert with check (auth.uid() is not null);
create policy "tickets_update" on tickets for update
  using (auth.uid() = created_by or auth.uid() = assigned_to);

-- Scores: solo lectura pública, escritura autenticada
alter table accessibility_scores enable row level security;
create policy "scores_select_all" on accessibility_scores for select using (true);
create policy "scores_insert_auth" on accessibility_scores for insert with check (auth.uid() is not null);

-- Academia: progreso propio
alter table enrollments enable row level security;
create policy "enrollments_own" on enrollments
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table lesson_progress enable row level security;
create policy "lesson_progress_own" on lesson_progress
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
