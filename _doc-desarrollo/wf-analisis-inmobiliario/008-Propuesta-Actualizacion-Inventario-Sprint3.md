# Propuesta de Actualización de Inventario - Sprint 3: Frontend UI del Workflow

## Índice de Contenido

1. [Objetivo del Documento](#1-objetivo-del-documento)
2. [Criterio de Detección de Cambios](#2-criterio-de-detección-de-cambios)
3. [Resumen de Cambios del Sprint 3](#3-resumen-de-cambios-del-sprint-3)
4. [Archivos Nuevos](#4-archivos-nuevos)
5. [Archivos Modificados](#5-archivos-modificados)
6. [Recursos Cloudflare](#6-recursos-cloudflare)
7. [Configuraciones y Servicios](#7-configuraciones-y-servicios)
8. [Puntos Pendientes o No Verificables](#8-puntos-pendientes-o-no-verificables)
9. [Referencias](#9-referencias)

---

## 1. Objetivo del Documento

Este documento lista **todas las modificaciones, incorporaciones y actualizaciones** que deberían realizarse en `.governance/inventario_recursos.md` como consecuencia del trabajo realizado en el **Sprint 3: Implementación del Frontend - UI del Workflow**.

**Importante:** Este documento es una **propuesta** para el agente `inventariador`. No modifica directamente el inventario.

---

## 2. Criterio de Detección de Cambios

Se han detectado cambios inventariables basándose en:

1. **Archivos nuevos creados** - Cualquier archivo nuevo que agregue funcionalidad
2. **Archivos modificados** - Cambios en componentes, hooks, librerías existentes
3. **Nuevos textos i18n** - Textos de internacionalización añadidos
4. **Cambios en contratos de servicio** - Modificaciones en request/response de APIs frontend

---

## 3. Resumen de Cambios del Sprint 3

### 3.1. Visión General

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| **Archivos Nuevos** | 1 | `components/pai/BotonEjecutarAnalisis.tsx` |
| **Archivos Modificados** | 4 | `DetalleProyecto.tsx`, `use-pai.ts`, `pai-api.ts`, `es-ES.ts` |
| **Recursos Cloudflare** | 0 | No se crean recursos nuevos |
| **Textos i18n Nuevos** | 6 | Textos para estados del botón de análisis |

### 3.2. Impacto en Inventario

| Sección del Inventario | ¿Requiere Actualización? | Motivo |
|------------------------|--------------------------|--------|
| **4.9 Cloudflare Pages** | ⚠️ Sí (notas) | Nuevo componente desplegado |
| **8. Contratos entre Servicios** | ❌ No | Endpoint existente, solo parámetro opcional añadido |
| **11. Archivos de Configuración** | ⚠️ Sí | Nuevos archivos de componente frontend |

---

## 4. Archivos Nuevos

### 4.1. `apps/frontend/src/components/pai/BotonEjecutarAnalisis.tsx`

**Propósito:** Componente de botón para ejecutar análisis con validación de estado y indicador de progreso

**Características:**
- Valida estado del proyecto (habilitado para estados 1, 2, 3, 4)
- Muestra progreso durante ejecución ("Paso X de 7: {nombre}")
- Estados: idle, loading, success
- Tooltip explicativo cuando está deshabilitado
- Integración con i18n para textos

**Funciones exportadas:**
- `BotonEjecutarAnalisis(props)`: Componente principal

**Props:**
```typescript
interface BotonEjecutarAnalisisProps {
  proyectoId: number;
  estadoId: number;
  onEjecutar: (proyectoId: number) => Promise<void>;
  onSuccess: () => void;
  onError: (error: string) => void;
}
```

**Motivo de actualización en inventario:**
- Nuevo componente frontend para UI del workflow
- Implementa condicionalidad por estado según ROADMAP

**Ubicación en inventario:**
```markdown
**Archivos de Componentes Frontend PAI:**
| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `apps/frontend/src/components/pai/BotonEjecutarAnalisis.tsx` | Botón condicional para ejecutar análisis con progreso | ✅ Nuevo (Sprint 3) |
| `apps/frontend/src/components/pai/ResultadosAnalisis.tsx` | Componente de 9 pestañas de resultados | ✅ Existente |
| `apps/frontend/src/components/pai/VisualizadorMarkdown.tsx` | Visualizador de contenido Markdown | ✅ Existente |
```

---

## 5. Archivos Modificados

### 5.1. `apps/frontend/src/pages/proyectos/DetalleProyecto.tsx`

**Cambios principales:**
1. **Importación de nuevo componente**: `BotonEjecutarAnalisis`
2. **Importación de i18n**: `useLocale` hook
3. **Nuevo estado**: `analisisEnProgreso` para tracking
4. **Función actualizada**: `handleEjecutarAnalisis()` ahora acepta `proyectoId` y usa confirmación i18n
5. **Nuevas funciones**: `handleAnalisisSuccess()`, `handleAnalisisError()`
6. **Renderizado**: Reemplaza botón simple por `BotonEjecutarAnalisis` component

**Comportamiento anterior:**
- Botón simple con texto estático
- Confirmación hardcodeada en español
- Sin indicador de progreso

**Comportamiento nuevo:**
- Componente reutilizable con validación de estado
- Confirmación con i18n
- Indicador de progreso ("Paso X de 7: {nombre}")
- Estados visuales (idle, loading, success)

**Motivo de actualización en inventario:**
- Componente principal de detalle actualizado con nueva UI de análisis

---

### 5.2. `apps/frontend/src/hooks/use-pai.ts`

**Función modificada:** `useEjecutarAnalisis()`

**Cambio:**
```typescript
// Antes
const ejecutarAnalisis = useCallback(async (id: number) => { ... }

// Ahora
const ejecutarAnalisis = useCallback(async (
  id: number,
  options?: { forzar_reejecucion?: boolean }
) => { ... }
```

**Motivo de actualización en inventario:**
- Hook ahora acepta parámetro opcional `forzar_reejecucion`

---

### 5.3. `apps/frontend/src/lib/pai-api.ts`

**Método modificado:** `ejecutarAnalisis()`

**Cambio:**
```typescript
// Antes
async ejecutarAnalisis(id: number): Promise<ApiResponse<EjecutarAnalisisResponse>> {
  return this.post<EjecutarAnalisisResponse>(`/api/pai/proyectos/${id}/analisis`);
}

// Ahora
async ejecutarAnalisis(
  id: number,
  options?: { forzar_reejecucion?: boolean }
): Promise<ApiResponse<EjecutarAnalisisResponse>> {
  return this.post<EjecutarAnalisisResponse>(
    `/api/pai/proyectos/${id}/analisis`,
    options
  );
}
```

**Motivo de actualización en inventario:**
- API client ahora envía body con `forzar_reejecucion` opcional

---

### 5.4. `apps/frontend/src/i18n/es-ES.ts`

**Textos añadidos:**
```typescript
// Análisis - Estados del botón
'pai.analisis.ejecutar': 'Ejecutar Análisis',
'pai.analisis.en_progreso': 'Ejecutando paso {paso} de 7: {nombre}',
'pai.analisis.finalizado': 'Análisis Finalizado',
'pai.analisis.reintentar': 'Reintentar Análisis',
'pai.analisis.confirmar_reejecucion': '¿Desea re-ejecutar el análisis? Se reemplazarán los resultados anteriores.',
'pai.analisis.error': 'Error al ejecutar análisis: {mensaje}',
```

**Motivo de actualización en inventario:**
- Nuevos 6 textos i18n para UI de análisis
- Soporte para template strings con variables ({paso}, {nombre}, {mensaje})

---

## 6. Recursos Cloudflare

### 6.1. Sin Cambios

**No se requieren nuevos recursos Cloudflare para Sprint 3.**

El frontend:
- Usa `pg-cbc-endes` Pages existente
- Consume endpoint backend existente (`POST /api/pai/proyectos/:id/analisis`)
- No requiere nuevos bindings ni variables

---

## 7. Configuraciones y Servicios

### 7.1. Endpoint Existente

**Endpoint:** `POST /api/pai/proyectos/:id/analisis`

**Cambio en request:**
```json
// Antes
{
  // body vacío o sin parámetros
}

// Ahora (opcional)
{
  "forzar_reejecucion": true
}
```

**Motivo de actualización en inventario:**
- Endpoint ahora acepta parámetro opcional `forzar_reejecucion`

---

## 8. Puntos Pendientes o No Verificables

### 8.1. Despliegue en Pages

**Estado:** ⏳ **Pendiente de despliegue**

**Acción requerida:**
```bash
cd /workspaces/cbc-endes/apps/frontend
npm run build
npx wrangler pages deploy dist --project-name=pg-cbc-endes --branch=main
```

### 8.2. Pruebas de UI

**Estado:** ⏳ **Pendiente de pruebas**

**Casos a verificar:**
- Botón habilitado para estados 1, 2, 3, 4
- Botón deshabilitado para estados 5, 6, 7, 8
- Tooltip muestra mensaje explicativo
- Progreso se actualiza durante ejecución
- Estado success se muestra tras completitud

---

## 9. Referencias

### 9.1. Documentos del Proyecto

| Documento | Ruta |
|-----------|------|
| **Concept Brief (ROADMAP)** | `_doc-desarrollo/wf-analisis-inmobiliario/002-Concept-Brief-Workflow-Analisis-Inmobiliario-v2.md` |
| **Especificación Frontend** | `_doc-desarrollo/wf-analisis-inmobiliario/005-Especificacion-Integracion-Frontend.md` |
| **Inventario Actual (v16.0)** | `.governance/inventario_recursos.md` |

### 9.2. Archivos Implementados

| Archivo | Ruta |
|---------|------|
| **Componente Botón** | `apps/frontend/src/components/pai/BotonEjecutarAnalisis.tsx` |
| **Página Detalle** | `apps/frontend/src/pages/proyectos/DetalleProyecto.tsx` |
| **Hook PAI** | `apps/frontend/src/hooks/use-pai.ts` |
| **API Client** | `apps/frontend/src/lib/pai-api.ts` |
| **i18n Español** | `apps/frontend/src/i18n/es-ES.ts` |

---

## 10. Resumen para Inventariador

### Cambios a Registrar

| Elemento | Acción | Detalle |
|----------|--------|---------|
| **Componente** | Añadir | `apps/frontend/src/components/pai/BotonEjecutarAnalisis.tsx` |
| **Página** | Actualizar nota | `DetalleProyecto.tsx` - Ahora usa BotonEjecutarAnalisis |
| **Hook** | Actualizar | `use-pai.ts` - `useEjecutarAnalisis` acepta opciones |
| **API Client** | Actualizar | `pai-api.ts` - `ejecutarAnalisis` acepta body opcional |
| **i18n** | Añadir 6 textos | Textos para estados del botón de análisis |

### Notas Importantes

1. **Sin nuevos recursos Cloudflare** - Solo cambios de frontend
2. **Endpoint existente** - Mismo endpoint, parámetro opcional añadido
3. **Componente reutilizable** - `BotonEjecutarAnalisis` puede usarse en otras vistas
4. **i18n completo** - Todos los textos del botón están internacionalizados

---

**Documento generado:** 2026-03-29  
**Sprint:** Sprint 3 - Frontend UI del Workflow  
**Estado:** Pendiente de revisión por `inventariador`  
**Próximo paso:** Invocar a `inventariador` para actualizar `.governance/inventario_recursos.md`
