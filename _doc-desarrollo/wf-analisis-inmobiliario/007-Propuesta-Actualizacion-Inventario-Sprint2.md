# Propuesta de Actualización de Inventario - Sprint 2: Backend Core del Workflow

## Índice de Contenido

1. [Objetivo del Documento](#1-objetivo-del-documento)
2. [Criterio de Detección de Cambios](#2-criterio-de-detección-de-cambios)
3. [Resumen de Cambios del Sprint 2](#3-resumen-de-cambios-del-sprint-2)
4. [Archivos Nuevos](#4-archivos-nuevos)
5. [Archivos Modificados](#5-archivos-modificados)
6. [Recursos Cloudflare](#6-recursos-cloudflare)
7. [Configuraciones y Servicios](#7-configuraciones-y-servicios)
8. [Puntos Pendientes o No Verificables](#8-puntos-pendientes-o-no-verificables)
9. [Referencias](#9-referencias)

---

## 1. Objetivo del Documento

Este documento lista **todas las modificaciones, incorporaciones y actualizaciones** que deberían realizarse en `.governance/inventario_recursos.md` como consecuencia del trabajo realizado en el **Sprint 2: Implementación del Backend - Core del Workflow**.

**Importante:** Este documento es una **propuesta** para el agente `inventariador`. No modifica directamente el inventario.

---

## 2. Criterio de Detección de Cambios

Se han detectado cambios inventariables basándose en:

1. **Archivos nuevos creados** - Cualquier archivo nuevo que agregue funcionalidad
2. **Archivos modificados** - Cambios en handlers, servicios, librerías existentes
3. **Nuevos endpoints** - Endpoints que cambian su comportamiento
4. **Nuevos tipos de datos** - Tipos TypeScript que definen nueva funcionalidad
5. **Dependencias de recursos** - Uso de R2, D1, KV para nueva funcionalidad
6. **Cambios en contratos de servicio** - Modificaciones en request/response de APIs

---

## 3. Resumen de Cambios del Sprint 2

### 3.1. Visión General

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| **Archivos Nuevos** | 2 | `types/analisis.ts`, `services/ia-analisis-proyectos.ts` |
| **Archivos Modificados** | 2 | `handlers/pai-proyectos.ts`, `lib/openai-client.ts` |
| **Endpoints Modificados** | 1 | `POST /api/pai/proyectos/:id/analisis` |
| **Recursos Cloudflare** | 0 | Se usan recursos existentes (R2, D1, KV) |
| **Nuevos Prompts en R2** | 7 | `prompts-ia/01-07_*.json` (ya existen según ROADMAP) |

### 3.2. Impacto en Inventario

| Sección del Inventario | ¿Requiere Actualización? | Motivo |
|------------------------|--------------------------|--------|
| **4.1 Workers** | ⚠️ Sí (notas) | Nuevo endpoint con IA real |
| **4.2 KV Namespaces** | ❌ No | Se usa `secretos-cbconsulting` existente |
| **4.3 D1 Databases** | ❌ No | Se usa `db-cbconsulting` existente |
| **4.4 R2 Buckets** | ⚠️ Sí (notas) | Nuevos 7 prompts + estructura de artefactos |
| **8. Contratos entre Servicios** | ⚠️ Sí | Endpoint de análisis cambia comportamiento |
| **11. Archivos de Configuración** | ⚠️ Sí | Nuevos archivos de servicio y tipos |

---

## 4. Archivos Nuevos

### 4.1. `apps/worker/src/types/analisis.ts`

**Propósito:** Definición de tipos TypeScript para el workflow de análisis de 7 pasos

**Contenido:**
- `ESTADOS_PERMITIDOS_ANALISIS`: Constante con estados que permiten análisis (1, 2, 3, 4)
- `PASOS_ANALISIS`: Array de 7 pasos con número, clave, archivo y nombre
- `EjecutarPasoConIAResult`: Resultado de ejecutar un paso con IA
- `InputsParaPaso`: Inputs para pasos (IJSON para 1-4, IJSON+MD1-4 para 5-7)
- `EjecutarAnalisisConIAResult`: Resultado del análisis completo
- `MAPEO_ARCHIVOS`: Mapeo de clave de análisis a nombre de archivo MD
- `ERROR_CODES`: Códigos de error para el análisis
- `EVENTOS_ANALISIS`: Eventos para pipeline_eventos

**Motivo de actualización en inventario:**
- Nuevo archivo de tipos que define el contrato del workflow
- Documenta estructura de datos para 7 artefactos nuevos

**Ubicación en inventario:**
```markdown
**Archivos de Tipos Backend:**
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `apps/worker/src/types/analisis.ts` | Tipos para workflow de análisis de 7 pasos | ✅ Nuevo (Sprint 2) |
```

---

### 4.2. `apps/worker/src/services/ia-analisis-proyectos.ts`

**Propósito:** Servicio principal que ejecuta el workflow de 7 pasos con IA real

**Funciones exportadas:**
- `validarEstadoParaAnalisis()`: Valida si el estado permite análisis
- `ejecutarPasoConIA()`: Ejecuta un paso individual con OpenAI
- `ejecutarAnalisisConIA()`: Ejecuta los 7 pasos secuenciales
- `limpiarAnalisisAnterior()`: Limpia 7 MD anteriores para re-ejecución

**Recursos que usa:**
- **R2**: Lee prompts desde `prompts-ia/{01-07}_*.json`
- **R2**: Escribe 7 MD en `analisis-inmuebles/{CII}/{CII}_*.md`
- **D1**: Lee `PAI_PRO_proyectos`, escribe `PAI_ART_artefactos`, actualiza estado
- **KV**: Lee `OPENAI_API_KEY` desde `secretos-cbconsulting`
- **OpenAI Responses API**: Ejecuta prompts

**Motivo de actualización en inventario:**
- Nuevo servicio que reemplaza `simulacion-ia.ts` para análisis
- Implementa integración con OpenAI para 7 pasos secuenciales
- Genera 7 artefactos Markdown en R2

**Ubicación en inventario:**
```markdown
**Archivos de Servicios Backend:**
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `apps/worker/src/services/ia-analisis-proyectos.ts` | Servicio de análisis con IA real (7 pasos) | ✅ Nuevo (Sprint 2) |
| `apps/worker/src/services/ia-creacion-proyectos.ts` | Servicio de creación de proyectos con IA | ✅ Existente |
| `apps/worker/src/services/simulacion-ia.ts` | Servicio de análisis simulado | ⚠️ Obsoleto (Sprint 2) |
```

---

## 5. Archivos Modificados

### 5.1. `apps/worker/src/handlers/pai-proyectos.ts`

**Función modificada:** `handleEjecutarAnalisis()`

**Cambios principales:**
1. **Validación de estado**: Ahora valida `PRO_estado_val_id` ∈ (1, 2, 3, 4) antes de ejecutar
2. **Lectura de IJSON desde R2**: Lee desde `analisis-inmuebles/{CII}/{CII}.json` (fallback a D1)
3. **Limpieza de MD anteriores**: Elimina 7 MD anteriores si `forzar_reejecucion=true`
4. **Ejecución con IA real**: Llama a `ejecutarAnalisisConIA()` en lugar de `simulacion-ia.ts`
5. **Actualización de estado**: Actualiza a `ANALISIS_FINALIZADO` (4) tras éxito
6. **Generación de log.json**: Genera tracking log en R2

**Comportamiento anterior:**
- Usaba `simulacion-ia.ts` para generar 10 artefactos simulados
- No validaba estado del proyecto
- No leía IJSON desde R2

**Comportamiento nuevo:**
- Usa `ia-analisis-proyectos.ts` para 7 pasos con IA real
- Valida estado ∈ (1, 2, 3, 4)
- Lee IJSON desde R2 (fallback a D1)
- Limpia 7 MD anteriores antes de re-ejecutar
- Actualiza estado a ANALISIS_FINALIZADO

**Motivo de actualización en inventario:**
- Endpoint cambia comportamiento significativamente
- Nueva validación de estados
- Nueva dependencia de R2 para IJSON

**Ubicación en inventario:**
```markdown
**Endpoints del Worker:**
| Endpoint | Método | Descripción | Response | Estado |
|----------|--------|-------------|----------|--------|
| `/api/pai/proyectos/:id/analisis` | POST | Ejecutar análisis completo con IA real (7 pasos) | `{ proyecto: {...}, artefactos_generados: [...] }` | ⚠️ Modificado (Sprint 2: IA real) |
```

---

### 5.2. `apps/worker/src/lib/openai-client.ts`

**Función modificada:** `callOpenAIResponses()`

**Cambio:** Exportada como `export async function` (antes era privada)

**Motivo:** Necesaria para `ia-analisis-proyectos.ts`

**Motivo de actualización en inventario:**
- Función ahora es pública para uso por otros servicios

**Ubicación en inventario:**
```markdown
**Archivos de Librería Backend:**
| Archivo | Funciones Exportadas | Estado |
|---------|---------------------|--------|
| `apps/worker/src/lib/openai-client.ts` | `executePrompt()`, `callOpenAIResponses()`, `formatOpenAIError()` | ⚠️ Modificado (Sprint 2: exportación) |
```

---

## 6. Recursos Cloudflare

### 6.1. R2 - Nuevos Prompts

**Estado actual según inventario v16.0:**
```markdown
r2-cbconsulting/
├── analisis-inmuebles/{CII}/
│   ├── {CII}.json (IJSON original)
│   ├── {CII}_resumen-ejecutivo.md (Artefacto 1)
│   ├── {CII}_datos-transformados.md (Artefacto 2)
│   └── {CII}_log.json (Tracking)
└── prompts-ia/
    └── 00_CrearProyecto.json (Prompt existente)
```

**Nueva estructura (Sprint 2):**
```markdown
r2-cbconsulting/
├── analisis-inmuebles/{CII}/
│   ├── {CII}.json (IJSON original)
│   ├── {CII}_resumen-ejecutivo.md (Artefacto 1 - BD, no R2)
│   ├── {CII}_datos-transformados.md (Artefacto 2 - BD, no R2)
│   ├── {CII}_01_activo_fisico.md (Nuevo - Sprint 2)
│   ├── {CII}_02_activo_estrategico.md (Nuevo - Sprint 2)
│   ├── {CII}_03_activo_financiero.md (Nuevo - Sprint 2)
│   ├── {CII}_04_activo_regulado.md (Nuevo - Sprint 2)
│   ├── {CII}_05_inversor.md (Nuevo - Sprint 2)
│   ├── {CII}_06_emprendedor_operador.md (Nuevo - Sprint 2)
│   ├── {CII}_07_propietario.md (Nuevo - Sprint 2)
│   └── {CII}_log.json (Tracking)
└── prompts-ia/
    ├── 00_CrearProyecto.json (Existente)
    ├── 01_ActivoFisico.json (Nuevo - Sprint 2)
    ├── 02_ActivoEstrategico.json (Nuevo - Sprint 2)
    ├── 03_ActivoFinanciero.json (Nuevo - Sprint 2)
    ├── 04_ActivoRegulado.json (Nuevo - Sprint 2)
    ├── 05_Inversor.json (Nuevo - Sprint 2)
    ├── 06_EmprendedorOperador.json (Nuevo - Sprint 2)
    └── 07_Propietario.json (Nuevo - Sprint 2)
```

**Nota importante:** Según el ROADMAP (Sección 5 - Hechos H19), los 7 prompts (01-07) **ya existen en R2**. Este sprint solo implementa el backend que los consume.

**Motivo de actualización en inventario:**
- Documentar 7 prompts nuevos en `prompts-ia/`
- Documentar 7 nuevos tipos de artefactos MD en `analisis-inmuebles/{CII}/`
- Aclarar que artefactos 1 y 2 viven en BD, no en R2

---

### 6.2. D1 - Nuevos Tipos de Artefactos

**Tabla afectada:** `PAI_VAL_valores`

**Nuevos VAL_codigo para `ATR_codigo = 'TIPO_ARTEFACTO'`:**
- `ACTIVO_FISICO`
- `ACTIVO_ESTRATEGICO`
- `ACTIVO_FINANCIERO`
- `ACTIVO_REGULADO`
- `INVERSOR`
- `EMPRENDEDOR_OPERADOR`
- `PROPIETARIO`

**Nota:** Estos valores deben existir en `PAI_VAL_valores` para que el servicio pueda registrar los artefactos en `PAI_ART_artefactos`.

**Motivo de actualización en inventario:**
- Nuevos 7 tipos de artefactos en `PAI_VAL_valores`
- Artefactos se registran en `PAI_ART_artefactos`

---

## 7. Configuraciones y Servicios

### 7.1. Endpoint Modificado

**Endpoint:** `POST /api/pai/proyectos/:id/analisis`

**Request:**
```json
{
  "forzar_reejecucion": boolean  // Opcional, default false
}
```

**Response (200 - Éxito):**
```json
{
  "proyecto": {
    "id": number,
    "cii": string,
    "estado_id": 4,  // ANALISIS_FINALIZADO
    "estado": "Análisis Finalizado",
    "fecha_ultima_actualizacion": string
  },
  "artefactos_generados": [
    {
      "id": number,
      "tipo": string,
      "ruta_r2": string,
      "fecha_generacion": string
    }
  ]
}
```

**Response (403 - Estado inválido):**
```json
{
  "error": "El estado actual no permite ejecutar análisis. Estados permitidos: CREADO (1), PROCESANDO_ANALISIS (2), ANALISIS_CON_ERROR (3), ANALISIS_FINALIZADO (4).",
  "estado_id": number
}
```

**Response (500 - Error en análisis):**
```json
{
  "error": "Error en paso X (Nombre): mensaje de error"
}
```

**Motivo de actualización en inventario:**
- Endpoint cambia de simulación a IA real
- Nuevos códigos de error (403 por estado inválido)
- Response incluye 7 artefactos en lugar de 10 simulados

---

### 7.2. Estados del Proyecto

**Estados que permiten análisis (nuevo):**
| VAL_id | VAL_codigo | Descripción | ¿Permite Análisis? |
|--------|------------|-------------|-------------------|
| 1 | `CREADO` | Estado inicial | ✅ Sí |
| 2 | `PROCESANDO_ANALISIS` | En progreso | ✅ Sí (reintentar) |
| 3 | `ANALISIS_CON_ERROR` | Error anterior | ✅ Sí (reintentar) |
| 4 | `ANALISIS_FINALIZADO` | Finalizado | ✅ Sí (re-ejecutar) |
| 5 | `EVALUANDO_VIABILIDAD` | Evaluando viabilidad | ❌ No |
| 6 | `EVALUANDO_PLAN_NEGOCIO` | Evaluando plan | ❌ No |
| 7 | `SEGUIMIENTO_COMERCIAL` | Seguimiento | ❌ No |
| 8 | `DESCARTADO` | Descartado | ❌ No |

**Motivo de actualización en inventario:**
- Documentar regla de condicionalidad del botón "Ejecutar Análisis"
- Estados 1-4 permiten análisis, 5-8 no

---

## 8. Puntos Pendientes o No Verificables

### 8.1. Prompts en R2

**Estado:** ⚠️ **No verificado directamente**

**Según ROADMAP (Hecho H19):** Los 7 prompts (01-07) ya existen en `r2-cbconsulting/prompts-ia/`.

**Acción requerida:** Verificar existencia de prompts con:
```bash
npx wrangler r2 object get r2-cbconsulting/prompts-ia/01_ActivoFisico.json --remote
```

### 8.2. Tipos de Artefactos en D1

**Estado:** ⚠️ **No verificado directamente**

**Requerimiento:** Los 7 tipos de artefactos deben existir en `PAI_VAL_valores` con `ATR_codigo = 'TIPO_ARTEFACTO'`.

**Acción requerida:** Verificar con:
```bash
npx wrangler d1 execute db-cbconsulting --remote --command "
  SELECT v.VAL_id, v.VAL_codigo, v.VAL_nombre
  FROM PAI_VAL_valores v
  JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
  WHERE a.ATR_codigo = 'TIPO_ARTEFACTO'
    AND v.VAL_codigo IN (
      'ACTIVO_FISICO', 'ACTIVO_ESTRATEGICO', 'ACTIVO_FINANCIERO',
      'ACTIVO_REGULADO', 'INVERSOR', 'EMPRENDEDOR_OPERADOR', 'PROPIETARIO'
    )
"
```

### 8.3. Archivo IJSON en R2

**Estado:** ⚠️ **Depende del proceso de creación**

**Según especificación:** El IJSON debe guardarse en R2 (`analisis-inmuebles/{CII}/{CII}.json`) durante la creación del proyecto.

**Acción requerida:** Verificar que el servicio de creación (`ia-creacion-proyectos.ts`) guarda IJSON en R2, no solo en D1.

---

## 9. Referencias

### 9.1. Documentos del Proyecto

| Documento | Ruta |
|-----------|------|
| **Concept Brief (ROADMAP)** | `_doc-desarrollo/wf-analisis-inmobiliario/002-Concept-Brief-Workflow-Analisis-Inmobiliario-v2.md` |
| **Especificación Técnica** | `_doc-desarrollo/wf-analisis-inmobiliario/004-Especificacion-Tecnica-Workflow-Analisis.md` |
| **Inventario Actual (v16.0)** | `.governance/inventario_recursos.md` |

### 9.2. Archivos Implementados

| Archivo | Ruta |
|---------|------|
| **Tipos** | `apps/worker/src/types/analisis.ts` |
| **Servicio** | `apps/worker/src/services/ia-analisis-proyectos.ts` |
| **Handler** | `apps/worker/src/handlers/pai-proyectos.ts` |
| **Librería** | `apps/worker/src/lib/openai-client.ts` |

---

## 10. Resumen para Inventariador

### Cambios a Registrar

| Elemento | Acción | Detalle |
|----------|--------|---------|
| **Tipos** | Añadir | `apps/worker/src/types/analisis.ts` |
| **Servicio** | Añadir | `apps/worker/src/services/ia-analisis-proyectos.ts` |
| **Servicio** | Marcar obsoleto | `apps/worker/src/services/simulacion-ia.ts` (reemplazado) |
| **Handler** | Actualizar nota | `pai-proyectos.ts` - `handleEjecutarAnalisis()` ahora usa IA real |
| **Librería** | Actualizar | `openai-client.ts` - `callOpenAIResponses()` exportada |
| **R2 Prompts** | Añadir 7 | `prompts-ia/01-07_*.json` (ya existen según ROADMAP) |
| **R2 Artefactos** | Añadir 7 tipos | `analisis-inmuebles/{CII}/{CII}_01-07_*.md` |
| **D1 Valores** | Añadir 7 | `TIPO_ARTEFACTO` para 7 análisis |
| **Endpoint** | Actualizar | `POST /api/pai/proyectos/:id/analisis` - IA real, validación estado |
| **Estados** | Añadir nota | Estados 1-4 permiten análisis, 5-8 no |

### Notas Importantes

1. **Artefactos 1 y 2** ("Resumen Ejecutivo", "Datos Transformados") viven en `PAI_PRO_proyectos` (BD), NO en R2
2. **Artefactos 3-9** (7 nuevos) viven en R2 y se registran en `PAI_ART_artefactos`
3. **Total artefactos**: 9 (2 en BD + 7 en R2)
4. **Prompts 01-07** ya existen en R2 según ROADMAP (Hecho H19)
5. **Endpoint de análisis** ahora valida estado antes de ejecutar

---

**Documento generado:** 2026-03-29  
**Sprint:** Sprint 2 - Backend Core del Workflow  
**Estado:** Pendiente de revisión por `inventariador`  
**Próximo paso:** Invocar a `inventariador` para actualizar `.governance/inventario_recursos.md`
