# Tracking del Workflow - Proyecto PAI

> **Fecha:** 28 de marzo de 2026  
> **Versión:** 1.0  
> **Estado:** Implementado y Desplegado  
> **Autor:** Agente Qwen Code

---

## Índice de Contenidos

1. [Objetivo](#objetivo)
2. [Arquitectura del Sistema de Tracking](#arquitectura-del-sistema-de-tracking)
3. [Archivos que Participan](#archivos-que-participan)
4. [Flujo del Tracking Paso a Paso](#flujo-del-tracking-paso-a-paso)
5. [Eventos y Estados Registrados](#eventos-y-estados-registrados)
6. [Propagación del Tracking](#propagación-del-tracking)
7. [Construcción y Almacenamiento de log.json](#construcción-y-almacenamiento-de-logjson)
8. [Estructura de log.json](#estructura-de-logjson)
9. [Relación con Pipeline Events](#relación-con-pipeline-events)
10. [Observabilidad y Debugging](#observabilidad-y-debugging)

---

## 1. Objetivo

El sistema de tracking proporciona observabilidad completa del proceso de creación de proyectos PAI, registrando cada paso, error y transición para permitir debugging preciso y auditoría del workflow.

**Propósitos específicos:**
- Registrar cada paso del workflow con timestamp y contexto
- Capturar errores con stack trace completo
- Generar log.json para auditoría posterior
- Permitir debugging en tiempo real vía wrangler tail
- Proporcionar trazabilidad completa desde el frontend hasta OpenAI

---

## 2. Arquitectura del Sistema de Tracking

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE TRACKING                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                                               │
│  │   Handler    │───▶ iniciarTracking(trackingId)              │
│  │ handleCrear  │       ↓                                       │
│  │ Proyecto()   │       TrackingContext                         │
│  └──────────────┘       { id, eventos[], inicio, estado }      │
│         │                ↓                                       │
│         │           registrarEvento()                          │
│         │                ↓                                       │
│         │           contexto.eventos.push(evento)              │
│         │                ↓                                       │
│         │           logToConsole() → wrangler tail             │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │   Servicio   │───▶ registrarEvento() (mismo contexto)       │
│  │ ia-creacion  │                                               │
│  └──────────────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │   Client     │───▶ registrarEvento() (mismo contexto)       │
│  │ openai       │                                               │
│  └──────────────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │   Handler    │───▶ completarTracking()                      │
│  │              │       ↓                                       │
│  │              │       generarLogJSON()                       │
│  │              │       ↓                                       │
│  │              │       R2: analisis-inmuebles/{CII}/{CII}_log │
│  └──────────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Componentes:**

| Componente | Responsabilidad |
|------------|-----------------|
| `TrackingContext` | Contenedor de eventos de una operación |
| `registrarEvento()` | Agrega evento al contexto y loguea a consola |
| `registrarError()` | Agrega error con stack trace y marca contexto como FALLIDO |
| `generarLogJSON()` | Serializa contexto y guarda en R2 |
| `logToConsole()` | Imprime evento formateado para wrangler tail |

---

## 3. Archivos que Participan

### 3.1. Archivo Principal

| Archivo | Ruta | Funciones Exportadas |
|---------|------|---------------------|
| `tracking.ts` | `apps/worker/src/lib/` | `iniciarTracking()`, `registrarEvento()`, `registrarError()`, `completarTracking()`, `generarLogJSON()`, `obtenerLogJSON()` |

### 3.2. Archivos que Usan Tracking

| Archivo | Ruta | Uso del Tracking |
|---------|------|------------------|
| `pai-proyectos.ts` | `apps/worker/src/handlers/` | Inicia tracking, registra eventos del handler, genera log.json final |
| `ia-creacion-proyectos.ts` | `apps/worker/src/services/` | Recibe tracking del handler, registra eventos de IA |
| `openai-client.ts` | `apps/worker/src/lib/` | Recibe tracking del servicio, registra eventos de OpenAI |

### 3.3. Interfaces y Tipos

**TrackingContext:**
```typescript
interface TrackingContext {
  id: string                    // tracking_id único
  eventos: TrackingEvent[]      // array de eventos
  inicio: number                // timestamp de inicio (ms)
  estado: 'EN_PROCESO' | 'COMPLETADO' | 'FALLIDO'
}
```

**TrackingEvent:**
```typescript
interface TrackingEvent {
  timestamp: string             // ISO 8601
  paso: string                  // identificador del paso
  nivel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  mensaje: string               // descripción legible
  datos?: Record<string, unknown>  // datos contextuales
  error?: {                    // solo si nivel === 'ERROR'
    mensaje: string
    stack?: string
    codigo?: string
  }
  duracion_ms?: number         // duración del paso (opcional)
}
```

---

## 4. Flujo del Tracking Paso a Paso

### 4.1. Diagrama de Secuencia del Tracking

```
┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────┐
│ Frontend│  │ Handler  │  │ Servicio  │  │  Client  │  │  R2    │
└────┬────┘  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └───┬────┘
     │            │               │             │            │
     │ POST       │               │             │            │
     │───────────▶│               │             │            │
     │            │               │             │            │
     │            │iniciarTrack   │             │            │
     │            │id=crear-xxx   │             │            │
     │            │               │             │            │
     │            │registrarEvt   │             │            │
     │            │handler-inicio │             │            │
     │            │               │             │            │
     │            │registrarEvt   │             │            │
     │            │request-received            │            │
     │            │               │             │            │
     │            │crearProyecto  │             │            │
     │            │ConIA(tracking)│             │            │
     │            │──────────────▶│             │            │
     │            │               │             │            │
     │            │               │registrarEvt │            │
     │            │               │ia-creacion  │            │
     │            │               │             │            │
     │            │               │executePrompt│            │
     │            │               │(tracking)   │            │
     │            │               │────────────▶│            │
     │            │               │             │            │
     │            │               │             │registrarEvt│
     │            │               │             │openai-...  │
     │            │               │             │            │
     │            │               │◀────────────│            │
     │            │◀──────────────│             │            │
     │            │               │             │            │
     │            │generarLogJSON │             │            │
     │            │(tracking, cii)│             │            │
     │            │─────────────────────────────────────────▶│
     │            │               │             │            │
     │            │               │             │  put()     │
     │            │               │             │  log.json  │
     │            │               │             │            │
     │◀───────────│               │             │            │
     │{tracking_id, log_url}      │             │            │
     │            │               │             │            │
```

### 4.2. Pasos Detallados con Tracking

| Paso | Componente | Función | Evento Registrado | Datos |
|------|------------|---------|-------------------|-------|
| 1 | Handler | `iniciarTracking()` | - | `trackingId = crear-{timestamp}-{random}` |
| 2 | Handler | `registrarEvento()` | `handler-inicio` | `{}` |
| 3 | Handler | `registrarEvento()` | `request-received` | `{ ijson_length, ijson_preview }` |
| 4 | Handler | `registrarEvento()` | `validar-ijson` | `{}` |
| 5 | Handler | `registrarEvento()` | `validar-ijson-ok` | `{}` |
| 6 | Handler | `crearProyectoConIA()` | - | Pasa `tracking` al servicio |
| 7 | Servicio | `registrarEvento()` | `ia-creacion-inicio` | `{ ijson_length }` |
| 8 | Servicio | `registrarEvento()` | `ia-ejecutar-prompt` | `{ prompt }` |
| 9 | Servicio | `executePrompt()` | - | Pasa `tracking` al client |
| 10 | Client | `registrarEvento()` | `openai-inicio` | `{ prompt }` |
| 11 | Client | `registrarEvento()` | `openai-obtener-api-key` | `{}` |
| 12 | Client | `registrarEvento()` | `openai-api-key-obtenida` | `{ key_length, key_prefix }` |
| 13 | Client | `registrarEvento()` | `openai-cargar-prompt` | `{ key }` |
| 14 | Client | `registrarEvento()` | `openai-prompt-cargado` | `{ key, size_bytes }` |
| 15 | Client | `registrarEvento()` | `openai-llamar-api` | `{ model }` |
| 16 | Client | `registrarEvento()` | `openai-http-request` | `{ url, model }` |
| 17 | Client | `registrarEvento()` | `openai-http-response` | `{ status, statusText }` |
| 18 | Client | `registrarEvento()` | `openai-raw-response` | `{ raw_response, has_output_text, has_output, ... }` |
| 19 | Client | `registrarEvento()` | `openai-extract-text` | `{ output_text_length, output_text_preview, extraction_method }` |
| 20 | Client | `registrarEvento()` | `openai-completado` | `{ response_length }` |
| 21 | Servicio | `registrarEvento()` | `ia-prompt-completado` | `{ response_length, has_usage, usage_tokens, response_preview }` |
| 22 | Servicio | `registrarEvento()` | `ia-parse-json` | `{ response_length, response_first_char }` |
| 23 | Servicio | `registrarEvento()` | `ia-parse-json-ok` | `{ has_titulo, has_precio }` |
| 24 | Servicio | `registrarEvento()` | `ia-validar-datos` | `{}` |
| 25 | Servicio | `registrarEvento()` | `ia-validacion-ok` | `{ titulo, ciudad }` |
| 26 | Servicio | `registrarEvento()` | `ia-creacion-completado` | `{}` |
| 27 | Handler | `registrarEvento()` | `db-insert-inicio` | `{}` |
| 28 | Handler | `registrarEvento()` | `db-insert-ok` | `{ proyecto_id }` |
| 29 | Handler | `registrarEvento()` | `generar-cii` | `{}` |
| 30 | Handler | `registrarEvento()` | `cii-generado` | `{ cii }` |
| 31 | Handler | `registrarEvento()` | `pipeline-eventos` | `{}` |
| 32 | Handler | `registrarEvento()` | `pipeline-ok` | `{}` |
| 33 | Handler | `registrarEvento()` | `generar-log` | `{}` |
| 34 | Handler | `completarTracking()` | - | `estado = 'COMPLETADO'` |
| 35 | Handler | `generarLogJSON()` | - | Guarda en R2 |
| 36 | Handler | `registrarEvento()` | `handler-completado` | `{ cii, log_saved }` |

---

## 5. Eventos y Estados Registrados

### 5.1. Eventos por Componente

**Handler (`pai-proyectos.ts`):**

| Evento | Nivel | Datos Típicos |
|--------|-------|---------------|
| `handler-inicio` | INFO | `{}` |
| `request-received` | INFO | `{ ijson_length: 3154, ijson_preview: '...' }` |
| `validar-ijson` | INFO | `{}` |
| `validar-ijson-ok` | INFO | `{}` |
| `db-insert-inicio` | INFO | `{}` |
| `db-insert-ok` | INFO | `{ proyecto_id: 123 }` |
| `generar-cii` | INFO | `{}` |
| `cii-generado` | INFO | `{ cii: '26030001' }` |
| `pipeline-eventos` | INFO | `{}` |
| `pipeline-ok` | INFO | `{}` |
| `generar-log` | INFO | `{}` |
| `handler-completado` | INFO | `{ cii, log_saved: true }` |

**Servicio (`ia-creacion-proyectos.ts`):**

| Evento | Nivel | Datos Típicos |
|--------|-------|---------------|
| `ia-creacion-inicio` | INFO | `{ ijson_length: 3154 }` |
| `ia-ejecutar-prompt` | INFO | `{ prompt: '00_CrearProyecto.json' }` |
| `ia-prompt-completado` | INFO | `{ response_length: 1500, usage_tokens: 6364, response_preview: '...' }` |
| `ia-parse-json` | INFO | `{ response_length: 1500, response_first_char: '{' }` |
| `ia-parse-json-ok` | INFO | `{ has_titulo: true, has_precio: true }` |
| `ia-validar-datos` | INFO | `{}` |
| `ia-validacion-ok` | INFO | `{ titulo: '...', ciudad: '...' }` |
| `ia-creacion-completado` | INFO | `{}` |

**Client (`openai-client.ts`):**

| Evento | Nivel | Datos Típicos |
|--------|-------|---------------|
| `openai-inicio` | INFO | `{ prompt: '00_CrearProyecto.json' }` |
| `openai-obtener-api-key` | INFO | `{}` |
| `openai-api-key-obtenida` | INFO | `{ key_length: 164, key_prefix: 'sk-proj-I4...' }` |
| `openai-cargar-prompt` | INFO | `{ key: 'prompts-ia/00_CrearProyecto.json' }` |
| `openai-prompt-cargado` | INFO | `{ key, size_bytes: 6129 }` |
| `openai-llamar-api` | INFO | `{ model: 'gpt-5' }` |
| `openai-http-request` | INFO | `{ url, model }` |
| `openai-http-response` | INFO | `{ status: 200, statusText: 'OK' }` |
| `openai-raw-response` | DEBUG | `{ raw_response: {...}, has_output_text: false, has_output: true, ... }` |
| `openai-extract-text` | INFO | `{ output_text_length: 1500, output_text_preview: '...', extraction_method: 'success' }` |
| `openai-completado` | INFO | `{ response_length: 1500 }` |

### 5.2. Eventos de Error

| Evento | Nivel | Datos Típicos |
|--------|-------|---------------|
| `validar-ijson-fallido` | ERROR | `{ error: 'Falta campo titulo_anuncio' }` |
| `ia-parse-json-fallido` | ERROR | `{ response_text: '...', error: { mensaje, stack } }` |
| `ia-validacion-fallida` | ERROR | `{ datos: {...}, error: { mensaje, stack } }` |
| `ia-creacion-error` | ERROR | `{ ijson_preview: '...', error: { mensaje, stack, type } }` |
| `openai-kv-error` | ERROR | `{ error: { mensaje, stack } }` |
| `openai-r2-error` | ERROR | `{ error: { mensaje, stack } }` |
| `openai-http-error` | ERROR | `{ status: 429, error: { mensaje, stack, type: 'RATE_LIMIT' } }` |
| `openai-fetch-error` | ERROR | `{ error: { mensaje, stack } }` |
| `handler-error` | ERROR | `{ error: { mensaje, stack } }` |

### 5.3. Estados del TrackingContext

| Estado | Cuándo Se Establece | Significado |
|--------|---------------------|-------------|
| `EN_PROCESO` | Al crear con `iniciarTracking()` | El workflow está en ejecución |
| `COMPLETADO` | Al llamar `completarTracking()` sin errores | El workflow finalizó exitosamente |
| `FALLIDO` | Al llamar `registrarError()` | Ocurrió un error, el workflow falló |

---

## 6. Propagación del Tracking

### 6.1. Patrón de Propagación

```typescript
// Handler: inicia el tracking
const tracking = iniciarTracking(trackingId)

// Handler: pasa tracking al servicio
const iaResult = await crearProyectoConIA(env, tracking, ijson)

// Servicio: pasa tracking al client
const result = await executePrompt(env, '00_CrearProyecto.json', ijson, tracking)
```

**Regla:** El componente que inicia el workflow crea el tracking y lo pasa a todos los componentes descendientes.

### 6.2. Ejemplo de Código

**Handler:**
```typescript
export async function handleCrearProyecto(c: AppContext): Promise<Response> {
  const trackingId = `crear-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  const tracking = iniciarTracking(trackingId)
  
  registrarEvento(tracking, 'handler-inicio', 'INFO', 'Iniciando handler')
  
  try {
    const iaResult = await crearProyectoConIA(env, tracking, ijson)
    // ...
  } catch (error) {
    registrarError(tracking, 'handler-error', error)
    completarTracking(tracking)
    const logJson = await generarLogJSON(env, tracking)
    return c.json({ error: 'Error', tracking_id: trackingId, log: JSON.parse(logJson) }, 500)
  }
}
```

**Servicio:**
```typescript
export async function crearProyectoConIA(
  env: Env,
  tracking: TrackingContext,  // ← Recibe tracking del handler
  ijson: string,
): Promise<CrearProyectoIAResult> {
  registrarEvento(tracking, 'ia-creacion-inicio', 'INFO', 'Iniciando creación con IA')
  
  try {
    const result = await executePrompt(env, '00_CrearProyecto.json', ijson, tracking)  // ← Pasa tracking
    // ...
  } catch (error) {
    registrarError(tracking, 'ia-creacion-error', error)
    // ...
  }
}
```

**Client:**
```typescript
export async function executePrompt(
  env: Env,
  promptName: string,
  inputJson: string,
  tracking?: TrackingContext,  // ← Opcional, puede no existir
): Promise<PromptResult> {
  if (tracking) {
    registrarEvento(tracking, 'openai-inicio', 'INFO', 'Iniciando llamada a OpenAI')
  }
  // ...
}
```

---

## 7. Construcción y Almacenamiento de log.json

### 7.1. Función `generarLogJSON()`

**Ubicación:** `apps/worker/src/lib/tracking.ts`

```typescript
export async function generarLogJSON(
  env: Env,
  contexto: TrackingContext,
  cii?: string,
): Promise<string> {
  const duracionTotal = Date.now() - contexto.inicio

  const logCompleto = {
    tracking_id: contexto.id,
    estado: contexto.estado,
    inicio: new Date(contexto.inicio).toISOString(),
    fin: new Date().toISOString(),
    duracion_total_ms: duracionTotal,
    total_eventos: contexto.eventos.length,
    eventos: contexto.eventos,
    resumen: {
      errores: contexto.eventos.filter(e => e.nivel === 'ERROR').length,
      warnings: contexto.eventos.filter(e => e.nivel === 'WARN').length,
      infos: contexto.eventos.filter(e => e.nivel === 'INFO').length,
    },
  }

  // Guardar en R2 si hay CII
  if (cii) {
    try {
      const logKey = `analisis-inmuebles/${cii}/${cii}_log.json`
      await env.r2_binding_01.put(logKey, JSON.stringify(logCompleto, null, 2), {
        httpMetadata: {
          contentType: 'application/json',
        },
      })
    } catch (error) {
      console.error('Error al guardar log.json en R2:', error)
    }
  }

  return JSON.stringify(logCompleto, null, 2)
}
```

### 7.2. Ubicación de Almacenamiento

**R2 Bucket:** `r2-cbconsulting`  
**Binding:** `r2_binding_01`  
**Path:** `analisis-inmuebles/{CII}/{CII}_log.json`

**Estructura de carpetas:**
```
r2-cbconsulting/
└── analisis-inmuebles/
    ├── 26030001/
    │   ├── 26030001.json           (IJSON original)
    │   ├── 26030001_resumen-ejecutivo.md
    │   ├── 26030001_datos-transformados.md
    │   ├── ...
    │   └── 26030001_log.json       (tracking completo)
    └── 26030002/
        └── ...
```

### 7.3. Cuándo Se Genera

| Escenario | Cuándo Se Genera | ¿Se Guarda en R2? |
|-----------|------------------|-------------------|
| Éxito | Al finalizar `handleCrearProyecto()` | ✅ Sí (con CII) |
| Error en IA | Al capturar error en handler | ❌ No (no hay CII aún) |
| Error de validación | Al capturar error en handler | ❌ No (no hay CII aún) |
| Error después de crear proyecto | Al capturar error en handler | ✅ Sí (con CII) |

---

## 8. Estructura de log.json

### 8.1. Ejemplo Completo

```json
{
  "tracking_id": "crear-1680012000000-abc123",
  "estado": "COMPLETADO",
  "inicio": "2026-03-28T22:00:00.000Z",
  "fin": "2026-03-28T22:00:05.123Z",
  "duracion_total_ms": 5123,
  "total_eventos": 36,
  "eventos": [
    {
      "timestamp": "2026-03-28T22:00:00.000Z",
      "paso": "handler-inicio",
      "nivel": "INFO",
      "mensaje": "Iniciando handler de creación de proyecto"
    },
    {
      "timestamp": "2026-03-28T22:00:00.050Z",
      "paso": "request-received",
      "nivel": "INFO",
      "mensaje": "Request recibido",
      "datos": {
        "ijson_length": 3154,
        "ijson_preview": "{\n  \"url_fuente\": \"https://www.indomio.es/...\""
      }
    },
    {
      "timestamp": "2026-03-28T22:00:01.234Z",
      "paso": "openai-raw-response",
      "nivel": "DEBUG",
      "mensaje": "Respuesta completa de OpenAI",
      "datos": {
        "raw_response": {
          "id": "resp_0432ce9b...",
          "status": "completed",
          "output": [...],
          "usage": {
            "input_tokens": 3337,
            "output_tokens": 3027,
            "total_tokens": 6364
          }
        },
        "has_output_text": false,
        "has_output": true,
        "output_type": "array",
        "has_usage": true,
        "model": "gpt-5-2025-08-07",
        "status": "completed"
      }
    },
    {
      "timestamp": "2026-03-28T22:00:05.100Z",
      "paso": "handler-completado",
      "nivel": "INFO",
      "mensaje": "Handler completado exitosamente",
      "datos": {
        "cii": "26030001",
        "log_saved": true
      }
    }
  ],
  "resumen": {
    "errores": 0,
    "warnings": 0,
    "infos": 36
  }
}
```

### 8.2. Campos Principales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `tracking_id` | string | ID único generado por `handleCrearProyecto()` |
| `estado` | string | `EN_PROCESO`, `COMPLETADO`, o `FALLIDO` |
| `inicio` | string (ISO) | Timestamp de inicio del tracking |
| `fin` | string (ISO) | Timestamp de finalización |
| `duracion_total_ms` | number | Duración total en milisegundos |
| `total_eventos` | number | Cantidad de eventos registrados |
| `eventos` | array | Array de `TrackingEvent` |
| `resumen` | object | Contadores por nivel |

---

## 9. Relación con Pipeline Events

### 9.1. Diferencias

| Característica | Tracking (`tracking.ts`) | Pipeline Events (`pipeline-events.ts`) |
|----------------|-------------------------|---------------------------------------|
| **Propósito** | Debugging y observabilidad | Auditoría y trazabilidad de negocio |
| **Almacenamiento** | R2 (`{CII}_log.json`) | D1 (`pipeline_eventos`) |
| **Duración** | Por operación individual | Histórico acumulado por entidad |
| **Acceso** | Descargar desde R2 | Query desde D1 |
| **Estructura** | JSON anidado completo | Tabla relacional plana |
| **Uso principal** | Debugging técnico | Auditoría de negocio |

### 9.2. Cuándo Usar Cada Uno

**Usar Tracking:**
- Debuggear errores en tiempo de desarrollo
- Ver el flujo completo de una operación específica
- Inspeccionar respuestas de OpenAI
- Medir tiempos de ejecución por paso

**Usar Pipeline Events:**
- Auditoría de cambios de estado
- Historial de ejecuciones de un proyecto
- Reportes de negocio
- Trazabilidad a largo plazo

### 9.3. Complementariedad

Ambos sistemas son complementarios:

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLEMENTARIEDAD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tracking (R2)                      Pipeline Events (D1)        │
│  ─────────────                      ────────────────────        │
│  • Detalle técnico                  • Eventos de negocio        │
│  • Por operación                    • Por entidad (proyecto)    │
│  • Debugging inmediato              • Auditoría histórica       │
│  • JSON completo                    • Tabla queryable           │
│  • Temporal (por CII)               • Permanente                │
│                                                                  │
│  Juntos proporcionan:                                            │
│  • Observabilidad completa (técnica + negocio)                  │
│  • Debugging + Auditoría                                         │
│  • Corto plazo + Largo plazo                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Observabilidad y Debugging

### 10.1. Wrangler Tail (Tiempo Real)

**Comando:**
```bash
cd /workspaces/cbc-endes/apps/worker
npx wrangler tail --env dev
```

**Output esperado:**
```
[TRACKING:handler-inicio] Iniciando handler de creación de proyecto {}
[TRACKING:request-received] Request recibido { ijson_length: 3154, ... }
[TRACKING:validar-ijson] Validando IJSON {}
[TRACKING:openai-http-response] Respuesta HTTP recibida { status: 200 }
[TRACKING:openai-raw-response] Respuesta completa de OpenAI { ... }
[TRACKING:handler-completado] Handler completado exitosamente { cii, log_saved }
```

### 10.2. Descargar log.json desde R2

**Comando:**
```bash
cd /workspaces/cbc-endes/apps/worker
npx wrangler r2 object get r2-cbconsulting/analisis-inmuebles/26030001/26030001_log.json --remote
```

### 10.3. Obtener log desde la API

**Respuesta de error incluye log:**
```json
{
  "error": "Error al procesar IJSON con IA",
  "error_codigo": "INVALID_JSON_RESPONSE",
  "tracking_id": "crear-1680012000000-abc123",
  "log": {
    "tracking_id": "crear-1680012000000-abc123",
    "estado": "FALLIDO",
    "eventos": [...],
    "resumen": { "errores": 1, "warnings": 0, "infos": 10 }
  }
}
```

### 10.4. Respuesta Exitosa Incluye Referencia al log

```json
{
  "proyecto": {
    "id": 1,
    "cii": "26030001",
    "titulo": "Piso en venta en Valencia",
    ...
  },
  "tracking_id": "crear-1680012000000-abc123",
  "log_url": "analisis-inmuebles/26030001/26030001_log.json"
}
```

---

## Referencias

| Documento | Ruta |
|-----------|------|
| Integración OpenAI API | `plans/proyecto-PIA/doc-base/integracion-openai-api.md` |
| Pipeline Events | `apps/worker/src/lib/pipeline-events.ts` |
| Tracking lib | `apps/worker/src/lib/tracking.ts` |

---

**Fin del Documento**
