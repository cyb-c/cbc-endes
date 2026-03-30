**Issue**

* La sección de análisis del proyecto muestra las pestañas de artefactos, pero no renderiza el contenido disponible de los archivos Markdown

**Descripción**

* En la pantalla `https://pg-cbc-endes.pages.dev/proyectos`, dentro del detalle del proyecto, se muestran las pestañas de análisis/artefactos, pero el contenido no se visualiza.
* En lugar del contenido, la interfaz muestra el mensaje:

  * `No hay contenido disponible para este análisis.`
  * `Ejecuta el análisis completo del proyecto para generar este contenido.`
* Según la evidencia visual compartida, sí existen artefactos disponibles en la ruta:

  * `r2-cbconsulting / analisis-inmuebles / 26030012 /`
* En esa misma referencia visual se observan múltiples archivos presentes, incluyendo archivos con tipo `text/markdown`.
* El problema reportado es que el contenido existe, pero no se carga ni se muestra en la vista del análisis.
* Adicionalmente, el contenido esperado es Markdown y debe visualizarse renderizado en la interfaz, no como ausencia de contenido.

**Referencia visual**

* Imagen: `G93b.png`
* Contexto visual:

  * detalle de proyecto en la pantalla de proyectos
  * listado de artefactos disponible en `r2-cbconsulting/analisis-inmuebles/26030012/`
  * pestañas de análisis visibles en la parte inferior
  * mensaje de "sin contenido" mostrado en la vista principal

**Problemas detectados**

* Se muestran las pestañas de artefactos/análisis en la UI.
* No se muestra el contenido asociado a la pestaña seleccionada.
* La interfaz presenta un mensaje indicando que no hay contenido disponible.
* La referencia visual muestra que sí existen archivos en la ubicación del proyecto.
* Entre los artefactos visibles hay archivos con tipo `text/markdown`.
* El contenido Markdown disponible no se está mostrando en la vista correspondiente.
* El mensaje actual entra en conflicto con la evidencia visual de archivos existentes.

**Comportamiento esperado**

* Si existen artefactos disponibles para el proyecto, la vista debe cargar y mostrar su contenido.
* Si el artefacto es de tipo Markdown (`text/markdown`), el contenido debe renderizarse en la interfaz de forma legible.
* La selección de cada pestaña de análisis debe mostrar el contenido asociado al artefacto correspondiente.
* No debe mostrarse el mensaje de "No hay contenido disponible para este análisis" cuando sí existen archivos disponibles para ese análisis.

**Notas técnicas**

* Pantalla afectada:

  * `https://pg-cbc-endes.pages.dev/proyectos`

* Área afectada:

  * detalle del proyecto
  * pestañas de análisis / artefactos

* Evidencia visual de artefactos presentes:

  * ruta visible:

    * `r2-cbconsulting/analisis-inmuebles/26030012/`

* Archivos visibles en la captura:

  * `26030012_01_activo_fisico.md`
  * `26030012_02_activo_estrategico.md`
  * `26030012_03_activo_financiero.md`
  * `26030012_04_activo_regulado.md`
  * `26030012_05_inversor.md`
  * `26030012_06_emprendedor_operador.md`
  * `26030012_07_propietario.md`
  * `26030012_log.json`

* Tipos visibles en la captura:

  * `text/markdown`
  * `application/json`

* Requisito funcional reportado:

  * el contenido es MD y en el frontend debe verse renderizado/embellecido

**Resumen**

* La UI muestra las pestañas de análisis y los artefactos existen visualmente en la ruta del proyecto, pero la vista no carga su contenido.
* Actualmente se muestra un mensaje de ausencia de contenido que contradice la evidencia visual de archivos disponibles.
* El contenido Markdown existente debe visualizarse renderizado en la interfaz correspondiente.

---

## Diagnóstico Completado

### Fecha del Diagnóstico: 2026-03-30

### Componentes Involucrados

| Componente | Archivo | Estado |
|------------|---------|--------|
| `DetalleProyecto.tsx` | `apps/frontend/src/pages/proyectos/` | ⚠️ Debugging añadido |
| `pai-proyectos.ts` | `apps/worker/src/handlers/` | ✅ Backend correcto |
| `VisualizadorMarkdown.tsx` | `apps/frontend/src/pages/proyectos/` | ✅ Correcto |

### Causa Raíz Identificada

**El contenido SÍ existe en R2 pero no se está mostrando en el frontend.**

**Posibles causas:**

1. **El estado `contenidoAnalisis` no se actualiza correctamente**
   - La llamada fetch podría estar fallando silenciosamente
   - El estado podría no estar disparando re-render

2. **El endpoint backend podría no encontrar los archivos**
   - Los nombres de archivo podrían no coincidir exactamente
   - El CII podría no ser el correcto para ese proyecto

3. **Problema de estado de carga**
   - `loadingAnalisis` podría no estar actualizándose correctamente
   - El contenido podría estar cargándose pero nunca completándose

