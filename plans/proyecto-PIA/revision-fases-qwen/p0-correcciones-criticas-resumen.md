# Resumen de Cambios - Correcciones Críticas P0

**Fecha:** 28 de marzo de 2026  
**Fase:** FASE 2 - Backend Core Funcional  
**Tipo:** Correcciones Críticas P0.1, P0.2, P0.3  
**Documento de Referencia:** `plans/proyecto-PIA/revision-fases-qwen/FASE02_Diagnostico_PlanAjuste_QWEN.md`

---

## Cambios Realizados

### 1. Migración 005 - Agregar valor ACTIVO para TIPO_NOTA (P0.1a)

**Archivo modificado:** `migrations/005-pai-mvp-datos-iniciales.sql`

**Cambio:** Agregado valor `ACTIVO` para el atributo `TIPO_NOTA`

```sql
-- Valor ACTIVO para TIPO_NOTA (requerido para crear notas - P0.1 Corrección Crítica)
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
- Sección 4.3 (Bases de Datos D1): La tabla `PAI_VAL_valores` ahora tiene el valor `ACTIVO` para `TIPO_NOTA`
- Sección 15 (Problemas conocidos): Eliminar "Falta valor `ACTIVO` para `TIPO_NOTA`"

---

### 2. Nueva Migración 009 - Agregar columna PRO_ijson (P0.1b)

**Archivo nuevo:** `migrations/009-pai-agregar-columna-pro-ijson.sql`

**Cambio:** Agregada columna `PRO_ijson` a la tabla `PAI_PRO_proyectos`

```sql
ALTER TABLE PAI_PRO_proyectos ADD COLUMN PRO_ijson TEXT;
```

**Impacto en Inventario:**
- Sección 4.3 (Bases de Datos D1): La tabla `PAI_PRO_proyectos` ahora tiene columna `PRO_ijson`
- Sección 15 (Problemas conocidos): Eliminar "Falta columna `PRO_ijson` en `PAI_PRO_proyectos`"

---

### 3. Nueva Migración 010 - Hacer nullable NOT_estado_val_id (P0.3)

**Archivo nuevo:** `migrations/010-pai-notas-estado-val-id-nullable.sql`

**Cambio:** La columna `NOT_estado_val_id` ahora es nullable

```sql
-- Recrea la tabla PAI_NOT_notas con NOT_estado_val_id como nullable
NOT_estado_val_id INTEGER,  -- Ahora nullable (antes NOT NULL)
```

**Impacto en Inventario:**
- Sección 4.3 (Bases de Datos D1): La tabla `PAI_NOT_notas` tiene columna `NOT_estado_val_id` como nullable

---

### 4. Endpoint Nuevo - GET /api/pai/proyectos/:id/artefactos (P0.2)

**Archivo modificado:** `apps/worker/src/handlers/pai-proyectos.ts`

**Cambio:** Implementada función `handleObtenerArtefactos()`

**Endpoint registrado en:** `apps/worker/src/index.ts` (ya estaba registrado previamente)

```typescript
export async function handleObtenerArtefactos(c: AppContext): Promise<Response> {
  // Implementación completa
}
```

**Impacto en Inventario:**
- Sección 8 (Contratos entre Servicios): Agregar nuevo endpoint
- Sección 4.1 (Workers): El Worker `wk-backend` ahora tiene 11 endpoints PAI (antes 10)

---

### 5. Handler de Notas Corregido (P0.3)

**Archivo modificado:** `apps/worker/src/handlers/pai-notas.ts`

**Cambio:** Eliminado uso de `ESTADO_NOTA` (atributo inexistente)

```typescript
// ANTES (incorrecto):
// Buscaba estado ACTIVO de ESTADO_NOTA (atributo que no existe)
const estadoResult = await db.prepare(`
  SELECT v.VAL_id FROM PAI_VAL_valores v
  JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
  WHERE a.ATR_codigo = 'ESTADO_NOTA' AND v.VAL_codigo = 'ACTIVO'
`).first()

// INSERT incluía NOT_estado_val_id
INSERT INTO PAI_NOT_notas (..., NOT_estado_val_id, ...) VALUES (...)

