# Plan de Migración NestJS + PostgreSQL sin Supabase

## 1. Resumen de Arquitectura Detectada

- El repo NestJS está casi inicial: `src/app.module.ts`, `src/main.ts`, controller/service base y sin módulos de dominio todavía.
- `package.json` no tiene aún `@nestjs/config`, `@nestjs/jwt`, `passport-jwt`, `pg`, `class-validator` ni `class-transformer`.
- `sql/01_tables_AT.sql` contiene la estructura real de tablas bajo esquema `"AT"`.
- `sql/schema_AT.sql` contiene funciones PL/pgSQL existentes, triggers, policies y algunas tablas duplicadas por dump.
- `auth_usuarios` ya existe en `01_tables_AT.sql` y usa `crypt('app_theseis', gen_salt('bf', 12))`, pero falta declarar explícitamente `CREATE EXTENSION IF NOT EXISTS pgcrypto;`.
- Riesgo principal: muchas funciones existentes usan `auth.uid()`, policies `authenticated` y RLS heredado de Supabase. Eso debe migrarse antes de exponerlas limpiamente desde NestJS.

## 2. Tablas Principales Encontradas

- Auth/usuarios: `auth_usuarios`, `usuarios`, `perfil_estudiante`, `perfil_publico_asesor`, `datos_privados_estudiante`, `datos_privados_asesor`.
- Tesis/documentos: `tesis`, `asesores_tesis`, `documentos_tesis`, `estudiante_documentos`, `observaciones_tesis`, `modificaciones_tesis`, `historial_sugerencias_asesor`, `validaciones_sugerencia_asesor`, `eventos_validacion_sugerencia`.
- Reuniones/asesoría: `relaciones_asesor_estudiante`, `reuniones_asesor`, `disponibilidad_asesor`, `validation_cita`, `tarifas_asesor`, `codigos_publicos_asesor`.
- Pagos/planes: `pagos`, `pagos_asesor`, `pagos_plan`, `planes`, `planes_beneficios`, `beneficios_plan_catalogo`, `suscripciones_estudiante`, `suscripcion_beneficios_consumo`.
- Catálogos/otros: `universidades`, `programas`, `especialidades`, `tipos_tesis`, `tipos_sugerencia_asesor`, `modulos_lista`, `modulos_tesis`, `mensajes`, `historial_ia`, `actividad_log`, `notifications`, `leads_estudiantes`, `cola_google_meet`.

## 3. Funciones PostgreSQL Encontradas

- Auth/contexto heredado: `usuario_id`, `fn_crear_usuario_desde_auth`, varias funciones con `auth.uid()`. No son aptas aún sin migrar dependencia Supabase.
- Usuarios/perfiles: `guardar_perfil_estudiante`, `obtener_perfil_estudiante`, `guardar_perfil_asesor`, `obtener_perfil_publico_asesor`, `obtener_mi_rol`, `admin_listar_usuarios`, `obtener_asesores`.
- Tesis: `crear_mi_tesis`, `crear_tesis_con_plan`, `crear_tesis_y_pago_plan`, `obtener_mis_tesis`, `obtener_mi_tesis`, `obtener_tesis_asignadas_asesor`, `obtener_tesis_mis_asignadas`, `obtener_mis_tesis_con_asesores`, `asignar_mi_tesis_a_asesor`, `asignar_tesis_asesor`.
- Reuniones/disponibilidad: `crear_cita_estudiante_asesor`, `crear_cita_asesor_estudiante`, `crear_cita_asesoria`, `crear_asesoria_plan_o_pago`, `crear_presustentacion_plan_o_pago`, `cancelar_cita_estudiante`, `obtener_mis_citas_estudiante`, `obtener_mis_citas_asesor`, `obtener_detalle_cita_estudiante`, `obtener_horarios_disponibles_asesor`, `obtener_bloques_disponibles_asesor`, `crear_espacio_libre_asesor`, `desactivar_espacio_libre_asesor`.
- Pagos/planes: `fn_get_planes`, `fn_planes_disponibles`, `fn_iniciar_pago_plan`, `obtener_mis_pagos_estudiante`, `registrar_voucher_pago`, `subir_voucher_pago`, `admin_listar_pagos`, `admin_obtener_pago`, `admin_verificar_pago`, `admin_verificar_pago_plan`, `validar_pago_admin`.
- Documentos/sugerencias: `registrar_documento_tesis`, `get_estudiante_documentos`, `get_documentos_apoyo`, `obtener_documentos_mi_tesis`, `obtener_documentos_tesis_asignada`, `crear_observacion_tesis_enriquecida`, `listar_historial_observaciones_tesis`, `crear_sugerencia_asesor`, `registrar_sugerencia_asesor`, `listar_sugerencias_tesis`, `marcar_sugerencia_aplicada`, `validar_aplicacion_sugerencia`.
- Triggers/workers: `actualizar_fecha_modificacion`, `set_updated_at`, `fn_on_pago_before_insert_defaults`, `fn_on_pago_plan_pagado`, `fn_on_pago_reunion_pagado`, `fn_on_reunion_insert_set_costo`, `trg_reunion_set_defaults`, `trg_sync_validacion_sugerencia`, `tomar_cola_google_meet`, `guardar_resultado_google_meet`.

