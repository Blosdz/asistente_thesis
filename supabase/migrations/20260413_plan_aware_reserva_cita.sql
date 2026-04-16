create or replace function "AT".obtener_suscripcion_estudiante(
  p_estudiante_id uuid
)
returns table (
  id uuid,
  estudiante_id uuid,
  plan_id uuid,
  estado varchar,
  asesorias_incluidas integer,
  asesorias_usadas integer,
  asesorias_disponibles integer,
  iniciado_en timestamptz,
  expira_en timestamptz
)
language sql
security definer
set search_path to 'AT', 'public'
as $function$
  select
    s.id,
    s.estudiante_id,
    s.plan_id,
    s.estado,
    s.asesorias_incluidas,
    s.asesorias_usadas,
    greatest(coalesce(s.asesorias_incluidas, 0) - coalesce(s.asesorias_usadas, 0), 0) as asesorias_disponibles,
    s.iniciado_en,
    s.expira_en
  from "AT".suscripciones_estudiante s
  where s.estudiante_id = p_estudiante_id
    and s.estado = 'activo'
  order by s.creado_en desc
  limit 1;
$function$;

revoke all on function "AT".obtener_suscripcion_estudiante(uuid) from public;
grant execute on function "AT".obtener_suscripcion_estudiante(uuid) to authenticated;

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
  v_suscripcion record;
  v_es_presustentacion boolean;
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
        and vc.status in ('payment_pending', 'paid', 'confirmed', 'approved')
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

    v_es_presustentacion := lower(coalesce(v_reserva.motivo, '')) like '%pre-sustent%'
      or lower(coalesce(v_reserva.motivo, '')) like '%presustent%';

    select *
    into v_suscripcion
    from "AT".obtener_suscripcion_estudiante(v_reserva.user_id)
    limit 1;

    if v_es_presustentacion = false
       and v_suscripcion.id is not null
       and coalesce(v_suscripcion.asesorias_disponibles, 0) > 0 then
      update "AT".suscripciones_estudiante
      set asesorias_usadas = coalesce(asesorias_usadas, 0) + 1,
          actualizado_en = now()
      where id = v_suscripcion.id;

      update "AT".validation_cita
      set status = 'approved',
          payment_id = null
      where id = p_validation_cita_id;

      insert into "AT".notifications (
        user_id, title, message, type, status, related_id
      )
      values (
        v_reserva.user_id,
        'Solicitud aceptada con tu plan',
        'Tu solicitud fue aceptada y se descontó una asesoría disponible de tu plan. No se generó un pago adicional.',
        'cita_aprobada_plan',
        'unread',
        v_reserva.id
      );

      return query
      select
        true,
        v_reserva.id,
        null::uuid,
        'approved'::varchar,
        'Solicitud aceptada con una asesoría disponible del plan'::text;

      return;
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
