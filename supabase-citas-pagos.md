# Supabase: Citas + Pagos (asesoría / pre-sustentación)

Guía para implementar en Supabase los componentes faltantes (sin afectar lo ya existente). Todo en ASCII.

## 1) Storage
- Crear bucket privado `pagos-comprobantes`.
- Política: permitir `insert/select` sólo al dueño (auth.uid = estudiante.auth_usuario_id) sobre sus objetos; permitir `select` a asesores/admin para validar. No `delete` público.

## 2) Tablas nuevas (si no existen operativas)
- `pagos`:
  - id uuid PK default gen_random_uuid()
  - estudiante_id uuid FK AT.usuarios(id)
  - asesor_id uuid FK AT.usuarios(id)
  - concepto varchar(200) (ej: "cita", "pre-sustentacion")
  - monto numeric(10,2) default 100 check >= 0
  - estado varchar(20) check in ('pendiente','pagado','rechazado','reembolsado') default 'pendiente'
  - comprobante_url text (ruta en bucket)
  - meet_link text
  - meet_event_id text
  - reservado_para timestamptz (inicio de la reunión)
  - reservado_fin timestamptz
  - modalidad varchar(20) check in ('virtual','presencial')
  - metadata jsonb
  - creado_en timestamptz default now(), actualizado_en timestamptz default now()
- `reuniones` (si no tienes una activa):
  - id uuid PK default gen_random_uuid()
  - pago_id uuid FK pagos(id)
  - asesor_id uuid FK AT.usuarios(id)
  - estudiante_id uuid FK AT.usuarios(id)
  - inicio timestamptz, fin timestamptz (tomados del slot del asesor)
  - modalidad varchar(20) check in ('virtual','presencial')
  - meet_link text, meet_event_id text
  - estado varchar(20) check in ('pendiente','confirmado','cancelado','completado') default 'pendiente'
  - creado_en timestamptz default now(), actualizado_en timestamptz default now()
- (Opcional) `pagos_asesor`: pago_id uuid FK pagos(id), asesor_id uuid, estado_liquidacion varchar(20) default 'pendiente', referencia_bancaria text.

## 3) RLS (resumido)
- `pagos`:
  - Insert: estudiante sólo puede insertar si `estudiante_id = auth.uid mapped` y `estado = 'pendiente'`.
  - Select: estudiante ve los suyos; asesor ve pagos donde es asesor_id; admin rol ve todos.
  - Update: estudiante sólo puede actualizar sus pagos mientras estado = 'pendiente' y sólo campos (comprobante_url, metadata); asesor/admin pueden cambiar estado a pagado/rechazado y setear meet_link/event_id.
- `reuniones`:
  - Insert: sólo servicio/función o trigger (no directo del cliente) o permitir estudiante si pago_id pertenece a él y slot disponible.
  - Select: estudiante suyas, asesor las suyas, admin todas.
  - Update: asesor puede marcar confirmado/completado/cancelado; estudiante sólo cancelado antes de inicio.
- `documentos_tesis`: reforzar que estudiantes no pueden insertar (solo asesores/admin).

## 4) Triggers / funciones
- `pagos` BEFORE INSERT: set defaults (estado='pendiente', monto=100 si null).
- `pagos` AFTER INSERT: crea registro en `reuniones` con estado `pendiente` usando horario (reservado_para, reservado_fin) y modalidad. (Usar slot de disponibilidad del asesor.)
- `pagos` AFTER UPDATE (cuando estado pasa a 'pagado'): set `reuniones.estado = 'confirmado'` y, si meet_link vacío, llamar función RPC para generar Google Meet.
- `reuniones` BEFORE INSERT: validar no solape (unique parcial por asesor_id + inicio cuando estado in ('pendiente','confirmado')).
- `reuniones` AFTER UPDATE (cancelado): opcional set `pagos.estado = 'reembolsado'` o 'rechazado'.

## 5) Edge Function / RPC (Google Meet)
- Crear Edge Function `create_meet_link` (service role) que use credenciales de servicio de Google Calendar:
  - Input: asesor_id, estudiante_id, inicio, fin, titulo, descripcion.
  - Output: meet_link, meet_event_id.
- Exponer RPC segura: sólo invocable desde backend/server (o trigger) usando service key.

