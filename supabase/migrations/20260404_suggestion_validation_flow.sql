create table if not exists "AT".tipos_sugerencia_asesor (
  id uuid primary key default gen_random_uuid(),
  codigo varchar(100) not null unique,
  nombre varchar(150) not null,
  descripcion text null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

drop trigger if exists trg_tipos_sugerencia_asesor_actualizado_en
on "AT".tipos_sugerencia_asesor;

create trigger trg_tipos_sugerencia_asesor_actualizado_en
before update on "AT".tipos_sugerencia_asesor
for each row
execute function "AT".actualizar_fecha_modificacion();

insert into "AT".tipos_sugerencia_asesor (codigo, nombre, descripcion)
values
  ('observacion_general', 'Observacion general', 'Comentario general sobre el avance del documento'),
  ('estructura', 'Estructura', 'Sugerencias sobre la estructura del documento'),
  ('metodologia', 'Metodologia', 'Observaciones sobre el enfoque metodologico'),
  ('referencias', 'Referencias', 'Correcciones o mejoras en citas y bibliografia'),
  ('redaccion', 'Redaccion', 'Mejoras de claridad, estilo y coherencia')
on conflict (codigo) do update
set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  activo = true;

alter table "AT".historial_sugerencias_asesor
  add column if not exists tipo_sugerencia_id uuid null,
  add column if not exists detalle text null,
  add column if not exists aplicado_por_estudiante boolean not null default false,
  add column if not exists aplicado_en timestamptz null,
  add column if not exists aplicado_por uuid null;

update "AT".historial_sugerencias_asesor
set detalle = coalesce(detalle, sugerencia)
where detalle is null;

create index if not exists idx_historial_sugerencias_asesor_tipo
  on "AT".historial_sugerencias_asesor (tipo_sugerencia_id);

create table if not exists "AT".validaciones_sugerencia_asesor (
  id uuid primary key default gen_random_uuid(),
  historial_sugerencia_id uuid not null references "AT".historial_sugerencias_asesor(id) on delete cascade,
  tesis_id uuid not null references "AT".tesis(id) on delete cascade,
  documento_tesis_id uuid null references "AT".documentos_tesis(id) on delete set null,
  estudiante_id uuid not null references "AT".usuarios(id) on delete cascade,
  asesor_id uuid not null references "AT".usuarios(id) on delete cascade,
  marcado_aplicado boolean not null default false,
  marcado_en timestamptz null,
  comentario_estudiante text null,
  verificado_por_asesor boolean not null default false,
  verificado_en timestamptz null,
  comentario_asesor text null,
  estado varchar(30) not null default 'pendiente'
    check (estado in ('pendiente', 'marcado_por_estudiante', 'verificado', 'rechazado')),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create unique index if not exists idx_validaciones_sugerencia_historial_unique
  on "AT".validaciones_sugerencia_asesor (historial_sugerencia_id);

create index if not exists idx_validaciones_sugerencia_tesis_estado
  on "AT".validaciones_sugerencia_asesor (tesis_id, estado, actualizado_en desc);

create index if not exists idx_validaciones_sugerencia_asesor_estado
  on "AT".validaciones_sugerencia_asesor (asesor_id, estado, actualizado_en desc);

drop trigger if exists trg_validaciones_sugerencia_asesor_actualizado_en
on "AT".validaciones_sugerencia_asesor;

create trigger trg_validaciones_sugerencia_asesor_actualizado_en
before update on "AT".validaciones_sugerencia_asesor
for each row
execute function "AT".actualizar_fecha_modificacion();

create table if not exists "AT".eventos_validacion_sugerencia (
  id uuid primary key default gen_random_uuid(),
  validacion_sugerencia_id uuid not null references "AT".validaciones_sugerencia_asesor(id) on delete cascade,
  historial_sugerencia_id uuid not null references "AT".historial_sugerencias_asesor(id) on delete cascade,
  tesis_id uuid not null references "AT".tesis(id) on delete cascade,
  documento_tesis_id uuid null references "AT".documentos_tesis(id) on delete set null,
  usuario_id uuid null references "AT".usuarios(id) on delete set null,
  rol_usuario varchar(20) null
    check (rol_usuario in ('estudiante', 'asesor', 'admin', 'sistema')),
  accion varchar(40) not null
    check (accion in (
      'creada',
      'marcada_aplicada',
      'desmarcada',
      'verificada',
      'rechazada'
    )),
  estado_anterior varchar(30) null
    check (estado_anterior in ('pendiente', 'marcado_por_estudiante', 'verificado', 'rechazado')),
  estado_nuevo varchar(30) null
    check (estado_nuevo in ('pendiente', 'marcado_por_estudiante', 'verificado', 'rechazado')),
  comentario text null,
  metadata jsonb null,
  creado_en timestamptz not null default now()
);

create index if not exists idx_eventos_validacion_sugerencia_historial
  on "AT".eventos_validacion_sugerencia (historial_sugerencia_id, creado_en asc);

create index if not exists idx_eventos_validacion_sugerencia_tesis
  on "AT".eventos_validacion_sugerencia (tesis_id, creado_en desc);

insert into "AT".validaciones_sugerencia_asesor (
  historial_sugerencia_id,
  tesis_id,
  documento_tesis_id,
  estudiante_id,
  asesor_id,
  marcado_aplicado,
  marcado_en,
  comentario_estudiante,
  estado,
  creado_en,
  actualizado_en
)
select
  h.id,
  h.tesis_id,
  h.documento_tesis_id,
  t.estudiante_id,
  h.asesor_id,
  coalesce(h.aplicado_por_estudiante, false),
  h.aplicado_en,
  null,
  case
    when coalesce(h.aplicado_por_estudiante, false) then 'marcado_por_estudiante'
    else 'pendiente'
  end,
  h.creado_en,
  h.actualizado_en
from "AT".historial_sugerencias_asesor h
join "AT".tesis t
  on t.id = h.tesis_id
left join "AT".validaciones_sugerencia_asesor v
  on v.historial_sugerencia_id = h.id
where v.id is null;

insert into "AT".eventos_validacion_sugerencia (
  validacion_sugerencia_id,
  historial_sugerencia_id,
  tesis_id,
  documento_tesis_id,
  usuario_id,
  rol_usuario,
  accion,
  estado_anterior,
  estado_nuevo,
  comentario,
  metadata,
  creado_en
)
select
  v.id,
  h.id,
  h.tesis_id,
  h.documento_tesis_id,
  h.asesor_id,
  'asesor',
  'creada',
  null,
  v.estado,
  coalesce(h.detalle, h.sugerencia),
  jsonb_build_object('backfill', true),
  h.creado_en
from "AT".historial_sugerencias_asesor h
join "AT".validaciones_sugerencia_asesor v
  on v.historial_sugerencia_id = h.id
left join "AT".eventos_validacion_sugerencia e
  on e.historial_sugerencia_id = h.id
 and e.accion = 'creada'
where e.id is null;

create or replace function "AT".obtener_usuario_actual_contexto()
returns table (
  usuario_id uuid,
  rol varchar
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_auth_user_id uuid;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  return query
  select u.id, u.rol
  from "AT".usuarios u
  where u.auth_usuario_id = v_auth_user_id
  limit 1;

  if not found then
    raise exception 'Usuario no encontrado';
  end if;
end;
$function$;

create or replace function "AT".usuario_puede_acceder_tesis(
  p_tesis_id uuid,
  p_usuario_id uuid,
  p_rol varchar
)
returns boolean
language sql
security definer
set search_path to 'AT', 'public'
as $function$
  select case
    when p_rol = 'admin' then exists (
      select 1
      from "AT".tesis t
      where t.id = p_tesis_id
    )
    when p_rol = 'estudiante' then exists (
      select 1
      from "AT".tesis t
      where t.id = p_tesis_id
        and t.estudiante_id = p_usuario_id
    )
    when p_rol = 'asesor' then exists (
      select 1
      from "AT".tesis t
      join "AT".relaciones_asesor_estudiante r
        on r.estudiante_id = t.estudiante_id
       and r.asesor_id = p_usuario_id
       and r.estado = 'activo'
      where t.id = p_tesis_id
    )
    else false
  end;
$function$;

create or replace function "AT".registrar_evento_validacion_sugerencia(
  p_validacion_sugerencia_id uuid,
  p_historial_sugerencia_id uuid,
  p_tesis_id uuid,
  p_documento_tesis_id uuid,
  p_usuario_id uuid,
  p_rol_usuario varchar,
  p_accion varchar,
  p_estado_anterior varchar default null,
  p_estado_nuevo varchar default null,
  p_comentario text default null,
  p_metadata jsonb default null
)
returns void
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
begin
  insert into "AT".eventos_validacion_sugerencia (
    validacion_sugerencia_id,
    historial_sugerencia_id,
    tesis_id,
    documento_tesis_id,
    usuario_id,
    rol_usuario,
    accion,
    estado_anterior,
    estado_nuevo,
    comentario,
    metadata
  )
  values (
    p_validacion_sugerencia_id,
    p_historial_sugerencia_id,
    p_tesis_id,
    p_documento_tesis_id,
    p_usuario_id,
    p_rol_usuario,
    p_accion,
    p_estado_anterior,
    p_estado_nuevo,
    p_comentario,
    p_metadata
  );
end;
$function$;

create or replace function "AT".crear_sugerencia_asesor(
  p_tesis_id uuid,
  p_documento_tesis_id uuid default null,
  p_tipo_sugerencia_id uuid default null,
  p_detalle text default null
)
returns table (
  id uuid,
  tesis_id uuid,
  documento_tesis_id uuid,
  asesor_id uuid,
  tipo_sugerencia_id uuid,
  detalle text,
  sugerencia text,
  estado_validacion varchar,
  aplicado boolean,
  creado_en timestamptz
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_usuario_id uuid;
  v_rol varchar;
  v_tesis record;
  v_historial_id uuid;
  v_validacion_id uuid;
  v_detalle text;
begin
  select c.usuario_id, c.rol
  into v_usuario_id, v_rol
  from "AT".obtener_usuario_actual_contexto() c;

  if v_rol <> 'asesor' then
    raise exception 'Solo un asesor puede crear sugerencias';
  end if;

  if p_tesis_id is null then
    raise exception 'La tesis es requerida';
  end if;

  v_detalle := nullif(trim(coalesce(p_detalle, '')), '');

  if v_detalle is null then
    raise exception 'La sugerencia no puede estar vacia';
  end if;

  select t.id, t.estudiante_id
  into v_tesis
  from "AT".tesis t
  where t.id = p_tesis_id;

  if v_tesis.id is null then
    raise exception 'La tesis no existe';
  end if;

  if not "AT".usuario_puede_acceder_tesis(p_tesis_id, v_usuario_id, v_rol) then
    raise exception 'No tienes permisos para sugerir cambios en esta tesis';
  end if;

  insert into "AT".historial_sugerencias_asesor (
    tesis_id,
    asesor_id,
    documento_tesis_id,
    tipo_sugerencia_id,
    detalle,
    sugerencia,
    aplicado,
    aplicado_por_estudiante,
    aplicado_en,
    aplicado_por
  )
  values (
    p_tesis_id,
    v_usuario_id,
    p_documento_tesis_id,
    p_tipo_sugerencia_id,
    v_detalle,
    v_detalle,
    false,
    false,
    null,
    null
  )
  returning id
  into v_historial_id;

  insert into "AT".validaciones_sugerencia_asesor (
    historial_sugerencia_id,
    tesis_id,
    documento_tesis_id,
    estudiante_id,
    asesor_id,
    estado
  )
  values (
    v_historial_id,
    p_tesis_id,
    p_documento_tesis_id,
    v_tesis.estudiante_id,
    v_usuario_id,
    'pendiente'
  )
  returning id
  into v_validacion_id;

  perform "AT".registrar_evento_validacion_sugerencia(
    v_validacion_id,
    v_historial_id,
    p_tesis_id,
    p_documento_tesis_id,
    v_usuario_id,
    v_rol,
    'creada',
    null,
    'pendiente',
    v_detalle,
    jsonb_build_object(
      'tipo_sugerencia_id', p_tipo_sugerencia_id
    )
  );

  return query
  select
    h.id,
    h.tesis_id,
    h.documento_tesis_id,
    h.asesor_id,
    h.tipo_sugerencia_id,
    coalesce(h.detalle, h.sugerencia) as detalle,
    coalesce(h.sugerencia, h.detalle) as sugerencia,
    'pendiente'::varchar as estado_validacion,
    false as aplicado,
    h.creado_en
  from "AT".historial_sugerencias_asesor h
  where h.id = v_historial_id;
end;
$function$;

create or replace function "AT".listar_tipos_sugerencia_asesor()
returns table (
  id uuid,
  codigo varchar,
  nombre varchar,
  descripcion text,
  activo boolean
)
language sql
security definer
set search_path to 'AT', 'public'
as $function$
  select
    t.id,
    t.codigo,
    t.nombre,
    t.descripcion,
    t.activo
  from "AT".tipos_sugerencia_asesor t
  where t.activo = true
  order by t.nombre asc;
$function$;

create or replace function "AT".listar_sugerencias_tesis(
  p_tesis_id uuid
)
returns table (
  id uuid,
  tesis_id uuid,
  documento_tesis_id uuid,
  asesor_id uuid,
  asesor_nombre text,
  nombre_asesor text,
  r_nombre_asesor text,
  estudiante_id uuid,
  estudiante_nombre text,
  tipo_sugerencia_id uuid,
  tipo_codigo varchar,
  tipo_nombre varchar,
  detalle text,
  sugerencia text,
  r_sugerencia text,
  nombre_documento text,
  aplicado boolean,
  aplicado_por_estudiante boolean,
  aplicado_en timestamptz,
  aplicado_por uuid,
  marcado_en timestamptz,
  estado_validacion varchar,
  estado varchar,
  r_estado varchar,
  verificado_por_asesor boolean,
  verificado_en timestamptz,
  comentario_estudiante text,
  comentario_asesor text,
  creado_en timestamptz,
  actualizado_en timestamptz,
  r_creado_en timestamptz,
  r_documento_tesis_id uuid
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_usuario_id uuid;
  v_rol varchar;
begin
  select c.usuario_id, c.rol
  into v_usuario_id, v_rol
  from "AT".obtener_usuario_actual_contexto() c;

  if not "AT".usuario_puede_acceder_tesis(p_tesis_id, v_usuario_id, v_rol) then
    raise exception 'No tienes permisos para ver las sugerencias de esta tesis';
  end if;

  return query
  select
    h.id,
    h.tesis_id,
    h.documento_tesis_id,
    h.asesor_id,
    coalesce(ppa.nombre_mostrar, 'Asesor')::text as asesor_nombre,
    coalesce(ppa.nombre_mostrar, 'Asesor')::text as nombre_asesor,
    coalesce(ppa.nombre_mostrar, 'Asesor')::text as r_nombre_asesor,
    t.estudiante_id,
    nullif(trim(coalesce(pe.nombres, '') || ' ' || coalesce(pe.apellidos, '')), '')::text as estudiante_nombre,
    h.tipo_sugerencia_id,
    tsa.codigo,
    tsa.nombre,
    coalesce(h.detalle, h.sugerencia) as detalle,
    coalesce(h.sugerencia, h.detalle) as sugerencia,
    coalesce(h.detalle, h.sugerencia) as r_sugerencia,
    d.nombre_archivo::text as nombre_documento,
    coalesce(h.aplicado, false) as aplicado,
    coalesce(h.aplicado_por_estudiante, false) as aplicado_por_estudiante,
    h.aplicado_en,
    h.aplicado_por,
    v.marcado_en,
    coalesce(v.estado, 'pendiente') as estado_validacion,
    coalesce(v.estado, 'pendiente') as estado,
    coalesce(v.estado, 'pendiente') as r_estado,
    coalesce(v.verificado_por_asesor, false) as verificado_por_asesor,
    v.verificado_en,
    v.comentario_estudiante,
    v.comentario_asesor,
    h.creado_en,
    greatest(
      h.actualizado_en,
      coalesce(v.actualizado_en, h.actualizado_en)
    ) as actualizado_en,
    h.creado_en as r_creado_en,
    h.documento_tesis_id as r_documento_tesis_id
  from "AT".historial_sugerencias_asesor h
  join "AT".tesis t
    on t.id = h.tesis_id
  left join "AT".validaciones_sugerencia_asesor v
    on v.historial_sugerencia_id = h.id
  left join "AT".tipos_sugerencia_asesor tsa
    on tsa.id = h.tipo_sugerencia_id
  left join "AT".perfil_publico_asesor ppa
    on ppa.asesor_id = h.asesor_id
  left join "AT".perfil_estudiante pe
    on pe.estudiante_id = t.estudiante_id
  left join "AT".documentos_tesis d
    on d.id = h.documento_tesis_id
  where h.tesis_id = p_tesis_id
  order by h.creado_en desc;
end;
$function$;

create or replace function "AT".marcar_sugerencia_aplicada(
  p_historial_sugerencia_id uuid,
  p_comentario_estudiante text default null
)
returns table (
  ok boolean,
  historial_sugerencia_id uuid,
  estado varchar,
  mensaje text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_usuario_id uuid;
  v_rol varchar;
  v_sugerencia record;
  v_validacion record;
begin
  select c.usuario_id, c.rol
  into v_usuario_id, v_rol
  from "AT".obtener_usuario_actual_contexto() c;

  if v_rol <> 'estudiante' then
    raise exception 'Solo un estudiante puede marcar la sugerencia como aplicada';
  end if;

  select
    h.id,
    h.tesis_id,
    h.documento_tesis_id,
    h.asesor_id,
    t.estudiante_id
  into v_sugerencia
  from "AT".historial_sugerencias_asesor h
  join "AT".tesis t
    on t.id = h.tesis_id
  where h.id = p_historial_sugerencia_id
    and t.estudiante_id = v_usuario_id
  for update;

  if v_sugerencia.id is null then
    raise exception 'La sugerencia no existe o no pertenece al estudiante';
  end if;

  select *
  into v_validacion
  from "AT".validaciones_sugerencia_asesor
  where historial_sugerencia_id = p_historial_sugerencia_id
  for update;

  if v_validacion.id is null then
    insert into "AT".validaciones_sugerencia_asesor (
      historial_sugerencia_id,
      tesis_id,
      documento_tesis_id,
      estudiante_id,
      asesor_id,
      estado
    )
    values (
      v_sugerencia.id,
      v_sugerencia.tesis_id,
      v_sugerencia.documento_tesis_id,
      v_usuario_id,
      v_sugerencia.asesor_id,
      'pendiente'
    )
    returning *
    into v_validacion;
  end if;

  update "AT".validaciones_sugerencia_asesor
  set
    marcado_aplicado = true,
    marcado_en = now(),
    comentario_estudiante = nullif(trim(coalesce(p_comentario_estudiante, '')), ''),
    verificado_por_asesor = false,
    verificado_en = null,
    comentario_asesor = null,
    estado = 'marcado_por_estudiante'
  where id = v_validacion.id;

  update "AT".historial_sugerencias_asesor
  set
    aplicado = true,
    aplicado_por_estudiante = true,
    aplicado_en = now(),
    aplicado_por = v_usuario_id
  where id = p_historial_sugerencia_id;

  perform "AT".registrar_evento_validacion_sugerencia(
    v_validacion.id,
    v_sugerencia.id,
    v_sugerencia.tesis_id,
    v_sugerencia.documento_tesis_id,
    v_usuario_id,
    v_rol,
    'marcada_aplicada',
    v_validacion.estado,
    'marcado_por_estudiante',
    nullif(trim(coalesce(p_comentario_estudiante, '')), ''),
    null
  );

  return query
  select
    true,
    p_historial_sugerencia_id,
    'marcado_por_estudiante'::varchar,
    'Sugerencia enviada para validacion del asesor'::text;
end;
$function$;

create or replace function "AT".validar_aplicacion_sugerencia(
  p_historial_sugerencia_id uuid,
  p_aprobado boolean,
  p_comentario_asesor text default null
)
returns table (
  ok boolean,
  historial_sugerencia_id uuid,
  estado varchar,
  mensaje text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_usuario_id uuid;
  v_rol varchar;
  v_sugerencia record;
  v_validacion record;
  v_estado_nuevo varchar;
begin
  select c.usuario_id, c.rol
  into v_usuario_id, v_rol
  from "AT".obtener_usuario_actual_contexto() c;

  if v_rol <> 'asesor' then
    raise exception 'Solo un asesor puede validar la aplicacion';
  end if;

  select
    h.id,
    h.tesis_id,
    h.documento_tesis_id,
    h.asesor_id
  into v_sugerencia
  from "AT".historial_sugerencias_asesor h
  where h.id = p_historial_sugerencia_id
    and h.asesor_id = v_usuario_id
  for update;

  if v_sugerencia.id is null then
    raise exception 'La sugerencia no existe o no pertenece al asesor';
  end if;

  select *
  into v_validacion
  from "AT".validaciones_sugerencia_asesor
  where historial_sugerencia_id = p_historial_sugerencia_id
  for update;

  if v_validacion.id is null then
    raise exception 'No existe una validacion asociada a la sugerencia';
  end if;

  if v_validacion.estado <> 'marcado_por_estudiante' then
    raise exception 'Primero el estudiante debe marcar la sugerencia como aplicada';
  end if;

  v_estado_nuevo := case
    when p_aprobado then 'verificado'
    else 'rechazado'
  end;

  update "AT".validaciones_sugerencia_asesor
  set
    verificado_por_asesor = p_aprobado,
    verificado_en = now(),
    comentario_asesor = nullif(trim(coalesce(p_comentario_asesor, '')), ''),
    estado = v_estado_nuevo
  where id = v_validacion.id;

  perform "AT".registrar_evento_validacion_sugerencia(
    v_validacion.id,
    v_sugerencia.id,
    v_sugerencia.tesis_id,
    v_sugerencia.documento_tesis_id,
    v_usuario_id,
    v_rol,
    case
      when p_aprobado then 'verificada'
      else 'rechazada'
    end,
    v_validacion.estado,
    v_estado_nuevo,
    nullif(trim(coalesce(p_comentario_asesor, '')), ''),
    null
  );

  return query
  select
    true,
    p_historial_sugerencia_id,
    v_estado_nuevo,
    case
      when p_aprobado then 'Aplicacion verificada por el asesor'
      else 'Aplicacion rechazada por el asesor'
    end::text;
end;
$function$;

create or replace function "AT".marcar_sugerencia_aplicada_estudiante(
  p_sugerencia_id uuid,
  p_aplicado boolean default true
)
returns table (
  ok boolean,
  historial_sugerencia_id uuid,
  estado varchar,
  mensaje text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_usuario_id uuid;
  v_rol varchar;
  v_sugerencia record;
  v_validacion record;
begin
  if p_aplicado then
    return query
    select *
    from "AT".marcar_sugerencia_aplicada(p_sugerencia_id, null);
    return;
  end if;

  select c.usuario_id, c.rol
  into v_usuario_id, v_rol
  from "AT".obtener_usuario_actual_contexto() c;

  if v_rol <> 'estudiante' then
    raise exception 'Solo un estudiante puede modificar este estado';
  end if;

  select
    h.id,
    h.tesis_id,
    h.documento_tesis_id
  into v_sugerencia
  from "AT".historial_sugerencias_asesor h
  join "AT".tesis t
    on t.id = h.tesis_id
  where h.id = p_sugerencia_id
    and t.estudiante_id = v_usuario_id
  for update;

  if v_sugerencia.id is null then
    raise exception 'La sugerencia no existe o no pertenece al estudiante';
  end if;

  select *
  into v_validacion
  from "AT".validaciones_sugerencia_asesor
  where historial_sugerencia_id = p_sugerencia_id
  for update;

  if v_validacion.id is null then
    raise exception 'No existe una validacion asociada a la sugerencia';
  end if;

  update "AT".validaciones_sugerencia_asesor
  set
    marcado_aplicado = false,
    marcado_en = null,
    comentario_estudiante = null,
    verificado_por_asesor = false,
    verificado_en = null,
    comentario_asesor = null,
    estado = 'pendiente'
  where id = v_validacion.id;

  update "AT".historial_sugerencias_asesor
  set
    aplicado = false,
    aplicado_por_estudiante = false,
    aplicado_en = null,
    aplicado_por = null
  where id = p_sugerencia_id;

  perform "AT".registrar_evento_validacion_sugerencia(
    v_validacion.id,
    v_sugerencia.id,
    v_sugerencia.tesis_id,
    v_sugerencia.documento_tesis_id,
    v_usuario_id,
    v_rol,
    'desmarcada',
    v_validacion.estado,
    'pendiente',
    null,
    jsonb_build_object('compatibilidad', true)
  );

  return query
  select
    true,
    p_sugerencia_id,
    'pendiente'::varchar,
    'Sugerencia marcada nuevamente como pendiente'::text;
end;
$function$;

create or replace function "AT".actualizar_estado_sugerencia_asesor(
  p_sugerencia_id uuid,
  p_aplicado boolean
)
returns table (
  ok boolean,
  historial_sugerencia_id uuid,
  estado varchar,
  mensaje text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
begin
  return query
  select *
  from "AT".validar_aplicacion_sugerencia(
    p_sugerencia_id,
    p_aplicado,
    null
  );
end;
$function$;

create or replace view "AT".vw_log_validacion_sugerencia as
select
  e.id,
  e.validacion_sugerencia_id,
  e.historial_sugerencia_id,
  e.tesis_id,
  e.documento_tesis_id,
  e.usuario_id,
  e.rol_usuario,
  e.accion,
  e.estado_anterior,
  e.estado_nuevo,
  e.comentario,
  e.metadata,
  e.creado_en,
  coalesce(h.detalle, h.sugerencia) as sugerencia_detalle,
  coalesce(ppa.nombre_mostrar, 'Asesor')::text as asesor_nombre,
  case
    when e.rol_usuario = 'estudiante' then
      nullif(trim(coalesce(pe.nombres, '') || ' ' || coalesce(pe.apellidos, '')), '')::text
    when e.rol_usuario = 'asesor' then
      coalesce(ppa_actor.nombre_mostrar, 'Asesor')::text
    when e.rol_usuario = 'admin' then
      'Administrador'::text
    else 'Sistema'::text
  end as usuario_nombre
from "AT".eventos_validacion_sugerencia e
left join "AT".historial_sugerencias_asesor h
  on h.id = e.historial_sugerencia_id
left join "AT".perfil_publico_asesor ppa
  on ppa.asesor_id = h.asesor_id
left join "AT".perfil_estudiante pe
  on pe.estudiante_id = e.usuario_id
left join "AT".perfil_publico_asesor ppa_actor
  on ppa_actor.asesor_id = e.usuario_id;

create or replace function "AT".listar_log_validacion_sugerencia(
  p_historial_sugerencia_id uuid
)
returns table (
  id uuid,
  validacion_sugerencia_id uuid,
  historial_sugerencia_id uuid,
  tesis_id uuid,
  documento_tesis_id uuid,
  usuario_id uuid,
  usuario_nombre text,
  rol_usuario varchar,
  accion varchar,
  estado_anterior varchar,
  estado_nuevo varchar,
  comentario text,
  metadata jsonb,
  creado_en timestamptz,
  sugerencia_detalle text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_usuario_id uuid;
  v_rol varchar;
  v_tesis_id uuid;
begin
  select c.usuario_id, c.rol
  into v_usuario_id, v_rol
  from "AT".obtener_usuario_actual_contexto() c;

  select h.tesis_id
  into v_tesis_id
  from "AT".historial_sugerencias_asesor h
  where h.id = p_historial_sugerencia_id;

  if v_tesis_id is null then
    raise exception 'La sugerencia no existe';
  end if;

  if not "AT".usuario_puede_acceder_tesis(v_tesis_id, v_usuario_id, v_rol) then
    raise exception 'No tienes permisos para ver el historial de esta sugerencia';
  end if;

  return query
  select
    v.id,
    v.validacion_sugerencia_id,
    v.historial_sugerencia_id,
    v.tesis_id,
    v.documento_tesis_id,
    v.usuario_id,
    v.usuario_nombre,
    v.rol_usuario,
    v.accion,
    v.estado_anterior,
    v.estado_nuevo,
    v.comentario,
    v.metadata,
    v.creado_en,
    v.sugerencia_detalle
  from "AT".vw_log_validacion_sugerencia v
  where v.historial_sugerencia_id = p_historial_sugerencia_id
  order by v.creado_en asc;
end;
$function$;

create or replace function "AT".listar_log_validacion_tesis(
  p_tesis_id uuid
)
returns table (
  id uuid,
  validacion_sugerencia_id uuid,
  historial_sugerencia_id uuid,
  tesis_id uuid,
  documento_tesis_id uuid,
  usuario_id uuid,
  usuario_nombre text,
  rol_usuario varchar,
  accion varchar,
  estado_anterior varchar,
  estado_nuevo varchar,
  comentario text,
  metadata jsonb,
  creado_en timestamptz,
  sugerencia_detalle text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_usuario_id uuid;
  v_rol varchar;
begin
  select c.usuario_id, c.rol
  into v_usuario_id, v_rol
  from "AT".obtener_usuario_actual_contexto() c;

  if not "AT".usuario_puede_acceder_tesis(p_tesis_id, v_usuario_id, v_rol) then
    raise exception 'No tienes permisos para ver el historial de esta tesis';
  end if;

  return query
  select
    v.id,
    v.validacion_sugerencia_id,
    v.historial_sugerencia_id,
    v.tesis_id,
    v.documento_tesis_id,
    v.usuario_id,
    v.usuario_nombre,
    v.rol_usuario,
    v.accion,
    v.estado_anterior,
    v.estado_nuevo,
    v.comentario,
    v.metadata,
    v.creado_en,
    v.sugerencia_detalle
  from "AT".vw_log_validacion_sugerencia v
  where v.tesis_id = p_tesis_id
  order by v.creado_en desc;
end;
$function$;
