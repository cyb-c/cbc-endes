# Tipos TypeScript: Sistema de Auditoría de Eventos

**Versión:** 1.0  
**Fecha:** 27 de marzo de 2026  
**Propósito:** Tipos TypeScript para el sistema de auditoría de eventos

---

## Instrucciones

Copia el siguiente código TypeScript en un archivo en tu proyecto:

```bash
# Sugerencia de ubicación
mkdir -p src/types
# Crea el archivo src/types/pipeline-events.ts con el contenido de abajo
```

---

## Código TypeScript

```typescript
// ============================================================================
// Tipos TypeScript: Sistema de Auditoría de Eventos para Cloudflare D1
// ============================================================================
// Versión: 1.0
// Fecha: 27 de marzo de 2026
// Propósito: Tipos para el sistema de auditoría de eventos
// ============================================================================

// ============================================================================
// Tipos de Nivel de Evento
// ============================================================================

/**
 * Niveles de severidad permitidos para eventos
 * Corresponden al CHECK constraint en la base de datos
 */
export type PipelineEventLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

// ============================================================================
// Tipos de Evento
// ============================================================================

/**
 * Tipos de eventos predefinidos
 * Se pueden usar valores personalizados también
 */
export type PipelineEventType =
  | 'PROCESS_START'      // Inicio del proceso
  | 'PROCESS_COMPLETE'   // Proceso completado exitosamente
  | 'PROCESS_FAILED'     // Proceso falló
  | 'STEP_SUCCESS'       // Paso completado exitosamente
  | 'STEP_FAILED'        // Paso falló (con reintento o terminal)
  | 'STEP_ERROR'         // Error de negocio detectado
  | string               // Permitir valores personalizados

// ============================================================================
// Interfaz Principal: PipelineEvent
// ============================================================================

/**
 * Representa un evento en la tabla pipeline_eventos
 * Corresponde al schema de la base de datos
 */
export interface PipelineEvent {
  /** Identificador único autoincremental */
  id: number

  /** Clave de correlación del proceso */
  entityId: string

  /** Referencia opcional a entidad principal */
  entityRef: number | null

  /** Nombre del paso/proceso */
  paso: string

  /** Nivel de severidad del evento */
  nivel: PipelineEventLevel

  /** Tipo semántico del evento */
  tipoEvento: PipelineEventType

  /** Origen del evento (módulo/worker) */
  origen: string | null

  /** Código estructurado de error */
  errorCodigo: string | null

  /** Mensaje legible o payload JSON */
  detalle: string | null

  /** Duración del paso en milisegundos */
  duracionMs: number | null

  /** Timestamp ISO del evento */
  createdAt: string
}

// ============================================================================
// Interfaz: InsertPipelineEventParams
// ============================================================================

/**
 * Parámetros para insertar un nuevo evento
 * Todos los campos excepto entityId, paso, nivel y tipoEvento son opcionales
 */
export interface InsertPipelineEventParams {
  /** Clave de correlación del proceso (requerido) */
  entityId: string

  /** Referencia opcional a entidad principal */
  entityRef?: number

  /** Nombre del paso/proceso (requerido) */
  paso: string

  /** Nivel de severidad del evento (requerido) */
  nivel: PipelineEventLevel

  /** Tipo semántico del evento (requerido) */
  tipoEvento: PipelineEventType

  /** Origen del evento (módulo/worker) */
  origen?: string

  /** Código estructurado de error */
  errorCodigo?: string

  /** Mensaje legible o payload JSON (objeto o string) */
  detalle?: string | Record<string, unknown>

  /** Duración del paso en milisegundos */
  duracionMs?: number
}

// ============================================================================
// Interfaz: GetEntityEventsOptions
// ============================================================================

/**
 * Opciones para obtener eventos de una entidad
 */
export interface GetEntityEventsOptions {
  /** Límite de eventos a retornar (default: 100) */
  limit?: number

  /** Orden de los resultados (default: 'ASC') */
  order?: 'ASC' | 'DESC'
}

// ============================================================================
// Interfaz: GetErrorEventsFilters
// ============================================================================

/**
 * Filtros para obtener eventos con error
 */
export interface GetErrorEventsFilters {
  /** Filtrar por código de error específico */
  errorCodigo?: string

  /** Filtrar por nivel de evento */
  nivel?: string

  /** Filtrar eventos desde esta fecha (ISO string) */
  since?: string
}

// ============================================================================
// Interfaz: GetStepDurationMetricsOptions
// ============================================================================

/**
 * Opciones para obtener métricas de duración por paso
 */
export interface GetStepDurationMetricsOptions {
  /** Filtrar eventos desde esta fecha (ISO string) */
  since?: string

  /** Filtrar por paso específico */
  paso?: string
}

// ============================================================================
// Interfaz: StepDurationMetric
// ============================================================================

/**
 * Métrica de duración para un paso específico
 */
export interface StepDurationMetric {
  /** Nombre del paso */
  paso: string

  /** Duración promedio en milisegundos */
  promedio_ms: number

  /** Duración mínima en milisegundos */
  min_ms: number

  /** Duración máxima en milisegundos */
  max_ms: number

  /** Cantidad de eventos */
  cantidad: number
}

// ============================================================================
// Interfaz: PipelineEventCountByType
// ============================================================================

/**
 * Conteo de eventos por tipo
 */
export interface PipelineEventCountByType {
  /** Tipo de evento */
  tipo_evento: string

  /** Cantidad de eventos */
  cantidad: number
}

// ============================================================================
// Interfaz: LatestEventByEntity
// ============================================================================

/**
 * Último evento por entidad
 */
export interface LatestEventByEntity {
  /** ID de la entidad */
  entity_id: string

  /** ID del último evento */
  max_id: number
}

// ============================================================================
// Constantes: Valores por Defecto
// ============================================================================

/**
 * Valores por defecto para opciones
 */
export const DEFAULT_GET_ENTITY_EVENTS_OPTIONS: Required<GetEntityEventsOptions> = {
  limit: 100,
  order: 'ASC',
}

/**
 * Origen por defecto para eventos
 */
export const DEFAULT_ORIGEN = 'unknown'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Valida si un string es un PipelineEventLevel válido
 */
export function isValidPipelineEventLevel(value: string): value is PipelineEventLevel {
  return ['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(value)
}

/**
 * Valida si un objeto es un InsertPipelineEventParams válido
 */
export function isValidInsertPipelineEventParams(
  params: unknown
): params is InsertPipelineEventParams {
  if (typeof params !== 'object' || params === null) {
    return false
  }

  const p = params as Record<string, unknown>

  return (
    typeof p.entityId === 'string' &&
    typeof p.paso === 'string' &&
    isValidPipelineEventLevel(p.nivel as string) &&
    typeof p.tipoEvento === 'string'
  )
}

/**
 * Serializa el detalle a string JSON si es un objeto
 */
export function serializeDetalle(detalle: string | Record<string, unknown> | undefined): string | null {
  if (detalle === undefined || detalle === null) {
    return null
  }

  if (typeof detalle === 'string') {
    return detalle
  }

  return JSON.stringify(detalle)
}

/**
 * Deserializa el detalle si es JSON
 */
export function deserializeDetalle(detalle: string | null): string | Record<string, unknown> | null {
  if (detalle === null) {
    return null
  }

  try {
    return JSON.parse(detalle)
  } catch {
    return detalle
  }
}

// ============================================================================
// Exportaciones
// ============================================================================

export type {
  PipelineEvent,
  InsertPipelineEventParams,
  GetEntityEventsOptions,
  GetErrorEventsFilters,
  GetStepDurationMetricsOptions,
  StepDurationMetric,
  PipelineEventCountByType,
  LatestEventByEntity,
}

export {
  DEFAULT_GET_ENTITY_EVENTS_OPTIONS,
  DEFAULT_ORIGEN,
  isValidPipelineEventLevel,
  isValidInsertPipelineEventParams,
  serializeDetalle,
  deserializeDetalle,
}
```

---

## Uso de los Tipos

### Ejemplo: Insertar un evento

```typescript
import type { InsertPipelineEventParams } from './types/pipeline-events'

const params: InsertPipelineEventParams = {
  entityId: 'process-uuid-123',
  paso: 'PROCESS_DATA',
  nivel: 'INFO',
  tipoEvento: 'STEP_SUCCESS',
  detalle: { records: 150, duration: '2.5s' },
  duracionMs: 2500,
}
```

### Ejemplo: Usar helper de serialización

```typescript
import { serializeDetalle } from './types/pipeline-events'

const detalleStr = serializeDetalle({ records: 150, duration: '2.5s' })
// '{"records":150,"duration":"2.5s"}'
```

### Ejemplo: Validar parámetros

```typescript
import { isValidInsertPipelineEventParams } from './types/pipeline-events'

const params = { entityId: '123', paso: 'TEST', nivel: 'INFO', tipoEvento: 'STEP_SUCCESS' }

if (isValidInsertPipelineEventParams(params)) {
  // params es InsertPipelineEventParams
  await insertPipelineEvent(db, params)
}
```

---

**Fin de los Tipos TypeScript**
