# Especificación de API Frontend para Proyectos PAI

**Fecha:** 27 de marzo de 2026  
**Versión:** 1.0

---

## 1. Introducción

Este documento define cómo el frontend debe consumir la API de PAI implementada en la FASE 2 (Backend - Core Funcional).

## 2. Base URL de la API

**URL Base:** `VITE_API_BASE_URL` (desde `.env` o valor por defecto)

Ejemplos:
- Desarrollo: `http://localhost:8787/api`
- Producción: `https://pg-cbc-endes.pages.dev/api`

## 3. Endpoints de API PAI

### 3.1. Crear Proyecto

**Endpoint:** `POST /api/pai/proyectos`

**Request:**
```typescript
interface CrearProyectoRequest {
  ijson: string  // Contenido JSON del anuncio inmobiliario
}
```

**Response (201):**
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

**Comportamiento:**
- Validar el IJSON antes de enviar
- Mostrar indicador de carga durante la petición
- Redirigir al detalle del proyecto tras creación exitosa
- Mostrar mensaje de error si la creación falla

### 3.2. Obtener Detalle de Proyecto

**Endpoint:** `GET /api/pai/proyectos/:id`

**Parámetros:**
- `id` (number) - ID del proyecto PAI

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
      barrio: string | null
      direccion: string | null
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

**Comportamiento:**
- Mostrar indicador de carga mientras se obtiene el detalle
- Redirigir a error 404 si el proyecto no existe
- Mostrar datos básicos en formato legible
- Mostrar lista de artefactos agrupados por tipo
- Mostrar notas en orden cronológico inverso (más reciente primero)

### 3.3. Listar Proyectos

**Endpoint:** `GET /api/pai/proyectos`

**Parámetros de Query:**

| Parámetro | Tipo | Descripción | Default |
|-----------|-------|-------------|----------|
| `estado_id` | number | Filtrar por estado | null |
| `motivo_valoracion_id` | number | Filtrar por motivo de valoración | null |
| `motivo_descarte_id` | number | Filtrar por motivo de descarte | null |
| `ciudad` | string | Filtrar por ciudad (búsqueda parcial) | null |
| `barrio` | string | Filtrar por barrio (búsqueda parcial) | null |
| `tipo_inmueble` | string | Filtrar por tipo de inmueble (búsqueda parcial) | null |
| `fecha_desde` | string (ISO) | Filtrar proyectos desde esta fecha | null |
| `fecha_hasta` | string (ISO) | Filtrar proyectos hasta esta fecha | null |
| `pagina` | number | Número de página (1-indexado) | 1 |
| `por_pagina` | number | Resultados por página | 20 |
| `ordenar_por` | string | Campo de ordenación | 'fecha_alta' |
| `orden` | string | Dirección de ordenación | 'DESC' |
| `ordenar_por` | string | Campo de ordenación | 'fecha_ultima_actualizacion' |
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

**Comportamiento:**
- Mostrar indicador de carga mientras se obtiene la lista
- Implementar filtros de búsqueda en tiempo real (debounce)
- Mostrar mensaje de estado vacío si no hay proyectos
- Implementar paginación con controles de navegación
- Mostrar contadores de proyectos en la cabecera

### 3.4. Ejecutar Análisis Completo

**Endpoint:** `POST /api/pai/proyectos/:id/analisis`

**Parámetros:**
- `id` (number) - ID del proyecto PAI

**Request:**
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

**Comportamiento:**
- Mostrar indicador de progreso mientras se ejecuta el análisis
- Deshabilitar el botón de ejecutar durante la ejecución
- Mostrar notificación de éxito cuando se complete
- Redirigir a la página de detalle del proyecto
- Mostrar error si el análisis falla

### 3.5. Obtener Artefactos

**Endpoint:** `GET /api/pai/proyectos/:id/artefactos`

**Parámetros:**
- `id` (number) - ID del proyecto PAI

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

**Comportamiento:**
- Mostrar indicador de carga mientras se obtienen los artefactos
- Agrupar artefactos por tipo (resumen ejecutivo, datos transformados, análisis físicos, etc.)
- Permitir descarga individual de artefactos
- Mostrar error 404 si el proyecto no existe

### 3.6. Cambiar Estado Manual

**Endpoint:** `PUT /api/pai/proyectos/:id/estado`

**Parámetros:**
- `id` (number) - ID del proyecto PAI

**Request:**
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

**Comportamiento:**
- Mostrar modal de cambio de estado con lista de estados disponibles
- Si el estado seleccionado requiere motivo, mostrar campos de motivo adicionales
- Validar que el nuevo estado es válido para el estado actual
- Mostrar indicador de guardado mientras se actualiza
- Redirigir a la página de detalle con el nuevo estado

### 3.7. Eliminar Proyecto

