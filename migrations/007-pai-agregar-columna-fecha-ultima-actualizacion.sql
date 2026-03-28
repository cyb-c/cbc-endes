-- ============================================================================
-- Migración: Agregar columna PRO_fecha_ultima_actualizacion a PAI_PRO_proyectos
-- Fecha: 2026-03-28
-- Propósito: Corregir esquema para incluir columna de última actualización
-- Referencia: FASE1 documentación menciona esta columna como requerida
-- ============================================================================

-- ============================================================================
-- Agregar columna PRO_fecha_ultima_actualizacion
-- ============================================================================

ALTER TABLE PAI_PRO_proyectos 
ADD COLUMN PRO_fecha_ultima_actualizacion TEXT;

-- ============================================================================
-- Inicializar la columna con PRO_fecha_alta para registros existentes
-- ============================================================================

UPDATE PAI_PRO_proyectos 
SET PRO_fecha_ultima_actualizacion = PRO_fecha_alta 
WHERE PRO_fecha_ultima_actualizacion IS NULL;

-- ============================================================================
-- Verificación
-- ============================================================================

-- Verificar que la columna fue agregada
SELECT 
  sql 
FROM sqlite_master 
WHERE type='table' 
AND name='PAI_PRO_proyectos';

-- Verificar que los datos fueron inicializados
SELECT 
  PRO_id,
  PRO_titulo,
  PRO_fecha_alta,
  PRO_fecha_ultima_actualizacion
FROM PAI_PRO_proyectos
LIMIT 5;
