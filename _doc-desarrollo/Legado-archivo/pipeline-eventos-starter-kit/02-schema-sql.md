# Schema SQL: Sistema de Auditoría de Eventos

**Versión:** 1.0  
**Fecha:** 27 de marzo de 2026  
**Propósito:** Tabla de auditoría tipo event stream genérica y reutilizable

---

## Instrucciones

Copia el siguiente código SQL y ejecútalo en tu base de datos D1:

```bash
# Usando wrangler
npx wrangler d1 execute <TU_DATABASE> --file=<(cat <<'EOF'
# (pega el SQL aquí)
EOF
)

# O usando el dashboard de Cloudflare
# Ve a D1 > Tu Database > Console > pega el SQL y ejecuta
```

---

## Código SQL

```sql
-- ============================================================================
-- Schema SQL: Sistema de Auditoría de Eventos para Cloudflare D1
-- ============================================================================
-- Versión: 1.0
-- Fecha: 27 de marzo de 2026
-- Propósito: Tabla de auditoría tipo event stream genérica y reutilizable
-- ============================================================================

-- ============================================================================
-- Tabla Principal: pipeline_eventos
-- ============================================================================
-- Descripción: Tabla append-only para registrar eventos de procesamiento
-- Patrón: Event stream (solo INSERT, nunca UPDATE ni DELETE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pipeline_eventos (
  -- Identificador único autoincremental
  id          INTEGER PRIMARY KEY,

  -- Clave de correlación del proceso (ej: UUID de proceso)
  -- NOT NULL: siempre debe haber un identificador del proceso
  entity_id   TEXT NOT NULL,

  -- Referencia opcional a entidad principal (ej: ID de registro en otra tabla)
  -- Nullable: el error puede ocurrir antes de crear la entidad principal
  entity_ref  INTEGER,

  -- Nombre del paso/proceso (ej: 'UPLOAD', 'PROCESS_DATA', 'VALIDATE')
  -- NOT NULL: siempre debe identificar el paso
  paso        TEXT NOT NULL,

  -- Nivel de severidad del evento
  -- CHECK constraint: solo permite valores predefinidos
  nivel       TEXT NOT NULL
    CHECK(nivel IN ('DEBUG','INFO','WARN','ERROR')),

  -- Tipo semántico del evento
  -- Ejemplos: 'STEP_SUCCESS', 'STEP_FAILED', 'PROCESS_START', 'PROCESS_COMPLETE'
  tipo_evento TEXT NOT NULL,

  -- Origen del evento (módulo/worker que genera el evento)
  -- Nullable: útil para identificar la fuente del evento
  origen      TEXT,

  -- Código estructurado de error
  -- Ejemplos: 'DATA_VALIDATION_FAILED', 'OCR_NO_TEXT_DETECTED'
  -- Nullable: solo para eventos de error
  error_codigo TEXT,

  -- Mensaje legible o payload JSON
  -- Puede ser texto plano o JSON serializado
  detalle     TEXT,

  -- Duración del paso en milisegundos
  -- Nullable: útil para métricas de rendimiento
  duracion_ms INTEGER,

  -- Timestamp ISO del evento
  -- DEFAULT: se establece automáticamente al insertar
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- Índices
-- ============================================================================

-- Índice para búsqueda por entity_id
-- Propósito: Obtener todos los eventos de un proceso (cronología)
CREATE INDEX IF NOT EXISTS idx_pe_entity_id ON pipeline_eventos(entity_id);

-- Índice para búsqueda por código de error
-- Propósito: Filtrar eventos por tipo de error específico
CREATE INDEX IF NOT EXISTS idx_pe_error ON pipeline_eventos(error_codigo);

-- Índice compuesto para filtros por paso y nivel
-- Propósito: Consultas compuestas (ej: errores en un paso específico)
CREATE INDEX IF NOT EXISTS idx_pe_paso_nivel ON pipeline_eventos(paso, nivel);

-- ============================================================================
-- Índices Sugeridos (Opcionales - comentados por defecto)
-- ============================================================================

-- Índice para optimizar subquery de último evento
-- CREATE INDEX IF NOT EXISTS idx_pe_entity_id_id_desc ON pipeline_eventos(entity_id, id DESC);

-- Índice para consultas de errores recientes
-- CREATE INDEX IF NOT EXISTS idx_pe_nivel_created_at ON pipeline_eventos(nivel, created_at DESC);

-- Índice para análisis de rendimiento por paso
-- CREATE INDEX IF NOT EXISTS idx_pe_paso_duracion ON pipeline_eventos(paso, duracion_ms);
```

---

## Consultas de Ejemplo

### Obtener todos los eventos de un proceso (cronología)

```sql
SELECT * FROM pipeline_eventos
WHERE entity_id = ?
ORDER BY id DESC;
```

### Obtener último evento de un proceso

```sql
SELECT * FROM pipeline_eventos
WHERE entity_id = ?
ORDER BY id DESC
LIMIT 1;
```

### Obtener eventos con error por código

```sql
SELECT entity_id, paso, detalle, created_at
FROM pipeline_eventos
WHERE error_codigo = ?
ORDER BY created_at DESC;
```

### Obtener eventos por nivel y paso

```sql
SELECT entity_id, detalle, created_at
FROM pipeline_eventos
WHERE nivel = 'ERROR'
  AND paso = 'PROCESS_DATA'
ORDER BY created_at DESC;
```

### Conteo de eventos por tipo

```sql
SELECT tipo_evento, COUNT(*) AS cantidad
FROM pipeline_eventos
WHERE created_at >= datetime('now', '-7 days')
GROUP BY tipo_evento;
```

### Duración promedio por paso

```sql
SELECT
  paso,
  AVG(duracion_ms) AS duracion_promedio_ms,
  MIN(duracion_ms) AS min_ms,
  MAX(duracion_ms) AS max_ms,
  COUNT(*) AS cantidad
FROM pipeline_eventos
WHERE duracion_ms IS NOT NULL
GROUP BY paso
ORDER BY duracion_promedio_ms DESC;
```

---

## Notas de Diseño

1. **No hay Foreign Keys:**
   - `entity_ref` no tiene FK declarativa para evitar bloqueos durante el pipeline
   - La relación con otras tablas es lógica, no declarativa

2. **Append-only:**
   - Solo se permite INSERT
   - Nunca UPDATE ni DELETE
   - Garantiza inmutabilidad de los eventos

3. **CHECK constraint en nivel:**
   - Solo permite: `DEBUG`, `INFO`, `WARN`, `ERROR`
   - Evita valores inconsistentes

4. **Índices:**
   - `idx_pe_entity_id`: para cronología de un proceso
   - `idx_pe_error`: para filtrar por código de error
   - `idx_pe_paso_nivel`: para filtros compuestos

5. **created_at:**
   - Usa `datetime('now')` de SQLite
   - Formato ISO: `"2026-03-27T10:30:00Z"`

6. **Volumen estimado:**
   - ~1000 eventos/día (ajustar según tu caso)
   - ~30,000 eventos/mes
   - Considerar política de retención (ej: archivar eventos > 90 días)

7. **Particionamiento:**
   - Si el volumen supera 1M eventos, considerar particionamiento por fecha
   - Cloudflare D1 puede soportar particionamiento en el futuro

---

**Fin del Schema SQL**
