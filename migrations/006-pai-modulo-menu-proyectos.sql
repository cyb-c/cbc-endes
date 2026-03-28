-- Migración: Módulo "Proyectos" en Menú Dinámico
-- Fecha: 2026-03-27
-- Descripción: Añade el módulo "Proyectos" y sus funciones al menú dinámico

-- ============================================================
-- Inserción de Módulo Principal
-- ============================================================

INSERT INTO MOD_modulos_config (
  id,
  modulo_id,
  tipo_elemento,
  nombre_interno,
  nombre_mostrar,
  descripcion,
  url_path,
  icono,
  orden,
  activo,
  created_at,
  updated_at
)
VALUES (
  10,                              -- ID del módulo (siguiente disponible)
  NULL,                            -- NULL = módulo raíz
  'MODULO',                         -- Tipo de elemento
  'PROYECTOS',                      -- Nombre interno (código)
  'Proyectos',                       -- Nombre a mostrar
  'Sección principal para gestionar proyectos de análisis inmobiliarios (PAI)', -- Descripción
  '/proyectos',                       -- URL path
  'folder',                          -- Icono (usar icono de carpeta)
  10,                               -- Orden (después de Dashboard)
  1,                                -- Activo
  datetime('now'),                   -- Fecha de alta
  datetime('now')                    -- Fecha de actualización
);

-- ============================================================
-- Inserción de Funciones del Módulo
-- ============================================================

-- Funciones principales del módulo Proyectos
INSERT INTO MOD_modulos_config (
  id,
  modulo_id,
  tipo_elemento,
  nombre_interno,
  nombre_mostrar,
  descripcion,
  url_path,
  icono,
  orden,
  activo,
  created_at,
  updated_at
)
VALUES 
  -- Listar Proyectos (función principal)
  (11, 10, 'FUNCION', 'listar_proyectos', 'Listar Proyectos', 'Ver listado de proyectos PAI con filtros y paginación', '/proyectos', 'list', 1, 1, datetime('now'), datetime('now')),
  
  -- Crear Proyecto
  (12, 10, 'FUNCION', 'crear_proyecto', 'Crear Proyecto', 'Crear nuevo proyecto PAI a partir de IJSON', '/proyectos/crear', 'plus-circle', 2, 1, datetime('now'), datetime('now')),
  
  -- Ver Detalle de Proyecto
  (13, 10, 'FUNCION', 'detalle_proyecto', 'Ver Detalle', 'Ver detalle completo de un proyecto PAI', '/proyectos/:id', 'eye', 3, 1, datetime('now'), datetime('now')),
  
  -- Ejecutar Análisis
  (14, 10, 'FUNCION', 'ejecutar_analisis', 'Ejecutar Análisis', 'Ejecutar análisis completo de un proyecto PAI generando 10 archivos Markdown', '/proyectos/:id/analisis', 'play', 4, 1, datetime('now'), datetime('now')),
  
  -- Ver Artefactos
  (15, 10, 'FUNCION', 'ver_artefactos', 'Ver Artefactos', 'Ver artefactos generados de un proyecto PAI', '/proyectos/:id/artefactos', 'file', 5, 1, datetime('now'), datetime('now')),
  
  -- Cambiar Estado
  (16, 10, 'FUNCION', 'cambiar_estado', 'Cambiar Estado', 'Cambiar estado manual de un proyecto PAI', '/proyectos/:id/estado', 'refresh', 6, 1, datetime('now'), datetime('now')),
  
  -- Eliminar Proyecto
  (17, 10, 'FUNCION', 'eliminar_proyecto', 'Eliminar Proyecto', 'Eliminar proyecto PAI y sus artefactos', '/proyectos/:id', 'trash', 7, 1, datetime('now'), datetime('now')),
  
  -- Ver Historial
  (18, 10, 'FUNCION', 'ver_historial', 'Ver Historial', 'Ver historial de ejecuciones de un proyecto PAI', '/proyectos/:id/pipeline', 'clock', 8, 1, datetime('now'), datetime('now'));

-- ============================================================
-- Verificación
-- ============================================================

-- Verificar que el módulo fue insertado correctamente
SELECT 
  id,
  nombre_interno,
  nombre_mostrar,
  url_path,
  orden,
  activo
FROM MOD_modulos_config
WHERE nombre_interno = 'PROYECTOS';

-- Verificar que las funciones fueron insertadas correctamente
SELECT 
  id,
  modulo_id,
  nombre_interno,
  nombre_mostrar,
  url_path,
  orden,
  activo
FROM MOD_modulos_config
WHERE modulo_id = 10
ORDER BY orden;