## 4. Mapa Función SQL → Endpoint NestJS Propuesto

- `POST /auth/register` → `fn_auth_crear_usuario` nueva.
- `POST /auth/login` → `fn_auth_login_usuario` nueva.
- `PATCH /auth/password` → `fn_auth_cambiar_contrasena` nueva.
- `GET /usuarios/me` → wrapper `fn_usuario_obtener_actual` usando `obtener_mi_rol` + perfiles.
- `PUT /usuarios/perfil/estudiante` → `guardar_perfil_estudiante`.
- `PUT /usuarios/perfil/asesor` → `guardar_perfil_asesor`.
- `GET /tesis` → `fn_tesis_listar_por_usuario`, wrapper sobre `obtener_mis_tesis` / `obtener_tesis_asignadas_asesor`.
- `GET /tesis/:id` → `fn_tesis_obtener_detalle` nueva o wrapper de consultas existentes.
- `POST /tesis` → `crear_mi_tesis` o `crear_tesis_y_pago_plan` según DTO.
- `GET /reuniones` → `fn_reunion_listar_por_usuario`, wrapper sobre `obtener_mis_citas_estudiante` / `obtener_mis_citas_asesor`.
- `POST /reuniones` → wrapper `fn_reunion_crear` sobre `crear_cita_estudiante_asesor` o `crear_asesoria_plan_o_pago`.
- `PATCH /reuniones/:id/cancelar` → `cancelar_cita_estudiante`.
- `GET /pagos` → `fn_pago_listar_por_usuario`, wrapper sobre `obtener_mis_pagos_estudiante` o admin según rol.
- `POST /pagos/:id/voucher` → `registrar_voucher_pago` o `subir_voucher_pago`.
- `PATCH /pagos/:id/verificar` → `admin_verificar_pago` / `validar_pago_admin`.
- `GET /documentos/tesis/:tesisId` → `obtener_documentos_mi_tesis` / `obtener_documentos_tesis_asignada`.
- `POST /documentos` → `registrar_documento_tesis`.
- `GET /planes` → `fn_planes_disponibles`.
- `GET /asesores` → `obtener_asesores`.

## 5. Funciones Faltantes a Crear o Normalizar

- Auth obligatorias: `fn_auth_crear_usuario`, `fn_auth_login_usuario`, `fn_auth_cambiar_contrasena`, `fn_auth_desactivar_usuario`.
- Contexto sin Supabase: crear helper `AT.current_auth_usuario_id()` basado en `current_setting('app.current_auth_usuario_id', true)` y reemplazar `auth.uid()` en funciones propias por ese helper.
- Wrappers API: `fn_usuario_obtener_actual`, `fn_tesis_listar_por_usuario`, `fn_tesis_obtener_detalle`, `fn_reunion_listar_por_usuario`, `fn_reunion_crear`, `fn_reunion_cancelar`, `fn_pago_listar_por_usuario`, `fn_pago_registrar`, `fn_pago_verificar`, `fn_documento_listar_por_tesis`, `fn_documento_actualizar_revision`.
- Modulos: faltan funciones API claras para `modulos_lista` y `modulos_tesis`; crear `fn_modulo_listar_por_tesis`, `fn_modulo_crear_para_tesis`, `fn_modulo_actualizar_estado`.
- Usuarios: falta función segura para listar/detallar usuarios no admin sin devolver datos sensibles.

