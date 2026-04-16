alter table "AT"."tesis"
drop constraint if exists tesis_estado_check;

alter table "AT"."tesis"
add constraint tesis_estado_check
check (
  "estado" in (
    'borrador',
    'pendiente_pago',
    'en_progreso',
    'revision',
    'completado',
    'cancelado'
  )
);

drop function if exists "AT"."crear_tesis_con_plan"(
  uuid,
  text,
  text,
  uuid,
  uuid,
  varchar,
  boolean,
  uuid,
  varchar
);

drop function if exists "AT"."crear_tesis_con_plan"(
  text,
  varchar,
  uuid,
  varchar,
  uuid,
  uuid,
  boolean,
  uuid,
  text,
  uuid
);

create or replace function "AT"."crear_tesis_con_plan"(
  p_descripcion text,
  p_estado_tesis varchar default 'pendiente_pago',
  p_estudiante_id uuid default null,
  p_nivel_academico varchar default null,
  p_plan_id uuid default null,
  p_programa_id uuid default null,
  p_requiere_analisis_estadistico boolean default true,
  p_tipo_tesis_id uuid default null,
  p_titulo text default null,
  p_universidad_id uuid default null
)
returns table (
  "tesis_id" uuid,
  "pago_id" uuid,
  "plan_id" uuid,
  "plan_nombre" varchar,
  "tipo_tesis_id" uuid,
  "tipo_tesis_nombre" varchar,
  "nivel_academico" varchar,
  "precio_base" numeric,
  "porcentaje_nivel" numeric,
  "monto_ajuste_nivel" numeric,
  "descuento_analisis_estadistico" numeric,
  "precio_total" numeric,
  "moneda" varchar,
  "estado_tesis" varchar,
  "estado_pago" varchar
)
language plpgsql
security definer
set search_path to 'AT', 'public'
as $function$
declare
  v_tesis_id uuid;
  v_pago_id uuid;
  v_estudiante_id uuid;
  v_plan_nombre varchar;
  v_tipo_tesis_nombre varchar;
  v_precio_base numeric(10,2);
  v_porcentaje_nivel numeric(5,2) := 0;
  v_monto_ajuste_nivel numeric(10,2) := 0;
  v_descuento_analisis numeric(10,2) := 0;
  v_precio_total numeric(10,2) := 0;
  v_moneda varchar := 'PEN';
  v_nivel_normalizado varchar;
begin
  select u."id"
  into v_estudiante_id
  from "AT"."usuarios" u
  where u."auth_usuario_id" = auth.uid()
    and u."rol" = 'estudiante'
    and (p_estudiante_id is null or u."id" = p_estudiante_id)
  limit 1;

  if v_estudiante_id is null then
    raise exception 'No se encontró el estudiante autenticado o no coincide con p_estudiante_id';
  end if;

  if p_titulo is null or btrim(p_titulo) = '' then
    raise exception 'El título de la tesis es obligatorio';
  end if;

  if p_plan_id is null then
    raise exception 'El plan es obligatorio';
  end if;

  if p_tipo_tesis_id is null then
    raise exception 'El tipo de tesis es obligatorio';
  end if;

  if p_nivel_academico is null or btrim(p_nivel_academico) = '' then
    raise exception 'El nivel académico es obligatorio';
  end if;

  v_nivel_normalizado := upper(trim(p_nivel_academico));

  if v_nivel_normalizado not in ('PREGRADO', 'MAESTRIA', 'ESPECIALIDAD', 'DOCTORADO') then
    raise exception 'Nivel académico inválido. Debe ser PREGRADO, MAESTRIA, ESPECIALIDAD o DOCTORADO';
  end if;

  select
    cot."plan_nombre",
    cot."tipo_tesis_nombre",
    cot."precio_base",
    cot."porcentaje_nivel",
    cot."monto_ajuste_nivel",
    cot."descuento_analisis_estadistico",
    cot."precio_total",
    cot."moneda"
  into
    v_plan_nombre,
    v_tipo_tesis_nombre,
    v_precio_base,
    v_porcentaje_nivel,
    v_monto_ajuste_nivel,
    v_descuento_analisis,
    v_precio_total,
    v_moneda
  from "AT"."cotizar_tesis_plan"(
    p_plan_id,
    p_tipo_tesis_id,
    v_nivel_normalizado,
    p_requiere_analisis_estadistico
  ) cot;

  insert into "AT"."tesis" (
    "estudiante_id",
    "universidad_id",
    "titulo",
    "descripcion",
    "estado",
    "tipo_tesis_id",
    "plan_id",
    "programa_id",
    "nivel_academico",
    "requiere_analisis_estadistico",
    "precio_base",
    "porcentaje_nivel",
    "monto_ajuste_nivel",
    "descuento_analisis_estadistico",
    "precio_total",
    "moneda"
  )
  values (
    v_estudiante_id,
    p_universidad_id,
    p_titulo,
    p_descripcion,
    coalesce(p_estado_tesis, 'pendiente_pago'),
    p_tipo_tesis_id,
    p_plan_id,
    p_programa_id,
    v_nivel_normalizado,
    coalesce(p_requiere_analisis_estadistico, true),
    v_precio_base,
    v_porcentaje_nivel,
    v_monto_ajuste_nivel,
    v_descuento_analisis,
    v_precio_total,
    coalesce(v_moneda, 'PEN')
  )
  returning "id" into v_tesis_id;

  insert into "AT"."pagos" (
    "id",
    "pagador_id",
    "tesis_id",
    "concepto",
    "monto",
    "estado",
    "codigo_operacion",
    "metadata",
    "creado_en",
    "actualizado_en",
    "nota_verificacion"
  )
  values (
    gen_random_uuid(),
    v_estudiante_id,
    v_tesis_id,
    'Pago por plan de tesis: ' || p_titulo,
    v_precio_total,
    'pendiente',
    'PAY-' || substr(md5(random()::text), 1, 10),
    jsonb_build_object(
      'origen_pago', 'tesis_con_plan',
      'plan_id', p_plan_id,
      'plan_nombre', v_plan_nombre,
      'tipo_tesis_id', p_tipo_tesis_id,
      'tipo_tesis_nombre', v_tipo_tesis_nombre,
      'nivel_academico', v_nivel_normalizado,
      'precio_base', v_precio_base,
      'porcentaje_nivel', v_porcentaje_nivel,
      'monto_ajuste_nivel', v_monto_ajuste_nivel,
      'descuento_analisis_estadistico', v_descuento_analisis,
      'precio_total', v_precio_total,
      'moneda', coalesce(v_moneda, 'PEN')
    ),
    now(),
    now(),
    'Pago pendiente generado al crear tesis'
  )
  returning "id" into v_pago_id;

  insert into "AT"."pagos_plan" (
    "id",
    "pago_id",
    "plan_id",
    "creado_en"
  )
  values (
    gen_random_uuid(),
    v_pago_id,
    p_plan_id,
    now()
  );

  return query
  select
    v_tesis_id,
    v_pago_id,
    p_plan_id,
    v_plan_nombre,
    p_tipo_tesis_id,
    v_tipo_tesis_nombre,
    v_nivel_normalizado,
    v_precio_base,
    v_porcentaje_nivel,
    v_monto_ajuste_nivel,
    v_descuento_analisis,
    v_precio_total,
    coalesce(v_moneda, 'PEN'),
    coalesce(p_estado_tesis, 'pendiente_pago'),
    'pendiente'::varchar;
end;
$function$;
