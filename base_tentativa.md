-- =========================================================
-- SISTEMA DE ASESORÍA DE TESIS
-- ESQUEMA: AT
-- PostgreSQL / Supabase
-- =========================================================

CREATE SCHEMA IF NOT EXISTS "AT";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;

-- =========================================================
-- FUNCIÓN GENERAL PARA ACTUALIZAR actualizado_en
-- =========================================================
CREATE OR REPLACE FUNCTION "AT".actualizar_fecha_modificacion()
RETURNS trigger AS $$
BEGIN
NEW.actualizado_en = now();
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

-- =========================================================
-- USUARIOS
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_usuario_id uuid UNIQUE NOT NULL,
  rol varchar(20) NOT NULL CHECK (rol IN ('admin', 'asesor', 'estudiante')),
  verificado boolean DEFAULT false,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol
ON "AT".usuarios(rol);

CREATE TRIGGER trg_usuarios_actualizado_en
BEFORE UPDATE ON "AT".usuarios
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- UNIVERSIDADES
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".universidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(200) NOT NULL,
  ubicacion varchar(200),
  pais varchar(100),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE TRIGGER trg_universidades_actualizado_en
BEFORE UPDATE ON "AT".universidades
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- ESPECIALIDADES
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".especialidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(150) NOT NULL UNIQUE,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE TRIGGER trg_especialidades_actualizado_en
BEFORE UPDATE ON "AT".especialidades
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- PLANES
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".planes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar(150) NOT NULL,
  precio numeric(10,2) NOT NULL CHECK (precio >= 0),
  duracion_dias integer NOT NULL CHECK (duracion_dias > 0),
  caracteristicas jsonb,
  activo boolean DEFAULT true,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE TRIGGER trg_planes_actualizado_en
BEFORE UPDATE ON "AT".planes
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- PERFIL PÚBLICO DEL ASESOR
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".perfil_publico_asesor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asesor_id uuid NOT NULL UNIQUE REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  nombre_mostrar varchar(150) NOT NULL,
  universidad_id uuid REFERENCES "AT".universidades(id) ON DELETE SET NULL,
  slug varchar(150) UNIQUE NOT NULL,
  email_publico varchar(150),
  biografia text,
  foto_url text,
  especialidad_id uuid REFERENCES "AT".especialidades(id) ON DELETE SET NULL,
  carrera varchar(200),
  nivel_academico varchar(30) CHECK (
    nivel_academico IS NULL OR nivel_academico IN ('pregrado', 'maestria', 'doctorado')
  ),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE TRIGGER trg_perfil_publico_asesor_actualizado_en
BEFORE UPDATE ON "AT".perfil_publico_asesor
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- DATOS PRIVADOS DEL ASESOR
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".datos_privados_asesor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asesor_id uuid NOT NULL UNIQUE REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  nombres_encriptados text NOT NULL,
  apellidos_encriptados text NOT NULL,
  dni_encriptado text NOT NULL,
  telefono_encriptado text,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE TRIGGER trg_datos_privados_asesor_actualizado_en
BEFORE UPDATE ON "AT".datos_privados_asesor
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- PERFIL DEL ESTUDIANTE
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".perfil_estudiante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL UNIQUE REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  nombres varchar(150) NOT NULL,
  apellidos varchar(150) NOT NULL,
  universidad_id uuid REFERENCES "AT".universidades(id) ON DELETE SET NULL,
  carrera varchar(150),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE TRIGGER trg_perfil_estudiante_actualizado_en
BEFORE UPDATE ON "AT".perfil_estudiante
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- DATOS PRIVADOS DEL ESTUDIANTE
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".datos_privados_estudiante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL UNIQUE REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  dni_encriptado text NOT NULL,
  telefono_encriptado text,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE TRIGGER trg_datos_privados_estudiante_actualizado_en
BEFORE UPDATE ON "AT".datos_privados_estudiante
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- PROGRAMAS ACADÉMICOS
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".programas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  universidad_id uuid REFERENCES "AT".universidades(id) ON DELETE CASCADE,
  nivel varchar(30) NOT NULL CHECK (nivel IN ('pregrado', 'maestria', 'doctorado')),
  especialidad_id uuid REFERENCES "AT".especialidades(id) ON DELETE SET NULL,
  nombre varchar(200),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE TRIGGER trg_programas_actualizado_en
