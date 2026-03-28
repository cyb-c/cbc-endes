-- ============================================================================
-- Migración: 011-limpieza-valores-duplicados.sql
-- ============================================================================
-- Propósito: Eliminar TODOS los valores duplicados en PAI_VAL_valores
--            Errores: G03, G11, G12, G13, G14
--            Problema: Migración 005 ejecutada múltiples veces
-- ============================================================================

-- PASO 1: CREAR TABLA TEMPORAL DE DUPLICADOS A ELIMINAR
-- Mantiene el VAL_id más bajo de cada grupo duplicado

CREATE TEMP TABLE IF NOT EXISTS val_duplicados_a_eliminar AS
WITH duplicados AS (
  SELECT 
    VAL_atr_id,
    VAL_codigo,
    MIN(VAL_id) as val_id_a_mantener,
    GROUP_CONCAT(VAL_id) as todos_ids
  FROM PAI_VAL_valores
  GROUP BY VAL_atr_id, VAL_codigo
  HAVING COUNT(*) > 1
)
SELECT 
  d.VAL_atr_id,
  d.VAL_codigo,
  d.val_id_a_mantener,
  d.todos_ids,
  REPLACE(
    REPLACE(d.todos_ids, d.val_id_a_mantener || ',', ''),
    ',' || d.val_id_a_mantener, ''
  ) as ids_a_eliminar
FROM duplicados d;

-- PASO 2: REASIGNAR DEPENDENCIAS

-- 2.1 Actualizar proyectos que usan estados duplicados
UPDATE PAI_PRO_proyectos
SET PRO_estado_val_id = (
  SELECT val_id_a_mantener 
  FROM val_duplicados_a_eliminar 
  WHERE VAL_atr_id = (SELECT VAL_atr_id FROM PAI_VAL_valores WHERE VAL_id = PAI_PRO_proyectos.PRO_estado_val_id)
    AND VAL_codigo = (SELECT VAL_codigo FROM PAI_VAL_valores WHERE VAL_id = PAI_PRO_proyectos.PRO_estado_val_id)
)
WHERE PRO_estado_val_id IN (
  SELECT id_a_eliminar FROM (
    WITH RECURSIVE ids(id_a_eliminar, resto) AS (
      SELECT 
        CAST(SUBSTR(ids_a_eliminar, 1, INSTR(ids_a_eliminar || ',', ',') - 1) AS INTEGER),
        SUBSTR(ids_a_eliminar, INSTR(ids_a_eliminar || ',', ',') + 1)
      FROM val_duplicados_a_eliminar
      WHERE ids_a_eliminar != ''
      UNION ALL
      SELECT 
        CAST(SUBSTR(resto, 1, INSTR(resto || ',', ',') - 1) AS INTEGER),
        SUBSTR(resto, INSTR(resto || ',', ',') + 1)
      FROM ids
      WHERE resto != ''
    )
    SELECT id_a_eliminar FROM ids
  )
);

-- 2.2 Actualizar proyectos que usan motivos duplicados
UPDATE PAI_PRO_proyectos
SET PRO_motivo_val_id = (
  SELECT val_id_a_mantener 
  FROM val_duplicados_a_eliminar 
  WHERE VAL_atr_id = (SELECT VAL_atr_id FROM PAI_VAL_valores WHERE VAL_id = PAI_PRO_proyectos.PRO_motivo_val_id)
    AND VAL_codigo = (SELECT VAL_codigo FROM PAI_VAL_valores WHERE VAL_id = PAI_PRO_proyectos.PRO_motivo_val_id)
)
WHERE PRO_motivo_val_id IN (
  SELECT id_a_eliminar FROM (
    WITH RECURSIVE ids(id_a_eliminar, resto) AS (
      SELECT 
        CAST(SUBSTR(ids_a_eliminar, 1, INSTR(ids_a_eliminar || ',', ',') - 1) AS INTEGER),
        SUBSTR(ids_a_eliminar, INSTR(ids_a_eliminar || ',', ',') + 1)
      FROM val_duplicados_a_eliminar
      WHERE ids_a_eliminar != ''
      UNION ALL
      SELECT 
        CAST(SUBSTR(resto, 1, INSTR(resto || ',', ',') - 1) AS INTEGER),
        SUBSTR(resto, INSTR(resto || ',', ',') + 1)
      FROM ids
      WHERE resto != ''
    )
    SELECT id_a_eliminar FROM ids
  )
);

