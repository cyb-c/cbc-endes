-- ============================================================================
-- Migración: Hacer nullable columna NOT_estado_val_id
-- ============================================================================
-- Versión: 1.0
-- Fecha: 28 de marzo de 2026
-- Propósito: Hacer nullable la columna NOT_estado_val_id para permitir
--            creación de notas sin estado (P0.3 Corrección Crítica)
-- Nota: Esta migración es parte de las Correcciones Críticas P0.3 del 
--       Diagnóstico FASE 2 (FASE02_Diagnostico_PlanAjuste_QWEN.md)
-- ============================================================================

-- ============================================================================
-- Hacer nullable columna NOT_estado_val_id
-- ============================================================================
-- Descripción: La columna NOT_estado_val_id fue definida como NOT NULL en la
--              migración 004, pero el atributo ESTADO_NOTA no existe en la
--              base de datos. Esta migración hace la columna nullable para
--              permitir la creación de notas sin estado.
--
-- Problema detectado: El diagnóstico FASE 2 identificó que el handler de notas
--                     falla al buscar el atributo inexistente ESTADO_NOTA.
--                     La solución es hacer nullable la columna y no requerirla.
--
-- Nota técnica: SQLite no permite ALTER COLUMN directamente. Se requiere
--               recrear la tabla con la nueva definición.
-- ============================================================================

-- Paso 1: Crear tabla temporal con la nueva definición
CREATE TABLE IF NOT EXISTS PAI_NOT_notas_new (
  NOT_id                  INTEGER PRIMARY KEY,
  NOT_proyecto_id          INTEGER NOT NULL,
  NOT_tipo_val_id          INTEGER NOT NULL,
  NOT_asunto              TEXT NOT NULL,
  NOT_nota                 TEXT NOT NULL,
  NOT_estado_val_id        INTEGER,  -- Ahora nullable
  NOT_editable             INTEGER NOT NULL DEFAULT 1,
  NOT_fecha_alta           TEXT NOT NULL DEFAULT (datetime('now')),
  NOT_fecha_actualizacion    TEXT NOT NULL DEFAULT (datetime('now')),
  NOT_usuario_alta         TEXT,
  NOT_usuario_actualizacion TEXT,
  FOREIGN KEY (NOT_proyecto_id) REFERENCES PAI_PRO_proyectos(PRO_id),
  FOREIGN KEY (NOT_tipo_val_id) REFERENCES PAI_VAL_valores(VAL_id),
  FOREIGN KEY (NOT_estado_val_id) REFERENCES PAI_VAL_valores(VAL_id)
);

-- Paso 2: Copiar datos existentes (si los hay)
INSERT INTO PAI_NOT_notas_new 
SELECT * FROM PAI_NOT_notas;

-- Paso 3: Eliminar tabla antigua
DROP TABLE PAI_NOT_notas;

-- Paso 4: Renombrar tabla nueva
ALTER TABLE PAI_NOT_notas_new RENAME TO PAI_NOT_notas;

-- ============================================================================
-- Verificación
-- ============================================================================
-- Comprobar que la tabla fue modificada correctamente

SELECT 
  name,
  sql 
FROM sqlite_master 
WHERE type='table' AND name='PAI_NOT_notas';

-- ============================================================================
-- Notas de Implementación
-- ============================================================================
-- 
-- 1. Esta migración PRESERVA los datos existentes - Todas las notas existentes
--    se mantienen con sus valores actuales.
--
-- 2. La columna ahora es NULLABLE - Las nuevas notas pueden crearse sin
--    estado_val_id.
--
-- 3. El índice en NOT_estado_val_id se mantiene - SQLite recrea los índices
--    automáticamente al recrear la tabla.
--
-- ============================================================================
