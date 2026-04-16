create or replace function "AT".admin_verificar_pago_plan(
  p_pago_id uuid,
  p_estado varchar,
  p_nota_verificacion text default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_pago "AT".pagos%rowtype;
  v_pago_plan "AT".pagos_plan%rowtype;
  v_admin_usuario_id uuid;
  v_plan_id uuid;
  v_plan_nombre varchar;
  v_duracion_dias integer;
  v_suscripcion_id uuid;
  v_suscripcion_expira_en timestamptz;
  v_inicio timestamptz;
  v_fin timestamptz;
begin
  if p_estado not in ('validado', 'rechazado') then
    raise exception 'Estado no válido. Use validado o rechazado';
  end if;

  select u.id
  into v_admin_usuario_id
  from "AT".usuarios u
  where u.auth_usuario_id = auth.uid()
    and u.rol = 'admin'
  limit 1;

  if v_admin_usuario_id is null then
    raise exception 'No autorizado: solo admin puede verificar pagos de planes';
  end if;

  select p.*
  into v_pago
  from "AT".pagos p
  where p.id = p_pago_id
  limit 1
  for update;

  if v_pago.id is null then
    raise exception 'No existe el pago indicado';
  end if;

  select pp.*
  into v_pago_plan
  from "AT".pagos_plan pp
  where pp.pago_id = p_pago_id
  limit 1;

  if v_pago_plan.id is null then
    raise exception 'El pago no está vinculado a un plan';
  end if;

  select
    pl.id,
    pl.nombre,
    pl.duracion_dias::integer
  into
    v_plan_id,
    v_plan_nombre,
    v_duracion_dias
  from "AT".planes pl
  where pl.id = v_pago_plan.plan_id
    and coalesce(pl.activo, true) = true
  limit 1;

  if v_plan_id is null then
    raise exception 'El plan asociado no existe o está inactivo';
  end if;

  if coalesce(v_duracion_dias, 0) <= 0 then
    raise exception 'El plan asociado no tiene una duración válida';
  end if;

  if lower(coalesce(v_pago.estado, '')) in ('validado', 'verificado', 'rechazado') then
    raise exception 'Este pago ya fue procesado previamente';
  end if;

  update "AT".pagos
  set estado = p_estado,
      verificado_por = v_admin_usuario_id,
      verificado_en = now(),
      nota_verificacion = p_nota_verificacion,
      actualizado_en = now()
  where id = p_pago_id;

  if p_estado = 'rechazado' then
    return jsonb_build_object(
      'ok', true,
      'accion', 'pago_rechazado',
      'pago_id', p_pago_id,
      'plan_id', v_plan_id,
      'plan_nombre', v_plan_nombre
    );
  end if;

  select
    s.id,
    s.expira_en
  into
    v_suscripcion_id,
    v_suscripcion_expira_en
  from "AT".suscripciones_estudiante s
  where s.estudiante_id = v_pago.pagador_id
    and s.plan_id = v_pago_plan.plan_id
  order by s.actualizado_en desc nulls last, s.creado_en desc nulls last
  limit 1;

  if v_suscripcion_id is not null
     and v_suscripcion_expira_en is not null
     and v_suscripcion_expira_en > now() then
    v_inicio := v_suscripcion_expira_en;
  else
    v_inicio := now();
  end if;

  v_fin := v_inicio + make_interval(days => v_duracion_dias);

  if v_suscripcion_id is null then
    insert into "AT".suscripciones_estudiante (
      estudiante_id,
      plan_id,
      estado,
      iniciado_en,
      expira_en,
      creado_en,
      actualizado_en
    )
    values (
      v_pago.pagador_id,
      v_pago_plan.plan_id,
      'activo',
      now(),
      v_fin,
      now(),
      now()
    );
  else
    update "AT".suscripciones_estudiante
    set estado = 'activo',
        iniciado_en = case
          when v_suscripcion_expira_en is null or v_suscripcion_expira_en <= now() then now()
          else coalesce(iniciado_en, now())
        end,
        expira_en = v_fin,
        actualizado_en = now()
    where id = v_suscripcion_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'accion', 'pago_validado',
    'pago_id', p_pago_id,
    'plan_id', v_plan_id,
    'plan_nombre', v_plan_nombre,
    'duracion_dias', v_duracion_dias,
    'expira_en', v_fin
  );
end;
$function$;

revoke all on function "AT".admin_verificar_pago_plan(uuid, varchar, text) from public;
grant execute on function "AT".admin_verificar_pago_plan(uuid, varchar, text) to authenticated;
