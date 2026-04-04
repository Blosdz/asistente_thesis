alter table "AT".observaciones_tesis
  add column if not exists reunion_id uuid null references "AT".reuniones_asesor(id) on delete set null,
  add column if not exists validation_cita_id uuid null references "AT".validation_cita(id) on delete set null,
  add column if not exists tipo_origen varchar(30) null,
  add column if not exists contenido_html text null,
  add column if not exists contenido_delta jsonb null,
  add column if not exists titulo text null,
  add column if not exists pdf_url text null,
  add column if not exists actualizado_en timestamptz not null default now();

update "AT".observaciones_tesis
set
  tipo_origen = coalesce(tipo_origen, 'manual'),
  contenido_html = coalesce(contenido_html, texto),
  actualizado_en = coalesce(actualizado_en, creado_en, now())
where
  tipo_origen is null
  or contenido_html is null
  or actualizado_en is null;

alter table "AT".observaciones_tesis
  drop constraint if exists observaciones_tesis_tipo_origen_check;

alter table "AT".observaciones_tesis
  add constraint observaciones_tesis_tipo_origen_check
  check (
    tipo_origen is null
    or tipo_origen in ('manual', 'reunion', 'validacion_cita', 'seguimiento', 'correccion')
  );

create index if not exists idx_observaciones_tesis_reunion
  on "AT".observaciones_tesis(reunion_id);

create index if not exists idx_observaciones_tesis_validation_cita
  on "AT".observaciones_tesis(validation_cita_id);

create index if not exists idx_observaciones_tesis_tipo_origen
  on "AT".observaciones_tesis(tipo_origen, creado_en desc);

drop trigger if exists trg_observaciones_tesis_actualizado_en
on "AT".observaciones_tesis;

create trigger trg_observaciones_tesis_actualizado_en
before update on "AT".observaciones_tesis
for each row
execute function "AT".actualizar_fecha_modificacion();

alter table "AT".validation_cita
  add column if not exists validated_by uuid null references "AT".usuarios(id) on delete set null,
  add column if not exists validated_at timestamptz null,
  add column if not exists validation_notes text null,
  add column if not exists rejection_reason text null;

create index if not exists idx_validation_cita_validated_at
  on "AT".validation_cita(validated_at desc);

create index if not exists idx_validation_cita_status_reservation_date
  on "AT".validation_cita(status, reservation_date desc, created_at desc);