BEFORE UPDATE ON "AT".programas
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- SUSCRIPCIONES DEL ESTUDIANTE
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".suscripciones_estudiante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES "AT".planes(id) ON DELETE RESTRICT,
  estado varchar(20) NOT NULL CHECK (estado IN ('activo', 'expirado', 'cancelado')),
  iniciado_en timestamptz DEFAULT now(),
  expira_en timestamptz,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suscripciones_estudiante_estudiante
ON "AT".suscripciones_estudiante(estudiante_id);

CREATE TRIGGER trg_suscripciones_estudiante_actualizado_en
BEFORE UPDATE ON "AT".suscripciones_estudiante
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- CÓDIGOS PÚBLICOS DEL ASESOR
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".codigos_publicos_asesor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asesor_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  codigo_publico varchar(20) UNIQUE NOT NULL,
  activo boolean DEFAULT true,
  expira_en timestamptz,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_codigo_publico_asesor
ON "AT".codigos_publicos_asesor(codigo_publico);

CREATE TRIGGER trg_codigos_publicos_asesor_actualizado_en
BEFORE UPDATE ON "AT".codigos_publicos_asesor
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- RELACIÓN ASESOR - ESTUDIANTE
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".relaciones_asesor_estudiante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asesor_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  estudiante_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  codigo_publico_id uuid REFERENCES "AT".codigos_publicos_asesor(id) ON DELETE SET NULL,
  estado varchar(20) NOT NULL CHECK (estado IN ('pendiente', 'activo', 'cancelado', 'completado')),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now(),
  UNIQUE (asesor_id, estudiante_id)
);

CREATE INDEX IF NOT EXISTS idx_relacion_asesor
ON "AT".relaciones_asesor_estudiante(asesor_id);

CREATE INDEX IF NOT EXISTS idx_relacion_estudiante
ON "AT".relaciones_asesor_estudiante(estudiante_id);

CREATE TRIGGER trg_relaciones_asesor_estudiante_actualizado_en
BEFORE UPDATE ON "AT".relaciones_asesor_estudiante
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- TESIS
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".tesis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  universidad_id uuid REFERENCES "AT".universidades(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descripcion text,
  estado varchar(20) NOT NULL CHECK (estado IN ('borrador', 'en_progreso', 'revision', 'completado')),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now(),
  eliminado_en timestamptz
);

CREATE INDEX IF NOT EXISTS idx_tesis_estudiante
ON "AT".tesis(estudiante_id);

CREATE TRIGGER trg_tesis_actualizado_en
BEFORE UPDATE ON "AT".tesis
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- DOCUMENTOS DE TESIS
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".documentos_tesis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tesis_id uuid NOT NULL REFERENCES "AT".tesis(id) ON DELETE CASCADE,
  subido_por uuid REFERENCES "AT".usuarios(id) ON DELETE SET NULL,
  nombre_archivo varchar(255),
  url_archivo_drive text,
  carpeta_drive_id text,
  documento_drive_id text,
  version integer DEFAULT 1,
  estado_revision varchar(20) CHECK (estado_revision IN ('pendiente', 'aprobado', 'rechazado')),
  comentario_revision text,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documentos_tesis_tesis
ON "AT".documentos_tesis(tesis_id);

CREATE TRIGGER trg_documentos_tesis_actualizado_en
BEFORE UPDATE ON "AT".documentos_tesis
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- MÓDULOS BASE / PLANTILLAS
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".modulos_lista (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  universidad_id uuid REFERENCES "AT".universidades(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  detalle text,
  estructura jsonb NOT NULL,
  prioridad integer DEFAULT 1,
  estado varchar(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modulos_lista_universidad
ON "AT".modulos_lista(universidad_id);

CREATE TRIGGER trg_modulos_lista_actualizado_en
BEFORE UPDATE ON "AT".modulos_lista
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- AVANCE DE LA TESIS POR MÓDULO
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".modulos_tesis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tesis_id uuid NOT NULL REFERENCES "AT".tesis(id) ON DELETE CASCADE,
  modulo_lista_id uuid NOT NULL REFERENCES "AT".modulos_lista(id) ON DELETE CASCADE,
  estado varchar(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado')),
  progreso integer DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  observacion text,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now(),
  UNIQUE (tesis_id, modulo_lista_id)
);

CREATE INDEX IF NOT EXISTS idx_modulos_tesis_tesis
ON "AT".modulos_tesis(tesis_id);

CREATE TRIGGER trg_modulos_tesis_actualizado_en
BEFORE UPDATE ON "AT".modulos_tesis
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- PAGOS
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pagador_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  concepto varchar(200),
  monto numeric(10,2) NOT NULL CHECK (monto >= 0),
  estado varchar(20) NOT NULL CHECK (estado IN ('pendiente', 'pagado', 'fallido', 'reembolsado')),
  codigo_operacion varchar(150),
  metadata jsonb,
  verificado_por uuid REFERENCES "AT".usuarios(id) ON DELETE SET NULL,
  verificado_en timestamptz,
  nota_verificacion text,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagos_pagador
ON "AT".pagos(pagador_id);

CREATE TRIGGER trg_pagos_actualizado_en
BEFORE UPDATE ON "AT".pagos
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- PAGOS DE PLAN
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".pagos_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pago_id uuid NOT NULL REFERENCES "AT".pagos(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES "AT".planes(id) ON DELETE CASCADE,
  creado_en timestamptz DEFAULT now(),
  UNIQUE (pago_id, plan_id)
);

