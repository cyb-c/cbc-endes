# Plan de Implementación: Multi-Provider Prompts en R2

## Índice de Contenidos
1. [Objetivo](#1-objetivo)
2. [Contexto Actual](#2-contexto-actual)
   - 2.1 [Prompts en R2](#21-prompts-en-r2)
   - 2.2 [Prompts en Repo Local](#22-prompts-en-repo-local)
   - 2.3 [Servicios que Cargan Prompts](#23-servicios-que-cargan-prompts)
3. [Arquitectura Objetivo](#3-arquitectura-objetivo)
4. [Fase 1 — Mover Prompts OpenAI a Carpeta Dedicada](#4-fase-1--mover-prompts-openai-a-carpeta-dedicada)
   - 4.1 [Paso 1.1: Crear `prompts-ia/openaiProvider/` en R2](#41-paso-11-crear-prompts-iaopenaiprovider-en-r2)
   - 4.2 [Paso 1.2: Copiar prompts actuales a `openaiProvider/`](#42-paso-12-copiar-prompts-actuales-a-openaiprovider)
   - 4.3 [Paso 1.3: Copiar prompts locales a `openaiProvider/`](#43-paso-13-copiar-prompts-locales-a-openaiprovider)
5. [Fase 2 — Crear Prompts Z.AI](#5-fase-2--crear-prompts-zai)
   - 5.1 [Paso 2.1: Crear `prompts-ia/zaiProvider/` en R2](#51-paso-21-crear-prompts-iazaiProvider-en-r2)
   - 5.2 [Paso 2.2: Generar 8 Prompts en Formato Chat Completions](#52-paso-22-generar-8-prompts-en-formato-chat-completions)
6. [Fase 3 — Cambios en Código](#6-fase-3--cambios-en-código)
   - 6.1 [Paso 3.1: Modificar `openai-client.ts`](#61-paso-31-modificar-openai-clientts)
   - 6.2 [Paso 3.2: Crear `zai-provider.ts`](#62-paso-32-crear-zai-providerts)
   - 6.3 [Paso 3.3: Crear `ia-provider.ts` con Registry](#63-paso-33-crear-ia-providerts-con-registry)
   - 6.4 [Paso 3.4: Adaptar `ia-creacion-proyectos.ts`](#64-paso-34-adaptar-ia-creacion-proyectosts)
   - 6.5 [Paso 3.5: Adaptar `ia-analisis-proyectos.ts`](#65-paso-35-adaptar-ia-analisis-proyectosts)
7. [Fase 4 — Normalización y Configuración](#7-fase-4--normalización-y-configuración)
   - 7.1 [Paso 4.1: Normalizar `IA_PROVIDER` en KV](#71-paso-41-normalizar-ia_provider-en-kv)
   - 7.2 [Paso 4.2: Actualizar `.dev.vars.example`](#72-paso-42-actualizar-devvarsexample)
8. [Fase 5 — Verificación y Despliegue](#8-fase-5--verificación-y-despliegue)
   - 8.1 [Paso 5.1: Type Check](#81-paso-51-type-check)
   - 8.2 [Paso 5.2: Test Manual con OpenAI](#82-paso-52-test-manual-con-openai)
   - 8.3 [Paso 5.3: Test Manual con Z.AI](#83-paso-53-test-manual-con-zai)
   - 8.4 [Paso 5.4: Deploy Worker](#84-paso-54-deploy-worker)
9. [Rollback Plan](#9-rollback-plan)
10. [Referencia de Archivos](#10-referencia-de-archivos)

---

## 1. Objetivo

Reorganizar los prompts en R2 para que cada proveedor de IA tenga su carpeta dedicada con prompts en su formato nativo, y adaptar el código para buscar los prompts en el directorio correspondiente al proveedor seleccionado en `IA_PROVIDER`.

---

## 2. Contexto Actual

### 2.1 Prompts en R2

Los 8 prompts actuales están en la raíz de `prompts-ia/` en el bucket `r2-cbconsulting`:

| Prompt | Formato | Contenido |
|--------|---------|-----------|
| `prompts-ia/00_CrearProyecto.json` | OpenAI Responses API | Extracción JSON + resumen |
| `prompts-ia/01_ActivoFisico.json` | OpenAI Responses API | Análisis físico |
| `prompts-ia/02_ActivoEstrategico.json` | OpenAI Responses API | Análisis estratégico |
| `prompts-ia/03_ActivoFinanciero.json` | OpenAI Responses API | Análisis financiero |
| `prompts-ia/04_ActivoRegulado.json` | OpenAI Responses API | Análisis regulatorio |
| `prompts-ia/05_Inversor.json` | OpenAI Responses API | Lectura inversor (6 content items) |
| `prompts-ia/06_EmprendedorOperador.json` | OpenAI Responses API | Lectura operador (6 content items) |
| `prompts-ia/07_Propietario.json` | OpenAI Responses API | Lectura propietario (6 content items) |

### 2.2 Prompts en Repo Local

Solo 2 prompts existen localmente:

| Archivo | Ubicación |
|---------|-----------|
| `00_CrearProyecto.json` | `apps/worker/prompts-ia/` |
| `01_ActivoFisico.json` | `prompts-ia/` (raíz del repo) |

Los prompts 02-07 **solo existen en R2**, no en el repo.

### 2.3 Servicios que Cargan Prompts

| Servicio | Función | Path R2 |
|----------|---------|---------|
| `ia-creacion-proyectos.ts` | `executePrompt(env, '00_CrearProyecto.json', ijson, tracking)` | `prompts-ia/{promptName}` |
| `ia-analisis-proyectos.ts` | `r2Bucket.get('prompts-ia/{promptNombre}')` | `prompts-ia/{promptNombre}` |

Ambos hardcodean el prefijo `prompts-ia/`. Deberán usar un prefijo dinámico basado en el proveedor.

---

## 3. Arquitectura Objetivo

**Estructura en R2:**
```
r2-cbconsulting/prompts-ia/
├── openaiProvider/
│   ├── 00_CrearProyecto.json          ← Formato Responses API (actuales)
│   ├── 01_ActivoFisico.json
│   ├── 02_ActivoEstrategico.json
│   ├── 03_ActivoFinanciero.json
│   ├── 04_ActivoRegulado.json
│   ├── 05_Inversor.json
│   ├── 06_EmprendedorOperador.json
│   └── 07_Propietario.json
└── zaiProvider/
    ├── 00_CrearProyecto.json          ← Formato Chat Completions (nuevos)
    ├── 01_ActivoFisico.json
    ├── 02_ActivoEstrategico.json
    ├── 03_ActivoFinanciero.json
    ├── 04_ActivoRegulado.json
    ├── 05_Inversor.json
    ├── 06_EmprendedorOperador.json
    └── 07_Propietario.json
```

**Estructura local del repo (post-implementación):**
```
apps/worker/
├── prompts-ia/
│   ├── openaiProvider/
│   │   └── 00_CrearProyecto.json
│   └── zaiProvider/
│       ├── 00_CrearProyecto.json
│       ├── 01_ActivoFisico.json
│       └── ... (8 prompts)
└── src/
    ├── lib/
    │   ├── openai-client.ts           ← Modificado (lee de openaiProvider/)
    │   ├── zai-provider.ts            ← Nuevo
    │   └── ia-provider.ts             ← Nuevo (registry)
    └── services/
        ├── ia-creacion-proyectos.ts   ← Modificado (imports)
        └── ia-analisis-proyectos.ts   ← Modificado (imports + calls)

prompts-ia/
└── openaiProvider/
    └── 01_ActivoFisico.json           ← Movido desde raíz
```

---

## 4. Fase 1 — Mover Prompts OpenAI a Carpeta Dedicada

### 4.1 Paso 1.1: Crear `prompts-ia/openaiProvider/` en R2

**Comando:**
```bash
# La carpeta se crea implícitamente al subir el primer objeto
```

### 4.2 Paso 1.2: Copiar prompts actuales a `openaiProvider/`

Descargar los 8 prompts actuales de R2 y re-subirlos bajo la nueva carpeta:

```bash
# Descargar prompts actuales
for name in 00_CrearProyecto 01_ActivoFisico 02_ActivoEstrategico \
            03_ActivoFinanciero 04_ActivoRegulado 05_Inversor \
            06_EmprendedorOperador 07_Propietario; do
  npx wrangler r2 object get \
    r2-cbconsulting/prompts-ia/${name}.json \
    --remote --file /tmp/${name}.json
done

# Re-subir bajo openaiProvider/
for name in 00_CrearProyecto 01_ActivoFisico 02_ActivoEstrategico \
            03_ActivoFinanciero 04_ActivoRegulado 05_Inversor \
            06_EmprendedorOperador 07_Propietario; do
  npx wrangler r2 object put \
    r2-cbconsulting/prompts-ia/openaiProvider/${name}.json \
    --file /tmp/${name}.json
done
```

**Verificación:**
```bash
for name in 00_CrearProyecto 01_ActivoFisico 02_ActivoEstrategico \
            03_ActivoFinanciero 04_ActivoRegulado 05_Inversor \
            06_EmprendedorOperador 07_Propietario; do
  npx wrangler r2 object get \
    r2-cbconsulting/prompts-ia/openaiProvider/${name}.json \
    --remote --file /dev/null 2>&1 | grep -q "Download complete" \
    && echo "✅ ${name}" || echo "❌ ${name}"
done
```

### 4.3 Paso 1.3: Copiar prompts locales a `openaiProvider/`

**Archivos a mover:**
| Origen | Destino |
|--------|---------|
| `prompts-ia/01_ActivoFisico.json` | `prompts-ia/openaiProvider/01_ActivoFisico.json` |
| `apps/worker/prompts-ia/00_CrearProyecto.json` | `apps/worker/prompts-ia/openaiProvider/00_CrearProyecto.json` |

**Acciones adicionales:**
- Crear directorios `prompts-ia/openaiProvider/` y `apps/worker/prompts-ia/openaiProvider/`
- Eliminar archivos originales tras la copia

---

## 5. Fase 2 — Crear Prompts Z.AI

### 5.1 Paso 2.1: Crear `prompts-ia/zaiProvider/` en R2

La carpeta se crea implícitamente al subir el primer objeto.

### 5.2 Paso 2.2: Generar 8 Prompts en Formato Chat Completions

Cada prompt se genera transformando el equivalente de `openaiProvider/`:

#### Grupo 1: Prompts 00-04 (single input)

**Prompt 00 — `00_CrearProyecto.json`:**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "Eres un extractor y redactor especializado en fichas inmobiliarias...\n\n[instructions exactas del prompt actual]" },
    { "role": "user", "content": "%%ijson%%" }
  ],
  "max_tokens": 4096,
  "temperature": 0.3,
  "response_format": { "type": "json_object" }
}
```

**Prompts 01-04 — `0X_Nombre.json`:**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "[instructions exactas del prompt actual]" },
    { "role": "user", "content": "%%ijson%%" }
  ],
  "max_tokens": 8192,
  "temperature": 0.7,
  "thinking": { "type": "enabled" }
}
```

#### Grupo 2: Prompts 05-07 (multi input concatenado)

**Prompt 05 — `05_Inversor.json`:**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "[instructions exactas del prompt actual]" },
    { "role": "user", "content": "Analiza la capa de decisión inversora usando exclusivamente el JSON base y los cuatro análisis adjuntos. Devuelve únicamente Markdown en español de España.\n\n%%ijson%%\n\n## Análisis físico\n\n%%analisis-fisico%%\n\n## Análisis estratégico\n\n%%analisis-estrategico%%\n\n## Análisis financiero\n\n%%analisis-financiero%%\n\n## Análisis regulatorio\n\n%%analisis-regulatorio%%" }
  ],
  "max_tokens": 8192,
  "temperature": 0.7,
  "thinking": { "type": "enabled" }
}
```

**Prompts 06-07:** Mismo patrón, ajustando la instrucción inicial y las instructions del system.

**Nota sobre placeholders:** Los placeholders `%%ijson%%`, `%%analisis-fisico%%`, etc. se mantienen tal cual. El servicio `ia-analisis-proyectos.ts` ya tiene la función `reemplazarPlaceholders()` que los sustituye antes de enviar al provider.

**Script de generación (manual o automatizado):**
```bash
# Para cada prompt, descargar de openaiProvider/, transformar, subir a zaiProvider/
for name in 00_CrearProyecto 01_ActivoFisico 02_ActivoEstrategico \
            03_ActivoFinanciero 04_ActivoRegulado 05_Inversor \
            06_EmprendedorOperador 07_Propietario; do
  # 1. Descargar
  npx wrangler r2 object get \
    r2-cbconsulting/prompts-ia/openaiProvider/${name}.json \
    --remote --file /tmp/${name}_openai.json

  # 2. Transformar (script Node.js o manual)
  node transform-prompt.js /tmp/${name}_openai.json /tmp/${name}_zai.json

  # 3. Subir
  npx wrangler r2 object put \
    r2-cbconsulting/prompts-ia/zaiProvider/${name}.json \
    --file /tmp/${name}_zai.json
done
```

**Verificación:**
```bash
# Verificar que los 8 prompts existen en zaiProvider/
for name in 00_CrearProyecto 01_ActivoFisico 02_ActivoEstrategico \
            03_ActivoFinanciero 04_ActivoRegulado 05_Inversor \
            06_EmprendedorOperador 07_Propietario; do
  npx wrangler r2 object get \
    r2-cbconsulting/prompts-ia/zaiProvider/${name}.json \
    --remote --file /tmp/${name}_verify.json 2>&1 | grep -q "Download complete" \
    && echo "✅ ${name}" || echo "❌ ${name}"
done

# Validar que el JSON es válido y tiene la estructura correcta
for name in 00_CrearProyecto 01_ActivoFisico 02_ActivoEstrategico \
            03_ActivoFinanciero 04_ActivoRegulado 05_Inversor \
            06_EmprendedorOperador 07_Propietario; do
  node -e "
    const p = JSON.parse(require('fs').readFileSync('/tmp/${name}_verify.json','utf8'));
    console.assert(p.messages, 'missing messages');
    console.assert(p.messages.length >= 2, 'need system+user messages');
    console.assert(p.messages[0].role === 'system', 'first must be system');
    console.assert(p.messages[1].role === 'user', 'second must be user');
    console.log('✅ ${name}: estructura válida');
  " 2>&1
done
```

---

## 6. Fase 3 — Cambios en Código

### 6.1 Paso 3.1: Modificar `openai-client.ts`

**Archivo:** `apps/worker/src/lib/openai-client.ts`

**Cambios:**
1. Añadir constante de prefijo: `const PROMPT_PREFIX = 'prompts-ia/openaiProvider/'`
2. Cambiar `loadPromptFromR2` para usar el prefijo:

```typescript
// ANTES (línea ~158):
const key = `prompts-ia/${promptName}`

// DESPUÉS:
const key = `prompts-ia/openaiProvider/${promptName}`
```

**Solo 1 línea de cambio.** El resto del archivo queda intacto.

### 6.2 Paso 3.2: Crear `zai-provider.ts`

**Archivo:** `apps/worker/src/lib/zai-provider.ts` (nuevo)

**Contenido:**
```typescript
/**
 * Z.AI (GLM) Provider — Chat Completions API
 *
 * Lee prompts desde prompts-ia/zaiProvider/ en formato Chat Completions
 * y los ejecuta contra la API de Z.AI.
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'
import { registrarEvento, registrarError } from './tracking'

const PROMPT_PREFIX = 'prompts-ia/zaiProvider/'
const ZAI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions'

export interface ZAIResult {
  text: string
  raw: unknown
  usage?: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
  }
}

/**
 * Reemplaza placeholders en el prompt con los valores de inputs.
 * Compatible con %%ijson%% y %%analisis-xxx%%.
 */
function reemplazarPlaceholders(
  promptRaw: string,
  inputs: Record<string, string>,
): string {
  let text = promptRaw
  for (const [key, value] of Object.entries(inputs)) {
    text = text.replace(new RegExp(`%%${key}%%`, 'g'), value)
  }
  return text
}

/**
 * Ejecuta un prompt contra Z.AI API.
 *
 * @param env - Environment bindings
 * @param promptName - Nombre del prompt (ej. '00_CrearProyecto.json')
 * @param inputs - Inputs para reemplazar placeholders
 * @param tracking - Contexto de tracking opcional
 */
export async function executeZAIPrompt(
  env: Env,
  promptName: string,
  inputs: Record<string, string>,
  tracking?: TrackingContext,
): Promise<ZAIResult> {
  const r2Bucket = env.r2_binding_01
  const secretsKv = env.secrets_kv

  if (tracking) {
    registrarEvento(tracking, 'zai-inicio', 'INFO', 'Iniciando llamada a Z.AI', {
      prompt: promptName,
    })
  }

  // 1. Obtener API key desde KV
  if (tracking) registrarEvento(tracking, 'zai-obtener-api-key', 'INFO', 'Obteniendo API key')
  const apiKey = await secretsKv.get('ZAI_API_KEY')
  if (!apiKey) {
    const err = new Error('ZAI_API_KEY no encontrada en KV')
    if (tracking) registrarError(tracking, 'zai-api-key-missing', err)
    throw err
  }

  // 2. Cargar prompt desde R2
  if (tracking) registrarEvento(tracking, 'zai-cargar-prompt', 'INFO', 'Cargando prompt', {
    key: `${PROMPT_PREFIX}${promptName}`,
  })
  const promptObject = await r2Bucket.get(`${PROMPT_PREFIX}${promptName}`)
  if (!promptObject) {
    const err = new Error(`Prompt no encontrado: ${PROMPT_PREFIX}${promptName}`)
    if (tracking) registrarError(tracking, 'zai-prompt-not-found', err)
    throw err
  }
  const promptTemplate = await promptObject.text()

  // 3. Reemplazar placeholders
  if (tracking) registrarEvento(tracking, 'zai-preparar-request', 'INFO', 'Reemplazando placeholders')
  const promptBody = reemplazarPlaceholders(promptTemplate, inputs)

  // Parsear para obtener estructura y extraer model
  const parsed = JSON.parse(promptBody) as {
    model: string
    messages: Array<{ role: string; content: string }>
    max_tokens?: number
    temperature?: number
    thinking?: Record<string, string>
    response_format?: Record<string, string>
  }

  // 4. Llamar a API
  if (tracking) {
    registrarEvento(tracking, 'zai-llamar-api', 'INFO', 'Llamando a Z.AI API', {
      model: parsed.model,
    })
  }

  const requestBody = JSON.stringify(parsed)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180000)

  const response = await fetch(ZAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: requestBody,
    signal: controller.signal,
  })

  clearTimeout(timeoutId)

  if (tracking) {
    registrarEvento(tracking, 'zai-http-response', 'INFO', 'Respuesta HTTP', {
      status: response.status,
    })
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    const err = new Error(`Z.AI API error ${response.status}: ${errorBody}`)
    if (tracking) registrarError(tracking, 'zai-http-error', err, {
      status: response.status,
    })
    throw err
  }

  const data = await response.json() as Record<string, unknown>

  // 5. Extraer texto de la respuesta
  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined
  const text = choices?.[0]?.message?.content || ''

  if (tracking) {
    registrarEvento(tracking, 'zai-completado', 'INFO', 'Llamada completada', {
      response_length: text.length,
      finish_reason: choices?.[0]?.finish_reason,
    })
  }

  if (!text) {
    const err = new Error('Z.AI no generó contenido')
    if (tracking) registrarError(tracking, 'zai-empty-response', err)
    throw err
  }

  // 6. Normalizar resultado
  const usage = data.usage as Record<string, number> | undefined

  return {
    text,
    raw: data,
    usage: usage ? {
      input_tokens: usage.prompt_tokens || 0,
      output_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
    } : undefined,
  }
}

/**
 * Formatear error de Z.AI para logging
 */
export function formatZAIError(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}
```

### 6.3 Paso 3.3: Crear `ia-provider.ts` con Registry

**Archivo:** `apps/worker/src/lib/ia-provider.ts` (nuevo)

**Contenido:**
```typescript
/**
 * IA Provider Registry — Router de proveedores de IA
 *
 * Selecciona el proveedor basado en la variable IA_PROVIDER en KV.
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'
import { executeZAIPrompt, formatZAIError } from './zai-provider'

// Re-export del OpenAI client existente
export { executePrompt as executeOpenAIPrompt, formatOpenAIError } from './openai-client'

/**
 * Resultado genérico de IA
 */
export interface IAResult {
  text: string
  raw: unknown
  usage?: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
  }
}

/**
 * Ejecuta un prompt contra el proveedor activo.
 *
 * @param env - Environment bindings
 * @param promptName - Nombre del prompt
 * @param inputJson - Input como string JSON (para single-input prompts)
 * @param tracking - Contexto de tracking
 */
export async function executePrompt(
  env: Env,
  promptName: string,
  inputJson: string,
  tracking?: TrackingContext,
): Promise<IAResult> {
  const providerName = (await env.secrets_kv.get('IA_PROVIDER')) || 'openai'

  switch (providerName) {
    case 'openai':
    case 'openaiProvider':
      return executeOpenAIPrompt(env, promptName, inputJson, tracking)

    case 'zai':
    case 'zaiProvider':
      return executeZAIPrompt(env, promptName, { ijson: inputJson }, tracking)

    default:
      const err = new Error(`Proveedor IA no soportado: ${providerName}`)
      if (tracking) {
        const { registrarError } = await import('./tracking')
        registrarError(tracking, 'unsupported-provider', err, { provider: providerName })
      }
      throw err
  }
}

/**
 * Formatear error genérico de IA
 */
export function formatIAError(error: unknown): string {
  return formatOpenAIError(error) // Por ahora delega en OpenAI
}
```

**Nota:** Esta es la versión inicial del registry. Se extenderá con `anthropicProvider`, `geminiProvider`, etc. en fases posteriores.

### 6.4 Paso 3.4: Adaptar `ia-creacion-proyectos.ts`

**Archivo:** `apps/worker/src/services/ia-creacion-proyectos.ts`

**Cambios:**
```typescript
// ANTES (línea 12):
import { executePrompt, formatOpenAIError } from '../lib/openai-client'

// DESPUÉS:
import { executePrompt, formatIAError } from '../lib/ia-provider'
```

**En el catch (línea ~118):**
```typescript
// ANTES:
const errorMessage = formatOpenAIError(error)

// DESPUÉS:
const errorMessage = formatIAError(error)
```

**La llamada `executePrompt(env, '00_CrearProyecto.json', ijson, tracking)` se mantiene idéntica.**

### 6.5 Paso 3.5: Adaptar `ia-analisis-proyectos.ts`

**Archivo:** `apps/worker/src/services/ia-analisis-proyectos.ts`

**Cambios:**

1. **Imports (línea ~15):**
```typescript
// ANTES:
import { callOpenAIResponses, formatOpenAIError } from '../lib/openai-client'
// y posiblemente: import { getOpenAIKey } from '../lib/openai-client'

// DESPUÉS:
import { executePrompt, formatIAError } from '../lib/ia-provider'
```

2. **Función `ejecutarPasoConIA` (línea ~100+):**

La función actual:
- Carga prompt desde R2
- Reemplaza placeholders con `reemplazarPlaceholders()`
- Obtiene API key de OpenAI
- Llama `callOpenAIResponses(apiKey, JSON.parse(promptBody), tracking)`

**Nueva versión simplificada:**
```typescript
export async function ejecutarPasoConIA(
  env: Env,
  promptNombre: string,
  inputs: InputsParaPaso,
  tracking: TrackingContext
): Promise<EjecutarPasoConIAResult> {
  try {
    // Reemplazar placeholders
    const promptKey = `prompts-ia/${getProviderFolder()}/${promptNombre}`
    const promptObject = await env.r2_binding_01.get(promptKey)

    if (!promptObject) {
      return {
        exito: false,
        error_codigo: ERROR_CODES.PROMPT_NOT_FOUND,
        error_mensaje: `Prompt no encontrado: ${promptNombre}`,
      }
    }

    const promptTemplate = await promptObject.text()
    const promptBody = reemplazarPlaceholders(promptTemplate, inputs)

    // Ejecutar via provider
    const result = await executePrompt(
      env,
      promptNombre,
      inputs.ijson || '',
      tracking
    )

    const contenido = result.text.trim()

    if (!contenido) {
      return {
        exito: false,
        error_codigo: ERROR_CODES.EMPTY_RESPONSE,
        error_mensaje: 'La IA no generó contenido',
      }
    }

    return { exito: true, contenido }
  } catch (error) {
    return {
      exito: false,
      error_codigo: ERROR_CODES.OPENAI_ERROR,
      error_mensaje: formatIAError(error),
    }
  }
}
```

**⚠️ IMPORTANTE:** Para prompts 05-07 (multi-input), el provider Z.AI necesita recibir TODOS los inputs, no solo `ijson`. La firma de `executePrompt` debe ampliarse:

```typescript
// Firma ampliada en ia-provider.ts:
export async function executePrompt(
  env: Env,
  promptName: string,
  inputs: Record<string, string>,  // En lugar de inputJson: string
  tracking?: TrackingContext,
): Promise<IAResult>
```

Y el servicio pasaría `inputs` directamente:
```typescript
const result = await executePrompt(env, promptNombre, inputs, tracking)
```

Cada provider internamente usaría lo que necesita:
- **OpenAI**: Lee prompt de `openaiProvider/`, reemplaza placeholders, llama Responses API
- **Z.AI**: Lee prompt de `zaiProvider/`, reemplaza placeholders, llama Chat Completions API

---

## 7. Fase 4 — Normalización y Configuración

### 7.1 Paso 4.1: Normalizar `IA_PROVIDER` en KV

**Acción:**
```bash
# Verificar valor actual
npx wrangler secret list --env dev 2>&1 | grep IA_PROVIDER

# Si el valor es "zaiProvider", dejarlo así (funciona con el switch case)
# O normalizar a "zai" (más limpio):
npx wrangler secret put IA_PROVIDER --env dev
# → Introducir: zai
```

**Valores válidos del switch:**
| Valor en KV | Proveedor |
|-------------|-----------|
| `openai` | OpenAI Responses API |
| `openaiProvider` | OpenAI Responses API (alias) |
| `zai` | Z.AI Chat Completions |
| `zaiProvider` | Z.AI Chat Completions (alias) |

Los alias permiten transición suave sin cambiar el valor de KV.

### 7.2 Paso 4.2: Actualizar `.dev.vars.example`

**Archivo:** `apps/worker/.dev.vars.example`

Añadir:
```
IA_PROVIDER=openai
ZAI_API_KEY=tu-api-key-de-zai
```

---

## 8. Fase 5 — Verificación y Despliegue

### 8.1 Paso 5.1: Type Check

```bash
cd apps/worker && npx tsc --noEmit 2>&1
```

Resolver cualquier error. El error preexistente en `pai-notas.ts:303` no bloquea.

### 8.2 Paso 5.2: Test Manual con OpenAI

```bash
# Asegurar IA_PROVIDER=openai
cd apps/worker && npm run dev
# Probar endpoint /api/health
curl http://localhost:8787/api/health
```

### 8.3 Paso 5.3: Test Manual con Z.AI

```bash
# Cambiar IA_PROVIDER=zai (o zaiProvider)
cd apps/worker && npm run dev
# Probar endpoint /api/health
curl http://localhost:8787/api/health
# Probar creación de proyecto o análisis
```

### 8.4 Paso 5.4: Deploy Worker

```bash
cd apps/worker && npm run deploy
```

---

## 9. Rollback Plan

Si algo falla tras el deploy:

1. **Revertir `IA_PROVIDER` a `openai`:**
   ```bash
   npx wrangler secret put IA_PROVIDER --env dev
   # → Introducir: openai
   ```

2. **Los prompts originales en `prompts-ia/` raíz de R2 se mantienen** hasta verificación exitosa. Solo se eliminan tras confirmar que todo funciona.

3. **Revertir código:** `git revert HEAD` en el commit del despliegue.

---

## 10. Referencia de Archivos

### Archivos a Crear
| Archivo | Propósito |
|---------|-----------|
| `apps/worker/src/lib/zai-provider.ts` | Provider Z.AI (Chat Completions API) |
| `apps/worker/src/lib/ia-provider.ts` | Registry + router de proveedores |
| `apps/worker/prompts-ia/openaiProvider/00_CrearProyecto.json` | Prompt 00 para OpenAI |
| `apps/worker/prompts-ia/zaiProvider/*.json` (8 archivos) | Prompts 00-07 para Z.AI |
| `prompts-ia/openaiProvider/01_ActivoFisico.json` | Prompt 01 para OpenAI |

### Archivos a Modificar
| Archivo | Cambio |
|---------|--------|
| `apps/worker/src/lib/openai-client.ts` | Cambiar prefijo R2 a `prompts-ia/openaiProvider/` |
| `apps/worker/src/services/ia-creacion-proyectos.ts` | Cambiar imports a `ia-provider` |
| `apps/worker/src/services/ia-analisis-proyectos.ts` | Cambiar imports + adaptar llamada |
| `apps/worker/.dev.vars.example` | Añadir `IA_PROVIDER` y `ZAI_API_KEY` |

### Archivos a Mover (en R2 y repo local)
| Origen | Destino |
|--------|---------|
| `r2: prompts-ia/00_CrearProyecto.json` | `r2: prompts-ia/openaiProvider/00_CrearProyecto.json` |
| `r2: prompts-ia/01_ActivoFisico.json` | `r2: prompts-ia/openaiProvider/01_ActivoFisico.json` |
| `r2: prompts-ia/02_ActivoEstrategico.json` | `r2: prompts-ia/openaiProvider/02_ActivoEstrategico.json` |
| `r2: prompts-ia/03_ActivoFinanciero.json` | `r2: prompts-ia/openaiProvider/03_ActivoFinanciero.json` |
| `r2: prompts-ia/04_ActivoRegulado.json` | `r2: prompts-ia/openaiProvider/04_ActivoRegulado.json` |
| `r2: prompts-ia/05_Inversor.json` | `r2: prompts-ia/openaiProvider/05_Inversor.json` |
| `r2: prompts-ia/06_EmprendedorOperador.json` | `r2: prompts-ia/openaiProvider/06_EmprendedorOperador.json` |
| `r2: prompts-ia/07_Propietario.json` | `r2: prompts-ia/openaiProvider/07_Propietario.json` |
| `prompts-ia/01_ActivoFisico.json` (repo) | `prompts-ia/openaiProvider/01_ActivoFisico.json` (repo) |
| `apps/worker/prompts-ia/00_CrearProyecto.json` (repo) | `apps/worker/prompts-ia/openaiProvider/00_CrearProyecto.json` (repo) |

---

*Documento generado: 2026-04-08*
