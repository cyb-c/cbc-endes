# Diagnóstico y Plan de Corrección - Errores FASE 5 (G51-G63)

> **Fecha:** 28 de marzo de 2026  
> **Agente:** Qwen Code (usando cloudflare-deploy skill)  
> **Estado:** Diagnóstico completado - Pendiente de corrección

---

## Índice de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Issue G51: Detalle de Proyecto - Mapeo y Formato](#issue-g51-detalle-de-proyecto---mapeo-y-formato)
3. [Issue G52: Datos Transformados - JSON no renderizado](#issue-g52-datos-transformados---json-no-renderizado)
4. [Issue G61: Estado y Botón Cambiar Estado](#issue-g61-estado-y-botón-cambiar-estado)
5. [Issue G62: Modal Cambiar Estado - UI y Filtro](#issue-g62-modal-cambiar-estado---ui-y-filtro)
6. [Issue G63: Error al Cambiar Estado](#issue-g63-error-al-cambiar-estado)
7. [Plan de Corrección Consolidado](#plan-de-corrección-consolidado)
8. [Priorización](#priorización)

---

## Resumen Ejecutivo

**Total de issues detectados:** 5 (G51, G52, G61, G62, G63)

**Categorías:**
- **Frontend - UI/UX:** G51 (9 problemas), G52, G62 (UI modal)
- **Frontend - Lógica:** G61 (habilitación botón), G62 (filtro de estados)
- **Backend - API:** G63 (endpoint cambio de estado)

**Archivos frontend implicados:**
- `apps/frontend/src/pages/proyectos/DetalleProyecto.tsx`
- `apps/frontend/src/components/pai/ModalCambioEstado.tsx`

**Archivos backend implicados:**
- `apps/worker/src/handlers/pai-proyectos.ts` (handleCambiarEstado)

---

## Issue G51: Detalle de Proyecto - Mapeo y Formato

### Problemas Detectados (9)

| # | Problema | Campo Origen | Solución |
|---|----------|--------------|----------|
| 1 | Fecha inválida (`Invalid Date`) | `PRO_fecha_alta` | Formatear como `DD/MM/YYYY` |
| 2 | Portal sin enlace navegable | `PRO_portal_nombre`, `PRO_portal_url` | Renderizar como `<a>` con `target="_blank"` |
| 3 | Superficie no mapeada | `PRO_superficie_construida_m2` | Corregir mapeo de datos |
| 4 | Label incorrecto ("Fecha" en lugar de "Dirección") | `PRO_direccion` | Cambiar label a "Dirección" |
| 5 | Operación no informada | `PRO_operacion` | Corregir mapeo de datos |
| 6 | Pestaña "Resumen Ejecutivo" sin contenido | `PRO_resumen_ejecutivo` | Cargar y renderizar contenido |
| 7 | Markdown no renderizado | `PRO_resumen_ejecutivo` | Usar visualizador Markdown |
| 8 | Formato de precio incorrecto | `PRO_precio` | Formato ES: `1.234,56 €` |
| 9 | Falta campo "Barrio" | `PRO_barrio_distrito` | Agregar campo en UI |

### Archivos a Modificar

| Archivo | Ruta | Cambios |
|---------|------|---------|
| `DetalleProyecto.tsx` | `apps/frontend/src/pages/proyectos/` | Mapeo de datos, formatos, campos |

### Diagnóstico Técnico

**Problema raíz:** El componente `DetalleProyecto.tsx` no está cargando correctamente los datos desde el backend o no los está renderizando con los formatos adecuados.

**Verificación necesaria:**
1. Revisar llamada a API `GET /api/pai/proyectos/:id`
2. Verificar estructura de respuesta del backend
3. Confirmar que `VisualizadorMarkdown` está importado y usado
4. Validar formatos de fecha y precio

---

## Issue G52: Datos Transformados - JSON no renderizado

### Problemas Detectados

| # | Problema | Campo Origen | Solución |
|---|----------|--------------|----------|
| 1 | Pestaña funciona pero no renderiza | `PRO_ijson` | Cargar dato desde backend |
| 2 | JSON no formateado | `PRO_ijson` | Renderizar con formato embellecido |

### Archivos a Modificar

| Archivo | Ruta | Cambios |
|---------|------|---------|
| `DetalleProyecto.tsx` | `apps/frontend/src/pages/proyectos/` | Nueva pestaña "Datos Transformados" |

### Diagnóstico Técnico

**Problema raíz:** La pestaña "Datos Transformados" no está implementada o no está cargando el campo `PRO_ijson` desde la respuesta del backend.

**Requerimiento:**
- Mostrar JSON embellecido (indentado, estructurado)
- Usar componente de código con sintaxis highlight o `<pre><code>`

---

## Issue G61: Estado y Botón Cambiar Estado

### Problemas Detectados

| # | Problema | Campo Origen | Solución |
|---|----------|--------------|----------|
| 1 | Estado no vinculado a `PRO_estado_val_id` | `PRO_estado_val_id` | Usar campo correcto |
| 2 | Lógica de habilitación incorrecta | `PRO_estado_val_id` | Deshabilitar si `estado_id IN (1,2,3)` |
| 3 | Botón debe habilitarse desde estado 4 | `PRO_estado_val_id` | Habilitar si `estado_id >= 4` |

### Archivos a Modificar

| Archivo | Ruta | Cambios |
|---------|------|---------|
| `DetalleProyecto.tsx` | `apps/frontend/src/pages/proyectos/` | Lógica de habilitación del botón |

### Diagnóstico Técnico

**Regla de negocio:**
- Estados 1, 2, 3: `CREADO`, `PROCESANDO_ANALISIS`, `ANALISIS_CON_ERROR` → Botón DESHABILITADO
- Estados 4+: `ANALISIS_FINALIZADO`, `EVALUANDO_VIABILIDAD`, etc. → Botón HABILITADO

**Implementación:**
```typescript
const botonDeshabilitado = proyecto.estado_id <= 3
```

---

## Issue G62: Modal Cambiar Estado - UI y Filtro

### Problemas Detectados

| # | Problema | Solución |
|---|----------|----------|
| 1 | Top bar visible al abrir modal | Aumentar z-index del overlay |
| 2 | Fondo no cubre completamente | Overlay fullscreen con `fixed inset-0` |
| 3 | Lista de estados no filtrada | Filtrar por `VAL_atr_id = 1` (ESTADO_PROYECTO) |
| 4 | Fuente de datos incorrecta | Usar `PAI_VAL_valores` con filtros |
| 5 | Estados fuera de rango | Filtrar `VAL_id > 4 AND VAL_id < 9` |
| 6 | Valores inactivos incluidos | Filtrar `VAL_activo = 1` |
| 7 | Orden incorrecto | `ORDER BY VAL_orden` |

### Archivos a Modificar

| Archivo | Ruta | Cambios |
|---------|------|---------|
| `ModalCambioEstado.tsx` | `apps/frontend/src/components/pai/` | UI overlay, query de estados |
| `pai-proyectos.ts` | `apps/worker/src/handlers/` | Endpoint para obtener estados filtrados |

### Diagnóstico Técnico

**Problemas de UI:**
- z-index del modal debe ser mayor que top bar
- Overlay debe usar `fixed inset-0 bg-black bg-opacity-50`

**Problemas de datos:**
- Backend necesita endpoint `GET /api/pai/estados-disponibles` o similar
- Query SQL:
```sql
SELECT VAL_id, VAL_nombre 
FROM PAI_VAL_valores 
WHERE VAL_atr_id = 1 
  AND VAL_id > 4 
  AND VAL_id < 9 
  AND VAL_activo = 1 
ORDER BY VAL_orden
```

---

## Issue G63: Error al Cambiar Estado

### Problemas Detectados

| # | Problema | Solución |
|---|----------|----------|
| 1 | Error al confirmar cambio | Investigar logs del backend |
| 2 | Mensaje "Error desconocido" | Mejorar manejo de errores en frontend |
| 3 | `PRO_estado_val_id` no se actualiza | Corregir endpoint backend |
| 4 | Modal no se cierra tras éxito | Manejar callback de éxito |
| 5 | Pantalla no refresca estado | Invalidar caché o recargar datos |

### Archivos a Modificar

| Archivo | Ruta | Cambios |
|---------|------|---------|
| `pai-proyectos.ts` | `apps/worker/src/handlers/` | Corregir `handleCambiarEstado` |
| `ModalCambioEstado.tsx` | `apps/frontend/src/components/pai/` | Manejo de errores, callback |

### Diagnóstico Técnico

**Posibles causas:**
1. **Backend:** Endpoint `PUT /api/pai/proyectos/:id/estado` tiene error
2. **Frontend:** Payload incorrecto (nombre de campos)
3. **Backend:** Validación de estado fallando
4. **Frontend:** No se maneja respuesta de error correctamente

**Verificación necesaria:**
- Revisar logs de wrangler tail
- Verificar estructura del request
- Confirmar que el estado existe en BD

---

## Plan de Corrección Consolidado

### Fase 1: Backend (Prioridad Alta)

| Acción | Archivo | Descripción |
|--------|---------|-------------|
| 1.1 | `pai-proyectos.ts` | Investigar y corregir `handleCambiarEstado` |
| 1.2 | `pai-proyectos.ts` | Añadir endpoint `GET /api/pai/estados-disponibles/:proyectoId` |
| 1.3 | Wrangler tail | Verificar logs de error reales |

### Fase 2: Frontend - Componentes (Prioridad Alta)

| Acción | Archivo | Descripción |
|--------|---------|-------------|
| 2.1 | `ModalCambioEstado.tsx` | Corregir UI overlay (z-index, fullscreen) |
| 2.2 | `ModalCambioEstado.tsx` | Implementar llamada a endpoint de estados filtrados |
| 2.3 | `ModalCambioEstado.tsx` | Mejorar manejo de errores |

### Fase 3: Frontend - Detalle Proyecto (Prioridad Media)

| Acción | Archivo | Descripción |
|--------|---------|-------------|
| 3.1 | `DetalleProyecto.tsx` | Corregir mapeo de datos (superficie, operación, dirección) |
| 3.2 | `DetalleProyecto.tsx` | Agregar formato de fecha `DD/MM/YYYY` |
| 3.3 | `DetalleProyecto.tsx` | Agregar formato de precio ES (`1.234,56 €`) |
| 3.4 | `DetalleProyecto.tsx` | Agregar enlace para portal con `target="_blank"` |
| 3.5 | `DetalleProyecto.tsx` | Agregar campo "Barrio" |
| 3.6 | `DetalleProyecto.tsx` | Implementar pestaña "Datos Transformados" con JSON embellecido |
| 3.7 | `DetalleProyecto.tsx` | Usar `VisualizadorMarkdown` para resumen ejecutivo |
| 3.8 | `DetalleProyecto.tsx` | Implementar lógica de habilitación del botón (estado_id <= 3) |

### Fase 4: Despliegue y Verificación

| Acción | Descripción |
|--------|-------------|
| 4.1 | Desplegar backend con correcciones |
| 4.2 | Desplegar frontend con correcciones |
| 4.3 | Verificar en producción cada issue |

---

## Priorización

| Prioridad | Issues | Acciones |
|-----------|--------|----------|
| **P0 - Crítico** | G63 | Backend: Corregir endpoint cambio de estado |
| **P1 - Alto** | G61, G62 | Frontend: Lógica de estado y UI modal |
| **P2 - Medio** | G51 | Frontend: Mapeo y formatos de detalle |
| **P3 - Bajo** | G52 | Frontend: Pestaña Datos Transformados |

---

**Próximo paso:** Iniciar correcciones comenzando por el backend (G63) para asegurar que el endpoint funciona antes de corregir el frontend.

---

**Fin del Diagnóstico**
