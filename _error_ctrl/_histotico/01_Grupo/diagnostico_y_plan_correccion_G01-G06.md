# Diagnóstico y Plan de Corrección de Errores - Grupos G01-G06 y G11-G14

## Índice de Contenido

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Metodología de Diagnóstico](#metodología-de-diagnóstico)
3. [Error G01: Modal de Crear Proyecto - Área Visible](#error-g01-modal-de-crear-proyecto---área-visible)
4. [Error G02: Funciones en Menú Lateral y Modal de Crear Proyecto](#error-g02-funciones-en-menú-lateral-y-modal-de-crear-proyecto)
5. [Error G03: Valores PAI_VAL_valores Repetidos (VAL_id 39-46)](#error-g03-valores-pai_val_valores-repetidos-val_id-39-46)
6. [Error G04: Estados de Proyectos No Coinciden](#error-g04-estados-de-proyectos-no-coinciden)
7. [Error G05: Estados de Proyectos No Coinciden (Lista)](#error-g05-estados-de-proyectos-no-coinciden-lista)
8. [Error G06: Error al Agregar Nota - 400 Bad Request](#error-g06-error-al-agregar-nota---400-bad-request)
9. [Error G11: Valores PAI_VAL_valores Repetidos (VAL_id 47-54)](#error-g11-valores-pai_val_valores-repetidos-val_id-47-54)
10. [Error G12: Valores PAI_VAL_valores Repetidos (VAL_id 55-62)](#error-g12-valores-pai_val_valores-repetidos-val_id-55-62)
11. [Error G13: Valores PAI_VAL_valores Repetidos (VAL_id 68-76)](#error-g13-valores-pai_val_valores-repetidos-val_id-68-76)
12. [Error G14: Valores PAI_VAL_valores Repetidos (VAL_id 63-67)](#error-g14-valores-pai_val_valores-repetidos-val_id-63-67)
13. [Diagnóstico Consolidado - Problema G03/G11-G14](#diagnóstico-consolidado---problema-g03g11-g14)
14. [Plan de Corrección Consolidado](#plan-de-corrección-consolidado)
15. [Anexos](#anexos)

---

## Resumen Ejecutivo

Se han identificado **10 grupos de errores** (G01-G06, G11-G14) en el módulo PAI (Proyectos de Análisis Inmobiliario) de la aplicación web. Los errores se clasifican en:

| Categoría | Errores | Severidad |
|-----------|---------|-----------|
| UI/UX - Modal/Overlay | G01 | Media |
| Navegación/Menu | G02 | Media |
| Base de Datos - Duplicidad | G03, G11, G12, G13, G14 | **Crítica** |
| Base de Datos - Estados | G04, G05 | **Crítica** |
| API/Backend - Validación | G06 | **Crítica** |

**Causa raíz común**: Múltiples errores comparten origen en:
1. Migraciones de base de datos ejecutadas incorrectamente (G03, G04, G05, G11, G12, G13, G14)
2. Falta de sincronización entre frontend y backend (G06)
3. Componentes UI sin gestión adecuada de z-index y backdrop (G01)

### Problema Sistémico Detectado - Duplicidad de Valores PAI_VAL_valores

Los errores **G03, G11, G12, G13 y G14** comparten la misma causa raíz: **valores duplicados en la tabla `PAI_VAL_valores`** debido a migraciones ejecutadas repetidamente sin la debida validación de existencia previa.

| Error | Rango VAL_id | Cantidad | Causa Probable |
|-------|--------------|----------|----------------|
| G03 | 39-46 | 8 valores | Migración 005 re-ejecutada |
| G11 | 47-54 | 8 valores | Migración 005 re-ejecutada |
| G12 | 55-62 | 8 valores | Migración 005 re-ejecutada |
| G13 | 68-76 | 9 valores | Migración 005 re-ejecutada |
| G14 | 63-67 | 5 valores | Migración 005 re-ejecutada |

**Total de valores duplicados estimados**: 38 valores (VAL_id 39-76, con huecos)

**Patrón identificado**: Los rangos de 8 valores sugieren que la migración 005 (que inserta 8 estados de proyecto + 8 motivos de valoración + 8 motivos de descarte + 4 tipos de nota + 9 tipos de artefacto = 37 valores) se ejecutó **múltiples veces** sin control de duplicidad efectivo.

---

## Metodología de Diagnóstico

El diagnóstico se realizó mediante:

1. **Análisis estático de código**: Lectura de componentes React, hooks, handlers del backend
2. **Revisión de migraciones SQL**: Verificación de scripts de base de datos
3. **Trazabilidad de datos**: Seguimiento de flujo de datos frontend → API → DB
4. **Identificación de patrones**: Detección de causas raíz comunes
5. **Validación cruzada**: Comparación entre tipos TypeScript, schema DB y respuestas API

**Fuentes consultadas**:
- Frontend: `apps/frontend/src/`
- Backend: `apps/worker/src/`
- Migraciones: `migrations/001-010.sql`
- Tipos: `apps/frontend/src/types/pai.ts`

---

## Error G01: Modal de Crear Proyecto - Área Visible

### Descripción del Error

> "Si se ocultan los elementos en pantalla con la ventana emergente, también debe ocultarse el área del marco rojo num 1"

**Pantalla**: https://pg-cbc-endes.pages.dev/proyectos

### Archivos Implicados

| Archivo | Ruta | Función |
|---------|------|---------|
| `ListarProyectos.tsx` | `apps/frontend/src/pages/proyectos/` | Componente principal con modal |
| `FormularioCrearProyecto` | Inline en `ListarProyectos.tsx` | Formulario dentro del modal |

### Diagnóstico Completo

#### Problema Identificado

El modal de "Crear Proyecto" se renderiza con un overlay (`bg-black bg-opacity-50`), pero **el área del header/sidebar no se oscurece completamente** porque:

1. **z-index insuficiente**: El modal tiene `z-50` pero otros elementos pueden tener z-index mayor o igual
2. **Backdrop no cubre todo**: El overlay solo cubre `inset-0` (viewport) pero no considera elementos con position fixed fuera del flow normal
3. **Header con z-index alto**: El `AppHeader.tsx` tiene `z-99999` en algunos elementos

#### Código Problemático

```tsx
// ListarProyectos.tsx - Línea ~220
{mostrarCrearModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
      {/* Formulario */}
    </div>
  </div>
)}
```

#### Causa Raíz

**El z-index `z-50` es insuficiente** comparado con:
- Header: `z-99999` (AppHeader.tsx línea 43)
- Sidebar: `z-50` (AppSidebar.tsx) pero con position fixed

**El backdrop no es un portal de React**: Se renderiza dentro del DOM tree normal, no como un portal que salte por encima de todo.

### Plan de Corrección

#### Solución 1: Usar React Portal (Recomendada)

```tsx
// ListarProyectos.tsx
import { createPortal } from 'react-dom';

// Reemplazar el modal inline con:
{mostrarCrearModal && createPortal(
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000]">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
      <FormularioCrearProyecto
        onCreado={(proyecto) => {
          setProyectos([proyecto, ...proyectos]);
          setMostrarCrearModal(false);
        }}
        onCancel={() => setMostrarCrearModal(false)}
      />
    </div>
  </div>,
  document.body // Portal al body
);
```

#### Solución 2: Aumentar z-index y añadir backdrop explícito

```tsx
{mostrarCrearModal && (
  <>
    {/* Backdrop explícito */}
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[99998]" />
    {/* Modal */}
    <div className="fixed inset-0 flex items-center justify-center z-[99999] pointer-events-none">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 pointer-events-auto">
        {/* Formulario */}
      </div>
    </div>
  </>
)}
```

#### Solución 3: Componente Modal Reutilizable

Crear `apps/frontend/src/components/ui/modal/Modal.tsx`:

```tsx
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    // Prevenir scroll del body
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
```

---

## Error G02: Funciones en Menú Lateral y Modal de Crear Proyecto

### Descripción del Error

> 1. "Las opciones en el marco rojo 1 no deben salir en el menú lateral, son funciones que se aplican dentro del detalle/edición de proyectos"
> 2. "Al clic en 'Crear Proyecto' debe salir una VE [ventana emergente] igual que pasa en G01"

**Pantalla**: https://pg-cbc-endes.pages.dev/proyectos

### Archivos Implicados

| Archivo | Ruta | Función |
|---------|------|---------|
| `AppSidebarDynamic.tsx` | `apps/frontend/src/components/` | Menú lateral dinámico |
| `SidebarModule.tsx` | `apps/frontend/src/components/` | Renderiza módulos |
| `SidebarItem.tsx` | `apps/frontend/src/components/` | Renderiza items |
| `ListarProyectos.tsx` | `apps/frontend/src/pages/proyectos/` | Botón crear proyecto |
| `useMenu.ts` | `apps/frontend/src/hooks/` | Hook para obtener menú |

### Diagnóstico Completo

#### Problema 1: Funciones Incorrectas en Menú

**Causa Raíz**: El menú se carga dinámicamente desde la base de datos vía `GET /api/menu`. Las funciones que deberían ser **acciones contextuales** (dentro del detalle) están configuradas como **funciones navegables** en la tabla `MOD_modulos_config`.

**Flujo de datos**:
```
Backend (DB) → GET /api/menu → useMenu() → AppSidebarDynamic → SidebarModule → SidebarItem
```

**Estructura DB actual** (probable):
```sql
-- Funciones incorrectamente configuradas como navegables
INSERT INTO MOD_modulos_config (modulo_id, tipo_elemento, nombre_interno, nombre_mostrar, url_path, icono, orden, activo)
VALUES
  (X, 'FUNCION', 'ejecutar_analisis', 'Ejecutar Análisis', '/proyectos/:id/analisis', '⚡', 1, 1),
  (X, 'FUNCION', 'cambiar_estado', 'Cambiar Estado', '/proyectos/:id/estado', '📝', 2, 1),
  (X, 'FUNCION', 'eliminar_proyecto', 'Eliminar Proyecto', '/proyectos/:id/eliminar', '🗑️', 3, 1);
```

**Problema**: Estas no son rutas navegables, son **acciones** que se ejecutan desde el detalle del proyecto.

#### Problema 2: Botón "Crear Proyecto" No Abre Modal

**Causa Raíz**: El botón "Crear Proyecto" en `ListarProyectos.tsx` **SÍ abre un modal** (línea 64-67), pero posiblemente:
1. El modal no se ve por el problema G01 (z-index)
2. Hay confusión con otro botón en el menú lateral

**Código actual**:
```tsx
// ListarProyectos.tsx - Línea 64
<button
  onClick={handleCrearProyecto}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  + Crear Proyecto
</button>

// Línea 68
const handleCrearProyecto = () => {
  setMostrarCrearModal(true);
};
```

### Plan de Corrección

#### Corrección 1: Eliminar Funciones de Acción del Menú

**Backend - Migración de corrección**:

```sql
-- Migración: Eliminar funciones de acción del menú lateral
-- Propósito: Las acciones (ejecutar análisis, cambiar estado, eliminar) 
--            no deben aparecer en el menú lateral

-- Opción A: Desactivar funciones de acción
UPDATE MOD_modulos_config
SET activo = 0
WHERE nombre_interno IN (
  'ejecutar_analisis',
  'cambiar_estado', 
  'eliminar_proyecto',
  'ver_historial',
  'ver_artefactos'
)
AND tipo_elemento = 'FUNCION';

-- Opción B: Cambiar tipo a 'ACCION' (si se implementa ese tipo)
UPDATE MOD_modulos_config
SET tipo_elemento = 'ACCION', activo = 0
WHERE nombre_interno IN (
  'ejecutar_analisis',
  'cambiar_estado',
  'eliminar_proyecto'
);
```

**Frontend - Filtrar funciones de acción en el hook**:

```typescript
// useMenu.ts - Agregar filtro
const MENU_FUNCIONES_ACCION = [
  'ejecutar_analisis',
  'cambiar_estado',
  'eliminar_proyecto',
  'ver_historial',
  'ver_artefactos',
];

// Filtrar funciones de acción
const filteredFunciones = mod.funciones.filter(
  fn => !MENU_FUNCIONES_ACCION.includes(fn.nombre_interno)
);
```

#### Corrección 2: Asegurar que Modal Funcione

Verificar que el modal de "Crear Proyecto" funcione correctamente aplicando la corrección del error G01.

---

## Error G03: Valores PAI_VAL_valores Repetidos (VAL_id 39-46)

### Descripción del Error

> "Eliminar valores repetidos, VAL_id 39 a 46"

### Archivos Implicados

| Archivo | Ruta | Función |
|---------|------|---------|
| `005-pai-mvp-datos-iniciales.sql` | `migrations/` | Inserta datos iniciales |
| `010-pai-notas-estado-val-id-nullable.sql` | `migrations/` | Migración más reciente |
| Tabla `PAI_VAL_valores` | D1 Database | Valores de atributos |

### Diagnóstico Completo

#### Causa Raíz

**Migración 005 ejecutada múltiples veces sin `INSERT OR IGNORE`** o con datos conflictivos.

**Análisis de la migración 005**:
- La migración usa `INSERT OR IGNORE FROM PAI_ATR_atributos WHERE ATR_codigo = '...'`
- Esto debería prevenir duplicados... **PERO** si se ejecutó antes de tener los atributos correctos, pudo crear valores huérfanos

**Hipótesis más probable**:
1. Se ejecutó migración 005 → creó VAL_id 1-38
2. Se agregaron nuevos valores manualmente o por otra migración → VAL_id 39-46
3. Se volvió a ejecutar migración 005 → intentó insertar mismos valores pero con diferente ATR_id

**Otra posibilidad**: Los valores 39-46 son duplicados con diferente `VAL_atr_id` (apuntan a atributos equivocados).

#### Diagnóstico SQL para Ejecutar

```sql
-- Identificar duplicados por VAL_codigo dentro del mismo atributo
SELECT 
  v1.VAL_id,
  v1.VAL_atr_id,
  a1.ATR_codigo,
  v1.VAL_codigo,
  v1.VAL_nombre,
  COUNT(*) as duplicados
FROM PAI_VAL_valores v1
JOIN PAI_ATR_atributos a1 ON v1.VAL_atr_id = a1.ATR_id
WHERE v1.VAL_id BETWEEN 39 AND 46
GROUP BY v1.VAL_atr_id, v1.VAL_codigo
HAVING COUNT(*) > 1;

-- Ver qué atributos tienen los valores 39-46
SELECT 
  v.VAL_id,
  v.VAL_atr_id,
  a.ATR_codigo,
  a.ATR_nombre,
  v.VAL_codigo,
  v.VAL_nombre
FROM PAI_VAL_valores v
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
WHERE v.VAL_id BETWEEN 39 AND 46;

-- Buscar duplicados exactos (mismo atributo, mismo código)
SELECT 
  a.ATR_codigo,
  v.VAL_codigo,
  GROUP_CONCAT(v.VAL_id) as ids_duplicados,
  COUNT(*) as cantidad
FROM PAI_VAL_valores v
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
GROUP BY a.ATR_codigo, v.VAL_codigo
HAVING COUNT(*) > 1;
```

### Plan de Corrección

#### Migración de Limpieza

```sql
-- Migración: Eliminar valores duplicados VAL_id 39-46
-- Propósito: Limpiar valores huérfanos o duplicados

-- Paso 1: Identificar cuáles son duplicados (ejecutar diagnóstico primero)
-- SELECT ... (ver diagnóstico SQL arriba)

-- Paso 2: Eliminar valores específicos (ajustar IDs según diagnóstico)
-- NOTA: Usar DELETE con cuidado - verificar dependencias primero

-- Verificar si hay dependencias
SELECT 
  'PRO_proyectos' as tabla,
  COUNT(*) as cantidad,
  GROUP_CONCAT(DISTINCT PRO_estado_val_id) as estados_usados
FROM PAI_PRO_proyectos
WHERE PRO_estado_val_id BETWEEN 39 AND 46
UNION ALL
SELECT 
  'PAI_NOT_notas' as tabla,
  COUNT(*) as cantidad,
  GROUP_CONCAT(DISTINCT NOT_tipo_val_id) as tipos_usados
FROM PAI_NOT_notas
WHERE NOT_tipo_val_id BETWEEN 39 AND 46
UNION ALL
SELECT 
  'PAI_ART_artefactos' as tabla,
  COUNT(*) as cantidad,
  GROUP_CONCAT(DISTINCT ART_tipo_val_id) as tipos_usados
FROM PAI_ART_artefactos
WHERE ART_tipo_val_id BETWEEN 39 AND 46;

-- Paso 3: Si no hay dependencias, eliminar
DELETE FROM PAI_VAL_valores WHERE VAL_id BETWEEN 39 AND 46;

-- O eliminar solo los duplicados específicos (más seguro)
-- DELETE FROM PAI_VAL_valores 
-- WHERE VAL_id IN (identificados como duplicados);

-- Paso 4: Verificar integridad
SELECT 
  a.ATR_codigo,
  COUNT(v.VAL_id) as cantidad_valores,
  GROUP_CONCAT(v.VAL_codigo) as codigos
FROM PAI_ATR_atributos a
LEFT JOIN PAI_VAL_valores v ON a.ATR_id = v.VAL_atr_id
GROUP BY a.ATR_codigo
ORDER BY a.ATR_codigo;
```

#### Prevención Futura

1. **Siempre usar `INSERT OR IGNORE`** en migraciones de datos
2. **Agregar verificación pre-migración**:
   ```sql
   -- Verificar si ya existen antes de insertar
   INSERT OR IGNORE INTO PAI_VAL_valores (...)
   SELECT ... 
   WHERE NOT EXISTS (
     SELECT 1 FROM PAI_VAL_valores 
     WHERE VAL_atr_id = (SELECT ATR_id FROM PAI_ATR_atributos WHERE ATR_codigo = '...')
     AND VAL_codigo = '...'
   );
   ```

---

## Error G04: Estados de Proyectos No Coinciden

### Descripción del Error

> 1. "Si se ocultan los elementos en pantalla con la ventana emergente, también debe ocultarse el área del marco rojo num 1"
> 2. "Los estados de los proyectos son los del marco rojo 2"
> 3. "De forma errónea los estados en la web-app para el proyecto no coinciden"

**Pantalla**: https://pg-cbc-endes.pages.dev/proyectos

### Archivos Implicados

| Archivo | Ruta | Función |
|---------|------|---------|
| `ListarProyectos.tsx` | `apps/frontend/src/pages/proyectos/` | Tabla de proyectos |
| `pai.ts` (types) | `apps/frontend/src/types/` | Tipos y constantes de estados |
| `005-pai-mvp-datos-iniciales.sql` | `migrations/` | Estados en DB |
| `handleObtenerProyecto` | `apps/worker/src/handlers/pai-proyectos.ts` | Handler backend |

### Diagnóstico Completo

#### Problema 1: Mismo que G01 (Modal)

Ver corrección en error G01.

#### Problema 2: Estados No Coinciden

**Causa Raíz**: **Desincronización entre los estados definidos en el frontend (TypeScript) y los estados en la base de datos (SQL)**.

**Estados en Frontend** (`pai.ts`):
```typescript
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

**Estados en Backend** (`005-pai-mvp-datos-iniciales.sql`):
```sql
-- VAL_codigo (uppercase) → VAL_nombre (lowercase)
'CREADO' → 'creado'
'PROCESANDO_ANALISIS' → 'procesando análisis'  -- ¡ESPACIO!
'ANALISIS_CON_ERROR' → 'análisis con error'    -- ¡ACENTO!
'ANALISIS_FINALIZADO' → 'análisis finalizado'  -- ¡ACENTO!
'EVALUANDO_VIABILIDAD' → 'evaluando viabilidad'
'EVALUANDO_PLAN_NEGOCIO' → 'evaluando Plan Negocio' -- ¡Mayúsculas!
'SEGUIMIENTO_COMERCIAL' → 'seguimiento comercial'
'DESCARTADO' → 'descartado'
```

**Problemas identificados**:

1. **Inconsistencia de formato**:
   - Frontend usa: `procesando_analisis` (snake_case)
   - Backend devuelve: `procesando análisis` (con espacio)

2. **Acentos inconsistentes**:
   - Frontend: `analisis_con_error`
   - Backend: `análisis con error`

3. **El frontend usa `ESTADO_PROYECTO_LABELS`** para mostrar, pero compara con el valor crudo de la API

**Código problemático en frontend**:
```tsx
// ListarProyectos.tsx - Línea ~140
<span className={`px-2 py-1 rounded text-xs ${ESTADO_PROYECTO_COLORS[proyecto.estado]}`}>
  {ESTADO_PROYECTO_LABELS[proyecto.estado]}
</span>
```

**Si `proyecto.estado` es `"procesando análisis"`** (de la API), entonces:
- `ESTADO_PROYECTO_COLORS["procesando análisis"]` → `undefined`
- `ESTADO_PROYECTO_LABELS["procesando análisis"]` → `undefined`

### Plan de Corrección

#### Corrección 1: Normalizar Estados en el Backend

**Opción A: Cambiar DB para que coincida con frontend** (Recomendada)

```sql
-- Migración: Normalizar VAL_nombre para que coincida con tipos TypeScript
-- Propósito: Usar snake_case sin acentos para consistencia

UPDATE PAI_VAL_valores
SET VAL_nombre = 'procesando_analisis'
WHERE VAL_codigo = 'PROCESANDO_ANALISIS';

UPDATE PAI_VAL_valores
SET VAL_nombre = 'analisis_con_error'
WHERE VAL_codigo = 'ANALISIS_CON_ERROR';

UPDATE PAI_VAL_valores
SET VAL_nombre = 'analisis_finalizado'
WHERE VAL_codigo = 'ANALISIS_FINALIZADO';

UPDATE PAI_VAL_valores
SET VAL_nombre = 'evaluando_viabilidad'
WHERE VAL_codigo = 'EVALUANDO_VIABILIDAD';

UPDATE PAI_VAL_valores
SET VAL_nombre = 'evaluando_plan_negocio'
WHERE VAL_codigo = 'EVALUANDO_PLAN_NEGOCIO';

UPDATE PAI_VAL_valores
SET VAL_nombre = 'seguimiento_comercial'
WHERE VAL_codigo = 'SEGUIMIENTO_COMERCIAL';
```

**Opción B: Cambiar frontend para que coincida con DB**

```typescript
// pai.ts - Actualizar tipos
export type EstadoProyecto =
  | 'creado'
  | 'procesando análisis'  // Con espacio
  | 'análisis con error'   // Con acento
  | 'análisis finalizado'
  | 'evaluando viabilidad'
  | 'evaluando Plan Negocio'
  | 'seguimiento comercial'
  | 'descartado';

// Actualizar LABELS y COLORS
export const ESTADO_PROYECTO_LABELS: Record<EstadoProyecto, string> = {
  'creado': 'Creado',
  'procesando análisis': 'En Análisis',
  'análisis con error': 'Análisis con Error',
  'análisis finalizado': 'Análisis Finalizado',
  'evaluando viabilidad': 'Evaluando Viabilidad',
  'evaluando Plan Negocio': 'Evaluando Plan de Negocio',
  'seguimiento comercial': 'Seguimiento Comercial',
  'descartado': 'Descartado',
};
```

#### Corrección 2: Mapeo en el Backend

**Alternativa**: Mantener DB como está pero mapear en el handler:

```typescript
// pai-proyectos.ts - handleObtenerProyecto
const estadoMapper: Record<string, EstadoProyecto> = {
  'procesando análisis': 'procesando_analisis',
  'análisis con error': 'analisis_con_error',
  'análisis finalizado': 'analisis_finalizado',
  'evaluando viabilidad': 'evaluando_viabilidad',
  'evaluando Plan Negocio': 'evaluando_plan_negocio',
  'seguimiento comercial': 'seguimiento_comercial',
};

// Al devolver el proyecto:
estado: estadoMapper[estadoNombre] || estadoNombre,
```

---

## Error G05: Estados de Proyectos No Coinciden (Lista)

### Descripción del Error

> "Los estados de los proyectos son los del marco rojo 2"
> "Mismo problema que en G04"

**Pantalla**: https://pg-cbc-endes.pages.dev/proyectos

### Diagnóstico

**Este error es idéntico al G04**. La lista de proyectos muestra los estados incorrectamente por la misma razón:

- El backend devuelve `VAL_nombre` con formato inconsistente
- El frontend usa ese valor como key para `ESTADO_PROYECTO_LABELS` y `ESTADO_PROYECTO_COLORS`
- Resultado: `undefined` en lugar de label y color

### Archivos Implicados

Mismos que G04, más:

| Archivo | Ruta | Función |
|---------|------|---------|
| `handleListarProyectos` | `apps/worker/src/handlers/pai-proyectos.ts` | Lista con estados |

### Plan de Corrección

**Aplicar la misma corrección que G04**.

Adicionalmente, verificar el dropdown de filtros:

```tsx
// ListarProyectos.tsx - Línea ~85
<select
  className="w-full p-3 border rounded-lg"
  onChange={(e) => handleFiltroChange('estado', e.target.value)}
>
  <option value="">Todos los estados</option>
  <option value="creado">Creado</option>
  <option value="procesando_analisis">En Análisis</option>
  {/* ... */}
</select>
```

**Problema**: El filtro usa `value="procesando_analisis"` pero la DB tiene `VAL_nombre = "procesando análisis"`.

**Solución**: Filtrar por `VAL_codigo` en lugar de `VAL_nombre`, o actualizar los values del select.

---

## Error G06: Error al Agregar Nota - 400 Bad Request

### Descripción del Error

> 1. "Al agregar una nota"
> 2. "Dar clic en guardar"
> 3. "Se produce un error: 'Error desconocido'"

**Consola**:
```
POST https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/4/notas 400 (Bad Request)
```

**Pantalla**: https://pg-cbc-endes.pages.dev/proyectos

### Archivos Implicados

| Archivo | Ruta | Función |
|---------|------|---------|
| `FormularioNota.tsx` | `apps/frontend/src/components/pai/` | Formulario de nota |
| `ListaNotas.tsx` | `apps/frontend/src/components/pai/` | Lista de notas |
| `pai-api.ts` | `apps/frontend/src/lib/` | Cliente API |
| `pai-notas.ts` | `apps/worker/src/handlers/` | Handler backend |
| `010-pai-notas-estado-val-id-nullable.sql` | `migrations/` | Migración de notas |

### Diagnóstico Completo

#### Análisis del Error 400 Bad Request

**Flujo de la solicitud**:
```
FormularioNota.tsx (onSubmit)
  → paiApiClient.crearNota(proyectoId, { contenido })
  → POST /api/pai/proyectos/:id/notas
  → handleCrearNota (pai-notas.ts)
  → Valida y inserta en DB
```

#### Código Frontend

```typescript
// FormularioNota.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!contenido.trim()) {
    setError('El contenido de la nota es obligatorio');
    return;
  }

  const response = await paiApiClient.crearNota(proyectoId, { contenido });

  if (response.success && response.data?.nota) {
    onGuardado(response.data.nota);
  } else {
    setError(response.error?.message || 'Error al crear nota');
  }
};
```

**Request enviado**:
```json
POST /api/pai/proyectos/4/notas
Content-Type: application/json

{
  "contenido": "texto de la nota"
}
```

#### Código Backend

```typescript
// pai-notas.ts - handleCrearNota
export async function handleCrearNota(c: AppContext): Promise<Response> {
  const db = getDB(c.env)
  const idParam = c.req.param('id')
  const proyectoId = parseInt(idParam)

  const body = await c.req.json<{ tipo_nota_id: number; autor: string; contenido: string }>()
  const { tipo_nota_id, autor, contenido } = body

  // Validar datos
  if (!tipo_nota_id || !autor || !contenido) {
    return c.json({ error: 'Datos de nota inválidos. Se requieren: tipo_nota_id, autor, contenido' }, 400)
  }

  // ... insertar nota
}
```

#### Causa Raíz Identificada

**¡El frontend envía `{ contenido }` pero el backend espera `{ tipo_nota_id, autor, contenido }`!**

**Mismatch de contrato API**:

| Campo | Frontend | Backend | ¿Requerido? |
|-------|----------|---------|-------------|
| `contenido` | ✅ Envía | ✅ Espera | Sí |
| `tipo_nota_id` | ❌ No envía | ✅ Espera | Sí |
| `autor` | ❌ No envía | ✅ Espera | Sí |

**El backend devuelve 400** porque:
```typescript
if (!tipo_nota_id || !autor || !contenido) {
  return c.json({ error: 'Datos de nota inválidos. Se requieren: tipo_nota_id, autor, contenido' }, 400)
}
```

#### ¿Por qué el frontend no envía `tipo_nota_id` y `autor`?

**Análisis del formulario**:

```tsx
// FormularioNota.tsx - No tiene campos para tipo_nota_id o autor
export function FormularioNota({ proyectoId, onGuardado, onCancel }: FormularioNotaProps) {
  const [contenido, setContenido] = useState('');
  // NO hay estado para tipo_nota_id ni autor

  const handleSubmit = async (e: React.FormEvent) => {
    // Solo envía contenido
    const response = await paiApiClient.crearNota(proyectoId, { contenido });
  };
}
```

**Posibles razones**:

1. **La migración 010 hizo `NOT_estado_val_id` nullable** pero el backend sigue requiriendo `tipo_nota_id`
2. **El formulario fue diseñado para ser simple** pero el backend requiere más campos
3. **Falta de documentación del contrato API** entre frontend y backend

#### Diagnóstico de la Migración 010

```sql
-- 010-pai-notas-estado-val-id-nullable.sql
-- La migración hace nullable NOT_estado_val_id pero NO menciona NOT_tipo_val_id

CREATE TABLE IF NOT EXISTS PAI_NOT_notas_new (
  NOT_id                  INTEGER PRIMARY KEY,
  NOT_proyecto_id          INTEGER NOT NULL,
  NOT_tipo_val_id          INTEGER NOT NULL,  -- ¡SIGUE SIENDO NOT NULL!
  NOT_asunto              TEXT NOT NULL,
  NOT_nota                 TEXT NOT NULL,
  NOT_estado_val_id        INTEGER,  -- Ahora nullable
  NOT_editable             INTEGER NOT NULL DEFAULT 1,
  -- ...
);
```

**Conclusión**: `NOT_tipo_val_id` sigue siendo `NOT NULL`, por lo que el backend lo requiere correctamente.

### Plan de Corrección

#### Opción A: Frontend debe enviar todos los campos (Recomendada)

**Modificar `FormularioNota.tsx`**:

```tsx
export function FormularioNota({ proyectoId, onGuardado, onCancel }: FormularioNotaProps) {
  const [contenido, setContenido] = useState('');
  const [tipoNota, setTipoNota] = useState('1'); // Default: COMENTARIO
  const [autor, setAutor] = useState('Usuario'); // Default o desde auth context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contenido.trim()) {
      setError('El contenido de la nota es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);

    // Enviar todos los campos requeridos
    const response = await paiApiClient.crearNota(proyectoId, { 
      tipo_nota_id: parseInt(tipoNota),
      autor,
      contenido 
    });

    setLoading(false);

    if (response.success && response.data?.nota) {
      onGuardado(response.data.nota);
    } else {
      setError(response.error?.message || 'Error al crear nota');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium mb-3">Nueva Nota</h3>

      {/* Campo: Tipo de Nota */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-2">Tipo de Nota</label>
        <select
          value={tipoNota}
          onChange={(e) => setTipoNota(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="1">Comentario</option>
          <option value="2">Valoración</option>
          <option value="3">Decisión</option>
          <option value="4">Corrección IA</option>
        </select>
      </div>

      {/* Campo: Autor */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-2">Autor</label>
        <input
          type="text"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          placeholder="Tu nombre"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          required
        />
      </div>

      {/* Campo: Contenido */}
      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        placeholder="Escribe tu nota aquí..."
        className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        disabled={loading}
        required
      />

      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}

      <div className="mt-3 flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !contenido.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Nota'}
        </button>
      </div>
    </form>
  );
}
```

#### Opción B: Backend usa valores por defecto

**Modificar `handleCrearNota` en backend**:

```typescript
// pai-notas.ts
export async function handleCrearNota(c: AppContext): Promise<Response> {
  // ...

  const body = await c.req.json<{ 
    tipo_nota_id?: number; 
    autor?: string; 
    contenido: string 
  }>()
  
  const { 
    tipo_nota_id = 1, // Default: COMENTARIO
    autor = 'Usuario', // Default
    contenido 
  } = body

  // Validar solo contenido (requerido)
  if (!contenido) {
    return c.json({ error: 'El contenido es obligatorio' }, 400)
  }

  // ... resto del código
}
```

**Ventaja**: Frontend no necesita cambiar
**Desventaja**: Menos control sobre los datos, valores genéricos

#### Opción C: Combinación (Recomendada para producción)

1. **Frontend envía campos completos** (Opción A)
2. **Backend tiene defaults como fallback** (Opción B)
3. **Backend valida tipos de nota existentes**:

```typescript
// Verificar que tipo_nota_id existe
const tipoNota = await db
  .prepare('SELECT VAL_id FROM PAI_VAL_valores WHERE VAL_id = ? AND VAL_activo = 1')
  .bind(tipo_nota_id)
  .first()

if (!tipoNota) {
  return c.json({ error: 'Tipo de nota inválido' }, 400)
}
```

---

## Error G11: Valores PAI_VAL_valores Repetidos (VAL_id 47-54)

### Descripción del Error

> "Eliminar valores repetidos, VAL_id 47 a 54"

**Imágenes**: `_error_ctrl/02_Grupo/G11.png`

### Archivos Implicados

| Archivo | Ruta | Función |
|---------|------|---------|
| `005-pai-mvp-datos-iniciales.sql` | `migrations/` | Inserta datos iniciales |
| Tabla `PAI_VAL_valores` | D1 Database | Valores de atributos |

### Diagnóstico

**Misma causa raíz que G03**: Valores duplicados creados por re-ejecución de migración 005.

**Rango afectado**: VAL_id 47-54 (8 valores)

**Patrón**: Coincide con un grupo completo de valores (probablemente: 8 estados de proyecto O 8 motivos de valoración O 8 motivos de descarte)

### Plan de Corrección

**Aplicar misma corrección que G03** - Ver sección de Diagnóstico Consolidado más abajo.

---

## Error G12: Valores PAI_VAL_valores Repetidos (VAL_id 55-62)

### Descripción del Error

> "Eliminar valores repetidos, VAL_id 55 a 62"

**Imágenes**: `_error_ctrl/02_Grupo/G12.png`

### Archivos Implicados

| Archivo | Ruta | Función |
|---------|------|---------|
| `005-pai-mvp-datos-iniciales.sql` | `migrations/` | Inserta datos iniciales |
| Tabla `PAI_VAL_valores` | D1 Database | Valores de atributos |

### Diagnóstico

**Misma causa raíz que G03**: Valores duplicados creados por re-ejecución de migración 005.

**Rango afectado**: VAL_id 55-62 (8 valores)

**Patrón**: Coincide con un grupo completo de valores.

### Plan de Corrección

**Aplicar misma corrección que G03** - Ver sección de Diagnóstico Consolidado más abajo.

---

## Error G13: Valores PAI_VAL_valores Repetidos (VAL_id 68-76)

### Descripción del Error

> "Eliminar valores repetidos, VAL_id 68 a 76"

**Imágenes**: `_error_ctrl/02_Grupo/G13.png`

### Archivos Implicados

| Archivo | Ruta | Función |
|---------|------|---------|
| `005-pai-mvp-datos-iniciales.sql` | `migrations/` | Inserta datos iniciales |
| Tabla `PAI_VAL_valores` | D1 Database | Valores de atributos |

### Diagnóstico

**Misma causa raíz que G03**: Valores duplicados creados por re-ejecución de migración 005.

**Rango afectado**: VAL_id 68-76 (9 valores)

**Patrón**: Coincide posiblemente con los 9 tipos de artefacto + 1 valor adicional.

### Plan de Corrección

**Aplicar misma corrección que G03** - Ver sección de Diagnóstico Consolidado más abajo.

---

## Error G14: Valores PAI_VAL_valores Repetidos (VAL_id 63-67)

### Descripción del Error

> "Eliminar valores repetidos, VAL_id 63 a 67"

**Imágenes**: `_error_ctrl/02_Grupo/g14.png`

### Archivos Implicados

| Archivo | Ruta | Función |
|---------|------|---------|
| `005-pai-mvp-datos-iniciales.sql` | `migrations/` | Inserta datos iniciales |
| Tabla `PAI_VAL_valores` | D1 Database | Valores de atributos |

### Diagnóstico

**Misma causa raíz que G03**: Valores duplicados creados por re-ejecución de migración 005.

**Rango afectado**: VAL_id 63-67 (5 valores)

**Patrón**: Coincide posiblemente con tipos de nota (4) + 1 valor adicional O valores huérfanos de otra migración.

### Plan de Corrección

**Aplicar misma corrección que G03** - Ver sección de Diagnóstico Consolidado más abajo.

---

## Diagnóstico Consolidado - Problema G03/G11-G14

### Visión General del Problema Sistémico

Los errores **G03, G11, G12, G13 y G14** representan manifestaciones del mismo problema subyacente: **duplicidad masiva de valores en `PAI_VAL_valores`** debido a migraciones ejecutadas sin control de idempotencia.

### Análisis de Rangos Afectados

| Error | Rango VAL_id | Cantidad | Grupo Probable |
|-------|--------------|----------|----------------|
| G03 | 39-46 | 8 | Estados de proyecto (ejecución 1) |
| G11 | 47-54 | 8 | Estados de proyecto (ejecución 2) |
| G12 | 55-62 | 8 | Estados de proyecto (ejecución 3) |
| G14 | 63-67 | 5 | Tipos de nota parciales |
| G13 | 68-76 | 9 | Tipos de artefacto |

**Total**: 38 valores duplicados

### Causa Raíz Detallada

**Migración 005** (`005-pai-mvp-datos-iniciales.sql`) inserta:
- 8 estados de proyecto
- 8 motivos de valoración
- 8 motivos de descarte
- 4 tipos de nota
- 1 valor ACTIVO para TIPO_NOTA
- 9 tipos de artefacto

**Total por ejecución**: 38 valores

**Problema**: Aunque usa `INSERT OR IGNORE`, la migración se ejecutó en contextos donde:
1. Los atributos (`PAI_ATR_atributos`) tenían diferentes IDs
2. Los valores se crearon manualmente y luego la migración intentó recrearlos
3. Hubo rollback parcial de migraciones

### Diagnóstico SQL Completo

```sql
-- 1. Identificar TODOS los valores duplicados por atributo y código
SELECT 
  a.ATR_codigo,
  v.VAL_codigo,
  COUNT(*) as cantidad_duplicados,
  GROUP_CONCAT(v.VAL_id) as ids,
  GROUP_CONCAT(v.VAL_nombre) as nombres
FROM PAI_VAL_valores v
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
GROUP BY a.ATR_codigo, v.VAL_codigo
HAVING COUNT(*) > 1
ORDER BY a.ATR_codigo, v.VAL_codigo;

-- 2. Verificar valores en rangos problemáticos (39-76)
SELECT 
  v.VAL_id,
  a.ATR_codigo,
  v.VAL_codigo,
  v.VAL_nombre,
  v.VAL_activo
FROM PAI_VAL_valores v
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
WHERE v.VAL_id BETWEEN 39 AND 76
ORDER BY v.VAL_id;

-- 3. Verificar dependencias de valores duplicados
-- Estados de proyecto usados en proyectos
SELECT 
  p.PRO_id,
  p.PRO_estado_val_id,
  v.VAL_codigo,
  v.VAL_nombre
FROM PAI_PRO_proyectos p
JOIN PAI_VAL_valores v ON p.PRO_estado_val_id = v.VAL_id
WHERE p.PRO_estado_val_id BETWEEN 39 AND 76;

-- Tipos de nota usados en notas
SELECT 
  n.NOT_id,
  n.NOT_tipo_val_id,
  v.VAL_codigo,
  v.VAL_nombre
FROM PAI_NOT_notas n
JOIN PAI_VAL_valores v ON n.NOT_tipo_val_id = v.VAL_id
WHERE n.NOT_tipo_val_id BETWEEN 39 AND 76;

-- Tipos de artefacto usados en artefactos
SELECT 
  a.ART_id,
  a.ART_tipo_val_id,
  v.VAL_codigo,
  v.VAL_nombre
FROM PAI_ART_artefactos a
JOIN PAI_VAL_valores v ON a.ART_tipo_val_id = v.VAL_id
WHERE a.ART_tipo_val_id BETWEEN 39 AND 76;
```

### Estrategia de Corrección Unificada

**Principio**: Mantener solo la PRIMERA ocurrencia de cada valor duplicado (VAL_id más bajo) y eliminar las posteriores.

**Pasos**:

1. **Identificar duplicados**: Para cada (ATR_id, VAL_codigo) mantener solo el VAL_id más bajo
2. **Verificar dependencias**: Asegurar que no hay FK apuntando a los valores a eliminar
3. **Reasignar dependencias**: Si hay FK apuntando a valores a eliminar, actualizarlas al VAL_id retenido
4. **Eliminar duplicados**: Borrar valores sobrantes
5. **Verificar integridad**: Confirmar que quedan solo valores únicos por (ATR_id, VAL_codigo)

---

## Plan de Corrección Consolidado

### Prioridad 1: Errores Críticos (DB y API)

| Error | Corrección | Archivos | Tiempo Est. |
|-------|------------|----------|-------------|
| **G03, G11, G12, G13, G14** | Migración de limpieza unificada | `migrations/011-limpieza-valores-duplicados.sql` | 1 hora |
| **G04, G05** | Normalizar estados | `pai.ts`, `migrations/012-normalizar-estados.sql` | 1 hora |
| **G06** | Formulario de notas | `FormularioNota.tsx`, `pai-notas.ts` | 1 hora |

### Prioridad 2: Errores de UI

| Error | Corrección | Archivos | Tiempo Est. |
|-------|------------|----------|-------------|
| **G01** | Modal con Portal | `ListarProyectos.tsx`, nuevo `Modal.tsx` | 1 hora |
| **G02** | Filtrar menú | `useMenu.ts`, migración SQL | 45 min |

### Secuencia Recomendada

```
1. G03/G11/G12/G13/G14 - Limpieza DB unificada (1 hora)
   ↓
2. G04/G05 - Estados (1 hora)
   ↓
3. G06 - Notas API (1 hora)
   ↓
4. G01 - Modal UI (1 hora)
   ↓
5. G02 - Menú (45 min)
```

**Tiempo total estimado**: 4 horas 45 minutos

---

## Anexos

### A. Migración G03/G11/G12/G13/G14 - Limpieza Unificada de Valores Duplicados

```sql
-- ============================================================================
-- Migración: 011-limpieza-valores-duplicados.sql
-- ============================================================================
-- Propósito: Eliminar TODOS los valores duplicados en PAI_VAL_valores
--            Errores: G03, G11, G12, G13, G14
--            Rangos afectados: VAL_id 39-76 (aproximadamente 38 valores)
-- ============================================================================

-- PASO 1: DIAGNÓSTICO COMPLETO
-- ============================================================================

-- 1.1 Identificar TODOS los valores duplicados por atributo y código
SELECT 
  a.ATR_codigo,
  v.VAL_codigo,
  COUNT(*) as cantidad_duplicados,
  GROUP_CONCAT(v.VAL_id) as ids,
  GROUP_CONCAT(v.VAL_nombre) as nombres
FROM PAI_VAL_valores v
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
GROUP BY a.ATR_codigo, v.VAL_codigo
HAVING COUNT(*) > 1
ORDER BY a.ATR_codigo, v.VAL_codigo;

-- 1.2 Verificar valores en rangos problemáticos (39-76)
SELECT 
  v.VAL_id,
  a.ATR_codigo,
  v.VAL_codigo,
  v.VAL_nombre,
  v.VAL_activo
FROM PAI_VAL_valores v
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
WHERE v.VAL_id BETWEEN 39 AND 76
ORDER BY v.VAL_id;

-- 1.3 Verificar dependencias - Estados de proyecto en proyectos
SELECT 
  'PRO_proyectos' as tabla,
  p.PRO_estado_val_id,
  COUNT(*) as cantidad,
  GROUP_CONCAT(DISTINCT p.PRO_cii) as ciis_afectados
FROM PAI_PRO_proyectos p
WHERE p.PRO_estado_val_id BETWEEN 39 AND 76
GROUP BY p.PRO_estado_val_id;

-- 1.4 Verificar dependencias - Tipos de nota en notas
SELECT 
  'PAI_NOT_notas' as tabla,
  n.NOT_tipo_val_id,
  COUNT(*) as cantidad
FROM PAI_NOT_notas n
WHERE n.NOT_tipo_val_id BETWEEN 39 AND 76
GROUP BY n.NOT_tipo_val_id;

-- 1.5 Verificar dependencias - Tipos de artefacto en artefactos
SELECT 
  'PAI_ART_artefactos' as tabla,
  a.ART_tipo_val_id,
  COUNT(*) as cantidad
FROM PAI_ART_artefactos a
WHERE a.ART_tipo_val_id BETWEEN 39 AND 76
GROUP BY a.ART_tipo_val_id;

-- 1.6 Verificar dependencias - Motivos de valoración en proyectos
SELECT 
  'PRO_motivo_val_id' as tabla,
  p.PRO_motivo_val_id,
  COUNT(*) as cantidad
FROM PAI_PRO_proyectos p
WHERE p.PRO_motivo_val_id BETWEEN 39 AND 76
GROUP BY p.PRO_motivo_val_id;

-- PASO 2: CREAR TABLA TEMPORAL DE DUPLICADOS A ELIMINAR
-- ============================================================================
-- Mantiene el VAL_id más bajo de cada grupo duplicado, identifica los demás

CREATE TEMP TABLE IF NOT EXISTS val_duplicados_a_eliminar AS
WITH duplicados AS (
  SELECT 
    VAL_atr_id,
    VAL_codigo,
    MIN(VAL_id) as val_id_a_mantener,
    GROUP_CONCAT(VAL_id) as todos_ids
  FROM PAI_VAL_valores
  GROUP BY VAL_atr_id, VAL_codigo
  HAVING COUNT(*) > 1
)
SELECT 
  d.VAL_atr_id,
  d.VAL_codigo,
  d.val_id_a_mantener,
  d.todos_ids,
  -- IDs a eliminar: todos excepto el más bajo
  REPLACE(
    REPLACE(d.todos_ids, d.val_id_a_mantener || ',', ''),
    ',' || d.val_id_a_mantener, ''
  ) as ids_a_eliminar
FROM duplicados d;

-- 2.1 Verificar qué se va a eliminar
SELECT * FROM val_duplicados_a_eliminar;

-- 2.2 Lista plana de IDs a eliminar
WITH RECURSIVE ids(id_a_eliminar, resto, val_atr_id, val_codigo) AS (
  SELECT 
    CAST(SUBSTR(ids_a_eliminar, 1, INSTR(ids_a_eliminar || ',', ',') - 1) AS INTEGER),
    SUBSTR(ids_a_eliminar, INSTR(ids_a_eliminar || ',', ',') + 1),
    VAL_atr_id,
    VAL_codigo
  FROM val_duplicados_a_eliminar
  WHERE ids_a_eliminar != ''
  
  UNION ALL
  
  SELECT 
    CAST(SUBSTR(resto, 1, INSTR(resto || ',', ',') - 1) AS INTEGER),
    SUBSTR(resto, INSTR(resto || ',', ',') + 1),
    val_atr_id,
    val_codigo
  FROM ids
  WHERE resto != ''
)
SELECT id_a_eliminar, val_atr_id, val_codigo FROM ids ORDER BY id_a_eliminar;

-- PASO 3: REASIGNAR DEPENDENCIAS (si las hay)
-- ============================================================================
-- Para cada tabla con dependencias, actualizar FK al VAL_id retenido

-- 3.1 Actualizar proyectos que usan estados duplicados
UPDATE PAI_PRO_proyectos
SET PRO_estado_val_id = (
  SELECT val_id_a_mantener 
  FROM val_duplicados_a_eliminar 
  WHERE VAL_atr_id = (SELECT VAL_atr_id FROM PAI_VAL_valores WHERE VAL_id = PAI_PRO_proyectos.PRO_estado_val_id)
    AND VAL_codigo = (SELECT VAL_codigo FROM PAI_VAL_valores WHERE VAL_id = PAI_PRO_proyectos.PRO_estado_val_id)
)
WHERE PRO_estado_val_id IN (SELECT ids_a_eliminar FROM val_duplicados_a_eliminar);

-- 3.2 Actualizar proyectos que usan motivos duplicados
UPDATE PAI_PRO_proyectos
SET PRO_motivo_val_id = (
  SELECT val_id_a_mantener 
  FROM val_duplicados_a_eliminar 
  WHERE VAL_atr_id = (SELECT VAL_atr_id FROM PAI_VAL_valores WHERE VAL_id = PAI_PRO_proyectos.PRO_motivo_val_id)
    AND VAL_codigo = (SELECT VAL_codigo FROM PAI_VAL_valores WHERE VAL_id = PAI_PRO_proyectos.PRO_motivo_val_id)
)
WHERE PRO_motivo_val_id IN (SELECT ids_a_eliminar FROM val_duplicados_a_eliminar);

-- 3.3 Actualizar notas que usan tipos duplicados
UPDATE PAI_NOT_notas
SET NOT_tipo_val_id = (
  SELECT val_id_a_mantener 
  FROM val_duplicados_a_eliminar 
  WHERE VAL_atr_id = (SELECT VAL_atr_id FROM PAI_VAL_valores WHERE VAL_id = PAI_NOT_notas.NOT_tipo_val_id)
    AND VAL_codigo = (SELECT VAL_codigo FROM PAI_VAL_valores WHERE VAL_id = PAI_NOT_notas.NOT_tipo_val_id)
)
WHERE NOT_tipo_val_id IN (SELECT ids_a_eliminar FROM val_duplicados_a_eliminar);

-- 3.4 Actualizar artefactos que usan tipos duplicados
UPDATE PAI_ART_artefactos
SET ART_tipo_val_id = (
  SELECT val_id_a_mantener 
  FROM val_duplicados_a_eliminar 
  WHERE VAL_atr_id = (SELECT VAL_atr_id FROM PAI_VAL_valores WHERE VAL_id = PAI_ART_artefactos.ART_tipo_val_id)
    AND VAL_codigo = (SELECT VAL_codigo FROM PAI_VAL_valores WHERE VAL_id = PAI_ART_artefactos.ART_tipo_val_id)
)
WHERE ART_tipo_val_id IN (SELECT ids_a_eliminar FROM val_duplicados_a_eliminar);

-- PASO 4: ELIMINAR VALORES DUPLICADOS
-- ============================================================================

-- 4.1 Eliminar usando la tabla temporal
DELETE FROM PAI_VAL_valores
WHERE VAL_id IN (
  SELECT id_a_eliminar FROM (
    WITH RECURSIVE ids(id_a_eliminar, resto) AS (
      SELECT 
        CAST(SUBSTR(ids_a_eliminar, 1, INSTR(ids_a_eliminar || ',', ',') - 1) AS INTEGER),
        SUBSTR(ids_a_eliminar, INSTR(ids_a_eliminar || ',', ',') + 1)
      FROM val_duplicados_a_eliminar
      WHERE ids_a_eliminar != ''
      
      UNION ALL
      
      SELECT 
        CAST(SUBSTR(resto, 1, INSTR(resto || ',', ',') - 1) AS INTEGER),
        SUBSTR(resto, INSTR(resto || ',', ',') + 1)
      FROM ids
      WHERE resto != ''
    )
    SELECT id_a_eliminar FROM ids
  )
);

-- PASO 5: VERIFICACIÓN POST-LIMPIEZA
-- ============================================================================

-- 5.1 Verificar que no quedan duplicados
SELECT 
  a.ATR_codigo,
  v.VAL_codigo,
  COUNT(*) as cantidad
FROM PAI_VAL_valores v
JOIN PAI_ATR_atributos a ON v.VAL_atr_id = a.ATR_id
GROUP BY a.ATR_codigo, v.VAL_codigo
HAVING COUNT(*) > 1;
-- Debe devolver 0 filas

-- 5.2 Verificar que quedan valores únicos por atributo
SELECT 
  a.ATR_codigo,
  COUNT(v.VAL_id) as cantidad_valores,
  GROUP_CONCAT(v.VAL_codigo) as codigos
FROM PAI_ATR_atributos a
LEFT JOIN PAI_VAL_valores v ON a.ATR_id = v.VAL_atr_id
GROUP BY a.ATR_codigo
ORDER BY a.ATR_codigo;

-- 5.3 Verificar integridad de proyectos
SELECT COUNT(*) as proyectos_con_estado_invalido
FROM PAI_PRO_proyectos p
LEFT JOIN PAI_VAL_valores v ON p.PRO_estado_val_id = v.VAL_id
WHERE v.VAL_id IS NULL;
-- Debe devolver 0

-- PASO 6: LIMPIEZA
-- ============================================================================

DROP TABLE IF EXISTS val_duplicados_a_eliminar;
```

### B. Migración G04 - Normalización Estados

```sql
-- Migración: 012-normalizar-estados-proyecto.sql
-- Propósito: Alinear VAL_nombre con tipos TypeScript del frontend

UPDATE PAI_VAL_valores
SET VAL_nombre = 'procesando_analisis'
WHERE VAL_codigo = 'PROCESANDO_ANALISIS';

UPDATE PAI_VAL_valores
SET VAL_nombre = 'analisis_con_error'
WHERE VAL_codigo = 'ANALISIS_CON_ERROR';

UPDATE PAI_VAL_valores
SET VAL_nombre = 'analisis_finalizado'
WHERE VAL_codigo = 'ANALISIS_FINALIZADO';

UPDATE PAI_VAL_valores
SET VAL_nombre = 'evaluando_viabilidad'
WHERE VAL_codigo = 'EVALUANDO_VIABILIDAD';

UPDATE PAI_VAL_valores
SET VAL_nombre = 'evaluando_plan_negocio'
WHERE VAL_codigo = 'EVALUANDO_PLAN_NEGOCIO';

UPDATE PAI_VAL_valores
SET VAL_nombre = 'seguimiento_comercial'
WHERE VAL_codigo = 'SEGUIMIENTO_COMERCIAL';
```

### C. Contrato API - Crear Nota

```typescript
// Request
POST /api/pai/proyectos/:id/notas
Content-Type: application/json

{
  "tipo_nota_id": number,    // Requerido: 1=Comentario, 2=Valoración, 3=Decisión, 4=Corrección IA
  "autor": string,           // Requerido: Nombre del autor
  "contenido": string        // Requerido: Contenido de la nota (mínimo 1 carácter)
}

// Response 201 Created
{
  "nota": {
    "id": number,
    "proyecto_id": number,
    "tipo_nota_id": number,
    "tipo": string,
    "autor": string,
    "contenido": string,
    "fecha_creacion": string (ISO 8601)
  }
}

// Response 400 Bad Request
{
  "error": "Datos de nota inválidos. Se requieren: tipo_nota_id, autor, contenido"
}
```

### D. Checklist de Verificación Post-Corrección

#### Limpieza de Valores Duplicados (G03, G11, G12, G13, G14)

- [ ] Ejecutar migración `011-limpieza-valores-duplicados.sql`
- [ ] G03: `SELECT COUNT(*) FROM PAI_VAL_valores WHERE VAL_id BETWEEN 39 AND 46` → debe devolver 0
- [ ] G11: `SELECT COUNT(*) FROM PAI_VAL_valores WHERE VAL_id BETWEEN 47 AND 54` → debe devolver 0
- [ ] G12: `SELECT COUNT(*) FROM PAI_VAL_valores WHERE VAL_id BETWEEN 55 AND 62` → debe devolver 0
- [ ] G13: `SELECT COUNT(*) FROM PAI_VAL_valores WHERE VAL_id BETWEEN 68 AND 76` → debe devolver 0
- [ ] G14: `SELECT COUNT(*) FROM PAI_VAL_valores WHERE VAL_id BETWEEN 63 AND 67` → debe devolver 0
- [ ] Verificar que no quedan duplicados: `SELECT ATR_codigo, VAL_codigo, COUNT(*) FROM ... HAVING COUNT(*) > 1` → 0 filas
- [ ] Verificar integridad de proyectos: todos tienen estado válido
- [ ] Verificar integridad de notas: todos tienen tipo válido

#### Normalización de Estados (G04, G05)

- [ ] Ejecutar migración `012-normalizar-estados-proyecto.sql`
- [ ] G04: Verificar en UI de detalle que los estados se muestran correctamente
- [ ] G05: Verificar que el filtro de estados en lista funciona
- [ ] Verificar que `ESTADO_PROYECTO_LABELS` y `ESTADO_PROYECTO_COLORS` coinciden con valores DB

#### Corrección de API de Notas (G06)

- [ ] G06: Crear nota exitosamente desde el frontend
- [ ] Verificar que formulario incluye tipo_nota_id y autor
- [ ] Verificar que backend acepta los campos enviados
- [ ] Verificar que la nota se guarda en DB correctamente

#### Correcciones de UI (G01, G02)

- [ ] G01: Modal oscurece completamente el fondo (incluyendo header/sidebar)
- [ ] G02: Funciones de acción no aparecen en menú lateral
- [ ] G02: Botón "Crear Proyecto" abre modal correctamente
- [ ] Verificar que z-index de modales es mayor que header (`z-[100000]` vs `z-99999`)

---

*Documento generado: 2026-03-28*
*Diagnóstico basado en análisis estático de código y evidencia de errores reportados*
