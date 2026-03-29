# Librería de Funciones: Sistema de Auditoría de Eventos

**Versión:** 1.0  
**Fecha:** 27 de marzo de 2026  
**Propósito:** Librería de funciones para escribir y leer eventos en Cloudflare D1

---

## Instrucciones

Copia el siguiente código TypeScript en un archivo en tu proyecto:

```bash
# Sugerencia de ubicación
mkdir -p src/lib
# Crea el archivo src/lib/pipeline-events.ts con el contenido de abajo
```

**IMPORTANTE:** Ajusta las rutas de importación de tipos según tu estructura de carpetas.

---

## Código TypeScript

```typescript
// ============================================================================
// Librería: Sistema de Auditoría de Eventos para Cloudflare D1
// ============================================================================
// Versión: 1.0
// Fecha: 27 de marzo de 2026
// Propósito: Funciones para escribir y leer eventos en la tabla pipeline_eventos
// ============================================================================

// ============================================================================
// Importaciones
// ============================================================================

import type {
  PipelineEvent,
  InsertPipelineEventParams,
  GetEntityEventsOptions,
  GetErrorEventsFilters,
  GetStepDurationMetricsOptions,
  StepDurationMetric,
  PipelineEventCountByType,
} from '../types/pipeline-events' // <-- Ajusta esta ruta según tu proyecto

import {
  DEFAULT_GET_ENTITY_EVENTS_OPTIONS,
  DEFAULT_ORIGEN,
  serializeDetalle,
} from '../types/pipeline-events' // <-- Ajusta esta ruta según tu proyecto

// ============================================================================
// Función Principal: insertPipelineEvent
// ============================================================================

/**
 * Inserta un nuevo evento en la tabla pipeline_eventos
 *
 * @param db - Instancia de D1Database de Cloudflare
 * @param params - Parámetros del evento a insertar
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await insertPipelineEvent(db, {
 *   entityId: 'process-uuid-123',
 *   paso: 'PROCESS_DATA',
 *   nivel: 'INFO',
 *   tipoEvento: 'STEP_SUCCESS',
 *   detalle: { records: 150, duration: '2.5s' },
 *   duracionMs: 2500,
 * })
 * ```
 */
