# ENDPOINTS PARA FRONTEND REACT

## Auth Registro

Endpoint:
POST /auth/register

Auth:
No

Headers:

```json
{
  "Content-Type": "application/json"
}
```

Body:

```json
{
  "email": "usuario@email.com",
  "rol": "estudiante",
  "contrasena": "app_theseis"
}
```

## Auth Login

Endpoint:
POST /auth/login

Auth:
No

Headers:

```json
{
  "Content-Type": "application/json"
}
```

Body:

```json
{
  "email": "usuario@email.com",
  "contrasena": "app_theseis"
}
```

## Auth Cambiar contraseña

Endpoint:
PATCH /auth/password

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "contrasenaActual": "app_theseis",
  "contrasenaNueva": "nueva_contrasena"
}
```

## Usuarios Obtener usuario actual

Endpoint:
GET /usuarios/me

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

## Usuarios Guardar perfil estudiante

Endpoint:
PUT /usuarios/perfil/estudiante

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "universidadId": "uuid",
  "carrera": "Ingeniería",
  "dni": "12345678",
  "telefono": "999999999"
}
```

## Usuarios Guardar perfil asesor

Endpoint:
PUT /usuarios/perfil/asesor

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "nombreMostrar": "Dr. Juan Pérez",
  "universidadId": "uuid",
  "slug": "juan-perez",
  "emailPublico": "asesor@email.com",
  "biografia": "Texto",
  "fotoUrl": "https://...",
  "especialidadId": "uuid",
  "carrera": "Ingeniería",
  "nivelAcademico": "maestria",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "dni": "12345678",
  "telefono": "999999999"
}
```

## Tesis Listar tesis

Endpoint:
GET /tesis

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

## Tesis Obtener detalle

Endpoint:
GET /tesis/:id

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

## Tesis Crear tesis

Endpoint:
POST /tesis

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "universidadId": "uuid",
  "titulo": "Título de tesis",
  "descripcion": "Descripción"
}
```

## Tesis Actualizar estado

Endpoint:
PATCH /tesis/:id/estado

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "estado": "en_progreso"
}
```

## Asesores Listar asesores

Endpoint:
GET /asesores

Auth:
No

Headers:

```json
{
  "Content-Type": "application/json"
}
```

## Reuniones Listar reuniones

Endpoint:
GET /reuniones?fechaInicio=2026-05-01T00:00:00.000Z&fechaFin=2026-05-31T23:59:59.000Z

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

## Reuniones Crear reunión

Endpoint:
POST /reuniones

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "disponibilidadId": "uuid",
  "inicio": "2026-05-10T15:00:00.000Z",
  "fin": "2026-05-10T15:30:00.000Z",
  "tesisId": "uuid",
  "motivo": "Asesoría",
  "modalidad": "virtual",
  "lugar": null,
  "enlaceReunion": null,
  "notas": "Texto"
}
```

## Reuniones Cancelar reunión

Endpoint:
PATCH /reuniones/:id/cancelar

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "motivo": "Motivo de cancelación"
}
```

## Documentos Listar documentos por tesis

Endpoint:
GET /documentos/tesis/:tesisId

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

## Documentos Registrar documento

Endpoint:
POST /documentos

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "tesisId": "uuid",
  "nombreArchivo": "documento.pdf",
  "urlArchivoDrive": "https://...",
  "carpetaDriveId": "drive-folder-id",
  "documentoDriveId": "drive-file-id",
  "version": 1,
  "tipoMime": "application/pdf",
  "tamanoBytes": 1024
}
```

## Documentos Actualizar revisión

Endpoint:
PATCH /documentos/:id/revision

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "estadoRevision": "aprobado",
  "comentarioRevision": "Comentario"
}
```

## Pagos Listar pagos

Endpoint:
GET /pagos

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

## Pagos Registrar pago

Endpoint:
POST /pagos

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "concepto": "Pago de plan",
  "monto": 100,
  "tesisId": "uuid",
  "metadata": {}
}
```

## Pagos Registrar voucher

Endpoint:
POST /pagos/:id/voucher

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "codigoOperacion": "ABC123",
  "documentoDriveId": "drive-file-id",
  "urlArchivoDrive": "https://...",
  "nombreArchivoVoucher": "voucher.pdf",
  "tipoMimeVoucher": "application/pdf",
  "tamanoBytesVoucher": 1024,
  "metadata": {}
}
```

## Pagos Verificar pago

Endpoint:
PATCH /pagos/:id/verificar

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "aprobado": true,
  "notaVerificacion": "Pago validado"
}
```

## Planes Listar planes

