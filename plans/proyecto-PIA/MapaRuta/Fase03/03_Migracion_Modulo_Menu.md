# Migración del Módulo "Proyectos" al Menú Dinámico

**Fecha:** 27 de marzo de 2026  
**Versión:** 1.0  
**Estado:** PROPUESTA

---

## 1. Introducción

Este documento describe la migración necesaria para añadir el módulo "Proyectos" al menú dinámico del sistema.

## 2. Objetivo

Añadir el módulo "Proyectos" a la tabla `MOD_modulos_config` para que aparezca en el menú lateral del sistema y permita a los usuarios acceder a la funcionalidad de gestión de proyectos PAI (Proyectos de Análisis Inmobiliario).

## 3. Cambios en la Base de Datos

### 3.1. Inserción de Módulo Principal

```sql
INSERT INTO MOD_modulos_config (
  MOD_id,
  MOD_codigo,
  MOD_nombre_interno,
  MOD_nombre_mostrar,
  MOD_descripcion,
  MOD_url_path,
  MOD_icono,
  MOD_orden,
  MOD_activo,
  MOD_fecha_alta,
  MOD_fecha_actualizacion
)
VALUES (
  2,                              -- ID del módulo
  'PROYECTOS',                      -- Código interno
  'Proyectos',                        -- Nombre a mostrar
  'Sección principal para gestionar proyectos de análisis inmobiliarios (PAI)', -- Descripción
  '/proyectos',                       -- URL path
  'folder',                          -- Icono (usar icono de carpeta)
  10,                               -- Orden (después de Dashboard)
  1,                                -- Activo
  datetime('now'),                   -- Fecha de alta
  datetime('now')                    -- Fecha de actualización
);
```

### 3.2. Inserción de Funciones del Módulo

```sql
-- Funciones principales del módulo Proyectos
INSERT INTO MOD_funciones_config (
  FUN_id,
  FUN_modulo_id,
  FUN_codigo,
  FUN_nombre_interno,
  FUN_nombre_mostrar,
  FUN_descripcion,
  FUN_url_path,
  FUN_icono,
  FUN_orden,
  FUN_activo,
  FUN_fecha_alta,
  FUN_fecha_actualizacion
)
VALUES 
  (10, 'PROYECTOS', 'crear_proyecto', 'crear_proyecto', 'Crear Proyecto', 'Crear nuevo proyecto PAI a partir de IJSON', '/proyectos/crear', 'plus-circle', 1, 1, datetime('now'), datetime('now')),
  (10, 'PROYECTOS', 'listar_proyectos', 'listar_proyectos', 'Listar Proyectos', 'Ver listado de proyectos PAI con filtros y paginación', '/proyectos', 'list', 1, 1, datetime('now'), datetime('now')),
  (10, 'PROYECTOS', 'detalle_proyecto', 'detalle_proyecto', 'Ver Detalle de Proyecto', '/proyectos/:id', 'eye', 2, 1, datetime('now'), datetime('now')),
  (10, 'PROYECTOS', 'ejecutar_analisis', 'ejecutar_analisis', 'Ejecutar Análisis Completo', 'Ejecutar análisis completo de un proyecto PAI generando 10 archivos Markdown', '/proyectos/:id/analisis', 'play', 3, 1, datetime('now'), datetime('now')),
  (10, 'PROYECTOS', 'obtener_artefactos', 'obtener_artefactos', 'Obtener Artefactos', 'Ver artefactos generados de un proyecto PAI', '/proyectos/:id/artefactos', 'file', 4, 1, datetime('now'), datetime('now')),
  (10, 'PROYECTOS', 'cambiar_estado', 'cambiar_estado', 'Cambiar Estado', 'Cambiar estado manual de un proyecto PAI', '/proyectos/:id/estado', 'refresh', 5, 1, datetime('now'), datetime('now')),
  (10, 'PROYECTOS', 'eliminar_proyecto', 'eliminar_proyecto', 'Eliminar Proyecto', 'Eliminar proyecto PAI y sus artefactos', '/proyectos/:id', 'trash', 6, 1, datetime('now'), datetime('now')),
  (10, 'PROYECTOS', 'obtener_historial', 'obtener_historial', 'Obtener Historial', 'Ver historial de ejecuciones de un proyecto PAI', '/proyectos/:id/pipeline', 'clock', 7, 1, datetime('now'), datetime('now'));
```

