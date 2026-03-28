# Estrategia de Manejo de Errores - Proyectos PAI

**Versión:** 1.0  
**Fecha:** 28 de marzo de 2026  
**Propósito:** Documentar la estrategia de manejo de errores para endpoints PAI

---

## Índice

1. [Principios Generales](#1-principios-generales)
2. [Códigos de Error](#2-códigos-de-error)
3. [Manejo de Errores por Endpoint](#3-manejo-de-errores-por-endpoint)
4. [Timeout y Reintentos](#4-timeout-y-reintentos)
5. [Registro de Errores en Pipeline](#5-registro-de-errores-en-pipeline)
6. [Ejemplos de Implementación](#6-ejemplos-de-implementación)

---

## 1. Principios Generales

### 1.1. Formato de Respuesta de Error

Todos los endpoints PAI retornan errores en el siguiente formato:

```typescript
interface ErrorResponse {
  error: {
    code: string      // Código de error estructurado
    message: string   // Mensaje legible para el usuario
    details?: unknown // Detalles opcionales (solo en desarrollo)
  }
}
```

### 1.2. Códigos de Estado HTTP

| Código | Uso |
|--------|-----|
| `200` | Éxito |
| `201` | Recurso creado exitosamente |
| `400` | Bad Request - Datos de entrada inválidos |
| `404` | Not Found - Recurso no encontrado |
| `403` | Forbidden - Acción no permitida (ej: nota no editable) |
| `409` | Conflict - Recurso ya existe o estado no permite la acción |
| `500` | Internal Server Error - Error inesperado del servidor |

### 1.3. Clasificación de Errores

| Tipo | Descripción | Acción |
|------|-------------|--------|
| **Error de Validación** | Datos de entrada inválidos | Retornar 400 con mensaje descriptivo |
| **Error de Recurso** | Recurso no encontrado | Retornar 404 |
| **Error de Estado** | Estado no permite la acción | Retornar 403 o 409 |
| **Error de Timeout** | Operación excedió tiempo límite | Retornar 500 con código `ANALYSIS_TIMEOUT` |
| **Error Inesperado** | Error no manejado | Retornar 500, registrar en pipeline |

---

## 2. Códigos de Error

### 2.1. Errores de Creación de Proyecto

| Código | HTTP | Descripción |
|--------|------|-------------|
| `INVALID_IJSON` | 400 | El IJSON no es JSON válido o falta campos obligatorios |
| `ESTADO_NO_ENCONTRADO` | 500 | El estado CREADO no existe en la base de datos |
| `DB_INSERT_ERROR` | 500 | Error al insertar proyecto en la base de datos |

### 2.2. Errores de Obtención de Proyecto

| Código | HTTP | Descripción |
|--------|------|-------------|
| `PROYECTO_NO_ENCONTRADO` | 404 | El proyecto con el ID especificado no existe |
| `ID_INVALIDO` | 400 | El ID de proyecto no es un número válido |

### 2.3. Errores de Listado de Proyectos

| Código | HTTP | Descripción |
|--------|------|-------------|
| `PARAMETROS_INVALIDOS` | 400 | Parámetros de query inválidos |
| `DB_QUERY_ERROR` | 500 | Error al consultar la base de datos |

### 2.4. Errores de Análisis

| Código | HTTP | Descripción |
|--------|------|-------------|
| `ANALYSIS_TIMEOUT` | 500 | El análisis excedió los 30 segundos máximos |
| `ESTADO_NO_PERMITE` | 409 | El estado actual no permite ejecutar/re-ejecutar análisis |
| `R2_SAVE_ERROR` | 500 | Error al guardar artefactos en R2 |
| `DB_INSERT_ERROR` | 500 | Error al registrar artefactos en la base de datos |
| `VAL_ID_NO_ENCONTRADO` | 500 | No se encontró el VAL_id para un tipo de artefacto |

### 2.5. Errores de Notas

| Código | HTTP | Descripción |
|--------|------|-------------|
| `DATOS_INVALIDOS` | 400 | Faltan campos requeridos (tipo_nota_id, autor, contenido) |
| `NOTA_NO_ENCONTRADA` | 404 | La nota con el ID especificado no existe |
| `NOTA_NO_EDITABLE` | 403 | La nota no es editable porque el estado del proyecto cambió |

### 2.6. Errores de Cambio de Estado

| Código | HTTP | Descripción |
|--------|------|-------------|
| `ESTADO_INVALIDO` | 400 | El estado_id especificado no existe |
| `ESTADO_NO_ENCONTRADO` | 500 | El nuevo estado no existe en la base de datos |

### 2.7. Errores de Eliminación

| Código | HTTP | Descripción |
|--------|------|-------------|
| `R2_DELETE_ERROR` | 500 | Error al eliminar carpeta en R2 |
| `DB_DELETE_ERROR` | 500 | Error al eliminar registros de la base de datos |

---

## 3. Manejo de Errores por Endpoint

### 3.1. POST /api/pai/proyectos

```typescript
try {
  // Validar IJSON
  const validacion = validarIJSON(ijson)
  if (!validacion.valido) {
    return c.json({ error: validacion.error }, 400) // INVALID_IJSON
  }
  
  // Obtener estado CREADO
  const estadoResult = await db.prepare(...).first()
  if (!estadoResult) {
    return c.json({ error: 'Estado CREADO no encontrado' }, 500)
  }
  
  // Insertar proyecto
  const insertResult = await db.prepare(...).run()
  
  return c.json({ proyecto: {...} }, 201)
} catch (error) {
  console.error('Error al crear proyecto:', error)
  return c.json({ error: 'Error interno del servidor' }, 500)
}
```

### 3.2. GET /api/pai/proyectos/:id

```typescript
try {
  const proyecto = await db.prepare(...).bind(proyectoId).first()
  
  if (!proyecto) {
    return c.json({ error: 'Proyecto no encontrado' }, 404)
  }
  
  return c.json({ proyecto, artefactos, notas })
} catch (error) {
  console.error('Error al obtener proyecto:', error)
  return c.json({ error: 'Error interno del servidor' }, 500)
}
```

### 3.3. POST /api/pai/proyectos/:id/analisis

```typescript
try {
  // Ejecutar con timeout y reintentos
  const resultado = await ejecutarConReintento(async () => {
    return await ejecutarConTimeout(async () => {
      return await ejecutarAnalisisCompleto(env, db, proyectoId, ijson)
    }, ANALYSIS_TIMEOUT_MS, 'ejecutarAnalisisCompleto')
  }, MAX_RETRIES, RETRY_BASE_DELAY_MS)
  
  if (!resultado.exito) {
    return c.json({ 
      error: {
        code: resultado.error_codigo,
        message: resultado.error_mensaje
      }
    }, resultado.error_codigo === 'ESTADO_NO_PERMITE' ? 409 : 500)
  }
  
  return c.json({ proyecto, artefactos_generados })
} catch (error) {
  console.error('Error al ejecutar análisis:', error)
  return c.json({ error: 'Error interno del servidor' }, 500)
}
```

### 3.4. PUT /api/pai/proyectos/:id/notas/:notaId

```typescript
try {
  // Verificar editabilidad
  const editable = await esNotaEditable(db, proyectoId, notaFechaCreacion)
  
  if (!editable) {
    return c.json({ 
      error: 'La nota no es editable. El estado del proyecto ha cambiado.' 
    }, 403) // NOTA_NO_EDITABLE
  }
  
  // Actualizar nota
  await db.prepare(...).run()
  
  return c.json({ nota: {...} })
} catch (error) {
  console.error('Error al editar nota:', error)
  return c.json({ error: 'Error interno del servidor' }, 500)
}
```

---

## 4. Timeout y Reintentos

### 4.1. Timeout de Análisis

**Configuración:**
```typescript
const ANALYSIS_TIMEOUT_MS = 30000 // 30 segundos
```

**Implementación:**
```typescript
async function ejecutarConTimeout<T>(
  operacion: () => Promise<T>,
  timeoutMs: number,
  contexto: string,
): Promise<T> {
  return Promise.race([
    operacion(),
    createTimeout(timeoutMs, contexto),
  ])
}

function createTimeout(ms: number, contexto: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout después de ${ms}ms: ${contexto}`))
    }, ms)
  })
}
```

**Manejo de Error:**
- Código: `ANALYSIS_TIMEOUT`
- HTTP: 500
- Registro en Pipeline: `PROCESS_FAILED` con `errorCodigo: 'ANALYSIS_TIMEOUT'`

### 4.2. Reintentos con Backoff Exponencial

**Configuración:**
```typescript
const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 1000 // 1 segundo
```

**Secuencia de Reintentos:**
- Intento 1: Inmediato
- Intento 2: Después de 1s
- Intento 3: Después de 2s
- Intento 4: Después de 4s (último)

**Implementación:**
```typescript
async function ejecutarConReintento<T>(
  operacion: () => Promise<T>,
  maxReintentos: number = MAX_RETRIES,
  baseDelay: number = RETRY_BASE_DELAY_MS,
): Promise<T> {
  let ultimoError: Error | null = null

  for (let intento = 1; intento <= maxReintentos; intento++) {
    try {
      return await operacion()
    } catch (error) {
      ultimoError = error as Error
      
      if (intento < maxReintentos) {
        const delay = baseDelay * Math.pow(2, intento - 1)
        console.warn(`Reintento ${intento}/${maxReintentos} después de ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw ultimoError
}
```

**Cuándo Usar Reintentos:**
- ✅ Operaciones idempotentes (ej: guardar en R2)
- ✅ Errores transitorios de red
- ✅ Timeouts temporales

**Cuándo NO Usar Reintentos:**
- ❌ Errores de validación (400)
- ❌ Errores de recurso no encontrado (404)
- ❌ Errores de estado/conflicto (403, 409)

---

## 5. Registro de Errores en Pipeline

### 5.1. Eventos de Error

Todos los errores críticos deben registrarse en `pipeline_eventos`:

```typescript
await insertPipelineEvent(db, {
  entityId: `proyecto-${proyectoId}`,
  paso: 'ejecutar_analisis',
  nivel: 'ERROR',
  tipoEvento: 'PROCESS_FAILED',
  errorCodigo: 'ANALYSIS_TIMEOUT', // o el código correspondiente
  detalle: error instanceof Error ? error.message : 'Error desconocido',
})
```

### 5.2. Niveles de Error

| Nivel | Uso |
|-------|-----|
| `DEBUG` | Información de depuración (no usado en producción) |
| `INFO` | Eventos exitosos |
| `WARN` | Advertencias no bloqueantes |
| `ERROR` | Errores bloqueantes o fallos de proceso |

### 5.3. Tipos de Evento de Error

| Tipo | Descripción |
|------|-------------|
| `PROCESS_START` | Inicio del proceso |
| `PROCESS_COMPLETE` | Proceso completado exitosamente |
| `PROCESS_FAILED` | Proceso falló (error terminal) |
| `STEP_SUCCESS` | Paso completado exitosamente |
| `STEP_FAILED` | Paso falló (con reintento o terminal) |
| `STEP_ERROR` | Error de negocio detectado |

---

## 6. Ejemplos de Implementación

### 6.1. Ejemplo Completo - Crear Proyecto

```typescript
export async function handleCrearProyecto(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const entityId = `proyecto-${Date.now()}`

  try {
    // 1. Registrar inicio
    await insertPipelineEvent(db, {
      entityId,
      paso: 'crear_proyecto',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_START',
      detalle: 'Iniciando creación de proyecto',
    })

    // 2. Obtener y validar datos
    const body = await c.req.json<{ ijson: string }>()
    const { ijson } = body

    if (!ijson || typeof ijson !== 'string') {
      return c.json({
        error: {
          code: 'INVALID_IJSON',
          message: 'El campo ijson es requerido y debe ser un string',
        },
      }, 400)
    }

    // 3. Validar IJSON
    const validacion = validarIJSON(ijson)
    if (!validacion.valido) {
      await insertPipelineEvent(db, {
        entityId,
        paso: 'validar_ijson',
        nivel: 'ERROR',
        tipoEvento: 'STEP_FAILED',
        errorCodigo: 'INVALID_IJSON',
        detalle: validacion.error,
      })

      return c.json({ error: validacion.error }, 400)
    }

    await insertPipelineEvent(db, {
      entityId,
      paso: 'validar_ijson',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      detalle: 'IJSON validado correctamente',
    })

    // 4. Crear proyecto...
    // ... código de creación ...

    // 5. Registrar completación
    await insertPipelineEvent(db, {
      entityId,
      paso: 'crear_proyecto',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_COMPLETE',
      detalle: 'Proyecto creado exitosamente',
    })

    return c.json({ proyecto: {...} }, 201)
  } catch (error) {
    // 6. Registrar error
    await insertPipelineEvent(db, {
      entityId,
      paso: 'crear_proyecto',
      nivel: 'ERROR',
      tipoEvento: 'PROCESS_FAILED',
      errorCodigo: 'ERROR_INESPERADO',
      detalle: error instanceof Error ? error.message : 'Error desconocido',
    })

    console.error('Error al crear proyecto:', error)
    return c.json({ error: 'Error interno del servidor' }, 500)
  }
}
```

### 6.2. Ejemplo - Manejo de Error de Timeout

```typescript
try {
  const resultado = await ejecutarConTimeout(
    async () => {
      // Operación que puede tardar
      return await operacionLarga()
    },
    ANALYSIS_TIMEOUT_MS,
    'operacionLarga'
  )
  
  return c.json({ resultado })
} catch (error) {
  if (error instanceof Error && error.message.includes('Timeout')) {
    // Manejar timeout específicamente
    await insertPipelineEvent(db, {
      entityId,
      paso: 'operacion_larga',
      nivel: 'ERROR',
      tipoEvento: 'PROCESS_FAILED',
      errorCodigo: 'ANALYSIS_TIMEOUT',
      detalle: error.message,
    })
    
    return c.json({
      error: {
        code: 'ANALYSIS_TIMEOUT',
        message: 'La operación excedió el tiempo máximo permitido',
      },
    }, 500)
  }
  
  // Error genérico
  return c.json({ error: 'Error interno del servidor' }, 500)
}
```

---

## Referencias

- [`simulacion-ia.ts`](../src/services/simulacion-ia.ts) - Implementación de timeout y reintentos
- [`pipeline-events.ts`](../src/lib/pipeline-events.ts) - Librería de registro de eventos
- [`pai-proyectos.ts`](../src/handlers/pai-proyectos.ts) - Handlers de proyectos
- [`pai-notas.ts`](../src/handlers/pai-notas.ts) - Handlers de notas

---

**Fin del Documento**
