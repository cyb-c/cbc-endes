-- ============================================================================
-- Schema SQL: Sistema de Auditoría de Eventos para Cloudflare D1
-- ============================================================================
-- Versión: 1.0
-- Fecha: 27 de marzo de 2026
-- Propósito: Tabla de auditoría tipo event stream genérica y reutilizable
-- ============================================================================

-- ============================================================================
-- Tabla Principal: pipeline_eventos
-- ============================================================================
-- Descripción: Tabla append-only para registrar eventos de procesamiento
-- Patrón: Event stream (solo INSERT, nunca UPDATE ni DELETE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pipeline_eventos (
  -- Identificador único autoincremental
  id          INTEGER PRIMARY KEY,

  -- Clave de correlación del proceso (ej: UUID de proceso)
  -- NOT NULL: siempre debe haber un identificador del proceso
  entity_id   TEXT NOT NULL,

  -- Referencia opcional a entidad principal (ej: ID de registro en otra tabla)
  -- Nullable: el error puede ocurrir antes de crear la entidad principal
  entity_ref  INTEGER,

  -- Nombre del paso/proceso (ej: 'UPLOAD', 'PROCESS_DATA', 'VALIDATE')
  -- NOT NULL: siempre debe identificar el paso
  paso        TEXT NOT NULL,

  -- Nivel de severidad del evento
  -- CHECK constraint: solo permite valores predefinidos
  nivel       TEXT NOT NULL
    CHECK(nivel IN ('DEBUG','INFO','WARN','ERROR')),

  -- Tipo semántico del evento
  -- Ejemplos: 'STEP_SUCCESS', 'STEP_FAILED', 'PROCESS_START', 'PROCESS_COMPLETE'
  tipo_evento TEXT NOT NULL,

  -- Origen del evento (módulo/worker que genera el evento)
  -- Nullable: útil para identificar la fuente del evento
  origen      TEXT,

  -- Código estructurado de error
  -- Ejemplos: 'DATA_VALIDATION_FAILED', 'OCR_NO_TEXT_DETECTED'
  -- Nullable: solo para eventos de error
  error_codigo TEXT,

  -- Mensaje legible o payload JSON
  -- Puede ser texto plano o JSON serializado
  detalle     TEXT,

  -- Duración del paso en milisegundos
  -- Nullable: útil para métricas de rendimiento
  duracion_ms INTEGER,

  -- Timestamp ISO del evento
  -- DEFAULT: se establece automáticamente al insertar
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Índices
-- ============================================================================

-- Índice para búsqueda por entity_id
-- Propósito: Obtener todos los eventos de un proceso (cronología)
CREATE INDEX IF NOT EXISTS idx_pe_entity_id ON pipeline_eventos(entity_id);

-- Índice para búsqueda por código de error
-- Propósito: Filtrar eventos por tipo de error específico
CREATE INDEX IF NOT EXISTS idx_pe_error ON pipeline_eventos(error_codigo);

-- Índice compuesto para filtros por paso y nivel
-- Propósito: Consultas compuestas (ej: errores en un paso específico)
CREATE INDEX IF NOT EXISTS idx_pe_paso_nivel ON pipeline_eventos(paso, nivel);