export async function insertPipelineEvent(
  db: D1Database,
  params: InsertPipelineEventParams,
): Promise<void> {
  const now = new Date().toISOString()
  const detalleStr = serializeDetalle(params.detalle)

  await db
    .prepare(
      `INSERT INTO pipeline_eventos
         (entity_id, entity_ref, paso, nivel, tipo_evento, origen, error_codigo, detalle, duracion_ms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      params.entityId,
      params.entityRef ?? null,
      params.paso,
      params.nivel,
      params.tipoEvento,
      params.origen ?? DEFAULT_ORIGEN,
      params.errorCodigo ?? null,
      detalleStr ?? null,
      params.duracionMs ?? null,
      now,
    )
    .run()
}

// ============================================================================
// Función: getEntityEvents
// ============================================================================

/**
 * Obtiene todos los eventos de una entidad específica
 *
 * @param db - Instancia de D1Database de Cloudflare
 * @param entityId - ID de la entidad
 * @param options - Opciones de consulta (limit, order)
 * @returns Promise<PipelineEvent[]>
 *
 * @example
 * ```typescript
 * const eventos = await getEntityEvents(db, 'process-uuid-123', {
 *   order: 'DESC',
 *   limit: 100,
 * })
 * ```
 */
export async function getEntityEvents(
  db: D1Database,
  entityId: string,
  options?: GetEntityEventsOptions,
): Promise<PipelineEvent[]> {
  const limit = options?.limit ?? DEFAULT_GET_ENTITY_EVENTS_OPTIONS.limit
  const order = options?.order ?? DEFAULT_GET_ENTITY_EVENTS_OPTIONS.order

  const result = await db
    .prepare(
      `SELECT
         id,
         entity_id AS entityId,
         entity_ref AS entityRef,
         paso,
         nivel,
         tipo_evento AS tipoEvento,
         origen,
         error_codigo AS errorCodigo,
         detalle,
         duracion_ms AS duracionMs,
         created_at AS createdAt
       FROM pipeline_eventos
       WHERE entity_id = ?
       ORDER BY id ${order}
       LIMIT ?`,
    )
    .bind(entityId, limit)
    .all()

  return result.results as PipelineEvent[]
}

// ============================================================================
// Función: getLatestEvent
// ============================================================================

/**
 * Obtiene el último evento de una entidad específica
 *
 * @param db - Instancia de D1Database de Cloudflare
 * @param entityId - ID de la entidad
 * @returns Promise<PipelineEvent | null>
 *
 * @example
 * ```typescript
 * const ultimoEvento = await getLatestEvent(db, 'process-uuid-123')
 * if (ultimoEvento) {
 *   console.log(`Último paso: ${ultimoEvento.paso}`)
 * }
 * ```
 */
export async function getLatestEvent(
  db: D1Database,
  entityId: string,
): Promise<PipelineEvent | null> {
  const result = await db
    .prepare(
      `SELECT
         id,
         entity_id AS entityId,
         entity_ref AS entityRef,
         paso,
         nivel,
         tipo_evento AS tipoEvento,
         origen,
         error_codigo AS errorCodigo,
         detalle,
         duracion_ms AS duracionMs,
         created_at AS createdAt
       FROM pipeline_eventos
       WHERE entity_id = ?
       ORDER BY id DESC
       LIMIT 1`,
    )
    .bind(entityId)
    .first()

  return (result as PipelineEvent) ?? null
}

// ============================================================================
// Función: getErrorEvents
// ============================================================================

/**
 * Obtiene eventos con error según filtros
 *
 * @param db - Instancia de D1Database de Cloudflare
 * @param filters - Filtros opcionales (errorCodigo, nivel, since)
 * @returns Promise<PipelineEvent[]>
 *
 * @example
 * ```typescript
 * const errores = await getErrorEvents(db, {
 *   errorCodigo: 'DATA_VALIDATION_FAILED',
 *   since: '2026-03-20T00:00:00Z',
 * })
 * ```
 */
export async function getErrorEvents(
  db: D1Database,
  filters?: GetErrorEventsFilters,
): Promise<PipelineEvent[]> {
  const conditions: string[] = []
  const bindings: unknown[] = []

  if (filters?.errorCodigo) {
    conditions.push('error_codigo = ?')
    bindings.push(filters.errorCodigo)
  }

  if (filters?.nivel) {
    conditions.push('nivel = ?')
    bindings.push(filters.nivel)
  }

  if (filters?.since) {
    conditions.push('created_at >= ?')
    bindings.push(filters.since)
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  const result = await db
    .prepare(
      `SELECT
         id,
         entity_id AS entityId,
         entity_ref AS entityRef,
         paso,
         nivel,
         tipo_evento AS tipoEvento,
         origen,
         error_codigo AS errorCodigo,
         detalle,
         duracion_ms AS duracionMs,
         created_at AS createdAt
       FROM pipeline_eventos
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT 100`,
    )
    .bind(...bindings)
    .all()

  return result.results as PipelineEvent[]
}

// ============================================================================
// Función: getStepDurationMetrics
// ============================================================================

/**
 * Obtiene métricas de duración por paso
 *
 * @param db - Instancia de D1Database de Cloudflare
 * @param options - Opciones opcionales (since, paso)
 * @returns Promise<StepDurationMetric[]>
 *
 * @example
 * ```typescript
 * const metricas = await getStepDurationMetrics(db, {
 *   since: '2026-03-20T00:00:00Z',
 * })
 * console.table(metricas)
 * ```
 */
export async function getStepDurationMetrics(
  db: D1Database,
  options?: GetStepDurationMetricsOptions,
): Promise<StepDurationMetric[]> {
  const conditions: string[] = ['duracion_ms IS NOT NULL']
  const bindings: unknown[] = []

  if (options?.since) {
    conditions.push('created_at >= ?')
    bindings.push(options.since)
  }

  if (options?.paso) {
    conditions.push('paso = ?')
    bindings.push(options.paso)
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  const result = await db
    .prepare(
      `SELECT
         paso,
         AVG(duracion_ms) AS promedio_ms,
         MIN(duracion_ms) AS min_ms,
         MAX(duracion_ms) AS max_ms,
         COUNT(*) AS cantidad
       FROM pipeline_eventos
       ${whereClause}
       GROUP BY paso
       ORDER BY promedio_ms DESC`,
    )
    .bind(...bindings)
    .all()

  return result.results as StepDurationMetric[]
}

// ============================================================================
// Función: getEventCountByType
// ============================================================================

/**
 * Obtiene el conteo de eventos por tipo
 *
 * @param db - Instancia de D1Database de Cloudflare
 * @param since - Fecha desde la que contar eventos (opcional)
 * @returns Promise<PipelineEventCountByType[]>
 *
 * @example
 * ```typescript
 * const conteo = await getEventCountByType(db, '2026-03-20T00:00:00Z')
 * console.table(conteo)
 * ```
 */
export async function getEventCountByType(
  db: D1Database,
  since?: string,
): Promise<PipelineEventCountByType[]> {
  const whereClause = since ? `WHERE created_at >= ?` : ''
  const bindings = since ? [since] : []

  const result = await db
    .prepare(
      `SELECT
         tipo_evento,
         COUNT(*) AS cantidad
       FROM pipeline_eventos
       ${whereClause}
       GROUP BY tipo_evento
       ORDER BY cantidad DESC`,
    )
    .bind(...bindings)
    .all()

  return result.results as PipelineEventCountByType[]
}

// ============================================================================
// Función: getLatestEventsByMultipleEntities
// ============================================================================

/**
 * Obtiene el último evento de múltiples entidades
 * Útil para dashboards de monitorización
 *
 * @param db - Instancia de D1Database de Cloudflare
 * @param limit - Límite de entidades a retornar (default: 20)
 * @param offset - Offset para paginación (default: 0)
 * @returns Promise<PipelineEvent[]>
 *
 * @example
 * ```typescript
 * const eventos = await getLatestEventsByMultipleEntities(db, 20, 0)
 * ```
 */
export async function getLatestEventsByMultipleEntities(
  db: D1Database,
  limit: number = 20,
  offset: number = 0,
): Promise<PipelineEvent[]> {
  // Primero obtenemos los IDs de las últimas entidades
  const entitiesResult = await db
    .prepare(
      `SELECT entity_id, MAX(id) AS max_id
       FROM pipeline_eventos
       GROUP BY entity_id
       ORDER BY max_id DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(limit, offset)
    .all()

  const entities = entitiesResult.results as { entity_id: string; max_id: number }[]

  // Luego obtenemos el último evento de cada entidad
  const eventos: PipelineEvent[] = []
  for (const entity of entities) {
    const evento = await getLatestEvent(db, entity.entity_id)
    if (evento) {
      eventos.push(evento)
    }
  }

  return eventos
}

// ============================================================================
// Función: deleteOldEvents (Opcional - con precaución)
// ============================================================================

/**
 * Elimina eventos antiguos según una fecha de corte
 * ⚠️ USAR CON PRECAUCIÓN: esta operación es destructiva
 *
 * @param db - Instancia de D1Database de Cloudflare
 * @param beforeDate - Fecha ISO antes de la cual eliminar eventos
 * @returns Promise<{ count: number }> - Cantidad de eventos eliminados
 *
 * @example
 * ```typescript
 * // Eliminar eventos de hace más de 90 días
 * const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
 * const result = await deleteOldEvents(db, ninetyDaysAgo)
 * console.log(`Eliminados ${result.count} eventos`)
 * ```
 */
export async function deleteOldEvents(
  db: D1Database,
  beforeDate: string,
): Promise<{ count: number }> {
  const result = await db
    .prepare(
      `DELETE FROM pipeline_eventos
       WHERE created_at < ?`,
    )
    .bind(beforeDate)
    .run()

  return { count: result.meta.rows_written ?? 0 }
}

// ============================================================================
// Exportaciones
// ============================================================================

export {
  insertPipelineEvent,
  getEntityEvents,
  getLatestEvent,
  getErrorEvents,
  getStepDurationMetrics,
  getEventCountByType,
  getLatestEventsByMultipleEntities,
  deleteOldEvents,
}
```

---

## Uso de la Librería

### Importar funciones

```typescript
import {
  insertPipelineEvent,
  getEntityEvents,
  getLatestEvent,
  getErrorEvents,
  getStepDurationMetrics,
  getEventCountByType,
  getLatestEventsByMultipleEntities,
} from '../lib/pipeline-events'
```

### Ejemplo completo: Procesamiento de datos

```typescript
// Inicio del proceso
await insertPipelineEvent(db, {
  entityId: 'process-uuid-123',
  paso: 'PROCESS_START',
  nivel: 'INFO',
  tipoEvento: 'PROCESS_START',
  origen: 'wk-processor',
})

// Procesamiento de datos
const startTime = Date.now()
try {
  // ... lógica de procesamiento ...

  await insertPipelineEvent(db, {
    entityId: 'process-uuid-123',
    paso: 'PROCESS_DATA',
    nivel: 'INFO',
    tipoEvento: 'STEP_SUCCESS',
    detalle: { records: 150, duration: '2.5s' },
    duracionMs: Date.now() - startTime,
  })

  await insertPipelineEvent(db, {
    entityId: 'process-uuid-123',
    paso: 'PROCESS_COMPLETE',
    nivel: 'INFO',
    tipoEvento: 'PROCESS_COMPLETE',
    duracionMs: Date.now() - startTime,
  })
} catch (error) {
  await insertPipelineEvent(db, {
    entityId: 'process-uuid-123',
    paso: 'PROCESS_DATA',
    nivel: 'ERROR',
    tipoEvento: 'PROCESS_FAILED',
    origen: 'wk-processor',
    errorCodigo: 'PROCESSING_ERROR',
    detalle: error instanceof Error ? error.message : String(error),
    duracionMs: Date.now() - startTime,
  })
}
```

---

**Fin de la Librería de Funciones**