## 6) Flujo de cita (estudiante)
1) Estudiante elige slot disponible del asesor (de `disponibilidad_asesor`).
2) Sube comprobante al bucket `pagos-comprobantes` (ruta include pago-id o temp name).
3) Inserta `pagos` con: estudiante_id, asesor_id, concepto ('cita' o 'pre-sustentacion'), monto=100, estado='pendiente', comprobante_url, reservado_para/fin, modalidad.
4) Trigger crea `reuniones` pendiente.
5) Asesor/admin valida pago -> set estado 'pagado' en `pagos`; trigger confirma `reuniones` y genera meet_link si falta.
6) El listado de citas (Citas/Schedule) consulta `reuniones` filtrando por usuario.

## 7) Políticas de Storage (ejemplo SQL)
```sql
-- bucket pagos-comprobantes (RLSP is per-object via storage.objects)
create policy "student_owns_proof" on storage.objects
for insert with check (
  bucket_id = 'pagos-comprobantes'
  and auth.uid() = (select auth_usuario_id from "AT".usuarios u where u.id = current_setting('request.jwt.claims'::text)::json->>'sub')
);
create policy "student_read_own_proof" on storage.objects
for select using (
  bucket_id = 'pagos-comprobantes'
  and auth.uid() = owner
);
-- add policy for advisors/admin (role-based) to select
```

## 8) Índices sugeridos
- `pagos`: idx_estudiante, idx_asesor, idx_estado.
- `reuniones`: unique parcial `unique (asesor_id, inicio) where estado in ('pendiente','confirmado')`.

## 9) Observaciones
- Usa columnas existentes (`disponibilidad_asesor`) para slots; si no hay precio por slot, el trigger fija 100.
- No permitir upload de tesis por estudiantes via RLS (reforzar en `documentos_tesis`).
- Modal de pago: manda comprobante + create pago pendiente + feedback de estado.
- Pre-sustentación: mismo flujo con concepto distinto y modalidad virtual/presencial.

## 10) SQL listo (copiar/pegar)
Funciones y triggers para tus tablas actuales (`disponibilidad_asesor`, `pagos`, `pagos_plan`, `pagos_asesor`, `planes`, `reuniones_asesor`, `suscripciones_estudiante`). Todo en PL/pgSQL.

