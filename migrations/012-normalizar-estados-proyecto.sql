-- ============================================================================
-- Migración: 012-normalizar-estados-proyecto.sql
-- ============================================================================
-- Propósito: Alinear VAL_nombre con tipos TypeScript del frontend
--            Errores: G04, G05
--            Problema: Inconsistencia entre DB (con espacios/acentos) y 
--                      frontend (snake_case sin acentos)
-- ============================================================================

-- ============================================================================
-- DIAGNÓSTICO PREVIO
-- ============================================================================

-- Ver estados actuales en DB
SELECT 
  'ESTADOS_ACTUALES' as informe,
  VAL_id,
  VAL_codigo,
  VAL_nombre,
  VAL_activo
FROM PAI_VAL_valores v
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
WHERE a.ATR_codigo = 'ESTADO_PROYECTO'
ORDER BY v.VAL_orden;

-- ============================================================================
-- NORMALIZACIÓN DE ESTADOS
-- ============================================================================
-- Se normalizan los VAL_nombre para que coincidan exactamente con los
-- valores del tipo EstadoProyecto en frontend (apps/frontend/src/types/pai.ts)

-- Actualizar PROCESANDO_ANALISIS: "procesando análisis" → "procesando_analisis"
UPDATE PAI_VAL_valores
SET VAL_nombre = 'procesando_analisis'
WHERE VAL_codigo = 'PROCESANDO_ANALISIS';

-- Actualizar ANALISIS_CON_ERROR: "análisis con error" → "analisis_con_error"
UPDATE PAI_VAL_valores
SET VAL_nombre = 'analisis_con_error'
WHERE VAL_codigo = 'ANALISIS_CON_ERROR';

-- Actualizar ANALISIS_FINALIZADO: "análisis finalizado" → "analisis_finalizado"
UPDATE PAI_VAL_valores
SET VAL_nombre = 'analisis_finalizado'
WHERE VAL_codigo = 'ANALISIS_FINALIZADO';

-- Actualizar EVALUANDO_VIABILIDAD: "evaluando viabilidad" → "evaluando_viabilidad"
UPDATE PAI_VAL_valores
SET VAL_nombre = 'evaluando_viabilidad'
WHERE VAL_codigo = 'EVALUANDO_VIABILIDAD';

-- Actualizar EVALUANDO_PLAN_NEGOCIO: "evaluando Plan Negocio" → "evaluando_plan_negocio"
UPDATE PAI_VAL_valores
SET VAL_nombre = 'evaluando_plan_negocio'
WHERE VAL_codigo = 'EVALUANDO_PLAN_NEGOCIO';

-- Actualizar SEGUIMIENTO_COMERCIAL: "seguimiento comercial" → "seguimiento_comercial"
UPDATE PAI_VAL_valores
SET VAL_nombre = 'seguimiento_comercial'
WHERE VAL_codigo = 'SEGUIMIENTO_COMERCIAL';

-- ============================================================================
-- VERIFICACIÓN POST-NORMALIZACIÓN
-- ============================================================================

-- Ver estados normalizados
SELECT 
  'ESTADOS_NORMALIZADOS' as informe,
  VAL_id,
  VAL_codigo,
  VAL_nombre,
  VAL_activo
FROM PAI_VAL_valores v
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
WHERE a.ATR_codigo = 'ESTADO_PROYECTO'
ORDER BY v.VAL_orden;

-- Verificar que no hay estados con espacios o acentos
SELECT 
  'ESTADOS_CON_PROBLEMAS' as informe,
  VAL_id,
  VAL_codigo,
  VAL_nombre
FROM PAI_VAL_valores v
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
WHERE a.ATR_codigo = 'ESTADO_PROYECTO'
  AND (VAL_nombre LIKE '% %' OR VAL_nombre LIKE '%á%' OR VAL_nombre LIKE '%é%' OR VAL_nombre LIKE '%í%' OR VAL_nombre LIKE '%ó%' OR VAL_nombre LIKE '%ú%');
-- Debe devolver 0 filas

-- ============================================================================
-- ACTUALIZACIÓN DE PROYECTOS EXISTENTES (si es necesario)
-- ============================================================================
-- NOTA: Los proyectos existentes mantienen su PRO_estado_val_id, 
-- pero ahora el VAL_nombre asociado es consistente

-- Verificar que todos los proyectos tienen estado válido
SELECT 
  'PROYECTOS_CON_ESTADO' as informe,
  v.VAL_nombre as estado,
  COUNT(*) as cantidad
FROM PAI_PRO_proyectos p
JOIN PAI_VAL_valores v ON p.PRO_estado_val_id = v.VAL_id
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
WHERE a.ATR_codigo = 'ESTADO_PROYECTO'
GROUP BY v.VAL_nombre
ORDER BY v.VAL_orden;

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
