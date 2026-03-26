-- Migración inicial de prueba
-- Fecha: 2026-03-26

-- Tabla de migraciones
CREATE TABLE IF NOT EXISTS d1_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de prueba
CREATE TABLE IF NOT EXISTS test_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar dato de prueba
INSERT INTO test_items (name, description)
VALUES ('Item de prueba', 'Este es un item de prueba para validar D1');

-- Registrar migración
INSERT INTO d1_migrations (name) VALUES ('001-initial');
