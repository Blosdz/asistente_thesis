create table if not exists "AT".notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "AT".usuarios(id) on delete cascade,
  title varchar(150) not null,
  message text not null,
  type varchar(50) not null,
  status varchar(20) not null default 'unread',
  related_id uuid null,
  created_at timestamptz not null default now(),
  read_at timestamptz null
);

create table if not exists "AT".validation_cita (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "AT".usuarios(id) on delete cascade,
  advisor_id uuid not null references "AT".usuarios(id) on delete cascade,
  tesis_id uuid null references "AT".tesis(id) on delete set null,
  disponibilidad_id uuid not null references "AT".disponibilidad_asesor(id) on delete restrict,
  status varchar(30) not null default 'pending',
  reservation_date date not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0),
  motivo text null,
  modalidad varchar(50) null,
  lugar text null,
  enlace_reunion text null,
  notas text null,
  payment_id uuid null references "AT".pagos(id) on delete set null,
  meeting_id uuid null references "AT".reuniones_asesor(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_validation_cita_advisor_status
  on "AT".validation_cita (advisor_id, status, created_at desc);

create index if not exists idx_validation_cita_user_status
  on "AT".validation_cita (user_id, status, created_at desc);

create or replace function "AT".set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_validation_cita_updated_at on "AT".validation_cita;

create trigger trg_validation_cita_updated_at
before update on "AT".validation_cita
for each row
execute function "AT".set_updated_at();

create or replace function "AT".crear_cita_asesoria(
  p_asesor_id uuid,
  p_disponibilidad_id uuid,
  p_inicio timestamptz,
  p_fin timestamptz,
  p_tesis_id uuid default null,
  p_motivo text default null,
  p_modalidad varchar default null,
  p_lugar text default null,
  p_enlace_reunion text default null,
  p_notas text default null
)
returns table(
  ok boolean,
  validation_cita_id uuid,
  estado varchar,
  mensaje text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_auth_user_id uuid;
  v_estudiante_id uuid;
  v_relacion_id uuid;
  v_disp record;
  v_validation_id uuid;
  v_duracion_minutos integer;
  v_solapa boolean;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  select u.id
  into v_estudiante_id
  from "AT".usuarios u
  where u.auth_usuario_id = v_auth_user_id
    and u.rol = 'estudiante'
  limit 1;

  if v_estudiante_id is null then
    raise exception 'El usuario autenticado no es un estudiante válido';
  end if;

  select r.id
  into v_relacion_id
  from "AT".relaciones_asesor_estudiante r
  where r.asesor_id = p_asesor_id
    and r.estudiante_id = v_estudiante_id
    and r.estado = 'activo'
  limit 1;

  if v_relacion_id is null then
    raise exception 'No tienes una relación activa con este asesor';
  end if;

  if p_fin <= p_inicio then
    raise exception 'La fecha fin debe ser mayor que la fecha inicio';
  end if;

  select
    d.id,
    d.asesor_id,
    d.inicio,
    d.fin,
    d.usa_bloques,
    d.duracion_bloque_minutos,
    d.disponible,
    d.activo,
    d.recurrente,
    d.dia_semana,
    d.fecha_inicio,
    d.fecha_fin
  into v_disp
  from "AT".disponibilidad_asesor d
  where d.id = p_disponibilidad_id
    and d.asesor_id = p_asesor_id
  for update;

  if v_disp.id is null then
    raise exception 'No se encontró la disponibilidad del asesor';
  end if;

  if coalesce(v_disp.activo, false) = false then
    raise exception 'La disponibilidad no está activa';
  end if;

  if coalesce(v_disp.disponible, false) = false then
    raise exception 'La disponibilidad no está disponible';
  end if;

  if coalesce(v_disp.recurrente, false) = false then
    if p_inicio < v_disp.inicio or p_fin > v_disp.fin then
      raise exception 'La cita está fuera del rango de disponibilidad';
    end if;
  else
    if v_disp.fecha_inicio is null or v_disp.fecha_fin is null or v_disp.dia_semana is null then
      raise exception 'La disponibilidad recurrente está incompleta';
    end if;

    if (p_inicio at time zone 'America/Lima')::date < v_disp.fecha_inicio
       or (p_inicio at time zone 'America/Lima')::date > v_disp.fecha_fin then
      raise exception 'La cita está fuera del rango de fechas permitidas';
    end if;

    if extract(dow from (p_inicio at time zone 'America/Lima'))::int <> v_disp.dia_semana then
      raise exception 'La cita no corresponde al día permitido de la disponibilidad';
    end if;

    if (p_fin at time zone 'America/Lima')::date <> (p_inicio at time zone 'America/Lima')::date then
      raise exception 'La cita recurrente debe iniciar y terminar el mismo día';
    end if;

    if (p_inicio at time zone 'America/Lima')::time < (v_disp.inicio at time zone 'America/Lima')::time
       or (p_fin at time zone 'America/Lima')::time > (v_disp.fin at time zone 'America/Lima')::time then
      raise exception 'La cita está fuera del rango horario de disponibilidad';
    end if;
  end if;

  v_duracion_minutos := floor(extract(epoch from (p_fin - p_inicio)) / 60);

  if v_duracion_minutos <= 0 then
    raise exception 'La duración de la cita debe ser mayor a 0 minutos';
  end if;

  if coalesce(v_disp.usa_bloques, false) = true then
    if mod(v_duracion_minutos, v_disp.duracion_bloque_minutos) <> 0 then
      raise exception 'La duración no coincide con los bloques permitidos';
    end if;

    if coalesce(v_disp.recurrente, false) = false then
      if mod(
        floor(extract(epoch from (p_inicio - v_disp.inicio)) / 60)::integer,
        v_disp.duracion_bloque_minutos
      ) <> 0 then
        raise exception 'La hora de inicio no coincide con la grilla de bloques';
      end if;
    else
      if mod(
        (
          extract(hour from (p_inicio at time zone 'America/Lima')::time)::int * 60 +
          extract(minute from (p_inicio at time zone 'America/Lima')::time)::int
        ) -
        (
          extract(hour from (v_disp.inicio at time zone 'America/Lima')::time)::int * 60 +
          extract(minute from (v_disp.inicio at time zone 'America/Lima')::time)::int
        ),
        v_disp.duracion_bloque_minutos
      ) <> 0 then
        raise exception 'La hora de inicio no coincide con la grilla de bloques';
      end if;
    end if;
  end if;

  select exists (
    select 1
    from "AT".validation_cita vc
    where vc.advisor_id = p_asesor_id
      and vc.status in ('pending', 'payment_pending', 'paid', 'confirmed')
      and tstzrange(vc.start_at, vc.end_at, '[)') && tstzrange(p_inicio, p_fin, '[)')
  )
  into v_solapa;

  if v_solapa then
    raise exception 'Ya existe una solicitud o cita en ese bloque';
  end if;

  select exists (
    select 1
    from "AT".reuniones_asesor r
    where r.asesor_id = p_asesor_id
      and r.estado in ('pendiente', 'confirmado', 'pendiente_pago')
      and tstzrange(r.inicio, r.fin, '[)') && tstzrange(p_inicio, p_fin, '[)')
  )
  into v_solapa;

  if v_solapa then
    raise exception 'El bloque seleccionado ya no está libre';
  end if;

  insert into "AT".validation_cita (
    user_id,
    advisor_id,
    tesis_id,
    disponibilidad_id,
    status,
    reservation_date,
    start_at,
    end_at,
    duration_minutes,
    motivo,
    modalidad,
    lugar,
    enlace_reunion,
    notas
  )
  values (
    v_estudiante_id,
    p_asesor_id,
    p_tesis_id,
    p_disponibilidad_id,
    'pending',
    (p_inicio at time zone 'America/Lima')::date,
    p_inicio,
    p_fin,
    v_duracion_minutos,
    p_motivo,
    p_modalidad,
    p_lugar,
    p_enlace_reunion,
    p_notas
  )
  returning id into v_validation_id;

  insert into "AT".notifications (
    user_id,
    title,
    message,
    type,
    status,
    related_id
  )
  values (
    p_asesor_id,
    'Nueva solicitud de cita',
    'Un estudiante quiere reservar una cita contigo',
    'solicitud_cita',
    'unread',
    v_validation_id
  );

  return query
  select
    true,
    v_validation_id,
    'pending'::varchar,
    'Solicitud de cita creada correctamente'::text;
end;
$function$;

create or replace function "AT".responder_reserva_cita(
  p_validation_cita_id uuid,
  p_accion varchar
)
returns table(
  ok boolean,
  validation_cita_id uuid,
  pago_id uuid,
  estado varchar,
  mensaje text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_auth_user_id uuid;
  v_asesor_id uuid;
  v_reserva record;
  v_pago_id uuid;
  v_solapa boolean;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  select u.id
  into v_asesor_id
  from "AT".usuarios u
  where u.auth_usuario_id = v_auth_user_id
    and u.rol = 'asesor'
  limit 1;

  if v_asesor_id is null then
    raise exception 'El usuario autenticado no es un asesor válido';
  end if;

  select *
  into v_reserva
  from "AT".validation_cita vc
  where vc.id = p_validation_cita_id
    and vc.advisor_id = v_asesor_id
  for update;

  if v_reserva.id is null then
    raise exception 'No se encontró la solicitud';
  end if;

  if v_reserva.status <> 'pending' then
    raise exception 'La solicitud ya fue procesada';
  end if;

  if p_accion = 'rechazar' then
    update "AT".validation_cita
    set status = 'rejected'
    where id = p_validation_cita_id;

    insert into "AT".notifications (
      user_id, title, message, type, status, related_id
    )
    values (
      v_reserva.user_id,
      'Solicitud rechazada',
      'Tu solicitud de cita fue rechazada por el asesor',
      'cita_rechazada',
      'unread',
      v_reserva.id
    );

    return query
    select true, v_reserva.id, null::uuid, 'rejected'::varchar, 'Solicitud rechazada'::text;

  elsif p_accion = 'aceptar' then
    select exists (
      select 1
      from "AT".validation_cita vc
      where vc.advisor_id = v_reserva.advisor_id
        and vc.id <> v_reserva.id
        and vc.status in ('payment_pending', 'paid', 'confirmed')
        and tstzrange(vc.start_at, vc.end_at, '[)') && tstzrange(v_reserva.start_at, v_reserva.end_at, '[)')
    )
    into v_solapa;

    if v_solapa then
      raise exception 'El bloque ya fue tomado por otra solicitud';
    end if;

    select exists (
      select 1
      from "AT".reuniones_asesor r
      where r.asesor_id = v_reserva.advisor_id
        and r.estado in ('pendiente', 'confirmado', 'pendiente_pago')
        and tstzrange(r.inicio, r.fin, '[)') && tstzrange(v_reserva.start_at, v_reserva.end_at, '[)')
    )
    into v_solapa;

    if v_solapa then
      raise exception 'Ya existe una reunión confirmada o en proceso para ese bloque';
    end if;

    insert into "AT".pagos (
      id,
      pagador_id,
      concepto,
      monto,
      estado,
      codigo_operacion,
      creado_en,
      actualizado_en,
      nota_verificacion
    )
    values (
      gen_random_uuid(),
      v_reserva.user_id,
      coalesce(v_reserva.motivo, 'Reserva de asesoría'),
      100,
      'pendiente',
      'PAY-' || substr(md5(random()::text), 1, 10),
      now(),
      now(),
      'Pago generado luego de validación del asesor'
    )
    returning id into v_pago_id;

    update "AT".validation_cita
    set status = 'payment_pending',
        payment_id = v_pago_id
    where id = p_validation_cita_id;

    insert into "AT".notifications (
      user_id, title, message, type, status, related_id
    )
    values (
      v_reserva.user_id,
      'Pago generado',
      'Tu solicitud fue aceptada. Ya tienes un pago pendiente para confirmar tu cita',
      'pago_generado',
      'unread',
      v_reserva.id
    );

    return query
    select true, v_reserva.id, v_pago_id, 'payment_pending'::varchar, 'Solicitud aceptada y pago generado'::text;
  else
    raise exception 'Acción inválida. Usa aceptar o rechazar';
  end if;
end;
$function$;

create or replace function "AT".aprobar_pago_reserva_cita(
  p_validation_cita_id uuid,
  p_enlace_reunion text default null,
  p_lugar text default null,
  p_notas text default null
)
returns table(
  ok boolean,
  reunion_id uuid,
  pago_id uuid,
  estado varchar,
  mensaje text
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_reserva record;
  v_reunion_id uuid;
begin
  select *
  into v_reserva
  from "AT".validation_cita vc
  where vc.id = p_validation_cita_id
  for update;

  if v_reserva.id is null then
    raise exception 'No se encontró la reserva';
  end if;

  if v_reserva.status <> 'payment_pending' then
    raise exception 'La reserva no está pendiente de pago';
  end if;

  update "AT".pagos
  set estado = 'validado',
      actualizado_en = now()
  where id = v_reserva.payment_id;

  insert into "AT".reuniones_asesor (
    id,
    disponibilidad_id,
    asesor_id,
    estudiante_id,
    tesis_id,
    tarifa_id,
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
    gen_random_uuid(),
    v_reserva.disponibilidad_id,
    v_reserva.advisor_id,
    v_reserva.user_id,
    v_reserva.tesis_id,
    null,
    'confirmado',
    v_reserva.payment_id,
    v_reserva.motivo,
    coalesce(p_notas, v_reserva.notas),
    v_reserva.modalidad,
    coalesce(p_lugar, v_reserva.lugar),
    coalesce(p_enlace_reunion, v_reserva.enlace_reunion),
    v_reserva.start_at,
    v_reserva.end_at,
    v_reserva.duration_minutes,
    100,
    'PEN',
    now(),
    now()
  )
  returning id into v_reunion_id;

  update "AT".validation_cita
  set status = 'confirmed',
      meeting_id = v_reunion_id
  where id = v_reserva.id;

  insert into "AT".notifications (
    user_id, title, message, type, status, related_id
  )
  values (
    v_reserva.user_id,
    'Cita confirmada',
    'Tu pago fue validado y tu cita ya está confirmada',
    'cita_confirmada',
    'unread',
    v_reunion_id
  );

  return query
  select true, v_reunion_id, v_reserva.payment_id, 'confirmed'::varchar, 'Pago aprobado y reunión creada'::text;
end;
$function$;

create or replace function "AT".obtener_historial_validaciones_cita_asesor(
  p_status varchar default null
)
returns table (
  validation_cita_id uuid,
  estudiante_id uuid,
  estudiante_nombre text,
  tesis_id uuid,
  tesis_titulo text,
  disponibilidad_id uuid,
  status varchar,
  reservation_date date,
  start_at timestamptz,
  end_at timestamptz,
  duration_minutes integer,
  motivo text,
  modalidad varchar,
  lugar text,
  enlace_reunion text,
  notas text,
  payment_id uuid,
  meeting_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_auth_user_id uuid;
  v_asesor_id uuid;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  select u.id
  into v_asesor_id
  from "AT".usuarios u
  where u.auth_usuario_id = v_auth_user_id
    and u.rol = 'asesor'
  limit 1;

  if v_asesor_id is null then
    raise exception 'El usuario autenticado no es un asesor válido';
  end if;

  return query
  select
    vc.id as validation_cita_id,
    vc.user_id as estudiante_id,
    trim(coalesce(pe.nombres, '') || ' ' || coalesce(pe.apellidos, '')) as estudiante_nombre,
    vc.tesis_id,
    t.titulo as tesis_titulo,
    vc.disponibilidad_id,
    vc.status,
    vc.reservation_date,
    vc.start_at,
    vc.end_at,
    vc.duration_minutes,
    vc.motivo,
    vc.modalidad,
    vc.lugar,
    vc.enlace_reunion,
    vc.notas,
    vc.payment_id,
    vc.meeting_id,
    vc.created_at,
    vc.updated_at
  from "AT".validation_cita vc
  left join "AT".perfil_estudiante pe
    on pe.estudiante_id = vc.user_id
  left join "AT".tesis t
    on t.id = vc.tesis_id
  where vc.advisor_id = v_asesor_id
    and (p_status is null or vc.status = p_status)
  order by vc.created_at desc;
end;
$function$;

create or replace function "AT".obtener_historial_validaciones_cita_estudiante(
  p_status varchar default null
)
returns table (
  validation_cita_id uuid,
  advisor_id uuid,
  advisor_nombre text,
  tesis_id uuid,
  tesis_titulo text,
  disponibilidad_id uuid,
  status varchar,
  reservation_date date,
  start_at timestamptz,
  end_at timestamptz,
  duration_minutes integer,
  motivo text,
  modalidad varchar,
  lugar text,
  enlace_reunion text,
  notas text,
  payment_id uuid,
  meeting_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_auth_user_id uuid;
  v_estudiante_id uuid;
begin
  v_auth_user_id := auth.uid();

  if v_auth_user_id is null then
    raise exception 'Usuario no autenticado';
  end if;

  select u.id
  into v_estudiante_id
  from "AT".usuarios u
  where u.auth_usuario_id = v_auth_user_id
    and u.rol = 'estudiante'
  limit 1;

  if v_estudiante_id is null then
    raise exception 'El usuario autenticado no es un estudiante válido';
  end if;

  return query
  select
    vc.id as validation_cita_id,
    vc.advisor_id,
    trim(coalesce(pa.nombres, '') || ' ' || coalesce(pa.apellidos, '')) as advisor_nombre,
    vc.tesis_id,
    t.titulo as tesis_titulo,
    vc.disponibilidad_id,
    vc.status,
    vc.reservation_date,
    vc.start_at,
    vc.end_at,
    vc.duration_minutes,
    vc.motivo,
    vc.modalidad,
    vc.lugar,
    vc.enlace_reunion,
    vc.notas,
    vc.payment_id,
    vc.meeting_id,
    vc.created_at,
    vc.updated_at
  from "AT".validation_cita vc
  left join "AT".perfil_asesor pa
    on pa.asesor_id = vc.advisor_id
  left join "AT".tesis t
    on t.id = vc.tesis_id
  where vc.user_id = v_estudiante_id
    and (p_status is null or vc.status = p_status)
  order by vc.created_at desc;
end;
$function$;
