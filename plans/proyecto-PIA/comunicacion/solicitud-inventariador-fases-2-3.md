# Solicitud de Actualización de Inventario - FASE 2 y FASE 3 PAI

**Fecha:** 28 de marzo de 2026  
**Solicitante:** Agente Qwen Code  
**Tipo:** Actualización de inventario por correcciones de FASE 2 y FASE 3  
**Prioridad:** Alta  

---

## Resumen Ejecutivo

Se han completado las correcciones críticas (P0) e importantes (P1) de las FASES 2 y 3 del proyecto PAI. Este documento solicita al agente **inventariador** actualizar `inventario_recursos.md` con los cambios realizados.

---

## Cambios de FASE 2 (Backend)

### P0.1: Valor ACTIVO para TIPO_NOTA

**Archivo:** `migrations/005-pai-mvp-datos-iniciales.sql` (modificado)

**Cambio:** Agregado valor `ACTIVO` para el atributo `TIPO_NOTA`

```sql
INSERT INTO PAI_VAL_valores (VAL_atr_id, VAL_codigo, VAL_nombre, VAL_descripcion, VAL_orden, VAL_activo, VAL_es_default, VAL_fecha_alta, VAL_fecha_actualizacion)
SELECT
  ATR_id,
  'ACTIVO',
  'activo',
  'Nota activa, puede editarse',
  5,
  1,
  1,
  datetime('now'),
  datetime('now')
FROM PAI_ATR_atributos WHERE ATR_codigo = 'TIPO_NOTA';
```

**Impacto en Inventario:**
- Sección 4.3 (Bases de Datos D1): Tabla `PAI_VAL_valores` ahora tiene valor `ACTIVO` para `TIPO_NOTA`
- Sección 15 (Problemas conocidos): Eliminar "Falta valor `ACTIVO` para `TIPO_NOTA`"

---

### P0.2: Columna PRO_ijson

**Archivo:** `migrations/009-pai-agregar-columna-pro-ijson.sql` (nuevo)

**Cambio:** Agregada columna `PRO_ijson` a `PAI_PRO_proyectos`

```sql
ALTER TABLE PAI_PRO_proyectos ADD COLUMN PRO_ijson TEXT;
```

**Impacto en Inventario:**
- Sección 4.3 (Bases de Datos D1): Tabla `PAI_PRO_proyectos` ahora tiene columna `PRO_ijson`
- Sección 11 (Archivos de Configuración): Agregar nueva migración
- Sección 15 (Problemas conocidos): Eliminar "Falta columna `PRO_ijson` en `PAI_PRO_proyectos`"

---

### P0.3: Columna NOT_estado_val_id nullable

**Archivo:** `migrations/010-pai-notas-estado-val-id-nullable.sql` (nuevo)

**Cambio:** La columna `NOT_estado_val_id` ahora es nullable

```sql
-- Recrea PAI_NOT_notas con NOT_estado_val_id como nullable
NOT_estado_val_id INTEGER,  -- Ahora nullable (antes NOT NULL)
```

**Impacto en Inventario:**
- Sección 4.3 (Bases de Datos D1): Tabla `PAI_NOT_notas` tiene columna `NOT_estado_val_id` como nullable
- Sección 11 (Archivos de Configuración): Agregar nueva migración

---

### P1.1, P1.2, P2.1, P2.2: Mejoras de Backend

**Archivos modificados:**
- `apps/worker/src/services/simulacion-ia.ts`

**Cambios:**
- Funciones `ejecutarConTimeout()` y `ejecutarConReintento()` agregadas
- Timeout de 30s para análisis
- Reintentos con backoff exponencial (1s, 2s, 4s)

**Impacto en Inventario:**
- Ninguno directo (mejoras de código, no de recursos)

---

### P2.3: Documentación de Errores

**Archivo creado:** `apps/worker/docs/PAI_ERROR_HANDLING.md`

**Contenido:** Estrategia de manejo de errores para endpoints PAI

**Impacto en Inventario:**
- Sección 11 (Archivos de Configuración): Agregar archivo de documentación

---

## Cambios de FASE 3 (Frontend)

### P0.1: Alinear Tipos de Estados

**Archivo modificado:** `apps/frontend/src/types/pai.ts`

**Cambio:** Tipos de estados alineados con backend

```typescript
// ANTES (incorrecto):
export type EstadoProyecto =
  | 'borrador'
  | 'en_proceso'
  | 'completado'
  | 'valorado'
  | 'descartado'
  | 'error';

// AHORA (alineado con backend):
export type EstadoProyecto =
  // Estados automáticos
  | 'creado'
  | 'procesando_analisis'
  | 'analisis_con_error'
  | 'analisis_finalizado'
  // Estados manuales
  | 'evaluando_viabilidad'
  | 'evaluando_plan_negocio'
  | 'seguimiento_comercial'
  | 'descartado';
```

**Impacto en Inventario:**
- Ninguno directo (cambio de tipos TypeScript)

---

### P0.2: Componente de 9 Pestañas

**Archivo creado:** `apps/frontend/src/components/pai/ResultadosAnalisis.tsx`

