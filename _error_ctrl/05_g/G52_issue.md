### Título

Corregir renderizado de la pestaña “Datos Transformados” para mostrar `PRO_ijson` en formato JSON embellecido

### Descripción

En la sección **Resultados del Análisis**, la pestaña **“Datos Transformados”** responde correctamente al clic, pero el área de contenido no está mostrando la información esperada. Según el requerimiento, esta sección debe renderizar el contenido del campo `PRO_ijson` de la tabla `PAI_PRO_proyectos`.

El valor de `PRO_ijson` contiene JSON, por lo que no debe mostrarse como texto plano ni quedar vacío: debe visualizarse en formato legible, estructurado y embellecido tipo preview.

### Referencia visual

`G52.png`

### Problemas detectados

1. **La pestaña funciona, pero no renderiza contenido útil**
   Al hacer clic en **“Datos Transformados”** la navegación/cambio de pestaña funciona correctamente, pero el bloque de contenido no muestra la información correspondiente.

2. **Falta integración del campo `PRO_ijson`**
   La vista debe tomar como origen el campo `PRO_ijson` de la tabla `PAI_PRO_proyectos`.

3. **El contenido JSON no se visualiza en formato embellecido**
   El contenido de `PRO_ijson` es JSON y debe mostrarse con una visualización estructurada tipo preview, legible para usuario técnico/funcional.

### Comportamiento esperado

Al seleccionar la pestaña **“Datos Transformados”**, el sistema debe:

* cargar el contenido de `PRO_ijson`,
* interpretar su valor como JSON,
* renderizarlo en una vista embellecida,
* mantener legibilidad visual mediante indentación, estructura jerárquica y formato claro.

### Notas técnicas

* Tabla origen: `PAI_PRO_proyectos`.
* Campo requerido: `PRO_ijson`.
* Tipo de contenido: **JSON**.
* Requisito de visualización:

  * mostrar el JSON como preview embellecida,
  * evitar salida cruda sin formato,
  * contemplar render seguro ante contenido vacío o JSON inválido.
* Validar el flujo completo:

  * carga del dato,
  * parseo,
  * renderizado en UI.
* Se indicó revisar el documento: `_doc-desarrollo/fase01/JSON-TypeScript-React-Tailwind.md`. No he incorporado criterios concretos de ese documento porque no tuve acceso a su contenido en esta conversación.

### Resumen

La incidencia consiste en completar el renderizado de la pestaña **“Datos Transformados”** para que muestre correctamente el contenido de `PRO_ijson` en formato JSON embellecido. La interacción de la pestaña ya funciona; el ajuste pendiente está en la carga, parseo y presentación visual del dato.
