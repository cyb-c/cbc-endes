# Script de Migración: Desde Schema Acoplado a Genérico

**Versión:** 1.0  
**Fecha:** 27 de marzo de 2026  
**Propósito:** Migrar datos desde un schema acoplado (ej: `fat_pipeline_eventos`) al schema genérico

---

## Advertencia Importante

⚠️ **Este script es destructivo.** Realiza un backup de tu base de datos antes de ejecutarlo.

```bash
# Backup usando wrangler
npx wrangler d1 export <TU_DATABASE> --output=backup-$(date +%Y%m%d).sql
```

---

## Cuándo Usar Este Script

Usa este script de migración si:

1. Tienes una tabla acoplada al dominio (ej: `fat_pipeline_eventos` con `invoice_id`, `factura_id`)
2. Quieres migrar al schema genérico (`pipeline_eventos` con `entity_id`, `entity_ref`)
3. Quieres mantener compatibilidad temporal mediante una vista

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
-- Script de Migración: Desde Schema Acoplado a Genérico
-- ============================================================================
-- Versión: 1.0
-- Fecha: 27 de marzo de 2026
-- Propósito: Migrar datos desde fat_pipeline_eventos a pipeline_eventos
-- ============================================================================

-- ============================================================================
-- Paso 1: Crear nueva tabla genérica
-- ============================================================================

CREATE TABLE IF NOT EXISTS pipeline_eventos (
  id          INTEGER PRIMARY KEY,
  entity_id   TEXT NOT NULL,
  entity_ref  INTEGER,
  paso        TEXT NOT NULL,
  nivel       TEXT NOT NULL
    CHECK(nivel IN ('DEBUG','INFO','WARN','ERROR')),
  tipo_evento TEXT NOT NULL,
  origen      TEXT,
  error_codigo TEXT,
  detalle     TEXT,
  duracion_ms INTEGER,
  created_at  TEXT NOT NULL
);

-- ============================================================================
-- Paso 2: Migrar datos (mapeando invoice_id → entity_id, factura_id → entity_ref)
-- ============================================================================

INSERT INTO pipeline_eventos
  (entity_id, entity_ref, paso, nivel, tipo_evento, origen, error_codigo, detalle, duracion_ms, created_at)
SELECT
  invoice_id,           -- → entity_id
  factura_id,           -- → entity_ref
  paso,
  nivel,
  tipo_evento,
  origen,
  error_codigo,
  detalle,
  duracion_ms,
  created_at
FROM fat_pipeline_eventos;

-- ============================================================================
-- Paso 3: Crear índices en la nueva tabla
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pe_entity_id ON pipeline_eventos(entity_id);
CREATE INDEX IF NOT EXISTS idx_pe_error ON pipeline_eventos(error_codigo);
CREATE INDEX IF NOT EXISTS idx_pe_paso_nivel ON pipeline_eventos(paso, nivel);

-- ============================================================================
-- Paso 4: Renombrar tabla original
-- ============================================================================

ALTER TABLE fat_pipeline_eventos RENAME TO fat_pipeline_eventos_old;

-- ============================================================================
-- Paso 5: Crear vista para compatibilidad temporal
-- ============================================================================

CREATE VIEW fat_pipeline_eventos AS
  SELECT
    id,
    entity_id AS invoice_id,
    entity_ref AS factura_id,
    paso,
    nivel,
    tipo_evento,
    origen,
    error_codigo,
    detalle,
    duracion_ms,
    created_at
  FROM pipeline_eventos;

-- ============================================================================
-- Paso 6: Verificar la migración
-- ============================================================================

-- Verificar cantidad de registros migrados
SELECT 'Registros en tabla original' AS descripcion, COUNT(*) AS cantidad FROM fat_pipeline_eventos_old
UNION ALL
SELECT 'Registros en tabla nueva', COUNT(*) FROM pipeline_eventos;

-- Verificar muestra de datos migrados
SELECT * FROM pipeline_eventos LIMIT 5;