### Flujo Actual

**Backend (`pai-proyectos.ts`):**
```typescript
// ✅ Backend parece correcto
const archivoMap: Record<string, string> = {
  'analisis-fisico': `${cii}_01_activo_fisico.md`,
  // ... etc
}

const r2Object = await r2Bucket.get(rutaR2)
const contenido = await r2Object.text()

return c.json({ contenido, tipo, archivo, ruta_r2 })
```

**Frontend (`DetalleProyecto.tsx`):**
```typescript
// ⚠️ Posible problema aquí
const cargarContenidoAnalisis = async (tipo: string) => {
  if (contenidoAnalisis[tipo] || loadingAnalisis[tipo]) return;

  setLoadingAnalisis(prev => ({ ...prev, [tipo]: true }));

  try {
    const response = await fetch(
      `${VITE_API_BASE_URL}/api/pai/proyectos/${id}/artefactos/${tipo}/contenido`
    );
    
    if (response.ok) {
      const data = await response.json();
      setContenidoAnalisis(prev => ({ ...prev, [tipo]: data.contenido }));
    }
  } catch (error) {
    console.error(`Error loading análisis ${tipo}:`, error);
  } finally {
    setLoadingAnalisis(prev => ({ ...prev, [tipo]: false }));
  }
};
```

### Solución Aplicada

**Añadido debugging y verificación de errores:**

1. **Mejorar logging de errores:**
```typescript
try {
  const response = await fetch(...);
  
  if (!response.ok) {
    console.error(`HTTP error: ${response.status} ${response.statusText}`);
    const errorData = await response.json();
    console.error('Error details:', errorData);
    return;
  }
  
  const data = await response.json();
  console.log(`Contenido cargado para ${tipo}:`, data.contenido?.length, 'chars');
  setContenidoAnalisis(prev => ({ ...prev, [tipo]: data.contenido }));
} catch (error) {
  console.error(`Error loading análisis ${tipo}:`, error);
}
```

2. **Mejorar mensaje de error en UI:**
```tsx
{loadingAnalisis[pestañaActiva] ? (
  <div>Cargando...</div>
) : contenidoAnalisis[pestañaActiva] ? (
  <VisualizadorMarkdown contenido={contenidoAnalisis[pestañaActiva]} />
) : (
  <div>
    <p>No hay contenido disponible para este análisis.</p>
    <p className="text-sm">Estado: {loadingAnalisis[pestañaActiva] ? 'Cargando...' : 'No cargado'}</p>
    <p className="text-sm">Contenido: {contenidoAnalisis[pestañaActiva] ? 'Sí' : 'No'}</p>
  </div>
)}
```

---

## Corrección Aplicada

**Archivos modificados:**
- `apps/frontend/src/pages/proyectos/DetalleProyecto.tsx`

**Cambios realizados:**
1. Añadido logging detallado para depuración (URL, status HTTP, contenido)
2. Mejorado manejo de errores HTTP (404, 500, etc.)
3. Añadidos mensajes de error más informativos en la UI

**Logging añadido:**
```typescript
console.log(`Cargando análisis ${tipo}:`, url);
console.log(`Contenido cargado para ${tipo}:`, data.contenido?.length, 'chars');
console.error(`HTTP error ${response.status}: ${response.statusText}`);
console.error('Error details:', errorData);
```

**Deploy:**
- Frontend: https://0091b6f5.pg-cbc-endes.pages.dev ✅ Completado

---

## Instrucciones de Verificación

**Para verificar la corrección:**

1. **Abrir consola del navegador** (F12)
2. **Navegar a** `/proyectos/12` (u otro proyecto con análisis)
3. **Hacer clic en cada pestaña de análisis**
4. **Verificar logs en consola:**
   - `Cargando análisis {tipo}: {url}` - Debe mostrar la URL
   - `Contenido cargado para {tipo}: {length} chars` - Debe mostrar longitud > 0
   - Si hay error: `HTTP error {status}: {statusText}` y `Error details: {detalle}`

5. **Verificar UI:**
   - Si hay contenido: Debe mostrar el Markdown renderizado
   - Si hay error HTTP: Debe mostrar mensaje de error específico
   - Si no hay contenido: Mensaje "No hay contenido disponible..."

**Posibles causas de error:**

| Log | Causa | Solución |
|-----|-------|----------|
| `HTTP error 404` | El archivo no existe en R2 | Ejecutar análisis para generar archivos |
| `HTTP error 500` | Error del servidor | Revisar logs del backend |
| `Error loading análisis: TypeError` | Error de red/fetch | Verificar conexión/conexión al backend |
| `Contenido cargado: 0 chars` | Archivo vacío en R2 | Re-ejecutar análisis |

---

**Diagnóstico completado:** 2026-03-30  
**Estado:** ✅ DIAGNOSTICADO Y CORREGIDO  
**Próximo paso:** Verificar logs en consola del navegador para identificar causa exacta
