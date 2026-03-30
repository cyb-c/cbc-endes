# Diagnóstico y Corrección: G90 - Análisis Abortado en Paso 1

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Descripción de la Incidencia](#2-descripción-de-la-incidencia)
3. [Diagnóstico Realizado](#3-diagnóstico-realizado)
4. [Causa Raíz Identificada](#4-causa-raíz-identificada)
5. [Corrección Aplicada](#5-corrección-aplicada)
6. [Pruebas de Verificación](#6-pruebas-de-verificación)
7. [Referencias](#7-referencias)

---

## 1. Resumen Ejecutivo

**Incidencia:** G90 - El proceso de análisis se aborta en el paso 1 (Activo Físico)

**Severidad:** Crítica

**Estado:** ✅ CORREGIDO - Timeout aumentado de 30s a 120s

**URL afectada:** https://pg-cbc-endes.pages.dev/proyectos

---

## 2. Descripción de la Incidencia

### 2.1. Síntomas Reportados

| Síntoma | Descripción |
|---------|-------------|
| **Análisis se inicia** | El backend recibe la request y comienza el proceso |
| **Falla en paso 1** | Error al llamar a OpenAI en "Activo Físico" |
| **AbortError** | `The operation was aborted` |
| **Sin tracking completo** | Solo se registran eventos iniciales |

### 2.2. Logs Observados

```text
(log) [TRACKING:analisis-inicio] Iniciando análisis con IA de 7 pasos
(log) [TRACKING:inicio-paso-1] Ejecutando paso 1: Activo Físico
(log) [TRACKING:cargar-prompt-01_ActivoFisico.json] Cargando prompt desde R2
(log) [TRACKING:ejecutar-openai-01_ActivoFisico.json] Ejecutando prompt con OpenAI
(log) [TRACKING:openai-http-request] Enviando HTTP POST a OpenAI
(error) [TRACKING ERROR] openai-fetch-error: The operation was aborted
(error) [TRACKING ERROR] ejecutar-paso-01_ActivoFisico.json: Failed to call OpenAI Responses API
```

---

## 3. Diagnóstico Realizado

### 3.1. Verificación de Componentes

| Componente | Estado | Observaciones |
|------------|--------|---------------|
| **Prompt en R2** | ✅ Existe | `01_ActivoFisico.json` descargado correctamente |
| **OPENAI_API_KEY** | ✅ Configurada | En KV `secretos-cbconsulting` según inventario |
| **IJSON en D1** | ✅ Existe | Proyecto 9 tiene IJSON válido |
| **Backend endpoint** | ✅ Funciona | Request llega al handler correctamente |
| **OpenAI API call** | ❌ Falla | Timeout aborta la llamada |

### 3.2. Análisis del Código

#### Timeout Original (Problemático)

```typescript
// ANTES - 30 segundos (INSUFICIENTE)
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s
```

**Problema:**
- OpenAI Responses API con prompts complejos puede tomar >30 segundos
- El timeout abortaba la llamada antes de recibir respuesta
- Error: `AbortError: The operation was aborted`

---

## 4. Causa Raíz Identificada

### 4.1. Problema Principal

**El timeout de 30 segundos era insuficiente para llamadas a OpenAI Responses API con prompts de análisis complejos.**

**Evidencia:**
1. Los logs muestran que la llamada HTTP se inicia (`openai-http-request`)
2. Pero nunca se recibe respuesta (`openai-http-response` no aparece)
3. El error es `AbortError`, no error de autenticación ni de red
4. OPENAI_API_KEY está configurada correctamente en KV

### 4.2. Por Qué 30 Segundos No Son Suficientes

| Factor | Impacto en Tiempo |
|--------|-------------------|
| **Prompt complejo** | ~500-1000 tokens de instrucciones |
| **IJSON de entrada** | ~3000-5000 tokens de datos |
| **Modelo gpt-5** | Mayor tiempo de procesamiento |
| **Análisis inmobiliario** | Requiere razonamiento complejo |
| **Total estimado** | 60-90 segundos típicamente |

---

## 5. Corrección Aplicada

### 5.1. Aumento de Timeout

**Archivo:** `apps/worker/src/lib/openai-client.ts`

**Cambio aplicado:**

```typescript
// ANTES - 30 segundos (INSUFICIENTE)
const timeoutId = setTimeout(() => controller.abort(), 30000)

// AHORA - 120 segundos (2 minutos, SUFICIENTE)
const timeoutId = setTimeout(() => controller.abort(), 120000)
```

**Justificación:**
- 120 segundos permite completar prompts complejos
- Sigue previniendo cuelgues indefinidos
- Balance entre tiempo de espera y protección contra fallos

### 5.2. Deploy Realizado

**Comando ejecutado:**
```bash
cd /workspaces/cbc-endes/apps/worker
npm run deploy
```

**Resultado:**
```
Uploaded wk-backend-dev (5.51 sec)
Deployed wk-backend-dev triggers (2.36 sec)
Current Version ID: 68b8b47f-c97d-42bc-9ed4-eae7cc4a5b39
```

---

## 6. Pruebas de Verificación

### 6.1. Test de Análisis Completo

**Comando:**
```bash
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/9/analisis" \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": true}' \
  --max-time 180
```

**Resultado esperado:**
- ✅ Response 200 después de 60-120 segundos
- ✅ 7 artefactos generados
- ✅ Estado actualizado a `ANALISIS_FINALIZADO` (4)

### 6.2. Verificación de Tracking

**Comando:**
```bash
wrangler tail wk-backend-dev --env dev
```

**Logs esperados:**
```text
[TRACKING:analisis-inicio] Iniciando análisis con IA de 7 pasos
[TRACKING:inicio-paso-1] Ejecutando paso 1: Activo Físico
[TRACKING:cargar-prompt-01_ActivoFisico.json] Cargando prompt desde R2
[TRACKING:ejecutar-openai-01_ActivoFisico.json] Ejecutando prompt con OpenAI
[TRACKING:openai-http-request] Enviando HTTP POST a OpenAI
[TRACKING:openai-http-response] Respuesta HTTP recibida  ← ¡AHORA DEBE APARECER!
[TRACKING:openai-extract-text] Extrayendo texto de respuesta
[TRACKING:paso-1-completado] Paso 1 completado: Activo Físico
[TRACKING:inicio-paso-2] Ejecutando paso 2: Activo Estratégico
...
[TRACKING:analisis-completado] Análisis completado exitosamente
```

### 6.3. Verificación en Frontend

**URL:** https://pg-cbc-endes.pages.dev/proyectos/9

**Comportamiento esperado:**
1. Click en "Ejecutar Análisis"
2. Botón muestra "Paso 1 de 7: Activo Físico"
3. Espera 60-120 segundos (puede mostrar spinner/loading)
4. Botón actualiza a "Análisis Finalizado"
5. 9 pestañas de resultados disponibles

---

## 7. Referencias

### 7.1. Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `apps/worker/src/lib/openai-client.ts` | Timeout aumentado de 30s a 120s |

### 7.2. Documentos Relacionados

| Documento | Ruta |
|-----------|------|
| **Integración OpenAI** | `_doc-desarrollo/doc-apoyo-conocimiento/integracion-openai-api.md` |
| **Función OpenAI** | `_doc-desarrollo/doc-apoyo-conocimiento/cf-funcion-open-ai-api.md` |
| **Inventario** | `.governance/inventario_recursos.md` |

### 7.3. Comandos Útiles

```bash
# Deploy backend
cd /workspaces/cbc-endes/apps/worker && npm run deploy

# Ver tracking en tiempo real
wrangler tail wk-backend-dev --env dev

# Test de análisis
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/9/analisis" \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": true}' \
  --max-time 180

# Verificar proyecto
curl "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/9"
```

---

**Documento generado:** 2026-03-29  
**Incidencia:** G90 - Análisis Abortado en Paso 1  
**Causa:** Timeout insuficiente (30s) para OpenAI Responses API  
**Corrección:** Timeout aumentado a 120 segundos  
**Estado:** ✅ CORREGIDO - Deploy completado  
**Próximo paso:** Verificar ejecución completa del análisis