-- =========================================================
-- PAGOS AL ASESOR
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".pagos_asesor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pago_id uuid NOT NULL REFERENCES "AT".pagos(id) ON DELETE CASCADE,
  asesor_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  creado_en timestamptz DEFAULT now(),
  UNIQUE (pago_id, asesor_id)
);

-- =========================================================
-- OBSERVACIONES DE TESIS
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".observaciones_tesis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tesis_id uuid NOT NULL REFERENCES "AT".tesis(id) ON DELETE CASCADE,
  documento_tesis_id uuid REFERENCES "AT".documentos_tesis(id) ON DELETE SET NULL,
  asesor_id uuid REFERENCES "AT".usuarios(id) ON DELETE SET NULL,
  texto text NOT NULL,
  creado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_observaciones_tesis_tesis
ON "AT".observaciones_tesis(tesis_id);

-- =========================================================
-- HISTORIAL DE SUGERENCIAS DEL ASESOR
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".historial_sugerencias_asesor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tesis_id uuid NOT NULL REFERENCES "AT".tesis(id) ON DELETE CASCADE,
  asesor_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  documento_tesis_id uuid REFERENCES "AT".documentos_tesis(id) ON DELETE SET NULL,
  sugerencia text NOT NULL,
  aplicado boolean DEFAULT false,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_historial_sugerencias_tesis
ON "AT".historial_sugerencias_asesor(tesis_id);

CREATE TRIGGER trg_historial_sugerencias_asesor_actualizado_en
BEFORE UPDATE ON "AT".historial_sugerencias_asesor
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- MODIFICACIONES DE TESIS
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".modificaciones_tesis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tesis_id uuid NOT NULL REFERENCES "AT".tesis(id) ON DELETE CASCADE,
  descripcion text NOT NULL,
  precio numeric(10,2) NOT NULL CHECK (precio >= 0),
  estado varchar(20) NOT NULL CHECK (estado IN ('pendiente', 'pagado', 'en_proceso', 'completado', 'cancelado')),
  pago_id uuid REFERENCES "AT".pagos(id) ON DELETE SET NULL,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now(),
  eliminado_en timestamptz
);

CREATE INDEX IF NOT EXISTS idx_modificaciones_tesis_tesis
ON "AT".modificaciones_tesis(tesis_id);

CREATE TRIGGER trg_modificaciones_tesis_actualizado_en
BEFORE UPDATE ON "AT".modificaciones_tesis
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- TARIFAS DEL ASESOR
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".tarifas_asesor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asesor_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  nombre varchar(150) NOT NULL,
  descripcion text,
  duracion_minutos integer NOT NULL CHECK (duracion_minutos > 0),
  precio numeric(10,2) NOT NULL CHECK (precio >= 0),
  moneda varchar(10) DEFAULT 'PEN',
  activo boolean DEFAULT true,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tarifas_asesor_asesor
ON "AT".tarifas_asesor(asesor_id);

