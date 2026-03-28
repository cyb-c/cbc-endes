-- ============================================================================
-- Schema SQL: Datos iniciales para tablas PAI
-- ============================================================================
-- Versión: 1.0
-- Fecha: 27 de marzo de 2026
-- Propósito: Poblar datos iniciales para el sistema PAI
-- ============================================================================

-- ============================================================================
-- Insertar atributos iniciales
-- ============================================================================

INSERT INTO PAI_ATR_atributos (ATR_codigo, ATR_nombre, ATR_descripcion, ATR_activo, ATR_orden, ATR_fecha_alta, ATR_fecha_actualizacion)
VALUES
  ('ESTADO_PROYECTO', 'Estado del proyecto', 'Estado del proyecto PAI', 1, 1, datetime('now'), datetime('now')),
  ('MOTIVO_VALORACION', 'Motivo de valoración', 'Motivo para valoración positiva del proyecto', 1, 2, datetime('now'), datetime('now')),
  ('MOTIVO_DESCARTE', 'Motivo de descarte', 'Motivo para descarte del proyecto', 1, 3, datetime('now'), datetime('now')),
  ('TIPO_NOTA', 'Tipo de nota', 'Tipo de nota en el sistema', 1, 4, datetime('now'), datetime('now')),
  ('TIPO_ARTEFACTO', 'Tipo de artefacto', 'Tipo de artefacto generado en el análisis', 1, 5, datetime('now'), datetime('now'));

-- ============================================================================
-- Insertar valores para atributos
-- ============================================================================

-- Valores para ESTADO_PROYECTO
INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'CREADO',
  'creado',
  'Estado inicial del proyecto tras el alta',
  1,
  1,
  1,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'ESTADO_PROYECTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'PROCESANDO_ANALISIS',
  'procesando análisis',
  'Estado mientras se ejecuta el análisis del proyecto',
  2,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'ESTADO_PROYECTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'ANALISIS_CON_ERROR',
  'análisis con error',
  'Estado cuando el análisis ha fallado',
  3,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'ESTADO_PROYECTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'ANALISIS_FINALIZADO',
  'análisis finalizado',
  'Estado cuando el análisis se ha completado exitosamente',
  4,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'ESTADO_PROYECTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'EVALUANDO_VIABILIDAD',
  'evaluando viabilidad',
  'Estado manual: evaluando viabilidad del proyecto',
  5,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'ESTADO_PROYECTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'EVALUANDO_PLAN_NEGOCIO',
  'evaluando Plan Negocio',
  'Estado manual: evaluando Plan de Negocio',
  6,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'ESTADO_PROYECTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'SEGUIMIENTO_COMERCIAL',
  'seguimiento comercial',
  'Estado manual: seguimiento comercial del proyecto',
  7,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'ESTADO_PROYECTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'DESCARTADO',
  'descartado',
  'Estado manual: proyecto descartado',
  8,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'ESTADO_PROYECTO';

-- Valores para MOTIVO_VALORACION
INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MV_SENTIDO_NEGOCIO_REAL',
  'Sentido de negocio real',
  'El activo parece tener sentido de negocio real.',
  1,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_VALORACION';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MV_INFRAUTILIZADO',
  'Infrautilizado',
  'El activo se aprecia como infrautilizado o con margen claro de mejora.',
  2,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_VALORACION';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MV_USO_ECONOMICO_RAZONABLE',
  'Uso económico razonable',
  'El activo parece sostener un uso económico razonable.',
  3,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_VALORACION';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MV_MANTENER',
  'Conviene mantener',
  'La opción más defendible parece ser mantener el activo.',
  4,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_VALORACION';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MV_TRANSFORMAR',
  'Conviene transformar',
  'La opción más defendible parece ser transformar el activo.',
  5,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_VALORACION';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MV_RECONVERSION_DEFENDIBLE_VALENCIA',
  'Reconversión defendible en València ciudad',
  'Una posible reconversión o cambio de uso parece defendible en València ciudad.',
  6,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_VALORACION';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MV_OPORTUNIDAD_TRANSFORMACION',
  'Oportunidad clara de transformación',
  'Se aprecia una oportunidad clara de mantenimiento o transformación, especialmente de transformación.',
  7,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_VALORACION';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MV_OPORTUNIDAD_MANTENIMIENTO',
  'Oportunidad clara de mantenimiento',
  'Se aprecia una oportunidad clara de mantenimiento del activo.',
  8,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_VALORACION';

