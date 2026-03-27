import type { D1Database } from '@cloudflare/workers-types'

import {
  insertPipelineEvent,
  getEntityEvents,
  getLatestEvent,
  getErrorEvents,
  getStepDurationMetrics,
} from '../lib/pipeline-events'

// Ejemplo 1: Insertar evento de éxito
async function ejemploInsertSuccess(db: D1Database) {
  await insertPipelineEvent(db, {
    entityId: 'process-uuid-123',
    paso: 'PROCESS_DATA',
    nivel: 'INFO',
    tipoEvento: 'STEP_SUCCESS',
    detalle: { records: 150, duration: '2.5s' },
    duracionMs: 2500,
  })
}

// Ejemplo 2: Insertar evento de error
async function ejemploInsertError(db: D1Database) {
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
}

// Ejemplo 3: Obtener cronología de eventos
async function ejemploGetEntityEvents(db: D1Database) {
  const eventos = await getEntityEvents(db, 'process-uuid-123', {
    order: 'DESC',
    limit: 100,
  })

  console.log('Cronología:', eventos)
}

// Ejemplo 4: Obtener último evento
async function ejemploGetLatestEvent(db: D1Database) {
  const ultimoEvento = await getLatestEvent(db, 'process-uuid-123')

  if (ultimoEvento) {
    console.log('Último paso:', ultimoEvento.paso)
    console.log('Nivel:', ultimoEvento.nivel)
  }
}

// Ejemplo 5: Obtener eventos con error
async function ejemploGetErrorEvents(db: D1Database) {
  const errores = await getErrorEvents(db, {
    errorCodigo: 'DATA_VALIDATION_FAILED',
    since: '2026-03-20T00:00:00Z',
  })

  console.log(`Se encontraron ${errores.length} errores`)
}

// Ejemplo 6: Obtener métricas de duración
async function ejemploGetStepDurationMetrics(db: D1Database) {
  const metricas = await getStepDurationMetrics(db, {
    since: '2026-03-20T00:00:00Z',
  })

  console.table(metricas)
}
