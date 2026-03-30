**Título**
El artefacto "Resumen Ejecutivo" no muestra el contenido existente de `PRO_resumen_ejecutivo` y presenta un mensaje incorrecto de ausencia de datos

**Descripción**
En la pantalla `https://pg-cbc-endes.pages.dev/proyectos`, dentro de la sección de resultados del análisis, la pestaña/artefacto **"Resumen Ejecutivo"** no está mostrando el contenido esperado aunque dicho contenido sí existe.

Según lo indicado, el mensaje mostrado actualmente informa que no hay resumen ejecutivo disponible y que es necesario ejecutar el análisis para generarlo, pero esta condición no es correcta en este caso. El contenido sí está presente en base de datos y puede comprobarse visualmente en la misma pantalla mediante el bloque referenciado como **2** en la imagen `G91.png`.

**Referencia visual**

* Imagen de referencia: `G91.png`
* La numeración visual está vinculada explícitamente con los puntos descritos en este issue.

**Problemas detectados**

1. **[Referencia visual 1]** La pestaña/artefacto **"Resumen Ejecutivo"** no está mostrando el contenido correspondiente.
   Actualmente se visualiza el mensaje:
   `No hay resumen ejecutivo disponible. Ejecuta el análisis para generarlo.`
   Este mensaje es incorrecto para el caso reportado, ya que sí existe contenido de resumen ejecutivo.

2. **[Referencia visual 2]** El contenido del resumen ejecutivo sí existe en base de datos, concretamente en el campo:
   `PAI_PRO_proyectos.PRO_resumen_ejecutivo`
   El valor almacenado en ese campo no se está reflejando en la pestaña **"Resumen Ejecutivo"**.

3. **[Referencia visual 2]** El campo `PRO_resumen_ejecutivo` tiene formato **MD (Markdown)**, pero no se está mostrando en pantalla con una visualización adecuada para lectura por parte del usuario.

**Comportamiento esperado**

* **[Referencia visual 1]** La pestaña **"Resumen Ejecutivo"** debe mostrar el contenido real del resumen ejecutivo cuando exista información en `PRO_resumen_ejecutivo`.
* **[Referencia visual 1]** El mensaje `No hay resumen ejecutivo disponible. Ejecuta el análisis para generarlo.` solo debe mostrarse cuando realmente no exista contenido disponible.
* **[Referencia visual 2]** El valor almacenado en `PAI_PRO_proyectos.PRO_resumen_ejecutivo` debe renderizarse en la interfaz.
* **[Referencia visual 2]** Al estar en formato Markdown, la visualización debe presentarse de forma embellecida y legible para el usuario final.

**Notas técnicas**

* Origen del dato: `PAI_PRO_proyectos.PRO_resumen_ejecutivo`
* Formato del contenido: `MD`
* Requerimiento funcional solicitado: mostrar el valor del campo `PRO_resumen_ejecutivo`
* Requerimiento de presentación: renderizar el contenido Markdown con formato visual adecuado en pantalla
* El problema reportado afecta tanto a la lógica de presencia/ausencia del dato como a su representación visual en la pestaña correspondiente

**Resumen**
La pestaña **"Resumen Ejecutivo"** está mostrando un estado vacío incorrecto pese a que el contenido sí existe en base de datos. Debe corregirse la obtención/renderizado del campo `PRO_resumen_ejecutivo` y mostrarse su contenido Markdown de forma visualmente adecuada en la UI.

---

## Diagnóstico

**Causa Raíz:** El backend **NO estaba incluyendo** `PRO_resumen_ejecutivo` ni `PRO_ijson` en la query SQL del endpoint `GET /api/pai/proyectos/:id`.

**Query ANTES de corrección:**
```sql
SELECT
  p.PRO_id as id,
  p.PRO_cii as cii,
  ...
  p.PRO_fecha_ultima_actualizacion as fecha_ultima_actualizacion
  -- ❌ FALTABA: p.PRO_resumen_ejecutivo as resumen_ejecutivo
  -- ❌ FALTABA: p.PRO_ijson as ijson
FROM PAI_PRO_proyectos p
WHERE p.PRO_id = ?
```

**Consecuencia:** Como `PRO_resumen_ejecutivo` no se seleccionaba en la query, `proyecto.resumen_ejecutivo` era `undefined` en el frontend, y por eso mostraba el mensaje "No hay resumen ejecutivo disponible".

---

## Corrección Aplicada

**Archivo:** `apps/worker/src/handlers/pai-proyectos.ts`

**Query CORREGIDA:**
```sql
SELECT
  p.PRO_id as id,
  p.PRO_cii as cii,
  ...
  p.PRO_fecha_ultima_actualizacion as fecha_ultima_actualizacion,
  p.PRO_resumen_ejecutivo as resumen_ejecutivo,  -- ✅ AÑADIDO
  p.PRO_ijson as ijson  -- ✅ AÑADIDO
FROM PAI_PRO_proyectos p
WHERE p.PRO_id = ?
```

**Respuesta del backend CORREGIDA:**
```typescript
return c.json({
  proyecto: {
    ...proyecto,
    estado: estadoNombre || 'Desconocido',
    resumen_ejecutivo: proyecto.resumen_ejecutivo as string | null,  // ✅ AÑADIDO
    ijson: proyecto.ijson as string | null,  // ✅ AÑADIDO
    datos_basicos: { ... },
  },
  artefactos: artefactosResult.results,
  notas: notasResult.results,
})
```

**Deploy Realizado:**
```bash
cd /workspaces/cbc-endes/apps/worker
npm run deploy
```

**Resultado:**
```
Uploaded wk-backend-dev (6.28 sec)
Deployed wk-backend-dev triggers (2.27 sec)
Current Version ID: cefa458b-a517-4a84-993a-2c3adc60f1e0
```

---

## Verificación

### Test de Verificación

**Comando:**
```bash
curl "https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/:id"
```

**Resultado esperado:**
```json
{
  "proyecto": {
    "id": 9,
    "resumen_ejecutivo": "# Resumen Ejecutivo\n\nContenido del resumen...",
    "ijson": "{\"titulo_anuncio\": \"...\"}",
    ...
  }
}
```

### Frontend

El frontend **YA TIENE** el código para mostrar el contenido correctamente (`DetalleProyecto.tsx` línea 293-297):

```typescript
{pestañaActiva === 'resumen' && (
  <div>
    {proyecto.resumen_ejecutivo ? (
      <VisualizadorMarkdown contenido={proyecto.resumen_ejecutivo} />
    ) : (
      <div className="text-center py-12 text-gray-500">
        No hay resumen ejecutivo disponible. Ejecuta el análisis para generarlo.
      </div>
    )}
  </div>
)}
```

**Ahora que el backend envía `resumen_ejecutivo`, el frontend lo mostrará correctamente.**

---

**Documento actualizado:** 2026-03-29  
**Incidencia:** G91 - Resumen Ejecutivo no muestra contenido  
**Causa:** Backend no incluía `PRO_resumen_ejecutivo` en query SQL  
**Corrección:** Añadidos campos `resumen_ejecutivo` e `ijson` a query y response  
**Estado:** ✅ CORREGIDO - Deploy completado  
**Próximo paso:** Verificar que la pestaña "Resumen Ejecutivo" muestra el contenido Markdown