-- ============================================================================
-- Paso 7: Eliminar tabla original (opcional - después de validar)
-- ============================================================================

-- ⚠️ SOLO EJECUTAR DESPUÉS DE VALIDAR LA MIGRACIÓN
-- DROP TABLE IF EXISTS fat_pipeline_eventos_old;

-- ⚠️ SOLO EJECUTAR DESPUÉS DE ACTUALIZAR EL CÓDIGO
-- DROP VIEW IF EXISTS fat_pipeline_eventos;
```

---

## Pasos de Validación

### 1. Verificar Cantidad de Registros

```sql
SELECT 'Registros en tabla original' AS descripcion, COUNT(*) AS cantidad FROM fat_pipeline_eventos_old
UNION ALL
SELECT 'Registros en tabla nueva', COUNT(*) FROM pipeline_eventos;
```

**Resultado esperado:** Ambas cantidades deben ser iguales.

### 2. Verificar Muestra de Datos

```sql
SELECT * FROM pipeline_eventos LIMIT 5;
```

**Resultado esperado:** Los datos deben ser idénticos a la tabla original.

### 3. Verificar Índices

```sql
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='pipeline_eventos';
```

**Resultado esperado:**
- `idx_pe_entity_id`
- `idx_pe_error`
- `idx_pe_paso_nivel`

### 4. Verificar Vista de Compatibilidad

```sql
SELECT * FROM fat_pipeline_eventos LIMIT 5;
```

**Resultado esperado:** La vista debe retornar los mismos datos con los nombres originales (`invoice_id`, `factura_id`).

---

## Actualización del Código

Después de validar la migración, actualiza tu código para usar el nuevo schema:

### Antes (Schema Acoplado)

```typescript
import { insertPipelineEvento } from './lib/archivos'

await insertPipelineEvento(db, {
  invoiceId: 'uuid-123',
  facturaId: 123,
  paso: 'PROCESS_DATA',
  nivel: 'INFO',
  tipoEvento: 'STEP_SUCCESS',
  detalle: 'nif=B12345678 numero=F2024-001',
  duracionMs: 2500,
})
```

### Después (Schema Genérico)

```typescript
import { insertPipelineEvent } from './lib/pipeline-events'

await insertPipelineEvent(db, {
  entityId: 'uuid-123',
  entityRef: 123,
  paso: 'PROCESS_DATA',
  nivel: 'INFO',
  tipoEvento: 'STEP_SUCCESS',
  detalle: { nif: 'B12345678', numero: 'F2024-001' },
  duracionMs: 2500,
})
```

---

## Limpieza Final

Después de actualizar el código y validar que todo funciona correctamente:

### 1. Eliminar Tabla Original

```sql
DROP TABLE IF EXISTS fat_pipeline_eventos_old;
```

### 2. Eliminar Vista de Compatibilidad

```sql
DROP VIEW IF EXISTS fat_pipeline_eventos;
```

---

## Rollback (Si es Necesario)

Si algo sale mal, puedes revertir la migración:

```sql
-- Eliminar vista de compatibilidad
DROP VIEW IF EXISTS fat_pipeline_eventos;

-- Eliminar tabla nueva
DROP TABLE IF EXISTS pipeline_eventos;

-- Restaurar tabla original
ALTER TABLE fat_pipeline_eventos_old RENAME TO fat_pipeline_eventos;
```

---

## Notas Importantes

1. **Tiempo de inactividad:** La migración requiere un breve tiempo de inactividad mientras se ejecutan los comandos.

2. **Volumen de datos:** Si tienes millones de registros, considera hacer la migración por lotes.

3. **Pruebas en staging:** Ejecuta primero el script en un entorno de staging.

4. **Backup obligatorio:** Siempre haz un backup antes de ejecutar el script.

5. **Validación completa:** No elimines la tabla original hasta validar completamente la migración.

---

**Fin del Script de Migración**
