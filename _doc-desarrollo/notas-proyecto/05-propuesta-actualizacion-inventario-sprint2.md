# Propuesta de Actualización de Inventario - Sprint 2: Validaciones y UX (Notas PAI)

## Índice de Contenido

1. [Objetivo del Documento](#1-objetivo-del-documento)
2. [Criterio de Detección de Cambios](#2-criterio-de-detección-de-cambios)
3. [Resumen del Sprint 2](#3-resumen-del-sprint-2)
4. [Cambios en Backend](#4-cambios-en-backend)
5. [Cambios en Frontend](#5-cambios-en-frontend)
6. [Endpoints Nuevos](#6-endpoints-nuevos)
7. [Pendientes o No Verificables](#7-pendientes-o-no-verificables)
8. [Referencias](#8-referencias)

---

## 1. Objetivo del Documento

Este documento lista **todas las modificaciones, incorporaciones y actualizaciones** que deberían realizarse en `.governance/inventario_recursos.md` como consecuencia del trabajo realizado en el **Sprint 2: Validaciones y UX del Sistema de Notas PAI**.

**Importante:** Este documento es una **propuesta** para el agente `inventariador`. No modifica directamente el inventario.

---

## 2. Criterio de Detección de Cambios

Se han detectado cambios inventariables basándose en:

1. **Endpoints nuevos** - DELETE para eliminación de notas
2. **Archivos modificados** - Handlers de backend y componentes de frontend
3. **Validaciones añadidas** - Longitud de campos, editabilidad
4. **Mejoras de UX** - Mensajes de error específicos, advertencias
5. **Pipeline Events** - Eventos PROCESS_COMPLETE para operaciones de notas

---

## 3. Resumen del Sprint 2

**Duración:** 3 días (Día 4, 5, 6)

**Objetivo:** Completar validaciones y mejorar UX

### Criterios de Éxito Cumplidos

| Criterio | Estado |
|----------|--------|
| ✅ Eliminación valida cambios de estado | Completado |
| ✅ Retorna 403 con mensaje claro | Completado |
| ✅ Frontend muestra error apropiadamente | Completado |
| ✅ Eventos PROCESS_COMPLETE existen | Completado |
| ✅ Detalles incluyen estado_proyecto_creacion | Completado |
| ✅ Trazabilidad completa en pipeline_eventos | Completado |
| ✅ Validación de longitud de campos | Completado |
| ✅ Deploy en producción completado | Completado |

---

## 4. Cambios en Backend

### 4.1. `apps/worker/src/handlers/pai-notas.ts`

**Cambios realizados:**

| Función | Cambio | Propósito |
|---------|--------|-----------|
| `handleCrearNota()` | Actualizar evento a `PROCESS_COMPLETE` | Sprint 2 Día 5: Trazabilidad completa |
| `handleEditarNota()` | Actualizar evento a `PROCESS_COMPLETE` | Sprint 2 Día 5: Trazabilidad completa |
| `handleEliminarNota()` | **NUEVA FUNCIÓN** | Sprint 2 Día 4: Eliminación con validación |

**Detalle de `handleEliminarNota()`:**

```typescript
// DELETE /api/pai/proyectos/:id/notas/:notaId
export async function handleEliminarNota(c: AppContext): Promise<Response> {
  // 1. Obtener nota
  // 2. Validar editabilidad (estado no ha cambiado)
  // 3. Si no editable → retornar 403 con error_codigo: 'NOTA_NO_EDITABLE'
  // 4. Si editable → eliminar nota
  // 5. Registrar evento PROCESS_COMPLETE
}
```

**Validaciones implementadas:**

| Validación | Código de Error | HTTP Status |
|------------|-----------------|-------------|
| Nota no encontrada | - | 404 |
| Nota no editable (estado cambió) | `NOTA_NO_EDITABLE` | 403 |
| IDs inválidos | - | 400 |
| Error interno | - | 500 |

---

### 4.2. `apps/worker/src/index.ts`

**Endpoint registrado:**

```typescript
// Eliminar nota - Sprint 2 Día 4
app.delete('/api/pai/proyectos/:id/notas/:notaId', handleEliminarNota);
```

---

## 5. Cambios en Frontend

### 5.1. `apps/frontend/src/components/pai/ListaNotas.tsx`

**Cambios realizados:**

| Función | Cambio | Propósito |
|---------|--------|-----------|
| `handleNotaEliminada()` | Manejar error 403 | Sprint 2 Día 4: UX mejorada |

**Código actualizado:**

```typescript
const handleNotaEliminada = async (notaId: number) => {
  if (!confirm('¿Estás seguro de eliminar esta nota?')) return;

  const response = await paiApiClient.eliminarNota(proyectoId, notaId);

  if (response.success) {
    setNotas(notas.filter(n => n.id !== notaId));
    onNotaEliminada?.(notaId);
  } else {
    // Sprint 2 Día 4: Manejar error 403 - nota no editable
    if (response.error?.code === 'NOTA_NO_EDITABLE') {
      alert(`No se puede eliminar: ${response.error.message}`);
    } else {
      alert(response.error?.message || 'Error al eliminar nota');
    }
  }
};
```

---

### 5.2. `apps/frontend/src/components/pai/FormularioNota.tsx`

**Cambios realizados:**

| Validación | Campo | Mínimo | Máximo |
|------------|-------|--------|--------|
| Longitud de asunto | `asunto` | 3 caracteres | 200 caracteres |
| Longitud de autor | `autor` | 2 caracteres | 100 caracteres |
| Longitud de contenido | `contenido` | 10 caracteres | 5000 caracteres |

**Código actualizado:**

```typescript
// Sprint 2 Día 6: Validaciones de longitud de campos
if (!asunto.trim()) {
  setError('El asunto es obligatorio');
  return;
}
if (asunto.trim().length < 3) {
  setError('El asunto debe tener al menos 3 caracteres');
  return;
}
if (asunto.length > 200) {
  setError('El asunto no puede exceder los 200 caracteres');
  return;
}

// Validar autor
if (!autor.trim()) {
  setError('El autor es obligatorio');
  return;
}
if (autor.trim().length < 2) {
  setError('El autor debe tener al menos 2 caracteres');
  return;
}
if (autor.length > 100) {
  setError('El autor no puede exceder los 100 caracteres');
  return;
}

// Validar contenido
if (!contenido.trim()) {
  setError('El contenido es obligatorio');
  return;
}
if (contenido.trim().length < 10) {
  setError('El contenido debe tener al menos 10 caracteres');
  return;
}
if (contenido.length > 5000) {
  setError('El contenido no puede exceder los 5000 caracteres');
  return;
}
```

---

## 6. Endpoints Nuevos

### 6.1. DELETE /api/pai/proyectos/:id/notas/:notaId

**Descripción:** Eliminar una nota existente con validación de editabilidad

**Request:**
```http
DELETE /api/pai/proyectos/:id/notas/:notaId
```

**Response (200 - Éxito):**
```json
{
  "mensaje": "Nota eliminada correctamente",
  "nota_eliminada": {
    "id": 1,
    "proyecto_id": 42
  }
}
```

**Response (403 - Nota no editable):**
```json
{
  "error": "La nota no se puede eliminar. El estado del proyecto ha cambiado desde su creación.",
  "error_codigo": "NOTA_NO_EDITABLE"
}
```

**Response (404 - Nota no encontrada):**
```json
{
  "error": "Nota no encontrada"
}
```

---

## 7. Pipeline Events Actualizados

### 7.1. Eventos de Notas

| Operación | Evento | Nivel | tipoEvento |
|-----------|--------|-------|------------|
| Crear nota | `crear_nota` | INFO | `PROCESS_COMPLETE` |
| Editar nota | `editar_nota` | INFO | `PROCESS_COMPLETE` |
| Eliminar nota (éxito) | `eliminar_nota` | INFO | `PROCESS_COMPLETE` |
| Eliminar nota (error - no editable) | `eliminar_nota` | WARNING | `STEP_FAILED` |

**Detalle de evento (crear nota):**
```typescript
{
  entityId: `proyecto-${proyectoId}`,
  paso: 'crear_nota',
  nivel: 'INFO',
  tipoEvento: 'PROCESS_COMPLETE',
  detalle: `Nota creada: ${notaId}, estado_proyecto_creacion: ${proyecto.estado_nombre}`,
}
```

---

## 8. Pendientes o No Verificables

### 8.1. Sin Cambios en Recursos Cloudflare

| Recurso | Cambio | Estado |
|---------|--------|--------|
| Workers | Ninguno | Sin cambios |
| D1 | Ninguno | Sin cambios |
| R2 | Ninguno | Sin cambios |
| KV | Ninguno | Sin cambios |

### 8.2. Deploy Realizados

| Recurso | URL/ID | Estado |
|---------|--------|--------|
| **Backend** | `b5b4ea4c-17ae-4562-8c13-a3691ebdeff3` | ✅ Completado |
| **Frontend** | https://0bacd1e2.pg-cbc-endes.pages.dev | ✅ Completado |

---

## 9. Referencias

### 9.1. Documentos Relacionados

| Documento | Ruta |
|-----------|------|
| **ROADMAP** | `_doc-desarrollo/notas-proyecto/03-plan-implementacion-notas.md` |
| **Especificación Técnica** | `_doc-desarrollo/notas-proyecto/01-notas-proyectos-pai-extraccion-completa.md` |
| **Diagnóstico** | `_doc-desarrollo/notas-proyecto/02-diagnostico-implementacion-notas.md` |

### 9.2. Archivos Modificados

| Archivo | Ruta | Cambios |
|---------|------|---------|
| `pai-notas.ts` | `apps/worker/src/handlers/` | Nueva función `handleEliminarNota()`, eventos PROCESS_COMPLETE |
| `index.ts` (worker) | `apps/worker/src/` | Registro endpoint DELETE |
| `ListaNotas.tsx` | `apps/frontend/src/components/pai/` | Manejo de error 403 |
| `FormularioNota.tsx` | `apps/frontend/src/components/pai/` | Validaciones de longitud |

---

## 10. Resumen para Inventariador

### Cambios a Registrar

| Elemento | Acción | Detalle |
|----------|--------|---------|
| **Endpoint DELETE** | Añadir | `DELETE /api/pai/proyectos/:id/notas/:notaId` |
| **Error Code** | Añadir | `NOTA_NO_EDITABLE` para eliminación bloqueada |
| **Pipeline Events** | Actualizar | `PROCESS_COMPLETE` para crear, editar, eliminar notas |

### Notas Importantes

1. **Sin nuevos recursos Cloudflare** - Solo cambios de código
2. **Endpoint DELETE** - Requiere validación de editabilidad
3. **Validaciones frontend** - Longitud de campos (asunto: 3-200, autor: 2-100, contenido: 10-5000)
4. **Error 403** - Se retorna cuando el estado del proyecto cambió desde la creación de la nota

---

**Documento generado:** 2026-03-29  
**Sprint:** Sprint 2 - Validaciones y UX (Notas PAI)  
**Estado:** ✅ COMPLETADO - Deploy completado  
**Próximo paso:** Invocar a `inventariador` para actualizar `.governance/inventario_recursos.md`
