# 004-Especificacion-Tecnica-Workflow-Analisis.md

---

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Componentes del Backend](#3-componentes-del-backend)
4. [Flujo de Ejecución Detallado](#4-flujo-de-ejecución-detallado)
5. [Especificación de Servicios](#5-especificación-de-servicios)
6. [Manejo de Errores](#6-manejo-de-errores)
7. [Tracking y Observabilidad](#7-tracking-y-observabilidad)
8. [Referencias](#8-referencias)

---

## 1. Resumen Ejecutivo

### 1.1 Propósito

Este documento especifica la implementación técnica del **Workflow de Análisis Inmobiliario con IA Real** que reemplaza el análisis simulado existente en el proyecto `cbc-endes`.

### 1.2 Alcance

- **Backend**: Servicio de análisis con 7 pasos secuenciales
- **Integración**: OpenAI Responses API vía `openai-client.ts`
- **Persistencia**: R2 para 7 artefactos Markdown
- **Tracking**: `pipeline_eventos` (D1) + `log.json` (R2)

### 1.3 Cambios Respecto al Análisis Simulado

| Aspecto | Análisis Simulado (Actual) | Análisis con IA (Nuevo) |
|---------|---------------------------|------------------------|
| **Servicio** | `simulacion-ia.ts` | `ia-analisis-proyectos.ts` |
| **Artefactos** | 10 Markdown (simulados) | 7 Markdown (IA real) + 2 en BD |
| **Prompts** | No aplica | 7 prompts en R2 |
| **Modelo IA** | No aplica | OpenAI GPT-5 / GPT-5.4 |
| **Inputs por paso** | No aplica | 1 input (pasos 1-4), 5 inputs (pasos 5-7) |

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Pages)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Botón "Ejecutar Análisis"                               │   │
│  │  (habilitado si estado_id en 1,2,3,4)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/pai/proyectos/:id/analisis
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Worker)                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  handleEjecutarAnalisis()                              │     │
│  │  - Validar estado (1,2,3,4)                            │     │
│  │  - Obtener proyecto y CII                              │     │
│  │  - Limpiar 7 MD anteriores (si existen)                │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  ia-analisis-proyectos.ts                              │     │
│  │  - ejecutarAnalisisConIA()                             │     │
│  │    - Paso 1: Activo Físico                             │     │
│  │    - Paso 2: Activo Estratégico                        │     │
│  │    - Paso 3: Activo Financiero                         │     │
│  │    - Paso 4: Activo Regulado                           │     │
│  │    - Validar dependencias                              │     │
│  │    - Paso 5: Inversor                                  │     │
│  │    - Paso 6: Emprendedor Operador                      │     │
│  │    - Paso 7: Propietario                               │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  openai-client.ts (existente)                          │     │
│  │  - executePrompt()                                     │     │
│  │  - callOpenAIResponses()                               │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    R2 (r2-cbconsulting)                          │
│  prompts-ia/                                     (7 prompts)    │
│  analisis-inmuebles/{CII}/                       (7 MD + IJSON) │
│  analisis-inmuebles/{CII}/{CII}_log.json         (tracking)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    D1 (db-cbconsulting)                          │
│  PAI_PRO_proyectos                               (proyectos)    │
│  PAI_ART_artefactos                              (artefactos)   │
│  PAI_VAL_valores                                 (valores)      │
│  pipeline_eventos                                (tracking)     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Datos

```
1. Frontend → POST /api/pai/proyectos/:id/analisis
2. Handler → Valida estado_id ∈ (1,2,3,4)
3. Handler → Obtiene proyecto desde D1
4. Handler → Obtiene CII del proyecto
5. Handler → Lee IJSON desde R2 ({CII}.json)
6. Handler → Limpia 7 MD anteriores en R2 (si existen)
7. Handler → Llama a ejecutarAnalisisConIA()
8. Servicio → Ejecuta pasos 1-4 (cada uno con IJSON)
9. Servicio → Valida que existen MD 1-4
10. Servicio → Ejecuta pasos 5-7 (cada uno con 5 inputs)
11. Servicio → Guarda 7 MD en R2
12. Servicio → Registra 7 artefactos en PAI_ART_artefactos
13. Servicio → Registra eventos en pipeline_eventos
14. Handler → Genera log.json en R2
15. Handler → Retorna respuesta al Frontend
```

---

## 3. Componentes del Backend

### 3.1 Archivos a Crear/Modificar

| Archivo | Acción | Propósito |
|---------|--------|-----------|
| `apps/worker/src/services/ia-analisis-proyectos.ts` | **CREAR** | Servicio principal del workflow de 7 pasos |
| `apps/worker/src/handlers/pai-proyectos.ts` | **MODIFICAR** | Actualizar `handleEjecutarAnalisis()` |
| `apps/worker/src/lib/openai-client.ts` | **MODIFICAR** | Extender `executePrompt()` para múltiples placeholders |
| `apps/worker/src/types/analisis.ts` | **CREAR** | Tipos TypeScript para el análisis |

### 3.2 Estructura de Carpetas

```
apps/worker/src/
├── handlers/
│   └── pai-proyectos.ts          (MODIFICAR)
├── services/
│   ├── ia-creacion-proyectos.ts  (EXISTENTE - referencia)
│   ├── simulacion-ia.ts          (EXISTENTE - será reemplazado)
│   └── ia-analisis-proyectos.ts  (CREAR)
├── lib/
│   ├── openai-client.ts          (MODIFICAR)
│   ├── tracking.ts               (EXISTENTE)
│   └── r2-storage.ts             (EXISTENTE)
├── types/
│   ├── analisis.ts               (CREAR)
│   └── env.ts                    (EXISTENTE)
└── env.ts                        (EXISTENTE)
```

---

## 4. Flujo de Ejecución Detallado

### 4.1 Validación Inicial (Handler)

```typescript
// 1. Validar ID de proyecto
const proyectoId = parseInt(c.req.param('id'))
if (isNaN(proyectoId)) {
  return c.json({ error: 'ID inválido' }, 400)
}

// 2. Obtener proyecto desde D1
const proyecto = await db
  .prepare('SELECT * FROM PAI_PRO_proyectos WHERE PRO_id = ?')
  .bind(proyectoId)
  .first()

if (!proyecto) {
  return c.json({ error: 'Proyecto no encontrado' }, 404)
}

// 3. Validar estado (debe estar en 1, 2, 3, 4)
const estadoId = proyecto.PRO_estado_val_id as number
const estadosPermitidos = [1, 2, 3, 4] // CREADO, PROCESANDO_ANALISIS, ANALISIS_CON_ERROR, ANALISIS_FINALIZADO

if (!estadosPermitidos.includes(estadoId)) {
  return c.json({ 
    error: 'El estado actual no permite ejecutar análisis',
    estado_id: estadoId 
  }, 403)
}

// 4. Obtener CII
const cii = proyecto.PRO_cii as string
```

### 4.2 Lectura de IJSON desde R2

```typescript
// Leer IJSON desde R2 (no desde D1)
const ijsonKey = `analisis-inmuebles/${cii}/${cii}.json`
const ijsonObject = await r2Bucket.get(ijsonKey)

if (!ijsonObject) {
  // Fallback: leer desde D1
  const ijson = proyecto.PRO_ijson as string
  if (!ijson) {
    return c.json({ error: 'IJSON no encontrado' }, 404)
  }
} else {
  const ijson = await ijsonObject.text()
}
```

### 4.3 Limpieza de MD Anteriores

```typescript
// Listar objetos en la carpeta del proyecto
const folderPrefix = `analisis-inmuebles/${cii}/`
const listed = await r2Bucket.list({ prefix: folderPrefix })

// Eliminar solo los 7 MD del análisis anterior
const mdFilesToDelete = listed.objects.filter(obj => 
  obj.key.match(/_\d{2}_.*\.md$/) // Coincide con _01_*.md, _02_*.md, etc.
)

for (const object of mdFilesToDelete) {
  await r2Bucket.delete(object.key)
}

// NOTA: NO eliminar {CII}.json (IJSON)
// NOTA: NO eliminar {CII}_resumen-ejecutivo.md ni {CII}_datos-transformados.md
//       (estos no existen en R2, viven en BD)
```

### 4.4 Ejecución de Pasos 1-4

```typescript
const resultadosPasos1a4: Record<string, string> = {}

// Paso 1: Activo Físico
const analisisFisico = await ejecutarPasoConIA(
  env, 
  '01_ActivoFisico.json',
  { ijson },
  tracking
)
if (!analisisFisico.exito) {
  return c.json({ error: analisisFisico.error_mensaje }, 500)
}
resultadosPasos1a4['analisis-fisico'] = analisisFisico.contenido

// Paso 2: Activo Estratégico
const analisisEstrategico = await ejecutarPasoConIA(
  env,
  '02_ActivoEstrategico.json',
  { ijson },
  tracking
)
if (!analisisEstrategico.exito) {
  // Conservar análisis físico generado
  return c.json({ error: analisisEstrategico.error_mensaje }, 500)
}
resultadosPasos1a4['analisis-estrategico'] = analisisEstrategico.contenido

// Paso 3: Activo Financiero
const analisisFinanciero = await ejecutarPasoConIA(
  env,
  '03_ActivoFinanciero.json',
  { ijson },
  tracking
)
if (!analisisFinanciero.exito) {
  // Conservar análisis físico y estratégico generados
  return c.json({ error: analisisFinanciero.error_mensaje }, 500)
}
resultadosPasos1a4['analisis-financiero'] = analisisFinanciero.contenido

// Paso 4: Activo Regulado
const analisisRegulatorio = await ejecutarPasoConIA(
  env,
  '04_ActivoRegulado.json',
  { ijson },
  tracking
)
if (!analisisRegulatorio.exito) {
  // Conservar análisis 1, 2, 3 generados
  return c.json({ error: analisisRegulatorio.error_mensaje }, 500)
}
resultadosPasos1a4['analisis-regulatorio'] = analisisRegulatorio.contenido
```

### 4.5 Validación de Dependencias

```typescript
// Validar que existen los 4 análisis antes de continuar
const dependenciasCompletas = 
  resultadosPasos1a4['analisis-fisico'] &&
  resultadosPasos1a4['analisis-estrategico'] &&
  resultadosPasos1a4['analisis-financiero'] &&
  resultadosPasos1a4['analisis-regulatorio']

if (!dependenciasCompletas) {
  return c.json({ 
    error: 'No se completaron los análisis base requeridos',
    resultados_parciales: resultadosPasos1a4
  }, 500)
}
```

### 4.6 Ejecución de Pasos 5-7

```typescript
const resultadosPasos5a7: Record<string, string> = {}

// Inputs para pasos 5-7
const inputsParaPasos5a7 = {
  ijson,
  'analisis-fisico': resultadosPasos1a4['analisis-fisico'],
  'analisis-estrategico': resultadosPasos1a4['analisis-estrategico'],
  'analisis-financiero': resultadosPasos1a4['analisis-financiero'],
  'analisis-regulatorio': resultadosPasos1a4['analisis-regulatorio'],
}

// Paso 5: Inversor
const analisisInversor = await ejecutarPasoConIA(
  env,
  '05_Inversor.json',
  inputsParaPasos5a7,
  tracking
)
if (!analisisInversor.exito) {
  return c.json({ error: analisisInversor.error_mensaje }, 500)
}
resultadosPasos5a7['inversor'] = analisisInversor.contenido

// Paso 6: Emprendedor Operador
const analisisEmprendedor = await ejecutarPasoConIA(
  env,
  '06_EmprendedorOperador.json',
  inputsParaPasos5a7,
  tracking
)
if (!analisisEmprendedor.exito) {
  return c.json({ error: analisisEmprendedor.error_mensaje }, 500)
}
resultadosPasos5a7['emprendedor-operador'] = analisisEmprendedor.contenido

// Paso 7: Propietario
const analisisPropietario = await ejecutarPasoConIA(
  env,
  '07_Propietario.json',
  inputsParaPasos5a7,
  tracking
)
if (!analisisPropietario.exito) {
  return c.json({ error: analisisPropietario.error_mensaje }, 500)
}
resultadosPasos5a7['propietario'] = analisisPropietario.contenido
```

### 4.7 Persistencia en R2

```typescript
// Mapeo de nombres de análisis a archivos MD
const mapeoArchivos = {
  'analisis-fisico': `${cii}_01_activo_fisico.md`,
  'analisis-estrategico': `${cii}_02_activo_estrategico.md`,
  'analisis-financiero': `${cii}_03_activo_financiero.md`,
  'analisis-regulatorio': `${cii}_04_activo_regulado.md`,
  'inversor': `${cii}_05_inversor.md`,
  'emprendedor-operador': `${cii}_06_emprendedor_operador.md`,
  'propietario': `${cii}_07_propietario.md`,
}

// Guardar cada MD en R2
const artefactosGuardados: Array<{ nombre: string; ruta: string }> = []

for (const [nombreAnalisis, contenido] of Object.entries({
  ...resultadosPasos1a4,
  ...resultadosPasos5a7,
})) {
  const fileName = mapeoArchivos[nombreAnalisis]
  const key = `analisis-inmuebles/${cii}/${fileName}`
  
  await r2Bucket.put(key, contenido, {
    httpMetadata: {
      contentType: 'text/markdown',
    },
  })
  
  artefactosGuardados.push({
    nombre: nombreAnalisis,
    ruta: key,
  })
}
```

### 4.8 Registro en Base de Datos

```typescript
// Obtener VAL_id para cada tipo de artefacto
const tiposArtefactos = await db
  .prepare(`
    SELECT VAL_id, VAL_codigo 
    FROM PAI_VAL_valores v
    JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
    WHERE a.ATR_codigo = 'TIPO_ARTEFACTO'
      AND v.VAL_codigo IN (
        'ACTIVO_FISICO', 'ACTIVO_ESTRATEGICO', 'ACTIVO_FINANCIERO',
        'ACTIVO_REGULADO', 'INVERSOR', 'EMPRENDEDOR_OPERADOR', 'PROPIETARIO'
      )
  `)
  .all()

// Insertar registros en PAI_ART_artefactos
const fechaGeneracion = new Date().toISOString()

for (const artefacto of artefactosGuardados) {
  const tipoVal = tiposArtefactos.results.find(
    t => t.VAL_codigo === artefacto.nombre.toUpperCase().replace('-', '_')
  )
  
  if (!tipoVal) {
    console.error(`Tipo de artefacto no encontrado: ${artefacto.nombre}`)
    continue
  }
  
  await db
    .prepare(`
      INSERT INTO PAI_ART_artefactos (
        ART_proyecto_id,
        ART_tipo_val_id,
        ART_ruta,
        ART_fecha_generacion,
        ART_activo
      ) VALUES (?, ?, ?, ?, 1)
    `)
    .bind(proyectoId, tipoVal.VAL_id, artefacto.ruta, fechaGeneracion)
    .run()
}
```

### 4.9 Actualización de Estado

```typescript
// Actualizar estado a ANALISIS_FINALIZADO (4)
await db
  .prepare(`
    UPDATE PAI_PRO_proyectos
    SET PRO_estado_val_id = 4,
        PRO_fecha_ultima_actualizacion = ?
    WHERE PRO_id = ?
  `)
  .bind(new Date().toISOString(), proyectoId)
  .run()
```

---

## 5. Especificación de Servicios

### 5.1 Función `ejecutarPasoConIA()`

**Ubicación:** `apps/worker/src/services/ia-analisis-proyectos.ts`

```typescript
interface EjecutarPasoConIAResult {
  exito: boolean
  contenido?: string
  error_codigo?: string
  error_mensaje?: string
}

interface InputsParaPaso {
  [key: string]: string  // e.g., { ijson: "...", "analisis-fisico": "..." }
}

export async function ejecutarPasoConIA(
  env: Env,
  promptNombre: string,  // e.g., '01_ActivoFisico.json'
  inputs: InputsParaPaso,
  tracking: TrackingContext
): Promise<EjecutarPasoConIAResult> {
  const r2Bucket = getR2Bucket(env)
  
  try {
    // 1. Cargar prompt desde R2
    const promptKey = `prompts-ia/${promptNombre}`
    const promptObject = await r2Bucket.get(promptKey)
    
    if (!promptObject) {
      return {
        exito: false,
        error_codigo: 'PROMPT_NOT_FOUND',
        error_mensaje: `Prompt no encontrado: ${promptNombre}`,
      }
    }
    
    const promptTemplate = await promptObject.text()
    
    // 2. Reemplazar placeholders
    let promptBody = promptTemplate
    
    for (const [placeholder, value] of Object.entries(inputs)) {
      const escapedValue = JSON.stringify(value).slice(1, -1)  // Escapar para JSON
      promptBody = promptBody.replace(`%%${placeholder}%%`, escapedValue)
    }
    
    // 3. Ejecutar prompt vía OpenAI
    const result = await callOpenAIResponses(
      await getOpenAIKey(env),
      JSON.parse(promptBody),
      tracking
    )
    
    // 4. Extraer texto de respuesta
    const contenido = result.text.trim()
    
    if (!contenido) {
      return {
        exito: false,
        error_codigo: 'EMPTY_RESPONSE',
        error_mensaje: 'La IA no generó contenido',
      }
    }
    
    return {
      exito: true,
      contenido,
    }
    
  } catch (error) {
    registrarError(tracking, `ejecutar-paso-${promptNombre}`, error)
    
    return {
      exito: false,
      error_codigo: 'OPENAI_ERROR',
      error_mensaje: formatOpenAIError(error),
    }
  }
}
```

### 5.2 Función `ejecutarAnalisisConIA()`

**Ubicación:** `apps/worker/src/services/ia-analisis-proyectos.ts`

```typescript
interface EjecutarAnalisisConIAResult {
  exito: boolean
  artefactos_generados?: Array<{
    id: number
    tipo: string
    ruta_r2: string
  }>
  error_codigo?: string
  error_mensaje?: string
}

export async function ejecutarAnalisisConIA(
  env: Env,
  db: D1Database,
  proyectoId: number,
  cii: string,
  ijson: string,
  tracking: TrackingContext
): Promise<EjecutarAnalisisConIAResult> {
  const r2Bucket = getR2Bucket(env)
  
  try {
    // Registrar inicio del análisis
    registrarEvento(tracking, 'analisis-inicio', 'INFO', 'Iniciando análisis con IA')
    
    // 1. Ejecutar pasos 1-4
    const resultadosPasos1a4 = await ejecutarPasos1a4(env, ijson, tracking)
    
    if (!resultadosPasos1a4.exito) {
      return {
        exito: false,
        error_codigo: resultadosPasos1a4.error_codigo,
        error_mensaje: resultadosPasos1a4.error_mensaje,
      }
    }
    
    // 2. Validar dependencias
    if (!validarDependencias(resultadosPasos1a4.resultados)) {
      return {
        exito: false,
        error_codigo: 'DEPENDENCIAS_INCOMPLETAS',
        error_mensaje: 'No se completaron los análisis base',
      }
    }
    
    // 3. Ejecutar pasos 5-7
    const resultadosPasos5a7 = await ejecutarPasos5a7(
      env,
      ijson,
      resultadosPasos1a4.resultados,
      tracking
    )
    
    if (!resultadosPasos5a7.exito) {
      return {
        exito: false,
        error_codigo: resultadosPasos5a7.error_codigo,
        error_mensaje: resultadosPasos5a7.error_mensaje,
      }
    }
    
    // 4. Persistir en R2
    const artefactos = await persistirArtefactos(
      r2Bucket,
      cii,
      { ...resultadosPasos1a4.resultados, ...resultadosPasos5a7.resultados },
      tracking
    )
    
    // 5. Registrar en BD
    await registrarArtefactosEnBD(db, proyectoId, artefactos)
    
    // 6. Actualizar estado
    await actualizarEstadoProyecto(db, proyectoId, 4)  // ANALISIS_FINALIZADO
    
    registrarEvento(tracking, 'analisis-completado', 'INFO', 'Análisis completado exitosamente')
    
    return {
      exito: true,
      artefactos_generados: artefactos,
    }
    
  } catch (error) {
    registrarError(tracking, 'analisis-error', error)
    
    return {
      exito: false,
      error_codigo: 'ANALISIS_ERROR',
      error_mensaje: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
```

---

## 6. Manejo de Errores

### 6.1 Códigos de Error

| Código | HTTP | Descripción |
|--------|------|-------------|
| `INVALID_PROJECT_ID` | 400 | ID de proyecto inválido |
| `PROJECT_NOT_FOUND` | 404 | Proyecto no existe |
| `INVALID_STATE` | 403 | Estado no permite análisis |
| `IJSON_NOT_FOUND` | 404 | IJSON no encontrado en R2 |
| `PROMPT_NOT_FOUND` | 500 | Prompt no encontrado en R2 |
| `OPENAI_ERROR` | 500 | Error en llamada a OpenAI |
| `EMPTY_RESPONSE` | 500 | IA no generó contenido |
| `DEPENDENCIAS_INCOMPLETAS` | 500 | Faltan análisis base |
| `R2_WRITE_ERROR` | 500 | Error escribiendo en R2 |
| `DB_INSERT_ERROR` | 500 | Error insertando en BD |

### 6.2 Estrategia de Rollback Parcial

```typescript
// Si falla el paso N, conservar los MD generados hasta N-1
// Ejemplo: si falla paso 3, conservar pasos 1 y 2

// El handler debe retornar información sobre lo generado
if (!resultado.exito) {
  return c.json({
    error: resultado.error_mensaje,
    error_codigo: resultado.error_codigo,
    analisis_parciales: resultadosParciales,  // Opcional
  }, 500)
}
```

---

## 7. Tracking y Observabilidad

### 7.1 Eventos a Registrar

| Componente | Evento | Nivel | Descripción |
|------------|--------|-------|-------------|
| Handler | `analisis-handler-inicio` | INFO | Inicio del handler |
| Handler | `validar-estado` | INFO | Validación de estado |
| Handler | `leer-ijson-r2` | INFO | Lectura de IJSON desde R2 |
| Handler | `limpiar-md-anteriores` | INFO | Limpieza de MD anteriores |
| Servicio | `analisis-inicio` | INFO | Inicio del análisis |
| Servicio | `paso-N-completado` | INFO | Cada paso completado |
| Servicio | `persistir-artefactos` | INFO | Persistencia en R2 |
| Servicio | `registrar-en-bd` | INFO | Registro en BD |
| Servicio | `actualizar-estado` | INFO | Actualización de estado |
| Servicio | `analisis-completado` | INFO | Análisis finalizado |
| Error | `*-error` | ERROR | Cualquier error |

### 7.2 Generación de log.json

```typescript
// Al finalizar (éxito o error)
completarTracking(tracking)
const logJson = await generarLogJSON(env, tracking, cii)

// log.json se guarda en:
// analisis-inmuebles/{CII}/{CII}_log.json
```

---

## 8. Referencias

### 8.1 Documentos Relacionados

| Documento | Ruta |
|-----------|------|
| Concept Brief | `_doc-desarrollo/wf-analisis-inmobiliario/002-Concept-Brief-Workflow-Analisis-Inmobiliario-v2.md` |
| Sprint 1 Reporte | `_doc-desarrollo/wf-analisis-inmobiliario/003-Sprint1-Reporte-Verificacion-Prompts.md` |
| Integración OpenAI | `_doc-desarrollo/doc-apoyo-conocimiento/integracion-openai-api.md` |
| Tracking Workflow | `_doc-desarrollo/doc-apoyo-conocimiento/tracking-workflow.md` |

### 8.2 Archivos Existentes

| Archivo | Ruta |
|---------|------|
| `openai-client.ts` | `apps/worker/src/lib/openai-client.ts` |
| `tracking.ts` | `apps/worker/src/lib/tracking.ts` |
| `ia-creacion-proyectos.ts` | `apps/worker/src/services/ia-creacion-proyectos.ts` |
| `pai-proyectos.ts` | `apps/worker/src/handlers/pai-proyectos.ts` |

### 8.3 Reglas de Gobernanza Aplicables

| Regla | Descripción |
|-------|-------------|
| R1 | No asumir valores no documentados |
| R2 | Cero hardcoding |
| R4 | Accesores tipados para bindings |
| R5 | Idioma y estilo (código en inglés) |
| R6 | Convención de respuestas HTTP |
| R15 | Inventario actualizado (vía `inventariador`) |

---

**Fecha de creación:** 2026-03-29  
**Autor:** Agente Orquestador  
**Estado:** Pendiente de implementación  
**Próximo paso:** Implementar servicio `ia-analisis-proyectos.ts`