-- Valores para MOTIVO_DESCARTE
INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MD_SIN_SENTIDO_NEGOCIO_REAL',
  'Sin sentido de negocio real',
  'El activo no parece tener sentido de negocio real.',
  1,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_DESCARTE';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MD_NO_INFRAUTILIZADO_NI_MEJORABLE',
  'Sin infrautilización relevante',
  'El activo no parece infrautilizado ni presenta mejora clara que justifique su interés.',
  2,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_DESCARTE';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MD_SIN_USO_ECONOMICO_RAZONABLE',
  'Sin uso económico razonable',
  'El activo no parece sostener un uso económico razonable.',
  3,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_DESCARTE';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MD_NO_CONVIENE_MANTENER',
  'No conviene mantener',
  'Mantener el activo no parece una opción defendible.',
  4,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_DESCARTE';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MD_NO_CONVIENE_TRANSFORMAR',
  'No conviene transformar',
  'Transformar el activo no parece una opción defendible.',
  5,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_DESCARTE';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MD_RECONVERSION_NO_DEFENDIBLE_VALENCIA',
  'Reconversión no defendible en València ciudad',
  'Una posible reconversión o cambio de uso no parece defendible en València ciudad.',
  6,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_DESCARTE';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MD_SIN_OPORTUNIDAD_CLARA',
  'Sin oportunidad clara',
  'No se aprecia una oportunidad clara de mantenimiento ni de transformación.',
  7,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_DESCARTE';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'MD_HIPOTESIS_NO_SOSTENIBLE',
  'Hipótesis atractiva no sostenible',
  'Una hipótesis inicialmente atractiva, como una reconversión o cambio de uso, deja de parecer defendible.',
  8,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'MOTIVO_DESCARTE';

-- Valores para TIPO_NOTA
INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'COMENTARIO',
  'Comentario',
  'Nota de tipo comentario',
  1,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_NOTA';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'VALORACION',
  'Valoración',
  'Nota de tipo valoración',
  2,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_NOTA';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'DECISION',
  'Decisión',
  'Nota de tipo decisión',
  3,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_NOTA';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT
  ATR_id,
  'APRENDE_IA',
  'Corrección IA',
  'Nota de tipo corrección para IA',
  4,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_NOTA';

-- Valor ACTIVO para TIPO_NOTA (requerido para crear notas - P0.1 Corrección Crítica)
INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT
  ATR_id,
  'ACTIVO',
  'activo',
  'Nota activa, puede editarse',
  5,
  1,
  1,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_NOTA';

-- Valores para TIPO_ARTEFACTO
INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'DATOS_MD',
  'Markdown de datos transformados',
  'Markdown con los datos transformados del IJSON',
  1,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_ARTEFACTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'ANALISIS_FISICO',
  'Análisis físico',
  'Markdown con el análisis físico del inmueble',
  2,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_ARTEFACTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'ANALISIS_ESTRATEGICO',
  'Análisis estratégico',
  'Markdown con el análisis estratégico del inmueble',
  3,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_ARTEFACTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'ANALISIS_FINANCIERO',
  'Análisis financiero',
  'Markdown con el análisis financiero del inmueble',
  4,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_ARTEFACTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'ANALISIS_REGULATORIO',
  'Análisis regulatorio',
  'Markdown con el análisis regulatorio del inmueble',
  5,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_ARTEFACTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'LECTURA_INVERSOR',
  'Lectura inversor',
  'Markdown con la lectura orientada a inversor',
  6,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_ARTEFACTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'LECTURA_OPERADOR',
  'Lectura operador',
  'Markdown con la lectura orientada a operador',
  7,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_ARTEFACTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'LECTURA_PROPIETARIO',
  'Lectura propietario',
  'Markdown con la lectura orientada a propietario',
  8,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_ARTEFACTO';

INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT 
  ATR_id,
  'LOG_CII_JSON',
  'Log CII JSON',
  'Log JSON del proceso de análisis',
  9,
  1,
  0,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_ARTEFACTO';
