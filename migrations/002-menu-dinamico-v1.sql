-- Migración: Menú Dinámico v1
-- Fecha: 2026-03-27
-- Descripción: Crea la tabla MOD_modulos_config para el menú dinámico del proyecto cbc-endes

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