**Contenido:** Componente con 9 pestañas de resultados de análisis

**Impacto en Inventario:**
- Sección 11 (Archivos de Configuración): Agregar nuevo componente

---

### P1.1: Paginación UI

**Archivos creados:**
- `apps/frontend/src/components/pai/Paginacion.tsx`

**Archivos modificados:**
- `apps/frontend/src/pages/proyectos/ListarProyectos.tsx`

**Impacto en Inventario:**
- Sección 11 (Archivos de Configuración): Agregar nuevo componente

---

### P1.2: Visualizador de Markdown

**Archivos creados:**
- `apps/frontend/src/components/pai/VisualizadorMarkdown.tsx`

**Dependencias agregadas:**
- `react-markdown` (package.json)

**Impacto en Inventario:**
- Sección 9 (Stack Tecnológico): Agregar `react-markdown`
- Sección 11 (Archivos de Configuración): Agregar nuevo componente

---

### P1.3: Editabilidad de Notas por Pipeline

**Archivos creados:**
- `apps/frontend/src/hooks/useNotaEditable.ts`

**Archivos modificados:**
- `apps/frontend/src/lib/pai-api.ts` (método `obtenerCambiosEstado()`)
- `apps/frontend/src/components/pai/ListaNotas.tsx`

**Impacto en Inventario:**
- Sección 8 (Contratos entre Servicios): Agregar nuevo endpoint
- Sección 11 (Archivos de Configuración): Agregar nuevo hook

---

## Resumen de Archivos Nuevos/Modificados

### Migraciones (3 archivos)

| Archivo | Tipo | Propósito |
|---------|------|-----------|
| `005-pai-mvp-datos-iniciales.sql` | Modificado | Valor ACTIVO para TIPO_NOTA |
| `009-pai-agregar-columna-pro-ijson.sql` | Nuevo | Columna PRO_ijson |
| `010-pai-notas-estado-val-id-nullable.sql` | Nuevo | NOT_estado_val_id nullable |

### Backend (2 archivos)

| Archivo | Tipo | Propósito |
|---------|------|-----------|
| `apps/worker/src/services/simulacion-ia.ts` | Modificado | Timeout y reintentos |
| `apps/worker/docs/PAI_ERROR_HANDLING.md` | Nuevo | Documentación de errores |

### Frontend (6 archivos)

| Archivo | Tipo | Propósito |
|---------|------|-----------|
| `apps/frontend/src/types/pai.ts` | Modificado | Estados alineados |
| `apps/frontend/src/components/pai/ResultadosAnalisis.tsx` | Nuevo | 9 pestañas de análisis |
| `apps/frontend/src/components/pai/Paginacion.tsx` | Nuevo | Paginación UI |
| `apps/frontend/src/components/pai/VisualizadorMarkdown.tsx` | Nuevo | Visualizador Markdown |
| `apps/frontend/src/hooks/useNotaEditable.ts` | Nuevo | Hook de editabilidad |
| `apps/frontend/src/lib/pai-api.ts` | Modificado | Método obtenerCambiosEstado |

---

## Acciones Requeridas para el Inventariador

### 1. Actualizar Sección 4.3 (Bases de Datos D1)

**Tabla `PAI_PRO_proyectos`:**
- Agregar columna: `PRO_ijson TEXT`

**Tabla `PAI_VAL_valores`:**
- Agregar valor: `ACTIVO` para `TIPO_NOTA` (VAL_codigo = 'ACTIVO', VAL_es_default = 1)

**Tabla `PAI_NOT_notas`:**
- Columna `NOT_estado_val_id` ahora es nullable

### 2. Actualizar Sección 11 (Archivos de Configuración)

**Nuevos archivos de migración:**

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `migrations/009-pai-agregar-columna-pro-ijson.sql` | Agrega columna PRO_ijson | ✅ Creado |
| `migrations/010-pai-notas-estado-val-id-nullable.sql` | Hace nullable NOT_estado_val_id | ✅ Creado |

**Nuevos archivos de documentación backend:**

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `apps/worker/docs/PAI_ERROR_HANDLING.md` | Estrategia de manejo de errores | ✅ Creado |

**Nuevos componentes frontend:**

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `apps/frontend/src/components/pai/ResultadosAnalisis.tsx` | 9 pestañas de resultados | ✅ Creado |
| `apps/frontend/src/components/pai/Paginacion.tsx` | Paginación UI | ✅ Creado |
| `apps/frontend/src/components/pai/VisualizadorMarkdown.tsx` | Visualizador Markdown | ✅ Creado |

**Nuevos hooks frontend:**

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `apps/frontend/src/hooks/useNotaEditable.ts` | Editabilidad de notas | ✅ Creado |

### 3. Actualizar Sección 8 (Contratos entre Servicios)

**Nuevo endpoint frontend-backend:**

| Servicio Origen | Servicio Destino | Endpoint | Método | Response | Estado |
|-----------------|------------------|----------|--------|----------|--------|
| Frontend (Pages) | `wk-backend` | `/api/pai/proyectos/:id/pipeline?tipo=cambio_estado` | GET | `{ eventos: [...] }` | ✅ |

