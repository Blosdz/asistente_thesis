# Ground Rules + Endpoints del módulo Estudiante

## 1. Propósito

Este documento define las **reglas base**, la **arquitectura funcional** y la **primera propuesta de endpoints** para el lado **Estudiante** del proyecto de tesis/plataforma académica.

La meta es dejar una base clara para que luego el frontend en **React** se conecte con servicios en **Supabase** de manera ordenada, consistente y escalable.

> **Nota importante**: pediste que todo quede **estrictamente inspirado en `webInspiration/`**. En este entorno no tengo acceso directo a esa carpeta, así que esta versión toma como base los módulos y flujos que ya describiste. En cuanto compartas esa carpeta o capturas de sus vistas, este MD se puede alinear al 100% con su navegación, naming visual y jerarquía de pantallas.

---

## 2. Módulos de navegación del Estudiante

La navegación del estudiante debe girar alrededor de estos módulos principales:

1. **Documento**
2. **Observaciones**
3. **Servicios**
4. **Estadística**

### 2.1 Documento
Este módulo será el núcleo del flujo del estudiante.

Debe permitir:
- subir archivo de tesis en **DOCX**
- listar versiones/subidas del documento
- previsualizar el documento mediante **snapshot** del proyecto/documento subido en **Google Drive**
- marcar cuál es la versión actual
- consultar metadata del documento
- ver estado del documento dentro del proceso

### 2.2 Observaciones
Este módulo concentra la interacción académica entre estudiante y asesor.

Debe permitir:
- ver observaciones del asesor
- responder observaciones
- enviar mensaje al asesor
- ver historial de mensajes/comentarios
- diferenciar observaciones pendientes, atendidas y resueltas

### 2.3 Servicios
Este módulo concentra las solicitudes formales del estudiante.

Debe permitir:
- solicitar asesor
- solicitar presustentación
- ver estado de solicitudes
- listar servicios solicitados
- ver requisitos o condiciones previas por servicio

### 2.4 Estadística
Este módulo resume el avance del estudiante en su proceso.

Debe permitir:
- porcentaje de avance del expediente
- cantidad de observaciones pendientes
- cantidad de versiones del documento
- estado del asesor asignado
- estado de solicitudes activas
- timeline o resumen del proceso

---

## 3. Ground Rules del proyecto

## 3.1 Reglas funcionales

### 3.1.1 Documento
- El archivo oficial del trabajo del estudiante será **DOCX**.
- No se usará Google Docs como fuente principal de edición del flujo institucional.
- Toda nueva subida de documento debe registrarse como una **nueva versión**.
- Solo una versión puede estar marcada como **versión actual**.
- La metadata del documento debe conservarse en plataforma.
- El sistema debe permitir previsualización mediante **snapshot** del proyecto/documento alojado en Google Drive, pero el archivo fuente oficial sigue siendo **DOCX**.

### 3.1.2 Observaciones
- Toda observación del asesor debe quedar asociada a una versión del documento o a una sección del proceso.
- El estudiante puede responder observaciones, pero no eliminarlas.
- Las observaciones deben tener estado mínimo: `pendiente`, `respondida`, `resuelta`.
- Los mensajes entre estudiante y asesor deben quedar registrados con fecha, autor y contexto.

### 3.1.3 Servicios
- Las solicitudes del estudiante no deben ejecutarse si faltan prerequisitos.
- Cada servicio debe dejar una trazabilidad clara de estado.
- Estados mínimos recomendados para un servicio: `borrador`, `enviado`, `en_revision`, `aprobado`, `rechazado`, `anulado`.
- La solicitud de presustentación debe validar previamente si existe documento actual cargado.
- La solicitud de asesor debe validar si el estudiante ya tiene asesor activo o si puede pedir cambio.

### 3.1.4 Estadística
- La estadística del estudiante debe ser solo de lectura desde frontend.
- Las métricas deben construirse desde datos transaccionales reales.
- No debe haber datos duplicados entre tablas de detalle y tablas resumen sin justificación.

---

## 3.2 Reglas técnicas