**Endpoint:** `DELETE /api/pai/proyectos/:id`

**Parámetros:**
- `id` (number) - ID del proyecto PAI

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

**Comportamiento:**
- Mostrar diálogo de confirmación antes de eliminar
- Mostrar indicador de proceso mientras se elimina
- Mostrar mensaje de éxito cuando se complete
- Redirigir a la lista de proyectos
- Mostrar error si el proyecto no existe

### 3.8. Obtener Historial de Ejecución

**Endpoint:** `GET /api/pai/proyectos/:id/pipeline`

**Parámetros:**
- `id` (number) - ID del proyecto PAI
- `limite` (number) - Límite de eventos a retornar (default: 100)

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

**Comportamiento:**
- Mostrar historial en formato de línea de tiempo
- Usar colores para diferenciar niveles de eventos (INFO: verde, WARN: amarillo, ERROR: rojo)
- Mostrar detalles de cada evento al hacer clic
- Implementar paginación si hay muchos eventos

### 3.9. Crear Nota

**Endpoint:** `POST /api/pai/proyectos/:id/notas`

**Parámetros:**
- `id` (number) - ID del proyecto PAI

**Request:**
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

**Comportamiento:**
- Mostrar formulario modal o en línea en la página de detalle
- Validar campos obligatorios antes de enviar
- Mostrar indicador de guardado mientras se crea
- Añadir la nota a la lista de notas en tiempo real
- Mostrar error si la creación falla

### 3.10. Editar Nota

**Endpoint:** `PUT /api/pai/proyectos/:id/notas/:notaId`

**Parámetros:**
- `id` (number) - ID del proyecto PAI
- `notaId` (number) - ID de la nota a editar

**Request:**
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

**Comportamiento:**
- Mostrar error 403 si la nota no es editable
- Mostrar mensaje explicando por qué no se puede editar (el estado del proyecto ha cambiado)
- Mostrar formulario de edición modal
- Validar campos antes de enviar
- Mostrar indicador de guardado mientras se actualiza
- Actualizar la nota en la lista en tiempo real

## 4. Manejo de Errores

### 4.1. Códigos de Estado HTTP

| Código | Descripción | Acción |
|---------|-------------|--------|
| 200 | Éxito | Mostrar respuesta del servidor |
| 201 | Recurso creado | Mostrar mensaje de éxito y redirigir |
| 400 | Solicitud inválida | Mostrar error con detalles del problema |
| 403 | No autorizado | Mostrar mensaje explicando la restricción |
| 404 | No encontrado | Mostrar mensaje de recurso no encontrado |
| 409 | Conflicto | Mostrar mensaje explicando el conflicto |
| 500 | Error del servidor | Mostrar mensaje genérico de error |

### 4.2. Mensajes de Error

| Situación | Mensaje | Acción |
|-----------|-------------|--------|
| IJSON inválido | El IJSON no tiene el formato correcto o falta campos obligatorios | Validar formato y mostrar campos faltantes |
| Estado no permite re-ejecución | El estado actual del proyecto no permite re-ejecutar el análisis | Mostrar mensaje con el estado actual y opciones disponibles |
| Nota no editable | El estado del proyecto ha cambiado desde que se creó la nota | Mostrar mensaje explicando que las notas solo se pueden editar mientras el estado permanezca igual |
| Proyecto no encontrado | El proyecto PAI especificado no existe | Mostrar mensaje y redirigir a la lista de proyectos |

## 5. Estados y Motivos

### 5.1. Estados del Proyecto PAI

| ID | Código | Nombre | Descripción |
|----|-------|----------|-------------|
| 1 | CREADO | Creado | Estado inicial del proyecto |
| 2 | EN_ANALISIS | En análisis | El análisis está en progreso |
| 3 | PENDIENTE_REVISION | Pendiente de revisión | El análisis está completo y espera revisión |
| 4 | EVALUANDO_VIABILIDAD | Evaluando viabilidad | El proyecto está siendo evaluado para viabilidad |
| 5 | EVALUANDO_PLAN_NEGOCIO | Evaluando Plan de Negocio | El proyecto está siendo evaluado para plan de negocio |
| 6 | SEGUIMIENTO_COMERCIAL | Seguimiento comercial | El proyecto está en seguimiento comercial |
| 7 | DESCARTADO | Descartado | El proyecto fue descartado |
| 8 | APROBADO | Aprobado | El proyecto fue aprobado |
| 9 | ANALISIS_CON_ERROR | Análisis con error | El análisis falló con errores |

### 5.2. Motivos de Valoración

