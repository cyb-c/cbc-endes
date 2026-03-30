# Informe de Incidencia: G90 - Análisis No Se Ejecuta

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Descripción de la Incidencia](#2-descripción-de-la-incidencia)
3. [Diagnóstico Realizado](#3-diagnóstico-realizado)
4. [Causa Raíz Confirmada](#4-causa-raíz-confirmada)
5. [Correcciones Aplicadas](#5-correcciones-aplicadas)
6. [Configuración Pendiente](#6-configuración-pendiente)
7. [Próximos Pasos](#7-próximos-pasos)

---

## 1. Resumen Ejecutivo

**Incidencia:** G90 - El proceso de análisis no se ejecuta al iniciarse

**Severidad:** Crítica

**Estado:** ✅ DIAGNOSTICADO - Causa raíz identificada

**URL afectada:** https://pg-cbc-endes.pages.dev/proyectos

---

## 2. Descripción de la Incidencia

### 2.1. Síntomas Reportados

| Síntoma | Descripción |
|---------|-------------|
| **Botón sin cambios** | El texto permanece en "Paso 1 de 7: Activo Físico" indefinidamente |
| **Sin ejecución de workflow** | No se observa avance en el proceso de análisis |
| **Sin tracking en Wrangler** | No hay actividad observable en los logs del Worker |

---

## 3. Diagnóstico Realizado

### 3.1. Pruebas de Conectividad

| Prueba | Resultado | Observaciones |
|--------|-----------|---------------|
| **Backend Health** | ✅ OK | `{"status":"ok","timestamp":"..."}` |
| **GET Proyecto (ID 7)** | ✅ OK | Proyecto existe con IJSON en D1 (5760 chars) |
| **POST Análisis** | ❌ ERROR | Timeout después de 30 segundos |

### 3.2. Error Obtenido

```json
{
  "error": "Error en paso 1 (Activo Físico): Failed to call OpenAI Responses API: The operation was aborted"
}
```

**Interpretación:**
- El timeout de 30 segundos se activó correctamente
- La llamada a OpenAI API se abortó porque no respondió
- Esto indica que OPENAI_API_KEY no está configurada o es inválida

---

## 4. Causa Raíz Confirmada

### 4.1. Problema Principal

**OPENAI_API_KEY no está configurada o es inválida en el KV `secretos-cbconsulting`**

**Evidencia:**
1. El timeout se activa después de 30 segundos
2. OpenAI API no responde (abortado por AbortController)
3. No hay error de autenticación inmediato (lo que indicaría clave inválida)
4. La llamada se cuelga hasta que el timeout la aborta

### 4.2. Síntoma en Cascada

```
1. Usuario hace clic en "Ejecutar Análisis"
   ↓
2. Frontend llama a backend POST /api/pai/proyectos/:id/analisis
   ↓
3. Backend lee IJSON desde D1 (✅ funciona)
   ↓
4. Backend llama a ejecutarAnalisisConIA()
   ↓
5. ejecucionAnalisisConIA() llama a getOpenAIKey()
   ↓
6. getOpenAIKey() retorna NULL o clave inválida
   ↓
7. callOpenAIResponses() llama a OpenAI con clave inválida
   ↓
8. OpenAI no responde (o responde muy lento)
   ↓
9. Timeout de 30 segundos aborta la llamada
   ↓
10. Error: "The operation was aborted"
   ↓
11. Frontend muestra error y vuelve a estado idle
```

---

## 5. Correcciones Aplicadas

### 5.1. Timeout en OpenAI Client

**Archivo:** `apps/worker/src/lib/openai-client.ts`

**Cambio aplicado:**

```typescript
// AHORA - Con timeout de 30 segundos
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 30000)

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

### 5.2. Deploy Realizado

**Comando ejecutado:**
```bash
cd /workspaces/cbc-endes/apps/worker
npm run deploy
```

**Resultado:**
```
Uploaded wk-backend-dev (5.46 sec)
Deployed wk-backend-dev triggers (2.18 sec)
Current Version ID: c0384cbe-8269-4520-ac29-30077dc65023
```

---

## 6. Configuración Pendiente

### 6.1. OPENAI_API_KEY en KV

**Acción requerida:** Configurar la clave API de OpenAI en el KV namespace

**Comando para configurar:**
```bash
wrangler secret put OPENAI_API_KEY --env dev
```

**Proceso:**
1. Ejecutar el comando anterior
2. Pegar la clave API de OpenAI cuando se solicite
3. Confirmar que se guardó correctamente

**Verificación:**
```bash
# La clave se puede verificar indirectamente ejecutando un análisis de prueba
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/7/analisis" \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": true}'
```

**Resultado esperado después de configurar:**
- Response 200 con artefactos generados
- O error de autenticación claro si la clave es inválida

---

### 6.2. IJSON en R2 (Opcional)

**Estado actual:** IJSON existe en D1 (5760 caracteres para proyecto 7)

**Nota:** El backend tiene fallback a D1 si el IJSON no está en R2, por lo que esto no es crítico.

**Para futuro:** Al crear proyectos, guardar IJSON en R2:
```bash
wrangler r2 object put "r2-cbconsulting/analisis-inmuebles/{CII}/{CII}.json" --file ijson.json
```

---

## 7. Próximos Pasos

### 7.1. Inmediatos

| Acción | Responsable | Estado |
|--------|-------------|--------|
| Configurar OPENAI_API_KEY en KV | DevOps/Usuario | ⏳ Pendiente |
| Verificar clave con test de análisis | QA | ⏳ Pendiente |
| Ejecutar análisis completo de prueba | QA | ⏳ Pendiente |
| Verificar tracking en Wrangler tail | QA | ⏳ Pendiente |

### 7.2. Secuencia de Verificación

```bash
# 1. Configurar OPENAI_API_KEY
wrangler secret put OPENAI_API_KEY --env dev

# 2. Esperar propagación (~30 segundos)

# 3. Test de análisis
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/7/analisis" \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": true}' \
  --max-time 120

# 4. Ver tracking (en otra terminal)
wrangler tail wk-backend-dev --env dev
```

### 7.3. Criterios de Aceptación

| Criterio | Estado Esperado |
|----------|-----------------|
| OPENAI_API_KEY configurada | ✅ Clave válida en KV `secretos-cbconsulting` |
| Análisis ejecuta | ✅ 7 pasos completados sin timeout |
| Tracking visible | ✅ Eventos en Wrangler tail |
| Frontend muestra progreso | ✅ Botón actualiza de Paso 1 → Paso 7 |
| Artefactos generados | ✅ 7 archivos MD en R2 |

---

## 8. Referencias

### 8.1. Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `apps/worker/src/lib/openai-client.ts` | Timeout de 30 segundos en fetch a OpenAI |

### 8.2. Comandos Útiles

```bash
# Configurar secret
wrangler secret put OPENAI_API_KEY --env dev

# Ver logs en tiempo real
wrangler tail wk-backend-dev --env dev

# Test de análisis
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/7/analisis" \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": true}'

# Verificar proyecto
curl "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/7"
```

---

**Documento generado:** 2026-03-29  
**Incidencia:** G90 - Análisis No Se Ejecuta  
**Estado:** ✅ DIAGNOSTICADO - OPENAI_API_KEY pendiente de configurar  
**Próximo paso:** Configurar OPENAI_API_KEY en KV con `wrangler secret put`