### 3.2.1 Convenciones de API
- Todos los endpoints del estudiante deben empezar con prefijo:
  - `/api/student/...`
- Las respuestas deben ser consistentes.
- Formato base de respuesta:

```json
{
  "success": true,
  "message": "Operación realizada correctamente",
  "data": {}
}
```

- Formato base para errores:

```json
{
  "success": false,
  "message": "Descripción del error",
  "error_code": "STUDENT_DOCUMENT_NOT_FOUND",
  "data": null
}
```

### 3.2.2 Autenticación
- Todo endpoint del estudiante requiere sesión válida.
- El `student_id` no debe confiarse solo desde el frontend.
- Debe inferirse desde la sesión/JWT cuando sea posible.
- En Supabase, la seguridad debe reforzarse con **RLS**.

### 3.2.3 Autorización
- El estudiante solo puede ver y modificar su propia información.
- No puede ver observaciones de otro estudiante.
- No puede subir documento para otro expediente.
- No puede aprobar sus propios servicios.

### 3.2.4 Soft delete y trazabilidad
- Evitar borrado físico si afecta trazabilidad.
- Para mensajes, observaciones y solicitudes, usar estados o campos lógicos antes que eliminar definitivamente.
- Registrar `created_at`, `updated_at`, `created_by`, `updated_by` donde aplique.

### 3.2.5 Versionado
- Documento, observaciones y solicitudes deben tener historial cuando el negocio lo requiera.
- El historial de documento es obligatorio.
- La relación entre observación y versión del documento es altamente recomendable.

---

## 4. Estructura funcional sugerida para React

```text
/student
  /dashboard
  /document
  /document/:documentId/preview
  /observations
  /messages
  /services
  /services/request-advisor
  /services/request-pre-defense
  /statistics
```

---

## 5. Endpoints propuestos para el Estudiante

## 5.1 Documento

### `GET /api/student/document/current`
Obtiene el documento actual del estudiante.

**Response**
```json
{
  "success": true,
  "data": {
    "document_id": "doc_001",
    "title": "Tesis Final",
    "file_name": "tesis_v3.docx",
    "file_url": "...",
    "preview_url": "...",
    "version": 3,
    "status": "uploaded",
    "uploaded_at": "2026-03-17T10:00:00Z"
  }
}
```

### `GET /api/student/documents`
Lista todas las versiones del documento del estudiante.

**Query params opcionales**
- `page`
- `limit`
- `status`

### `POST /api/student/documents`
Sube una nueva versión del documento.

**Body sugerido**
- `file` (multipart/form-data)
- `title`
- `description` opcional

**Response esperada**
```json
{
  "success": true,
  "message": "Documento subido correctamente",
  "data": {
    "document_id": "doc_004",
    "version": 4,
    "is_current": true
  }
}
```

### `GET /api/student/documents/:documentId`
Obtiene el detalle de una versión específica.

### `GET /api/student/documents/:documentId/preview`
Obtiene la información de previsualización de una versión específica.

**Objetivo**
- mostrar un **snapshot** del proyecto/documento subido en Google Drive
- no editar desde esta vista
- usar esta vista solo como referencia visual rápida del contenido cargado

**Response**
```json
{
  "success": true,
  "data": {
    "document_id": "doc_004",
    "preview_type": "google_drive_snapshot",
    "preview_url": "...",
    "snapshot_generated_at": "2026-03-17T10:20:00Z",
    "source": {
      "provider": "google_drive",
      "file_id": "drive_file_123"
    }
  }
}
```

### `GET /api/student/documents/:documentId/metadata`
Obtiene la metadata de una versión específica del documento.

**Response**
```json
{
  "success": true,
  "data": {
    "document_id": "doc_004",
    "file_name": "tesis_v4.docx",
    "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "file_size": 2483921,
    "version": 4,
    "is_current": true,
    "uploaded_at": "2026-03-17T10:00:00Z",
    "storage_provider": "supabase_storage",
    "drive_snapshot_enabled": true
  }
}
```

