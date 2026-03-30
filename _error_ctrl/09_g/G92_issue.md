**Issue**
El artefacto “Datos Transformados” no muestra el contenido existente de `PRO_ijson` y presenta un mensaje incorrecto de ausencia de datos

**Descripción**
En la pantalla `https://pg-cbc-endes.pages.dev/proyectos`, dentro de la sección **Resultados del Análisis**, la pestaña/artefacto **“Datos Transformados”** no está mostrando el contenido esperado aunque dicho contenido sí existe.

Actualmente se muestra el mensaje `No hay datos transformados disponibles. El IJSON no está disponible para este proyecto.`, pero ese estado es incorrecto para el caso reportado. Según la evidencia aportada, el contenido sí está disponible y puede comprobarse visualmente en el bloque señalado como **2** en la imagen `G92.png`.

**Referencia visual**

* Imagen de referencia: `G92.png`
* La numeración visual está vinculada explícitamente con los puntos descritos en este issue.

**Problemas detectados**

1. **[Referencia visual 1]** La pestaña/artefacto **“Datos Transformados”** no está mostrando el contenido correspondiente.
   Actualmente se visualiza el mensaje:
   `No hay datos transformados disponibles. El IJSON no está disponible para este proyecto.`
   Este mensaje es incorrecto para el caso reportado, ya que sí existe contenido de datos transformados.

2. **[Referencia visual 2]** El contenido de datos transformados sí existe en base de datos, concretamente en el campo:
   `PAI_PRO_proyectos.PRO_ijson`
   El valor almacenado en ese campo no se está reflejando en la pestaña **“Datos Transformados”**.

3. **[Referencia visual 2]** El campo `PRO_ijson` tiene formato **JSON**, pero no se está mostrando en pantalla con una visualización adecuada para lectura por parte del usuario.

**Comportamiento esperado**

* **[Referencia visual 1]** La pestaña **“Datos Transformados”** debe mostrar el contenido real cuando exista información en `PRO_ijson`.
* **[Referencia visual 1]** El mensaje `No hay datos transformados disponibles. El IJSON no está disponible para este proyecto.` solo debe mostrarse cuando realmente no exista contenido disponible.
* **[Referencia visual 2]** El valor almacenado en `PAI_PRO_proyectos.PRO_ijson` debe renderizarse en la interfaz.
* **[Referencia visual 2]** Al estar en formato JSON, la visualización debe presentarse de forma embellecida y legible para el usuario final.
* **[Referencia visual 2]** La implementación visual debe tomar como referencia el documento indicado por el solicitante: `_doc-desarrollo/doc-apoyo-conocimiento/JSON-TypeScript-React-Tailwind.md`.

**Notas técnicas**

* Origen del dato: `PAI_PRO_proyectos.PRO_ijson`
* Formato del contenido: `JSON`
* Requerimiento funcional solicitado: mostrar el valor del campo `PRO_ijson`
* Requerimiento de presentación: renderizar el contenido JSON con formato visual adecuado en pantalla
* Referencia de apoyo indicada por el solicitante para la visualización: `_doc-desarrollo/doc-apoyo-conocimiento/JSON-TypeScript-React-Tailwind.md`
* El problema reportado afecta tanto a la lógica de presencia/ausencia del dato como a su representación visual en la pestaña correspondiente

**Resumen**
La pestaña **“Datos Transformados”** está mostrando un estado vacío incorrecto pese a que el contenido sí existe en base de datos. Debe corregirse la obtención/renderizado del campo `PRO_ijson` y mostrarse su contenido JSON de forma visualmente adecuada en la UI, tomando como apoyo la referencia técnica indicada.
