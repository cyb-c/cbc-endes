# Integración con OpenAI API - Proyecto PAI

> **Fecha:** 28 de marzo de 2026  
> **Versión:** 1.0  
> **Estado:** Implementada y Desplegada  
> **Autor:** Agente Qwen Code

---

## Índice de Contenidos

1. [Objetivo](#objetivo)
2. [Arquitectura de la Integración](#arquitectura-de-la-integración)
3. [Archivos que Intervienen](#archivos-que-intervienen)
4. [Flujo de Ejecución Paso a Paso](#flujo-de-ejecución-paso-a-paso)
5. [Envío de Petición a OpenAI](#envío-de-petición-a-openai)
6. [Recepción y Procesamiento de Respuesta](#recepción-y-procesamiento-de-respuesta)
7. [Captura y Gestión de Errores](#captura-y-gestión-de-errores)
8. [Mecanismos de Trazabilidad y Control](#mecanismos-de-trazabilidad-y-control)
9. [Dependencias y Configuraciones](#dependencias-y-configuraciones)
10. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 1. Objetivo

La integración con OpenAI API permite extraer datos estructurados de anuncios inmobiliarios (IJSON) y generar resúmenes ejecutivos automáticos para proyectos PAI (Proyectos de Análisis Inmobiliario).

**Propósito específico:**
- Leer un IJSON (Inmueble JSON) con datos de un anuncio inmobiliario
- Ejecutar un prompt especializado contra OpenAI Responses API
- Extraer campos estructurados del inmueble
- Generar un resumen ejecutivo en Markdown
- Retornar datos listos para almacenar en la base de datos

---

## 2. Arquitectura de la Integración

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE INTEGRACIÓN                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│  │   Frontend   │────▶│   Handler    │────▶│   Servicio   │   │
│  │  (React UI)  │     │  (pai-proj)  │     │ (ia-creacion)│   │
│  └──────────────┘     └──────────────┘     └──────────────┘   │
│                                                │                │
│                                                ▼                │
│                                         ┌──────────────┐       │
│                                         │ OpenAI       │       │
│                                         │ Client       │       │
│                                         │ (lib)        │       │
│                                         └──────────────┘       │
│                                                │                │
│                    ┌───────────────────────────┼───────────┐   │
│                    │                           │           │   │
│                    ▼                           ▼           ▼   │
│             ┌──────────────┐          ┌──────────────┐ ┌──────┐│
│             │   KV         │          │   R2         │ │Tracking│
│             │   (API Key)  │          │   (Prompts)  │ │      ││
│             │ secretos-    │          │ prompts-ia/  │ │      ││
│             │ cbconsulting │          │ 00_Crear...  │ │      ││
│             └──────────────┘          └──────────────┘ └──────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Capas de la integración:**

| Capa | Componente | Responsabilidad |
|------|------------|-----------------|
| **API** | `POST /api/pai/proyectos` | Endpoint HTTP de entrada |
| **Handler** | `handleCrearProyecto()` | Orquestación del flujo |
| **Servicio** | `crearProyectoConIA()` | Lógica de negocio de IA |
| **Cliente** | `executePrompt()` | Comunicación con OpenAI |
| **Storage** | KV + R2 | API Key + Prompts |
| **Tracking** | `tracking.ts` | Observabilidad y logs |

---

## 3. Archivos que Intervienen

### 3.1. Archivos Principales

| Archivo | Ruta | Propósito |
|---------|------|-----------|
| `openai-client.ts` | `apps/worker/src/lib/` | Cliente reutilizable para OpenAI Responses API |
| `ia-creacion-proyectos.ts` | `apps/worker/src/services/` | Servicio de creación con IA |
| `pai-proyectos.ts` | `apps/worker/src/handlers/` | Handler del endpoint |
| `tracking.ts` | `apps/worker/src/lib/` | Sistema de tracking y logs |
| `env.ts` | `apps/worker/src/` | Configuración de entorno y bindings |

### 3.2. Archivos de Configuración

| Archivo | Ruta | Propósito |
|---------|------|-----------|
| `wrangler.toml` | `apps/worker/` | Bindings de KV, R2, D1 |
| `00_CrearProyecto.json` | `_doc-desarrollo/fase01/` (R2: `prompts-ia/`) | Prompt template para OpenAI |

### 3.3. Recursos Cloudflare

| Recurso | Nombre | Binding | Propósito |
|---------|--------|---------|-----------|
| KV Namespace | `secretos-cbconsulting` | `secrets_kv` | Almacenar `OPENAI_API_KEY` |
| R2 Bucket | `r2-cbconsulting` | `r2_binding_01` | Almacenar prompts en `prompts-ia/` |
| D1 Database | `db-cbconsulting` | `db_binding_01` | Almacenar proyectos creados |

---

## 4. Flujo de Ejecución Paso a Paso

### 4.1. Diagrama de Secuencia

```
┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌────────┐  ┌────┐
│ Frontend│  │ Handler  │  │ Servicio  │  │  Client  │  │ OpenAI │  │ KV │
└────┬────┘  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └───┬────┘  └─┬──┘
     │            │              │             │            │         │
     │ POST /api  │              │             │            │         │
     │ /pai/proy  │              │             │            │         │
     │───────────▶│              │             │            │         │
     │            │              │             │            │         │
     │            │iniciarTrack  │             │            │         │
     │            │              │             │            │         │
     │            │              │             │            │         │
     │            │crearProyect  │             │            │         │
     │            │oConIA()      │             │            │         │
     │            │─────────────▶│             │            │         │
     │            │              │             │            │         │
     │            │              │executeProm │             │         │
     │            │              │pt()        │             │         │
     │            │              │────────────▶│            │         │
     │            │              │             │            │         │
     │            │              │             │get() API   │         │
     │            │              │             │Key         │         │
     │            │              │             │────────────▶│         │
     │            │              │             │            │         │
     │            │              │             │◀────────────│         │
     │            │              │             │            │         │
     │            │              │             │get() Prompt│         │
     │            │              │             │─────────────────────▶│
     │            │              │             │            │         │
     │            │              │             │◀─────────────────────│
     │            │              │             │            │         │
     │            │              │             │POST /v1/   │         │
     │            │              │             │responses   │         │
     │            │              │             │────────────▶│         │
     │            │              │             │            │         │
     │            │              │             │◀────────────│         │
     │            │              │             │            │         │
     │            │              │             │extractText │         │
     │            │              │             │            │         │
     │            │              │◀────────────│            │         │
     │            │              │             │            │         │
     │            │◀─────────────│             │            │         │
     │            │              │             │            │         │
     │◀───────────│              │             │            │         │
     │            │              │             │            │         │
```

### 4.2. Pasos Detallados

| Paso | Componente | Acción | Datos |
|------|------------|--------|-------|
| 1 | Frontend | Envía POST con IJSON | `{ ijson: "..." }` |
| 2 | Handler | Inicia tracking | `trackingId = crear-{timestamp}-{random}` |
| 3 | Handler | Valida IJSON | Campos requeridos: `titulo_anuncio`, `tipo_inmueble`, `precio` |
| 4 | Handler | Llama servicio IA | `crearProyectoConIA(env, tracking, ijson)` |
| 5 | Servicio | Ejecuta prompt | `executePrompt(env, '00_CrearProyecto.json', ijson, tracking)` |
| 6 | Client | Obtiene API Key de KV | `env.secrets_kv.get('OPENAI_API_KEY')` |
| 7 | Client | Carga prompt desde R2 | `env.r2_binding_01.get('prompts-ia/00_CrearProyecto.json')` |
| 8 | Client | Prepara request body | Reemplaza `%%ijson%%` con IJSON escapado |
| 9 | Client | POST a OpenAI | `https://api.openai.com/v1/responses` |
| 10 | OpenAI | Procesa y responde | JSON con `output` array |
| 11 | Client | Extrae texto | `extractTextFromOutput()` recorre `output` array |
| 12 | Client | Retorna resultado | `{ text: "...", raw: {...}, usage: {...} }` |
| 13 | Servicio | Parsea JSON | `JSON.parse(result.text)` |
| 14 | Servicio | Valida datos | Campos requeridos: `pro_titulo`, `pro_tipo_inmueble`, `pro_precio`, `pro_ciudad` |
| 15 | Servicio | Retorna datos | `{ exito: true, datos: {...} }` |
| 16 | Handler | Inserta en D1 | `INSERT INTO PAI_PRO_proyectos ...` |
| 17 | Handler | Genera CII | `generateCII(proyectoId)` |
| 18 | Handler | Guarda IJSON en R2 | `r2_binding_01.put('analisis-inmuebles/{CII}/{CII}.json', ijson)` |
| 19 | Handler | Genera log.json | `generarLogJSON(env, tracking, cii)` |
| 20 | Handler | Retorna respuesta | `{ proyecto: {...}, tracking_id: "...", log_url: "..." }` |

---

## 5. Envío de Petición a OpenAI

### 5.1. Estructura del Request

**Endpoint:** `POST https://api.openai.com/v1/responses`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer {API_KEY}
```

**Body (PromptRequest):**
```typescript
{
  "model": "gpt-5",
  "instructions": "Eres un extractor y redactor especializado...",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "{IJSON_ESCAPADO}"
        }
      ]
    }
  ]
}
```

### 5.2. Función `callOpenAIResponses()`

**Ubicación:** `apps/worker/src/lib/openai-client.ts`

```typescript
async function callOpenAIResponses(
  apiKey: string,
  requestBody: PromptRequest,
  tracking?: TrackingContext,
): Promise<PromptResult> {
  const url = 'https://api.openai.com/v1/responses'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json() as Record<string, unknown>
  
  // Extraer texto soportando múltiples formatos
  const outputText = extractTextFromOutput(data, tracking)

  return {
    text: outputText,
    raw: data,
    usage: data.usage ? {...} : undefined,
  }
}
```

### 5.3. Preparación del Request Body

**Función:** `prepareRequestBody()`

```typescript
function prepareRequestBody(promptTemplate: string, inputJson: string): PromptRequest {
  // Escapar IJSON para inserción segura en string JSON
  const escapedInputJson = JSON.stringify(inputJson).slice(1, -1)
  
  // Reemplazar placeholder
  const requestBodyRaw = promptTemplate.replace('%%ijson%%', escapedInputJson)
  
  // Parsear para validar
  const requestBody = JSON.parse(requestBodyRaw) as PromptRequest
  
  return requestBody
}
```

**Prompt template (`00_CrearProyecto.json`):**
```json
{
  "model": "gpt-5",
  "instructions": "Eres un extractor y redactor...",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "%%ijson%%"
        }
      ]
    }
  ]
}
```

---

## 6. Recepción y Procesamiento de Respuesta

### 6.1. Estructura de Respuesta de OpenAI

**Formato Responses API:**
```json
{
  "id": "resp_0432ce9b...",
  "object": "response",
  "status": "completed",
  "model": "gpt-5-2025-08-07",
  "output": [
    {
      "type": "message",
      "content": [
        {
          "type": "output_text",
          "text": "{\"pro_titulo\": \"...\", ...}"
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 3337,
    "output_tokens": 3027,
    "total_tokens": 6364
  }
}
```

### 6.2. Extracción de Texto

**Función:** `extractTextFromOutput()`

**Soporta múltiples formatos:**

```typescript
function extractTextFromOutput(data: Record<string, unknown>, tracking?: TrackingContext): string {
  // Formato 1: output_text directo
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text
  }
  
  // Formato 2: output array (Responses API)
  if (Array.isArray(data.output) && data.output.length > 0) {
    const outputs = data.output as Array<Record<string, unknown>>
    const textParts: string[] = []
    
    for (const item of outputs) {
      if (item.type === 'message' && Array.isArray(item.content)) {
        const contents = item.content as Array<Record<string, unknown>>
        
        for (const content of contents) {
          if (typeof content.text === 'string' && content.text.trim()) {
            textParts.push(content.text)
          }
          else if (typeof content.content === 'string' && content.content.trim()) {
            textParts.push(content.content)
          }
          else if (content.json) {
            textParts.push(JSON.stringify(content.json))
          }
        }
      }
      else if (typeof item.text === 'string' && item.text.trim()) {
        textParts.push(item.text)
      }
    }
    
    if (textParts.length > 0) {
      return textParts.join('\n')
    }
  }
  
  return ''
}
```

### 6.3. Parseo del JSON de Respuesta

**Función:** `parsearResultadoJSON()` en `ia-creacion-proyectos.ts`

```typescript
function parsearResultadoJSON(text: string): CrearProyectoIAResult['datos'] | null {
  try {
    // Intentar parsear directamente
    const datos = JSON.parse(text)
    return datos as CrearProyectoIAResult['datos']
  } catch {
    // Intentar extraer JSON de texto con markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      try {
        const datos = JSON.parse(jsonMatch[0])
        return datos as CrearProyectoIAResult['datos']
      } catch {
        return null
      }
    }
    
    return null
  }
}
```

### 6.4. Validación de Datos Extraídos

**Función:** `validarDatosExtraidos()`

**Campos requeridos:**
- `pro_titulo`
- `pro_tipo_inmueble`
- `pro_precio`
- `pro_ciudad`

**Campos con defaults:**
- `pro_portal_nombre` → `'Desconocido'`
- `pro_portal_url` → `''`
- `pro_operacion` → `'venta'`
- `pro_superficie_construida_m2` → `'0'`
- `pro_barrio_distrito` → `''`
- `pro_direccion` → `''`
- `pro_resumen_ejecutivo` → `'## RESUMEN\n\nNo fue posible...'`

---

## 7. Captura y Gestión de Errores

### 7.1. Clasificación de Errores OpenAI

**Tipos de error:**

| Tipo | HTTP | Retryable | Descripción |
|------|------|-----------|-------------|
| `RATE_LIMIT` | 429 | ✅ Sí | Excedió quota actual |
| `AUTHENTICATION` | 401 | ❌ No | API key inválida |
| `PERMISSION` | 403 | ❌ No | Sin permisos |
| `INVALID_REQUEST` | 400 | ❌ No | Request mal formado |
| `SERVER_ERROR` | 500-504 | ✅ Sí | Error del servidor |

### 7.2. Función `classifyOpenAIError()`

```typescript
async function classifyOpenAIError(response: Response): Promise<ClassifiedOpenAIError> {
  let errorBody: { error?: { message?: string; type?: string } } | undefined
  
  try {
    errorBody = await response.json()
  } catch {
    errorBody = undefined
  }
  
  const errorMessage = errorBody?.error?.message || `HTTP ${response.status}`
  const errorType: OpenAIErrorType = getErrorTypeFromStatus(response.status)
  
  const error = new Error(errorMessage) as ClassifiedOpenAIError
  error.name = 'ClassifiedOpenAIError'
  error.type = errorType
  error.statusCode = response.status
  error.retryable = isRetryableError(errorType)
  
  return error
}
```

### 7.3. Manejo de Errores en el Servicio

**Función:** `crearProyectoConIA()`

```typescript
try {
  const result = await executePrompt(env, '00_CrearProyecto.json', ijson, tracking)
  // ... parsear y validar
} catch (error) {
  registrarError(tracking, 'ia-creacion-error', error, { ijson_preview: ijson.substring(0, 200) })
  
  const errorMessage = formatOpenAIError(error)
  const classifiedError = error as Error & { type?: string; retryable?: boolean }
  
  let errorCodigo = 'OPENAI_ERROR'
  if (classifiedError.type === 'RATE_LIMIT') {
    errorCodigo = 'RATE_LIMIT_EXCEEDED'
  } else if (classifiedError.type === 'AUTHENTICATION') {
    errorCodigo = 'INVALID_API_KEY'
  } else if (classifiedError.message.includes('KV')) {
    errorCodigo = 'SECRETS_KV_ERROR'
  } else if (classifiedError.message.includes('R2')) {
    errorCodigo = 'PROMPT_R2_ERROR'
  }
  
  return {
    exito: false,
    error_codigo: errorCodigo,
    error_mensaje: errorMessage,
  }
}
```

### 7.4. Códigos de Error de Negocio

| Código | Causa | Acción |
|--------|-------|--------|
| `INVALID_JSON_RESPONSE` | IA no devolvió JSON válido | Revisar prompt o modelo |
| `INVALID_EXTRACTED_DATA` | Datos extraídos inválidos | Validar IJSON de entrada |
| `RATE_LIMIT_EXCEEDED` | Excedió quota OpenAI | Esperar o actualizar plan |
| `INVALID_API_KEY` | API key inválida | Verificar KV |
| `SECRETS_KV_ERROR` | Error leyendo KV | Verificar binding |
| `PROMPT_R2_ERROR` | Prompt no encontrado en R2 | Verificar R2 |

---

## 8. Mecanismos de Trazabilidad y Control

### 8.1. Sistema de Tracking

**Archivo:** `apps/worker/src/lib/tracking.ts`

**Funciones principales:**
```typescript
iniciarTracking(id: string): TrackingContext
registrarEvento(contexto, paso, nivel, mensaje, datos?)
registrarError(contexto, paso, error, datos?)
completarTracking(contexto)
generarLogJSON(env, contexto, cii?): Promise<string>
obtenerLogJSON(env, cii): Promise<unknown>
```

### 8.2. Eventos Registrados

| Componente | Eventos | Nivel |
|------------|---------|-------|
| Handler | `handler-inicio`, `request-received`, `validar-ijson`, `db-insert-inicio`, `generar-cii`, `handler-completado` | INFO |
| Servicio IA | `ia-creacion-inicio`, `ia-ejecutar-prompt`, `ia-parse-json`, `ia-validar-datos`, `ia-creacion-completado` | INFO |
| Client OpenAI | `openai-inicio`, `openai-obtener-api-key`, `openai-cargar-prompt`, `openai-llamar-api`, `openai-http-request`, `openai-http-response`, `openai-raw-response`, `openai-extract-text` | INFO/DEBUG |
| Errores | `*-error`, `*-fallido` | ERROR |

### 8.3. Estructura de log.json

```json
{
  "tracking_id": "crear-1680012000000-abc123",
  "estado": "COMPLETADO",
  "inicio": "2026-03-28T22:00:00.000Z",
  "fin": "2026-03-28T22:00:05.000Z",
  "duracion_total_ms": 5000,
  "total_eventos": 25,
  "eventos": [
    {
      "timestamp": "2026-03-28T22:00:00.000Z",
      "paso": "handler-inicio",
      "nivel": "INFO",
      "mensaje": "Iniciando handler de creación de proyecto"
    },
    {
      "timestamp": "2026-03-28T22:00:01.000Z",
      "paso": "openai-raw-response",
      "nivel": "DEBUG",
      "mensaje": "Respuesta completa de OpenAI",
      "datos": {
        "raw_response": {...},
        "has_output_text": false,
        "has_output": true,
        "output_type": "array"
      }
    }
  ],
  "resumen": {
    "errores": 0,
    "warnings": 0,
    "infos": 25
  }
}
```

### 8.4. Ubicación de log.json

**R2 Bucket:** `r2-cbconsulting`  
**Path:** `analisis-inmuebles/{CII}/{CII}_log.json`

**Ejemplo:**
```
r2-cbconsulting/
└── analisis-inmuebles/
    └── 26030001/
        ├── 26030001.json (IJSON original)
        ├── 26030001_resumen-ejecutivo.md
        └── 26030001_log.json (tracking completo)
```

---

## 9. Dependencias y Configuraciones

### 9.1. Variables de Entorno y Bindings

| Variable/Binding | Tipo | Ubicación | Propósito |
|------------------|------|-----------|-----------|
| `OPENAI_API_KEY` | Secret | KV `secretos-cbconsulting` | Autenticación con OpenAI |
| `secrets_kv` | KV Binding | `wrangler.toml` | Acceso a secrets |
| `r2_binding_01` | R2 Binding | `wrangler.toml` | Acceso a prompts en R2 |
| `db_binding_01` | D1 Binding | `wrangler.toml` | Almacenar proyectos |

### 9.2. wrangler.toml

```toml
[[kv_namespaces]]
binding = "secrets_kv"
id = "50eb21ab606d4fd5a409e532347cf686"

[[r2_buckets]]
binding = "r2_binding_01"
bucket_name = "r2-cbconsulting"

[[d1_databases]]
binding = "db_binding_01"
database_name = "db-cbconsulting"
database_id = "fafcd5e2-b960-49f7-8502-88a0f8ba5052"
```

### 9.3. Dependencias de npm

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `hono` | ^4.6.0 | Framework HTTP del Worker |
| `@cloudflare/workers-types` | ^4.20250320.0 | Tipos de Cloudflare Workers |

---

## 10. Ejemplos de Uso

### 10.1. Crear Proyecto desde Frontend

```typescript
// apps/frontend/src/pages/proyectos/CrearProyecto.tsx
const response = await fetch(`${VITE_API_BASE_URL}/api/pai/proyectos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ijson }),
})

const data = await response.json()

if (response.ok) {
  console.log('Proyecto creado:', data.proyecto)
  console.log('Tracking ID:', data.tracking_id)
  console.log('Log URL:', data.log_url)
} else {
  console.error('Error:', data.error)
  console.error('Tracking:', data.tracking_id)
  console.error('Log completo:', data.log)
}
```

### 10.2. Ver Logs en Tiempo Real

```bash
# Terminal 1: wrangler tail
cd /workspaces/cbc-endes/apps/worker
npx wrangler tail --env dev

# Terminal 2: crear proyecto
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos" \
  -H "Content-Type: application/json" \
  -d @ijson.json
```

### 10.3. Descargar log.json desde R2

```bash
cd /workspaces/cbc-endes/apps/worker
npx wrangler r2 object get r2-cbconsulting/analisis-inmuebles/26030001/26030001_log.json --remote
cat 26030001_log.json
```

---

## Referencias

| Documento | Ruta |
|-----------|------|
| Prompt template | `_doc-desarrollo/fase01/00_CrearProyecto.json` |
| Especificación técnica | `_doc-desarrollo/fase01/02-especificacion-tecnica-workflow-alta-pai.md` |
| OpenAI Responses API | https://platform.openai.com/docs/api-reference/responses |
| Tracking del workflow | `plans/proyecto-PIA/doc-base/tracking-workflow.md` |

---

**Fin del Documento**