### `PATCH /api/student/documents/:documentId/current`
Marca una versión como la versión actual del estudiante.

**Body**
```json
{
  "is_current": true
}
```

### `GET /api/student/documents/:documentId/status`
Consulta el estado del documento dentro del proceso académico.

**Response**
```json
{
  "success": true,
  "data": {
    "document_id": "doc_004",
    "status": "under_review",
    "status_label": "En revisión",
    "advisor_review_required": true,
    "last_status_change_at": "2026-03-17T11:00:00Z"
  }
}
```

### `GET /api/student/documents/:documentId/preview`
Devuelve la información necesaria para previsualizar el DOCX.

**Notas**
- Puede devolver HTML procesado, JSON estructurado o URL de preview ya generada.
- El DOCX sigue siendo el archivo fuente oficial.

### `PATCH /api/student/documents/:documentId/set-current`
Marca una versión como la versión actual.

### `GET /api/student/documents/:documentId/download`
Descarga la versión específica del documento.

### `GET /api/student/document/status`
Resume el estado académico/operativo del documento del estudiante.

**Ejemplo**
```json
{
  "success": true,
  "data": {
    "has_document": true,
    "current_version": 4,
    "has_pending_observations": true,
    "last_upload_at": "2026-03-17T10:00:00Z"
  }
}
```

---

## 5.2 Observaciones

### `GET /api/student/observations`
Lista observaciones del estudiante.

**Filtros opcionales**
- `status=pending|responded|resolved`
- `document_id`
- `page`
- `limit`

### `GET /api/student/observations/:observationId`
Detalle de una observación.

### `POST /api/student/observations/:observationId/reply`
Permite responder una observación del asesor.

**Body**
```json
{
  "message": "Se corrigió el capítulo 2 según la indicación.",
  "attachments": []
}
```

### `PATCH /api/student/observations/:observationId/mark-resolved`
Solicita marcar una observación como atendida por el estudiante.

> El cierre definitivo puede depender del asesor.

### `GET /api/student/observation-summary`
Retorna resumen rápido de observaciones.

