-- ============================================================
-- OLAAC — Migración 004: Storage bucket 'certificates'
-- ============================================================
-- Crea el bucket privado y configura las políticas RLS de Storage.
--
-- Aplicar con:
--   supabase db push                    (Supabase CLI)
--   Dashboard → SQL Editor → Ejecutar   (alternativa sin CLI)
--
-- Arquitectura de acceso:
--   ┌──────────────────────────────────────────────────────┐
--   │  Escritura → service_role (bypassa RLS — no policy)  │
--   │  Lectura   → propietario autenticado (policy abajo)  │
--   │  URLs temp → signed URL vía admin client (60 min)    │
--   │  Verificación pública → tabla certificates (HTML)    │
--   └──────────────────────────────────────────────────────┘
-- ============================================================

-- ── 1. Bucket privado ────────────────────────────────────────────────────────
-- file_size_limit: 5 MB — más que suficiente para un PDF de certificado
-- allowed_mime_types: solo PDF — rechaza cualquier otro tipo de archivo

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  false,                    -- privado: URLs directas no funcionan sin policy/signed URL
  5242880,                  -- 5 MB
  array['application/pdf']  -- whitelist estricta de tipos MIME
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ── 2. RLS sobre storage.objects ─────────────────────────────────────────────
-- El service_role bypassa RLS automáticamente en Supabase.
-- No se crea policy de INSERT para authenticated — solo el servidor puede subir.

-- Policy de SELECT: cada usuario lee únicamente su propia carpeta
-- Estructura del path: {user_id}/{folio}.pdf
-- (storage.foldername(name))[1] devuelve el primer segmento del path

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'certificates_owner_select'
  ) then
    execute $policy$
      create policy "certificates_owner_select"
        on storage.objects
        for select
        to authenticated
        using (
          bucket_id = 'certificates'
          and (storage.foldername(name))[1] = auth.uid()::text
        )
    $policy$;
  end if;
end;
$$;

-- ── 3. Verificación del bucket ───────────────────────────────────────────────
-- Esta consulta valida que el bucket quedó creado correctamente.
-- Su resultado se puede ver en el output de la migración.

do $$
declare
  bucket_public boolean;
  bucket_limit  bigint;
begin
  select public, file_size_limit
  into   bucket_public, bucket_limit
  from   storage.buckets
  where  id = 'certificates';

  if not found then
    raise exception 'ERROR: bucket certificates no fue creado';
  end if;

  if bucket_public then
    raise exception 'ERROR: el bucket certificates no debe ser público';
  end if;

  raise notice '✓ Bucket certificates creado — privado, límite: % bytes', bucket_limit;
end;
$$;
