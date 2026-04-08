# Evaluación de Prompts: Compatibilidad OpenAI Responses API → Z.AI Chat Completions

## Índice de Contenidos
1. [Objetivo](#1-objetivo)
2. [Prompts Actuales en R2](#2-prompts-actuales-en-r2)
   - 2.1 [Prompt `00_CrearProyecto.json`](#21-prompt-00_crearproyectojson)
   - 2.2 [Prompt `01_ActivoFisico.json`](#22-prompt-01_activofisicojson)
   - 2.3 [Estructura Común de Ambos Prompts](#23-estructura-común-de-ambos-prompts)
   - 2.4 [Prompts Pendientes (02-07)](#24-prompts-pendientes-02-07)
3. [Formato Z.AI Chat Completions](#3-formato-zai-chat-completions)
   - 3.1 [Endpoint y Autenticación](#31-endpoint-y-autenticación)
   - 3.2 [Request Body Completo](#32-request-body-completo)
   - 3.3 [Response Body](#33-response-body)
   - 3.4 [Parámetros Soportados](#34-parámetros-soportados)
4. [Análisis de Compatibilidad: Responses API → Chat Completions](#4-análisis-de-compatibilidad-responses-api--chat-completions)
   - 4.1 [Mapeo de Campos](#41-mapeo-de-campos)
   - 4.2 [Prompt `00_CrearProyecto.json` — Transformación Detallada](#42-prompt-00_crearproyectojson--transformación-detallada)
   - 4.3 [Prompt `01_ActivoFisico.json` — Transformación Detallada](#43-prompt-01_activofisicojson--transformación-detallada)
   - 4.4 [Función de Transformación Genérica](#44-función-de-transformación-genérica)
5. [Evaluación por Prompt: Riesgos y Ajustes Necesarios](#5-evaluación-por-prompt-riesgos-y-ajustes-necesarios)
   - 5.1 [`00_CrearProyecto.json` — Generación de JSON](#51-00_crearproyectojson--generación-de-json)
   - 5.2 [`01_ActivoFisico.json` — Generación de Markdown](#52-01_activofisicojson--generación-de-markdown)
   - 5.3 [Prompts 02-07 — Proyección](#53-prompts-02-07--proyección)
6. [Model Mapping por Proveedor](#6-model-mapping-por-proveedor)
7. [Consideraciones Específicas de Z.AI](#7-consideraciones-específicas-de-zai)
   - 7.1 [Thinking Mode](#71-thinking-mode)
   - 7.2 [Max Tokens](#72-max-tokens)
   - 7.3 [JSON Mode](#73-json-mode)
   - 7.4 [Rate Limits](#74-rate-limits)
8. [Veredicto Final](#8-veredicto-final)
9. [Acciones Requeridas](#9-acciones-requeridas)

---

## 1. Objetivo

Evaluar los prompts actuales almacenados en R2 del proyecto `cbc-endes` y determinar qué cambios de formato son necesarios para que funcionen correctamente con la API de **Z.AI (GLM)** mediante su endpoint **Chat Completions**, que es compatible con OpenAI pero **no** con el formato Responses API que usa el proyecto actualmente.

---

## 2. Prompts Actuales en R2

### 2.1 Prompt `00_CrearProyecto.json`

**Ubicación en R2:** `prompts-ia/00_CrearProyecto.json`
**Propósito:** Extraer datos de un IJSON (objeto JSON de entrada con datos de inmueble) y devolver un JSON estructurado con campos del proyecto + resumen ejecutivo en Markdown.

**Formato actual (OpenAI Responses API):**
```json
{
  "model": "gpt-5",
  "instructions": "Eres un extractor y redactor especializado en fichas inmobiliarias...\n\n[20 reglas obligatorias + criterios de mapeo + formato de salida]",
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

**Características clave:**
- `instructions`: Prompt muy largo (~3.500 caracteres) con 20 reglas obligatorias en español
- Exige salida **exclusivamente JSON válido** (regla 18)
- El campo `pro_resumen_ejecutivo` contiene Markdown dentro del JSON
- El placeholder `%%ijson%%` se reemplaza con el JSON de entrada (escapeado)
- No tiene parámetros de configuración (`temperature`, `max_tokens`, etc.)

### 2.2 Prompt `01_ActivoFisico.json`

**Ubicación en R2:** `prompts-ia/01_ActivoFisico.json`
**Propósito:** Analizar la dimensión física de un inmueble descrito en IJSON y devolver un reporte Markdown.

**Formato actual (OpenAI Responses API):**
```json
{
  "model": "gpt-5",
  "instructions": "You are a Physical Asset Real Estate Analyst specialized in real estate assets in Spain.\n\n[Task, Objective, Mandatory rules, Physical analysis priorities, Output format]",
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

**Características clave:**
- `instructions`: Prompt en inglés (~2.500 caracteres) con reglas y prioridades
- Exige salida **Markdown** (no JSON)
- Estructura de salida definida con secciones opcionales
- El placeholder `%%ijson%%` se reemplaza igual que en el anterior
- Sin parámetros de configuración

### 2.3 Estructura Común de Ambos Prompts

Ambos prompts comparten exactamente la misma estructura:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `model` | string | `"gpt-5"` — modelo de OpenAI Responses API |
| `instructions` | string | System prompt largo con reglas, objetivos y formato de salida |
| `input` | array | Array de items con `role`, `content[].type`, `content[].text` |
| `input[0].content[0].text` | string | Contiene `%%ijson%%` como placeholder |

**Datos del sistema de tracking (log.json) que confirman el formato:**
```json
{
  "request_body": {
    "model": "gpt-5",
    "instructions": "...",
    "input": [{"role": "user", "content": [{"type": "input_text", "text": "..."}]}]
  }
}
```

### 2.4 Prompts Pendientes (02-07)

Los siguientes prompts están **definidos en código** (`ia-analisis-proyectos.ts`) pero sus archivos JSON **aún no existen** en R2:

| Prompt | Clave | Contenido |
|--------|-------|-----------|
| `02_ActivoEstrategico.json` | `analisis-estrategico` | Análisis estratégico del inmueble |
| `03_ActivoFinanciero.json` | `analisis-financiero` | Análisis financiero |
| `04_ActivoRegulado.json` | `analisis-regulatorio` | Análisis regulatorio/legal |
| `05_Inversor.json` | `inversor` | Lectura para perfil inversor |
| `06_EmprendedorOperador.json` | `emprendedor-operador` | Lectura para perfil operador |
| `07_Propietario.json` | `propietario` | Lectura para perfil propietario |

**Nota:** Los prompts 05-07 recibirán como input no solo el IJSON sino también los Markdown de los pasos 1-4. La transformación de placeholders (`%%analisis-fisico%%`, etc.) se hace en `ia-analisis-proyectos.ts` antes de llamar al provider.

---

## 3. Formato Z.AI Chat Completions

### 3.1 Endpoint y Autenticación

| Aspecto | Valor |
|---------|-------|
| **Endpoint** | `POST https://api.z.ai/api/paas/v4/chat/completions` |
| **Coding Plan** | `POST https://api.z.ai/api/coding/paas/v4/chat/completions` |
| **Autenticación** | `Authorization: Bearer <ZAI_API_KEY>` |
| **Headers** | `Content-Type: application/json` |

### 3.2 Request Body Completo

```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "System prompt / instructions aquí" },
    { "role": "user", "content": "Contenido del usuario (IJSON)" }
  ],
  "max_tokens": 128000,
  "temperature": 0.7,
  "top_p": 0.9,
  "presence_penalty": 0.0,
  "stream": false,
  "thinking": { "type": "enabled" },
  "response_format": { "type": "json_object" }
}
```

**Parámetros:**
| Parámetro | Requerido | Tipo | Descripción |
|-----------|-----------|------|-------------|
| `model` | ✅ | string | `"glm-5.1"`, `"glm-5"`, `"glm-5-turbo"`, etc. |
| `messages` | ✅ | array | Array de `{ role, content }` con roles: `system`, `user`, `assistant` |
| `max_tokens` | ❌ | int | Límite de tokens de respuesta (máx 128.000) |
| `temperature` | ❌ | float | Control de creatividad (típicamente 0.0-2.0) |
| `top_p` | ❌ | float | Nucleus sampling (típicamente 0.0-1.0) |
| `presence_penalty` | ❌ | float | Penalización por repetición (típicamente -2.0 a 2.0) |
| `stream` | ❌ | bool | `true` para SSE streaming |
| `thinking` | ❌ | object | `{ "type": "enabled" }` para chain-of-thought |
| `response_format` | ❌ | object | `{ "type": "json_object" }` para modo JSON |
| `tools` | ❌ | array | Function calling |

### 3.3 Response Body

**Modo no-streaming (el que usa el proyecto):**
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1694123456,
  "model": "glm-5.1",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "Texto de respuesta aquí" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 1500,
    "completion_tokens": 800,
    "total_tokens": 2300
  }
}
```

### 3.4 Parámetros Soportados

Z.AI GLM soporta explícitamente:
- ✅ `messages` (system/user/assistant)
- ✅ `temperature`
- ✅ `max_tokens` (hasta 128.000)
- ✅ `top_p`
- ✅ `presence_penalty`
- ✅ `stream`
- ✅ `thinking` (modo razonamiento)
- ✅ `response_format` (structured output / JSON mode)
- ✅ `tools` (function calling)

**Confirmado:** GLM-5.1 soporta structured output (JSON mode) según documentación oficial de Z.AI.

---

## 4. Análisis de Compatibilidad: Responses API → Chat Completions

### 4.1 Mapeo de Campos

| OpenAI Responses API | Z.AI Chat Completions | Notas |
|---------------------|----------------------|-------|
| `model` | `model` | Cambiar valor: `"gpt-5"` → `"glm-5.1"` |
| `instructions` | `messages[0].content` (role: system) | Texto directo, no array |
| `input[0].content[0].text` | `messages[1].content` (role: user) | Texto directo, no array anidado |
| `input[0].content[0].type` | *(no aplica)* | Chat Completions no usa `type` |
| *(no existe)* | `max_tokens` | Opcional pero recomendado |
| *(no existe)* | `response_format` | `{ type: "json_object" }` para prompt 00 |

### 4.2 Prompt `00_CrearProyecto.json` — Transformación Detallada

**Entrada (actual, Responses API):**
```json
{
  "model": "gpt-5",
  "instructions": "Eres un extractor y redactor...",
  "input": [{ "role": "user", "content": [{ "type": "input_text", "text": "%%ijson%%" }] }]
}
```

**Salida esperada (Z.AI Chat Completions):**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "Eres un extractor y redactor..." },
    { "role": "user", "content": "{\"pro_tipo_inmueble\": \"Piso\", ...}" }
  ],
  "max_tokens": 4096,
  "temperature": 0.3,
  "response_format": { "type": "json_object" }
}
```

**Cambios específicos:**
1. `model`: `"gpt-5"` → `"glm-5.1"` (vía model map)
2. `instructions` → `messages[0]` con `role: "system"` y `content` como string directo
3. `input[0].content[0].text` (ya con `%%ijson%%` reemplazado) → `messages[1]` con `role: "user"` y `content` como string directo
4. Añadir `response_format: { type: "json_object" }` — **CRÍTICO** para garantizar salida JSON válida
5. Añadir `max_tokens: 4096` — recomendado para este prompt (JSON + resumen)
6. Añadir `temperature: 0.3` — bajo para máxima determinación en extracción de datos

### 4.3 Prompt `01_ActivoFisico.json` — Transformación Detallada

**Entrada (actual, Responses API):**
```json
{
  "model": "gpt-5",
  "instructions": "You are a Physical Asset Real Estate Analyst...",
  "input": [{ "role": "user", "content": [{ "type": "input_text", "text": "%%ijson%%" }] }]
}
```

**Salida esperada (Z.AI Chat Completions):**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "You are a Physical Asset Real Estate Analyst..." },
    { "role": "user", "content": "{\"pro_tipo_inmueble\": \"Piso\", ...}" }
  ],
  "max_tokens": 8192,
  "temperature": 0.7
}
```

**Cambios específicos:**
1. `model`: `"gpt-5"` → `"glm-5.1"` (vía model map)
2. `instructions` → `messages[0]` con `role: "system"`
3. `input[0].content[0].text` → `messages[1]` con `role: "user"`
4. Añadir `max_tokens: 8192` — los reportes Markdown son más largos
5. Añadir `temperature: 0.7` — balance entre creatividad y precisión
6. **NO** añadir `response_format` — este prompt devuelve Markdown libre, no JSON

### 4.4 Función de Transformación Genérica

La siguiente función transforma cualquier prompt Responses API a Chat Completions:

```typescript
/**
 * Transforma un prompt OpenAI Responses API a formato Chat Completions (OpenAI-compatible)
 * Usado por: Z.AI, Qwen, DeepSeek providers
 */
function responsesToChatCompletions(
  promptRaw: string,
  inputJson: string,
  modelOverride?: string,
  options?: { responseFormat?: 'json_object' | 'text'; maxTokens?: number; temperature?: number }
): Record<string, unknown> {
  const prompt = JSON.parse(promptRaw) as {
    model: string
    instructions: string
    input: Array<{ role: string; content: Array<{ type: string; text: string }> }>
  }

  // Escapar el JSON de entrada para inserción segura
  const escapedInput = JSON.stringify(inputJson).slice(1, -1)

  // Extraer el texto del user message con placeholder reemplazado
  const userText = prompt.input[0].content[0].text.replace('%%ijson%%', escapedInput)

  // Construir request Chat Completions
  const body: Record<string, unknown> = {
    model: modelOverride || prompt.model,
    messages: [
      { role: 'system', content: prompt.instructions },
      { role: 'user', content: userText },
    ],
  }

  // Parámetros opcionales
  if (options?.maxTokens) body.max_tokens = options.maxTokens
  if (options?.temperature !== undefined) body.temperature = options.temperature
  if (options?.responseFormat === 'json_object') {
    body.response_format = { type: 'json_object' }
  }

  return body
}
```

**Esta función es reutilizable por Z.AI, Qwen y DeepSeek** (los 3 usan Chat Completions compatible).

---

## 5. Evaluación por Prompt: Riesgos y Ajustes Necesarios

### 5.1 `00_CrearProyecto.json` — Generación de JSON

| Aspecto | Evaluación | Riesgo | Mitigación |
|---------|-----------|--------|------------|
| **Instrucciones en español** | ✅ GLM-5.1 es multilingüe | Bajo | Sin cambio necesario |
| **Salida JSON estricta** | ⚠️ GLM soporta `response_format: json_object` | Medio | **Añadir `response_format` en la transformación** |
| **20 reglas complejas** | ✅ Contexto de 200K tokens las absorbe sin problema | Bajo | Sin cambio necesario |
| **IJSON como input** | ✅ String directo en `messages[1].content` | Bajo | La transformación lo maneja |
| **Markdown dentro de JSON** | ⚠️ El campo `pro_resumen_ejecutivo` contiene Markdown | Medio | `response_format: json_object` podría ser menos estricto que OpenAI — validar salida |
| **Campo `model`** | ⚠️ Dice `"gpt-5"` | Alto | **Debe mapearse a `"glm-5.1"`** en el provider |

**Ajustes necesarios:**
1. ✅ Transformación automática Responses→Chat Completions (función genérica)
2. ✅ Model mapping: `gpt-5` → `glm-5.1`
3. ✅ Añadir `response_format: { type: "json_object" }`
4. ⚠️ **Post-validación:** El código actual ya parsea el resultado con `parsearResultadoJSON()` (intenta parse directo + regex para extraer `{...}` de markdown). Esto es compatible con GLM.

**Veredicto:** ✅ **Compatible con cambios automáticos en el provider. No requiere modificar el prompt JSON en R2.**

### 5.2 `01_ActivoFisico.json` — Generación de Markdown

| Aspecto | Evaluación | Riesgo | Mitigación |
|---------|-----------|--------|------------|
| **Instrucciones en inglés** | ✅ GLM-5.1 es multilingüe | Bajo | Sin cambio necesario |
| **Salida Markdown libre** | ✅ Sin restricciones de formato | Bajo | Sin cambio necesario |
| **Estructura de secciones** | ✅ GLM sigue instrucciones de formato | Bajo | Sin cambio necesario |
| **"Write in Spanish from Spain"** | ✅ GLM soporta múltiples idiomas | Bajo | Sin cambio necesario |
| **Campo `model`** | ⚠️ Dice `"gpt-5"` | Alto | **Debe mapearse a `"glm-5.1"`** |

**Ajustes necesarios:**
1. ✅ Transformación automática Responses→Chat Completions
2. ✅ Model mapping: `gpt-5` → `glm-5.1`
3. ✅ Sin `response_format` — salida libre

**Veredicto:** ✅ **Compatible con cambios automáticos en el provider. No requiere modificar el prompt JSON en R2.**

### 5.3 Prompts 02-07 — Proyección

Basado en el análisis de los prompts 00 y 01, y dado que los prompts 02-07 seguirán la misma estructura Responses API:

**Proyección:** Todos los prompts futuros serán compatibles con Z.AI mediante la misma transformación automática.

**Consideración especial para prompts 05-07:** Estos reciben múltiples inputs (IJSON + 4 Markdowns de pasos anteriores). La función `reemplazarPlaceholders()` en `ia-analisis-proyectos.ts` ya maneja esto reemplazando `%%ijson%%`, `%%analisis-fisico%%`, etc. El texto resultante (ya con todos los placeholders reemplazados) se pasa al provider como `inputJson`. La transformación a Chat Completions es idéntica.

---

## 6. Model Mapping por Proveedor

Cada proveedor necesita un mapeo del modelo declarado en el prompt (`"gpt-5"`) a su modelo equivalente:

```typescript
// zai-provider.ts
const MODEL_MAP: Record<string, string> = {
  'gpt-5': 'glm-5.1',
  'gpt-5.4': 'glm-5.1',
}

// gemini-provider.ts
const MODEL_MAP: Record<string, string> = {
  'gpt-5': 'gemini-2.5-flash',
  'gpt-5.4': 'gemini-2.5-flash',
}

// anthropic-provider.ts
const MODEL_MAP: Record<string, string> = {
  'gpt-5': 'claude-sonnet-4-20250514',
  'gpt-5.4': 'claude-sonnet-4-20250514',
}

// qwen-provider.ts
const MODEL_MAP: Record<string, string> = {
  'gpt-5': 'qwen3.5-plus',
  'gpt-5.4': 'qwen3.5-plus',
}

// deepseek-provider.ts
const MODEL_MAP: Record<string, string> = {
  'gpt-5': 'deepseek-chat',
  'gpt-5.4': 'deepseek-chat',
}
```

**Nota:** El prompt JSON **no se modifica en R2**. Siempre mantiene `"model": "gpt-5"`. El provider sobrescribe el modelo en la transformación.

---

## 7. Consideraciones Específicas de Z.AI

### 7.1 Thinking Mode

Z.AI soporta `"thinking": { "type": "enabled" }` que activa chain-of-thought. Esto es útil para los prompts de análisis complejo (01-07).

**Recomendación:** Habilitar thinking mode para los prompts de análisis (01-07) pero **no** para `00_CrearProyecto.json` (extracción directa de datos, no requiere razonamiento profundo).

```typescript
// Para prompts de análisis (01-07):
body.thinking = { type: 'enabled' }

// Para creación de proyectos (00):
// Sin thinking — extracción directa es más rápida y barata
```

### 7.2 Max Tokens

| Prompt | Max Tokens Recomendado | Razón |
|--------|----------------------|-------|
| `00_CrearProyecto.json` | 4096 | JSON con ~12 campos + resumen de 90-180 palabras |
| `01_ActivoFisico.json` | 8192 | Reporte Markdown con 5 secciones |
| `02-07_Análisis*.json` | 8192 | Reportes similares en longitud |

Z.AI soporta hasta 128.000 tokens de output. Los prompts actuales no se acercan a este límite.

### 7.3 JSON Mode

Para `00_CrearProyecto.json`, es **crítico** usar `response_format: { type: "json_object" }`:

```typescript
// En zai-provider.ts, detectar si el prompt requiere JSON:
const requiresJson = promptName === '00_CrearProyecto.json'
if (requiresJson) {
  body.response_format = { type: 'json_object' }
}
```

**Alternativa:** Podría detectarse analizando las instrucciones del prompt (buscar "JSON válido", "objeto JSON", etc.), pero el match por nombre de archivo es más fiable.

### 7.4 Rate Limits

Z.AI no publica rate limits específicos del plan general. El Coding Plan tiene un límite de **4 requests/segundo** por token de autenticación.

Para el volumen actual del proyecto (unos pocos prompts simultáneos), **no es un problema**. Si se escala, considerar:
- Implementar cola de requests si se superan 4/segundo
- Usar el Coding Plan para mayor capacidad

---

## 8. Veredicto Final

### ¿Es necesario modificar los prompts en R2?

**NO.** Los prompts actuales en R2 **no necesitan modificación**. Toda la transformación se hace en runtime en el provider.

| Elemento | ¿Requiere cambio en R2? | ¿Dónde se resuelve? |
|----------|------------------------|---------------------|
| Formato Responses API → Chat Completions | ❌ No | `zai-provider.ts` (transformación automática) |
| Modelo `gpt-5` → `glm-5.1` | ❌ No | `zai-provider.ts` (model map) |
| `response_format: json_object` | ❌ No | `zai-provider.ts` (añadido dinámico) |
| `max_tokens` | ❌ No | `zai-provider.ts` (añadido dinámico) |
| `temperature` | ❌ No | `zai-provider.ts` (añadido dinámico) |
| `thinking` mode | ❌ No | `zai-provider.ts` (añadido dinámico) |
| Placeholder `%%ijson%%` | ❌ No | `ia-analisis-proyectos.ts` (ya implementado) |

### Compatibilidad confirmada

| Prompt | Compatible con Z.AI | Cambios necesarios |
|--------|---------------------|-------------------|
| `00_CrearProyecto.json` | ✅ Sí | Transformación automática + JSON mode + model map |
| `01_ActivoFisico.json` | ✅ Sí | Transformación automática + model map |
| `02-07_*.json` (futuros) | ✅ Sí | Misma transformación automática |

---

## 9. Acciones Requeridas

### Inmediatas (para implementar zai-provider)
| # | Acción | Detalle |
|---|--------|---------|
| 1 | Crear `responsesToChatCompletions()` | Función de transformación genérica en `lib/providers/transformers.ts` |
| 2 | Crear model map para Z.AI | `MODEL_MAP` en `zai-provider.ts` |
| 3 | Detectar JSON mode por nombre de prompt | Lógica en `zai-provider.ts` para `00_CrearProyecto.json` |
| 4 | Configurar parámetros por tipo de prompt | `max_tokens`, `temperature`, `thinking` según tipo |

### Futuras (al crear prompts 02-07)
| # | Acción | Detalle |
|---|--------|---------|
| 5 | Mantener formato Responses API | Los nuevos prompts deben seguir la misma estructura `{ model, instructions, input[] }` |
| 6 | No añadir parámetros al JSON | `temperature`, `max_tokens`, etc. van en el provider, no en el prompt |

### Normalización de `IA_PROVIDER`
| # | Acción | Detalle |
|---|--------|---------|
| 7 | Cambiar valor en KV | De `zaiProvider` a `zai` (coincide con registry key) |

---

*Documento generado: 2026-04-08*
*Basado en documentación de Z.AI (docs.z.ai) y análisis directo de prompts en R2*