```sql
-- Todas las funciones y triggers viven en el esquema "AT" y referencian tablas con prefijo "AT".

-- 10.1 Ver planes activos
create or replace function "AT".fn_planes_disponibles()
returns table(id uuid, nombre text, precio numeric, duracion_dias int, caracteristicas jsonb)
language sql stable
as $$
  select id, nombre, precio, duracion_dias, caracteristicas
  from "AT".planes
  where coalesce(activo, true)
  order by precio asc;
$$;

-- 10.2 Crear nota de pago para un plan (estado pendiente)
create or replace function "AT".fn_iniciar_pago_plan(pagador_id uuid, plan_id uuid)
returns table(pago_id uuid, monto numeric, estado text)
language plpgsql security definer
as $$
declare v_precio numeric; v_nombre text;
begin
  select precio, nombre into v_precio, v_nombre from "AT".planes where id = plan_id and coalesce(activo, true);
  if v_precio is null then raise exception 'Plan no encontrado o inactivo'; end if;

  insert into "AT".pagos(id, pagador_id, concepto, monto, estado, codigo_operacion, creado_en, actualizado_en, nota_verificacion)
  values (gen_random_uuid(), pagador_id, 'plan:'||v_nombre, v_precio, 'pendiente', 'PAY-'||substr(md5(random()::text),1,10), now(), now(), 'Creado automáticamente')
  returning id into pago_id;

  insert into "AT".pagos_plan(id, pago_id, plan_id, creado_en)
  values (gen_random_uuid(), pago_id, plan_id, now());

  estado := 'pendiente'; monto := v_precio;
  return;
end;
$$;

-- 10.3 Al pagar un plan, activar suscripción
create or replace function "AT".fn_on_pago_plan_pagado()
returns trigger
language plpgsql security definer
as $$
declare v_plan uuid; v_dias int; v_estudiante uuid;
begin
  select plan_id into v_plan from "AT".pagos_plan where pago_id = new.id;
  if v_plan is null then return new; end if;

  v_estudiante := new.pagador_id;
  select duracion_dias into v_dias from "AT".planes where id = v_plan;

  insert into "AT".suscripciones_estudiante(id, estudiante_id, plan_id, estado, iniciado_en, expira_en, creado_en, actualizado_en)
  values (gen_random_uuid(), v_estudiante, v_plan, 'activa', now(), now() + (v_dias || ' days')::interval, now(), now());
  return new;
end;
$$;

drop trigger if exists trg_pago_plan_pagado on "AT".pagos;
create trigger trg_pago_plan_pagado
after update of estado on "AT".pagos
for each row
when (old.estado is distinct from new.estado and new.estado = 'pagado')
execute function "AT".fn_on_pago_plan_pagado();

-- 10.4 Disponibilidad de asesor por rango
create or replace function "AT".fn_disponibilidad_asesor_semana(p_asesor uuid, desde date, hasta date)
returns table(disponibilidad_id uuid, inicio timestamptz, fin timestamptz, disponible bool, usa_bloques bool, duracion_bloque_minutos int)
language sql stable
as $$
  select id, inicio, fin, coalesce(disponible, true), usa_bloques, duracion_bloque_minutos
  from "AT".disponibilidad_asesor
  where asesor_id = p_asesor
    and inicio::date >= desde and fin::date <= hasta
    and coalesce(activo, true);
$$;

-- 10.5 Reservar reunión: crea pago fijo 200 PEN y bloquea slot
create or replace function "AT".fn_reservar_reunion(
  p_disponibilidad uuid,
  p_asesor uuid,
  p_estudiante uuid,
  p_tesis uuid default null,
  p_motivo text default null,
  p_modalidad text default 'virtual'
)
returns table(reunion_id uuid, pago_id uuid, enlace text, estado text)
language plpgsql security definer
as $$
declare v_inicio timestamptz; v_fin timestamptz;
begin
  select inicio, fin into v_inicio, v_fin
  from "AT".disponibilidad_asesor
  where id = p_disponibilidad and asesor_id = p_asesor and coalesce(disponible, true) = true and coalesce(activo, true) = true
  for update;

  if v_inicio is null then raise exception 'Disponibilidad no encontrada o no disponible'; end if;

  insert into "AT".pagos(id, pagador_id, concepto, monto, estado, codigo_operacion, creado_en, actualizado_en, nota_verificacion)
  values (gen_random_uuid(), p_estudiante, 'reunion', 200, 'pendiente', 'PAY-'||substr(md5(random()::text),1,10), now(), now(), 'Reunión pendiente de pago')
  returning id into pago_id;

  insert into "AT".reuniones_asesor(
    id, disponibilidad_id, asesor_id, estudiante_id, tesis_id, estado, pago_id,
    motivo, modalidad, enlace_reunion, inicio, fin, duracion_minutos,
    costo_reunion, moneda, creado_en, actualizado_en
  )
  values (
    gen_random_uuid(), p_disponibilidad, p_asesor, p_estudiante, p_tesis, 'pendiente_pago', pago_id,
    p_motivo, p_modalidad, 'https://meet.jit.si/'||gen_random_uuid(), v_inicio, v_fin,
    extract(epoch from (v_fin - v_inicio)) / 60, 200, 'PEN', now(), now()
  )
  returning id, pago_id, enlace_reunion, estado into reunion_id, pago_id, enlace, estado;

  update "AT".disponibilidad_asesor set disponible = false, actualizado_en = now() where id = p_disponibilidad;
  return;
end;
$$;

-- 10.6 Default costo fijo y moneda en reuniones insertadas manualmente
create or replace function "AT".fn_on_reunion_insert_set_costo()
returns trigger
language plpgsql security definer
as $$
begin
  new.costo_reunion := 200;
  new.moneda := 'PEN';
  if new.estado is null then new.estado := 'pendiente_pago'; end if;
  return new;
end;
$$;

drop trigger if exists trg_reunion_set_costo on "AT".reuniones_asesor;
create trigger trg_reunion_set_costo
before insert on "AT".reuniones_asesor
for each row
execute function "AT".fn_on_reunion_insert_set_costo();

-- 10.7 Cuando se pague la reunión, confirmar y conservar el link
create or replace function "AT".fn_on_pago_reunion_pagado()
returns trigger
language plpgsql security definer
as $$
declare v_reunion uuid;
begin
  select id into v_reunion from "AT".reuniones_asesor where pago_id = new.id;
  if v_reunion is null then return new; end if;
  update "AT".reuniones_asesor set estado = 'confirmado', actualizado_en = now() where id = v_reunion;
  return new;
end;
$$;

drop trigger if exists trg_pago_reunion_pagado on "AT".pagos;
create trigger trg_pago_reunion_pagado
after update of estado on "AT".pagos
for each row
when (old.estado is distinct from new.estado and new.estado = 'pagado')
execute function "AT".fn_on_pago_reunion_pagado();

-- 10.8 Default en pagos (estado, monto) por si insertan directo
create or replace function "AT".fn_on_pago_before_insert_defaults()
returns trigger
language plpgsql security definer
as $$
begin
  if new.estado is null then new.estado := 'pendiente'; end if;
  if new.monto is null then new.monto := 200; end if; -- monto fijo si no envían
  if new.creado_en is null then new.creado_en := now(); end if;
  new.actualizado_en := now();
  if new.codigo_operacion is null then new.codigo_operacion := 'PAY-'||substr(md5(random()::text),1,10); end if;
  return new;
end;
$$;

drop trigger if exists trg_pago_defaults on "AT".pagos;
create trigger trg_pago_defaults
before insert on "AT".pagos
for each row
execute function "AT".fn_on_pago_before_insert_defaults();
```

