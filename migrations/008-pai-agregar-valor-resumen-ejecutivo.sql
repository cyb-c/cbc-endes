-- Migración 008: Agregar valor RESUMEN_EJECUTIVO a PAI_VAL_valores
-- Esta migración agrega el valor faltante para el tipo de artefacto 'resumen-ejecutivo'

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_orden)
VALUES (5, 'RESUMEN_EJECUTIVO', 'Resumen ejecutivo', 38);

-- Verificación
SELECT VAL_id, VAL_codigo, VAL_nombre, VAL_orden
FROM PAI_VAL_valores
WHERE VAL_codigo = 'RESUMEN_EJECUTIVO';
