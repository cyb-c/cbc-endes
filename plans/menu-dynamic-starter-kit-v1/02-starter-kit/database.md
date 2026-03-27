# Database - Esquema SQL

```sql
-- Schema SQL para el patrón de menú dinámico v1
-- Base de datos: D1 (Cloudflare)
-- Fecha: 2026-03-27

-- ============================================================
-- Tabla principal de configuración de menú
-- ============================================================

CREATE TABLE IF NOT EXISTS MOD_modulos_config (
  id INTEGER PRIMARY KEY,
  
  -- Jerarquía autorreferencial
  -- NULL = módulo raíz
  -- INTEGER = función hija del módulo con ese ID
  modulo_id INTEGER REFERENCES MOD_modulos_config(id) ON DELETE CASCADE,
  
  -- Tipo de elemento
  tipo_elemento TEXT NOT NULL CHECK(tipo_elemento IN ('MODULO','FUNCION')),
  
  -- Identificadores
  -- Código estable para lógica de negocio (nunca cambia)
  nombre_interno TEXT NOT NULL UNIQUE,
  
  -- Clave para sistema de textos (ej: 'menu.modulos.panel')
  nombre_mostrar TEXT NOT NULL,
  
  -- Metadatos
  descripcion TEXT,
  
  -- Ruta de navegación
  -- NULL para módulos raíz (no navegables directamente)
  url_path TEXT,
  
  -- Icono (depende del sistema de iconos del frontend)
  icono TEXT,
  
  -- Control de visibilidad
  orden INTEGER NOT NULL DEFAULT 0,
  
  -- 1 = visible, 0 = oculto
  activo INTEGER NOT NULL DEFAULT 1,
  
  -- Auditoría
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Índices para optimizar consultas
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_menu_modulo ON MOD_modulos_config(modulo_id);
CREATE INDEX IF NOT EXISTS idx_menu_tipo ON MOD_modulos_config(tipo_elemento);
CREATE INDEX IF NOT EXISTS idx_menu_orden ON MOD_modulos_config(orden);
CREATE INDEX IF NOT EXISTS idx_menu_activo ON MOD_modulos_config(activo);
```

## Datos de ejemplo

```sql
-- Módulos raíz
INSERT INTO MOD_modulos_config (id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar, descripcion, url_path, icono, orden, activo) VALUES
(1, NULL, 'MODULO', 'MOD_PANEL', 'menu.modulos.panel', 'Panel principal', NULL, 'layout-dashboard', 1, 1),
(2, NULL, 'MODULO', 'MOD_FACTURACION', 'menu.modulos.facturacion', 'Facturación', NULL, 'receipt', 10, 1),
(3, NULL, 'MODULO', 'MOD_PROYECTOS', 'menu.modulos.proyectos', 'Proyectos', NULL, 'folder', 20, 1);

-- Funciones del módulo Panel
INSERT INTO MOD_modulos_config (id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar, descripcion, url_path, icono, orden, activo) VALUES
(10, 1, 'FUNCION', 'DASHBOARD', 'menu.funciones.dashboard', 'Visión general', '/dashboard', 'home', 1, 1);

-- Funciones del módulo Facturación
INSERT INTO MOD_modulos_config (id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar, descripcion, url_path, icono, orden, activo) VALUES
(20, 2, 'FUNCION', 'FACTURAS_VENTAS', 'menu.funciones.facturas_emitidas', 'Facturas emitidas', '/facturas/emitidas', 'arrow-up-right', 1, 1),
(21, 2, 'FUNCION', 'FACTURAS_COMPRAS', 'menu.funciones.facturas_recibidas', 'Facturas recibidas', '/facturas/recibidas', 'arrow-down-left', 2, 1),
(22, 2, 'FUNCION', 'FACTURAS_NUEVA', 'menu.funciones.nueva_factura', 'Nueva factura', '/facturas/nueva', 'plus', 3, 1);

-- Funciones del módulo Proyectos
INSERT INTO MOD_modulos_config (id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar, descripcion, url_path, icono, orden, activo) VALUES
(30, 3, 'FUNCION', 'PROYECTOS_TODOS', 'menu.funciones.proyectos_todos', 'Todos los proyectos', '/proyectos', 'list', 1, 1),
(31, 3, 'FUNCION', 'PROYECTOS_NUEVO', 'menu.funciones.proyectos_nuevo', 'Nuevo proyecto', '/proyectos/nuevo', 'plus', 2, 1);
```
