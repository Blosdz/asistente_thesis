create or replace function "AT".fn_iniciar_pago_plan(plan_id uuid)
returns table(pago_id uuid, monto numeric, estado text)
language plpgsql
security definer
as $$
declare
  v_precio numeric;
  v_nombre text;
  v_pagador_id uuid;
begin
  select u.id
    into v_pagador_id
  from "AT".usuarios u
  where u.auth_usuario_id = auth.uid()
    and u.rol = 'estudiante'
  limit 1;

  if v_pagador_id is null then
    raise exception 'No se encontro usuario AT para el estudiante autenticado';
  end if;

  select p.precio, p.nombre
    into v_precio, v_nombre
  from "AT".planes p
  where p.id = plan_id
    and coalesce(p.activo, true);

  if v_precio is null then
    raise exception 'Plan no encontrado o inactivo';
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
    v_pagador_id,
    'plan:' || v_nombre,
    v_precio,
    'pendiente',
    'PAY-' || substr(md5(random()::text), 1, 10),
    now(),
    now(),
    'Creado automaticamente'
  )
  returning id into pago_id;

  insert into "AT".pagos_plan (id, pago_id, plan_id, creado_en)
  values (gen_random_uuid(), pago_id, plan_id, now());

  monto := v_precio;
  estado := 'pendiente';
  return;
end;
$$;

create or replace function "AT".fn_reservar_reunion(
  p_disponibilidad uuid,
  p_asesor uuid,
  p_tesis uuid default null,
  p_motivo text default null,
  p_modalidad text default 'virtual'
)
returns table(reunion_id uuid, pago_id uuid, enlace text, estado text)
language plpgsql
security definer
as $$
declare
  v_inicio timestamptz;
  v_fin timestamptz;
  v_estudiante_id uuid;
begin
  select u.id
    into v_estudiante_id
  from "AT".usuarios u
  where u.auth_usuario_id = auth.uid()
    and u.rol = 'estudiante'
  limit 1;

  if v_estudiante_id is null then
    raise exception 'No se encontro usuario AT para el estudiante autenticado';
  end if;

  select d.inicio, d.fin
    into v_inicio, v_fin
  from "AT".disponibilidad_asesor d
  where d.id = p_disponibilidad
    and d.asesor_id = p_asesor
    and coalesce(d.disponible, true) = true
    and coalesce(d.activo, true) = true
  for update;

  if v_inicio is null then
    raise exception 'Disponibilidad no encontrada o no disponible';
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
    v_estudiante_id,
    'reunion',
    200,
    'pendiente',
    'PAY-' || substr(md5(random()::text), 1, 10),
    now(),
    now(),
    'Reunion pendiente de pago'
  )
  returning id into pago_id;

  insert into "AT".reuniones_asesor (
    id,
    disponibilidad_id,
    asesor_id,
    estudiante_id,
    tesis_id,
    estado,
    pago_id,
    motivo,
    modalidad,
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
    p_disponibilidad,
    p_asesor,
    v_estudiante_id,
    p_tesis,
    'pendiente_pago',
    pago_id,
    p_motivo,
    p_modalidad,
    'https://meet.jit.si/' || gen_random_uuid(),
    v_inicio,
    v_fin,
    extract(epoch from (v_fin - v_inicio)) / 60,
    200,
    'PEN',
    now(),
    now()
  )
  returning id, pago_id, enlace_reunion, estado
  into reunion_id, pago_id, enlace, estado;

  update "AT".disponibilidad_asesor
  set disponible = false,
      actualizado_en = now()
  where id = p_disponibilidad;

  return;
end;
$$;
