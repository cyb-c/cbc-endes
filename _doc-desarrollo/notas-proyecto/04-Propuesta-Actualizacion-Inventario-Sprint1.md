# Propuesta de Actualización de Inventario - Sprint 1: Correcciones Críticas (Notas PAI)

## Índice de Contenido

1. [Objetivo del Documento](#1-objetivo-del-documento)
2. [Criterio de Detección de Cambios](#2-criterio-de-detección-de-cambios)
3. [Resumen de Cambios del Sprint 1](#3-resumen-de-cambios-del-sprint-1)
4. [Archivos Modificados](#4-archivos-modificados)
5. [Recursos Cloudflare](#5-recursos-cloudflare)
6. [Contratos de Servicio](#6-contratos-de-servicio)
7. [Puntos Pendientes o No Verificables](#7-puntos-pendientes-o-no-verificables)
8. [Referencias](#8-referencias)

---

## 1. Objetivo del Documento

Este documento lista **todas las modificaciones, incorporaciones y actualizaciones** que deberían realizarse en `.governance/inventario_recursos.md` como consecuencia del trabajo realizado en el **Sprint 1: Correcciones Críticas del Sistema de Notas PAI**.

**Importante:** Este documento es una **propuesta** para el agente `inventariador`. No modifica directamente el inventario.

---

## 2. Criterio de Detección de Cambios

Se han detectado cambios inventariables basándose en:

1. **Archivos modificados** - Cambios en tipos, handlers, componentes existentes
2. **Cambios en contratos de servicio** - Modificaciones en request/response de APIs
3. **Nuevos campos en tipos de datos** - Campos `asunto` y `estado_proyecto_creacion`
4. **Cambios en comportamiento de endpoints** - Endpoint de crear nota ahora acepta `asunto`

---

## 3. Resumen de Cambios del Sprint 1

### 3.1. Visión General

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| **Archivos Modificados** | 4 | `types/pai.ts`, `pai-notas.ts`, `FormularioNota.tsx`, `ListaNotas.tsx` |
| **Recursos Cloudflare** | 0 | No se crean recursos nuevos |
| **Campos Nuevos en API** | 2 | `asunto`, `estado_proyecto_creacion` |
| **Endpoints Modificados** | 1 | `POST /api/pai/proyectos/:id/notas` |

### 3.2. Impacto en Inventario

| Sección del Inventario | ¿Requiere Actualización? | Motivo |
|------------------------|--------------------------|--------|
| **8. Contratos entre Servicios** | ⚠️ Sí | Endpoint de crear nota ahora acepta `asunto` y retorna `estado_proyecto_creacion` |
| **11. Archivos de Configuración** | ⚠️ Sí (notas) | Tipos TypeScript actualizados |

---

## 4. Archivos Modificados

### 4.1. `apps/frontend/src/types/pai.ts`

**Cambios principales:**

1. **Interface `Nota` ampliada:**
```typescript
// Antes
export interface Nota {
  id: number;
  proyecto_id: number;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_id?: number;
}

// Ahora (Sprint 1)
export interface Nota {
  id: number;
  proyecto_id: number;
  tipo_nota_id: number;       // ✅ Nuevo
  tipo: string;                // ✅ Nuevo
  asunto: string;              // ✅ Nuevo - Asunto/título de la nota
  estado_proyecto_creacion: string;  // ✅ Nuevo - VAL_nombre del estado al crear
  autor: string;               // ✅ Nuevo
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  usuario_id?: number;
  esEditable?: boolean;        // ✅ Nuevo - Calculado en frontend
  razonNoEditable?: string;    // ✅ Nuevo - Razón por la que no es editable
}
```

2. **Interface `CrearNotaRequest` ampliada:**
```typescript
// Antes
export interface CrearNotaRequest {
  tipo_nota_id: number;
  autor: string;
  contenido: string;
}

// Ahora (Sprint 1)
export interface CrearNotaRequest {
  tipo_nota_id: number;
  autor: string;
  asunto: string;      // ✅ Nuevo
  contenido: string;
}
```

**Motivo de actualización en inventario:**
- Nuevos campos críticos en tipos de notas
- Request de creación de nota ahora requiere `asunto`

---

### 4.2. `apps/worker/src/handlers/pai-notas.ts`

**Función modificada:** `handleCrearNota()`

**Cambios principales:**

1. **Request body ahora incluye `asunto`:**
```typescript
// Antes
const body = await c.req.json<{ 
  tipo_nota_id: number; 
  autor: string; 
  contenido: string;
}>()

// Ahora
const body = await c.req.json<{ 
  tipo_nota_id: number; 
  autor: string; 
  asunto: string;      // ✅ Nuevo
  contenido: string;
}>()
```

2. **Obtiene estado del proyecto al crear:**
```typescript
// Antes - Solo verificaba existencia
const proyecto = await db
  .prepare('SELECT PRO_id FROM PAI_PRO_proyectos WHERE PRO_id = ?')
  .bind(proyectoId)
  .first()

// Ahora - Obtiene estado y VAL_nombre
const proyecto = await db
  .prepare(`
    SELECT 
      p.PRO_id,
      p.PRO_estado_val_id,
      v.VAL_nombre as estado_nombre
    FROM PAI_PRO_proyectos p
    JOIN PAI_VAL_valores v ON p.PRO_estado_val_id = v.VAL_id
    WHERE p.PRO_id = ?
  `)
  .bind(proyectoId)
  .first()
```

3. **Inserta con `asunto` real y `estado_proyecto_creacion`:**
```typescript
// Antes - Usaba autor como asunto (workaround)
.bind(
  proyectoId,
  tipo_nota_id,
  autor,  // ❌ Usaba autor como asunto
  contenido,
  1,
  autor,
)

// Ahora - Usa asunto real y guarda estado
.bind(
  proyectoId,
  tipo_nota_id,
  asunto,  // ✅ Ahora usa el asunto real
  contenido,
  proyecto.PRO_estado_val_id,  // ✅ Guarda estado como referencia
  1,
  autor,
)
```

4. **Response incluye campos completos:**
```typescript
// Antes
return c.json({
  nota: {
    id: notaId,
    tipo_nota_id,
    tipo: tipoNombre,
    autor,
    contenido,
    fecha_creacion: new Date().toISOString(),
  },
}, 201)

// Ahora
return c.json({
  nota: {
    id: notaId,
    proyecto_id: proyectoId,
    tipo_nota_id,
    tipo: tipoNombre,
    asunto,  // ✅ Incluye asunto
    estado_proyecto_creacion: proyecto.estado_nombre,  // ✅ Incluye estado como VAL_nombre
    autor,
    contenido,
    fecha_creacion: new Date().toISOString(),
  },
}, 201)
```

**Motivo de actualización en inventario:**
- Endpoint cambia request/response significativamente
- Nueva validación de `asunto` requerido
- Response ahora incluye `estado_proyecto_creacion`

---

### 4.3. `apps/frontend/src/components/pai/FormularioNota.tsx`

**Cambios principales:**

1. **Nuevo estado para `asunto`:**
```typescript
const [asunto, setAsunto] = useState(''); // ✅ Nuevo estado
```

2. **Validación de `asunto`:**
```typescript
// Validar asunto
if (!asunto.trim()) {
  setError('El asunto es obligatorio');
  return;
}
```

3. **Envío incluye `asunto`:**
```typescript
// Antes
const response = await paiApiClient.crearNota(proyectoId, {
  tipo_nota_id: tipoNota,
  autor: autor.trim(),
  contenido
});

// Ahora
const response = await paiApiClient.crearNota(proyectoId, {
  tipo_nota_id: tipoNota,
  autor: autor.trim(),
  asunto: asunto.trim(),  // ✅ Nuevo
  contenido
});
```

4. **Nuevo campo UI para `asunto`:**
```tsx
{/* Campo: Asunto */}
<div className="mb-3">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Asunto <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    value={asunto}
    onChange={(e) => setAsunto(e.target.value)}
    placeholder="Asunto de la nota"
    className="w-full p-3 border border-gray-300 rounded-lg ..."
    disabled={loading}
    required
  />
</div>
```

**Motivo de actualización en inventario:**
- Formulario ahora tiene 4 campos (tipo, autor, asunto, contenido)
- Nueva validación de `asunto` requerido

---

### 4.4. `apps/frontend/src/components/pai/ListaNotas.tsx`

**Cambios principales:**

1. **Muestra `asunto` como título:**
```tsx
// Antes
<h3 className="font-medium">📝 Nota</h3>

// Ahora
<div>
  <h3 className="font-medium text-lg">{nota.asunto || '📝 Nota'}</h3>
  {nota.estado_proyecto_creacion && (
    <span className="text-xs text-gray-500 italic">
      Estado al crear: {nota.estado_proyecto_creacion}
    </span>
  )}
</div>
```

2. **Muestra `estado_proyecto_creacion`:**
```tsx
{/* Sprint 1: Mostrar estado_proyecto_creacion */}
{nota.estado_proyecto_creacion && (
  <span className="text-xs text-gray-500 italic">
    Estado al crear: {nota.estado_proyecto_creacion}
  </span>
)}
```

3. **Muestra `autor` en metadata:**
```tsx
// Antes
<div className="text-sm text-gray-500">
  Creado: {new Date(nota.fecha_creacion).toLocaleString('es-ES')}
  ...
</div>

// Ahora
<div className="text-sm text-gray-500">
  Autor: {nota.autor} • Creado: {new Date(nota.fecha_creacion).toLocaleString('es-ES')}
  ...
</div>
```

**Motivo de actualización en inventario:**
- UI ahora muestra asunto, autor y estado de creación
- Mejor trazabilidad visual de notas

---

## 5. Recursos Cloudflare

### 5.1. Sin Cambios

**No se requieren nuevos recursos Cloudflare para Sprint 1.**

El sistema de notas:
- Usa `db-cbconsulting` D1 existente
- Usa `wk-backend-dev` Worker existente
- Usa `pg-cbc-endes` Pages existente
- No requiere nuevos bindings ni variables

---

## 6. Contratos de Servicio

### 6.1. Endpoint Modificado

**Endpoint:** `POST /api/pai/proyectos/:id/notas`

**Request actualizado:**
```json
// Antes
{
  "tipo_nota_id": 1,
  "autor": "Juan Pérez",
  "contenido": "Texto de la nota"
}

// Ahora (Sprint 1)
{
  "tipo_nota_id": 1,
  "autor": "Juan Pérez",
  "asunto": "Observación sobre ubicación",  // ✅ Nuevo campo requerido
  "contenido": "Texto de la nota"
}
```

**Response actualizado:**
```json
// Antes
{
  "nota": {
    "id": 1,
    "tipo_nota_id": 1,
    "tipo": "Comentario",
    "autor": "Juan Pérez",
    "contenido": "Texto de la nota",
    "fecha_creacion": "2026-03-29T19:00:00.000Z"
  }
}

// Ahora (Sprint 1)
{
  "nota": {
    "id": 1,
    "proyecto_id": 42,
    "tipo_nota_id": 1,
    "tipo": "Comentario",
    "asunto": "Observación sobre ubicación",  // ✅ Nuevo
    "estado_proyecto_creacion": "creado",     // ✅ Nuevo - VAL_nombre
    "autor": "Juan Pérez",
    "contenido": "Texto de la nota",
    "fecha_creacion": "2026-03-29T19:00:00.000Z"
  }
}
```

**Motivo de actualización en inventario:**
- Request ahora requiere campo `asunto`
- Response incluye `asunto` y `estado_proyecto_creacion`
- Response incluye `proyecto_id`

---

## 7. Puntos Pendientes o No Verificables

### 7.1. Pruebas E2E

**Estado:** ⏳ **Pendientes de ejecutar**

**Casos a verificar:**
- Crear nota con asunto funciona correctamente
- Lista muestra asunto y estado de creación
- Validación de asunto requerido funciona
- Response incluye todos los campos nuevos

**Acción requerida:**
```bash
# Verificar en navegador
https://pg-cbc-endes.pages.dev/proyectos/{id}

# 1. Click en "Agregar Nota"
# 2. Completar: Tipo, Autor, Asunto, Contenido
# 3. Verificar: Nota aparece con asunto y estado
```

### 7.2. Migración de Datos Existentes

**Estado:** ⚠️ **No aplicable**

Las notas existentes en la base de datos:
- Tienen `NOT_asunto` poblado con el valor de `autor` (workaround anterior)
- No tienen `NOT_estado_val_id` poblado (campo nullable según migración 010)

**Acción requerida:** Ninguna - las notas existentes seguirán funcionando, las nuevas tendrán datos completos.

---

## 8. Referencias

### 8.1. Documentos del Proyecto

| Documento | Ruta |
|-----------|------|
| **Especificación Técnica** | `_doc-desarrollo/notas-proyecto/01-notas-proyectos-pai-extraccion-completa.md` |
| **Diagnóstico** | `_doc-desarrollo/notas-proyecto/02-diagnostico-implementacion-notas.md` |
| **Plan de Implementación** | `_doc-desarrollo/notas-proyecto/03-plan-implementacion-notas.md` |
| **Inventario Actual (v16.0)** | `.governance/inventario_recursos.md` |

### 8.2. Archivos Implementados

| Archivo | Ruta | Cambios |
|---------|------|---------|
| **Tipos Frontend** | `apps/frontend/src/types/pai.ts` | Interfaces `Nota` y `CrearNotaRequest` ampliadas |
| **Backend Handler** | `apps/worker/src/handlers/pai-notas.ts` | `handleCrearNota()` actualizada |
| **Formulario** | `apps/frontend/src/components/pai/FormularioNota.tsx` | Campo `asunto` añadido |
| **Lista** | `apps/frontend/src/components/pai/ListaNotas.tsx` | Muestra `asunto`, `autor`, `estado_proyecto_creacion` |

---

## 9. Resumen para Inventariador

### Cambios a Registrar

| Elemento | Acción | Detalle |
|----------|--------|---------|
| **Tipos Frontend** | Actualizar | `types/pai.ts` - Interfaces `Nota` y `CrearNotaRequest` con campos `asunto` y `estado_proyecto_creacion` |
| **Backend Handler** | Actualizar nota | `pai-notas.ts` - `handleCrearNota()` ahora acepta `asunto` y retorna `estado_proyecto_creacion` |
| **Formulario** | Actualizar nota | `FormularioNota.tsx` - 4 campos (tipo, autor, asunto, contenido) |
| **Lista** | Actualizar nota | `ListaNotas.tsx` - Muestra asunto, autor y estado de creación |
| **Contrato API** | Actualizar | `POST /api/pai/proyectos/:id/notas` - Request/Response actualizados |

### Notas Importantes

1. **Sin nuevos recursos Cloudflare** - Solo cambios de código
2. **Endpoint existente** - Mismo endpoint, campo `asunto` añadido
3. **Campo `estado_proyecto_creacion`** - Se guarda como `VAL_nombre` (ej: "creado", "analisis_finalizado"), NO como `VAL_id`
4. **Backward compatibility** - Notas existentes siguen funcionando, nuevas tienen datos completos

---

**Documento generado:** 2026-03-29  
**Sprint:** Sprint 1 - Correcciones Críticas (Notas PAI)  
**Estado:** Pendiente de revisión por `inventariador`  
**Próximo paso:** Invocar a `inventariador` para actualizar `.governance/inventario_recursos.md`

**Despliegues completados:**
- ✅ Backend: https://wk-backend-dev.cbconsulting.workers.dev (Version ID: `6462b834-6df8-42f3-aaab-dde09c9d45e9`)
- ✅ Frontend: https://4958b31f.pg-cbc-endes.pages.dev