Endpoint:
GET /planes

Auth:
No

Headers:

```json
{
  "Content-Type": "application/json"
}
```

Response:

```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Esencial",
      "precio": "0.00",
      "duracion_dias": 180,
      "caracteristicas": {
        "descripcion": "Acceso base al sistema",
        "incluye_ai_tool": true,
        "asesorias_incluidas": 0,
        "presustentaciones_incluidas": 0
      }
    }
  ]
}
```

## Planes Cotizar tesis con plan

Endpoint:
POST /planes/cotizar

Auth:
No

Headers:

```json
{
  "Content-Type": "application/json"
}
```

Body:

```json
{
  "planId": "uuid",
  "tipoTesisId": "uuid",
  "nivelAcademico": "PREGRADO|MAESTRIA|ESPECIALIDAD|DOCTORADO",
  "requiereAnalisisEstadistico": true
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "plan_id": "uuid",
    "plan_nombre": "Esencial",
    "tipo_tesis_id": "uuid",
    "tipo_tesis_codigo": "ING",
    "tipo_tesis_nombre": "Ingeniería",
    "nivel_academico": "PREGRADO",
    "precio_base": 2000.0,
    "porcentaje_nivel": 0,
    "monto_ajuste_nivel": 0.0,
    "descuento_analisis_estadistico": 0.0,
    "precio_total": 2000.0,
    "moneda": "PEN"
  }
}
```

## Planes Comprar plan

Endpoint:
POST /planes/comprar

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "planId": "uuid"
}
```

## Módulos Listar módulos por tesis

Endpoint:
GET /modulos/tesis/:tesisId

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

## Módulos Crear módulo para tesis

Endpoint:
POST /modulos/tesis/:tesisId

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "moduloListaId": "uuid"
}
```

## Módulos Actualizar módulo

Endpoint:
PATCH /modulos/:id

Auth:
Sí

Headers:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

Body:

```json
{
  "estado": "en_progreso",
  "progreso": 50,
  "observacion": "Texto"
}
```

## Mensajes Sin endpoints implementados

Endpoint:
No encontrado

Auth:
No

Headers:

```json
{
  "Content-Type": "application/json"
}
```

## IA Sin endpoints implementados

Endpoint:
No encontrado

Auth:
No

Headers:

```json
{
  "Content-Type": "application/json"
}
```

# EXTRAS NO DOCUMENTADOS

Implementado. Dejé montada la migración base NestJS + PostgreSQL sin Supabase.

**Qué quedó hecho**

- Dependencias instaladas: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `pg`, `class-validator`, `class-transformer` y tipos.
- SQL nuevo por fases:
  - [sql/01_extensions.sql](/media/iuvade/f82c635f-24d6-435b-961b-652be2b66b771/TRABAJO/AEIA/thesis/thesis-backend/sql/01_extensions.sql)
  - [sql/03_functions_auth.sql](/media/iuvade/f82c635f-24d6-435b-961b-652be2b66b771/TRABAJO/AEIA/thesis/thesis-backend/sql/03_functions_auth.sql)
  - wrappers `fn_tesis_*`, `fn_reunion_*`, `fn_pago_*`, `fn_documento_*`, `fn_modulo_*`.
- Backend base:
  - [src/database/database.service.ts](/media/iuvade/f82c635f-24d6-435b-961b-652be2b66b771/TRABAJO/AEIA/thesis/thesis-backend/src/database/database.service.ts) con `pg Pool`, `query()` y contexto transaccional `set_config('app.current_auth_usuario_id', ...)`.
  - JWT strategy, guards, roles decorator y current user decorator.
  - `ValidationPipe` global en [src/main.ts](/media/iuvade/f82c635f-24d6-435b-961b-652be2b66b771/TRABAJO/AEIA/thesis/thesis-backend/src/main.ts).
- Módulos REST creados: `auth`, `usuarios`, `tesis`, `reuniones`, `pagos`, `documentos`, `asesores`, `modulos`, `planes`.
- `.env.example` agregado con las variables esperadas.

**Nota importante**
Agregué `AT.current_auth_usuario_id()` y una función local `auth.uid()` de compatibilidad para que funciones heredadas que aún llaman `auth.uid()` puedan funcionar fuera de Supabase. No usa Supabase Auth ni cliente Supabase; solo resuelve desde la variable de sesión seteada por NestJS.

**Verificación**

- `npm run build` pasó.
- `npx eslint "{src,apps,libs,test}/**/*.ts"` pasó.
- `npx jest --watchman=false` pasó.
- `npm run test` falló inicialmente por Watchman/socket del sandbox, no por tests.
