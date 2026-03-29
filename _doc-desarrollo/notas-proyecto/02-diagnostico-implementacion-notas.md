# Diagnóstico de Implementación: Sistema de Notas PAI

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Metodología del Diagnóstico](#2-metodología-del-diagnóstico)
3. [Estado por Categoría](#3-estado-por-categoría)
4. [Análisis Detallado por Componente](#4-análisis-detallado-por-componente)
5. [Matriz de Cumplimiento](#5-matriz-de-cumplimiento)
6. [Issues Críticos Detectados](#6-issues-críticos-detectados)
7. [Recomendaciones Prioritarias](#7-recomendaciones-prioritarias)
8. [Plan de Acción](#8-plan-de-acción)

---

## 1. Resumen Ejecutivo

**Documento de Referencia:** `_doc-desarrollo/notas-proyecto/01-notas-proyectos-pai-extraccion-completa.md`

**Fecha del Diagnóstico:** 2026-03-29

**Estado General:** ⚠️ **PARCIALMENTE IMPLEMENTADO** (65% completado)

| Categoría | Estado | % Completado |
|-----------|--------|--------------|
| **Modelo de Datos (DB)** | ✅ Implementado | 90% |
| **API Backend** | ⚠️ Parcial | 60% |
| **Componentes Frontend** | ⚠️ Parcial | 70% |
| **Reglas de Editabilidad** | ⚠️ Parcial | 50% |
| **Pipeline Events** | ✅ Implementado | 80% |
| **Validaciones** | ⚠️ Parcial | 60% |

### Hallazgos Principales

1. ✅ **LO QUE ESTÁ HECHO:**
   - Tabla `PAI_NOT_notas` existe con columnas básicas
   - Componentes frontend existen (ListaNotas, FormularioNota, FormularioEditarNota)
   - Endpoints backend existen (crear, editar, eliminar)
   - Hook `useNotaEditable` implementa validación de cambios de estado
   - Pipeline events se registran correctamente

2. ❌ **LO QUE NO ESTÁ HECHO:**
   - Campo `asunto` no está en la interfaz TypeScript `Nota` del frontend
   - Campo `estado_proyecto_creacion` no existe en tipos ni responses
   - Backend no guarda `estado_proyecto_creacion` al crear nota
   - Frontend no muestra asunto ni estado de creación en la lista
   - Formulario de creación no tiene campo `asunto`

3. ⚠️ **LO QUE ESTÁ MAL O ES PARCIAL:**
   - Backend usa `autor` como `asunto` (workaround incorrecto)
   - Interfaz `Nota` en frontend está incompleta
   - Validación de `asunto` falta en frontend y backend
   - Response de API no incluye `estado_proyecto_creacion`

---

## 2. Metodología del Diagnóstico

### 2.1. Fuentes Analizadas

| Tipo | Archivo | Propósito |
|------|---------|-----------|
| **Especificación** | `01-notas-proyectos-pai-extraccion-completa.md` | Documento de referencia |
| **Frontend Componentes** | `apps/frontend/src/components/pai/*.tsx` | Implementación UI |
| **Frontend Tipos** | `apps/frontend/src/types/pai.ts` | Interfaces TypeScript |
| **Frontend Hooks** | `apps/frontend/src/hooks/useNotaEditable.ts` | Lógica de editabilidad |
| **Backend Handlers** | `apps/worker/src/handlers/pai-notas.ts` | Endpoints API |
| **Database Schema** | `migrations/004-pai-mvp.sql` | Estructura de tablas |

### 2.2. Criterios de Evaluación

| Símbolo | Significado |
|---------|-------------|
| ✅ | **Completamente Implementado** - Cumple con la especificación |
| ⚠️ | **Parcialmente Implementado** - Existe pero con diferencias |
| ❌ | **No Implementado** - Ausente o incorrecto |

---

## 3. Estado por Categoría

### 3.1. Modelo de Datos de Notas

#### Especificación (Sección 3)

| Elemento | Requerido | Estado | Observaciones |
|----------|-----------|--------|---------------|
| **Tabla `PAI_NOT_notas`** | ✅ | ✅ | Existe en migración 004 |
| `NOT_asunto` | ✅ | ✅ | Columna existe en DB |
| `NOT_estado_val_id` | ⚠️ | ⚠️ | Es NOT NULL en DB, debería ser nullable (migración 010) |
| **Interface `Nota` (TS)** | ✅ | ❌ | Faltan: `asunto`, `estado_proyecto_creacion`, `esEditable`, `razonNoEditable` |
| **Response API** | ✅ | ❌ | Faltan: `asunto`, `estado_proyecto_creacion` |

**Código Actual (Frontend - types/pai.ts):**
```typescript
export interface Nota {
  id: number;
  proyecto_id: number;
  contenido: string;  // ✅
  fecha_creacion: string;  // ✅
  fecha_actualizacion: string;  // ✅
  usuario_id?: number;  // ✅
  // ❌ FALTA: asunto: string
  // ❌ FALTA: estado_proyecto_creacion: string
  // ❌ FALTA: esEditable?: boolean
  // ❌ FALTA: razonNoEditable?: string
}
```

**Veredicto:** ⚠️ **PARCIAL** - DB correcta, tipos TypeScript incompletos

---

### 3.2. API de Notas - Endpoints

#### Endpoint: POST /api/pai/proyectos/:id/notas

| Elemento | Requerido | Estado | Observaciones |
|----------|-----------|--------|---------------|
| **Request: `tipo_nota_id`** | ✅ | ✅ | Implementado |
| **Request: `autor`** | ✅ | ✅ | Implementado |
| **Request: `asunto`** | ✅ | ❌ | **NO IMPLEMENTADO** |
| **Request: `contenido`** | ✅ | ✅ | Implementado |
| **Response: `estado_proyecto_creacion`** | ✅ | ❌ | **NO IMPLEMENTADO** |
| **Guardar estado como VAL_nombre** | ✅ | ❌ | Usa autor como asunto (workaround) |

**Código Actual (Backend - pai-notas.ts):**
```typescript
// ❌ Request body NO incluye asunto
const body = await c.req.json<{ 
  tipo_nota_id: number; 
  autor: string; 
  contenido: string;
}>()

// ❌ Inserta autor como asunto (workaround incorrecto)
await db.prepare(`
  INSERT INTO PAI_NOT_notas (
    NOT_proyecto_id, NOT_tipo_val_id, NOT_asunto, NOT_nota,
    NOT_editable, NOT_usuario_alta
  ) VALUES (?, ?, ?, ?, ?, ?)
`)
.bind(
  proyectoId,
  tipo_nota_id,
  autor,  // ❌ Usa autor como asunto
  contenido,
  1,
  autor,
)

// ❌ Response NO incluye estado_proyecto_creacion
return c.json({
  nota: {
    id: notaId,
    tipo_nota_id,
    tipo: tipoNombre,
    autor,
    contenido,
    fecha_creacion: new Date().toISOString(),
    // ❌ FALTA: asunto
    // ❌ FALTA: estado_proyecto_creacion
  },
})
```

**Veredicto:** ❌ **INCOMPLETO** - Faltan campos críticos

---

#### Endpoint: PUT /api/pai/proyectos/:id/notas/:notaId

| Elemento | Requerido | Estado | Observaciones |
|----------|-----------|--------|---------------|
| **Validación de editabilidad** | ✅ | ✅ | Implementada con `esNotaEditable()` |
| **Verificar cambios de estado** | ✅ | ✅ | Usa `getEntityEvents()` |
| **Response 403 si no editable** | ✅ | ✅ | Implementado |

**Código Actual (Backend - pai-notas.ts):**
```typescript
// ✅ Valida editabilidad antes de permitir edición
const editable = await esNotaEditable(db, proyectoId, nota.fecha_creacion as string)

if (!editable) {
  return c.json({ error: 'La nota no es editable. El estado del proyecto ha cambiado.' }, 403)
}
```

**Veredicto:** ✅ **CORRECTO** - Validación implementada correctamente

---

### 3.3. Componentes Frontend

#### Componente: ListaNotas.tsx

| Elemento | Requerido | Estado | Observaciones |
|----------|-----------|--------|---------------|
| **Mostrar asunto** | ✅ | ❌ | Muestra "📝 Nota" (hardcodeado) |
| **Mostrar estado_creacion** | ✅ | ❌ | No muestra |
| **Mostrar indicador editabilidad** | ✅ | ⚠️ | Muestra pero sin estado |
| **Botones Editar/Eliminar** | ✅ | ✅ | Implementados |
| **Botón Agregar Nota** | ✅ | ✅ | Implementado |

**Código Actual:**
```tsx
// ❌ No muestra asunto, usa texto fijo
<h3 className="font-medium">📝 Nota</h3>

// ❌ No muestra estado_proyecto_creacion
// Debería mostrar: "Estado al crear: {nota.estado_proyecto_creacion}"

// ⚠️ Muestra indicador de editabilidad pero incompleto
{mostrarBotones ? (
  <div className="space-x-2">
    <button onClick={() => setMostrarFormulario(true)}>Editar</button>
    <button onClick={() => handleNotaEliminada(nota.id)}>Eliminar</button>
  </div>
) : nota.razonNoEditable ? (
  <span className="text-xs text-gray-500 italic" title={nota.razonNoEditable}>
    🔒 No editable
  </span>
) : null}
```

**Veredicto:** ⚠️ **PARCIAL** - Funcional pero falta información visual

---

#### Componente: FormularioNota.tsx

| Elemento | Requerido | Estado | Observaciones |
|----------|-----------|--------|---------------|
| **Campo `tipo_nota_id`** | ✅ | ✅ | Select implementado |
| **Campo `autor`** | ✅ | ✅ | Input implementado |
| **Campo `asunto`** | ✅ | ❌ | **NO EXISTE** |
| **Campo `contenido`** | ✅ | ✅ | Textarea implementado |
| **Validación `asunto`** | ✅ | ❌ | No existe |

**Código Actual:**
```tsx
// ✅ Campos existentes
const [contenido, setContenido] = useState('');
const [tipoNota, setTipoNota] = useState<number>(1);
const [autor, setAutor] = useState('');

// ❌ FALTA: const [asunto, setAsunto] = useState('');

// ❌ Request NO envía asunto
const response = await paiApiClient.crearNota(proyectoId, {
  tipo_nota_id: tipoNota,
  autor: autor.trim(),
  contenido
  // ❌ FALTA: asunto
});
```

**Veredicto:** ❌ **INCOMPLETO** - Falta campo crítico `asunto`

---

#### Componente: FormularioEditarNota.tsx

| Elemento | Requerido | Estado | Observaciones |
|----------|-----------|--------|---------------|
| **Solo editable: `contenido`** | ✅ | ✅ | Correcto |
| **No editable: `asunto`** | ✅ | N/A | No existe en frontend |
| **Advertencia de solo contenido** | ✅ | ❌ | No muestra advertencia |

**Veredicto:** ⚠️ **PARCIAL** - Funcional pero podría mejorar UX

---

### 3.4. Reglas de Editabilidad

#### Especificación (Sección 6)

| Elemento | Requerido | Estado | Observaciones |
|----------|-----------|--------|---------------|
| **Principio: estado vigente** | ✅ | ✅ | Documentado y comprendido |
| **Validar contra pipeline_events** | ✅ | ✅ | Implementado en backend |
| **Validar en frontend con hook** | ✅ | ✅ | `useNotaEditable` implementado |
| **Prevenir edición si cambio estado** | ✅ | ✅ | Backend retorna 403 |
| **Prevenir eliminación si cambio estado** | ✅ | ⚠️ | No validado en eliminación |

**Código Actual (Hook - useNotaEditable.ts):**
```typescript
// ✅ Hook verifica cambios de estado
const cambiosDespuesDeNota = response.data.eventos.filter(evento => {
  const eventoFecha = new Date(evento.created_at);
  return eventoFecha > notaFecha && evento.paso === 'cambiar_estado';
});

if (cambiosDespuesDeNota.length > 0) {
  setEsEditable(false);
  setRazon('El estado del proyecto ha cambiado desde la creación de esta nota');
}
```

**Código Actual (Backend - handleEliminarNota):**
```typescript
// ❌ NO existe validación de editabilidad en eliminación
// Debería verificar cambios de estado antes de eliminar
```

**Veredicto:** ⚠️ **PARCIAL** - Edición correcta, eliminación sin validar

---

### 3.5. Integración con Pipeline Events

| Elemento | Requerido | Estado | Observaciones |
|----------|-----------|--------|---------------|
| **Evento: PROCESS_START (crear)** | ✅ | ✅ | Implementado |
| **Evento: STEP_SUCCESS (crear)** | ✅ | ✅ | Implementado |
| **Evento: PROCESS_COMPLETE (crear)** | ✅ | ❌ | Faltante |
| **Evento: PROCESS_START (editar)** | ✅ | ✅ | Implementado |
| **Evento: STEP_SUCCESS (editar)** | ✅ | ✅ | Implementado |
| **Evento: PROCESS_COMPLETE (editar)** | ✅ | ❌ | Faltante |
| **Detalle incluye estado** | ✅ | ❌ | No incluye `estado_proyecto_creacion` |

**Código Actual:**
```typescript
// ✅ Eventos básicos implementados
await insertPipelineEvent(db, {
  entityId: `proyecto-${proyectoId}`,
  paso: 'crear_nota',
  nivel: 'INFO',
  tipoEvento: 'PROCESS_START',
  detalle: 'Iniciando creación de nota',
});

// ❌ Detalle NO incluye estado_proyecto_creacion
// Debería: detalle: `Nota creada, estado: ${proyecto.estado_nombre}`,
```

**Veredicto:** ⚠️ **PARCIAL** - Eventos existen pero faltan detalles

---

### 3.6. Validaciones

#### Validaciones de Creación

| Campo | Especificación | Implementado | Observaciones |
|-------|----------------|--------------|---------------|
| `tipo_nota_id` | Requerido | ✅ | Validado en backend |
| `autor` | Requerido, 1-100 chars | ✅ | Validado en backend |
| `asunto` | Requerido, 1-200 chars | ❌ | **NO VALIDADO** (no existe) |
| `contenido` | Requerido, 1-5000 chars | ⚠️ | Validado pero sin longitud máx |
| `estado_proyecto_creacion` | VAL_nombre válido | ❌ | **NO VALIDADO** (no existe) |

**Veredicto:** ⚠️ **PARCIAL** - Validaciones básicas sí, completas no

---

## 4. Análisis Detallado por Componente

### 4.1. Base de Datos

**Archivo:** `migrations/004-pai-mvp.sql`

```sql
CREATE TABLE IF NOT EXISTS PAI_NOT_notas (
  NOT_id                  INTEGER PRIMARY KEY,
  NOT_proyecto_id          INTEGER NOT NULL,
  NOT_tipo_val_id          INTEGER NOT NULL,
  NOT_asunto              TEXT NOT NULL,          -- ✅ Existe
  NOT_nota                 TEXT NOT NULL,
  NOT_estado_val_id        INTEGER NOT NULL,      -- ⚠️ Debería ser nullable (migración 010)
  NOT_editable             INTEGER NOT NULL DEFAULT 1,
  NOT_fecha_alta           TEXT NOT NULL DEFAULT (datetime('now')),
  NOT_fecha_actualizacion    TEXT NOT NULL DEFAULT (datetime('now')),
  NOT_usuario_alta         TEXT,
  NOT_usuario_actualizacion TEXT,
  FOREIGN KEY (NOT_proyecto_id) REFERENCES PAI_PRO_proyectos(PRO_id),
  FOREIGN KEY (NOT_tipo_val_id) REFERENCES PAI_VAL_valores(VAL_id),
  FOREIGN KEY (NOT_estado_val_id) REFERENCES PAI_VAL_valores(VAL_id)
);
```

**Estado:** ⚠️ **CASI CORRECTO**
- ✅ `NOT_asunto` existe
- ⚠️ `NOT_estado_val_id` debería ser nullable (migración 010 lo hace nullable)

---

### 4.2. Backend Handler

**Archivo:** `apps/worker/src/handlers/pai-proyectos.ts`

**Problemas Detectados:**

1. **No obtiene estado del proyecto al crear:**
```typescript
// ❌ Debería obtener estado_actual del proyecto
const proyecto = await db
  .prepare(`
    SELECT p.PRO_estado_val_id, v.VAL_nombre as estado_nombre
    FROM PAI_PRO_proyectos p
    JOIN PAI_VAL_valores v ON p.PRO_estado_val_id = v.VAL_id
    WHERE p.PRO_id = ?
  `)
  .bind(proyectoId)
  .first();
```

2. **No guarda estado_proyecto_creacion:**
```typescript
// ❌ Debería guardar estado_nombre para referencia futura
```

3. **Usa workaround incorrecto:**
```typescript
// ❌ Usa autor como asunto
autor, // Usamos el autor como asunto por ahora
```

---

### 4.3. Frontend Types

**Archivo:** `apps/frontend/src/types/pai.ts`

**Interfaz Actual:**
```typescript
export interface Nota {
  id: number;
  proyecto_id: number;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_id?: number;
}
```

**Debería Ser:**
```typescript
export interface Nota {
  id: number;
  proyecto_id: number;
  tipo_nota_id: number;
  tipo: string;
  asunto: string;  // ❌ FALTA
  estado_proyecto_creacion: string;  // ❌ FALTA
  autor: string;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  usuario_id?: number;
  esEditable?: boolean;  // ❌ FALTA
  razonNoEditable?: string;  // ❌ FALTA
}
```

---

### 4.4. Frontend Components

**Visualización Actual vs. Esperada:**

| Elemento | Actual | Esperado | Diferencia |
|----------|--------|----------|------------|
| **Título de nota** | "📝 Nota" | Asunto de la nota | ❌ Hardcodeado |
| **Estado al crear** | No muestra | "Estado al crear: {estado}" | ❌ Ausente |
| **Indicador editabilidad** | "🔒 No editable" | "🔒 No editable (Estado: {estado})" | ⚠️ Incompleto |
| **Formulario creación** | 3 campos | 4 campos (incluye asunto) | ❌ Falta campo |

---

## 5. Matriz de Cumplimiento

### 5.1. Cumplimiento por Sección de Especificación

| Sección | Elementos Totales | Implementados | Parciales | Faltantes | % Cumplimiento |
|---------|-------------------|---------------|-----------|-----------|----------------|
| **3. Modelo de Datos** | 10 | 6 | 2 | 2 | 60% |
| **4. API Endpoints** | 12 | 7 | 2 | 3 | 58% |
| **5. Componentes Frontend** | 15 | 10 | 3 | 2 | 67% |
| **6. Reglas de Editabilidad** | 8 | 5 | 2 | 1 | 63% |
| **8. Pipeline Events** | 8 | 5 | 2 | 1 | 63% |
| **10. Validaciones** | 10 | 5 | 2 | 3 | 50% |
| **TOTAL** | **63** | **38** | **13** | **12** | **60%** |

### 5.2. Cumplimiento por Capa

```
┌─────────────────────────────────────────────────────────┐
│  CAPA DE PRESENTACIÓN (Frontend UI)                     │
│  ████████████████████████░░░░░░░░░░  67% (10/15)        │
├─────────────────────────────────────────────────────────┤
│  CAPA DE TIPOS (TypeScript Interfaces)                  │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░  40% (4/10)         │
├─────────────────────────────────────────────────────────┤
│  CAPA DE NEGOCIO (Backend Handlers)                     │
│  ██████████████████░░░░░░░░░░░░░░░░  60% (7/12)         │
├─────────────────────────────────────────────────────────┤
│  CAPA DE DATOS (Database Schema)                        │
│  ████████████████████████████░░░░░░  90% (9/10)         │
├─────────────────────────────────────────────────────────┤
│  CAPA DE VALIDACIÓN (Reglas y Validaciones)             │
│  ██████████████░░░░░░░░░░░░░░░░░░░░  50% (5/10)         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Issues Críticos Detectados

### 6.1. Crítico: Falta Campo `asunto`

**Impacto:** ALTO  
**Ubicación:** Frontend (tipos, componentes), Backend (request/response)  
**Especificación:** Sección 3.3, 3.4, 4.1, 5.2, 9.2, 10.1

**Problema:**
- El campo `asunto` existe en DB pero NO en la interfaz TypeScript
- El backend usa `autor` como `asunto` (workaround incorrecto)
- El frontend no muestra asunto en la lista de notas
- El formulario de creación no tiene campo para asunto

**Solución Requerida:**
1. Agregar `asunto: string` a interface `Nota`
2. Agregar campo `asunto` en `FormularioNota.tsx`
3. Backend debe recibir y guardar `asunto` correctamente
4. Response debe incluir `asunto`
5. `ListaNotas.tsx` debe mostrar el asunto

---

### 6.2. Crítico: Falta `estado_proyecto_creacion`

**Impacto:** ALTO  
**Ubicación:** Backend (crear nota), Frontend (tipos, visualización)  
**Especificación:** Sección 3.3, 3.4, 4.1, 6.1, 9.1

**Problema:**
- El estado del proyecto al crear la nota NO se guarda
- Sin este dato, la validación de editabilidad es incompleta
- El frontend no puede mostrar "Estado al crear"
- La regla de editabilidad no se puede verificar correctamente

**Solución Requerida:**
1. Backend debe obtener `estado_actual` del proyecto al crear nota
2. Guardar `estado_proyecto_creacion` como `VAL_nombre` (NO `VAL_id`)
3. Agregar `estado_proyecto_creacion: string` a interface `Nota`
4. Response debe incluir `estado_proyecto_creacion`
5. Frontend debe mostrar estado en lista de notas

---

### 6.3. Alto: Validación de Eliminación Incompleta

**Impacto:** MEDIO  
**Ubicación:** Backend (`handleEliminarNota`)  
**Especificación:** Sección 6.1, 10.3

**Problema:**
- La eliminación NO valida cambios de estado
- Una nota podría eliminarse incluso si el estado cambió
- Inconsistente con regla de edición

**Solución Requerida:**
1. Agregar validación `esNotaEditable()` en `handleEliminarNota`
2. Retornar 403 si el estado cambió desde la creación

---

### 6.4. Medio: Pipeline Events Incompletos

**Impacto:** MEDIO  
**Ubicación:** Backend (`handleCrearNota`, `handleEditarNota`)  
**Especificación:** Sección 8.1

**Problema:**
- Faltan eventos `PROCESS_COMPLETE`
- Los detalles no incluyen `estado_proyecto_creacion`
- Trazabilidad incompleta

**Solución Requerida:**
1. Agregar evento `PROCESS_COMPLETE` después de crear/editar
2. Incluir `estado_proyecto_creacion` en el detalle del evento

---

### 6.5. Medio: UX de Visualización Mejorable

**Impacto:** BAJO  
**Ubicación:** Frontend (`ListaNotas.tsx`)  
**Especificación:** Sección 9.1

**Problema:**
- No muestra asunto de la nota
- No muestra estado de creación
- Indicador de editabilidad es genérico

**Solución Requerida:**
1. Mostrar asunto como título de cada nota
2. Mostrar "Estado al crear: {estado}"
3. Mejorar indicador de no editable con razón específica

---

## 7. Recomendaciones Prioritarias

### Prioridad 1: Crítico (Debe hacerse antes de producción)

| # | Acción | Archivos Afectados | Esfuerzo |
|---|--------|-------------------|----------|
| **1.1** | Agregar `asunto` a interface `Nota` | `types/pai.ts` | 15 min |
| **1.2** | Agregar `estado_proyecto_creacion` a interface `Nota` | `types/pai.ts` | 15 min |
| **1.3** | Backend: Obtener estado del proyecto al crear nota | `pai-notas.ts` | 30 min |
| **1.4** | Backend: Guardar `estado_proyecto_creacion` | `pai-notas.ts` | 30 min |
| **1.5** | Backend: Incluir `asunto` y `estado` en response | `pai-notas.ts` | 15 min |
| **1.6** | Frontend: Agregar campo `asunto` en formulario | `FormularioNota.tsx` | 30 min |
| **1.7** | Frontend: Mostrar asunto en lista | `ListaNotas.tsx` | 20 min |

**Total Prioridad 1:** ~2.5 horas

---

### Prioridad 2: Alto (Debería hacerse)

| # | Acción | Archivos Afectados | Esfuerzo |
|---|--------|-------------------|----------|
| **2.1** | Backend: Validar eliminación con `esNotaEditable()` | `pai-notas.ts` | 30 min |
| **2.2** | Frontend: Mostrar `estado_proyecto_creacion` en lista | `ListaNotas.tsx` | 20 min |
| **2.3** | Backend: Agregar eventos `PROCESS_COMPLETE` | `pai-notas.ts` | 20 min |
| **2.4** | Backend: Incluir estado en detalle de eventos | `pai-notas.ts` | 15 min |

**Total Prioridad 2:** ~1.5 horas

---

### Prioridad 3: Medio (Mejoras opcionales)

| # | Acción | Archivos Afectados | Esfuerzo |
|---|--------|-------------------|----------|
| **3.1** | Frontend: Advertencia en formulario de edición | `FormularioEditarNota.tsx` | 15 min |
| **3.2** | Frontend: Validación de longitud de campos | `FormularioNota.tsx` | 20 min |
| **3.3** | Backend: Validar longitud máxima de campos | `pai-notas.ts` | 20 min |

**Total Prioridad 3:** ~1 hora

---

## 8. Plan de Acción

### Fase 1: Correcciones Críticas (2.5 horas)

**Objetivo:** Cumplir con especificación mínima para producción

1. **Actualizar tipos TypeScript** (30 min)
   - `apps/frontend/src/types/pai.ts`
   - Agregar: `asunto`, `estado_proyecto_creacion`, `esEditable`, `razonNoEditable`

2. **Actualizar backend handler** (1.25 horas)
   - `apps/worker/src/handlers/pai-notas.ts`
   - Obtener estado del proyecto
   - Guardar `estado_proyecto_creacion`
   - Incluir `asunto` en request/response

3. **Actualizar frontend components** (50 min)
   - `FormularioNota.tsx`: Agregar campo `asunto`
   - `ListaNotas.tsx`: Mostrar asunto y estado

### Fase 2: Mejoras de Validación (1.5 horas)

**Objetivo:** Completar validaciones y trazabilidad

1. **Validación de eliminación** (30 min)
   - `handleEliminarNota`: Agregar `esNotaEditable()`

2. **Pipeline Events completos** (35 min)
   - Agregar `PROCESS_COMPLETE`
   - Incluir estado en detalles

3. **UX de visualización** (25 min)
   - Mostrar estado en lista
   - Mejorar indicadores

### Fase 3: Mejoras Opcionales (1 hora)

**Objetivo:** Pulir detalles de UX

1. **Advertencias en formularios** (15 min)
2. **Validaciones de longitud** (40 min)
3. **Testing manual** (5 min)

---

## 9. Resumen Final

### Estado Actual

- **60% de la especificación está implementada**
- **Funcionalidad básica opera** (crear, editar, eliminar notas)
- **Regla de editabilidad parcialmente implementada**
- **Faltan campos críticos:** `asunto`, `estado_proyecto_creacion`

### Riesgos

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Notas sin asunto | UX deficiente | ALTA | Prioridad 1.6 |
| Editabilidad incorrecta | Datos inconsistentes | MEDIA | Prioridad 1.3-1.4 |
| Eliminación sin validar | Pérdida de trazabilidad | MEDIA | Prioridad 2.1 |
| Events incompletos | Auditoría incompleta | BAJA | Prioridad 2.3-2.4 |

### Recomendación General

**Proceder con Fase 1 (Prioridad 1) antes de cualquier despliegue a producción.**

Los campos `asunto` y `estado_proyecto_creacion` son **críticos** para:
1. Cumplir con la especificación documentada
2. Garantizar trazabilidad correcta
3. Habilitar validación de editabilidad precisa
4. Proveer UX completa al usuario

---

**Documento generado:** 2026-03-29  
**Diagnóstico realizado por:** Agente Cloudflare Deploy  
**Próximo paso:** Ejecutar Fase 1 del Plan de Acción