| ID | Código | Nombre | Descripción |
|----|-------|----------|-------------|
| 1 | MV_SENTIDO_NEGOCIO_REAL | Sentido de negocio real | El activo parece tener sentido de negocio real |
| 2 | MV_INFRAUTILIZADO | Infrautilizado | El activo se aprecia como infrautilizado o con margen claro de mejora |
| 3 | MV_USO_ECONOMICO_RAZONABLE | Uso económico razonable | El activo parece sostener un uso económico razonable |
| 4 | MV_MANTENER | Conviene mantener | La opción más defendible parece ser mantener el activo |
| 5 | MV_TRANSFORMAR | Conviene transformar | La opción más defendible parece ser transformar el activo |
| 6 | MV_RECONVERSION_DEFENDIBLE_VALÈNCIA | Reconversión defendible en València | Una posible reconversión o cambio de uso parece defendible en València ciudad |

### 5.3. Motivos de Descarte

| ID | Código | Nombre | Descripción |
|----|-------|----------|-------------|
| 1 | MD_SIN_SENTIDO_NEGOCIO_REAL | Sin sentido de negocio real | El activo no parece tener sentido de negocio real |
| 2 | MD_NO_INFRAUTILIZADO_NI_MEJORABLE | Sin infrautilización relevante | El activo no parece estar infrautilizado ni presenta mejoras claras |
| 3 | MD_SIN_USO_ECONOMICO_RAZONABLE | Sin uso económico razonable | El activo no parece sostener un uso económico razonable |
| 4 | MD_NO_CONVIENE_MANTENER | No conviene mantener | Mantener el activo no parece ser una opción defendible |
| 5 | MD_NO_CONVIENE_TRANSFORMAR | No conviene transformar | Transformar el activo no parece ser una opción defendible |
| 6 | MD_RECONVERSION_NO_DEFENDIBLE_VALÈNCIA | Reconversión no defendible | Una posible reconversión o cambio de uso no parece defendible en València ciudad |
| 7 | MD_HIPOTESIS_ATRACTIVA_NO_SOSTENIBLE | Hipótesis atractiva no sostenible | La hipótesis de valoración no es sostenible según los datos |
| 8 | MD_HIPOTESIS_NO_SOSTENIBLE | Hipótesis no sostenible | La hipótesis de valoración no es sostenible según los datos |

## 6. Tipos de Notas

| ID | Código | Nombre | Descripción |
|----|-------|----------|-------------|
| 1 | COMENTARIO | Comentario | Nota general de observación o discusión |
| 2 | VALORACION | Valoración | Nota que expresa valor positivo del proyecto |
| 3 | DECISION | Decisión | Nota que registra una decisión tomada sobre el proyecto |
| 4 | APRENDE_IA | Corrección IA | Nota que corrige información generada por IA |

## 7. Patrones de Validación

### 7.1. Validación de IJSON

```typescript
interface IJSONValidacion {
  valido: boolean
  error?: string
  ijson?: Record<string, unknown>
}

function validarIJSON(ijson: string): IJSONValidacion
```

**Reglas:**
- El IJSON debe ser un JSON válido
- Campos obligatorios: `titulo_anuncio`, `tipo_inmueble`, `precio`
- El precio debe ser un número o string numérico
- El tipo_inmueble no debe estar vacío

### 7.2. Validación de Estado para Re-ejecución

```typescript
interface ValidacionEstadoReejecucion {
  permitido: boolean
  razon?: string
}

async function validarEstadoParaReejecucion(
  db: D1Database,
  proyectoId: number
): Promise<{ permitido: boolean; razon?: string }>
```

**Estados que permiten re-ejecución:**
- `PENDIENTE_REVISION` (3)
- `EVALUANDO_VIABILIDAD` (4)
- `EVALUANDO_PLAN_NEGOCIO` (5)
- `SEGUIMIENTO_COMERCIAL` (6)

**Estados que NO permiten re-ejecución:**
- `CREADO` (1)
- `EN_ANALISIS` (2)
- `ANALISIS_CON_ERROR` (9)
- `APROBADO` (8)
- `DESCARTADO` (7)

## 8. Referencias

- **Documentación de FASE 2:** [`plans/proyecto-PIA/MapaRuta/Fase02/Especificacion_API_PAI.md`](../Especificacion_API_PAI.md)
- **Documentación de FASE 2:** [`plans/proyecto-PIA/MapaRuta/Fase02/Servicio_Simulacion_IA.md`](../Servicio_Simulacion_IA.md)
- **Tipos TypeScript PAI:** [`apps/worker/src/types/pai.ts`](../../apps/worker/src/types/pai.ts)
- **Handlers de PAI:** [`apps/worker/src/handlers/pai-proyectos.ts`](../../apps/worker/src/handlers/pai-proyectos.ts), [`apps/worker/src/handlers/pai-notas.ts`](../../apps/worker/src/handlers/pai-notas.ts)
- **Inventario de Recursos:** [`.governance/inventario_recursos.md`](../../.governance/inventario_recursos.md)

---

**Fin del Documento**