### 4. Actualizar Sección 9 (Stack Tecnológico)

**Nueva dependencia frontend:**

| Tecnología | Versión | Capa | Estado |
|------------|---------|------|--------|
| `react-markdown` | Latest | Frontend | ✅ |

### 5. Actualizar Sección 15 (Problemas Conocidos)

**Eliminar problemas resueltos:**

- ❌ ~~"Falta columna `PRO_ijson` en `PAI_PRO_proyectos` (requerida para análisis)"~~ → ✅ Resuelto (migración 009)
- ❌ ~~"Falta valor `ACTIVO` para `TIPO_NOTA` (requerido para crear notas)"~~ → ✅ Resuelto (migración 005 modificada)

**Mantener:**
- ⚠️ "Migración `005-pai-mvp-datos-iniciales.sql` falló con error de UNIQUE constraint" (pendiente de re-ejecución en producción)

### 6. Actualizar Historial de Cambios (Sección 13)

**Nuevas entradas:**

```markdown
| Fecha | Cambio | Responsable | Aprobado Por |
|-------|--------|-------------|--------------|
| 2026-03-28 | FASE 2 P0: Valor ACTIVO para TIPO_NOTA, columna PRO_ijson, NOT_estado_val_id nullable | inventariador | Pendiente |
| 2026-03-28 | FASE 2 P1/P2: Timeout y reintentos en análisis, documentación de errores | inventariador | Pendiente |
| 2026-03-28 | FASE 3 P0: Estados alineados frontend-backend, componente 9 pestañas | inventariador | Pendiente |
| 2026-03-28 | FASE 3 P1: Paginación UI, visualizador Markdown, editabilidad por pipeline | inventariador | Pendiente |
```

---

## Evidencia de Cambios

### Archivos de Resumen

| Archivo | Contenido |
|---------|-----------|
| `plans/proyecto-PIA/comunicacion/p0-correcciones-criticas-resumen.md` | Resumen P0 FASE 2 |
| `plans/proyecto-PIA/comunicacion/p1-correcciones-importantes-resumen.md` | Resumen P1 FASE 2 |
| `plans/proyecto-PIA/comunicacion/p0-fase3-correcciones-criticas-resumen.md` | Resumen P0 FASE 3 |
| `plans/proyecto-PIA/comunicacion/p1-fase3-correcciones-importantes-resumen.md` | Resumen P1 FASE 3 |

### Diagnósticos

| Archivo | Contenido |
|---------|-----------|
| `plans/proyecto-PIA/revision-fases-qwen/FASE02_Diagnostico_PlanAjuste_QWEN.md` | Diagnóstico FASE 2 |
| `plans/proyecto-PIA/revision-fases-qwen/FASE03_Diagnostico_PlanAjuste_QWEN.md` | Diagnóstico FASE 3 |

### Verificación de Compilación

```bash
# Backend
cd /workspaces/cbc-endes/apps/worker && npx tsc --noEmit
# Resultado: ✅ Sin errores

# Frontend
cd /workspaces/cbc-endes/apps/frontend && npx tsc --noEmit
# Resultado: ✅ Sin errores
```

---

## Aprobación Requerida

**Tipo de Cambios:**
- ✅ Cambios de código (no requieren aprobación)
- ⚠️ Cambios de schema de BD (requieren aprobación para deploy en producción)

**Aprobación del usuario:** ⏳ Pendiente

---

## Formato de Respuesta Esperado

Al finalizar la actualización, el inventariador debe reportar:

```json
{
  "summary": "Inventario actualizado con cambios de FASE 2 y FASE 3 PAI",
  "sections_updated": [
    "4.3 Bases de Datos (D1)",
    "8. Contratos entre Servicios",
    "9. Stack Tecnológico",
    "11. Archivos de Configuración",
    "13. Historial de Cambios",
    "15. Problemas Conocidos"
  ],
  "entries_added": [
    "migrations/009-pai-agregar-columna-pro-ijson.sql",
    "migrations/010-pai-notas-estado-val-id-nullable.sql",
    "apps/worker/docs/PAI_ERROR_HANDLING.md",
    "apps/frontend/src/components/pai/ResultadosAnalisis.tsx",
    "apps/frontend/src/components/pai/Paginacion.tsx",
    "apps/frontend/src/components/pai/VisualizadorMarkdown.tsx",
    "apps/frontend/src/hooks/useNotaEditable.tsx"
  ],
  "entries_modified": [
    "migrations/005-pai-mvp-datos-iniciales.sql",
    "apps/frontend/src/types/pai.ts",
    "apps/frontend/src/lib/pai-api.ts"
  ],
  "entries_removed": [],
  "pending_gaps": [
    "Re-ejecutar migración 005 en producción"
  ],
  "user_approval": "pendiente",
  "inventory_consistent": true
}
```

---

> **Nota para el inventariador:** Este es un cambio significativo que actualiza múltiples secciones del inventario. Todos los cambios están documentados en los archivos de resumen de correcciones (P0 y P1 de FASES 2 y 3). La aprobación del usuario es requerida para los cambios de schema de base de datos antes de deploy en producción.
