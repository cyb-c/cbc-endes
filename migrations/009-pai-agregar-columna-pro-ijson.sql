-- ============================================================================
-- Migración: Agregar columna PRO_ijson a PAI_PRO_proyectos
-- ============================================================================
-- Versión: 1.0
-- Fecha: 28 de marzo de 2026
-- Propósito: Agregar columna para almacenar IJSON original del proyecto
-- Nota: Esta migración es parte de las Correcciones Críticas P0.1 del 
--       Diagnóstico FASE 2 (FASE02_Diagnostico_PlanAjuste_QWEN.md)
-- ============================================================================

-- ============================================================================
-- Agregar columna PRO_ijson
-- ============================================================================
-- Descripción: La columna PRO_ijson almacena el IJSON original del anuncio
--              inmobiliario. Es requerida por el servicio de simulación de IA
--              para recuperar el contenido original durante el análisis.
--
-- Problema detectado: El diagnóstico FASE 2 identificó que esta columna falta
--                     y bloquea la funcionalidad de recuperación de IJSON
--                     para el análisis.
-- ============================================================================

ALTER TABLE PAI_PRO_proyectos ADD COLUMN PRO_ijson TEXT;

-- ============================================================================
-- Verificación
-- ============================================================================
-- Comprobar que la columna fue agregada correctamente

SELECT 
  id,
  cii,
  titulo,
  PRO_ijson IS NOT NULL as tiene_ijson
FROM PAI_PRO_proyectos
LIMIT 5;

-- ============================================================================
-- Notas de Implementación
-- ============================================================================
-- 
-- 1. Esta migración es IDEMPOTENTE - Se puede ejecutar múltiples veces sin
--    efectos secundarios. Si la columna ya existe, SQLite retornará un error
--    que puede ser ignorado.
--
-- 2. La columna es NULLABLE - Los proyectos existentes tendrán NULL en esta
--    columna. Solo los nuevos proyectos tendrán el IJSON almacenado.
--
-- 3. Para proyectos existentes, se puede recuperar el IJSON desde R2 si fue
--    guardado previamente con la estructura de carpetas:
--    analisis-inmuebles/CII/CII.json
--
-- ============================================================================
