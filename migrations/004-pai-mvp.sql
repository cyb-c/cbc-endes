-- ============================================================================
-- Schema SQL: Tablas PAI - Proyectos de Análisis Inmobiliario
-- ============================================================================
-- Versión: 1.0
-- Fecha: 27 de marzo de 2026
-- Propósito: Tablas para el sistema PAI
-- ============================================================================

-- ============================================================================
-- Tabla: PAI_ATR_atributos
-- ============================================================================
-- Descripción: Tabla de atributos de uso común para toda la aplicación
-- ============================================================================

CREATE TABLE IF NOT EXISTS PAI_ATR_atributos (
  ATR_id          INTEGER PRIMARY KEY,
  ATR_codigo       TEXT NOT NULL UNIQUE,
  ATR_nombre       TEXT NOT NULL,
  ATR_descripcion  TEXT,
  ATR_activo      INTEGER NOT NULL DEFAULT 1,
  ATR_orden       INTEGER,
  ATR_fecha_alta  TEXT NOT NULL DEFAULT (datetime('now')),
  ATR_fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Tabla: PAI_VAL_valores
-- ============================================================================
-- Descripción: Tabla de valores asociada a atributos
-- ============================================================================

CREATE TABLE IF NOT EXISTS PAI_VAL_valores (
  VAL_id                 INTEGER PRIMARY KEY,
  VAL_atr_id             INTEGER NOT NULL,
  VAL_codigo              TEXT NOT NULL,
  VAL_nombre              TEXT NOT NULL,
  VAL_descripcion         TEXT,
  VAL_orden              INTEGER,
  VAL_activo             INTEGER NOT NULL DEFAULT 1,
  VAL_es_default          INTEGER NOT NULL DEFAULT 0,
  VAL_fecha_alta         TEXT NOT NULL DEFAULT (datetime('now')),
  VAL_fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (VAL_atr_id) REFERENCES PAI_ATR_atributos(ATR_id)
);

-- ============================================================================
-- Tabla: PAI_PRO_proyectos
-- ============================================================================
-- Descripción: Tabla base del sistema de proyectos PAI
-- ============================================================================

CREATE TABLE IF NOT EXISTS PAI_PRO_proyectos (
  PRO_id                          INTEGER PRIMARY KEY,
  PRO_cii                          TEXT NOT NULL UNIQUE,
  PRO_titulo                       TEXT NOT NULL,
  PRO_estado_val_id                INTEGER NOT NULL,
  PRO_motivo_val_id                INTEGER,
  PRO_portal_nombre                TEXT NOT NULL,
  PRO_portal_url                   TEXT NOT NULL,
  PRO_operacion                    TEXT NOT NULL,
  PRO_tipo_inmueble                TEXT NOT NULL,
  PRO_precio                       TEXT NOT NULL,
  PRO_superficie_construida_m2     TEXT NOT NULL,
  PRO_ciudad                       TEXT NOT NULL,
  PRO_barrio_distrito              TEXT,
  PRO_direccion                    TEXT,
  PRO_resumen_ejecutivo           TEXT,
  PRO_fecha_alta                  TEXT NOT NULL DEFAULT (datetime('now')),
  PRO_fecha_analisis              TEXT,
  FOREIGN KEY (PRO_estado_val_id) REFERENCES PAI_VAL_valores(VAL_id),
  FOREIGN KEY (PRO_motivo_val_id) REFERENCES PAI_VAL_valores(VAL_id)
);

-- ============================================================================
-- Tabla: PAI_NOT_notas
-- ============================================================================
-- Descripción: Tabla de notas asociadas al proyecto
-- ============================================================================

CREATE TABLE IF NOT EXISTS PAI_NOT_notas (
  NOT_id                  INTEGER PRIMARY KEY,
  NOT_proyecto_id          INTEGER NOT NULL,
  NOT_tipo_val_id          INTEGER NOT NULL,
  NOT_asunto              TEXT NOT NULL,
  NOT_nota                 TEXT NOT NULL,
  NOT_estado_val_id        INTEGER NOT NULL,
  NOT_editable             INTEGER NOT NULL DEFAULT 1,
  NOT_fecha_alta           TEXT NOT NULL DEFAULT (datetime('now')),
  NOT_fecha_actualizacion    TEXT NOT NULL DEFAULT (datetime('now')),
  NOT_usuario_alta         TEXT,
  NOT_usuario_actualizacion TEXT,
  FOREIGN KEY (NOT_proyecto_id) REFERENCES PAI_PRO_proyectos(PRO_id),
  FOREIGN KEY (NOT_tipo_val_id) REFERENCES PAI_VAL_valores(VAL_id),
  FOREIGN KEY (NOT_estado_val_id) REFERENCES PAI_VAL_valores(VAL_id)
);

-- ============================================================================
-- Tabla: PAI_ART_artefactos
-- ============================================================================
-- Descripción: Tabla de artefactos asociados al proyecto
-- ============================================================================

CREATE TABLE IF NOT EXISTS PAI_ART_artefactos (
  ART_id                  INTEGER PRIMARY KEY,
  ART_proyecto_id          INTEGER NOT NULL,
  ART_tipo_val_id          INTEGER NOT NULL,
  ART_nombre               TEXT NOT NULL,
  ART_ruta                 TEXT NOT NULL,
  ART_mime                 TEXT,
  ART_fecha_generacion     TEXT NOT NULL DEFAULT (datetime('now')),
  ART_origen               TEXT,
  ART_activo               INTEGER NOT NULL DEFAULT 1,
  ART_descripcion          TEXT,
  FOREIGN KEY (ART_proyecto_id) REFERENCES PAI_PRO_proyectos(PRO_id),
  FOREIGN KEY (ART_tipo_val_id) REFERENCES PAI_VAL_valores(VAL_id)
);

-- ============================================================================
-- Índices
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pai_atr_codigo ON PAI_ATR_atributos(ATR_codigo);
CREATE INDEX IF NOT EXISTS idx_pai_atr_activo ON PAI_ATR_atributos(ATR_activo);

CREATE INDEX IF NOT EXISTS idx_pai_val_atr_id ON PAI_VAL_valores(VAL_atr_id);
CREATE INDEX IF NOT EXISTS idx_pai_val_activo ON PAI_VAL_valores(VAL_activo);

CREATE INDEX IF NOT EXISTS idx_pai_pro_cii ON PAI_PRO_proyectos(PRO_cii);
CREATE INDEX IF NOT EXISTS idx_pai_pro_estado ON PAI_PRO_proyectos(PRO_estado_val_id);
CREATE INDEX IF NOT EXISTS idx_pai_pro_fecha_alta ON PAI_PRO_proyectos(PRO_fecha_alta);

CREATE INDEX IF NOT EXISTS idx_pai_not_proyecto_id ON PAI_NOT_notas(NOT_proyecto_id);
CREATE INDEX IF NOT EXISTS idx_pai_not_estado_val_id ON PAI_NOT_notas(NOT_estado_val_id);
CREATE INDEX IF NOT EXISTS idx_pai_not_fecha_alta ON PAI_NOT_notas(NOT_fecha_alta);

CREATE INDEX IF NOT EXISTS idx_pai_art_proyecto_id ON PAI_ART_artefactos(ART_proyecto_id);
CREATE INDEX IF NOT EXISTS idx_pai_art_tipo_val_id ON PAI_ART_artefactos(ART_tipo_val_id);
CREATE INDEX IF NOT EXISTS idx_pai_art_activo ON PAI_ART_artefactos(ART_activo);