**Ejemplo**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "pending": 4,
    "responded": 5,
    "resolved": 3
  }
}
```

---

## 5.3 Mensajería con asesor

### `GET /api/student/advisor/messages`
Lista conversaciones o mensajes con el asesor.

### `POST /api/student/advisor/messages`
Envía mensaje al asesor.

**Body**
```json
{
  "message": "Profesor, ya subí la nueva versión del documento.",
  "related_document_id": "doc_004",
  "related_observation_id": null
}
```

### `GET /api/student/advisor/messages/:messageId`
Detalle de mensaje o hilo.

### `PATCH /api/student/advisor/messages/:messageId/read`
Marca mensaje como leído.

---

## 5.4 Servicios

### `GET /api/student/services`
Lista catálogo de servicios disponibles para el estudiante.

**Ejemplo**
```json
{
  "success": true,
  "data": [
    {
      "service_code": "REQUEST_ADVISOR",
      "name": "Solicitar asesor",
      "enabled": true
    },
    {
      "service_code": "REQUEST_PRE_DEFENSE",
      "name": "Solicitar presustentación",
      "enabled": true
    }
  ]
}
```

### `GET /api/student/service-requests`
Lista solicitudes realizadas por el estudiante.

### `POST /api/student/service-requests/request-advisor`
Registra solicitud de asesor.

**Body sugerido**
```json
{
  "reason": "Requiero asignación de asesor para continuar mi proyecto.",
  "preferred_area": "Ingeniería de Software",
  "preferred_advisor_id": null
}
```

### `POST /api/student/service-requests/request-pre-defense`
Registra solicitud de presustentación.

**Body sugerido**
```json
{
  "notes": "El documento se encuentra actualizado y listo para evaluación previa."
}
```

### `GET /api/student/service-requests/:requestId`
Detalle de una solicitud.

### `PATCH /api/student/service-requests/:requestId/cancel`
Permite anular una solicitud mientras siga en estado compatible.

---

## 5.5 Estadística

### `GET /api/student/statistics/overview`
Obtiene panel resumen del estudiante.

**Ejemplo**
```json
{
  "success": true,
  "data": {
    "progress_percent": 68,
    "current_document_version": 4,
    "pending_observations": 4,
    "resolved_observations": 3,
    "active_requests": 1,
    "advisor_assigned": true,
    "last_activity_at": "2026-03-17T12:00:00Z"
  }
}
```

### `GET /api/student/statistics/timeline`
Devuelve eventos del proceso del estudiante en orden cronológico.

### `GET /api/student/statistics/checklist`
Devuelve checklist de cumplimiento de etapas.

**Ejemplo**
```json
{
  "success": true,
  "data": [
    {
      "code": "DOC_UPLOADED",
      "label": "Documento cargado",
      "completed": true
    },
    {
      "code": "ADVISOR_ASSIGNED",
      "label": "Asesor asignado",
      "completed": true
    },
    {
      "code": "PRE_DEFENSE_REQUESTED",
      "label": "Presustentación solicitada",
      "completed": false
    }
  ]
}
```

---

## 6. Contratos mínimos de datos sugeridos

## 6.1 Tabla `student_documents`
Campos sugeridos:
- `id`
- `student_id`
- `title`
- `file_name`
- `storage_path`
- `preview_path`
- `mime_type`
- `version_number`
- `is_current`
- `status`
- `metadata_json`
- `created_at`
- `updated_at`

## 6.2 Tabla `student_observations`
Campos sugeridos:
- `id`
- `student_id`
- `advisor_id`
- `document_id`
- `type`
- `content`
- `status`
- `resolved_at`
- `created_at`
- `updated_at`

## 6.3 Tabla `student_observation_replies`
Campos sugeridos:
- `id`
- `observation_id`
- `student_id`
- `message`
- `attachments_json`
- `created_at`

## 6.4 Tabla `student_advisor_messages`
Campos sugeridos:
- `id`
- `student_id`
- `advisor_id`
- `message`
- `related_document_id`
- `related_observation_id`
- `is_read`
- `created_at`

## 6.5 Tabla `student_service_requests`
Campos sugeridos:
- `id`
- `student_id`
- `service_code`
- `status`
- `payload_json`
- `review_notes`
- `created_at`
- `updated_at`

---

## 7. Reglas específicas para Supabase

- Guardar archivos DOCX en **Supabase Storage**.
- Guardar metadata y versionado en tablas relacionales.
- Aplicar **RLS** por `auth.uid()`.
- Separar claramente:
  - bucket de documentos fuente
  - bucket de previews si se generan derivados
- Las funciones de negocio complejas pueden resolverse con:
  - **Edge Functions**, o
  - RPC/SQL functions en Postgres, según convenga.

---

## 8. Reglas para la integración en React

- Centralizar endpoints en un solo cliente API.
- No mezclar lógica de UI con contratos HTTP.
- Definir tipos por módulo:
  - `StudentDocument`
  - `StudentObservation`
  - `StudentServiceRequest`
  - `StudentStatisticsOverview`
- Manejar estados visuales mínimos:
  - loading
  - empty
  - error
  - success
- La navegación debe reflejar exactamente los cuatro módulos base descritos.

---

## 9. MVP recomendado

Para una primera etapa, implementar primero estos endpoints:

1. `GET /api/student/document/current`
2. `POST /api/student/documents`
3. `GET /api/student/observations`
4. `POST /api/student/advisor/messages`
5. `GET /api/student/services`
6. `POST /api/student/service-requests/request-advisor`
7. `POST /api/student/service-requests/request-pre-defense`
8. `GET /api/student/statistics/overview`

Con eso ya se puede montar un frontend funcional de estudiante bastante sólido.

---

## 10. Siguiente paso sugerido

Una vez validado este MD, el siguiente documento debería ser:

1. **mapa de rutas React**
2. **tipos TypeScript**
3. **payloads exactos para Supabase**
4. **tablas SQL / schema inicial**
5. **RLS policies por módulo**

