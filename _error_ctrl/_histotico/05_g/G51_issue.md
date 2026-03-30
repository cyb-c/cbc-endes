### Título

Corregir mapeo, formato y renderizado de campos del detalle de proyecto en vista de inmueble

### Descripción

En la vista de detalle del proyecto/inmueble se han identificado inconsistencias entre los campos mostrados en UI y los campos definidos en la tabla `PAI_PRO_proyectos`. Actualmente hay problemas de mapeo, formato, etiquetado y renderizado de contenido, además de una sección de análisis que no está mostrando correctamente la información disponible.

Es necesario alinear la pantalla con los campos indicados, respetando los formatos requeridos y mejorando la visualización del contenido enriquecido.

### Referencia visual

`G51.png`

### Problemas detectados

1. **Fecha de alta con valor inválido en cabecera**
   El campo `PRO_fecha_alta` no se está mostrando correctamente y aparece como `Invalid Date`.
   Debe formatearse como `DD/MM/YYYY`.

2. **Portal sin enlace navegable**
   Los campos `PRO_portal_nombre` y `PRO_portal_url` deben renderizarse como un enlace HTML.
   El enlace debe abrir en nueva pestaña usando `target="_blank"`.

3. **Superficie no mapeada correctamente**
   El campo visible de superficie debe tomar el valor de `PRO_superficie_construida_m2`.

4. **Campo incorrecto en lugar de dirección**
   Debe reemplazarse el campo/label actual de “Fecha” por “Dirección”, mostrando el valor de `PRO_direccion`.

5. **Operación no informada correctamente**
   El campo mostrado como “Operación” debe mapearse al valor de `PRO_operacion`.

6. **Pestaña “Resumen Ejecutivo” no muestra contenido**
   Al hacer clic en la pestaña funciona la interacción, pero el contenido esperado no se renderiza en el área de detalle.

7. **Renderizado incompleto de `PRO_resumen_ejecutivo`**
   El contenido de `PRO_resumen_ejecutivo` está en formato Markdown (MD), pero no se está visualizando como contenido enriquecido.
   Debe renderizarse con formato legible tipo preview/preview embellecida.

8. **Formato incorrecto de precio**
   El campo `PRO_precio` debe mostrarse en formato numérico general para España:

   * Separador de miles: `.`
   * Separador decimal: `,`
   * Añadir `€` a la derecha del valor, separado por un espacio
     Ejemplo: `1.234,56 €`

9. **Falta campo “Barrio”**
   Debe agregarse el campo “Barrio” mostrando el valor de `PRO_barrio_distrito`.

### Comportamiento esperado

La vista de detalle debe mostrar los datos del proyecto usando los campos correctos de `PAI_PRO_proyectos`, con labels coherentes y formatos de salida consistentes.

En concreto:

* `PRO_fecha_alta` debe mostrarse con formato `DD/MM/YYYY`.
* `PRO_portal_nombre` y `PRO_portal_url` deben renderizarse como enlace externo.
* La superficie debe mostrarse desde `PRO_superficie_construida_m2`.
* El campo visible debe ser “Dirección” usando `PRO_direccion`.
* “Operación” debe mostrar `PRO_operacion`.
* La sección “Resumen Ejecutivo” debe cargar y mostrar `PRO_resumen_ejecutivo`.
* El Markdown de `PRO_resumen_ejecutivo` debe renderizarse como vista enriquecida.
* `PRO_precio` debe formatearse con convención española y sufijo `€`.
* Debe incorporarse el campo “Barrio” con `PRO_barrio_distrito`.

### Notas técnicas

* Tabla origen: `PAI_PRO_proyectos`.
* Todos los campos son texto, salvo cuando se indique un formato de presentación específico.
* Requisitos de presentación:

  * `PRO_fecha_alta` → formato `DD/MM/YYYY`
  * `PRO_portal_nombre` + `PRO_portal_url` → enlace HTML con `target="_blank"`
  * `PRO_superficie_construida_m2` → valor de superficie
  * `PRO_direccion` → mostrar bajo label “Dirección”
  * `PRO_operacion` → valor del campo “Operación”
  * `PRO_resumen_ejecutivo` → contenido en Markdown, renderizado como preview enriquecida
  * `PRO_precio` → formato numérico ES (`.` miles, `,` decimales) + sufijo ` €`
  * `PRO_barrio_distrito` → nuevo campo “Barrio”
* Validar especialmente el flujo de carga/renderizado de la pestaña “Resumen Ejecutivo”, ya que la navegación funciona pero el contenido no se refleja en pantalla.
* Revisar el mapeo UI ↔ datos para evitar labels incorrectos o valores vacíos cuando el dato existe en origen.

### Resumen

La incidencia requiere corregir la integración entre la UI de detalle y los campos de `PAI_PRO_proyectos`, con foco en mapeo de datos, formatos de presentación y renderizado de Markdown. El objetivo es que la pantalla refleje correctamente la información disponible y mantenga consistencia funcional y visual.