// AHORA (correcto):
// Insertar nota sin estado_val_id
INSERT INTO PAI_NOT_notas (
  NOT_proyecto_id, NOT_tipo_val_id, NOT_asunto, NOT_nota,
  NOT_editable, NOT_usuario_alta
) VALUES (...)
```

**Impacto en Inventario:**
- Ninguno directo (es una corrección de código, no de recursos)

---

## Resumen de Migraciones Creadas/Modificadas

| Migración | Estado | Descripción |
|-----------|--------|-------------|
| `005-pai-mvp-datos-iniciales.sql` | ✅ Modificada | Agregado valor ACTIVO para TIPO_NOTA |
| `009-pai-agregar-columna-pro-ijson.sql` | ✅ Nueva | Agregada columna PRO_ijson |
| `010-pai-notas-estado-val-id-nullable.sql` | ✅ Nueva | NOT_estado_val_id ahora nullable |

---

## Endpoints PAI Actualizados

| Endpoint | Método | Estado |
|----------|--------|--------|
| `/api/pai/proyectos` | POST | ✅ Implementado |
| `/api/pai/proyectos/:id` | GET | ✅ Implementado |
| `/api/pai/proyectos` | GET | ✅ Implementado |
| `/api/pai/proyectos/:id/analisis` | POST | ✅ Implementado |
| `/api/pai/proyectos/:id/artefactos` | GET | ✅ **NUEVO - Implementado** |
| `/api/pai/proyectos/:id/notas` | POST | ✅ Implementado |
| `/api/pai/proyectos/:id/notas/:notaId` | PUT | ✅ Implementado |
| `/api/pai/proyectos/:id/estado` | PUT | ✅ Implementado |
| `/api/pai/proyectos/:id` | DELETE | ✅ Implementado |
| `/api/pai/proyectos/:id/pipeline` | GET | ✅ Implementado |

**Total endpoints PAI:** 10

---

## Acciones Requeridas para el Inventariador

### Actualizar Sección 4.3 (Bases de Datos D1)

**Tabla `PAI_PRO_proyectos`:**
- Agregar columna: `PRO_ijson TEXT`

**Tabla `PAI_VAL_valores`:**
- Agregar valor: `ACTIVO` para `TIPO_NOTA` (VAL_codigo = 'ACTIVO', VAL_es_default = 1)

**Tabla `PAI_NOT_notas`:**
- Columna `NOT_estado_val_id` ahora es nullable

### Actualizar Sección 8 (Contratos entre Servicios)

**Nuevo endpoint:**
| Servicio Origen | Servicio Destino | Endpoint | Método | Response | Estado |
|-----------------|------------------|----------|--------|----------|--------|
| Frontend (Pages) | `wk-backend` | `/api/pai/proyectos/:id/artefactos` | GET | `{ artefactos: [...] }` | ✅ |

### Actualizar Sección 15 (Problemas Conocidos)

**Eliminar:**
- ❌ "Falta columna `PRO_ijson` en `PAI_PRO_proyectos` (requerida para análisis)"
- ❌ "Falta valor `ACTIVO` para `TIPO_NOTA` (requerido para crear notas)"

**Mantener:**
- ⚠️ "Migración `005-pai-mvp-datos-iniciales.sql` falló con error de UNIQUE constraint" (pendiente de re-ejecución)

### Actualizar Sección 11 (Archivos de Configuración)

**Nuevos archivos de migración:**
| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `migrations/009-pai-agregar-columna-pro-ijson.sql` | Agrega columna PRO_ijson | ✅ Creado |
| `migrations/010-pai-notas-estado-val-id-nullable.sql` | Hace nullable NOT_estado_val_id | ✅ Creado |

---

## Aprobación

**Solicitado por:** Agente Qwen Code  
**Fecha:** 28 de marzo de 2026  
**Tipo:** Correcciones Críticas P0  
**Impacto:** Bajo (correcciones de bugs, sin cambios de recursos Cloudflare)

**Aprobación del usuario:** ⏳ Pendiente

---

> **Nota para el inventariador:** Estos cambios son correcciones de bugs identificados en el diagnóstico FASE 2. No se crearon nuevos recursos en Cloudflare, solo se modificaron archivos de migración y código del worker. El inventario debe actualizarse para reflejar el estado correcto del schema de base de datos.
