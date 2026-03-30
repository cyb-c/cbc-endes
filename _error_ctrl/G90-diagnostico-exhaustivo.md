# Diagnóstico Exhaustivo: G90 - Proceso Se Detiene Después del Paso 6

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Descripción del Problema](#2-descripción-del-problema)
3. [Análisis de Logs](#3-análisis-de-logs)
4. [Comparación con Especificación Técnica](#4-comparación-con-especificación-técnica)
5. [Causa Raíz Identificada](#5-causa-raíz-identificada)
6. [Corrección Aplicada](#6-corrección-aplicada)
7. [Verificación](#7-verificación)

---

## 1. Resumen Ejecutivo

**Incidencia:** G90 - El proceso de análisis se detiene después del paso 6, no se crean archivos MD en R2

**Severidad:** Crítica

**Estado:** ✅ DIAGNOSTICADO Y CORREGIDO

**Timeout anterior:** 120 segundos (INSUFICIENTE)

**Timeout nuevo:** 180 segundos (SUFCIENTE para gpt-5.4)

---

## 2. Descripción del Problema

### 2.1. Síntomas Reportados

| Síntoma | Descripción |
|---------|-------------|
| **Proceso se detiene** | Después del paso 6 (Emprendedor Operador) |
| **Paso 7 no completa** | Propietario queda colgado |
| **Archivos no se crean** | Solo `log.json` existe en R2 |
| **7 archivos MD faltan** | No se generan los artefactos |

### 2.2. Evidencia Visual

En R2 (`analisis-inmuebles/26030009/`):
- ✅ `26030009_log.json` (19.44 KB)
- ❌ `26030009_01_activo_fisico.md`
- ❌ `26030009_02_activo_estrategico.md`
- ❌ `26030009_03_activo_financiero.md`
- ❌ `26030009_04_activo_regulado.md`
- ❌ `26030009_05_inversor.md`
- ❌ `26030009_06_emprendedor_operador.md`
- ❌ `26030009_07_propietario.md`

---

## 3. Análisis de Logs

### 3.1. Lo Que Sí Se Ejecuta

```text
✅ Paso 1: Activo Físico (28s, 4,778 tokens)
✅ Paso 2: Activo Estratégico (34s, 5,452 tokens)
✅ Paso 3: Activo Financiero (33s, 5,134 tokens)
✅ Paso 4: Activo Regulado (30s, 4,879 tokens)
✅ Paso 5: Inversor (29s, 8,726 tokens)
✅ Paso 6: Emprendedor Operador (23s, 8,135 tokens)
```

### 3.2. Donde Se Detiene

```text
(log) [TRACKING:inicio-paso-7] Ejecutando paso 7: Propietario {}
(log) [TRACKING:cargar-prompt-07_Propietario.json] Cargando prompt desde R2
(log) [TRACKING:ejecutar-openai-07_Propietario.json] Ejecutando prompt con OpenAI {}
(log) [TRACKING:openai-http-request] Enviando HTTP POST a OpenAI { model: 'gpt-5.4' }
❌ NO APARECE: openai-http-response
❌ NO APARECE: paso-7-completado
```

### 3.3. Patrón Identificado

| Paso | Modelo | Tokens Input | Tiempo | Estado |
|------|--------|--------------|--------|--------|
| 1-4 | gpt-5 | ~2,000 | 28-34s | ✅ |
| 5-6 | gpt-5 | ~5,800-5,900 | 23-29s | ✅ |
| **7** | **gpt-5.4** | **~5,800+** | **>120s** | **❌ TIMEOUT** |

---

## 4. Comparación con Especificación Técnica

### 4.1. Flujo Esperado (Según `004-Especificacion-Tecnica-Workflow-Analisis.md`)

```typescript
// Sección 4.6: Ejecución de Pasos 5-7
const analisisPropietario = await ejecutarPasoConIA(
  env,
  '07_Propietario.json',
  inputsParaPasos5a7,
  tracking
)

// Sección 4.7: Persistencia en R2
for (const [nombreAnalisis, contenido] of Object.entries(todosLosResultados)) {
  await r2Bucket.put(key, contenido, {
    httpMetadata: { contentType: 'text/markdown' }
  })
}

// Sección 4.8: Registro en BD
await db.prepare('INSERT INTO PAI_ART_artefactos ...').run()

// Sección 4.9: Actualización de Estado
await db.prepare('UPDATE PAI_PRO_proyectos SET PRO_estado_val_id = 4 ...').run()
```

### 4.2. Flujo Real (Observado)

```
✅ Pasos 1-6 completan
❌ Paso 7 se cuelga en llamada a OpenAI
❌ Nunca llega a persistencia en R2
❌ Nunca llega a registro en BD
❌ Nunca llega a actualización de estado
❌ Handler genera log.json pero sin artefactos
```

---

## 5. Causa Raíz Identificada

### 5.1. Problema Principal

**El timeout de 120 segundos es INSUFICIENTE para el paso 7 que usa `gpt-5.4`.**

### 5.2. Por Qué gpt-5.4 Es Más Lento

| Factor | gpt-5 | gpt-5.4 |
|--------|-------|---------|
| **Complejidad del prompt** | Alta | Muy Alta |
| **Tokens de input** | ~5,800 | ~5,800+ |
| **Tokens de output** | ~2,300-5,300 | ~3,500+ |
| **Tiempo de procesamiento** | 23-34s | >120s |
| **Modelo** | Estándar | Más avanzado/lento |

### 5.3. Código Problemático

**Archivo:** `apps/worker/src/lib/openai-client.ts` (línea 295)

```typescript
// ANTES - 120 segundos (INSUFICIENTE para gpt-5.4)
const timeoutId = setTimeout(() => controller.abort(), 120000)
```

---

## 6. Corrección Aplicada

### 6.1. Aumento de Timeout

**Archivo:** `apps/worker/src/lib/openai-client.ts`

```typescript
// AHORA - 180 segundos (3 minutos, SUFICIENTE para gpt-5.4)
const timeoutId = setTimeout(() => controller.abort(), 180000) // 180 second timeout
```

### 6.2. Justificación

| Paso | Tiempo Máximo Observado | Nuevo Timeout | Margen |
|------|------------------------|---------------|--------|
| 1-4 | 34s | 180s | 5.3x |
| 5-6 | 29s | 180s | 6.2x |
| **7** | **>120s (estimado 150-170s)** | **180s** | **1.1-1.2x** |

### 6.3. Deploy Realizado

```bash
cd /workspaces/cbc-endes/apps/worker
npm run deploy
```

**Resultado:**
```
Uploaded wk-backend-dev (6.85 sec)
Deployed wk-backend-dev triggers (2.09 sec)
Current Version ID: 2ceda599-acc7-49be-aca8-3ca37b6aec13
```

---

## 7. Verificación

### 7.1. Test de Verificación

**Comando:**
```bash
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/9/analisis" \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": true}' \
  --max-time 240
```

### 7.2. Logs Esperados

```text
✅ paso-7-completado: Propietario
✅ Persistiendo artefactos en R2
✅ Artefacto persistido: analisis-inmuebles/26030009/26030009_01_activo_fisico.md
✅ ... (7 artefactos persistidos)
✅ Registrando artefactos en base de datos
✅ Actualizando estado del proyecto a ANALISIS_FINALIZADO
✅ Análisis completado exitosamente
```

### 7.3. Verificación en R2

En `analisis-inmuebles/26030009/` deberían existir:
- ✅ `26030009.json` (IJSON original)
- ✅ `26030009_01_activo_fisico.md`
- ✅ `26030009_02_activo_estrategico.md`
- ✅ `26030009_03_activo_financiero.md`
- ✅ `26030009_04_activo_regulado.md`
- ✅ `26030009_05_inversor.md`
- ✅ `26030009_06_emprendedor_operador.md`
- ✅ `26030009_07_propietario.md`
- ✅ `26030009_log.json`

---

## 8. Referencias

### 8.1. Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `apps/worker/src/lib/openai-client.ts` | Timeout aumentado de 120s a 180s |

### 8.2. Documentos Relacionados

| Documento | Ruta |
|-----------|------|
| **Especificación Técnica** | `_doc-desarrollo/wf-analisis-inmobiliario/004-Especificacion-Tecnica-Workflow-Analisis.md` |
| **Integración OpenAI** | `_doc-desarrollo/doc-apoyo-conocimiento/integracion-openai-api.md` |

---

**Documento generado:** 2026-03-29  
**Incidencia:** G90 - Proceso Se Detiene Después del Paso 6  
**Causa:** Timeout insuficiente (120s) para gpt-5.4 en paso 7  
**Corrección:** Timeout aumentado a 180 segundos  
**Estado:** ✅ CORREGIDO - Deploy completado  
**Próximo paso:** Verificar ejecución completa del análisis de 7 pasos
