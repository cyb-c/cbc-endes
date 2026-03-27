# Especificación de API - Proyectos PAI
## Backend - Core Funcional

**Versión:** 1.0
**Fecha:** 27 de marzo de 2026
**Propósito:** Definición completa de los endpoints de API para gestión de proyectos PAI

---

## Índice

1. [Convenciones](#1-convenciones)
2. [Endpoints de API](#2-endpoints-de-api)
3. [Modelos de Datos](#3-modelos-de-datos)
4. [Códigos de Estado HTTP](#4-códigos-de-estado-http)

---

## 1. Convenciones

### 1.1. Rutas Base

- **Base URL:** `/api/pai`
- **Versión:** v1 (implícita en la ruta base)

### 1.2. Formato de Respuestas

Todas las respuestas siguen el formato estándar definido en la regla R6 del proyecto:

```typescript
interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}
```

### 1.3. Autenticación

- **MVP:** Sin autenticación
- **Futuro:** Implementar autenticación basada en tokens

### 1.4. Integración con Pipeline Events

Todos los endpoints que modifican el estado de un proyecto deben registrar eventos en `pipeline_eventos` usando las funciones del Starter Kit.

---

## 2. Endpoints de API

### 2.1. Crear Proyecto

**Endpoint:** `POST /api/pai/proyectos`

**Descripción:** Crea un nuevo proyecto PAI a partir de un IJSON (JSON del anuncio inmobiliario).

**Request Body:**

```typescript
interface CrearProyectoRequest {
  ijson: string  // Contenido JSON del anuncio inmobiliario
}
```

**Response (200):**

```typescript
interface CrearProyectoResponse {
  proyecto: {
    id: number
    cii: string
    titulo: string
    estado_id: number
    estado: string
    fecha_alta: string
    fecha_ultima_actualizacion: string
  }
}
```

**Eventos Pipeline a Registrar:**
- `PROCESS_START` - Inicio del proceso de creación
- `STEP_SUCCESS` - IJSON validado y parseado
- `PROCESS_COMPLETE` - Proyecto creado exitosamente

**Errores:**
- `400` - IJSON inválido o mal formado
- `500` - Error interno del servidor

---

### 2.2. Obtener Detalles de Proyecto

**Endpoint:** `GET /api/pai/proyectos/:id`

**Descripción:** Obtiene los detalles completos de un proyecto PAI específico.

**Parámetros de URL:**
- `id` (number) - ID del proyecto

**Response (200):**

```typescript
interface DetalleProyectoResponse {
  proyecto: {
    id: number
    cii: string
    titulo: string
    estado_id: number
    estado: string
    motivo_valoracion_id: number | null
    motivo_descarte_id: number | null
    fecha_alta: string
    fecha_ultima_actualizacion: string
    datos_basicos: {
      portal: string
      url_fuente: string
      tipo_operacion: string
      tipo_inmueble: string
      precio: string
      precio_por_m2: string
      superficie_total_m2: string
      superficie_construida_m2: string
      superficie_util_m2: string
      ciudad: string
      provincia: string
      barrio: string
      direccion: string
    }
  }
  artefactos: {
    id: number
    tipo_artefacto_id: number
    tipo: string
    ruta_r2: string
    fecha_creacion: string
  }[]
  notas: {
    id: number
    tipo_nota_id: number
    tipo: string
    autor: string
    contenido: string
    fecha_creacion: string
  }[]
}
```

**Errores:**
- `404` - Proyecto no encontrado
- `500` - Error interno del servidor

---

### 2.3. Listar Proyectos

**Endpoint:** `GET /api/pai/proyectos`

**Descripción:** Lista proyectos PAI con filtros y paginación.

**Parámetros de Query:**

| Parámetro | Tipo | Descripción | Default |
|------------|-------|-------------|----------|
| `estado_id` | number | Filtrar por estado | null |
| `motivo_valoracion_id` | number | Filtrar por motivo de valoración | null |
| `motivo_descarte_id` | number | Filtrar por motivo de descarte | null |
| `ciudad` | string | Filtrar por ciudad | null |
| `barrio` | string | Filtrar por barrio | null |
| `tipo_inmueble` | string | Filtrar por tipo de inmueble | null |
| `fecha_desde` | string (ISO) | Filtrar proyectos desde esta fecha | null |
| `fecha_hasta` | string (ISO) | Filtrar proyectos hasta esta fecha | null |
| `pagina` | number | Número de página | 1 |
| `por_pagina` | number | Resultados por página | 20 |
| `ordenar_por` | string | Campo de ordenación | 'fecha_alta' |
| `orden` | string | Dirección de ordenación | 'DESC' |

**Response (200):**

```typescript
interface ListarProyectosResponse {
  proyectos: {
    id: number
    cii: string
    titulo: string
    estado_id: number
    estado: string
    fecha_alta: string
    fecha_ultima_actualizacion: string
  }[]
  paginacion: {
    pagina_actual: number
    por_pagina: number
    total: number
    total_paginas: number
  }
}
```

**Errores:**
- `400` - Parámetros inválidos
- `500` - Error interno del servidor

---

### 2.4. Ejecutar Análisis Completo

**Endpoint:** `POST /api/pai/proyectos/:id/analisis`

**Descripción:** Ejecuta el análisis completo de un proyecto PAI, generando los 10 archivos Markdown en R2.

**Parámetros de URL:**
- `id` (number) - ID del proyecto

**Request Body:**

```typescript
interface EjecutarAnalisisRequest {
  forzar_reejecucion?: boolean  // Forzar re-ejecución incluso si ya existe análisis
}
```

**Response (200):**

```typescript
interface EjecutarAnalisisResponse {
  proyecto: {
    id: number
    cii: string
    estado_id: number
    estado: string
    fecha_ultima_actualizacion: string
  }
  artefactos_generados: {
    id: number
    tipo_artefacto_id: number
    tipo: string
    ruta_r2: string
    fecha_creacion: string
  }[]
}
```

**Eventos Pipeline a Registrar:**
- `PROCESS_START` - Inicio del proceso de análisis
- `STEP_SUCCESS` - Análisis físico completado
- `STEP_SUCCESS` - Análisis estratégico completado
- `STEP_SUCCESS` - Análisis financiero completado
- `STEP_SUCCESS` - Análisis regulatorio completado
- `STEP_SUCCESS` - Lecturas generadas
- `PROCESS_COMPLETE` - Análisis completado exitosamente
- `STEP_FAILED` - Si hay error en algún paso

**Comportamiento de Re-ejecución:**
- Si `forzar_reejecucion` es `false` y ya existe análisis → Error `409`
- Si `forzar_reejecucion` es `true` → Eliminar artefactos Markdown existentes, conservar IJSON, generar nuevos artefactos

**Errores:**
- `404` - Proyecto no encontrado
- `409` - Análisis ya existe (si no se fuerza re-ejecución)
- `500` - Error interno del servidor

---

### 2.5. Obtener Artefactos

**Endpoint:** `GET /api/pai/proyectos/:id/artefactos`

**Descripción:** Obtiene todos los artefactos asociados a un proyecto PAI.

**Parámetros de URL:**
- `id` (number) - ID del proyecto

**Response (200):**

```typescript
interface ObtenerArtefactosResponse {
  artefactos: {
    id: number
    tipo_artefacto_id: number
    tipo: string
    ruta_r2: string
    fecha_creacion: string
  }[]
}
```

**Errores:**
- `404` - Proyecto no encontrado
- `500` - Error interno del servidor

---

### 2.6. Crear Nota

**Endpoint:** `POST /api/pai/proyectos/:id/notas`

**Descripción:** Crea una nueva nota asociada a un proyecto PAI.

**Parámetros de URL:**
- `id` (number) - ID del proyecto

**Request Body:**

```typescript
interface CrearNotaRequest {
  tipo_nota_id: number  // ID del tipo de nota (de PAI_VAL_valores)
  autor: string  // Nombre del autor
  contenido: string  // Contenido de la nota
}
```

**Response (201):**

```typescript
interface CrearNotaResponse {
  nota: {
    id: number
    proyecto_id: number
    tipo_nota_id: number
    tipo: string
    autor: string
    contenido: string
    fecha_creacion: string
  }
}
```

**Eventos Pipeline a Registrar:**
- `STEP_SUCCESS` - Nota creada exitosamente

**Errores:**
- `400` - Datos de nota inválidos
- `404` - Proyecto no encontrado
- `500` - Error interno del servidor

---

### 2.7. Editar Nota

**Endpoint:** `PUT /api/pai/proyectos/:id/notas/:notaId`

**Descripción:** Edita una nota existente asociada a un proyecto PAI.

**Parámetros de URL:**
- `id` (number) - ID del proyecto
- `notaId` (number) - ID de la nota

**Request Body:**

```typescript
interface EditarNotaRequest {
  contenido: string  // Nuevo contenido de la nota
}
```

**Response (200):**

```typescript
interface EditarNotaResponse {
  nota: {
    id: number
    proyecto_id: number
    tipo_nota_id: number
    tipo: string
    autor: string
    contenido: string
    fecha_creacion: string
  }
}
```

**Validación de Editabilidad:**
- Una nota solo puede editarse mientras siga vigente el estado con el que fue creada
- El control de editabilidad se contrasta contra la trazabilidad de cambios de estado registrada en `pipeline_eventos`

**Eventos Pipeline a Registrar:**
- `STEP_SUCCESS` - Nota editada exitosamente

**Errores:**
- `400` - Contenido inválido
- `403` - Nota no es editable (estado del proyecto cambió)
- `404` - Proyecto o nota no encontrados
- `500` - Error interno del servidor

---

### 2.8. Cambiar Estado Manual

**Endpoint:** `PUT /api/pai/proyectos/:id/estado`

**Descripción:** Cambia el estado manual de un proyecto PAI.

**Parámetros de URL:**
- `id` (number) - ID del proyecto

**Request Body:**

```typescript
interface CambiarEstadoRequest {
  estado_id: number  // Nuevo estado (de PAI_VAL_valores)
  motivo_valoracion_id?: number  // Motivo de valoración (si aplica)
  motivo_descarte_id?: number  // Motivo de descarte (si aplica)
}
```

**Response (200):**

```typescript
interface CambiarEstadoResponse {
  proyecto: {
    id: number
    cii: string
    estado_id: number
    estado: string
    motivo_valoracion_id: number | null
    motivo_descarte_id: number | null
    fecha_ultima_actualizacion: string
  }
}
```

**Eventos Pipeline a Registrar:**
- `STEP_SUCCESS` - Estado cambiado manualmente

**Errores:**
- `400` - Estado inválido
- `404` - Proyecto no encontrado
- `500` - Error interno del servidor

---

### 2.9. Eliminar Proyecto

**Endpoint:** `DELETE /api/pai/proyectos/:id`

**Descripción:** Elimina un proyecto PAI y todos sus artefactos asociados.

**Parámetros de URL:**
- `id` (number) - ID del proyecto

**Response (200):**

```typescript
interface EliminarProyectoResponse {
  mensaje: string
  proyecto_eliminado: {
    id: number
    cii: string
  }
}
```

**Eventos Pipeline a Registrar:**
- `PROCESS_START` - Inicio del proceso de eliminación
- `STEP_SUCCESS` - Notas eliminadas
- `STEP_SUCCESS` - Artefactos eliminados
- `STEP_SUCCESS` - Proyecto eliminado
- `PROCESS_COMPLETE` - Eliminación completada

**Comportamiento:**
- Eliminar todas las notas asociadas
- Eliminar todos los artefactos asociados
- Eliminar la carpeta completa en R2 (`analisis-inmuebles/CII/`)
- Eliminar el registro en `PAI_PRO_proyectos`

**Errores:**
- `404` - Proyecto no encontrado
- `500` - Error interno del servidor

---

### 2.10. Obtener Historial de Ejecución

**Endpoint:** `GET /api/pai/proyectos/:id/pipeline`

**Descripción:** Obtiene el historial de ejecución (pipeline events) de un proyecto PAI.

**Parámetros de URL:**
- `id` (number) - ID del proyecto

**Parámetros de Query:**

| Parámetro | Tipo | Descripción | Default |
|------------|-------|-------------|----------|
| `limite` | number | Límite de eventos a retornar | 100 |

**Response (200):**

```typescript
interface HistorialEjecucionResponse {
  eventos: {
    id: number
    entity_id: string
    paso: string
    nivel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
    tipo_evento: string
    origen: string | null
    error_codigo: string | null
    detalle: string | null
    duracion_ms: number | null
    created_at: string
  }[]
}
```

**Errores:**
- `404` - Proyecto no encontrado
- `500` - Error interno del servidor

---

## 3. Modelos de Datos

### 3.1. Proyecto PAI

```typescript
interface ProyectoPAI {
  id: number
  cii: string
  titulo: string
  estado_id: number
  estado: string
  motivo_valoracion_id: number | null
  motivo_descarte_id: number | null
  fecha_alta: string
  fecha_ultima_actualizacion: string
}
```

### 3.2. Artefacto

```typescript
interface Artefacto {
  id: number
  proyecto_id: number
  tipo_artefacto_id: number
  tipo: string
  ruta_r2: string
  fecha_creacion: string
}
```

### 3.3. Nota

```typescript
interface Nota {
  id: number
  proyecto_id: number
  tipo_nota_id: number
  tipo: string
  autor: string
  contenido: string
  fecha_creacion: string
}
```

---

## 4. Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado exitosamente |
| `400` | Bad Request - Parámetros inválidos |
| `403` | Forbidden - Acceso denegado (ej: nota no editable) |
| `404` | Not Found - Recurso no encontrado |
| `409` | Conflict - Recurso ya existe (ej: análisis ya ejecutado) |
| `500` | Internal Server Error - Error interno del servidor |

---

## 5. Referencias

- [`DocumentoConceptoProyecto _PAI.md`](../../doc-base/DocumentoConceptoProyecto _PAI.md) - Concepto del proyecto y flujo funcional
- [`modelo-tablas-campos-consulinmo.md`](../../doc-base/modelo-tablas-campos-consulinmo.md) - Esquema de base de datos PAI
- [`pipeline-events.ts`](../../../apps/worker/src/lib/pipeline-events.ts) - Librería de funciones para pipeline events
- [`r2-storage.ts`](../../../apps/worker/src/lib/r2-storage.ts) - Librería de funciones para R2 storage
- [`.governance/reglas_proyecto.md`](../../../../.governance/reglas_proyecto.md) - Reglas del proyecto (R6: Convención de respuestas HTTP)
