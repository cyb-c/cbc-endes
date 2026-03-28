# Especificación Técnica: Workflow de Alta de Proyectos PAI

## Índice de Contenido

1. [Información del Documento](#información-del-documento)
2. [Resumen Ejecutivo](#resumen-ejecutivo)
3. [Arquitectura de Solución](#arquitectura-de-solución)
4. [Diseño de Componentes](#diseño-de-componentes)
5. [Contratos de API](#contratos-de-api)
6. [Esquema de Datos](#esquema-de-datos)
7. [Diseño del Workflow](#diseño-del-workflow)
8. [Integración con OpenAI](#integración-con-openai)
9. [Manejo de Errores](#manejo-de-errores)
10. [Seguridad y Secrets](#seguridad-y-secrets)
11. [Límites y Consideraciones de Rendimiento](#límites-y-consideraciones-de-rendimiento)
12. [Observabilidad y Logging](#observabilidad-y-logging)
13. [Pruebas y Validación](#pruebas-y-validación)
14. [Despliegue y Configuración](#despliegue-y-configuración)

---

## Información del Documento

| Campo | Valor |
|-------|-------|
| **Título** | Especificación Técnica: Workflow de Alta de Proyectos PAI |
| **Versión** | 1.0 |
| **Fecha** | 2026-03-28 |
| **Estado** | Pendiente de aprobación |
| **Referencia** | Concept Brief v1.0 (aprobado 2026-03-28) |
| **Elaborado por** | Agente Cloudflare Deploy |

---

## Resumen Ejecutivo

Esta especificación técnica define la implementación del **workflow de alta de proyectos PAI** en Cloudflare, utilizando **Cloudflare Workflows** para orquestar el proceso y **OpenAI API** para el procesamiento de IJSON.

### Decisiones Arquitectónicas Clave

| Decisión | Justificación |
|----------|---------------|
| **Cloudflare Workflows** | Orquestación durable con reintentos automáticos y wall time ilimitado |
| **OpenAI API directa** | Mayor potencia (GPT-4), sin dependencia de Workers AI |
| **Módulo compartido `openai-client`** | Reutilización entre Workers y Workflows (según `cf-funcion-open-ai-api.md`) |
| **Prompts en R2** | Actualización sin redeploy |
| **CII formato `AA MM NNNN`** | Estándar documentado del proyecto |

---

## Arquitectura de Solución

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Pages)                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  /proyectos/crear                                               │   │
│  │  └─ Formulario IJSON → POST /api/pai/proyectos                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (wk-backend Worker)                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Endpoint: POST /api/pai/proyectos                             │   │
│  │  └─ Valida IJSON → Inicia Workflow                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Cloudflare Workflows (wf-alta-proyectos-pai)               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Step 1: Validar IJSON                                         │   │
│  │  Step 2: Guardar temporal en R2                                │   │
│  │  Step 3: Leer prompt desde R2 (prompts-ia/00_CrearProyecto.json)│   │
│  │  Step 4: Ejecutar OpenAI API (con reintentos)                  │   │
│  │  Step 5: Validar Resultado-JSON                                │   │
│  │  Step 6: Crear registro en D1 (PAI_PRO_proyectos)              │   │
│  │  Step 7: Generar CII (AA MM NNNN)                              │   │
│  │  Step 8: Actualizar PRO_cii en D1                              │   │
│  │  Step 9: Crear carpeta en R2 (analisis-inmuebles/{CII}/)       │   │
│  │  Step 10: Mover JSON a carpeta CII                             │   │
│  │  Step 11: Retornar URL de edición                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Recursos Cloudflare                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │  D1              │  │  R2              │  │  OpenAI API      │     │
│  │  db-cbconsulting │  │  r2-cbconsulting │  │  (externo)       │     │
│  │  - PAI_PRO_...   │  │  - prompts-ia/   │  │  - gpt-4o-mini   │     │
│  │  - PAI_VAL_...   │  │  - analisis-.../ │  │                  │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Capas de la Solución

| Capa | Componente | Responsabilidad |
|------|------------|-----------------|
| **1. Frontend** | `CrearProyecto.tsx` | Formulario de alta |
| **2. API Gateway** | `wk-backend` | Recepción y validación inicial |
| **3. Orquestación** | `wf-alta-proyectos-pai` | Coordinación de pasos |
| **4. Servicios** | `openai-client.ts` | Integración con OpenAI |
| **5. Persistencia** | D1 + R2 | Base de datos + archivos |

---

## Diseño de Componentes

### 2.1 Frontend: Formulario de Alta

**Archivo**: `apps/frontend/src/pages/proyectos/CrearProyecto.tsx` (ya existe)

**Responsabilidades**:
- Mostrar campo de texto para IJSON
- Validar que el campo no esté vacío
- Enviar POST a `/api/pai/proyectos`
- Mostrar estado "Ejecutando..." durante el proceso
- Redirigir a `/proyectos/{id}` tras éxito
- Mostrar error en formulario si falla antes de crear

**Endpoint consumido**:
```typescript
POST /api/pai/proyectos
Content-Type: application/json

{
  "ijson": "..."
}
```

---

### 2.2 Backend: Endpoint de Recepción

**Archivo**: `apps/worker/src/handlers/pai-proyectos.ts` (modificar `handleCrearProyecto`)

**Responsabilidades**:
- Validar que el body contenga `ijson`
- Validar que `ijson` sea JSON válido
- Iniciar Workflow y pasar el IJSON
- Retornar ID de ejecución del Workflow
- Manejar errores de inicio del Workflow

**Código base**:
```typescript
// apps/worker/src/handlers/pai-proyectos.ts
export async function handleCrearProyecto(c: AppContext): Promise<Response> {
  const db = getDB(c.env);
  const workflows = c.env.wf_alta_proyectos_pai; // Binding del Workflow

  try {
    const body = await c.req.json<{ ijson: string }>();
    const { ijson } = body;

    // Validación inicial
    if (!ijson || !ijson.trim()) {
      return c.json({ error: 'El IJSON es obligatorio' }, 400);
    }

    // Validar formato JSON
    try {
      JSON.parse(ijson);
    } catch {
      return c.json({ error: 'El IJSON no es un JSON válido' }, 400);
    }

    // Iniciar Workflow
    const workflow = await workflows.create({
      params: { ijson }
    });

    return c.json({ 
      workflow_id: workflow.id,
      message: 'Proyecto en creación'
    }, 202);

  } catch (error) {
    console.error('Error al iniciar workflow:', error);
    return c.json({ error: 'Error interno del servidor' }, 500);
  }
}
```

---

### 2.3 Módulo Compartido: OpenAI Client

**Archivo**: `apps/worker/src/shared/llm/openai-client.ts` (nuevo)

**Justificación**: Según `cf-funcion-open-ai-api.md`, se recomienda un módulo compartido agnóstico del contexto (Worker vs Workflow).

**Responsabilidades**:
- Construir payloads para OpenAI Responses API
- Ejecutar llamadas a OpenAI
- Normalizar respuestas
- Clasificar errores
- Soportar streaming (futuro)

**Interfaz**:
```typescript
// apps/worker/src/shared/llm/openai-client.ts

export interface PromptRequest {
  model: string;
  instructions?: string;
  input: string | Array<unknown>;
  temperature?: number;
  maxOutputTokens?: number;
  metadata?: Record<string, string>;
}

export interface PromptResult {
  text: string;
  raw: unknown;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface OpenAIClientDeps {
  apiKey: string;
  baseURL?: string;
  fetchImpl?: typeof fetch;
}

/**
 * Ejecuta un prompt contra OpenAI Responses API
 * Función compartida entre Workers y Workflows
 */
export async function executePrompt(
  deps: OpenAIClientDeps,
  req: PromptRequest,
): Promise<PromptResult> {
  const { 
    apiKey, 
    baseURL = 'https://api.openai.com/v1',
    fetchImpl = fetch 
  } = deps;

  const response = await fetchImpl(`${baseURL}/responses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: req.model,
      instructions: req.instructions,
      input: req.input,
      temperature: req.temperature ?? 0.7,
      max_output_tokens: req.maxOutputTokens ?? 4096,
    }),
  });

  if (!response.ok) {
    throw await classifyOpenAIError(response);
  }

  const data = await response.json();
  
  return {
    text: data.output?.[0]?.content?.[0]?.text ?? '',
    raw: data,
    usage: data.usage ? {
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
      totalTokens: data.usage.total_tokens,
    } : undefined,
  };
}

/**
 * Clasifica errores de OpenAI para manejo apropiado
 */
export async function classifyOpenAIError(response: Response): Promise<OpenAIError> {
  const status = response.status;
  const body = await response.json().catch(() => ({}));

  if (status === 429) {
    return new OpenAIError('RATE_LIMIT', 'Too many requests', { retryAfter: response.headers.get('Retry-After') });
  }
  if (status >= 500) {
    return new OpenAIError('SERVER_ERROR', `OpenAI server error: ${status}`, { retryable: true });
  }
  if (status === 400) {
    return new OpenAIError('INVALID_REQUEST', `Invalid request: ${body.error?.message ?? 'Unknown'}`);
  }
  if (status === 401) {
    return new OpenAIError('AUTH_ERROR', 'Invalid API key');
  }

  return new OpenAIError('UNKNOWN', `OpenAI error: ${status}`);
}

export class OpenAIError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}
```

---

### 2.4 Workflow: Orquestación de Pasos

**Archivo**: `apps/worker/src/workflows/alta-proyectos-pai.ts` (nuevo)

**Responsabilidades**:
- Coordinar los 11 pasos del workflow
- Manejar reintentos automáticos
- Persistir estado entre pasos
- Manejar errores por paso

**Implementación**:
```typescript
// apps/worker/src/workflows/alta-proyectos-pai.ts

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { executePrompt, OpenAIError } from '../shared/llm/openai-client';

interface AltaProyectosParams {
  ijson: string;
}

interface AltaProyectosResult {
  proyectoId: number;
  cii: string;
  redirectUrl: string;
}

export class altaProyectosPai extends WorkflowEntrypoint<Env, AltaProyectosParams> {
  async run(event: WorkflowEvent<AltaProyectosParams>, step: WorkflowStep) {
    const { ijson } = event.payload;
    
    // Step 1: Validar IJSON (ya validado en endpoint, pero verificamos de nuevo)
    const parsedIjson = await step.do('Validar IJSON', async () => {
      try {
        return JSON.parse(ijson);
      } catch {
        throw new Error('IJSON inválido');
      }
    });

    // Step 2: Guardar temporal en R2
    const tempKey = await step.do('Guardar IJSON temporal en R2', async () => {
      const tempKey = `temp/${Date.now()}-${crypto.randomUUID()}.json`;
      await this.env.r2_binding_01.put(tempKey, ijson);
      return tempKey;
    });

    // Step 3: Leer prompt desde R2
    const promptConfig = await step.do('Leer prompt desde R2', async () => {
      const promptObject = await this.env.r2_binding_01.get('prompts-ia/00_CrearProyecto.json');
      if (!promptObject) {
        throw new Error('Prompt no encontrado en prompts-ia/00_CrearProyecto.json');
      }
      return JSON.parse(await promptObject.text());
    });

    // Step 4: Ejecutar OpenAI API (con reintentos automáticos de Workflow)
    const resultadoIA = await step.do('Ejecutar OpenAI API', { retries: { limit: 3 } }, async () => {
      const result = await executePrompt(
        { apiKey: this.env.OPENAI_API_KEY },
        {
          model: this.env.OPENAI_MODEL ?? 'gpt-4o-mini',
          instructions: promptConfig.instructions,
          input: JSON.stringify(parsedIjson),
          temperature: 0.3, // Bajo para resultados más deterministas
          maxOutputTokens: 2048,
        }
      );
      
      // El resultado debería ser JSON estructurado
      try {
        return JSON.parse(result.text);
      } catch {
        throw new Error('OpenAI no devolvió JSON válido');
      }
    });

    // Step 5: Validar Resultado-JSON
    const datosProyecto = await step.do('Validar Resultado-JSON', async () => {
      const camposRequeridos = ['titulo_anuncio', 'tipo_inmueble', 'precio', 'ciudad'];
      for (const campo of camposRequeridos) {
        if (!resultadoIA[campo]) {
          throw new Error(`Campo requerido faltante: ${campo}`);
        }
      }
      return resultadoIA;
    });

    // Step 6: Crear registro en D1
    const proyectoId = await step.do('Crear registro en PAI_PRO_proyectos', async () => {
      // Obtener estado VAL_id para 'CREADO'
      const estadoCreado = await this.env.db_binding_01
        .prepare(`
          SELECT VAL_id FROM PAI_VAL_valores v
          JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
          WHERE a.ATR_codigo = 'ESTADO_PROYECTO' AND v.VAL_codigo = 'CREADO'
        `)
        .first();

      if (!estadoCreado) {
        throw new Error('Estado CREADO no encontrado en PAI_VAL_valores');
      }

      // Insertar proyecto
      const result = await this.env.db_binding_01
        .prepare(`
          INSERT INTO PAI_PRO_proyectos (
            PRO_cii, PRO_titulo, PRO_estado_val_id,
            PRO_portal_nombre, PRO_portal_url, PRO_operacion,
            PRO_tipo_inmueble, PRO_precio, PRO_superficie_construida_m2,
            PRO_ciudad, PRO_barrio_distrito, PRO_direccion, PRO_ijson
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          '', // CII se actualiza después
          datosProyecto.titulo_anuncio,
          estadoCreado.VAL_id,
          datosProyecto.portal_nombre ?? 'Desconocido',
          datosProyecto.url_anuncio ?? '',
          datosProyecto.operacion ?? 'venta',
          datosProyecto.tipo_inmueble,
          datosProyecto.precio,
          datosProyecto.superficie_construida_m2 ?? '0',
          datosProyecto.ciudad,
          datosProyecto.barrio_distrito ?? null,
          datosProyecto.direccion ?? null,
          ijson // Guardar IJSON original
        )
        .run();

      return result.meta.last_row_id as number;
    });

    // Step 7: Generar CII (AA MM NNNN)
    const cii = await step.do('Generar CII', async () => {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const idNum = proyectoId.toString().padStart(4, '0');
      return `${year}${month}${idNum}`;
    });

    // Step 8: Actualizar PRO_cii en D1
    await step.do('Actualizar PRO_cii en D1', async () => {
      await this.env.db_binding_01
        .prepare('UPDATE PAI_PRO_proyectos SET PRO_cii = ? WHERE PRO_id = ?')
        .bind(cii, proyectoId)
        .run();
    });

    // Step 9: Crear carpeta en R2
    await step.do('Crear carpeta en R2', async () => {
      // R2 no tiene carpetas reales, pero creamos un objeto "placeholder"
      await this.env.r2_binding_01.put(`analisis-inmuebles/${cii}/.gitkeep`, '');
    });

    // Step 10: Mover JSON a carpeta CII
    await step.do('Mover IJSON a carpeta CII', async () => {
      // Leer temporal
      const tempObject = await this.env.r2_binding_01.get(tempKey);
      if (!tempObject) {
        throw new Error('IJSON temporal no encontrado');
      }
      
      // Guardar en carpeta definitiva
      const ciiJsonKey = `analisis-inmuebles/${cii}/${cii}.json`;
      await this.env.r2_binding_01.put(ciiJsonKey, await tempObject.blob());
      
      // Eliminar temporal
      await this.env.r2_binding_01.delete(tempKey);
    });

    // Step 11: Retornar resultado
    return {
      proyectoId,
      cii,
      redirectUrl: `/proyectos/${proyectoId}`,
    } as AltaProyectosResult;
  }
}
```

---

## Contratos de API

### Endpoint: POST /api/pai/proyectos

**Request**:
```http
POST /api/pai/proyectos
Content-Type: application/json

{
  "ijson": "{\"titulo_anuncio\": \"...\", ...}"
}
```

**Response 202 (Workflow iniciado)**:
```json
{
  "workflow_id": "abc123",
  "message": "Proyecto en creación"
}
```

**Response 400 (Validación fallida)**:
```json
{
  "error": "El IJSON no es un JSON válido"
}
```

**Response 500 (Error interno)**:
```json
{
  "error": "Error interno del servidor"
}
```

### Workflow: Resultado Esperado

**Success**:
```json
{
  "proyectoId": 42,
  "cii": "26030042",
  "redirectUrl": "/proyectos/42"
}
```

**Error (antes de crear)**:
```json
{
  "error": "OpenAI no devolvió JSON válido",
  "step": "Ejecutar OpenAI API"
}
```

---

## Esquema de Datos

### Tablas D1 Utilizadas

#### PAI_PRO_proyectos

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `PRO_id` | INTEGER | NO | Primary key, autoincrement |
| `PRO_cii` | TEXT | NO | Código de Identificación (AA MM NNNN) |
| `PRO_titulo` | TEXT | NO | Título del proyecto |
| `PRO_estado_val_id` | INTEGER | NO | FK a PAI_VAL_valores (CREADO) |
| `PRO_ijson` | TEXT | NO | IJSON original |
| `PRO_portal_nombre` | TEXT | YES | Portal inmobiliario |
| `PRO_portal_url` | TEXT | YES | URL del anuncio |
| `PRO_operacion` | TEXT | YES | 'venta' o 'alquiler' |
| `PRO_tipo_inmueble` | TEXT | YES | Tipo de inmueble |
| `PRO_precio` | TEXT | YES | Precio |
| `PRO_superficie_construida_m2` | TEXT | YES | Superficie |
| `PRO_ciudad` | TEXT | YES | Ciudad |
| `PRO_barrio_distrito` | TEXT | YES | Barrio |
| `PRO_direccion` | TEXT | YES | Dirección |
| `PRO_fecha_alta` | TEXT | NO | DEFAULT datetime('now') |
| `PRO_fecha_ultima_actualizacion` | TEXT | NO | DEFAULT datetime('now') |

#### PAI_VAL_valores (consulta para estado)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `VAL_id` | INTEGER | Primary key |
| `VAL_atr_id` | INTEGER | FK a PAI_ATR_atributos |
| `VAL_codigo` | TEXT | 'CREADO' |
| `VAL_nombre` | TEXT | 'creado' |

---

## Diseño del Workflow

### Diagrama de Pasos

```
┌─────────────────────────────────────────────────────────────────────┐
│ Workflow: wf-alta-proyectos-pai                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Start]                                                            │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 1: Validar IJSON         │                                │
│  │ - JSON.parse()                │                                │
│  │ - Si falla → Error 400        │                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 2: Guardar temporal R2   │                                │
│  │ - temp/{timestamp}-{uuid}.json│                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 3: Leer prompt desde R2  │                                │
│  │ - prompts-ia/00_CrearProyecto.│                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 4: Ejecutar OpenAI API   │ (retries: 3)                    │
│  │ - executePrompt()             │                                │
│  │ - Si falla → Reintentar       │                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 5: Validar Resultado-JSON│                                │
│  │ - Campos requeridos           │                                │
│  │ - Si falta → Error            │                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 6: Crear registro D1     │                                │
│  │ - PAI_PRO_proyectos           │                                │
│  │ - PRO_estado_val_id = CREADO  │                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 7: Generar CII           │                                │
│  │ - AA MM NNNN                  │                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 8: Actualizar PRO_cii    │                                │
│  │ - UPDATE PAI_PRO_proyectos    │                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 9: Crear carpeta R2      │                                │
│  │ - analisis-inmuebles/{CII}/   │                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 10: Mover JSON a CII     │                                │
│  │ - temp/ → analisis-inmuebles/ │                                │
│  │ - Renombrar a {CII}.json      │                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  ┌─────────────────────────────────┐                                │
│  │ Step 11: Retornar resultado   │                                │
│  │ - proyectoId, cii, redirectUrl│                                │
│  └─────────────────────────────────┘                                │
│     │                                                               │
│     ▼                                                               │
│  [End]                                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Configuración de Reintentos

| Step | Reintentos | Justificación |
|------|------------|---------------|
| Validar IJSON | 0 | Error de usuario, no reintentar |
| Guardar temporal R2 | 3 | Fallo transitorio de R2 |
| Leer prompt R2 | 3 | Fallo transitorio de R2 |
| Ejecutar OpenAI API | 3 | Rate limits, timeouts de red |
| Validar Resultado-JSON | 0 | Error de IA, no reintentar |
| Crear registro D1 | 3 | Fallo transitorio de D1 |
| Generar CII | 0 | Operación local determinista |
| Actualizar PRO_cii | 3 | Fallo transitorio de D1 |
| Crear carpeta R2 | 3 | Fallo transitorio de R2 |
| Mover JSON | 3 | Fallo transitorio de R2 |
| Retornar resultado | 0 | Operación local |

---

## Integración con OpenAI

### Prompt: 00_CrearProyecto.json

**Ubicación**: `r2-cbconsulting/prompts-ia/00_CrearProyecto.json`

**Estructura** (basada en `13_Propietario.json`):
```json
{
  "model": "gpt-4o-mini",
  "instructions": "Eres un analista de datos inmobiliarios. Extrae la información estructurada del IJSON proporcionado. Devuelve ÚNICAMENTE JSON válido con la siguiente estructura:\n\n{\n  \"titulo_anuncio\": \"string\",\n  \"tipo_inmueble\": \"string\",\n  \"operacion\": \"venta|alquiler\",\n  \"precio\": \"string\",\n  \"superficie_construida_m2\": \"string\",\n  \"ciudad\": \"string\",\n  \"provincia\": \"string (opcional)\",\n  \"barrio_distrito\": \"string (opcional)\",\n  \"direccion\": \"string (opcional)\",\n  \"portal_nombre\": \"string (opcional)\",\n  \"url_anuncio\": \"string (opcional)\"\n}\n\nSi algún campo no está disponible, usa null. NO inventes datos.",
  "input": "%%ijson%%",
  "temperature": 0.3,
  "maxOutputTokens": 2048,
  "responseFormat": { "type": "json_object" }
}
```

### Parámetros de OpenAI

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| **Modelo** | `gpt-4o-mini` | Balance costo/rendimiento |
| **Temperature** | 0.3 | Bajo para resultados deterministas |
| **maxOutputTokens** | 2048 | Suficiente para JSON estructurado |
| **responseFormat** | `json_object` | Forzar respuesta JSON |

---

## Manejo de Errores

### Clasificación de Errores

| Tipo | Código | Acción | Mensaje al Usuario |
|------|--------|--------|-------------------|
| **IJSON inválido** | 400 | No crear proyecto | "El IJSON no es un JSON válido" |
| **Prompt no encontrado** | 500 | No crear proyecto | "Error de configuración del sistema" |
| **OpenAI API error** | 500 | Reintentar (3x) → Si falla, no crear | "Error al procesar el IJSON. Inténtalo de nuevo." |
| **Resultado-JSON inválido** | 500 | No crear proyecto | "No se pudo extraer información del IJSON" |
| **D1 error** | 500 | Reintentar (3x) → Si falla, no crear | "Error al guardar el proyecto" |
| **R2 error** | 500 | Reintentar (3x) → Si falla, no crear | "Error al guardar archivos" |
| **Workflow timeout** | 504 | No crear proyecto | "El proceso tardó demasiado. Inténtalo de nuevo." |

### Errores Antes vs Después de Crear

| Momento | Comportamiento |
|---------|---------------|
| **Antes de Step 6** (crear registro) | Mostrar error en formulario de alta |
| **Después de Step 6** | Proyecto creado = éxito. Errores posteriores se loguean pero no se muestran. Redirigir a edición. |

---

## Seguridad y Secrets

### Secrets Requeridos

| Secret | Tipo | Sensible | Configuración |
|--------|------|----------|---------------|
| `OPENAI_API_KEY` | Workflow binding | ✅ Sí | `wrangler secret put OPENAI_API_KEY --env production` |

### Variables de Entorno

| Variable | Tipo | Sensible | Valor por defecto |
|----------|------|----------|-------------------|
| `OPENAI_MODEL` | Workflow var | ❌ No | `gpt-4o-mini` |
| `PROMPTS_IA_PATH` | Workflow var | ❌ No | `prompts-ia/` |
| `R2_ANALISIS_PATH` | Workflow var | ❌ No | `analisis-inmuebles/` |

### Bindings Requeridos

| Binding | Tipo | Recurso |
|---------|------|---------|
| `db_binding_01` | D1 | `db-cbconsulting` |
| `r2_binding_01` | R2 | `r2-cbconsulting` |
| `wf_alta_proyectos_pai` | Workflow | `wf-alta-proyectos-pai` |

---

## Límites y Consideraciones de Rendimiento

### Límites de Capa Gratuita

| Recurso | Límite | Impacto en Workflow |
|---------|--------|---------------------|
| **Workflows** | 100.000 ejecuciones/día | Suficiente para ~3.000 proyectos/mes |
| **Workflows** | 10 ms CPU/step | Wall time ilimitado, CPU solo para cómputo activo |
| **Workflows** | 100 instancias concurrentes | Suficiente para carga normal |
| **Workflows** | 1000 steps/workflow | Usamos 11 steps, margen amplio |
| **D1** | 5M rows read/día | Suficiente para lecturas |
| **D1** | 100K rows written/día | Suficiente para escrituras |
| **R2** | 10 GB-month storage | ~10.000 proyectos con IJSON de 100KB c/u |
| **R2** | 1M ops Class A/mes | Suficiente para escrituras |

### Optimizaciones

1. **Minimizar steps**: 11 steps es razonable, no dividir más
2. **Batch operations**: Agrupar lecturas/escrituras cuando sea posible
3. **Cleanup temporal**: Eliminar archivos temporales en Step 10
4. **Timeout de OpenAI**: Configurar timeout de 30s para llamadas a OpenAI

---

## Observabilidad y Logging

### Pipeline Events

Registrar cada paso en `pipeline_eventos`:

| Evento | Paso | Nivel | Detalle |
|--------|------|-------|---------|
| `recepcion_ijson` | Step 1 | INFO | IJSON recibido y validado |
| `guardado_temporal_r2` | Step 2 | INFO | IJSON guardado en temporal |
| `lectura_prompt_r2` | Step 3 | INFO | Prompt leído desde R2 |
| `ejecucion_openai` | Step 4 | INFO | OpenAI API ejecutada |
| `resultado_json_valido` | Step 5 | INFO | Resultado-JSON validado |
| `creacion_proyecto` | Step 6 | INFO | Proyecto creado en D1 |
| `generacion_cii` | Step 7 | INFO | CII generado |
| `actualizacion_cii` | Step 8 | INFO | PRO_cii actualizado |
| `creacion_carpeta_r2` | Step 9 | INFO | Carpeta R2 creada |
| `movimiento_json` | Step 10 | INFO | IJSON movido a carpeta definitiva |
| `workflow_completado` | Step 11 | INFO | Workflow completado exitosamente |

### Logs de Error

| Error | Nivel | Acción |
|-------|-------|--------|
| IJSON inválido | WARNING | Loguear, no crear proyecto |
| OpenAI error | ERROR | Reintentar, si falla loguear |
| D1 error | ERROR | Reintentar, si falla loguear |
| R2 error | ERROR | Reintentar, si falla loguear |

---

## Pruebas y Validación

### Casos de Prueba

| ID | Caso | Entrada Esperada | Resultado Esperado |
|----|------|------------------|-------------------|
| **TC-001** | IJSON válido completo | IJSON con todos los campos | Proyecto creado, redirección a edición |
| **TC-002** | IJSON válido parcial | IJSON con campos mínimos | Proyecto creado, campos opcionales null |
| **TC-003** | IJSON inválido (no JSON) | `"texto plano"` | Error 400, mensaje en formulario |
| **TC-004** | IJSON vacío | `{}` | Error 400, campo requerido faltante |
| **TC-005** | OpenAI timeout | IJSON válido, OpenAI lento | Reintentos (3x), si falla error |
| **TC-006** | D1 unavailable | IJSON válido, D1 caído | Reintentos, error si persiste |
| **TC-007** | R2 unavailable | IJSON válido, R2 caído | Reintentos, error si persiste |
| **TC-008** | Prompt no encontrado | IJSON válido, prompt borrado | Error 500, configuración |

### Pruebas de Carga

| Escenario | Concurrentes | Duración | Resultado Esperado |
|-----------|--------------|----------|-------------------|
| **Carga normal** | 10 workflows | 1 minuto | Todos completan |
| **Carga media** | 50 workflows | 5 minutos | Todos completan |
| **Carga alta** | 100 workflows | 10 minutos | Máximo concurrentes alcanzado, cola |

---

## Despliegue y Configuración

### Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `apps/worker/src/workflows/alta-proyectos-pai.ts` | Crear | Workflow de alta |
| `apps/worker/src/shared/llm/openai-client.ts` | Crear | Cliente OpenAI compartido |
| `apps/worker/src/handlers/pai-proyectos.ts` | Modificar | Endpoint de creación |
| `apps/worker/wrangler.toml` | Modificar | Bindings de Workflow |
| `prompts-ia/00_CrearProyecto.json` | Crear (en R2) | Prompt de IA |

### wrangler.toml

```toml
# apps/worker/wrangler.toml

name = "wk-backend"
main = "src/index.ts"
compatibility_date = "2026-03-26"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "db_binding_01"
database_name = "db-cbconsulting"
database_id = "fafcd5e2-b960-49f7-8502-88a0f8ba5052"
migrations_dir = "../../migrations"

[[r2_buckets]]
binding = "r2_binding_01"
bucket_name = "r2-cbconsulting"

# Workflow binding
[[workflows]]
name = "wf-alta-proyectos-pai"
binding = "wf_alta_proyectos_pai"
class_name = "altaProyectosPai"

[env.production]
name = "wk-backend-production"

[[env.production.d1_databases]]
binding = "db_binding_01"
database_name = "db-cbconsulting"
database_id = "fafcd5e2-b960-49f7-8502-88a0f8ba5052"

[[env.production.r2_buckets]]
binding = "r2_binding_01"
bucket_name = "r2-cbconsulting"

[[env.production.workflows]]
name = "wf-alta-proyectos-pai"
binding = "wf_alta_proyectos_pai"
class_name = "altaProyectosPai"
```

### Comandos de Despliegue

```bash
# 1. Configurar secret
cd /workspaces/cbc-endes/apps/worker
npx wrangler secret put OPENAI_API_KEY

# 2. Subir prompt a R2
npx wrangler r2 object put prompts-ia/00_CrearProyecto.json --file prompts-ia/00_CrearProyecto.json

# 3. Deploy del worker
npx wrangler deploy

# 4. Verificar workflow
npx wrangler workflows list
```

---

## Anexos

### A. Referencias a Documentos

| Documento | Ruta | Propósito |
|-----------|------|-----------|
| **Concept Brief** | `_doc-desarrollo/fase01/01-concept-brief-workflow-alta-pai.md` | Definición de alto nivel |
| **CONCEPTO** | `_doc-desarrollo/fase01/Definición del workflow de alta de proyectos PAI en Cloudflare.md` | Definición original |
| **CII** | `plans/proyecto-PIA/doc-base/Sistema-Identificacion-Almacenamiento-Inmueble.md` | Algoritmo de CII |
| **Límites Cloudflare** | `_doc-desarrollo/fase01/cf-limites-cloudflare-gratuito.md` | Límites Free tier |
| **Workflows** | `_doc-desarrollo/fase01/cf-wk-wf.md` | Patrones de Workflows |
| **OpenAI Function** | `_doc-desarrollo/fase01/cf-funcion-open-ai-api.md` | Decisión de módulo compartido |
| **Ejemplo Prompt** | `_doc-desarrollo/fase01/13_Propietario.json` | Estructura de prompt |

### B. Glosario

| Término | Definición |
|---------|------------|
| **IJSON** | Inmueble JSON: formato de datos de entrada |
| **CII** | Código de Identificación de Inmueble (AA MM NNNN) |
| **PAI** | Proyectos de Análisis Inmobiliario |
| **Workflow** | Cloudflare Workflows: orquestación durable |
| **Step** | Paso individual dentro de un Workflow |
| **Wall time** | Tiempo total de ejecución (incluye esperas) |
| **CPU time** | Tiempo de cómputo activo (excluye I/O) |

---

**Estado del Documento**: Pendiente de aprobación

**Próximo Paso**: Aprobación de usuario → Actualización de inventario (vía `inventariador`) → Implementación