## 11) Mock data (ajusta UUID reales de usuarios)
```sql
-- Planes de IA
insert into "AT".planes(id, nombre, precio, duracion_dias, caracteristicas, activo, creado_en, actualizado_en) values
  (gen_random_uuid(), 'Plan IA Básico', 59, 30, '{"horas":"2","asesorias":"2","notas":"Prompts base"}', true, now(), now()),
  (gen_random_uuid(), 'Plan IA Pro', 129, 90, '{"horas":"6","asesorias":"6","notas":"Revisión de tesis"}', true, now(), now()),
  (gen_random_uuid(), 'Plan IA Premium', 199, 180, '{"horas":"12","asesorias":"12","notas":"Acompañamiento completo"}', true, now(), now());

-- Slot de disponibilidad ejemplo (hoy 15:00-16:00)
insert into "AT".disponibilidad_asesor(id, asesor_id, inicio, fin, usa_bloques, duracion_bloque_minutos, recurrente, dia_semana, fecha_inicio, fecha_fin, disponible, activo, creado_en)
values (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', date_trunc('day', now()) + interval '15 hour', date_trunc('day', now()) + interval '16 hour', false, null, false, extract(dow from now())::int, current_date, current_date, true, true, now());

-- Relación asesor-estudiante
insert into "AT".relaciones_asesor_estudiante(id, asesor_id, estudiante_id, estado, creado_en)
values (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1', 'activo', now());
```

## 12) Llamadas desde React (supabase-js)
```js
// Ver planes
const { data: planes, error: planesErr } = await supabase.rpc('fn_planes_disponibles');

// Iniciar pago de plan
const { data: pagoPlan, error: pagoPlanErr } = await supabase.rpc('fn_iniciar_pago_plan', {
  pagador_id: user.id,
  plan_id: selectedPlanId,
});
// pagoPlan => { pago_id, monto, estado }

// Ver disponibilidad (ejemplo semana actual)
const { data: slots, error: slotsErr } = await supabase.rpc('fn_disponibilidad_asesor_semana', {
  p_asesor: asesorId,
  desde: new Date(),
  hasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});

// Reservar reunión (genera pago 200 PEN y link provisional)
const { data: reserva, error: reservaErr } = await supabase.rpc('fn_reservar_reunion', {
  p_disponibilidad: slotId,
  p_asesor: asesorId,
  p_estudiante: user.id,
  p_tesis: tesisId ?? null,
  p_motivo: motivoTexto,
  p_modalidad: 'virtual',
});
// reserva => { reunion_id, pago_id, enlace, estado }
```

Notas rápidas:
- Las funciones marcan `security definer`; ajusta RLS para que `auth.uid()` sólo pueda operar sobre sus pagos/suscripciones.
- El monto fijo para reuniones es 200 PEN: se aplica en `fn_reservar_reunion`, en el trigger `trg_reunion_set_costo` y en el default de pagos.
- Si usas un generador real de enlaces (Edge/Google), reemplaza la línea de `https://meet.jit.si/` y guarda meet_event_id en la misma función.
- Puedes añadir `pagos_asesor` como cola de liquidación: inserta fila espejo en un trigger AFTER INSERT de `pagos` cuando `concepto like 'reunion%'`.
- Las RPC están en el esquema "AT"; si tu cliente Supabase está en schema `public`, configúralo con `createClient(url, key, { db: { schema: 'AT' }})` o usa PostgREST con header `Accept-Profile: AT`.