### 3.3. Inserción de Grupo de Acciones Globales

```sql
-- Grupo de acciones globales para el módulo Proyectos
INSERT INTO MOD_acciones_globales (
  AGA_id,
  AGA_codigo,
  AGA_nombre_mostrar,
  AGA_descripcion,
  AGA_orden,
  AGA_activo,
  AGA_fecha_alta,
  AGA_fecha_actualizacion
)
VALUES 
  (1, 'proyectos', 'nuevo_proyecto', 'Nuevo Proyecto', 'Crear nuevo proyecto PAI', 1, 1, datetime('now'), datetime('now')),
  (1, 'proyectos', 'ejecutar_analisis', 'Ejecutar Análisis', 'Ejecutar análisis completo del proyecto', 1, 2, datetime('now'), datetime('now'));
```

## 4. Verificación

### 4.1. Verificar Tabla Existentes

Antes de ejecutar las migraciones, verificar que las tablas existen:

```sql
-- Verificar que la tabla MOD_modulos_config existe
SELECT COUNT(*) as count FROM MOD_modulos_config;

-- Verificar que la tabla MOD_funciones_config existe
SELECT COUNT(*) as count FROM MOD_funciones_config;

-- Verificar que la tabla MOD_acciones_globales existe
SELECT COUNT(*) as count FROM MOD_acciones_globales;
```

### 4.2. Verificar Datos Existentes

```sql
-- Verificar si ya existe el módulo PROYECTOS
SELECT MOD_id FROM MOD_modulos_config WHERE MOD_codigo = 'PROYECTOS';

-- Verificar si ya existe alguna función del módulo PROYECTOS
SELECT FUN_codigo FROM MOD_funciones_config WHERE FUN_modulo_id = 10;
```

## 5. Orden de Ejecución

1. **Ejecutar migración de módulo** (si aplica)
   - Ejecutar el SQL de inserción del módulo y funciones
   - Verificar que el módulo se haya creado correctamente

2. **Verificar menú dinámico**
   - Acceder a `/api/menu` para confirmar que el módulo aparece
   - Verificar que las funciones estén disponibles

3. **Actualizar documentación**
   - Actualizar `inventario_recursos.md` con el nuevo módulo
   - Actualizar documentación de menú dinámico si es necesario

## 6. Notas Importantes

- Esta migración debe ejecutarse **DESPUÉS** de cualquier despliegue en producción
- Asegurarse de que el `MOD_id` no entre en conflicto con IDs existentes
- Verificar que el `FUN_codigo` sea único para cada función
- Las funciones deben estar ordenadas correctamente (`FUN_orden`)
- El módulo debe estar activo (`MOD_activo = 1`)

## 7. Rollback

Si es necesario hacer rollback:

```sql
-- Eliminar módulo (si se creó incorrectamente)
DELETE FROM MOD_modulos_config WHERE MOD_codigo = 'PROYECTOS';

-- Eliminar funciones del módulo
DELETE FROM MOD_funciones_config WHERE FUN_modulo_id = 10;

-- Eliminar acciones globales
DELETE FROM MOD_acciones_globales WHERE AGA_codigo = 'proyectos';
```

## 8. Referencias

- **Esquema de base de datos:** Ver [`migrations/002-menu-dinamico-v1.sql`](../../migrations/002-menu-dinamico-v1.sql)
- **Documentación de menú dinámico:** Ver [`plans/menu-dynamic-starter-kit-v1/`](../../menu-dynamic-starter-kit-v1/)
- **Documentación de FASE 2:** Ver [`plans/proyecto-PIA/MapaRuta/Fase02/`](../../MapaRuta/Fase02/)
- **API de PAI:** Ver [`plans/proyecto-PIA/MapaRuta/Fase02/Especificacion_API_PAI.md`](../../MapaRuta/Fase02/Especificacion_API_PAI.md)

---

**Fin de la Migración**