create or replace function "AT".crear_observacion_tesis_enriquecida(
  p_tesis_id uuid,
  p_documento_tesis_id uuid default null,
  p_reunion_id uuid default null,
  p_validation_cita_id uuid default null,
  p_titulo text default null,
  p_texto text default null,
  p_contenido_html text default null,
  p_contenido_delta jsonb default null,
  p_tipo_origen varchar default 'manual'
)
returns table(
  ok boolean,
  observacion_id uuid,
  tesis_id uuid,
  reunion_id uuid,
  validation_cita_id uuid,
  mensaje text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_auth_user_id uuid;
  v_usuario_id uuid;
  v_rol varchar;
  v_observacion_id uuid;
  v_asesor_id uuid;
  v_tesis record;
  v_reunion record;
  v_validation record;
  v_texto_final text;
  v_html_final text;
  v_tipo_origen varchar;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  select u.id, u.rol
  into v_usuario_id, v_rol
  from "AT".usuarios u
  where u.auth_usuario_id = v_auth_user_id
  limit 1;

  if v_usuario_id is null then
    raise exception 'Usuario no válido';
  end if;

  if v_rol not in ('asesor', 'admin') then
    raise exception 'No autorizado para registrar observaciones';
  end if;

  v_tipo_origen := coalesce(nullif(trim(p_tipo_origen), ''), 'manual');

  if v_tipo_origen not in ('manual', 'reunion', 'validacion_cita', 'seguimiento', 'correccion') then
    raise exception 'Tipo de origen inválido';
  end if;

  select t.id, t.estudiante_id
  into v_tesis
  from "AT".tesis t
  where t.id = p_tesis_id
    and t.eliminado_en is null;

  if v_tesis.id is null then
    raise exception 'La tesis no existe';
  end if;

  if v_rol = 'asesor' then
    if not exists (
      select 1
      from "AT".relaciones_asesor_estudiante r
      where r.asesor_id = v_usuario_id
        and r.estudiante_id = v_tesis.estudiante_id
        and r.estado = 'activo'
    ) then
      raise exception 'No tienes permiso para registrar observaciones en esta tesis';
    end if;

    v_asesor_id := v_usuario_id;
  else
    v_asesor_id := null;
  end if;

  if p_documento_tesis_id is not null then
    if not exists (
      select 1
      from "AT".documentos_tesis d
      where d.id = p_documento_tesis_id
        and d.tesis_id = p_tesis_id
    ) then
      raise exception 'El documento no pertenece a la tesis';
    end if;
  end if;

  if p_reunion_id is not null then
    select r.id, r.tesis_id, r.asesor_id, r.estudiante_id
    into v_reunion
    from "AT".reuniones_asesor r
    where r.id = p_reunion_id;

    if v_reunion.id is null then
      raise exception 'La reunión no existe';
    end if;

    if v_reunion.tesis_id is distinct from p_tesis_id then
      raise exception 'La reunión no pertenece a la tesis';
    end if;

    if v_rol = 'asesor' and v_reunion.asesor_id <> v_usuario_id then
      raise exception 'No puedes registrar observaciones para una reunión que no te pertenece';
    end if;
  end if;

  if p_validation_cita_id is not null then
    select vc.id, vc.tesis_id, vc.advisor_id, vc.user_id
    into v_validation
    from "AT".validation_cita vc
    where vc.id = p_validation_cita_id;

    if v_validation.id is null then
      raise exception 'La validación de cita no existe';
    end if;

    if v_validation.tesis_id is distinct from p_tesis_id then
      raise exception 'La validación de cita no pertenece a la tesis';
    end if;

    if v_rol = 'asesor' and v_validation.advisor_id <> v_usuario_id then
      raise exception 'No puedes registrar observaciones para una cita que no te pertenece';
    end if;
  end if;

  if v_asesor_id is null then
    v_asesor_id := coalesce(v_reunion.asesor_id, v_validation.advisor_id);
  end if;

  v_texto_final := nullif(trim(coalesce(p_texto, '')), '');
  v_html_final := nullif(trim(coalesce(p_contenido_html, '')), '');

  if v_texto_final is null and v_html_final is null and p_contenido_delta is null then
    raise exception 'Debes enviar contenido para la observación';
  end if;

  insert into "AT".observaciones_tesis (
    tesis_id,
    documento_tesis_id,
    asesor_id,
    reunion_id,
    validation_cita_id,
    texto,
    titulo,
    contenido_html,
    contenido_delta,
    tipo_origen,
    creado_en,
    actualizado_en
  )
  values (
    p_tesis_id,
    p_documento_tesis_id,
    v_asesor_id,
    p_reunion_id,
    p_validation_cita_id,
    coalesce(v_texto_final, v_html_final, ''),
    nullif(trim(coalesce(p_titulo, '')), ''),
    v_html_final,
    p_contenido_delta,
    v_tipo_origen,
    now(),
    now()
  )
  returning id into v_observacion_id;

  return query
  select
    true,
    v_observacion_id,
    p_tesis_id,
    p_reunion_id,
    p_validation_cita_id,
    'Observación registrada correctamente'::text;
end;
$function$;

create or replace function "AT".listar_historial_observaciones_tesis(
  p_tesis_id uuid
)
returns table(
  observacion_id uuid,
  tesis_id uuid,
  documento_tesis_id uuid,
  reunion_id uuid,
  validation_cita_id uuid,
  tipo_origen varchar,
  titulo text,
  texto text,
  contenido_html text,
  contenido_delta jsonb,
  pdf_url text,
  asesor_id uuid,
  asesor_nombre text,
  enlace_reunion text,
  modalidad varchar,
  lugar text,
  inicio_reunion timestamptz,
  fin_reunion timestamptz,
  creado_en timestamptz,
  actualizado_en timestamptz
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_auth_user_id uuid;
  v_usuario_id uuid;
  v_rol varchar;
  v_tesis record;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  select u.id, u.rol
  into v_usuario_id, v_rol
  from "AT".usuarios u
  where u.auth_usuario_id = v_auth_user_id
  limit 1;

  if v_usuario_id is null then
    raise exception 'Usuario no válido';
  end if;

  select t.id, t.estudiante_id
  into v_tesis
  from "AT".tesis t
  where t.id = p_tesis_id
    and t.eliminado_en is null;

  if v_tesis.id is null then
    raise exception 'La tesis no existe';
  end if;

  if v_rol = 'estudiante' and v_tesis.estudiante_id <> v_usuario_id then
    raise exception 'No tienes permiso para ver estas observaciones';
  end if;

  if v_rol = 'asesor' and not exists (
    select 1
    from "AT".relaciones_asesor_estudiante r
    where r.asesor_id = v_usuario_id
      and r.estudiante_id = v_tesis.estudiante_id
      and r.estado = 'activo'
  ) then
    raise exception 'No tienes permiso para ver estas observaciones';
  end if;

  return query
  select
    o.id as observacion_id,
    o.tesis_id,
    o.documento_tesis_id,
    o.reunion_id,
    o.validation_cita_id,
    o.tipo_origen,
    o.titulo,
    o.texto,
    o.contenido_html,
    o.contenido_delta,
    o.pdf_url,
    o.asesor_id,
    coalesce(ppa.nombre_mostrar, ppa_reunion.nombre_mostrar, ppa_validacion.nombre_mostrar, 'Asesor')::text as asesor_nombre,
    coalesce(r.enlace_reunion, vc.enlace_reunion) as enlace_reunion,
    coalesce(r.modalidad, vc.modalidad) as modalidad,
    coalesce(r.lugar, vc.lugar) as lugar,
    coalesce(r.inicio, vc.start_at) as inicio_reunion,
    coalesce(r.fin, vc.end_at) as fin_reunion,
    o.creado_en,
    o.actualizado_en
  from "AT".observaciones_tesis o
  left join "AT".reuniones_asesor r
    on r.id = o.reunion_id
  left join "AT".validation_cita vc
    on vc.id = o.validation_cita_id
  left join "AT".perfil_publico_asesor ppa
    on ppa.asesor_id = o.asesor_id
  left join "AT".perfil_publico_asesor ppa_reunion
    on ppa_reunion.asesor_id = r.asesor_id
  left join "AT".perfil_publico_asesor ppa_validacion
    on ppa_validacion.asesor_id = vc.advisor_id
  where o.tesis_id = p_tesis_id
  order by o.creado_en desc;
end;
$function$;

create or replace function "AT".validar_cita_asesoria_admin(
  p_validation_cita_id uuid,
  p_aprobado boolean,
  p_notas_admin text default null,
  p_enlace_reunion text default null
)
returns table(
  ok boolean,
  validation_cita_id uuid,
  reunion_id uuid,
  status varchar,
  mensaje text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_auth_user_id uuid;
  v_admin_id uuid;
  v_rol varchar;
  v_cita record;
  v_reunion_id uuid;
  v_solapa boolean;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  select u.id, u.rol
  into v_admin_id, v_rol
  from "AT".usuarios u
  where u.auth_usuario_id = v_auth_user_id
  limit 1;

  if v_admin_id is null then
    raise exception 'Usuario no válido';
  end if;

  if v_rol <> 'admin' then
    raise exception 'Solo un admin puede validar citas';
  end if;

  select vc.*
  into v_cita
  from "AT".validation_cita vc
  where vc.id = p_validation_cita_id
  for update;

  if v_cita.id is null then
    raise exception 'La solicitud no existe';
  end if;

  if v_cita.status not in ('pending', 'approved') then
    raise exception 'La solicitud ya fue procesada';
  end if;

  if p_aprobado = false then
    update "AT".validation_cita
    set
      status = 'rejected',
      validated_by = v_admin_id,
      validated_at = now(),
      validation_notes = nullif(trim(coalesce(p_notas_admin, '')), ''),
      rejection_reason = nullif(trim(coalesce(p_notas_admin, '')), ''),
      updated_at = now()
    where id = p_validation_cita_id;

    insert into "AT".notifications (
      user_id,
      title,
      message,
      type,
      status,
      related_id
    )
    values (
      v_cita.user_id,
      'Solicitud rechazada',
      coalesce(
        nullif(trim(coalesce(p_notas_admin, '')), ''),
        'Tu solicitud de cita fue rechazada por administración'
      ),
      'cita_rechazada_admin',
      'unread',
      p_validation_cita_id
    );

    return query
    select
      true,
      p_validation_cita_id,
      null::uuid,
      'rejected'::varchar,
      'Solicitud rechazada por el administrador'::text;

    return;
  end if;

  if v_cita.meeting_id is not null then
    raise exception 'La solicitud ya tiene una reunión asociada';
  end if;

  select exists (
    select 1
    from "AT".reuniones_asesor r
    where r.asesor_id = v_cita.advisor_id
      and r.estado in ('pendiente', 'confirmado')
      and tstzrange(r.inicio, r.fin, '[)') && tstzrange(v_cita.start_at, v_cita.end_at, '[)')
  )
  into v_solapa;

  if v_solapa then
    raise exception 'Ya existe una reunión confirmada o pendiente en ese bloque';
  end if;

  select exists (
    select 1
    from "AT".validation_cita vc
    where vc.id <> v_cita.id
      and vc.advisor_id = v_cita.advisor_id
      and vc.status in ('approved', 'confirmed', 'payment_pending', 'paid')
      and tstzrange(vc.start_at, vc.end_at, '[)') && tstzrange(v_cita.start_at, v_cita.end_at, '[)')
  )
  into v_solapa;

  if v_solapa then
    raise exception 'Existe otra solicitud aprobada para ese mismo bloque';
  end if;

  insert into "AT".reuniones_asesor (
    disponibilidad_id,
    asesor_id,
    estudiante_id,
    tesis_id,
    estado,
    pago_id,
    motivo,
    notas,
    modalidad,
    lugar,
    enlace_reunion,
    inicio,
    fin,
    duracion_minutos,
    costo_reunion,
    moneda,
    creado_en,
    actualizado_en
  )
  values (
    v_cita.disponibilidad_id,
    v_cita.advisor_id,
    v_cita.user_id,
    v_cita.tesis_id,
    'confirmado',
    v_cita.payment_id,
    v_cita.motivo,
    coalesce(
      nullif(trim(coalesce(p_notas_admin, '')), ''),
      v_cita.notas
    ),
    v_cita.modalidad,
    v_cita.lugar,
    coalesce(
      nullif(trim(coalesce(p_enlace_reunion, '')), ''),
      v_cita.enlace_reunion
    ),
    v_cita.start_at,
    v_cita.end_at,
    v_cita.duration_minutes,
    0,
    'PEN',
    now(),
    now()
  )
  returning id into v_reunion_id;

  update "AT".validation_cita
  set
    status = 'confirmed',
    validated_by = v_admin_id,
    validated_at = now(),
    validation_notes = nullif(trim(coalesce(p_notas_admin, '')), ''),
    meeting_id = v_reunion_id,
    enlace_reunion = coalesce(
      nullif(trim(coalesce(p_enlace_reunion, '')), ''),
      enlace_reunion
    ),
    updated_at = now()
  where id = p_validation_cita_id;

  insert into "AT".notifications (
    user_id,
    title,
    message,
    type,
    status,
    related_id
  )
  values
    (
      v_cita.user_id,
      'Cita confirmada',
      'Tu solicitud fue aprobada por administración y la reunión ya fue creada',
      'cita_confirmada_admin',
      'unread',
      v_reunion_id
    ),
    (
      v_cita.advisor_id,
      'Nueva reunión confirmada',
      'Administración confirmó una nueva reunión para tu agenda',
      'cita_confirmada_admin',
      'unread',
      v_reunion_id
    );

  return query
  select
    true,
    p_validation_cita_id,
    v_reunion_id,
    'confirmed'::varchar,
    'Solicitud aprobada y reunión creada correctamente'::text;
end;
$function$;
