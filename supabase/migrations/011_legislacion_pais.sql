-- ============================================================
-- OLAAC — Migración 011: Marco legal de accesibilidad por país
-- Brecha 4: conectar datos de auditorías con obligaciones legales
-- ============================================================

create table legislacion_pais (
  id               uuid primary key default gen_random_uuid(),
  pais             text not null unique,        -- coincide con lighthouse_metrics.pais
  iso_code         char(2) not null unique,     -- código ISO 3166-1 alpha-2
  ley_nombre       text not null,               -- nombre corto de la ley / norma
  ley_descripcion  text not null,               -- resumen en una oración
  url_referencia   text,                        -- enlace oficial
  obliga_sector    text[] not null default '{}', -- ['gobierno', 'privado', 'educacion']
  nivel_sancion    text not null
    check (nivel_sancion in ('alto', 'medio', 'bajo', 'ninguno')),
  ambito           text not null default 'web'
    check (ambito in ('web', 'edificios', 'transporte', 'general')),
  vigente          boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- Datos iniciales — 6 países LATAM con marco legal existente
-- ============================================================
insert into legislacion_pais
  (pais, iso_code, ley_nombre, ley_descripcion, url_referencia, obliga_sector, nivel_sancion, ambito)
values
  (
    'México', 'MX',
    'NMX-I-270-NYCE-2022',
    'Norma Mexicana de Accesibilidad de Sitios Web; obliga a dependencias federales a cumplir WCAG 2.1 AA.',
    'https://www.gob.mx/cms/uploads/attachment/file/782681/NMX-I-270-NYCE-2022.pdf',
    array['gobierno'],
    'medio',
    'web'
  ),
  (
    'Argentina', 'AR',
    'Ley 26653',
    'Ley de Accesibilidad de la Información en las Páginas de Internet: obliga a organismos públicos a cumplir pautas WCAG.',
    'https://servicios.infoleg.gob.ar/infolegInternet/anexos/175000-179999/175694/norma.htm',
    array['gobierno'],
    'medio',
    'web'
  ),
  (
    'Colombia', 'CO',
    'Resolución 1519 de 2020',
    'MinTIC: lineamientos de accesibilidad web WCAG 2.1 AA obligatorios para entidades del Estado colombiano.',
    'https://mintic.gov.co/portal/inicio/Sala-de-prensa/Noticias/121128:Resolucion-1519-del-2020',
    array['gobierno'],
    'alto',
    'web'
  ),
  (
    'Brasil', 'BR',
    'Lei Brasileira de Inclusão (Lei 13.146/2015)',
    'Estatuto da Pessoa com Deficiência: accesibilidad digital obligatoria en sitios del gobierno y empresas con más de 100 empleados.',
    'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm',
    array['gobierno', 'privado'],
    'alto',
    'web'
  ),
  (
    'Chile', 'CL',
    'Ley 20422',
    'Establece normas sobre igualdad de oportunidades e inclusión social; exige accesibilidad en sitios de organismos públicos.',
    'https://www.bcn.cl/leychile/navegar?idNorma=1010903',
    array['gobierno'],
    'medio',
    'web'
  ),
  (
    'Perú', 'PE',
    'Ley 29973',
    'Ley General de la Persona con Discapacidad: obliga al Estado a garantizar accesibilidad en sus plataformas digitales.',
    'https://www.mimp.gob.pe/webs/mimp/sispod/pdf/252.pdf',
    array['gobierno'],
    'bajo',
    'web'
  );

-- ============================================================
-- Función para trigger updated_at
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger legislacion_pais_updated_at
  before update on legislacion_pais
  for each row execute function set_updated_at();

-- ============================================================
-- Índices
-- ============================================================
create index idx_legislacion_pais_pais    on legislacion_pais(pais);
create index idx_legislacion_pais_iso     on legislacion_pais(iso_code);
create index idx_legislacion_pais_vigente on legislacion_pais(vigente) where vigente = true;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table legislacion_pais enable row level security;

-- Lectura pública
create policy "legislacion_select_all"
  on legislacion_pais for select using (true);

-- Escritura solo admin (vía admin_users)
create policy "legislacion_insert_admin"
  on legislacion_pais for insert
  with check (
    exists (select 1 from admin_users where user_id = auth.uid())
  );

create policy "legislacion_update_admin"
  on legislacion_pais for update
  using (
    exists (select 1 from admin_users where user_id = auth.uid())
  );

create policy "legislacion_delete_admin"
  on legislacion_pais for delete
  using (
    exists (select 1 from admin_users where user_id = auth.uid())
  );

-- ============================================================
-- Vista: cobertura legal por país (join con lighthouse_metrics)
-- ============================================================
create view v_cobertura_legal as
select
  lp.pais,
  lp.iso_code,
  lp.ley_nombre,
  lp.nivel_sancion,
  lp.obliga_sector,
  lp.vigente,
  count(lm.alias)                                          as total_sitios_auditados,
  round(avg(lm.accessibility_score), 1)                   as avg_score,
  count(*) filter (where lm.accessibility_score < 50)     as sitios_criticos,
  count(*) filter (where lm.accessibility_score >= 90)    as sitios_excelentes
from legislacion_pais lp
left join lighthouse_metrics lm on lm.pais = lp.pais
group by lp.pais, lp.iso_code, lp.ley_nombre, lp.nivel_sancion, lp.obliga_sector, lp.vigente
order by total_sitios_auditados desc;
