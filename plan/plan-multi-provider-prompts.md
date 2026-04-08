# Plan de Implementación: Multi-Provider IA (6 Proveedores)

## Índice de Contenidos
1. [Objetivo](#1-objetivo)
2. [Contexto Actual](#2-contexto-actual)
   - 2.1 [Prompts en R2](#21-prompts-en-r2)
   - 2.2 [Prompts en Repo Local](#22-prompts-en-repo-local)
   - 2.3 [Servicios que Cargan Prompts](#23-servicios-que-cargan-prompts)
   - 2.4 [Secrets en Cloudflare](#24-secrets-en-cloudflare)
3. [Tabla de Proveedores](#3-tabla-de-proveedores)
   - 3.1 [Matriz de Proveedores](#31-matriz-de-proveedores)
   - 3.2 [Formatos de Prompt por Proveedor](#32-formatos-de-prompt-por-proveedor)
4. [Arquitectura Objetivo](#4-arquitectura-objetivo)
   - 4.1 [Estructura en R2](#41-estructura-en-r2)
   - 4.2 [Estructura Local del Repo](#42-estructura-local-del-repo)
   - 4.3 [Arquitectura de Código](#43-arquitectura-de-código)
5. [Fase 1 — Reorganizar Prompts OpenAI en R2 y Repo](#5-fase-1--reorganizar-prompts-openai-en-r2-y-repo)
   - 5.1 [Paso 1.1: Copiar prompts de R2 a `openaiProvider/`](#51-paso-11-copiar-prompts-de-r2-a-openaiprovider)
   - 5.2 [Paso 1.2: Mover prompts locales a `openaiProvider/`](#52-paso-12-mover-prompts-locales-a-openaiprovider)
6. [Fase 2 — Crear Carpetas y Prompts por Proveedor en R2](#6-fase-2--crear-carpetas-y-prompts-por-proveedor-en-r2)
   - 6.1 [Grupo Chat Completions: Z.AI, Qwen, DeepSeek](#61-grupo-chat-completions-zai-qwen-deepseek)
   - 6.2 [Grupo Gemini: Google AI Studio](#62-grupo-gemini-google-ai-studio)
   - 6.3 [Grupo Anthropic: Messages API](#63-grupo-anthropic-messages-api)
   - 6.4 [Script de Generación Automatizada](#64-script-de-generación-automatizada)
7. [Fase 3 — Implementar Providers en Código](#7-fase-3--implementar-providers-en-código)
   - 7.1 [Paso 3.1: Modificar `openai-client.ts`](#71-paso-31-modificar-openai-clientts)
   - 7.2 [Paso 3.2: Crear `zai-provider.ts`](#72-paso-32-crear-zai-providerts)
   - 7.3 [Paso 3.3: Crear `qwen-provider.ts`](#73-paso-33-crear-qwen-providerts)
   - 7.4 [Paso 3.4: Crear `deepseek-provider.ts`](#74-paso-34-crear-deepseek-providerts)
   - 7.5 [Paso 3.5: Crear `gemini-provider.ts`](#75-paso-35-crear-gemini-providerts)
   - 7.6 [Paso 3.6: Crear `anthropic-provider.ts`](#76-paso-36-crear-anthropic-providerts)
   - 7.7 [Paso 3.7: Crear `ia-provider.ts` con Registry](#77-paso-37-crear-ia-providerts-con-registry)
   - 7.8 [Paso 3.8: Crear `provider-types.ts`](#78-paso-38-crear-provider-typests)
8. [Fase 4 — Adaptar Servicios Existentes](#8-fase-4--adaptar-servicios-existentes)
   - 8.1 [Paso 4.1: Adaptar `ia-creacion-proyectos.ts`](#81-paso-41-adaptar-ia-creacion-proyectosts)
   - 8.2 [Paso 4.2: Adaptar `ia-analisis-proyectos.ts`](#82-paso-42-adaptar-ia-analisis-proyectosts)
9. [Fase 5 — Configuración](#9-fase-5--configuración)
   - 9.1 [Paso 5.1: Verificar Secrets en Cloudflare](#91-paso-51-verificar-secrets-en-cloudflare)
   - 9.2 [Paso 5.2: Actualizar `.dev.vars.example`](#92-paso-52-actualizar-devvarsexample)
10. [Fase 6 — Verificación y Despliegue](#10-fase-6--verificación-y-despliegue)
    - 10.1 [Paso 6.1: Type Check](#101-paso-61-type-check)
    - 10.2 [Paso 6.2: Test por Proveedor](#102-paso-62-test-por-proveedor)
    - 10.3 [Paso 6.3: Deploy Worker](#103-paso-63-deploy-worker)
11. [Rollback Plan](#11-rollback-plan)
12. [Referencia Completa de Archivos](#12-referencia-completa-de-archivos)
    - 12.1 [Archivos a Crear](#121-archivos-a-crear)
    - 12.2 [Archivos a Modificar](#122-archivos-a-modificar)
    - 12.3 [Archivos a Mover](#123-archivos-a-mover)
13. [Hoja de Ruta Futura](#13-hoja-de-ruta-futura)

---

## 1. Objetivo

Reorganizar los prompts en R2 para que **cada uno de los 6 proveedores de IA** tenga su carpeta dedicada con prompts en su formato nativo, e implementar la arquitectura de código que permita seleccionar el proveedor activo mediante la variable `IA_PROVIDER` en KV, con capacidad de extender a futuros proveedores sin refactorización.

**Proveedores:**
| Registry Key | Proveedor | API Key Secret |
|-------------|-----------|----------------|
| `openaiProvider` | OpenAI Responses API | `OPENAI_API_KEY` |
| `zaiProvider` | Z.AI (GLM) Chat Completions | `ZAI_API_KEY` |
| `qwenProvider` | Qwen (Alibaba DashScope) | `QWEN_API_KEY` |
| `deepseekProvider` | DeepSeek Chat Completions | `DEEPSEEK_API_KEY` |
| `geminiProvider` | Gemini (Google AI Studio) | `GEMINI_API_KEY` |
| `anthropicProvider` | Anthropic (Claude Messages) | `ANTHROPIC_API_KEY` |

**Valor actual de `IA_PROVIDER` en KV:** `zaiProvider`

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

| Servicio | Función | Path R2 Actual |
|----------|---------|----------------|
| `ia-creacion-proyectos.ts` | `executePrompt(env, '00_CrearProyecto.json', ijson)` | `prompts-ia/{promptName}` |
| `ia-analisis-proyectos.ts` | `r2Bucket.get('prompts-ia/{promptNombre}')` | `prompts-ia/{promptNombre}` |

Ambos hardcodean el prefijo `prompts-ia/`. Deberán usar un prefijo dinámico basado en el proveedor.

### 2.4 Secrets en Cloudflare

Todos los API keys están creados en KV `secretos-cbconsulting`:

| Secret | Estado | Valor Actual |
|--------|--------|-------------|
| `OPENAI_API_KEY` | ✅ | Configurado |
| `ZAI_API_KEY` | ✅ | Configurado |
| `QWEN_API_KEY` | ✅ | Creado |
| `DEEPSEEK_API_KEY` | ✅ | Creado |
| `GEMINI_API_KEY` | ✅ | Configurado |
| `ANTHROPIC_API_KEY` | ✅ | Configurado |
| `IA_PROVIDER` | ✅ | `zaiProvider` |

---

## 3. Tabla de Proveedores

### 3.1 Matriz de Proveedores

| Característica | OpenAI | Z.AI | Qwen | DeepSeek | Gemini | Anthropic |
|---------------|--------|------|------|----------|--------|-----------|
| **Registry Key** | `openaiProvider` | `zaiProvider` | `qwenProvider` | `deepseekProvider` | `geminiProvider` | `anthropicProvider` |
| **API Key KV** | `OPENAI_API_KEY` | `ZAI_API_KEY` | `QWEN_API_KEY` | `DEEPSEEK_API_KEY` | `GEMINI_API_KEY` | `ANTHROPIC_API_KEY` |
| **Endpoint** | `/v1/responses` | `/api/paas/v4/chat/completions` | `/compatible-mode/v1/chat/completions` | `/chat/completions` | `/v1beta/models/{m}:generateContent` | `/v1/messages` |
| **Formato Request** | Responses API | Chat Completions | Chat Completions | Chat Completions | Gemini native | Messages API |
| **Modelo recomendado** | `gpt-5` | `glm-5.1` | `qwen3.5-plus` | `deepseek-chat` | `gemini-2.5-flash` | `claude-sonnet-4-20250514` |
| **Contexto** | ~128K | 200K | 131K-256K | 128K | **1M** | **1M** |
| **JSON mode** | ✅ Nativo | ✅ `response_format` | ✅ `response_format` | ✅ `response_format` | ✅ `responseMimeType` | ✅ `response_format` |
| **Thinking** | ✅ Nativo | ✅ `thinking` | ✅ `thinking` | ✅ `thinking` | ✅ thinking | ✅ Extended Thinking |
| **Autenticación** | `Bearer` header | `Bearer` header | `Bearer` header | `Bearer` header | `key` param o header | `x-api-key` header |
| **Grupo de transformación** | Nativo | Chat Completions | Chat Completions | Chat Completions | Gemini nativo | Messages nativo |

### 3.2 Formatos de Prompt por Proveedor

**Grupo Responses API (OpenAI — nativo):**
```json
{
  "model": "gpt-5",
  "instructions": "...",
  "input": [{ "role": "user", "content": [{ "type": "input_text", "text": "%%ijson%%" }] }]
}
```

**Grupo Chat Completions (Z.AI, Qwen, DeepSeek — transformación ligera):**
```json
{
  "model": "glm-5.1",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "%%ijson%%" }
  ],
  "max_tokens": 4096,
  "temperature": 0.3,
  "response_format": { "type": "json_object" }
}
```

**Grupo Gemini (Google AI Studio — transformación dedicada):**
```json
{
  "model": "gemini-2.5-flash",
  "systemInstruction": { "parts": [{ "text": "..." }] },
  "contents": [{ "role": "user", "parts": [{ "text": "%%ijson%%" }] }],
  "generationConfig": { "maxOutputTokens": 4096, "temperature": 0.3 }
}
```

**Grupo Anthropic (Messages API — transformación dedicada):**
```json
{
  "model": "claude-sonnet-4-20250514",
  "system": "...",
  "max_tokens": 4096,
  "messages": [{ "role": "user", "content": "%%ijson%%" }],
  "temperature": 0.3
}
```

---

## 4. Arquitectura Objetivo

### 4.1 Estructura en R2

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
├── zaiProvider/
│   ├── 00_CrearProyecto.json          ← Formato Chat Completions (nuevos)
│   ├── 01_ActivoFisico.json
│   ├── 02_ActivoEstrategico.json
│   ├── 03_ActivoFinanciero.json
│   ├── 04_ActivoRegulado.json
│   ├── 05_Inversor.json
│   ├── 06_EmprendedorOperador.json
│   └── 07_Propietario.json
├── qwenProvider/
│   └── ... (8 prompts)                ← Formato Chat Completions
├── deepseekProvider/
│   └── ... (8 prompts)                ← Formato Chat Completions
├── geminiProvider/
│   └── ... (8 prompts)                ← Formato generateContent
└── anthropicProvider/
    └── ... (8 prompts)                ← Formato Messages API
```

**Total:** 6 carpetas × 8 prompts = **48 archivos JSON en R2**

### 4.2 Estructura Local del Repo

```
apps/worker/
├── prompts-ia/
│   ├── openaiProvider/
│   │   └── 00_CrearProyecto.json
│   ├── zaiProvider/
│   │   └── ... (8 prompts)
│   ├── qwenProvider/
│   │   └── ... (8 prompts)
│   ├── deepseekProvider/
│   │   └── ... (8 prompts)
│   ├── geminiProvider/
│   │   └── ... (8 prompts)
│   └── anthropicProvider/
│       └── ... (8 prompts)
└── src/
    ├── lib/
    │   ├── openai-client.ts           ← Modificado (prefijo openaiProvider/)
    │   ├── zai-provider.ts            ← Nuevo
    │   ├── qwen-provider.ts           ← Nuevo
    │   ├── deepseek-provider.ts       ← Nuevo
    │   ├── gemini-provider.ts         ← Nuevo
    │   ├── anthropic-provider.ts      ← Nuevo
    │   ├── ia-provider.ts             ← Nuevo (registry + router)
    │   └── provider-types.ts          ← Nuevo (tipos compartidos)
    └── services/
        ├── ia-creacion-proyectos.ts   ← Modificado (imports)
        └── ia-analisis-proyectos.ts   ← Modificado (imports + llamadas)

prompts-ia/
└── openaiProvider/
    └── 01_ActivoFisico.json           ← Movido desde raíz
```

### 4.3 Arquitectura de Código

```
┌───────────────────────────────────────────────────┐
│                Servicios de IA                    │
│  ia-creacion-proyectos.ts                         │
│  ia-analisis-proyectos.ts                         │
│                                                     │
│  importan: executePrompt(), formatIAError()       │
│  (cero conocimiento del proveedor)                 │
└───────────────────┬───────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────┐
│               ia-provider.ts                      │
│                                                     │
│  export async function executePrompt(...) {        │
│    const providerName = await env.secrets_kv       │
│      .get('IA_PROVIDER') || 'openaiProvider'      │
│    const provider = getProvider(providerName)      │
│    return provider.execute(env, promptName, ...)   │
│  }                                                 │
│                                                      │
│  const REGISTRY: Record<string, IAProvider> = {     │
│    'openaiProvider': openaiProvider,               │
│    'zaiProvider': zaiProvider,                     │
│    'qwenProvider': qwenProvider,                   │
│    'deepseekProvider': deepseekProvider,           │
│    'geminiProvider': geminiProvider,               │
│    'anthropicProvider': anthropicProvider,         │
│  }                                                 │
└──┬───┬───┬───┬───┬───┬───────────────────────────┘
   │   │   │   │   │   │
   ▼   ▼   ▼   ▼   ▼   ▼
  OA  ZAI Qwn  DS  Gem  Ant
```

---

## 5. Fase 1 — Reorganizar Prompts OpenAI en R2 y Repo

### 5.1 Paso 1.1: Copiar prompts de R2 a `openaiProvider/`

```bash
# Descargar los 8 prompts actuales
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

**⚠️ No eliminar los prompts originales** de la raíz hasta que todo esté verificado (rollback safety).

### 5.2 Paso 1.2: Mover prompts locales a `openaiProvider/`

```bash
# Crear directorio
mkdir -p prompts-ia/openaiProvider
mkdir -p apps/worker/prompts-ia/openaiProvider

# Mover archivos
mv prompts-ia/01_ActivoFisico.json prompts-ia/openaiProvider/
mv apps/worker/prompts-ia/00_CrearProyecto.json apps/worker/prompts-ia/openaiProvider/
```

---

## 6. Fase 2 — Crear Carpetas y Prompts por Proveedor en R2

### 6.1 Grupo Chat Completions: Z.AI, Qwen, DeepSeek

Estos 3 proveedores comparten el **mismo formato de prompt** (Chat Completions compatible). Se puede generar un set base y luego ajustar el `model` y parámetros específicos.

**Prompt 00 (JSON output) — compartido como base:**
```json
{
  "model": "MODEL_PLACEHOLDER",
  "messages": [
    { "role": "system", "content": "[instructions exactas del prompt openaiProvider]" },
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
  "model": "MODEL_PLACEHOLDER",
  "messages": [
    { "role": "system", "content": "[instructions exactas]" },
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
  "model": "MODEL_PLACEHOLDER",
  "messages": [
    { "role": "system", "content": "[instructions exactas]" },
    { "role": "user", "content": "Analiza la capa de decisión...\n\n%%ijson%%\n\n## Análisis físico\n\n%%analisis-fisico%%\n\n## Análisis estratégico\n\n%%analisis-estrategico%%\n\n## Análisis financiero\n\n%%analisis-financiero%%\n\n## Análisis regulatorio\n\n%%analisis-regulatorio%%" }
  ],
  "max_tokens": 8192,
  "temperature": 0.7,
  "thinking": { "type": "enabled" }
}
```

**Model mapping:**

| Prompt base | Z.AI (`zaiProvider/`) | Qwen (`qwenProvider/`) | DeepSeek (`deepseekProvider/`) |
|-------------|----------------------|----------------------|-------------------------------|
| `MODEL_PLACEHOLDER` | `glm-5.1` | `qwen3.5-plus` | `deepseek-chat` |

**Nota:** Z.AI y Qwen soportan `thinking` de forma nativa. DeepSeek también con `"thinking": { "type": "enabled" }`.

### 6.2 Grupo Gemini: Google AI Studio

**Prompt 00 (JSON output):**
```json
{
  "model": "gemini-2.5-flash",
  "systemInstruction": { "parts": [{ "text": "[instructions exactas]" }] },
  "contents": [{ "role": "user", "parts": [{ "text": "%%ijson%%" }] }],
  "generationConfig": {
    "maxOutputTokens": 4096,
    "temperature": 0.3,
    "responseMimeType": "application/json"
  }
}
```

**Prompts 01-04 (Markdown output):**
```json
{
  "model": "gemini-2.5-flash",
  "systemInstruction": { "parts": [{ "text": "[instructions exactas]" }] },
  "contents": [{ "role": "user", "parts": [{ "text": "%%ijson%%" }] }],
  "generationConfig": {
    "maxOutputTokens": 8192,
    "temperature": 0.7
  }
}
```

**Prompts 05-07 (multi input):**
```json
{
  "model": "gemini-2.5-flash",
  "systemInstruction": { "parts": [{ "text": "[instructions exactas]" }] },
  "contents": [{
    "role": "user",
    "parts": [
      { "text": "Analiza la capa de decisión...\n\n%%ijson%%\n\n## Análisis físico\n\n%%analisis-fisico%%\n\n## Análisis estratégico\n\n%%analisis-estrategico%%\n\n## Análisis financiero\n\n%%analisis-financiero%%\n\n## Análisis regulatorio\n\n%%analisis-regulatorio%%" }
    ]
  }],
  "generationConfig": {
    "maxOutputTokens": 8192,
    "temperature": 0.7
  }
}
```

### 6.3 Grupo Anthropic: Messages API

**Prompt 00 (JSON output):**
```json
{
  "model": "claude-sonnet-4-20250514",
  "system": "[instructions exactas]",
  "max_tokens": 4096,
  "temperature": 0.3,
  "messages": [{ "role": "user", "content": "%%ijson%%" }]
}
```

**Prompts 01-04 (Markdown output):**
```json
{
  "model": "claude-sonnet-4-20250514",
  "system": "[instructions exactas]",
  "max_tokens": 8192,
  "temperature": 0.7,
  "messages": [{ "role": "user", "content": "%%ijson%%" }]
}
```

**Prompts 05-07 (multi input):**
```json
{
  "model": "claude-sonnet-4-20250514",
  "system": "[instructions exactas]",
  "max_tokens": 8192,
  "temperature": 0.7,
  "messages": [{ "role": "user", "content": "Analiza la capa de decisión...\n\n%%ijson%%\n\n## Análisis físico\n\n%%analisis-fisico%%\n\n## Análisis estratégico\n\n%%analisis-estrategico%%\n\n## Análisis financiero\n\n%%analisis-financiero%%\n\n## Análisis regulatorio\n\n%%analisis-regulatorio%%" }]
}
```

### 6.4 Script de Generación Automatizada

```bash
#!/bin/bash
# generate-provider-prompts.sh
# Genera prompts para todos los proveedores a partir de openaiProvider/

PROVIDERS=("zaiProvider" "qwenProvider" "deepseekProvider" "geminiProvider" "anthropicProvider")
NAMES=("00_CrearProyecto" "01_ActivoFisico" "02_ActivoEstrategico" "03_ActivoFinanciero" "04_ActivoRegulado" "05_Inversor" "06_EmprendedorOperador" "07_Propietario")

for provider in "${PROVIDERS[@]}"; do
  echo "=== Generando prompts para $provider ==="
  for name in "${NAMES[@]}"; do
    # 1. Descargar prompt base de openaiProvider
    npx wrangler r2 object get \
      r2-cbconsulting/prompts-ia/openaiProvider/${name}.json \
      --remote --file /tmp/${name}_base.json 2>/dev/null

    # 2. Transformar según el proveedor
    node transform-prompt.mjs /tmp/${name}_base.json $provider /tmp/${name}_${provider}.json

    # 3. Subir a la carpeta del proveedor
    npx wrangler r2 object put \
      r2-cbconsulting/prompts-ia/${provider}/${name}.json \
      --file /tmp/${name}_${provider}.json

    echo "  ✅ ${name}.json → ${provider}/"
  done
done
```

El script `transform-prompt.mjs` leería el prompt base de openaiProvider y aplicaría la transformación correspondiente según el proveedor (ver formatos de sección 6.1-6.3).

---

## 7. Fase 3 — Implementar Providers en Código

### 7.1 Paso 3.1: Modificar `openai-client.ts`

**Archivo:** `apps/worker/src/lib/openai-client.ts`

**Único cambio:** Actualizar el prefijo de R2.

```typescript
// ANTES (línea ~158):
const key = `prompts-ia/${promptName}`

// DESPUÉS:
const key = `prompts-ia/openaiProvider/${promptName}`
```

El resto del archivo queda intacto.

### 7.2 Paso 3.2: Crear `zai-provider.ts`

**Archivo:** `apps/worker/src/lib/zai-provider.ts`

```typescript
/**
 * Z.AI (GLM) Provider — Chat Completions API
 *
 * Lee prompts desde prompts-ia/zaiProvider/ en formato Chat Completions
 * y los ejecuta contra https://api.z.ai/api/paas/v4/chat/completions
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'
import { registrarEvento, registrarError } from './tracking'
import type { IAProvider, IAResult } from './provider-types'

const PROMPT_PREFIX = 'prompts-ia/zaiProvider/'
const ZAI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions'

function reemplazarPlaceholders(promptRaw: string, inputs: Record<string, string>): string {
  let text = promptRaw
  for (const [key, value] of Object.entries(inputs)) {
    text = text.replace(new RegExp(`%%${key}%%`, 'g'), value)
  }
  return text
}

async function execute(
  env: Env,
  promptName: string,
  inputs: Record<string, string>,
  tracking?: TrackingContext,
): Promise<IAResult> {
  if (tracking) registrarEvento(tracking, 'ia-inicio', 'INFO', 'Iniciando llamada a Z.AI', {
    provider: 'zai', prompt: promptName,
  })

  const apiKey = await env.secrets_kv.get('ZAI_API_KEY')
  if (!apiKey) throw new Error('ZAI_API_KEY no encontrada en KV')

  const promptObject = await env.r2_binding_01.get(`${PROMPT_PREFIX}${promptName}`)
  if (!promptObject) throw new Error(`Prompt no encontrado: ${PROMPT_PREFIX}${promptName}`)

  const promptTemplate = await promptObject.text()
  const promptBody = reemplazarPlaceholders(promptTemplate, inputs)
  const parsed = JSON.parse(promptBody)

  if (tracking) registrarEvento(tracking, 'ia-llamar-api', 'INFO', 'Llamando a Z.AI', {
    provider: 'zai', model: parsed.model,
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180000)

  const response = await fetch(ZAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(parsed),
    signal: controller.signal,
  })

  clearTimeout(timeoutId)

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Z.AI API error ${response.status}: ${body}`)
  }

  const data = await response.json() as Record<string, unknown>
  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined
  const text = choices?.[0]?.message?.content || ''

  if (!text) throw new Error('Z.AI no generó contenido')

  const usage = data.usage as Record<string, number> | undefined

  if (tracking) registrarEvento(tracking, 'ia-completado', 'INFO', 'Z.AI completada', {
    provider: 'zai', response_length: text.length,
  })

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

export const zaiProvider: IAProvider = { name: 'zaiProvider', execute }
export function formatZAIError(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}
```

### 7.3 Paso 3.3: Crear `qwen-provider.ts`

**Archivo:** `apps/worker/src/lib/qwen-provider.ts`

```typescript
/**
 * Qwen (Alibaba DashScope) Provider — OpenAI-compatible Chat Completions
 *
 * Lee prompts desde prompts-ia/qwenProvider/
 * Endpoint: https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'
import { registrarEvento, registrarError } from './tracking'
import type { IAProvider, IAResult } from './provider-types'

const PROMPT_PREFIX = 'prompts-ia/qwenProvider/'
const QWEN_API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'

function reemplazarPlaceholders(promptRaw: string, inputs: Record<string, string>): string {
  let text = promptRaw
  for (const [key, value] of Object.entries(inputs)) {
    text = text.replace(new RegExp(`%%${key}%%`, 'g'), value)
  }
  return text
}

async function execute(
  env: Env,
  promptName: string,
  inputs: Record<string, string>,
  tracking?: TrackingContext,
): Promise<IAResult> {
  if (tracking) registrarEvento(tracking, 'ia-inicio', 'INFO', 'Iniciando llamada a Qwen', {
    provider: 'qwen', prompt: promptName,
  })

  const apiKey = await env.secrets_kv.get('QWEN_API_KEY')
  if (!apiKey) throw new Error('QWEN_API_KEY no encontrada en KV')

  const promptObject = await env.r2_binding_01.get(`${PROMPT_PREFIX}${promptName}`)
  if (!promptObject) throw new Error(`Prompt no encontrado: ${PROMPT_PREFIX}${promptName}`)

  const promptTemplate = await promptObject.text()
  const promptBody = reemplazarPlaceholders(promptTemplate, inputs)
  const parsed = JSON.parse(promptBody)

  if (tracking) registrarEvento(tracking, 'ia-llamar-api', 'INFO', 'Llamando a Qwen', {
    provider: 'qwen', model: parsed.model,
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180000)

  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(parsed),
    signal: controller.signal,
  })

  clearTimeout(timeoutId)

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Qwen API error ${response.status}: ${body}`)
  }

  const data = await response.json() as Record<string, unknown>
  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined
  const text = choices?.[0]?.message?.content || ''

  if (!text) throw new Error('Qwen no generó contenido')

  const usage = data.usage as Record<string, number> | undefined

  if (tracking) registrarEvento(tracking, 'ia-completado', 'INFO', 'Qwen completada', {
    provider: 'qwen', response_length: text.length,
  })

  return {
    text, raw: data,
    usage: usage ? {
      input_tokens: usage.prompt_tokens || 0,
      output_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
    } : undefined,
  }
}

export const qwenProvider: IAProvider = { name: 'qwenProvider', execute }
```

### 7.4 Paso 3.4: Crear `deepseek-provider.ts`

**Archivo:** `apps/worker/src/lib/deepseek-provider.ts`

```typescript
/**
 * DeepSeek Provider — OpenAI-compatible Chat Completions
 *
 * Lee prompts desde prompts-ia/deepseekProvider/
 * Endpoint: https://api.deepseek.com/chat/completions
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'
import { registrarEvento, registrarError } from './tracking'
import type { IAProvider, IAResult } from './provider-types'

const PROMPT_PREFIX = 'prompts-ia/deepseekProvider/'
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

function reemplazarPlaceholders(promptRaw: string, inputs: Record<string, string>): string {
  let text = promptRaw
  for (const [key, value] of Object.entries(inputs)) {
    text = text.replace(new RegExp(`%%${key}%%`, 'g'), value)
  }
  return text
}

async function execute(
  env: Env,
  promptName: string,
  inputs: Record<string, string>,
  tracking?: TrackingContext,
): Promise<IAResult> {
  if (tracking) registrarEvento(tracking, 'ia-inicio', 'INFO', 'Iniciando llamada a DeepSeek', {
    provider: 'deepseek', prompt: promptName,
  })

  const apiKey = await env.secrets_kv.get('DEEPSEEK_API_KEY')
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY no encontrada en KV')

  const promptObject = await env.r2_binding_01.get(`${PROMPT_PREFIX}${promptName}`)
  if (!promptObject) throw new Error(`Prompt no encontrado: ${PROMPT_PREFIX}${promptName}`)

  const promptTemplate = await promptObject.text()
  const promptBody = reemplazarPlaceholders(promptTemplate, inputs)
  const parsed = JSON.parse(promptBody)

  if (tracking) registrarEvento(tracking, 'ia-llamar-api', 'INFO', 'Llamando a DeepSeek', {
    provider: 'deepseek', model: parsed.model,
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180000)

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(parsed),
    signal: controller.signal,
  })

  clearTimeout(timeoutId)

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`DeepSeek API error ${response.status}: ${body}`)
  }

  const data = await response.json() as Record<string, unknown>
  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined
  const text = choices?.[0]?.message?.content || ''

  if (!text) throw new Error('DeepSeek no generó contenido')

  const usage = data.usage as Record<string, number> | undefined

  if (tracking) registrarEvento(tracking, 'ia-completado', 'INFO', 'DeepSeek completada', {
    provider: 'deepseek', response_length: text.length,
  })

  return {
    text, raw: data,
    usage: usage ? {
      input_tokens: usage.prompt_tokens || 0,
      output_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
    } : undefined,
  }
}

export const deepseekProvider: IAProvider = { name: 'deepseekProvider', execute }
```

### 7.5 Paso 3.5: Crear `gemini-provider.ts`

**Archivo:** `apps/worker/src/lib/gemini-provider.ts`

```typescript
/**
 * Gemini (Google AI Studio) Provider — generateContent API
 *
 * Lee prompts desde prompts-ia/geminiProvider/
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'
import { registrarEvento, registrarError } from './tracking'
import type { IAProvider, IAResult } from './provider-types'

const PROMPT_PREFIX = 'prompts-ia/geminiProvider/'

function reemplazarPlaceholders(promptRaw: string, inputs: Record<string, string>): string {
  let text = promptRaw
  for (const [key, value] of Object.entries(inputs)) {
    text = text.replace(new RegExp(`%%${key}%%`, 'g'), value)
  }
  return text
}

async function execute(
  env: Env,
  promptName: string,
  inputs: Record<string, string>,
  tracking?: TrackingContext,
): Promise<IAResult> {
  if (tracking) registrarEvento(tracking, 'ia-inicio', 'INFO', 'Iniciando llamada a Gemini', {
    provider: 'gemini', prompt: promptName,
  })

  const apiKey = await env.secrets_kv.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error('GEMINI_API_KEY no encontrada en KV')

  const promptObject = await env.r2_binding_01.get(`${PROMPT_PREFIX}${promptName}`)
  if (!promptObject) throw new Error(`Prompt no encontrado: ${PROMPT_PREFIX}${promptName}`)

  const promptTemplate = await promptObject.text()
  const promptBody = reemplazarPlaceholders(promptTemplate, inputs)
  const parsed = JSON.parse(promptBody) as {
    model: string
    systemInstruction?: { parts: Array<{ text: string }> }
    contents: Array<{ role: string; parts: Array<{ text: string }> }>
    generationConfig?: Record<string, unknown>
  }

  const model = parsed.model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  if (tracking) registrarEvento(tracking, 'ia-llamar-api', 'INFO', 'Llamando a Gemini', {
    provider: 'gemini', model,
  })

  // Gemini no usa header Authorization — la key va en URL
  const bodyToSend = {
    systemInstruction: parsed.systemInstruction,
    contents: parsed.contents,
    generationConfig: parsed.generationConfig || {},
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180000)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyToSend),
    signal: controller.signal,
  })

  clearTimeout(timeoutId)

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`Gemini API error ${response.status}: ${errBody}`)
  }

  const data = await response.json() as Record<string, unknown>

  // Extraer texto: candidates[0].content.parts[0].text
  const candidates = data.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined
  const text = candidates?.[0]?.content?.parts?.[0]?.text || ''

  if (!text) throw new Error('Gemini no generó contenido')

  const usageMeta = data.usageMetadata as Record<string, number> | undefined

  if (tracking) registrarEvento(tracking, 'ia-completado', 'INFO', 'Gemini completada', {
    provider: 'gemini', response_length: text.length,
  })

  return {
    text, raw: data,
    usage: usageMeta ? {
      input_tokens: usageMeta.promptTokenCount || 0,
      output_tokens: usageMeta.candidatesTokenCount || 0,
      total_tokens: usageMeta.totalTokenCount || 0,
    } : undefined,
  }
}

export const geminiProvider: IAProvider = { name: 'geminiProvider', execute }
```

### 7.6 Paso 3.6: Crear `anthropic-provider.ts`

**Archivo:** `apps/worker/src/lib/anthropic-provider.ts`

```typescript
/**
 * Anthropic (Claude) Provider — Messages API
 *
 * Lee prompts desde prompts-ia/anthropicProvider/
 * Endpoint: https://api.anthropic.com/v1/messages
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'
import { registrarEvento, registrarError } from './tracking'
import type { IAProvider, IAResult } from './provider-types'

const PROMPT_PREFIX = 'prompts-ia/anthropicProvider/'
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

function reemplazarPlaceholders(promptRaw: string, inputs: Record<string, string>): string {
  let text = promptRaw
  for (const [key, value] of Object.entries(inputs)) {
    text = text.replace(new RegExp(`%%${key}%%`, 'g'), value)
  }
  return text
}

async function execute(
  env: Env,
  promptName: string,
  inputs: Record<string, string>,
  tracking?: TrackingContext,
): Promise<IAResult> {
  if (tracking) registrarEvento(tracking, 'ia-inicio', 'INFO', 'Iniciando llamada a Anthropic', {
    provider: 'anthropic', prompt: promptName,
  })

  const apiKey = await env.secrets_kv.get('ANTHROPIC_API_KEY')
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY no encontrada en KV')

  const promptObject = await env.r2_binding_01.get(`${PROMPT_PREFIX}${promptName}`)
  if (!promptObject) throw new Error(`Prompt no encontrado: ${PROMPT_PREFIX}${promptName}`)

  const promptTemplate = await promptObject.text()
  const promptBody = reemplazarPlaceholders(promptTemplate, inputs)
  const parsed = JSON.parse(promptBody) as {
    model: string
    system: string
    max_tokens: number
    temperature?: number
    messages: Array<{ role: string; content: string }>
  }

  if (tracking) registrarEvento(tracking, 'ia-llamar-api', 'INFO', 'Llamando a Anthropic', {
    provider: 'anthropic', model: parsed.model,
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180000)

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(parsed),
    signal: controller.signal,
  })

  clearTimeout(timeoutId)

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`Anthropic API error ${response.status}: ${errBody}`)
  }

  const data = await response.json() as Record<string, unknown>

  // Extraer texto: content[0].text
  const content = data.content as Array<{ type?: string; text?: string }> | undefined
  const text = content?.[0]?.text || ''

  if (!text) throw new Error('Anthropic no generó contenido')

  const usage = data.usage as Record<string, number> | undefined

  if (tracking) registrarEvento(tracking, 'ia-completado', 'INFO', 'Anthropic completada', {
    provider: 'anthropic', response_length: text.length,
  })

  return {
    text, raw: data,
    usage: usage ? {
      input_tokens: usage.input_tokens || 0,
      output_tokens: usage.output_tokens || 0,
      total_tokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
    } : undefined,
  }
}

export const anthropicProvider: IAProvider = { name: 'anthropicProvider', execute }
```

### 7.7 Paso 3.7: Crear `ia-provider.ts` con Registry

**Archivo:** `apps/worker/src/lib/ia-provider.ts`

```typescript
/**
 * IA Provider Registry — Router de proveedores de IA
 *
 * Selecciona el proveedor basado en la variable IA_PROVIDER en KV.
 * Los servicios importan executePrompt() y formatIAError() de aquí.
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'
import type { IAProvider, IAResult } from './provider-types'

// Importar todos los providers
import { openaiProvider, formatOpenAIError } from './openai-client'
import { zaiProvider } from './zai-provider'
import { qwenProvider } from './qwen-provider'
import { deepseekProvider } from './deepseek-provider'
import { geminiProvider } from './gemini-provider'
import { anthropicProvider } from './anthropic-provider'

/**
 * Registry de proveedores — cada key coincide con el valor de IA_PROVIDER en KV
 */
const REGISTRY: Record<string, IAProvider> = {
  'openaiProvider': openaiProvider,
  'zaiProvider': zaiProvider,
  'qwenProvider': qwenProvider,
  'deepseekProvider': deepseekProvider,
  'geminiProvider': geminiProvider,
  'anthropicProvider': anthropicProvider,
  // Alias para compatibilidad
  'openai': openaiProvider,
  'zai': zaiProvider,
  'qwen': qwenProvider,
  'deepseek': deepseekProvider,
  'gemini': geminiProvider,
  'anthropic': anthropicProvider,
}

/**
 * Ejecuta un prompt contra el proveedor activo.
 *
 * @param env - Environment bindings
 * @param promptName - Nombre del prompt (ej. '00_CrearProyecto.json')
 * @param inputs - Inputs para reemplazar placeholders (ej. { ijson: "..." })
 * @param tracking - Contexto de tracking opcional
 */
export async function executePrompt(
  env: Env,
  promptName: string,
  inputs: Record<string, string>,
  tracking?: TrackingContext,
): Promise<IAResult> {
  const providerName = (await env.secrets_kv.get('IA_PROVIDER')) || 'openaiProvider'

  const provider = REGISTRY[providerName]
  if (!provider) {
    throw new Error(`Proveedor IA no soportado: ${providerName}. Disponibles: ${Object.keys(REGISTRY).join(', ')}`)
  }

  return provider.execute(env, promptName, inputs, tracking)
}

/**
 * Formatear error genérico de IA — delega al provider específico si es posible
 */
export function formatIAError(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}
```

### 7.8 Paso 3.8: Crear `provider-types.ts`

**Archivo:** `apps/worker/src/lib/provider-types.ts`

```typescript
/**
 * Tipos compartidos para el sistema multi-provider de IA
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'

/**
 * Resultado genérico de ejecución de IA
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
 * Interfaz que debe implementar todo proveedor de IA
 */
export interface IAProvider {
  /** Nombre del proveedor (coincide con IA_PROVIDER en KV) */
  name: string
  /** Ejecutar un prompt */
  execute: (
    env: Env,
    promptName: string,
    inputs: Record<string, string>,
    tracking?: TrackingContext,
  ) => Promise<IAResult>
}
```

---

## 8. Fase 4 — Adaptar Servicios Existentes

### 8.1 Paso 4.1: Adaptar `ia-creacion-proyectos.ts`

**Archivo:** `apps/worker/src/services/ia-creacion-proyectos.ts`

**Cambios:**
```typescript
// LÍNEA ~12 — Cambiar import
// ANTES:
import { executePrompt, formatOpenAIError } from '../lib/openai-client'
// DESPUÉS:
import { executePrompt, formatIAError } from '../lib/ia-provider'
```

```typescript
// LÍNEA ~48 — La llamada a executePrompt cambia de firma
// ANTES:
const result = await executePrompt(env, '00_CrearProyecto.json', ijson, tracking)
// DESPUÉS (inputs como Record):
const result = await executePrompt(env, '00_CrearProyecto.json', { ijson }, tracking)
```

```typescript
// LÍNEA ~118 — En el catch
// ANTES:
const errorMessage = formatOpenAIError(error)
// DESPUÉS:
const errorMessage = formatIAError(error)
```

### 8.2 Paso 4.2: Adaptar `ia-analisis-proyectos.ts`

**Archivo:** `apps/worker/src/services/ia-analisis-proyectos.ts`

**Cambios en imports (línea ~15):**
```typescript
// ANTES:
import { callOpenAIResponses, formatOpenAIError } from '../lib/openai-client'
// y posiblemente importaciones de getOpenAIKey

// DESPUÉS:
import { executePrompt, formatIAError } from '../lib/ia-provider'
import { registrarEvento, registrarError } from '../lib/tracking'
```

**Cambios en `ejecutarPasoConIA` (línea ~100+):**
```typescript
// ANTES — lógica completa:
//   1. Leer prompt de R2
//   2. Reemplazar placeholders
//   3. Obtener API key
//   4. Llamar callOpenAIResponses
//   5. Extraer texto
//   6. Manejar errores

// DESPUÉS — simplificado:
export async function ejecutarPasoConIA(
  env: Env,
  promptNombre: string,
  inputs: InputsParaPaso,
  tracking: TrackingContext,
): Promise<EjecutarPasoConIAResult> {
  try {
    registrarEvento(tracking, `ejecutar-ia-${promptNombre}`, 'INFO', 'Ejecutando prompt con IA', {
      prompt: promptNombre,
    })

    // Convertir inputs a Record<string, string>
    const inputMap: Record<string, string> = { ijson: inputs.ijson }
    if (inputs['analisis-fisico']) inputMap['analisis-fisico'] = inputs['analisis-fisico']
    if (inputs['analisis-estrategico']) inputMap['analisis-estrategico'] = inputs['analisis-estrategico']
    if (inputs['analisis-financiero']) inputMap['analisis-financiero'] = inputs['analisis-financiero']
    if (inputs['analisis-regulatorio']) inputMap['analisis-regulatorio'] = inputs['analisis-regulatorio']

    const result = await executePrompt(env, promptNombre, inputMap, tracking)
    const contenido = result.text.trim()

    if (!contenido) {
      registrarError(tracking, `empty-response-${promptNombre}`, new Error('La IA no generó contenido'))
      return { exito: false, error_codigo: ERROR_CODES.EMPTY_RESPONSE, error_mensaje: 'La IA no generó contenido' }
    }

    return { exito: true, contenido }
  } catch (error) {
    registrarError(tracking, `ia-error-${promptNombre}`, error)
    return { exito: false, error_codigo: ERROR_CODES.OPENAI_ERROR, error_mensaje: formatIAError(error) }
  }
}
```

**Nota:** `ERROR_CODES.OPENAI_ERROR` se mantiene por compatibilidad. Se podría renombrar a `ERROR_CODES.IA_ERROR` en una refactorización posterior.

---

## 9. Fase 5 — Configuración

### 9.1 Paso 5.1: Verificar Secrets en Cloudflare

Todos los API keys ya están creados. Verificar que los valores son correctos:

```bash
npx wrangler secret list --env dev 2>&1 | grep -E "IA_PROVIDER|API_KEY"
```

Esperado:
```
OPENAI_API_KEY     ✅ (valor existente)
ZAI_API_KEY        ✅ (creado)
QWEN_API_KEY       ✅ (creado — verificar valor)
DEEPSEEK_API_KEY   ✅ (creado — verificar valor)
GEMINI_API_KEY     ✅ (configurado)
ANTHROPIC_API_KEY  ✅ (creado)
IA_PROVIDER        ✅ (valor: zaiProvider)
```

**No cambiar el valor de `IA_PROVIDER`** por ahora — dejarlo en `zaiProvider`.

### 9.2 Paso 5.2: Actualizar `.dev.vars.example`

**Archivo:** `apps/worker/.dev.vars.example`

```ini
# IA Provider Configuration
# Valores: openaiProvider, zaiProvider, qwenProvider, deepseekProvider, geminiProvider, anthropicProvider
IA_PROVIDER=openaiProvider

# API Keys (se leen desde KV en producción)
OPENAI_API_KEY=sk-...
ZAI_API_KEY=tu-api-key-de-zai
QWEN_API_KEY=tu-api-key-de-qwen
DEEPSEEK_API_KEY=tu-api-key-de-deepseek
GEMINI_API_KEY=tu-api-key-de-gemini
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 10. Fase 6 — Verificación y Despliegue

### 10.1 Paso 6.1: Type Check

```bash
cd apps/worker && npx tsc --noEmit 2>&1
```

Resolver cualquier error. El error preexistente en `pai-notas.ts:303` no bloquea.

### 10.2 Paso 6.2: Test por Proveedor

Para cada proveedor, cambiar `IA_PROVIDER` y probar:

```bash
# Test con OpenAI
npx wrangler secret put IA_PROVIDER --env dev  # → openaiProvider
cd apps/worker && npm run dev
curl http://localhost:8787/api/health
# Probar /api/pai/proyectos con creación o análisis

# Test con Z.AI
npx wrangler secret put IA_PROVIDER --env dev  # → zaiProvider
cd apps/worker && npm run dev
curl http://localhost:8787/api/health
# Probar

# Test con Qwen
npx wrangler secret put IA_PROVIDER --env dev  # → qwenProvider
# ...

# Test con DeepSeek
npx wrangler secret put IA_PROVIDER --env dev  # → deepseekProvider
# ...

# Test con Gemini
npx wrangler secret put IA_PROVIDER --env dev  # → geminiProvider
# ...

# Test con Anthropic
npx wrangler secret put IA_PROVIDER --env dev  # → anthropicProvider
# ...

# Restaurar valor original
npx wrangler secret put IA_PROVIDER --env dev  # → zaiProvider
```

### 10.3 Paso 6.3: Deploy Worker

```bash
cd apps/worker && npm run deploy
```

---

## 11. Rollback Plan

Si algo falla tras el deploy:

1. **Revertir `IA_PROVIDER` a `openaiProvider`:**
   ```bash
   npx wrangler secret put IA_PROVIDER --env dev
   # → Introducir: openaiProvider
   ```

2. **Los prompts originales en `prompts-ia/` raíz de R2 se mantienen** hasta verificación exitosa.

3. **Revertir código:** `git revert HEAD` en el commit del despliegue.

---

## 12. Referencia Completa de Archivos

### 12.1 Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `apps/worker/src/lib/provider-types.ts` | Interfaz `IAProvider` + tipo `IAResult` |
| `apps/worker/src/lib/ia-provider.ts` | Registry + router de proveedores |
| `apps/worker/src/lib/zai-provider.ts` | Provider Z.AI (Chat Completions) |
| `apps/worker/src/lib/qwen-provider.ts` | Provider Qwen (Chat Completions) |
| `apps/worker/src/lib/deepseek-provider.ts` | Provider DeepSeek (Chat Completions) |
| `apps/worker/src/lib/gemini-provider.ts` | Provider Gemini (generateContent) |
| `apps/worker/src/lib/anthropic-provider.ts` | Provider Anthropic (Messages API) |
| `apps/worker/prompts-ia/zaiProvider/*.json` | 8 prompts Z.AI |
| `apps/worker/prompts-ia/qwenProvider/*.json` | 8 prompts Qwen |
| `apps/worker/prompts-ia/deepseekProvider/*.json` | 8 prompts DeepSeek |
| `apps/worker/prompts-ia/geminiProvider/*.json` | 8 prompts Gemini |
| `apps/worker/prompts-ia/anthropicProvider/*.json` | 8 prompts Anthropic |
| `prompts-ia/openaiProvider/` (dir) | Carpeta para prompts OpenAI |

### 12.2 Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `apps/worker/src/lib/openai-client.ts` | Cambiar prefijo R2 a `prompts-ia/openaiProvider/` |
| `apps/worker/src/services/ia-creacion-proyectos.ts` | Cambiar imports + firma de `executePrompt` |
| `apps/worker/src/services/ia-analisis-proyectos.ts` | Simplificar `ejecutarPasoConIA` + cambiar imports |
| `apps/worker/.dev.vars.example` | Añadir los 6 API keys + `IA_PROVIDER` |

### 12.3 Archivos a Mover

| Origen | Destino |
|--------|---------|
| `prompts-ia/01_ActivoFisico.json` | `prompts-ia/openaiProvider/01_ActivoFisico.json` |
| `apps/worker/prompts-ia/00_CrearProyecto.json` | `apps/worker/prompts-ia/openaiProvider/00_CrearProyecto.json` |
| `r2: prompts-ia/*.json` (8 archivos) | `r2: prompts-ia/openaiProvider/*.json` (copiar, no eliminar originals hasta verificar) |

---

## 13. Hoja de Ruta Futura

| Fase | Acción | Descripción |
|------|--------|-------------|
| **Post-implementación** | Script de sync de prompts | Herramienta para validar consistencia entre proveedores |
| **Post-implementación** | Actualizar inventario | Documentar los 6 proveedores vía `inventariador` |
| **Fase siguiente** | Eliminar prompts raíz de R2 | Tras verificación completa, limpiar `prompts-ia/*.json` originales |
| **Fase siguiente** | Renombrar `ERROR_CODES.OPENAI_ERROR` → `IA_ERROR` | Generalizar códigos de error |
| **Fase siguiente** | Añadir `simulacionProvider` | Integrar `simulacion-ia.ts` como 7º proveedor |
| **Futuro** | Añadir nuevos proveedores | Mistral, Cohere, Groq — solo crear `xxx-provider.ts` + carpeta R2 |
| **Futuro** | Métricas por proveedor | Tracking comparativo de coste, latencia, calidad |
| **Futuro** | Fallback automático | Si un proveedor falla, intentar el siguiente en el registry |

---

*Documento generado: 2026-04-08*
*Versión: 2.0 — Expandido a 6 proveedores*