## 6. Módulos NestJS a Crear

- Base: `database`, `common/guards`, `common/decorators`, `common/interfaces`.
- Seguridad: `auth` con JWT, DTOs, guards y roles.
- Dominio inicial: `usuarios`, `tesis`, `reuniones`, `pagos`, `documentos`.
- Dominio siguiente: `asesores`, `modulos`, `mensajes`, `ia`.
- `DatabaseService` debe usar `pg Pool`, `query(sql, params)` y un helper transaccional para setear `SET LOCAL app.current_auth_usuario_id = $jwt.auth_usuario_id` antes de llamar funciones privadas.

## 7. Orden de Implementación por Fases

1. Preparación SQL: crear `01_extensions.sql`, validar `pgcrypto`, mantener tablas existentes, retirar dependencia funcional de Supabase en auth/contexto.
2. Auth SQL: implementar `fn_auth_*` con `crypt()` y retornos seguros sin `contrasena_hash`.
3. Backend base: instalar dependencias, configurar `.env`, `ConfigModule`, `DatabaseModule`, `ValidationPipe`, JWT guard, roles guard y `CurrentUser`.
4. Auth NestJS: `POST /auth/login`, `POST /auth/register`, `PATCH /auth/password`, pruebas con credenciales reales.
5. Wrappers SQL API: normalizar funciones `fn_tesis_*`, `fn_reunion_*`, `fn_pago_*`, `fn_documento_*`, `fn_usuario_*`.
6. Módulos REST: crear controllers/services/DTOs por dominio llamando solo funciones SQL con parámetros `$1`, `$2`, etc.
7. Seguridad final: revisar que no haya Supabase client/Auth/RPC, que no salga `contrasena_hash`, que roles estén aplicados y que errores SQL no se filtren.
8. Validación: build, tests básicos, pruebas curl/Postman de login y rutas privadas.

## 8. Riesgos o Dudas Técnicas

- `schema_AT.sql` todavía depende fuertemente de `auth.uid()`; si no se reemplaza, las funciones fallarán fuera de Supabase.
- Hay RLS/policies heredadas con roles `authenticated`; con NestJS + `pg Pool` conviene desactivarlas o reescribirlas para el nuevo modelo, porque la autorización vivirá en funciones SQL + guards.
- El uso de `ruta_storage`, `url_archivo_drive` y triggers de Google Meet/Drive debe tratarse como integración externa, no Supabase Storage.
- Se encontró `md5()` para códigos de pago/códigos públicos, no para passwords; no debe usarse en autenticación.
- `schema_AT.sql` mezcla funciones, tablas y policies; conviene separar archivos nuevos por dominio sin inventar tablas nuevas.

## 9. Comandos Necesarios

```bash
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt pg class-validator class-transformer
npm install -D @types/passport-jwt @types/pg
```

```bash
psql "$DATABASE_URL" -f sql/01_extensions.sql
psql "$DATABASE_URL" -f sql/02_tables.sql
psql "$DATABASE_URL" -f sql/03_functions_auth.sql
psql "$DATABASE_URL" -f sql/04_functions_tesis.sql
psql "$DATABASE_URL" -f sql/05_functions_reuniones.sql
psql "$DATABASE_URL" -f sql/06_functions_pagos.sql
psql "$DATABASE_URL" -f sql/07_functions_documentos.sql
psql "$DATABASE_URL" -f sql/08_functions_modulos.sql
```

```bash
npm run build
npm run test
npm run start:dev
```

## 10. Supuestos

- No se implementa nada todavía.
- No se crean tablas nuevas salvo que una fase posterior demuestre que no existe equivalente.
- NestJS será la única capa consumida por React.
- PostgreSQL mantendrá la lógica fuerte; NestJS solo validará DTOs, autenticará, autorizará y llamará funciones SQL.
- La estrategia elegida para reemplazar Supabase es `AT.current_auth_usuario_id()` + `SET LOCAL app.current_auth_usuario_id`, no Supabase Auth ni Supabase RPC.
