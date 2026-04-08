# Evaluación Completa de los 8 Prompts R2 para Compatibilidad con Z.AI

## Índice de Contenidos
1. [Objetivo](#1-objetivo)
2. [Los 8 Prompts Reales en R2](#2-los-8-prompts-reales-en-r2)
   - 2.1 [Prompt `00_CrearProyecto.json`](#21-prompt-00_crearproyectojson)
   - 2.2 [Prompt `01_ActivoFisico.json`](#22-prompt-01_activofisicojson)
   - 2.3 [Prompt `02_ActivoEstrategico.json`](#23-prompt-02_activoestrategicojson)
   - 2.4 [Prompt `03_ActivoFinanciero.json`](#24-prompt-03_activofinancierojson)
   - 2.5 [Prompt `04_ActivoRegulado.json`](#25-prompt-04_activoreguladojson)
   - 2.6 [Prompt `05_Inversor.json`](#26-prompt-05_inversorjson)
   - 2.7 [Prompt `06_EmprendedorOperador.json`](#27-prompt-06_emprendedoroperadorjson)
   - 2.8 [Prompt `07_Propietario.json`](#28-prompt-07_propietariojson)
3. [Clasificación de Prompts por Complejidad de Input](#3-clasificación-de-prompts-por-complejidad-de-input)
4. [Formato Z.AI Chat Completions — Referencia](#4-formato-zai-chat-completions--referencia)
5. [Análisis de Compatibilidad por Prompt](#5-análisis-de-compatibilidad-por-prompt)
   - 5.1 [Grupo 1: Prompts de un solo input (00-04)](#51-grupo-1-prompts-de-un-solo-input-00-04)
   - 5.2 [Grupo 2: Prompts de múltiples inputs (05-07)](#52-grupo-2-prompts-de-múltiples-inputs-05-07)
6. [Transformación Detallada: Responses API → Chat Completions](#6-transformación-detallada-responses-api--chat-completions)
   - 6.1 [Función Genérica para Grupo 1](#61-función-genérica-para-grupo-1)
7. [Model Mapping por Proveedor](#7-model-mapping-por-proveedor)
8. [Evaluación de Riesgos por Prompt](#8-evaluación-de-riesgos-por-prompt)
9. [Opción A: Transformación en Runtime (sin duplicar prompts)](#9-opción-a-transformación-en-runtime-sin-duplicar-prompts)
10. [Opción B: Duplicar Prompts en R2 (car dedicata zaiProvider)](#10-opción-b-duplicar-prompts-en-r2-carpeta-dedicada-zaiprovider)
11. [Comparativa Opción A vs Opción B](#11-comparativa-opción-a-vs-opción-b)
12. [Recomendación Final](#12-recomendación-final)
13. [Acciones Requeridas](#13-acciones-requeridas)

---

## 1. Objetivo

Evaluar los **8 prompts reales** almacenados en R2 (`prompts-ia/00_CrearProyecto.json` a `prompts-ia/07_Propietario.json`) y determinar la estrategia óptima para que funcionen con la API de **Z.AI (GLM)** mediante su endpoint **Chat Completions**. Se evalúan dos estrategias: (A) transformación en runtime sin modificar R2, y (B) duplicación de prompts en una carpeta dedicada `prompts-ia/zaiProvider/`.

---

## 2. Los 8 Prompts Reales en R2

### 2.1 Prompt `00_CrearProyecto.json`

**Propósito:** Extraer datos de un IJSON → JSON estructurado del proyecto + resumen ejecutivo en Markdown.

| Campo | Contenido |
|-------|-----------|
| `model` | `"gpt-5"` |
| `instructions` | 20 reglas en español. Exige salida **exclusivamente JSON válido**. 11 campos de salida. `pro_resumen_ejecutivo` contiene Markdown dentro del JSON. |
| `input[0].content` | **1 item**: `{ type: "input_text", text: "%%ijson%%" }` |
| **Tipo de salida** | **JSON** |
| **Idioma instructions** | Español |
| **Tamaño approx.** | ~3.500 caracteres en instructions |

### 2.2 Prompt `01_ActivoFisico.json`

**Propósito:** Análisis físico del inmueble → reporte Markdown.

| Campo | Contenido |
|-------|-----------|
| `model` | `"gpt-5"` |
| `instructions` | Analyst role en inglés. 10 reglas + prioridades de análisis físico + formato de salida con 5 secciones. |
| `input[0].content` | **1 item**: `{ type: "input_text", text: "%%ijson%%" }` |
| **Tipo de salida** | **Markdown** |
| **Idioma instructions** | Inglés (salida en español de España) |
| **Tamaño approx.** | ~2.500 caracteres |

### 2.3 Prompt `02_ActivoEstrategico.json`

**Propósito:** Análisis estratégico del inmueble → reporte Markdown.

| Campo | Contenido |
|-------|-----------|
| `model` | `"gpt-5"` |
| `instructions` | Analyst role en inglés. Enfoque en Valencia y área metropolitana. 12 reglas + prioridades estratégicas + método + 6 secciones de salida. |
| `input[0].content` | **1 item**: `{ type: "input_text", text: "%%ijson%%" }` |
| **Tipo de salida** | **Markdown** |
| **Idioma instructions** | Inglés (salida en español) |
| **Tamaño approx.** | ~3.000 caracteres |

### 2.4 Prompt `03_ActivoFinanciero.json`

**Propósito:** Análisis financiero/preliminar económico → reporte Markdown.

| Campo | Contenido |
|-------|-----------|
| `model` | `"gpt-5"` |
| `instructions` | Analyst role en inglés. Enfoque Valencia. 13 reglas + prioridades financieras + método + 5 secciones de salida. |
| `input[0].content` | **1 item**: `{ type: "input_text", text: "%%ijson%%" }` |
| **Tipo de salida** | **Markdown** |
| **Idioma instructions** | Inglés (salida en español) |
| **Tamaño approx.** | ~3.200 caracteres |

### 2.5 Prompt `04_ActivoRegulado.json`

**Propósito:** Análisis regulatorio/legal → reporte Markdown.

| Campo | Contenido |
|-------|-----------|
| `model` | `"gpt-5"` |
| `instructions` | Analyst role en inglés. 13 reglas + prioridades regulatorias + método + 5 secciones de salida. |
| `input[0].content` | **1 item**: `{ type: "input_text", text: "%%ijson%%" }` |
| **Tipo de salida** | **Markdown** |
| **Idioma instructions** | Inglés (salida en español) |
| **Tamaño approx.** | ~3.300 caracteres |

### 2.6 Prompt `05_Inversor.json`

**Propósito:** Capa de decisión inversora → reporte Markdown.

| Campo | Contenido |
|-------|-----------|
| `model` | `"gpt-5"` |
| `instructions` | Analyst role en inglés. 14 reglas + prioridades de inversión + método + 5 secciones. **Referencia a 4 análisis previos como input.** |
| `input[0].content` | **6 items** (multi-input): |
| | 1. `"Analiza la capa de decisión inversora..."` |
| | 2. `"%%ijson%%"` |
| | 3. `"## Análisis físico\n\n%%analisis-fisico%%"` |
| | 4. `"## Análisis estratégico\n\n%%analisis-estrategico%%"` |
| | 5. `"## Análisis financiero\n\n%%analisis-financiero%%"` |
| | 6. `"## Análisis regulatorio\n\n%%analisis-regulatorio%%"` |
| **Tipo de salida** | **Markdown** |
| **Idioma instructions** | Inglés (salida en español) |
| **Tamaño approx.** | ~3.500 caracteres + contenido de 4 MDs |

### 2.7 Prompt `06_EmprendedorOperador.json`

**Propósito:** Capa de decisión emprendedor/operador → reporte Markdown.

| Campo | Contenido |
|-------|-----------|
| `model` | `"gpt-5"` |
| `instructions` | Analyst role en inglés. 14 reglas + prioridades operativas + 6 secciones de salida. **Referencia a 4 análisis previos.** |
| `input[0].content` | **6 items** (multi-input): |
| | 1. `"Analiza la capa de decisión de emprendedor/operador..."` |
| | 2. `"%%ijson%%"` |
| | 3-6. Mismos 4 placeholders de análisis que prompt 05 |
| **Tipo de salida** | **Markdown** |
| **Idioma instructions** | Inglés (salida en español) |
| **Tamaño approx.** | ~3.500 caracteres + contenido de 4 MDs |

### 2.8 Prompt `07_Propietario.json`

**Propósito:** Capa de decisión patrimonial del propietario → reporte Markdown.

| Campo | Contenido |
|-------|-----------|
| `model` | `"gpt-5"` |
| `instructions` | Analyst role en inglés. 13 reglas + prioridades patrimoniales + 5 secciones de salida. **Referencia a 4 análisis previos.** |
| `input[0].content` | **6 items** (multi-input): |
| | 1. `"Analiza la capa de decisión patrimonial del propietario..."` |
| | 2. `"%%ijson%%"` |
| | 3-6. Mismos 4 placeholders de análisis que prompts 05-06 |
| **Tipo de salida** | **Markdown** |
| **Idioma instructions** | Inglés (salida en español) |
| **Tamaño approx.** | ~3.400 caracteres + contenido de 4 MDs |

---

## 3. Clasificación de Prompts por Complejidad de Input

| Grupo | Prompts | Estructura de `input[0].content` | Transformación |
|-------|---------|----------------------------------|----------------|
| **Grupo 1: Single-input** | 00, 01, 02, 03, 04 | **1 item** → `{ type: "input_text", text: "%%ijson%%" }` | Simple: `instructions` → system, `text` → user |
| **Grupo 2: Multi-input** | 05, 06, 07 | **6 items** → instrucción + ijson + 4 análisis previos | Concatenar todos los items en un solo user message |

**Nota sobre Grupo 2:** En el formato Responses API, cada item en `content[]` es un bloque separado que el modelo procesa en conjunto. En Chat Completions, todo el contenido del usuario va en un solo string `content`. La transformación debe **concatenar** todos los items con separadores.

---

## 4. Formato Z.AI Chat Completions — Referencia

**Endpoint:** `POST https://api.z.ai/api/paas/v4/chat/completions`
**Auth:** `Authorization: Bearer <ZAI_API_KEY>`

**Request body:**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "Instructions aquí como string directo" },
    { "role": "user", "content": "Contenido del usuario como string directo" }
  ],
  "max_tokens": 8192,
  "temperature": 0.7,
  "top_p": 0.9,
  "response_format": { "type": "json_object" }
}
```

**Response body:**
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "model": "glm-5.1",
  "choices": [{
    "index": 0,
    "message": { "role": "assistant", "content": "Respuesta del modelo" },
    "finish_reason": "stop"
  }],
  "usage": { "prompt_tokens": N, "completion_tokens": N, "total_tokens": N }
}
```

**Parámetros soportados por Z.AI GLM-5.1:**
- ✅ `model`, `messages` (system/user/assistant)
- ✅ `max_tokens` (hasta 128.000)
- ✅ `temperature`, `top_p`, `presence_penalty`
- ✅ `stream` (SSE)
- ✅ `thinking: { type: "enabled" }` (chain-of-thought)
- ✅ `response_format: { type: "json_object" }` (JSON mode)
- ✅ `tools` (function calling)
- Contexto: **200.000 tokens** (GLM-5.1)

---

## 5. Análisis de Compatibilidad por Prompt

### 5.1 Grupo 1: Prompts de un solo input (00-04)

**Estructura actual (Responses API):**
```json
{
  "model": "gpt-5",
  "instructions": "...texto largo...",
  "input": [{ "role": "user", "content": [{ "type": "input_text", "text": "%%ijson%%" }] }]
}
```

**Transformación necesaria (Chat Completions):**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "...texto largo de instructions..." },
    { "role": "user", "content": "{\"datos\": \"del inmueble...\"}" }
  ],
  "max_tokens": 4096,
  "temperature": 0.3
}
```

**Cambios:**
1. `model`: `"gpt-5"` → `"glm-5.1"` (model map)
2. `instructions` → `messages[0]` con `role: "system"`, `content` como string directo
3. `input[0].content[0].text` → `messages[1]` con `role: "user"`, `content` como string directo
4. Para prompt 00: añadir `response_format: { type: "json_object" }`
5. Añadir `max_tokens` y `temperature` apropiados

**Complejidad:** ✅ **Baja** — transformación directa y predecible.

### 5.2 Grupo 2: Prompts de múltiples inputs (05-07)

**Estructura actual (Responses API):**
```json
{
  "model": "gpt-5",
  "instructions": "...texto largo...",
  "input": [{
    "role": "user",
    "content": [
      { "type": "input_text", "text": "Analiza la capa de decisión..." },
      { "type": "input_text", "text": "%%ijson%%" },
      { "type": "input_text", "text": "## Análisis físico\n\n%%analisis-fisico%%" },
      { "type": "input_text", "text": "## Análisis estratégico\n\n%%analisis-estrategico%%" },
      { "type": "input_text", "text": "## Análisis financiero\n\n%%analisis-financiero%%" },
      { "type": "input_text", "text": "## Análisis regulatorio\n\n%%analisis-regulatorio%%" }
    ]
  }]
}
```

**Transformación necesaria (Chat Completions):**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "...texto largo de instructions..." },
    { "role": "user", "content": "Analiza la capa de decisión...\n\n{\"datos\": \"...\"}\n\n## Análisis físico\n\n[contenido MD]\n\n## Análisis estratégico\n\n[contenido MD]\n\n## Análisis financiero\n\n[contenido MD]\n\n## Análisis regulatorio\n\n[contenido MD]" }
  ],
  "max_tokens": 8192,
  "temperature": 0.7
}
```

**Cambios:**
1. Mismo model map y system message que Grupo 1
2. **Concatenar** los 6 items de `content[]` en un solo string `messages[1].content`, separados por `\n\n`
3. Cada placeholder (`%%ijson%%`, `%%analisis-fisico%%`, etc.) ya está reemplazado por `reemplazarPlaceholders()` antes de llegar al provider
4. El texto resultante puede ser muy largo (IJSON + 4 Markdowns de ~2KB cada uno = ~10KB+) pero GLM-5.1 soporta 200K tokens → **sin problema**

**Complejidad:** ⚠️ **Media** — requiere concatenación de múltiples content items.

---

## 6. Transformación Detallada: Responses API → Chat Completions

### 6.1 Función Genérica para Grupo 1

```typescript
/**
 * Transforma prompt Responses API (single-input) a Chat Completions.
 * Para prompts 00-04.
 */
function responsesToChatCompletions(
  promptRaw: string,
  inputJson: string,
  modelOverride: string,
  options?: { responseFormat?: 'json_object'; maxTokens?: number; temperature?: number }
): Record<string, unknown> {
  const prompt = JSON.parse(promptRaw) as {
    model: string
    instructions: string
    input: Array<{ role: string; content: Array<{ type: string; text: string }> }>
  }

  // Escapar input JSON para inserción segura en string
  const escapedInput = JSON.stringify(inputJson).slice(1, -1)

  // Reemplazar placeholder en el texto del user message
  const userText = prompt.input[0].content[0].text.replace('%%ijson%%', escapedInput)

  const body: Record<string, unknown> = {
    model: modelOverride,
    messages: [
      { role: 'system', content: prompt.instructions },
      { role: 'user', content: userText },
    ],
  }

  if (options?.maxTokens) body.max_tokens = options.maxTokens
  if (options?.temperature !== undefined) body.temperature = options.temperature
  if (options?.responseFormat === 'json_object') {
    body.response_format = { type: 'json_object' }
  }

  return body
}
```

### 6.2 Función para Grupo 2 (múltiples content items)

```typescript
/**
 * Transforma prompt Responses API (multi-input) a Chat Completions.
 * Para prompts 05-07 (Inversor, EmprendedorOperador, Propietario).
 *
 * El inputJson ya contiene TODOS los placeholders reemplazados
 * (%%ijson%%, %%analisis-fisico%%, etc.) por reemplazarPlaceholders().
 * Pero necesitamos reconstruir la estructura multi-bloque del prompt original.
 */
function responsesMultiToChatCompletions(
  promptRaw: string,
  inputs: InputsParaPaso,
  modelOverride: string,
  options?: { maxTokens?: number; temperature?: number }
): Record<string, unknown> {
  const prompt = JSON.parse(promptRaw) as {
    model: string
    instructions: string
    input: Array<{ role: string; content: Array<{ type: string; text: string }> }>
  }

  // Reconstruir cada content item con sus placeholders reemplazados
  const contentItems = prompt.input[0].content.map(item => {
    let text = item.text
    text = text.replace('%%ijson%%', JSON.stringify(inputs.ijson).slice(1, -1))
    if (inputs['analisis-fisico']) text = text.replace('%%analisis-fisico%%', inputs['analisis-fisico'])
    if (inputs['analisis-estrategico']) text = text.replace('%%analisis-estrategico%%', inputs['analisis-estrategico'])
    if (inputs['analisis-financiero']) text = text.replace('%%analisis-financiero%%', inputs['analisis-financiero'])
    if (inputs['analisis-regulatorio']) text = text.replace('%%analisis-regulatorio%%', inputs['analisis-regulatorio'])
    return text
  })

  // Concatenar todos los items en un solo user message
  const userText = contentItems.join('\n\n')

  const body: Record<string, unknown> = {
    model: modelOverride,
    messages: [
      { role: 'system', content: prompt.instructions },
      { role: 'user', content: userText },
    ],
  }

  if (options?.maxTokens) body.max_tokens = options.maxTokens
  if (options?.temperature !== undefined) body.temperature = options.temperature

  return body
}
```

---

## 7. Model Mapping por Proveedor

Cada proveedor traduce `"gpt-5"` a su modelo equivalente:

```typescript
// zai-provider.ts
const MODEL_MAP: Record<string, string> = { 'gpt-5': 'glm-5.1' }

// gemini-provider.ts
const MODEL_MAP: Record<string, string> = { 'gpt-5': 'gemini-2.5-flash' }

// anthropic-provider.ts
const MODEL_MAP: Record<string, string> = { 'gpt-5': 'claude-sonnet-4-20250514' }

// qwen-provider.ts
const MODEL_MAP: Record<string, string> = { 'gpt-5': 'qwen3.5-plus' }

// deepseek-provider.ts
const MODEL_MAP: Record<string, string> = { 'gpt-5': 'deepseek-chat' }

// openai-provider.ts
const MODEL_MAP: Record<string, string> = { 'gpt-5': 'gpt-5' } // sin cambio
```

---

## 8. Evaluación de Riesgos por Prompt

| Prompt | Compatibilidad | Riesgo Principal | Mitigación |
|--------|---------------|-----------------|------------|
| **00_CrearProyecto** | ✅ Alta | GLM no genera JSON válido | `response_format: json_object` + validación post-parse existente (`parsearResultadoJSON()`) |
| **01_ActivoFisico** | ✅ Alta | Ninguno identificado | Sin mitigación adicional |
| **02_ActivoEstrategico** | ✅ Alta | Ninguno identificado | Sin mitigación adicional |
| **03_ActivoFinanciero** | ✅ Alta | Ninguno identificado | Sin mitigación adicional |
| **04_ActivoRegulado** | ✅ Alta | Ninguno identificado | Sin mitigación adicional |
| **05_Inversor** | ⚠️ Media | Input muy largo (~10KB+) pierde coherencia al concatenar | Separadores claros `\n\n` + GLM-5.1 soporta 200K tokens |
| **06_EmprendedorOperador** | ⚠️ Media | Igual que 05 | Igual que 05 |
| **07_Propietario** | ⚠️ Media | Igual que 05 | Igual que 05 |

**Riesgo global:** ✅ **BAJO** para prompts 00-04, ⚠️ **MEDIO-BAJO** para prompts 05-07.

---

## 9. Opción A: Transformación en Runtime (sin duplicar prompts)

**Cómo funciona:**
- Los prompts en R2 **no se tocan** — mantienen formato Responses API
- El `zai-provider.ts` lee el prompt de R2 y lo transforma en memoria antes de enviar a la API
- Usa las funciones `responsesToChatCompletions()` y `responsesMultiToChatCompletions()`

**Ventajas:**
| Ventaja | Descripción |
|---------|-------------|
| **Cero duplicación** | Un solo set de prompts en R2 |
| **Mantenimiento simple** | Editar un prompt → funciona para todos los proveedores |
| **Sin drift** | No hay riesgo de que los prompts se desincronicen |
| **Coste R2** | Sin almacenamiento adicional |

**Desventajas:**
| Desventaja | Descripción |
|------------|-------------|
| **Transformación en cada llamada** | Pequeño overhead de CPU (insignificante) |
| **Dependencia del formato Responses API** | Si un prompt cambia su estructura, hay que actualizar el transformer |
| **No se puede afinar por proveedor** | Ej: no se puede poner `temperature: 0.5` solo para GLM sin afectar a OpenAI |

**Complejidad de implementación:** Media (2 funciones de transformación + registry)

---

## 10. Opción B: Duplicar Prompts en R2 (carpeta dedicada `zaiProvider`)

**Cómo funciona:**
- Se crea carpeta `prompts-ia/zaiProvider/` en R2 con 8 prompts en formato Chat Completions
- El `zai-provider.ts` lee de `prompts-ia/zaiProvider/{nombre}.json` directamente
- Sin transformación en runtime — los prompts ya están en el formato correcto

**Estructura en R2:**
```
r2-cbconsulting/
├── prompts-ia/
│   ├── 00_CrearProyecto.json          ← Formato OpenAI Responses (actual)
│   ├── 01_ActivoFisico.json           ← Formato OpenAI Responses (actual)
│   ├── ...02-07...                    ← Formato OpenAI Responses (actuales)
│   └── zaiProvider/
│       ├── 00_CrearProyecto.json      ← Formato Z.AI Chat Completions
│       ├── 01_ActivoFisico.json       ← Formato Z.AI Chat Completions
│       ├── 02_ActivoEstrategico.json  ← Formato Z.AI Chat Completions
│       ├── 03_ActivoFinanciero.json   ← Formato Z.AI Chat Completions
│       ├── 04_ActivoRegulado.json     ← Formato Z.AI Chat Completions
│       ├── 05_Inversor.json           ← Formato Z.AI Chat Completions
│       ├── 06_EmprendedorOperador.json ← Formato Z.AI Chat Completions
│       └── 07_Propietario.json        ← Formato Z.AI Chat Completions
```

**Ejemplo de prompt 00 en formato Z.AI:**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "Eres un extractor y redactor especializado en fichas inmobiliarias..." },
    { "role": "user", "content": "%%ijson%%" }
  ],
  "max_tokens": 4096,
  "temperature": 0.3,
  "response_format": { "type": "json_object" }
}
```

**Ejemplo de prompt 05 en formato Z.AI:**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "You are an Investor-Focused Real Estate Investment Analyst..." },
    { "role": "user", "content": "Analiza la capa de decisión inversora...\n\n%%ijson%%\n\n## Análisis físico\n\n%%analisis-fisico%%\n\n## Análisis estratégico\n\n%%analisis-estrategico%%\n\n## Análisis financiero\n\n%%analisis-financiero%%\n\n## Análisis regulatorio\n\n%%analisis-regulatorio%%" }
  ],
  "max_tokens": 8192,
  "temperature": 0.7
}
```

**Ventajas:**
| Ventaja | Descripción |
|---------|-------------|
| **Sin transformación en runtime** | El provider lee y envía directamente |
| **Afinamiento por proveedor** | Cada prompt puede tener `temperature`, `max_tokens`, `thinking` específicos para GLM |
| **Independencia de formato** | Si OpenAI cambia su Responses API, los prompts Z.AI no se afectan |
| **Código más simple** | El provider solo reemplaza placeholders y envía |

**Desventajas:**
| Desventaja | Descripción |
|------------|-------------|
| **Duplicación de 8 archivos** | 8 prompts adicionales en R2 |
| **Riesgo de drift** | Editar un prompt principal sin editar su equivalente Z.AI → inconsistencia |
| **Mantenimiento doble** | Cada cambio de instrucciones requiere actualización en 2 lugares |
| **Necesidad de script de sync** | Para mantener coherencia entre versiones |

**Complejidad de implementación:** Media-Baja (crear 8 prompts + cambiar path de lectura en provider)

---

## 11. Comparativa Opción A vs Opción B

| Criterio | Opción A (Runtime) | Opción B (Duplicación) |
|----------|-------------------|----------------------|
| **Archivos en R2** | 8 (actuales) | 16 (8 + 8 duplicados) |
| **Código del provider** | Más complejo (transformer) | Más simple (lectura directa) |
| **Mantenimiento de prompts** | Un solo lugar | Dos lugares |
| **Riesgo de drift** | Cero | Medio (requiere disciplina) |
| **Afinamiento por proveedor** | Limitado (parámetros en código) | Total (cada prompt es independiente) |
| **Resistencia a cambios de API externa** | Media (si OpenAI cambia formato) | Alta (prompts Z.AI son independientes) |
| **Coste de almacenamiento** | Mínimo | Mínimo (8 JSONs pequeños) |
| **Flexibilidad futura** | Media | Alta |
| **Complejidad de implementación** | Media | Baja |

---

## 12. Recomendación Final

### Recomendación: **Opción B — Duplicar prompts en `prompts-ia/zaiProvider/`**

**Razones:**

1. **Afinamiento por proveedor es valioso:** GLM-5.1 se beneficia de `temperature: 0.3` para extracción JSON y `thinking: enabled` para análisis complejos. Con la Opción A, estos parámetros estarían hardcodeados en el provider, no en el prompt.

2. **Independencia de formato:** Si OpenAI cambia su Responses API (ya ha evolucionado), los prompts Z.AI siguen funcionando sin tocar el transformer.

3. **Código más simple y mantenible:** El provider solo lee, reemplaza placeholders y envía. Sin lógica de transformación que puede fallar silenciosamente.

4. **El coste de duplicación es bajo:** 8 archivos JSON pequeños. El riesgo de drift se mitiga con un script de validación o documentación clara.

5. **Prepara el terreno para multi-proveedor real:** Cuando se añadan Gemini, Anthropic, etc., cada uno tendrá su carpeta con prompts optimizados:
   ```
   prompts-ia/
   ├── openai/    ← (o raíz, formato Responses API)
   ├── zai/       ← formato Chat Completions
   ├── gemini/    ← formato generateContent
   ├── anthropic/ ← formato Messages API
   └── ...
   ```

### Estructura de prompts Z.AI recomendada

Para cada uno de los 8 prompts, el formato en `prompts-ia/zaiProvider/` sería:

**Prompt 00 (JSON output):**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "[mismo instructions del prompt actual]" },
    { "role": "user", "content": "%%ijson%%" }
  ],
  "max_tokens": 4096,
  "temperature": 0.3,
  "response_format": { "type": "json_object" }
}
```

**Prompts 01-04 (Markdown output, single input):**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "[mismo instructions del prompt actual]" },
    { "role": "user", "content": "%%ijson%%" }
  ],
  "max_tokens": 8192,
  "temperature": 0.7,
  "thinking": { "type": "enabled" }
}
```

**Prompts 05-07 (Markdown output, multi input concatenado):**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "[mismo instructions del prompt actual]" },
    { "role": "user", "content": "Analiza la capa de decisión...\n\n%%ijson%%\n\n## Análisis físico\n\n%%analisis-fisico%%\n\n## Análisis estratégico\n\n%%analisis-estrategico%%\n\n## Análisis financiero\n\n%%analisis-financiero%%\n\n## Análisis regulatorio\n\n%%analisis-regulatorio%%" }
  ],
  "max_tokens": 8192,
  "temperature": 0.7,
  "thinking": { "type": "enabled" }
}
```

### Adaptación del provider Z.AI

```typescript
// zai-provider.ts
const ZAI_PREFIX = 'prompts-ia/zaiProvider/'

async function execute(env, promptName, inputJson, tracking) {
  const promptKey = `${ZAI_PREFIX}${promptName}`
  const promptObject = await env.r2_binding_01.get(promptKey)

  // Fallback: si no existe en zaiProvider/, usar prompt raíz + transformar
  if (!promptObject) {
    return executeWithFallback(env, promptName, inputJson, tracking)
  }

  // Leer prompt en formato Z.AI
  const promptTemplate = await promptObject.text()

  // Reemplazar placeholders
  const promptBody = reemplazarPlaceholders(promptTemplate, { ijson: inputJson })

  // Llamar a API
  return callZaiApi(env, JSON.parse(promptBody), tracking)
}
```

**Fallback integrado:** Si un prompt no existe en `zaiProvider/`, el provider usa la transformación automática desde el prompt raíz. Esto permite una migración gradual.

---

## 13. Acciones Requeridas

### Fase 1: Crear prompts Z.AI en R2
| # | Acción | Detalle |
|---|--------|---------|
| 1 | Crear carpeta `prompts-ia/zaiProvider/` en R2 | `wrangler r2 object put` para cada prompt |
| 2 | Generar 8 prompts en formato Chat Completions | Copiar `instructions` de prompts actuales + reestructurar |
| 3 | Prompt 00: añadir `response_format: json_object` | Crítico para generación de JSON |
| 4 | Prompts 01-07: añadir `thinking: { type: "enabled" }` | Para análisis más profundos |
| 5 | Prompts 05-07: concatenar content items en user message | Separar con `\n\n` |

### Fase 2: Implementar zai-provider
| # | Acción | Archivo | Tipo |
|---|--------|---------|------|
| 6 | Crear `lib/providers/zai-provider.ts` | Nuevo archivo | Crear |
| 7 | Leer de `prompts-ia/zaiProvider/{nombre}` | zai-provider.ts | Implementar |
| 8 | Fallback a prompt raíz + transformación | zai-provider.ts | Implementar |
| 9 | Parsear response: `choices[0].message.content` | zai-provider.ts | Implementar |
| 10 | Clasificar errores HTTP | zai-provider.ts | Implementar |

### Fase 3: Integrar con el sistema
| # | Acción | Archivo | Tipo |
|---|--------|---------|------|
| 11 | Registrar en registry de `ia-provider.ts` | `lib/ia-provider.ts` | Modificar |
| 12 | Normalizar `IA_PROVIDER` de `zaiProvider` a `zai` | Cloudflare KV | Modificar |
| 13 | Actualizar imports en servicios | `ia-creacion-proyectos.ts`, `ia-analisis-proyectos.ts` | Modificar |

---

*Documento generado: 2026-04-08*
*Basado en lectura directa de los 8 prompts reales desde R2 (`r2-cbconsulting/prompts-ia/`)*
*Documentación de referencia: docs.z.ai/api-reference/*

---

## Documento Relacionado

**Plan de Implementación:** [`plan/plan-multi-provider-prompts.md`](../plan/plan-multi-provider-prompts.md)

Este documento contiene el plan detallado para:
- Mover los prompts actuales de `prompts-ia/` a `prompts-ia/openaiProvider/` en R2
- Crear los 8 prompts Z.AI en `prompts-ia/zaiProvider/` en R2
- Modificar los archivos de código para buscar prompts en el directorio del proveedor activo
- Implementar `zai-provider.ts` e `ia-provider.ts` (registry)
- Verificación y despliegue
