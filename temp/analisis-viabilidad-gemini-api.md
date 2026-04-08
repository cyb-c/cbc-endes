# Análisis de Viabilidad: Multi-Provider IA para cbc-endes

## Índice de Contenidos
1. [Objetivo del Análisis](#1-objetivo-del-análisis)
2. [Estado Actual del Uso de IA en el Proyecto](#2-estado-actual-del-uso-de-ia-en-el-proyecto)
   - 2.1 [Arquitectura de Integración con IA](#21-arquitectura-de-integración-con-ia)
   - 2.2 [Archivos Implicados](#22-archivos-implicados)
   - 2.3 [Flujo de Llamadas a IA](#23-flujo-de-llamadas-a-ia)
   - 2.4 [Prompts y Modelos Utilizados](#24-prompts-y-modelos-utilizados)
3. [Parte 1 — Viabilidad de los 6 Proveedores](#3-parte-1--viabilidad-de-los-6-proveedores)
   - 3.1 [OpenAI](#31-openai)
   - 3.2 [Gemini (Google AI Studio)](#32-gemini-google-ai-studio)
   - 3.3 [Anthropic (Claude)](#33-anthropic-claude)
   - 3.4 [Z.AI (GLM)](#34-zai-glm)
   - 3.5 [Qwen (Alibaba DashScope)](#35-qwen-alibaba-dashscope)
   - 3.6 [DeepSeek](#36-deepseek)
   - 3.7 [Tabla Comparativa de Todos los Proveedores](#37-tabla-comparativa-de-todos-los-proveedores)
   - 3.8 [Veredicto de Viabilidad](#38-veredicto-de-viabilidad)
4. [Parte 2 — Diseño Multi-Proveedor (6 Proveedores + Extensible)](#4-parte-2--diseño-multi-proveedor-6-proveedores--extensible)
   - 4.1 [Principio de Diseño](#41-principio-de-diseño)
   - 4.2 [Variable de Selección de Proveedor](#42-variable-de-selección-de-proveedor)
   - 4.3 [Archivos a Modificar](#43-archivos-a-modificar)
   - 4.4 [Archivos a Crear](#44-archivos-a-crear)
   - 4.5 [Esquema de la Nueva Arquitectura](#45-esquema-de-la-nueva-arquitectura)
   - 4.6 [Cambios en Servicios Existentes](#46-cambios-en-servicios-existentes)
   - 4.7 [Gestión de Secrets](#47-gestión-de-secrets)
   - 4.8 [Compatibilidad con Tracking](#48-compatibilidad-con-tracking)
   - 4.9 [Extensibilidad para Futuros Proveedores](#49-extensibilidad-para-futuros-proveedores)
   - 4.10 [Transformación de Prompts por Proveedor](#410-transformación-de-prompts-por-proveedor)
5. [Resumen de Acciones Requeridas](#5-resumen-de-acciones-requeridas)
6. [Pendientes de Confirmación](#6-pendientes-de-confirmación)

---

## 1. Objetivo del Análisis

Este documento analiza la viabilidad de incorporar **6 proveedores de IA** como opciones intercambiables en el proyecto `cbc-endes`, y diseña una arquitectura multi-proveedor que permita:

1. **Parte 1:** Evaluar la compatibilidad técnica de cada proveedor para ejecutar todos los prompts del proyecto (creación de proyectos + 7 pasos de análisis).
2. **Parte 2:** Mantener los 6 proveedores disponibles, seleccionables mediante variable `IA_PROVIDER` en KV, con capacidad de añadir futuros proveedores sin refactorización masiva.

**Proveedores a evaluar:**
| Proveedor | Registry Key | API Key Secret |
|-----------|-------------|----------------|
| OpenAI Responses API | `openai` | `OPENAI_API_KEY` |
| Gemini (Google AI Studio) | `gemini` | `GEMINI_API_KEY` |
| Anthropic (Claude Messages) | `anthropic` | `ANTHROPIC_API_KEY` |
| Z.AI (GLM) | `zai` | `ZAI_API_KEY` |
| Qwen (Alibaba DashScope) | `qwen` | `QWEN_API_KEY` *(por confirmar)* |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` |

**Estado actual de secrets en Cloudflare:** Todos creados.
**Valor actual de `IA_PROVIDER`:** `zaiProvider` (pendiente de normalizar a `zai`).

---

## 2. Estado Actual del Uso de IA en el Proyecto

### 2.1 Arquitectura de Integración con IA

El proyecto **NO usa el SDK de `openai` npm**. Toda la comunicación con OpenAI se hace mediante **`fetch()` raw** al endpoint de Responses API:

```
POST https://api.openai.com/v1/responses
```

Esto es clave porque:
- **No hay dependencia del paquete `openai`** → el cambio a otro proveedor no implica eliminar una librería npm
- La integración es puramente HTTP/REST → todos los proveedores evaluados ofrecen REST API
- El patrón de llamada es reutilizable

### 2.2 Archivos Implicados

| Archivo | Rol | ¿Llama a IA? |
|---------|-----|--------------|
| `apps/worker/src/lib/openai-client.ts` | Librería compartida de IA | **Sí** — único punto de llamada a IA |
| `apps/worker/src/services/ia-creacion-proyectos.ts` | Servicio de creación de proyectos con IA | **Sí** — importa `executePrompt, formatOpenAIError` |
| `apps/worker/src/services/ia-analisis-proyectos.ts` | Servicio de análisis en 7 pasos | **Sí** — importa `callOpenAIResponses, formatOpenAIError` |
| `apps/worker/src/services/simulacion-ia.ts` | Servicio de simulación (fallback) | **No** — genera contenido local |
| `apps/worker/src/types/analisis.ts` | Tipos y `MAPEO_ARCHIVOS` | No |
| `prompts-ia/00_CrearProyecto.json` | Prompt para crear proyectos | Plantilla (modelo: `gpt-5`) |
| `prompts-ia/01_ActivoFisico.json` | Prompt paso 1 análisis | Plantilla (modelo: `gpt-5`) |
| `prompts-ia/02-07_*.json` | Prompts pasos 2-7 análisis | **Pendientes de crear** |

**Solo 2 archivos de servicio importan del cliente de IA:**
- `ia-creacion-proyectos.ts` → `executePrompt()` + `formatOpenAIError()`
- `ia-analisis-proyectos.ts` → `callOpenAIResponses()` + `formatOpenAIError()`

### 2.3 Flujo de Llamadas a IA

```
Servicio (ia-creacion-proyectos.ts o ia-analisis-proyectos.ts)
  ↓
openai-client.ts
  ├── getOpenAIApiKey(env) → lee OPENAI_API_KEY desde KV `secretos-cbconsulting`
  ├── loadPromptFromR2(env) → lee plantilla JSON desde R2 `prompts-ia/{nombre}`
  ├── prepareRequestBody() → reemplaza %%ijson%% con el JSON de entrada
  ├── callOpenAIResponses() → fetch() a https://api.openai.com/v1/responses
  │     └── Timeout: 180s (AbortController)
  │     └── Error classification: RATE_LIMIT, AUTH, SERVER_ERROR, etc.
  │     └── Retryable flag: true para 429 y 5xx
  └── extractTextFromOutput() → normaliza respuesta multi-formato
```

### 2.4 Prompts y Modelos Utilizados

| Prompt | Modelo Actual | Uso | Formato de Salida |
|--------|--------------|-----|-------------------|
| `00_CrearProyecto.json` | `gpt-5` | Extraer datos de IJSON → JSON estructurado del proyecto | JSON |
| `01_ActivoFisico.json` | `gpt-5` | Análisis físico del inmueble → Markdown | Markdown |
| `02_ActivoEstrategico.json` | `gpt-5` (pendiente) | Análisis estratégico → Markdown | Markdown |
| `03_ActivoFinanciero.json` | `gpt-5` (pendiente) | Análisis financiero → Markdown | Markdown |
| `04_ActivoRegulado.json` | `gpt-5` (pendiente) | Análisis regulatorio → Markdown | Markdown |
| `05_Inversor.json` | `gpt-5` (pendiente) | Lectura para inversor → Markdown | Markdown |
| `06_EmprendedorOperador.json` | `gpt-5` (pendiente) | Lectura para operador → Markdown | Markdown |
| `07_Propietario.json` | `gpt-5` (pendiente) | Lectura para propietario → Markdown | Markdown |

Los prompts 02-07 están definidos en código (`ia-analisis-proyectos.ts`) pero sus archivos JSON **aún no existen** en R2 ni en el repo.

**Nota sobre el formato de prompt actual:** Los prompts usan el formato **OpenAI Responses API** (`{ model, instructions, input: [...] }`), que es diferente del formato Chat Completions (`{ model, messages: [...] }`). Esto es relevante para la transformación de prompts por proveedor.

---

## 3. Parte 1 — Viabilidad de los 6 Proveedores

### 3.1 OpenAI

| Aspecto | Detalle |
|---------|---------|
| **Endpoint** | `https://api.openai.com/v1/responses` |
| **Autenticación** | `Authorization: Bearer <OPENAI_API_KEY>` |
| **Modelos recomendados** | `gpt-5` (actual), `gpt-5.4` |
| **Contexto** | ~128K tokens |
| **Formato nativo** | Responses API (`instructions` + `input[]`) — coincide con prompts actuales |
| **JSON mode** | Sí (structured output) |
| **Precio** | Variable según modelo (~$1.25-$15/M input, ~$5-$60/M output) |
| **Estado en proyecto** | ✅ Integrado y operativo |
| **Viabilidad** | ✅ **NATIVA** — ya funciona, sin cambios necesarios |

### 3.2 Gemini (Google AI Studio)

| Aspecto | Detalle |
|---------|---------|
| **Endpoint** | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}` |
| **Autenticación** | API key en URL o header `x-goog-api-key` |
| **Modelos recomendados** | `gemini-2.5-flash` (mejor relación), `gemini-2.5-pro` |
| **Contexto** | **1M tokens** |
| **Formato nativo** | `{ contents: [{ parts: [{ text }] }], systemInstruction, generationConfig }` |
| **JSON mode** | `responseMimeType: "application/json"` |
| **Plan gratuito** | 250 RPD (Flash), 100 RPD (Pro), 250K TPM |
| **Precio pago** | Flash: gratis en free tier; Pro: pago por uso |
| **Viabilidad** | ✅ **VIABLE** — requiere transformación de request/response |

**Consideraciones Gemini:**
- El plan gratuito es suficiente para el volumen actual del proyecto
- Sin SLA en free tier; contenido puede ser usado por Google
- API en `v1beta` pero estable desde 2024
- Contexto de 1M tokens es ventaja significativa para prompts largos

### 3.3 Anthropic (Claude)

| Aspecto | Detalle |
|---------|---------|
| **Endpoint** | `https://api.anthropic.com/v1/messages` |
| **Autenticación** | Headers: `x-api-key: <ANTHROPIC_API_KEY>` + `anthropic-version: 2023-06-01` |
| **Modelos recomendados** | `claude-sonnet-4-20250514` (mejor relación), `claude-opus-4-6` (máxima calidad) |
| **Contexto** | **1M tokens** (Sonnet 4.6, Opus 4.6) |
| **Formato nativo** | `{ model, system, max_tokens, messages: [{ role, content }] }` |
| **JSON mode** | `response_format: { type: "json_object" }` |
| **Precio** | Sonnet: $3/M input, $15/M output; Opus: $5/M input, $25/M output |
| **Extended Thinking** | Sí — chain-of-thought expuesto en `reasoning_details` |
| **Viabilidad** | ✅ **VIABLE** — requiere transformación de request/response |

**Consideraciones Anthropic:**
- Formato Messages API es diferente de Responses API pero conceptualmente equivalente
- `system` va como parámetro separado, no en `messages`
- `max_tokens` es **obligatorio** (no tiene default)
- Extended thinking es útil para prompts complejos de análisis
- No tiene free tier — siempre es de pago

### 3.4 Z.AI (GLM)

| Aspecto | Detalle |
|---------|---------|
| **Endpoint** | `https://api.z.ai/api/paas/v4/chat/completions` (general) |
| **Autenticación** | `Authorization: Bearer <ZAI_API_KEY>` |
| **Modelos recomendados** | `glm-5.1` (último, 200K contexto), `glm-5` (80K contexto), `glm-5-turbo` |
| **Contexto** | GLM-5.1: **200K tokens** (202,752); GLM-5: 80K; GLM-5-Turbo: variable |
| **Formato nativo** | **OpenAI Chat Completions compatible** `{ model, messages: [{ role, content }] }` |
| **JSON mode** | `response_format: { type: "json_object" }` |
| **Precio** | GLM-5: ~$0.72/M input, $2.30/M output; GLM-5.1: ~$1.26/M input, $3.96/M output |
| **Coding Plan** | Endpoint dedicado `https://api.z.ai/api/coding/paas/v4` ($10/mes) |
| **Reasoning** | Parámetro `reasoning` nativo con `reasoning_details` |
| **Viabilidad** | ✅ **MUY VIABLE** — compatible con formato OpenAI Chat Completions |

**Consideraciones Z.AI:**
- **Máxima compatibilidad:** Usa formato OpenAI Chat Completions, solo hay que adaptar el Responses API actual a messages[]
- GLM-5.1 tiene contexto de 200K tokens — suficiente para IJSON + 4 MDs de entrada
- SDK OpenAI oficial compatible solo cambiando `baseURL`
- Precio muy competitivo (menor que OpenAI y Anthropic)
- **Valor actual de `IA_PROVIDER` en secrets:** `zaiProvider` → debe normalizarse a `zai`

### 3.5 Qwen (Alibaba DashScope)

| Aspecto | Detalle |
|---------|---------|
| **Endpoint** | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` (Singapur) |
| **Autenticación** | `Authorization: Bearer <DASHSCOPE_API_KEY>` |
| **Modelos recomendados** | `qwen-max` / `qwen3-max` (máxima calidad), `qwen-plus` / `qwen3.5-plus` (equilibrio) |
| **Contexto** | qwen3-max: **131K tokens**; qwen3.5-plus: 256K+ tokens |
| **Formato nativo** | **OpenAI Chat Completions compatible** `{ model, messages: [{ role, content }] }` |
| **JSON mode** | `response_format: { type: "json_object" }` |
| **Precio** | qwen3.5-plus: ~$0.11/M input tokens (muy económico) |
| **Free tier** | 1M tokens input + 1M output para cuentas nuevas (region internacional) |
| **OpenAI Responses API** | ❌ No soportado nativamente — solo Chat Completions |
| **Viabilidad** | ✅ **MUY VIABLE** — compatible con formato OpenAI Chat Completions |

**Consideraciones Qwen:**
- Máxima compatibilidad con OpenAI (mismo formato Chat Completions que Z.AI)
- Precio extremadamente competitivo (~$0.11/M tokens para qwen3.5-plus)
- Free tier generoso para cuentas nuevas
- Thinking mode disponible en modelos `qwq-*` y `qwen3-*-thinking`
- `QWEN_API_KEY` creado en Cloudflare secrets — pendiente confirmar valor

### 3.6 DeepSeek

| Aspecto | Detalle |
|---------|---------|
| **Endpoint** | `https://api.deepseek.com/chat/completions` |
| **Autenticación** | `Authorization: Bearer <DEEPSEEK_API_KEY>` |
| **Modelos recomendados** | `deepseek-chat` (general), `deepseek-reasoner` (con reasoning) |
| **Contexto** | 128K tokens (deepseek-chat) |
| **Formato nativo** | **OpenAI Chat Completions compatible** `{ model, messages: [{ role, content }] }` |
| **JSON mode** | `response_format: { type: "json_object" }` |
| **Thinking mode** | `thinking: { type: "enabled" }` para chain-of-thought |
| **Precio** | Muy económico (~$0.14/M input, $0.28/M output para deepseek-chat) |
| **OpenAI Responses API** | ❌ No soportado — solo Chat Completions |
| **Viabilidad** | ✅ **MUY VIABLE** — compatible con formato OpenAI Chat Completions |

**Consideraciones DeepSeek:**
- Máxima compatibilidad con OpenAI (mismo formato Chat Completions)
- Precio más bajo de todos los proveedores evaluados
- `deepseek-reasoner` con thinking mode es útil para análisis complejos
- Stats de cache hit/miss en respuesta (optimización de costes)
- `DEEPSEEK_API_KEY` creado en Cloudflare secrets — pendiente confirmar valor

### 3.7 Tabla Comparativa de Todos los Proveedores

| Característica | OpenAI | Gemini | Anthropic | Z.AI (GLM) | Qwen | DeepSeek |
|---------------|--------|--------|-----------|------------|------|----------|
| **Endpoint** | `/v1/responses` | `/v1beta/models/{m}:generateContent` | `/v1/messages` | `/api/paas/v4/chat/completions` | `/compatible-mode/v1/chat/completions` | `/chat/completions` |
| **Formato Request** | Responses API | Gemini native | Messages API | Chat Completions (OpenAI compat.) | Chat Completions (OpenAI compat.) | Chat Completions (OpenAI compat.) |
| **Transformación necesaria** | **Ninguna** | **Alta** | **Media** | **Baja** | **Baja** | **Baja** |
| **Modelo recomendado** | gpt-5 | gemini-2.5-flash | claude-sonnet-4 | glm-5.1 | qwen3.5-plus | deepseek-chat |
| **Contexto** | ~128K | **1M** | **1M** | 200K | 131K-256K | 128K |
| **JSON mode** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Thinking/Reasoning** | ✅ | ✅ | ✅ (Extended Thinking) | ✅ (reasoning) | ✅ (thinking) | ✅ (thinking) |
| **Free tier** | ❌ | ✅ (250 RPD Flash) | ❌ | ❌ (Coding Plan $10/mes) | ✅ (1M tokens nuevos) | ❌ |
| **Precio (input/M)** | ~$1.25-15 | Gratis/$variable | $3-5 | $0.72-1.26 | ~$0.11 | ~$0.14 |
| **Precio (output/M)** | ~$5-60 | Gratis/$variable | $15-25 | $2.30-3.96 | ~$0.30 | ~$0.28 |
| **SDK OpenAI compatible** | N/A | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Secret en Cloudflare** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Viabilidad global** | ✅ Nativa | ✅ Viable | ✅ Viable | ✅ Muy viable | ✅ Muy viable | ✅ Muy viable |

### 3.8 Veredicto de Viabilidad

**✅ LOS 6 PROVEEDORES SON VIABLES para el proyecto.**

**Clasificación por facilidad de integración:**

| Nivel | Proveedores | Razón |
|-------|-------------|-------|
| 🟢 **Nativo** | OpenAI | Ya integrado, formato Responses API coincide con prompts |
| 🟢 **Muy fácil** | Z.AI, Qwen, DeepSeek | Formato Chat Completions compatible con OpenAI — transformación mínima |
| 🟡 **Moderado** | Anthropic | Formato Messages API diferente pero equivalente — transformación media |
| 🟡 **Moderado** | Gemini | Formato propio muy diferente — transformación más elaborada |

**Recomendación de implementación:**
1. OpenAI: extraer a provider (sin cambios funcionales)
2. Z.AI, Qwen, DeepSeek: compartir lógica de transformación Responses→Chat Completions
3. Anthropic: transformación dedicada (separar system, añadir max_tokens)
4. Gemini: transformación más compleja (estructura contents/parts)

---

## 4. Parte 2 — Diseño Multi-Proveedor (6 Proveedores + Extensible)

### 4.1 Principio de Diseño

**Patrón: Provider Interface + Registry + Prompt Transformer**

```
┌──────────────────────────────────────────────────────────┐
│                 IA Provider Interface                     │
│  (contrato unificado para todos los proveedores)          │
│                                                           │
│  + execute(env, promptName, input, tracking) → Result    │
│  + transformPrompt(promptJSON) → ProviderRequest         │
│  + parseResponse(responseJSON) → string                  │
│  + classifyError(response) → ClassifiedError             │
└────────────────────────┬─────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │  Provider Router │
                │  getProvider()   │
                │  (lee IA_PROVIDER│
                │   desde KV)      │
                └──┬──┬──┬──┬──┬──┘
       ┌───────┬───┘  │  │  │  │  └───────┐
       ▼       ▼      ▼  ▼  ▼  ▼          ▼
   ┌──────┐ ┌──────┐ ┌────┐ ┌───┐ ┌─────┐ ┌────────┐
   │OpenAI│ │Gemini│ │Ant.│ │ZAI│ │Qwen │ │DeepSeek│
   │Provider│ │Prov. │ │Prov.│ │Pr.│ │Prov.│ │ Provider│
   └──────┘ └──────┘ └────┘ └───┘ └─────┘ └────────┘
```

### 4.2 Variable de Selección de Proveedor

**Variable de entorno (en KV `secretos-cbconsulting`):**

| Clave KV | Valores Válidos | Valor por Defecto | Descripción |
|----------|-----------------|-------------------|-------------|
| `IA_PROVIDER` | `openai`, `gemini`, `anthropic`, `zai`, `qwen`, `deepseek`, `simulacion` | `openai` | Proveedor de IA activo |

> **Nota:** El valor actual en Cloudflare secrets es `zaiProvider`. Debe normalizarse a `zai` para coherencia con el naming convention del registry.

**Uso en runtime:**
```typescript
const providerName = (await env.secrets_kv.get('IA_PROVIDER')) || 'openai'
const provider = getProvider(providerName)
return provider.execute(env, promptName, inputJson, tracking)
```

**Registry de proveedores:**
```typescript
const REGISTRY: Record<string, IAProvider> = {
  'openai': openaiProvider,
  'gemini': geminiProvider,
  'anthropic': anthropicProvider,
  'zai': zaiProvider,
  'qwen': qwenProvider,
  'deepseek': deepseekProvider,
  'simulacion': simulacionProvider,
}
```

### 4.3 Archivos a Modificar

#### 4.3.1 `apps/worker/src/lib/openai-client.ts` → **Renombrar a `ia-provider.ts`**

**Qué cambiar:**
- Renombrar el archivo a `apps/worker/src/lib/ia-provider.ts`
- Extraer la interfaz `IAProvider` (contrato unificado)
- Mover la implementación actual de OpenAI a `providers/openai-provider.ts`
- El archivo `ia-provider.ts` contendrá:
  - La interfaz `IAProvider`
  - El registry `getProvider(name: string): IAProvider`
  - Funciones compartidas (`extractTextFromOutput` genérico, clasificación de errores, `formatIAError`)
  - La función pública `executePrompt(env, promptName, inputJson, tracking)` que delega al proveedor seleccionado
  - Función `prepareInputJson(promptTemplate, inputJson)` para parsear y preparar el prompt

**Por qué:** Centraliza la selección de proveedor y define el contrato que todos deben cumplir.

#### 4.3.2 `apps/worker/src/services/ia-creacion-proyectos.ts`

**Qué cambiar:**
- Cambiar import de `'../lib/openai-client'` a `'../lib/ia-provider'`
- `executePrompt` se llama igual (misma firma)
- `formatOpenAIError` → `formatIAError`
- **Cambio mínimo:** Solo las líneas de import y el nombre de la función de error

**Por qué:** El servicio no necesita saber qué proveedor se usa.

#### 4.3.3 `apps/worker/src/services/ia-analisis-proyectos.ts`

**Qué cambiar:**
- Cambiar import de `'../lib/openai-client'` a `'../lib/ia-provider'`
- `callOpenAIResponses(apiKey, requestBody, tracking)` → `executePrompt(env, promptName, inputIJSON, tracking)`
  - Esta simplificación es una mejora: ya no se necesita pasar `apiKey` manualmente
- `formatOpenAIError` → `formatIAError`

**Por qué:** Abstracción total del proveedor. La nueva firma es más limpia.

#### 4.3.4 `apps/worker/src/types/analisis.ts`

**Qué cambiar:** **Ninguno.** Este archivo no interactúa con la IA directamente.

#### 4.3.5 `apps/worker/src/env.ts` (o equivalente)

**Qué cambiar:** Verificar que el tipo `Env` incluye `secrets_kv: KVNamespace` (ya debería estar así). No se requieren nuevos bindings — las API keys se leen dinámicamente del KV por nombre de clave.

### 4.4 Archivos a Crear

| Archivo | Propósito | Complejidad |
|---------|-----------|-------------|
| `apps/worker/src/lib/ia-provider.ts` | Interfaz `IAProvider`, registry `getProvider()`, wrapper `executePrompt()`, utilidades compartidas | Media |
| `apps/worker/src/lib/providers/openai-provider.ts` | Implementación OpenAI (extraída de `openai-client.ts`) | Baja (refactor) |
| `apps/worker/src/lib/providers/gemini-provider.ts` | Implementación Gemini API — transformación completa de request/response | Alta |
| `apps/worker/src/lib/providers/anthropic-provider.ts` | Implementación Anthropic Messages API — separar system, añadir max_tokens | Media |
| `apps/worker/src/lib/providers/zai-provider.ts` | Implementación Z.AI — Chat Completions compatible | Baja |
| `apps/worker/src/lib/providers/qwen-provider.ts` | Implementación Qwen/DashScope — Chat Completions compatible | Baja |
| `apps/worker/src/lib/providers/deepseek-provider.ts` | Implementación DeepSeek — Chat Completions compatible | Baja |
| `apps/worker/src/lib/providers/simulacion-provider.ts` | Wrapper del servicio `simulacion-ia.ts` existente | Baja |
| `apps/worker/src/lib/providers/index.ts` | Barrel export de todos los proveedores | Mínima |

### 4.5 Esquema de la Nueva Arquitectura

```
┌──────────────────────────────────────────────────┐
│              Servicios de IA                     │
│  ia-creacion-proyectos.ts                        │
│  ia-analisis-proyectos.ts                        │
│                                                    │
│  importan: executePrompt(), formatIAError()      │
│  (cero conocimiento del proveedor)                │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│              ia-provider.ts                      │
│                                                    │
│  export async function executePrompt(...) {       │
│    const name = await env.secrets_kv              │
│      .get('IA_PROVIDER') || 'openai'             │
│    const provider = getProvider(name)             │
│    return provider.execute(env, prompt, input)    │
│  }                                                │
│                                                    │
│  export function formatIAError(error) { ... }     │
│  function getProvider(name): IAProvider { ... }   │
│                                                    │
│  const REGISTRY = {                               │
│    'openai': openaiProvider,                      │
│    'gemini': geminiProvider,                      │
│    'anthropic': anthropicProvider,                │
│    'zai': zaiProvider,                            │
│    'qwen': qwenProvider,                          │
│    'deepseek': deepseekProvider,                  │
│    'simulacion': simulacionProvider,              │
│  }                                                │
└──┬──┬──┬──┬──┬──┬──┬─────────────────────────────┘
   │  │  │  │  │  │  │
   ▼  ▼  ▼  ▼  ▼  ▼  ▼
  O  G  A  Z  Q  D  S
  P  P  P  P  P  P  P
```

### 4.6 Cambios en Servicios Existentes

#### `ia-creacion-proyectos.ts`
```typescript
// ANTES:
import { executePrompt, formatOpenAIError } from '../lib/openai-client'
const result = await executePrompt(env, '00_CrearProyecto.json', ijson, tracking)

// DESPUÉS:
import { executePrompt, formatIAError } from '../lib/ia-provider'
const result = await executePrompt(env, '00_CrearProyecto.json', ijson, tracking)
// ← La llamada es IDÉNTICA — solo cambia el import y el nombre del formatter de error
```

#### `ia-analisis-proyectos.ts`
```typescript
// ANTES:
import { callOpenAIResponses, formatOpenAIError } from '../lib/openai-client'
const result = await callOpenAIResponses(apiKey, requestBody, tracking)

// DESPUÉS:
import { executePrompt, formatIAError } from '../lib/ia-provider'
const result = await executePrompt(env, promptFile, inputIJSON, tracking)
// ← Más limpio: env incluye KV + R2, no se pasa apiKey manualmente
```

### 4.7 Gestión de Secrets

| Secret | Almacenamiento | Sensible | Estado Cloudflare |
|--------|---------------|----------|-------------------|
| `OPENAI_API_KEY` | KV `secretos-cbconsulting` | Sí | ✅ Configurado |
| `GEMINI_API_KEY` | KV `secretos-cbconsulting` | Sí | ✅ Creado |
| `ANTHROPIC_API_KEY` | KV `secretos-cbconsulting` | Sí | ✅ Creado |
| `ZAI_API_KEY` | KV `secretos-cbconsulting` | Sí | ✅ Creado |
| `QWEN_API_KEY` | KV `secretos-cbconsulting` | Sí | ✅ Creado (pendiente confirmar valor) |
| `DEEPSEEK_API_KEY` | KV `secretos-cbconsulting` | Sí | ✅ Creado (pendiente confirmar valor) |
| `IA_PROVIDER` | KV `secretos-cbconsulting` | No | ✅ Creado (valor: `zaiProvider` → normalizar a `zai`) |

### 4.8 Compatibilidad con Tracking

El sistema de tracking (`apps/worker/src/lib/tracking.ts`) es **independiente del proveedor**. Cada provider añade el nombre del proveedor en los metadatos:

```typescript
registrarEvento(tracking, 'ia-inicio', 'INFO', 'Llamada a IA iniciada', {
  provider: 'gemini',
  prompt: promptName,
})
```

**Convención de nombres de eventos:** Se renombran de `openai-*` a `ia-*` para ser genéricos, manteniendo el `provider` en metadata para diferenciación.

| Evento anterior | Evento nuevo |
|-----------------|--------------|
| `openai-inicio` | `ia-inicio` (con `provider` en metadata) |
| `openai-obtener-api-key` | `ia-obtener-api-key` |
| `openai-cargar-prompt` | `ia-cargar-prompt` |
| `openai-preparar-request` | `ia-preparar-request` |
| `openai-llamar-api` | `ia-llamar-api` |
| `openai-completado` | `ia-completado` |
| `openai-http-error` | `ia-http-error` |

### 4.9 Extensibilidad para Futuros Proveedores

Para añadir un nuevo proveedor (ej. Mistral, Cohere, Groq):

1. Crear `apps/worker/src/lib/providers/mistral-provider.ts`
2. Implementar la interfaz `IAProvider`:
   ```typescript
   export const mistralProvider: IAProvider = {
     name: 'mistral',
     execute: async (env, promptName, inputJson, tracking) => { ... },
   }
   ```
3. Registrar en el registry de `ia-provider.ts`:
   ```typescript
   'mistral': mistralProvider,
   ```
4. Añadir `MISTRAL_API_KEY` al KV
5. Cambiar `IA_PROVIDER` a `mistral`

**Cero cambios en los servicios consumidores.**

### 4.10 Transformación de Prompts por Proveedor

**Problema:** Los prompts actuales están en formato OpenAI Responses API:
```json
{
  "model": "gpt-5",
  "instructions": "... texto largo del prompt ...",
  "input": [{
    "role": "user",
    "content": [{ "type": "input_text", "text": "%%ijson%%" }]
  }]
}
```

Cada proveedor necesita un formato diferente. La solución es una **función de transformación por proveedor**:

#### Grupo A — Sin transformación (OpenAI Responses API)
| Proveedor | Acción |
|-----------|--------|
| **OpenAI** | Usa el prompt directamente |

#### Grupo B — Responses → Chat Completions (transformación ligera)
| Proveedor | Endpoint | Transformación |
|-----------|----------|----------------|
| **Z.AI** | `/api/paas/v4/chat/completions` | `instructions` → `messages[{role: system}]`, `input` → `messages[{role: user}]` |
| **Qwen** | `/compatible-mode/v1/chat/completions` | Igual que Z.AI |
| **DeepSeek** | `/chat/completions` | Igual que Z.AI |

Transformación compartida (función `responsesToChatCompletions(prompt, modelOverride?)`):
```typescript
// Entrada (Responses API):
{ model: "gpt-5", instructions: "...", input: [{ role: "user", content: [...] }] }
// Salida (Chat Completions):
{ model: "glm-5.1", messages: [
  { role: "system", content: "..." },
  { role: "user", content: "..." }
]}
```

#### Grupo C — Transformación dedicada
| Proveedor | Endpoint | Transformación |
|-----------|----------|----------------|
| **Gemini** | `/v1beta/models/{m}:generateContent` | `instructions` → `systemInstruction`, `input` → `contents[{parts: [{text}]}]` |
| **Anthropic** | `/v1/messages` | `instructions` → `system`, `input` → `messages[]`, añadir `max_tokens` obligatorio |

**Estrategia de models:** El modelo se lee del prompt JSON (`promptTemplate.model`) pero se puede sobrescribir en cada provider:
```typescript
// zai-provider.ts
const MODEL_MAP: Record<string, string> = {
  'gpt-5': 'glm-5.1',
  'gpt-5.4': 'glm-5.1',
}
const providerModel = MODEL_MAP[promptModel] || promptModel
```

Esto permite que los prompts mantengan `gpt-5` como referencia y cada provider traduzca al modelo equivalente.

---

## 5. Resumen de Acciones Requeridas

### Fase 1: Core — Interfaz y Registry
| # | Acción | Archivos | Tipo |
|---|--------|----------|------|
| 1 | Crear interfaz `IAProvider` y tipos compartidos | `lib/ia-provider.ts` | Crear |
| 2 | Crear directorio `providers/` | `lib/providers/` | Crear |
| 3 | Crear barrel export | `lib/providers/index.ts` | Crear |

### Fase 2: Proveedor OpenAI (refactor del existente)
| # | Acción | Archivos | Tipo |
|---|--------|----------|------|
| 4 | Extraer implementación a provider dedicado | `lib/providers/openai-provider.ts` | Crear (de openai-client.ts) |
| 5 | Registrar en registry | `lib/ia-provider.ts` | Modificar |

### Fase 3: Proveedores Chat Completions (Z.AI, Qwen, DeepSeek)
| # | Acción | Archivos | Tipo |
|---|--------|----------|------|
| 6 | Crear función compartida `responsesToChatCompletions()` | `lib/providers/transformers.ts` | Crear |
| 7 | Implementar Z.AI provider | `lib/providers/zai-provider.ts` | Crear |
| 8 | Implementar Qwen provider | `lib/providers/qwen-provider.ts` | Crear |
| 9 | Implementar DeepSeek provider | `lib/providers/deepseek-provider.ts` | Crear |
| 10 | Registrar en registry | `lib/ia-provider.ts` | Modificar |

### Fase 4: Proveedores con transformación dedicada (Gemini, Anthropic)
| # | Acción | Archivos | Tipo |
|---|--------|----------|------|
| 11 | Implementar Gemini provider | `lib/providers/gemini-provider.ts` | Crear |
| 12 | Implementar Anthropic provider | `lib/providers/anthropic-provider.ts` | Crear |
| 13 | Registrar en registry | `lib/ia-provider.ts` | Modificar |

### Fase 5: Provider de simulación
| # | Acción | Archivos | Tipo |
|---|--------|----------|------|
| 14 | Crear wrapper de `simulacion-ia.ts` como provider | `lib/providers/simulacion-provider.ts` | Crear |
| 15 | Registrar en registry | `lib/ia-provider.ts` | Modificar |

### Fase 6: Adaptación de Servicios
| # | Acción | Archivos | Tipo |
|---|--------|----------|------|
| 16 | Actualizar imports en `ia-creacion-proyectos.ts` | `services/ia-creacion-proyectos.ts` | Modificar |
| 17 | Actualizar imports en `ia-analisis-proyectos.ts` | `services/ia-analisis-proyectos.ts` | Modificar |

### Fase 7: Normalización de secrets
| # | Acción | Detalle |
|---|--------|---------|
| 18 | Normalizar `IA_PROVIDER` | Cambiar valor de `zaiProvider` a `zai` en KV |
| 19 | Verificar valores de API keys | Confirmar que `QWEN_API_KEY` y `DEEPSEEK_API_KEY` tienen valor válido |

### Fase 8: Testing y Despliegue
| # | Acción | Descripción |
|---|--------|-------------|
| 20 | Type-check | `tsc --noEmit` |
| 21 | Test con cada proveedor | Verificar que un prompt simple funciona con cada uno |
| 22 | Deploy worker | `npm run deploy` |

---

## 6. Pendientes de Confirmación

1. **¿Se aprueba el diseño de provider interface + registry con 6 proveedores?**
2. **¿Se acepta la estrategia de transformación de prompts (3 grupos: nativo, chat-completions, dedicado)?**
3. **¿Se debe normalizar `IA_PROVIDER` de `zaiProvider` a `zai` en Cloudflare KV?**
4. **¿Se confirman los valores de `QWEN_API_KEY` y `DEEPSEEK_API_KEY` en Cloudflare secrets?**
5. **¿Se incluye el provider de simulación (`simulacion-ia.ts`) en el registry?**
6. **¿Se procede con la implementación tras aprobación?**

---

*Documento generado: 2026-04-08*
*Estado: Esperando autorización del usuario para ejecutar cambios*