CREATE TRIGGER trg_tarifas_asesor_actualizado_en
BEFORE UPDATE ON "AT".tarifas_asesor
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- DISPONIBILIDAD DEL ASESOR
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".disponibilidad_asesor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asesor_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  -- rango horario base
  inicio timestamptz NOT NULL,
  fin timestamptz NOT NULL,
  -- configuración de bloques
  usa_bloques boolean DEFAULT true,
  duracion_bloque_minutos integer DEFAULT 30 CHECK (duracion_bloque_minutos > 0),
  -- recurrencia
  recurrente boolean DEFAULT false,
  dia_semana integer CHECK (dia_semana BETWEEN 0 AND 6), -- 0 domingo, 1 lunes...
  fecha_inicio date,
  fecha_fin date,
  -- control
  disponible boolean DEFAULT true,
  activo boolean DEFAULT true,
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now(),
  CHECK (fin > inicio),
  CHECK (
    recurrente = false
    OR dia_semana IS NOT NULL
  ),
  CHECK (
    fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio
  )
);


CREATE INDEX IF NOT EXISTS idx_disponibilidad_asesor
ON "AT".disponibilidad_asesor(asesor_id);

CREATE TRIGGER trg_disponibilidad_asesor_actualizado_en
BEFORE UPDATE ON "AT".disponibilidad_asesor
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- REUNIONES ENTRE ASESOR Y ESTUDIANTE
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".reuniones_asesor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disponibilidad_id uuid REFERENCES "AT".disponibilidad_asesor(id) ON DELETE SET NULL,
  asesor_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  estudiante_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  tesis_id uuid REFERENCES "AT".tesis(id) ON DELETE SET NULL,
  tarifa_id uuid REFERENCES "AT".tarifas_asesor(id) ON DELETE SET NULL,
  estado varchar(20) NOT NULL CHECK (estado IN ('pendiente','confirmado','cancelado','completado')),
  pago_id uuid REFERENCES "AT".pagos(id) ON DELETE SET NULL,
  motivo text,
  notas text,
  modalidad varchar(20) CHECK (modalidad IN ('virtual','presencial')),
  lugar text,
  enlace_reunion text,
  inicio timestamptz NOT NULL,
  fin timestamptz NOT NULL,
  duracion_minutos integer NOT NULL CHECK (duracion_minutos > 0),
  costo_reunion numeric(10,2) NOT NULL CHECK (costo_reunion >= 0),
  moneda varchar(10) DEFAULT 'PEN',
  creado_en timestamptz DEFAULT now(),
  actualizado_en timestamptz DEFAULT now(),
  CHECK (fin > inicio)
);

CREATE INDEX IF NOT EXISTS idx_reuniones_asesor_asesor
ON "AT".reuniones_asesor(asesor_id);

CREATE INDEX IF NOT EXISTS idx_reuniones_asesor_estudiante
ON "AT".reuniones_asesor(estudiante_id);

CREATE INDEX IF NOT EXISTS idx_reuniones_asesor_tesis
ON "AT".reuniones_asesor(tesis_id);

CREATE TRIGGER trg_reuniones_asesor_actualizado_en
BEFORE UPDATE ON "AT".reuniones_asesor
FOR EACH ROW
EXECUTE FUNCTION "AT".actualizar_fecha_modificacion();

-- =========================================================
-- MENSAJES / CHAT INTERNO
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".mensajes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tesis_id uuid REFERENCES "AT".tesis(id) ON DELETE CASCADE,
  remitente_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  destinatario_id uuid REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  mensaje text NOT NULL,
  leido boolean DEFAULT false,
  creado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mensajes_tesis
ON "AT".mensajes(tesis_id);

CREATE INDEX IF NOT EXISTS idx_mensajes_remitente
ON "AT".mensajes(remitente_id);

-- =========================================================
-- HISTORIAL DE IA
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".historial_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES "AT".usuarios(id) ON DELETE CASCADE,
  tesis_id uuid REFERENCES "AT".tesis(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  respuesta text,
  tokens_usados integer DEFAULT 0,
  modelo varchar(100),
  embedding vector(1536),
  creado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_historial_ia_usuario
ON "AT".historial_ia(usuario_id);

CREATE INDEX IF NOT EXISTS idx_historial_ia_tesis
ON "AT".historial_ia(tesis_id);

-- =========================================================
-- LOG DE ACTIVIDAD / AUDITORÍA
-- =========================================================
CREATE TABLE IF NOT EXISTS "AT".actividad_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES "AT".usuarios(id) ON DELETE SET NULL,
  accion varchar(150) NOT NULL,
  tabla_afectada varchar(150),
  registro_id uuid,
  metadata jsonb,
  creado_en timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_actividad_log_usuario
ON "AT".actividad_log(usuario_id);
$$
