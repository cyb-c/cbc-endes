# Guía de Implementación - Endpoints PAI
## Backend - Core Funcional

**Versión:** 1.0
**Fecha:** 27 de marzo de 2026
**Propósito:** Guía de implementación para los endpoints PAI

---

## Índice

1. [Estructura de Carpetas](#1-estructura-de-carpetas)
2. [Patrones de Implementación](#2-patrones-de-implementación)
3. [Implementación por Endpoint](#3-implementación-por-endpoint)
4. [Integración con Pipeline Events](#4-integración-con-pipeline-events)
5. [Integración con R2 Storage](#5-integración-con-r2-storage)
6. [Pruebas](#6-pruebas)
7. [Referencias](#7-referencias)

---

## 1. Estructura de Carpetas

### 1.1. Estructura Propuesta

```
apps/worker/src/
├── handlers/
│   ├── pai-proyectos.ts       # Handlers para proyectos PAI
│   ├── pai-notas.ts          # Handlers para notas
│   └── index.ts              # Export principal de handlers PAI
├── services/
│   └── simulacion-ia.ts      # Servicio de simulación de IA
├── lib/
│   ├── pipeline-events.ts       # Librería de pipeline events
│   └── r2-storage.ts          # Librería de R2 storage
└── types/
    └── pai.ts                 # Tipos específicos de PAI
```

### 1.2. Convención de Nombres

- **Handlers:** `pai-{recurso}.ts` (ej: `pai-proyectos.ts`)
- **Services:** `simulacion-ia.ts`
- **Types:** `pai.ts`

---

## 2. Patrones de Implementación

### 2.1. Patrón de Handler

Todos los handlers siguen este patrón:

```typescript
import { Context } from 'hono'
import { getDB } from '../env'
import { insertPipelineEvent } from '../lib/pipeline-events'

type Env = import('../env').Env

type AppContext = Context<{ Bindings: Env }>

export async function handleCrearProyecto(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const entityId = `proyecto-${Date.now()}`
  
  try {
    // 1. Registrar inicio del proceso
    await insertPipelineEvent(db, {
      entityId,
      paso: 'crear_proyecto',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_START',
      detalle: 'Iniciando creación de proyecto',
    })
    
    // 2. Obtener y validar datos
    const body = await c.req.json()
    const { ijson } = body
    
    if (!ijson || typeof ijson !== 'string') {
      return c.json({
        error: {
          code: 'INVALID_IJSON',
          message: 'El campo ijson es requerido y debe ser un string',
        },
      }, 400)
    }
    
    // 3. Validar IJSON
    const ijsonValidado = validarIJSON(ijson)
    
    if (!ijsonValidado.valido) {
      await insertPipelineEvent(db, {
        entityId,
        paso: 'validar_ijson',
        nivel: 'ERROR',
        tipoEvento: 'STEP_FAILED',
        errorCodigo: 'INVALID_IJSON',
        detalle: ijsonValidado.error,
      })
      
      return c.json({
        error: {
          code: 'INVALID_IJSON',
          message: ijsonValidado.error,
        },
      }, 400)
    }
    
    // 4. Crear proyecto en DB
    const proyecto = await crearProyecto(db, ijsonValidado.ijson)
    
    // 5. Registrar finalización exitosa
    await insertPipelineEvent(db, {
      entityId,
      paso: 'crear_proyecto',
      nivel: 'INFO',
      tipoEvento: 'PROCESS_COMPLETE',
      detalle: 'Proyecto creado exitosamente',
    })
    
    return c.json({ data: proyecto }, 201)
  } catch (error) {
    await insertPipelineEvent(db, {
      entityId,
      paso: 'crear_proyecto',
      nivel: 'ERROR',
      tipoEvento: 'PROCESS_FAILED',
      errorCodigo: 'ERROR_INTERNO',
      detalle: error instanceof Error ? error.message : 'Error desconocido',
    })
    
    return c.json({
      error: {
        code: 'ERROR_INTERNO',
        message: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
    }, 500)
  }
}
```

### 2.2. Patrón de Validación

```typescript
interface ValidationResult {
  valido: boolean
  error?: string
}

function validarIJSON(ijson: string): ValidationResult {
  try {
    const parsed = JSON.parse(ijson)
    
    // Validar campos obligatorios
    if (!parsed.titulo_anuncio) {
      return { valido: false, error: 'Falta campo titulo_anuncio' }
    }
    if (!parsed.tipo_inmueble) {
      return { valido: false, error: 'Falta campo tipo_inmueble' }
    }
    if (!parsed.precio) {
      return { valido: false, error: 'Falta campo precio' }
    }
    
    return { valido: true, ijson: parsed }
  } catch (error) {
    return { valido: false, error: 'JSON inválido' }
  }
}
```

### 2.3. Patrón de Manejo de Errores

```typescript
try {
  // Lógica del handler
} catch (error) {
  // Siempre registrar error en pipeline events
  await insertPipelineEvent(db, {
    entityId,
    paso: pasoActual,
    nivel: 'ERROR',
    tipoEvento: 'STEP_FAILED',
    errorCodigo: codigoError,
    detalle: error instanceof Error ? error.message : 'Error desconocido',
  })
  
  // Retornar respuesta de error
  return c.json({
    error: {
      code: codigoError,
      message: mensajeError,
      details: error instanceof Error ? error.message : 'Error desconocido',
    },
  }, 500)
}
```

---

## 3. Implementación por Endpoint

### 3.1. POST /api/pai/proyectos

**Archivo:** `apps/worker/src/handlers/pai-proyectos.ts`

**Función:** `handleCrearProyecto`

**Lógica:**
1. Validar IJSON recibido
2. Parsear IJSON y extraer datos básicos
3. Generar CII
4. Insertar registro en `PAI_PRO_proyectos`
5. Guardar IJSON en R2
6. Registrar eventos de pipeline
7. Retornar proyecto creado

### 3.2. GET /api/pai/proyectos/:id

**Archivo:** `apps/worker/src/handlers/pai-proyectos.ts`

**Función:** `handleObtenerProyecto`

**Lógica:**
1. Validar que el ID existe
2. Obtener proyecto de `PAI_PRO_proyectos`
3. Obtener datos básicos del IJSON
4. Obtener artefactos de `PAI_ART_artefactos`
5. Obtener notas de `PAI_NOT_notas`
6. Retornar datos completos

### 3.3. GET /api/pai/proyectos

**Archivo:** `apps/worker/src/handlers/pai-proyectos.ts`

**Función:** `handleListarProyectos`

**Lógica:**
1. Obtener parámetros de query (filtros, paginación)
2. Construir query SQL dinámica
3. Aplicar filtros si están presentes
4. Aplicar paginación
5. Ejecutar query
6. Retornar resultados con metadatos de paginación

**Ejemplo de Query SQL:**

```sql
SELECT 
  p.id,
  p.cii,
  p.titulo,
  p.estado_id,
  e.valor as estado,
  p.fecha_alta,
  p.fecha_ultima_actualizacion
FROM PAI_PRO_proyectos p
LEFT JOIN PAI_VAL_valores e ON p.estado_id = e.id
WHERE 1=1
  ${estado_id ? 'AND p.estado_id = ?' : ''}
  ${ciudad ? 'AND p.ciudad = ?' : ''}
  ${barrio ? 'AND p.barrio = ?' : ''}
  ${fecha_desde ? 'AND p.fecha_alta >= ?' : ''}
  ${fecha_hasta ? 'AND p.fecha_alta <= ?' : ''}
ORDER BY ${ordenar_por} ${orden}
LIMIT ? OFFSET ?
```

### 3.4. POST /api/pai/proyectos/:id/analisis

**Archivo:** `apps/worker/src/handlers/pai-proyectos.ts`

**Función:** `handleEjecutarAnalisis`

**Lógica:**
1. Validar que el proyecto existe
2. Verificar si ya existe análisis (si no se fuerza re-ejecución)
3. Llamar servicio de simulación de IA
4. Generar y guardar artefactos en R2
5. Insertar registros en `PAI_ART_artefactos`
6. Actualizar estado del proyecto
7. Registrar eventos de pipeline
8. Retornar resultado

### 3.5. GET /api/pai/proyectos/:id/artefactos

**Archivo:** `apps/worker/src/handlers/pai-proyectos.ts`

**Función:** `handleObtenerArtefactos`

**Lógica:**
1. Validar que el proyecto existe
2. Obtener artefactos de `PAI_ART_artefactos`
3. Join con `PAI_VAL_valores` para obtener tipo de artefacto
4. Retornar lista de artefactos

### 3.6. POST /api/pai/proyectos/:id/notas

**Archivo:** `apps/worker/src/handlers/pai-notas.ts`

**Función:** `handleCrearNota`

**Lógica:**
1. Validar que el proyecto existe
2. Validar tipo de nota
3. Insertar nota en `PAI_NOT_notas`
4. Registrar eventos de pipeline
5. Retornar nota creada

### 3.7. PUT /api/pai/proyectos/:id/notas/:notaId

**Archivo:** `apps/worker/src/handlers/pai-notas.ts`

**Función:** `handleEditarNota`

**Lógica:**
1. Validar que el proyecto y la nota existen
2. Validar editabilidad de la nota (ver sección 5.2 de Integración_Pipeline_Events_PAI.md)
3. Actualizar nota en `PAI_NOT_notas`
4. Registrar eventos de pipeline
5. Retornar nota actualizada

### 3.8. PUT /api/pai/proyectos/:id/estado

**Archivo:** `apps/worker/src/handlers/pai-proyectos.ts`

**Función:** `handleCambiarEstado`

**Lógica:**
1. Validar que el proyecto existe
2. Validar estado y motivos
3. Actualizar estado en `PAI_PRO_proyectos`
4. Registrar eventos de pipeline
5. Retornar proyecto actualizado

### 3.9. DELETE /api/pai/proyectos/:id

**Archivo:** `apps/worker/src/handlers/pai-proyectos.ts`

**Función:** `handleEliminarProyecto`

**Lógica:**
1. Validar que el proyecto existe
2. Eliminar notas de `PAI_NOT_notas`
3. Eliminar artefactos de `PAI_ART_artefactos`
4. Eliminar carpeta en R2
5. Eliminar proyecto de `PAI_PRO_proyectos`
6. Registrar eventos de pipeline
7. Retornar confirmación

### 3.10. GET /api/pai/proyectos/:id/pipeline

**Archivo:** `apps/worker/src/handlers/pai-proyectos.ts`

**Función:** `handleObtenerHistorial`

**Lógica:**
1. Validar que el proyecto existe
2. Obtener eventos de `pipeline_eventos` usando `getEntityEvents`
3. Aplicar límite si está presente
4. Retornar lista de eventos

---

## 4. Integración con Pipeline Events

### 4.1. Importar Funciones

```typescript
import {
  insertPipelineEvent,
  getEntityEvents,
  getLatestEvent,
} from '../lib/pipeline-events'
```

### 4.2. Registrar Eventos en Cada Operación

Todas las operaciones deben registrar eventos siguiendo el mapeo definido en [`Integracion_Pipeline_Events_PAI.md`](Integracion_Pipeline_Events_PAI.md).

**Ejemplo:**

```typescript
// Antes de la operación
const entityId = `proyecto-${proyectoId}`

await insertPipelineEvent(db, {
  entityId,
  paso: 'crear_proyecto',
  nivel: 'INFO',
  tipoEvento: 'PROCESS_START',
  detalle: 'Iniciando creación de proyecto',
})

// ... ejecutar operación ...

// Después de la operación exitosa
await insertPipelineEvent(db, {
  entityId,
  paso: 'crear_proyecto',
  nivel: 'INFO',
  tipoEvento: 'PROCESS_COMPLETE',
  detalle: 'Proyecto creado exitosamente',
})
```

---

## 5. Integración con R2 Storage

### 5.1. Importar Funciones

```typescript
import {
  generateCII,
  generateProjectFolderStructure,
  saveIJSON,
  saveMarkdownArtifact,
  saveAllMarkdownArtifacts,
  deleteProjectFolder,
} from '../lib/r2-storage'
```

### 5.2. Usar Bucket R2

```typescript
import { getR2Bucket } from '../env'

const r2Bucket = getR2Bucket(c.env)
```

### 5.3. Guardar IJSON

```typescript
const cii = generateCII(proyectoId)
await saveIJSON(r2Bucket, cii, ijson)
```

### 5.4. Guardar Artefactos

```typescript
const markdownContents = generateSimulatedAnalysisContent(cii, ijsonParsed)
await saveAllMarkdownArtifacts(r2Bucket, cii, markdownContents)
```

---

## 6. Pruebas

### 6.1. Pruebas Unitarias

**Framework:** Jest o Vitest

**Ejemplo de Test:**

```typescript
describe('handleCrearProyecto', () => {
  it('debe crear un proyecto con IJSON válido', async () => {
    const mockDb = createMockDb()
    const mockEnv = createMockEnv()
    const ijsonValido = JSON.stringify({
      titulo_anuncio: 'Local comercial en Valencia',
      tipo_inmueble: 'Local comercial',
      precio: '150000',
    })
    
    const response = await handleCrearProyecto(
      createMockContext(mockEnv),
      mockDb,
      ijsonValido,
    )
    
    expect(response.status).toBe(201)
    expect(response.data.proyecto).toBeDefined()
  })
  
  it('debe rechazar IJSON inválido', async () => {
    const mockDb = createMockDb()
    const mockEnv = createMockEnv()
    const ijsonInvalido = '{invalid json}'
    
    const response = await handleCrearProyecto(
      createMockContext(mockEnv),
      mockDb,
      ijsonInvalido,
    )
    
    expect(response.status).toBe(400)
    expect(response.error.code).toBe('INVALID_IJSON')
  })
})
```

### 6.2. Pruebas de Integración

**Escenarios a probar:**

1. **Flujo completo de creación de proyecto**
   - Crear proyecto con IJSON válido
   - Crear proyecto con IJSON inválido
   - Verificar que IJSON se guarda en R2
   - Verificar que se registran eventos de pipeline

2. **Flujo de ejecución de análisis**
   - Ejecutar análisis en proyecto nuevo
   - Ejecutar análisis con re-ejecución forzada
   - Ejecutar análisis sin forzar re-ejecución (debe fallar)
   - Verificar que se generan 10 artefactos
   - Verificar que se actualiza el estado

3. **Gestión de notas**
   - Crear nota en proyecto
   - Editar nota mientras es editable
   - Intentar editar nota cuando no es editable
   - Eliminar nota al eliminar proyecto

4. **Cambio de estado manual**
   - Cambiar estado a EVALUANDO_VIABILIDAD
   - Cambiar estado a APROBADO
   - Cambiar estado a RECHAZADO con motivo

5. **Eliminación de proyecto**
   - Eliminar proyecto con notas y artefactos
   - Verificar que se elimina carpeta en R2
   - Verificar que se registran eventos de eliminación

---

## 7. Referencias

### 7.1. Documentos de Especificación

- [`Especificacion_API_PAI.md`](Especificacion_API_PAI.md) - Especificación completa de endpoints
- [`Servicio_Simulacion_IA.md`](Servicio_Simulacion_IA.md) - Especificación del servicio de simulación de IA
- [`Integracion_Pipeline_Events_PAI.md`](Integracion_Pipeline_Events_PAI.md) - Especificación de integración con pipeline events

### 7.2. Librerías Implementadas

- [`apps/worker/src/lib/pipeline-events.ts`](../../../apps/worker/src/lib/pipeline-events.ts) - Librería de funciones para pipeline events
- [`apps/worker/src/lib/r2-storage.ts`](../../../apps/worker/src/lib/r2-storage.ts) - Librería de funciones para R2 storage

### 7.3. Reglas del Proyecto

- [`.governance/reglas_proyecto.md`](../../../../.governance/reglas_proyecto.md) - Reglas del proyecto
  - R1: No asumir valores no documentados
  - R2: Cero hardcoding
  - R4: Accesores tipados para bindings
  - R6: Convención de respuestas HTTP

### 7.4. Migraciones de Base de Datos

- [`migrations/003-pipeline-events.sql`](../../../migrations/003-pipeline-events.sql) - Tabla pipeline_eventos
- [`migrations/004-pai-mvp.sql`](../../../migrations/004-pai-mvp.sql) - Tablas PAI (PRO, ATR, VAL, NOT, ART)
- [`migrations/005-pai-mvp-datos-iniciales.sql`](../../../migrations/005-pai-mvp-datos-iniciales.sql) - Datos iniciales PAI

### 7.5. Documentación Base del Proyecto

- [`DocumentoConceptoProyecto _PAI.md`](../../doc-base/DocumentoConceptoProyecto _PAI.md) - Concepto del proyecto y flujo funcional
- [`modelo-tablas-campos-consulinmo.md`](../../doc-base/modelo-tablas-campos-consulinmo.md) - Esquema de base de datos PAI
