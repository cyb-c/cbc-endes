# API Documentation - Sistema de Notas PAI

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Endpoints de Notas](#2-endpoints-de-notas)
3. [Modelos de Datos](#3-modelos-de-datos)
4. [Códigos de Error](#4-códigos-de-error)
5. [Ejemplos de Uso](#5-ejemplos-de-uso)
6. [Referencias](#6-referencias)

---

## 1. Resumen Ejecutivo

Esta documentación describe los endpoints de API para la gestión de notas en el Sistema de Notas PAI (Proyectos de Análisis Inmobiliario).

**Base URL:** `https://wk-backend-dev.cbconsulting.workers.dev/api`

**Autenticación:** No requerida (desarrollo)

---

## 2. Endpoints de Notas

### 2.1. POST /pai/proyectos/:id/notas

**Descripción:** Crear una nueva nota asociada a un proyecto PAI.

**Método:** `POST`

**URL:** `/pai/proyectos/:id/notas`

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | integer | Sí | ID del proyecto PAI |

**Request Body:**

```json
{
  "tipo_nota_id": 1,
  "autor": "Juan Pérez",
  "asunto": "Revisión estructural",
  "contenido": "Se observa grieta en pared principal de aproximadamente 2mm."
}
```

**Campos del Request:**

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `tipo_nota_id` | integer | Sí | 1-4 (Comentario, Valoración, Decisión, Corrección IA) |
| `autor` | string | Sí | 2-100 caracteres |
| `asunto` | string | Sí | 3-200 caracteres |
| `contenido` | string | Sí | 10-5000 caracteres |

**Response (201 - Created):**

```json
{
  "nota": {
    "id": 1,
    "proyecto_id": 42,
    "tipo_nota_id": 1,
    "tipo": "Comentario",
    "asunto": "Revisión estructural",
    "estado_proyecto_creacion": "creado",
    "autor": "Juan Pérez",
    "contenido": "Se observa grieta en pared principal...",
    "fecha_creacion": "2026-03-30T10:00:00.000Z"
  }
}
```

**Response (400 - Bad Request):**

```json
{
  "error": "Datos de nota inválidos. Se requieren: tipo_nota_id, autor, asunto, contenido"
}
```

**Response (404 - Not Found):**

```json
{
  "error": "Proyecto no encontrado"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "error": "Error interno del servidor"
}
```

---

### 2.2. PUT /pai/proyectos/:id/notas/:notaId

**Descripción:** Editar una nota existente. Solo permite modificar el contenido.

**Método:** `PUT`

**URL:** `/pai/proyectos/:id/notas/:notaId`

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | integer | Sí | ID del proyecto PAI |
| `notaId` | integer | Sí | ID de la nota a editar |

**Request Body:**

```json
{
  "contenido": "Contenido actualizado de la nota..."
}
```

**Campos del Request:**

| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| `contenido` | string | Sí | 10-5000 caracteres |

**Response (200 - OK):**

```json
{
  "nota": {
    "id": 1,
    "proyecto_id": 42,
    "tipo_nota_id": 1,
    "tipo": "Comentario",
    "autor": "Juan Pérez",
    "contenido": "Contenido actualizado de la nota...",
    "fecha_creacion": "2026-03-30T10:00:00.000Z"
  }
}
```

**Response (403 - Forbidden):**

```json
{
  "error": "La nota no es editable. El estado del proyecto ha cambiado."
}
```

**Response (404 - Not Found):**

```json
{
  "error": "Nota no encontrada"
}
```

**Response (400 - Bad Request):**

```json
{
  "error": "Contenido inválido"
}
```

---

### 2.3. DELETE /pai/proyectos/:id/notas/:notaId

**Descripción:** Eliminar una nota existente. Valida que el estado del proyecto no haya cambiado.

**Método:** `DELETE`

**URL:** `/pai/proyectos/:id/notas/:notaId`

**Parámetros de URL:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | integer | Sí | ID del proyecto PAI |
| `notaId` | integer | Sí | ID de la nota a eliminar |

**Response (200 - OK):**

```json
{
  "mensaje": "Nota eliminada correctamente",
  "nota_eliminada": {
    "id": 1,
    "proyecto_id": 42
  }
}
```

**Response (403 - Forbidden):**

```json
{
  "error": "La nota no se puede eliminar. El estado del proyecto ha cambiado desde su creación.",
  "error_codigo": "NOTA_NO_EDITABLE"
}
```

**Response (404 - Not Found):**

```json
{
  "error": "Nota no encontrada"
}
```

**Response (400 - Bad Request):**

```json
{
  "error": "IDs de proyecto o nota inválidos"
}
```

---

## 3. Modelos de Datos

### 3.1. Nota

```typescript
interface Nota {
  id: number;
  proyecto_id: number;
  tipo_nota_id: number;
  tipo: string;
  asunto: string;
  estado_proyecto_creacion: string;
  autor: string;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  usuario_id?: number;
  esEditable?: boolean;
  razonNoEditable?: string;
}
```

**Campos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | ID único de la nota |
| `proyecto_id` | number | ID del proyecto asociado |
| `tipo_nota_id` | number | ID del tipo de nota (1-4) |
| `tipo` | string | Nombre del tipo (Comentario, Valoración, etc.) |
| `asunto` | string | Título/resumen de la nota |
| `estado_proyecto_creacion` | string | Estado del proyecto al crear la nota |
| `autor` | string | Nombre del autor de la nota |
| `contenido` | string | Contenido completo de la nota |
| `fecha_creacion` | string | Fecha de creación (ISO 8601) |
| `fecha_actualizacion` | string | Fecha de última actualización (ISO 8601) |
| `usuario_id` | number | ID del usuario (opcional) |
| `esEditable` | boolean | Indica si la nota es editable |
| `razonNoEditable` | string | Razón por la que no es editable |

### 3.2. Tipos de Nota

| tipo_nota_id | tipo | Descripción |
|--------------|------|-------------|
| 1 | Comentario | Nota de tipo comentario general |
| 2 | Valoración | Nota de tipo valoración |
| 3 | Decisión | Nota de tipo decisión |
| 4 | Corrección IA | Nota de tipo corrección para IA |

---

## 4. Códigos de Error

### 4.1. Errores de Notas

| Código | HTTP | Descripción |
|--------|------|-------------|
| `NOTA_NO_EDITABLE` | 403 | La nota no se puede editar/eliminar porque el estado del proyecto cambió |
| `VALIDATION_ERROR` | 400 | Error de validación de campos |
| `NOT_FOUND` | 404 | Nota o proyecto no encontrado |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |

### 4.2. Errores de Validación

| Campo | Error | Mensaje |
|-------|-------|---------|
| `tipo_nota_id` | Requerido | "Datos de nota inválidos. Se requieren: tipo_nota_id, autor, asunto, contenido" |
| `autor` | Requerido | "El autor es obligatorio" |
| `autor` | Longitud | "El autor debe tener al menos 2 caracteres" |
| `autor` | Máximo | "El autor no puede exceder los 100 caracteres" |
| `asunto` | Requerido | "El asunto es obligatorio" |
| `asunto` | Longitud | "El asunto debe tener al menos 3 caracteres" |
| `asunto` | Máximo | "El asunto no puede exceder los 200 caracteres" |
| `contenido` | Requerido | "El contenido es obligatorio" |
| `contenido` | Longitud | "El contenido debe tener al menos 10 caracteres" |
| `contenido` | Máximo | "El contenido no puede exceder los 5000 caracteres" |

---

## 5. Ejemplos de Uso

### 5.1. cURL

#### Crear Nota

```bash
curl -X POST "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/42/notas" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_nota_id": 1,
    "autor": "Juan Pérez",
    "asunto": "Revisión estructural",
    "contenido": "Se observa grieta en pared principal de aproximadamente 2mm."
  }'
```

#### Editar Nota

```bash
curl -X PUT "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/42/notas/1" \
  -H "Content-Type: application/json" \
  -d '{
    "contenido": "Contenido actualizado de la nota..."
  }'
```

#### Eliminar Nota

```bash
curl -X DELETE "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/42/notas/1"
```

### 5.2. JavaScript (Fetch)

#### Crear Nota

```javascript
const response = await fetch(`${API_BASE_URL}/api/pai/proyectos/42/notas`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tipo_nota_id: 1,
    autor: 'Juan Pérez',
    asunto: 'Revisión estructural',
    contenido: 'Se observa grieta en pared principal...',
  }),
});

const data = await response.json();

if (response.ok) {
  console.log('Nota creada:', data.nota);
} else {
  console.error('Error:', data.error);
}
```

#### Editar Nota

```javascript
const response = await fetch(`${API_BASE_URL}/api/pai/proyectos/42/notas/1`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contenido: 'Contenido actualizado...',
  }),
});

const data = await response.json();

if (response.ok) {
  console.log('Nota editada:', data.nota);
} else if (response.status === 403) {
  console.error('Nota no editable:', data.error);
}
```

#### Eliminar Nota

```javascript
const response = await fetch(`${API_BASE_URL}/api/pai/proyectos/42/notas/1`, {
  method: 'DELETE',
});

const data = await response.json();

if (response.ok) {
  console.log('Nota eliminada:', data.nota_eliminada);
} else if (response.status === 403) {
  console.error('No se puede eliminar:', data.error);
}
```

---

## 6. Referencias

### 6.1. Documentos Relacionados

| Documento | Ruta |
|-----------|------|
| **ROADMAP** | `_doc-desarrollo/notas-proyecto/03-plan-implementacion-notas.md` |
| **Especificación Técnica** | `_doc-desarrollo/notas-proyecto/01-notas-proyectos-pai-extraccion-completa.md` |
| **Test Cases** | `_doc-desarrollo/notas-proyecto/06-test-cases-notas.md` |

### 6.2. Endpoints Relacionados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/pai/proyectos/:id` | GET | Obtener detalles del proyecto (incluye notas) |
| `/api/pai/proyectos/:id/pipeline` | GET | Obtener eventos de pipeline (incluye eventos de notas) |

---

**Documento generado:** 2026-03-30  
**Sprint:** Sprint 3 - Testing y Documentación  
**Estado:** ✅ COMPLETADO - API documentation completa  
**Próximo paso:** Crear guía de usuario
