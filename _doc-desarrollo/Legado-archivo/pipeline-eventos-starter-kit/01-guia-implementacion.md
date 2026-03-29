# Guía de Implementación: Sistema de Auditoría de Eventos

**Versión:** 1.0  
**Fecha:** 27 de marzo de 2026  
**Propósito:** Guía paso a paso para incorporar el sistema de auditoría a un proyecto existente en Cloudflare D1

---

## Índice

1. [Requisitos Previos](#1-requisitos-previos)
2. [Paso 1: Crear la Tabla en D1](#2-paso-1-crear-la-tabla-en-d1)
3. [Paso 2: Agregar Tipos TypeScript](#3-paso-2-agregar-tipos-typescript)
4. [Paso 3: Integrar la Librería](#4-paso-3-integrar-la-librería)
5. [Paso 4: Registrar Eventos en tu Pipeline](#4-paso-4-registrar-eventos-en-tu-pipeline)
6. [Paso 5: Consultar Eventos](#6-paso-5-consultar-eventos)
7. [Paso 6: Crear Endpoints HTTP (Opcional)](#7-paso-6-crear-endpoints-http-opcional)
8. [Paso 7: Migrar desde Schema Acoplado (Opcional)](#8-paso-7-migrar-desde-schema-acoplado-opcional)
9. [Ejemplos de Uso](#9-ejemplos-de-uso)
10. [Checklist de Implementación](#10-checklist-de-implementación)

---

## 1. Requisitos Previos

- Proyecto existente en Cloudflare Workers o Workers Pages
- Base de datos D1 ya creada
- TypeScript configurado en el proyecto
- Acceso a ejecutar comandos SQL en D1

---

## 2. Paso 1: Crear la Tabla en D1

### 2.1 Ejecutar el Schema SQL

Copia el contenido de [`02-schema-sql.sql`](02-schema-sql.sql) y ejecútalo en tu base de datos D1:

```bash
# Usando wrangler
npx wrangler d1 execute <TU_DATABASE> --file=./plans/pipeline-eventos-starter-kit/02-schema-sql.sql

# O usando el dashboard de Cloudflare
# Ve a D1 > Tu Database > Console > pega el SQL y ejecuta
```

### 2.2 Verificar la Creación

Ejecuta esta consulta para verificar que la tabla se creó correctamente:

```sql
SELECT name FROM sqlite_master WHERE type='table' AND name='pipeline_eventos';
```

Deberías ver `pipeline_eventos` en el resultado.

---

## 3. Paso 2: Agregar Tipos TypeScript

### 3.1 Copiar el Archivo de Tipos

Copia el contenido de [`03-types.ts`](03-types.ts) a tu proyecto:

```bash
# Sugerencia de ubicación
cp plans/pipeline-eventos-starter-kit/03-types.ts src/types/pipeline-events.ts
```

### 3.2 Ajustar Rutas de Importación

Si cambias la ubicación del archivo, ajusta las rutas de importación en [`04-lib-pipeline-events.ts`](04-lib-pipeline-events.ts):

```typescript
// Antes
import type { PipelineEvent, PipelineEventLevel, PipelineEventType, ... } from './types'

// Después (según tu ubicación)
import type { PipelineEvent, PipelineEventLevel, PipelineEventType, ... } from '../types/pipeline-events'
```

---

## 4. Paso 3: Integrar la Librería

### 4.1 Copiar la Librería

Copia el contenido de [`04-lib-pipeline-events.ts`](04-lib-pipeline-events.ts) a tu proyecto:

```bash
# Sugerencia de ubicación
cp plans/pipeline-eventos-starter-kit/04-lib-pipeline-events.ts src/lib/pipeline-events.ts
```

### 4.2 Ajustar Rutas de Importación

Si cambiaste la ubicación de los tipos, actualiza las importaciones en la librería:

```typescript
// Ajusta según tu estructura de carpetas
import type { ... } from '../types/pipeline-events'
```

---

## 4. Paso 4: Registrar Eventos en tu Pipeline

### 4.1 Importar la Función

```typescript
import { insertPipelineEvent } from '../lib/pipeline-events'
```

### 4.2 Registrar un Evento de Éxito

```typescript
await insertPipelineEvent(db, {
  entityId: 'process-uuid-123',
  paso: 'PROCESS_DATA',
  nivel: 'INFO',
  tipoEvento: 'STEP_SUCCESS',
  detalle: { records: 150, duration: '2.5s' },
  duracionMs: 2500,
})
```

### 4.3 Registrar un Evento de Error

```typescript
await insertPipelineEvent(db, {
  entityId: 'process-uuid-123',
  paso: 'PROCESS_DATA',
  nivel: 'ERROR',
  tipoEvento: 'STEP_FAILED',
  origen: 'wk-processor',
  errorCodigo: 'DATA_VALIDATION_FAILED',
  detalle: 'El campo "email" es inválido',
  duracionMs: 120,
})
```

### 4.4 Registrar un Evento de Advertencia

```typescript
await insertPipelineEvent(db, {
  entityId: 'process-uuid-123',
  paso: 'PROCESS_DATA',
  nivel: 'WARN',
  tipoEvento: 'STEP_ERROR',
  origen: 'wk-processor',
  errorCodigo: 'DUPLICATE_RECORD',
  detalle: { recordId: 456, action: 'skipped' },
  duracionMs: 50,
})
```

### 4.5 Usar Batch para Múltiples Operaciones

```typescript
await db.batch([
  db.prepare(
    `INSERT INTO pipeline_eventos
       (entity_id, paso, nivel, tipo_evento, origen, error_codigo, detalle, duracion_ms, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    entityId,
    paso,
    'ERROR',
    'STEP_FAILED',
    'wk-processor',
    errorCode,
    detalle,
    duracionMs ?? null,
    now,
  ),
  // ... otras operaciones
])
```

---

## 6. Paso 5: Consultar Eventos

### 6.1 Obtener Cronología de una Entidad

```typescript
import { getEntityEvents } from '../lib/pipeline-events'

const eventos = await getEntityEvents(db, 'process-uuid-123', {
  order: 'DESC',
  limit: 100,
})

console.log(eventos)
// [
//   { id: 15, paso: 'NOTIFY', nivel: 'INFO', ... },
//   { id: 14, paso: 'PROCESS_DATA', nivel: 'INFO', ... },
//   ...
// ]
```

### 6.2 Obtener Último Evento

```typescript
import { getLatestEvent } from '../lib/pipeline-events'

const ultimoEvento = await getLatestEvent(db, 'process-uuid-123')

if (ultimoEvento) {
  console.log(`Último paso: ${ultimoEvento.paso}`)
  console.log(`Nivel: ${ultimoEvento.nivel}`)
}
```

### 6.3 Obtener Eventos con Error

```typescript
import { getErrorEvents } from '../lib/pipeline-events'

const errores = await getErrorEvents(db, {
  errorCodigo: 'DATA_VALIDATION_FAILED',
  since: '2026-03-20T00:00:00Z',
})

console.log(`Se encontraron ${errores.length} errores`)
```

### 6.4 Obtener Métricas de Duración

```typescript
import { getStepDurationMetrics } from '../lib/pipeline-events'

const metricas = await getStepDurationMetrics(db, {
  since: '2026-03-20T00:00:00Z',
})

console.table(metricas)
// | paso              | promedio_ms | min_ms | max_ms | cantidad |
// |-------------------|-------------|--------|--------|----------|
// | PROCESS_DATA      | 2500        | 1200   | 4500   | 150      |
// | VALIDATE_DATA     | 500         | 100    | 1200   | 150      |
```

---

## 7. Paso 6: Crear Endpoints HTTP (Opcional)

### 7.1 Endpoint de Cronología

```typescript
// src/handlers/pipeline.ts
import { getEntityEvents } from '../lib/pipeline-events'

export async function handleGetPipelineCronologia(
  req: Request,
  env: Cloudflare.Env,
): Promise<Response> {
  const db = env.DB // Ajusta según tu configuración
  const url = new URL(req.url)
  const entityId = url.pathname.split('/').pop() ?? ''

  if (!entityId) {
    return Response.json({ error: 'entityId requerido' }, { status: 400 })
  }

  const eventos = await getEntityEvents(db, entityId, {
    order: 'DESC',
    limit: 100,
  })

  return Response.json({ data: { entityId, eventos } })
}
```

### 7.2 Endpoint de Monitor

```typescript
import { getLatestEvent } from '../lib/pipeline-events'

export async function handleGetPipelineMonitor(
  req: Request,
  env: Cloudflare.Env,
): Promise<Response> {
  const db = env.DB
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') ?? '20')
  const offset = parseInt(url.searchParams.get('offset') ?? '0')

  // Obtener últimos eventos de múltiples entidades
  const result = await db
    .prepare(
      `SELECT entity_id, MAX(id) AS max_id
       FROM pipeline_eventos
       GROUP BY entity_id
       ORDER BY max_id DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(limit, offset)
    .all()

  const eventos = []
  for (const row of result.results as { entity_id: string; max_id: number }[]) {
    const evento = await getLatestEvent(db, row.entity_id)
    if (evento) eventos.push(evento)
  }

  return Response.json({ data: eventos })
}
```

---

## 8. Paso 7: Migrar desde Schema Acoplado (Opcional)

Si tienes una tabla acoplada (como `fat_pipeline_eventos` del documento original), puedes migrar usando el script [`05-migracion.sql`](05-migracion.sql).

### 8.1 Ejecutar el Script de Migración

```bash
npx wrangler d1 execute <TU_DATABASE> --file=./plans/pipeline-eventos-starter-kit/05-migracion.sql
```

### 8.2 Actualizar el Código

Reemplaza todas las referencias a `insertPipelineEvento` con `insertPipelineEvent`:

```typescript
// Antes
import { insertPipelineEvento } from './lib/archivos'
await insertPipelineEvento(db, {
  invoiceId: 'uuid-123',
  // ...
})

// Después
import { insertPipelineEvent } from './lib/pipeline-events'
await insertPipelineEvent(db, {
  entityId: 'uuid-123',
  // ...
})
```

---

## 9. Ejemplos de Uso

### 9.1 Procesamiento de Imágenes

```typescript
// Upload de imagen
await insertPipelineEvent(db, {
  entityId: 'img-550e8400-e29b-41d4-a716-446655440000',
  paso: 'UPLOAD',
  nivel: 'INFO',
  tipoEvento: 'STEP_SUCCESS',
  detalle: { bucket: 'uploads', key: 'img-550e.jpg', size: 2048576 },
  duracionMs: 150,
})

// Extracción OCR
await insertPipelineEvent(db, {
  entityId: 'img-550e8400-e29b-41d4-a716-446655440000',
  paso: 'OCR_EXTRACT',
  nivel: 'ERROR',
  tipoEvento: 'STEP_ERROR',
  origen: 'wk-image-processor',
  errorCodigo: 'OCR_NO_TEXT_DETECTED',
  detalle: 'La imagen no contiene texto legible',
  duracionMs: 3500,
})
```

### 9.2 Importación de Datos

```typescript
// Validación CSV
await insertPipelineEvent(db, {
  entityId: 'import-2026032701',
  entityRef: 456,
  paso: 'VALIDATE_CSV',
  nivel: 'WARN',
  tipoEvento: 'STEP_ERROR',
  origen: 'wk-import',
  errorCodigo: 'CSV_MISSING_COLUMNS',
  detalle: { expected: ['id', 'name', 'email'], found: ['id', 'name'] },
  duracionMs: 50,
})

// Inserción de registros
await insertPipelineEvent(db, {
  entityId: 'import-2026032701',
  paso: 'INSERT_RECORDS',
  nivel: 'INFO',
  tipoEvento: 'STEP_SUCCESS',
  detalle: { inserted: 1500, skipped: 23, duplicates: 5 },
  duracionMs: 12500,
})
```

### 9.3 Deploy de Aplicaciones

```typescript
// Build
await insertPipelineEvent(db, {
  entityId: 'deploy-abc123',
  paso: 'BUILD',
  nivel: 'INFO',
  tipoEvento: 'STEP_SUCCESS',
  origen: 'wk-deploy',
  detalle: { duration: '45s', artifacts: ['app.jar', 'lib.zip'] },
  duracionMs: 45000,
})

// Deploy a staging
await insertPipelineEvent(db, {
  entityId: 'deploy-abc123',
  paso: 'DEPLOY_TO_STAGING',
  nivel: 'ERROR',
  tipoEvento: 'STEP_FAILED',
  errorCodigo: 'K8S_DEPLOY_FAILED',
  detalle: 'Error: ImagePullBackOff - registry credentials expired',
  duracionMs: 120000,
})
```

---

## 10. Checklist de Implementación

- [ ] Crear la tabla `pipeline_eventos` en D1
- [ ] Copiar tipos TypeScript al proyecto
- [ ] Copiar librería al proyecto
- [ ] Ajustar rutas de importación
- [ ] Integrar `insertPipelineEvent` en el pipeline
- [ ] Definir convenciones de nombres para `paso`
- [ ] Definir taxonomía de `error_codigo`
- [ ] Crear endpoints HTTP (si aplica)
- [ ] Migrar desde schema acoplado (si aplica)
- [ ] Probar con datos reales
- [ ] Definir política de retención
- [ ] Documentar uso en el proyecto

---

**Fin de la Guía de Implementación**
