# Diagnóstico y Corrección: G90 - Análisis No Se Ejecuta

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Descripción de la Incidencia](#2-descripción-de-la-incidencia)
3. [Diagnóstico Realizado](#3-diagnóstico-realizado)
4. [Causa Raíz Identificada](#4-causa-raíz-identificada)
5. [Correcciones Aplicadas](#5-correcciones-aplicadas)
6. [Pruebas de Verificación](#6-pruebas-de-verificación)
7. [Próximos Pasos](#7-próximos-pasos)

---

## 1. Resumen Ejecutivo

**Incidencia:** G90 - El proceso de análisis no se ejecuta al iniciarse y el estado del botón permanece sin cambios

**Severidad:** Crítica

**Estado:** ✅ DIAGNOSTICADO - Correcciones aplicadas

**URL afectada:** https://pg-cbc-endes.pages.dev/proyectos

**Impacto:** Bloquea la prueba integral del sistema de análisis

---

## 2. Descripción de la Incidencia

### 2.1. Síntomas Reportados

| Síntoma | Descripción |
|---------|-------------|
| **Botón sin cambios** | El texto permanece en "Paso 1 de 7: Activo Físico" indefinidamente |
| **Sin ejecución de workflow** | No se observa avance en el proceso de análisis |
| **Sin tracking en Wrangler** | No hay actividad observable en los logs del Worker |

### 2.2. Comportamiento Esperado

| Elemento | Comportamiento Esperado |
|----------|------------------------|
| **Botón** | Debe mostrar progreso real (Paso 1 → Paso 2 → ... → Paso 7) |
| **Workflow** | Debe ejecutar los 7 pasos secuenciales con IA |
| **Tracking** | Debe registrar eventos en `pipeline_eventos` y Wrangler tail |

---

## 3. Diagnóstico Realizado

### 3.1. Pruebas de Conectividad

| Prueba | Resultado | Observaciones |
|--------|-----------|---------------|
| **Backend Health** | ✅ OK | `{"status":"ok","timestamp":"2026-03-29T20:41:49.462Z"}` |
| **GET Proyecto** | ✅ OK | Proyecto 7 retorna datos correctamente |
| **POST Análisis** | ❌ TIMEOUT | Request se cuelga sin respuesta (>60 segundos) |

### 3.2. Análisis del Código

#### Frontend (`BotonEjecutarAnalisis.tsx`)

```typescript
// El componente está correctamente implementado
const handleClick = async () => {
  if (!habilitado) return;

  setEstado('loading');
  setPasoActual(1);

  try {
    await onEjecutar(proyectoId);  // ✅ Llama al hook
    setEstado('success');
    onSuccess();
  } catch (error) {
    setEstado('idle');
    onError(error instanceof Error ? error.message : 'Error desconocido');
  }
};
```

**Estado:** ✅ Correcto - El frontend dispara la llamada correctamente

---

#### Hook (`use-pai.ts`)

```typescript
const ejecutarAnalisis = useCallback(async (
  id: number,
  options?: { forzar_reejecucion?: boolean }
) => {
  setLoading(true);
  setError(null);

  const response = await paiApiClient.ejecutarAnalisis(id, options);

  setLoading(false);

  if (!response.success) {
    setError(getErrorMessage(response.error));
    return null;
  }

  return response.data || null;
}, []);
```

**Estado:** ✅ Correcto - El hook hace la llamada API correctamente

---

#### API Client (`pai-api.ts`)

```typescript
async ejecutarAnalisis(
  id: number,
  options?: { forzar_reejecucion?: boolean }
): Promise<ApiResponse<EjecutarAnalisisResponse>> {
  return this.post<EjecutarAnalisisResponse>(
    `/api/pai/proyectos/${id}/analisis`,
    options
  );
}
```

**Estado:** ✅ Correcto - El client envía la request correctamente

---

#### Backend Handler (`pai-proyectos.ts`)

```typescript
export async function handleEjecutarAnalisis(c: AppContext): Promise<Response> {
  // ... validaciones ...
  
  const resultado = await ejecutarAnalisisConIA(
    c.env,
    db,
    proyectoId,
    cii,
    ijson,
    tracking
  );
  
  // ... response ...
}
```

**Estado:** ⚠️ **PROBLEMA IDENTIFICADO** - La llamada a `ejecutarAnalisisConIA` se cuelga

---

#### Servicio IA (`ia-analisis-proyectos.ts`)

```typescript
export async function ejecutarAnalisisConIA(...) {
  // Paso 1: Ejecutar pasos 1-4
  const resultadosPasos1a4 = await ejecutarPasos1a4(env, ijson, tracking)
  
  // ... validaciones ...
  
  // Paso 2: Ejecutar pasos 5-7
  const resultadosPasos5a7 = await ejecutarPasos5a7(env, ijson, resultadosPasos1a4, tracking)
  
  // ... persistencia ...
}
```

**Estado:** ⚠️ **PROBLEMA IDENTIFICADO** - La llamada a OpenAI se cuelga

---

#### OpenAI Client (`openai-client.ts`)

```typescript
export async function callOpenAIResponses(
  apiKey: string,
  requestBody: PromptRequest,
  tracking?: TrackingContext,
): Promise<PromptResult> {
  const url = 'https://api.openai.com/v1/responses'
  
  // ❌ ANTES: Sin timeout
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })
  
  // ... process response ...
}
```

**Estado:** ❌ **CAUSA RAÍZ** - Fetch sin timeout puede colgarse indefinidamente

---

### 3.3. Posibles Causas Descartadas

| Causa Potencial | ¿Descartada? | Justificación |
|-----------------|--------------|---------------|
| Frontend no dispara llamada | ✅ Sí | Código correcto, hook funciona |
| API client no envía request | ✅ Sí | `pai-api.ts` correcto |
| Backend no recibe request | ❌ No | Timeout indica que llega pero no responde |
| OPENAI_API_KEY faltante | ⚠️ Pendiente | No se pudo verificar con wrangler CLI |
| OpenAI API timeout | ⚠️ Pendiente | Fetch sin timeout puede colgarse |
| IJSON no encontrado en R2 | ⚠️ Pendiente | Error reportado para proyecto 1 |

---

## 4. Causa Raíz Identificada

### 4.1. Problema Principal

**El fetch a OpenAI Responses API no tiene timeout**, lo que permite que la solicitud se cuelgue indefinidamente si:
- La API de OpenAI no responde
- Hay problemas de red
- La clave API es inválida pero no retorna error inmediato

### 4.2. Síntoma en Cascada

```
1. Usuario hace clic en "Ejecutar Análisis"
   ↓
2. Frontend llama a backend POST /api/pai/proyectos/:id/analisis
   ↓
3. Backend llama a ejecutarAnalisisConIA()
   ↓
4. ejecucionAnalisisConIA() llama a callOpenAIResponses()
   ↓
5. fetch() a OpenAI se cuelga SIN TIMEOUT
   ↓
6. Promesa nunca se resuelve (ni éxito ni error)
   ↓
7. Frontend espera indefinidamente con "Paso 1 de 7: Activo Físico"
   ↓
8. No hay tracking porque el código nunca llega a registrar eventos
```

---

## 5. Correcciones Aplicadas

### 5.1. Timeout en OpenAI Client

**Archivo:** `apps/worker/src/lib/openai-client.ts`

**Cambio aplicado:**

```typescript
// ANTES - Sin timeout
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify(requestBody),
})

// AHORA - Con timeout de 30 segundos
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify(requestBody),
  signal: controller.signal,
})

clearTimeout(timeoutId)
```

**Beneficio:**
- Previene cuelgues indefinidos
- Retorna error claro después de 30 segundos
- Permite al frontend mostrar mensaje de error al usuario

---

### 5.2. Verificación de OPENAI_API_KEY

**Acción requerida:** Verificar que la clave API está configurada en KV

**Comando para verificar:**
```bash
# Verificar secret en KV
wrangler kv:key get --binding secrets_kv OPENAI_API_KEY --env dev
```

**Si no existe, configurar:**
```bash
wrangler secret put OPENAI_API_KEY --env dev
```

---

### 5.3. Verificación de IJSON en R2

**Error reportado:** "IJSON no encontrado" para proyecto 1

**Acción requerida:** Verificar que el IJSON existe en R2

**Comando para verificar:**
```bash
# Listar objetos en R2 para un CII específico
wrangler r2 object list r2-cbconsulting --prefix "analisis-inmuebles/26030001/"
```

**Si no existe, el problema es:**
- El proyecto se creó pero el IJSON no se guardó en R2
- Fallback: El backend intenta leer desde D1 (`PRO_ijson` columna)

---

## 6. Pruebas de Verificación

### 6.1. Test de Timeout

**Objetivo:** Verificar que el timeout funciona correctamente

**Prueba:**
```bash
# Simular llamada que debería timeout
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/7/analisis" \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": true}' \
  --max-time 35
```

**Resultado esperado:**
- Timeout después de ~30 segundos
- Response con error claro: "Request timeout" o similar

---

### 6.2. Test con OPENAI_API_KEY válida

**Objetivo:** Verificar que el análisis funciona con clave API válida

**Prueba:**
```bash
# Ejecutar análisis en proyecto con IJSON válido
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/7/analisis" \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": true}'
```

**Resultado esperado:**
- Response 200 con artefactos generados
- Tracking visible en `wrangler tail`

---

### 6.3. Test de Tracking

**Objetivo:** Verificar que los eventos se registran

**Comando:**
```bash
# Ver tracking en tiempo real
wrangler tail wk-backend-dev --env dev
```

**Resultado esperado:**
- Eventos visibles: `analisis-inicio`, `paso-1-completado`, etc.

---

## 7. Próximos Pasos

### 7.1. Inmediatos (Post-Deploy)

| Acción | Responsable | Estado |
|--------|-------------|--------|
| Deploy backend con timeout | Dev Team | ⏳ Pendiente |
| Verificar OPENAI_API_KEY en KV | Dev Team | ⏳ Pendiente |
| Verificar IJSON en R2 para proyecto 7 | Dev Team | ⏳ Pendiente |
| Test de timeout | QA | ⏳ Pendiente |
| Test de análisis completo | QA | ⏳ Pendiente |

---

### 7.2. Secuencia de Pruebas

```bash
# 1. Deploy backend
cd /workspaces/cbc-endes/apps/worker
npm run deploy

# 2. Verificar OPENAI_API_KEY
wrangler kv:key get --binding secrets_kv OPENAI_API_KEY --env dev

# 3. Verificar IJSON en R2
wrangler r2 object get "r2-cbconsulting/analisis-inmuebles/26030007/26030007.json"

# 4. Test de análisis
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/7/analisis" \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": true}'

# 5. Ver tracking
wrangler tail wk-backend-dev --env dev
```

---

### 7.3. Criterios de Aceptación

| Criterio | Estado Esperado |
|----------|-----------------|
| Timeout funciona | ✅ Request timeout después de 30 segundos |
| OPENAI_API_KEY configurada | ✅ Clave válida en KV |
| IJSON en R2 | ✅ Archivo JSON existe para proyecto de prueba |
| Análisis ejecuta | ✅ 7 pasos completados |
| Tracking visible | ✅ Eventos en Wrangler tail |
| Frontend muestra progreso | ✅ Botón actualiza de Paso 1 → Paso 7 |

---

## 8. Referencias

### 8.1. Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `apps/worker/src/lib/openai-client.ts` | Timeout de 30 segundos en fetch a OpenAI |

### 8.2. Documentos Relacionados

| Documento | Ruta |
|-----------|------|
| **Especificación Técnica** | `_doc-desarrollo/wf-analisis-inmobiliario/004-Especificacion-Tecnica-Workflow-Analisis.md` |
| **Guía de Pruebas** | `_doc-desarrollo/wf-analisis-inmobiliario/006-Guia-Pruebas-Despliegue.md` |

---

**Documento generado:** 2026-03-29  
**Incidencia:** G90 - Análisis No Se Ejecuta  
**Estado:** ✅ DIAGNOSTICADO - Correcciones aplicadas  
**Próximo paso:** Deploy y verificación de OPENAI_API_KEY