-- 2.3 Actualizar notas que usan tipos duplicados
UPDATE PAI_NOT_notas
SET NOT_tipo_val_id = (
  SELECT val_id_a_mantener 
  FROM val_duplicados_a_eliminar 
  WHERE VAL_atr_id = (SELECT VAL_atr_id FROM PAI_VAL_valores WHERE VAL_id = PAI_NOT_notas.NOT_tipo_val_id)
    AND VAL_codigo = (SELECT VAL_codigo FROM PAI_VAL_valores WHERE VAL_id = PAI_NOT_notas.NOT_tipo_val_id)
)
WHERE NOT_tipo_val_id IN (
  SELECT id_a_eliminar FROM (
    WITH RECURSIVE ids(id_a_eliminar, resto) AS (
      SELECT 
        CAST(SUBSTR(ids_a_eliminar, 1, INSTR(ids_a_eliminar || ',', ',') - 1) AS INTEGER),
        SUBSTR(ids_a_eliminar, INSTR(ids_a_eliminar || ',', ',') + 1)
      FROM val_duplicados_a_eliminar
      WHERE ids_a_eliminar != ''
      UNION ALL
      SELECT 
        CAST(SUBSTR(resto, 1, INSTR(resto || ',', ',') - 1) AS INTEGER),
        SUBSTR(resto, INSTR(resto || ',', ',') + 1)
      FROM ids
      WHERE resto != ''
    )
    SELECT id_a_eliminar FROM ids
  )
);

-- 2.4 Actualizar artefactos que usan tipos duplicados
UPDATE PAI_ART_artefactos
SET ART_tipo_val_id = (
  SELECT val_id_a_mantener 
  FROM val_duplicados_a_eliminar 
  WHERE VAL_atr_id = (SELECT VAL_atr_id FROM PAI_VAL_valores WHERE VAL_id = PAI_ART_artefactos.ART_tipo_val_id)
    AND VAL_codigo = (SELECT VAL_codigo FROM PAI_VAL_valores WHERE VAL_id = PAI_ART_artefactos.ART_tipo_val_id)
)
WHERE ART_tipo_val_id IN (
  SELECT id_a_eliminar FROM (
    WITH RECURSIVE ids(id_a_eliminar, resto) AS (
      SELECT 
        CAST(SUBSTR(ids_a_eliminar, 1, INSTR(ids_a_eliminar || ',', ',') - 1) AS INTEGER),
        SUBSTR(ids_a_eliminar, INSTR(ids_a_eliminar || ',', ',') + 1)
      FROM val_duplicados_a_eliminar
      WHERE ids_a_eliminar != ''
      UNION ALL
      SELECT 
        CAST(SUBSTR(resto, 1, INSTR(resto || ',', ',') - 1) AS INTEGER),
        SUBSTR(resto, INSTR(resto || ',', ',') + 1)
      FROM ids
      WHERE resto != ''
    )
    SELECT id_a_eliminar FROM ids
  )
);

-- PASO 3: ELIMINAR VALORES DUPLICADOS

DELETE FROM PAI_VAL_valores
WHERE VAL_id IN (
  SELECT id_a_eliminar FROM (
    WITH RECURSIVE ids(id_a_eliminar, resto) AS (
      SELECT 
        CAST(SUBSTR(ids_a_eliminar, 1, INSTR(ids_a_eliminar || ',', ',') - 1) AS INTEGER),
        SUBSTR(ids_a_eliminar, INSTR(ids_a_eliminar || ',', ',') + 1)
      FROM val_duplicados_a_eliminar
      WHERE ids_a_eliminar != ''
      UNION ALL
      SELECT 
        CAST(SUBSTR(resto, 1, INSTR(resto || ',', ',') - 1) AS INTEGER),
        SUBSTR(resto, INSTR(resto || ',', ',') + 1)
      FROM ids
      WHERE resto != ''
    )
    SELECT id_a_eliminar FROM ids
  )
);

-- PASO 4: LIMPIEZA

DROP TABLE IF EXISTS val_duplicados_a_eliminar;
