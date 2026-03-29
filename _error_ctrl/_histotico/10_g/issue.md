# Título

Corrección puntual de visualización de `PRO_fecha_analisis`, `PRO_operacion` y `PRO_fecha_alta` en `/proyectos/` sobre la tabla `PAI_PRO_proyectos`

## Descripción

En la vista de detalle/formulario de proyectos disponible en `https://pg-cbc-endes.pages.dev/proyectos/` se han identificado tres incidencias de visualización relacionadas con datos de la tabla `PAI_PRO_proyectos`.

Según la referencia visual aportada, actualmente no se están mostrando correctamente dos campos de fecha y tampoco se está mostrando el valor del campo `PRO_operacion`.

La corrección debe limitarse exclusivamente a los puntos indicados en la imagen y descritos en este issue. No deben introducirse cambios fuera del alcance de las incidencias 1, 2 y 3, ni alterarse comportamientos ya operativos en el formulario.

## Referencia visual

Archivo de referencia: `_error_ctrl/10_g/image.png`

La numeración de la imagen está vinculada explícitamente con los problemas descritos en este issue y debe conservarse durante el análisis, implementación y validación.

## Problemas detectados

1. [Referencia visual 1] En la cabecera del formulario se muestra la etiqueta “Fecha Alta:” con valor vacío o no informado, cuando debe mostrarse “Fecha del análisis” utilizando el campo `PRO_fecha_analisis`.

   * Campo origen: `PRO_fecha_analisis`
   * Formato actual en BD: similar a `2026-03-29 11:36:32`

2. [Referencia visual 2] No se está mostrando el valor del campo `PRO_operacion` en la sección de datos básicos del inmueble.

   * Campo origen: `PRO_operacion`

3. [Referencia visual 3] No se está mostrando el valor del campo `PRO_fecha_alta` en la sección de datos básicos del inmueble.

   * Campo origen: `PRO_fecha_alta`
   * Formato actual en BD: similar a `2026-03-29 11:36:32`

## Comportamiento esperado

1. [Referencia visual 1] La cabecera debe mostrar la etiqueta “Fecha del análisis” y pintar el valor de `PRO_fecha_analisis`.

2. [Referencia visual 2] El bloque “Operación” debe mostrar el valor real de `PRO_operacion`.

3. [Referencia visual 3] El bloque “Fecha de Alta” debe mostrar el valor real de `PRO_fecha_alta`.

4. Los campos de fecha `PRO_fecha_analisis` y `PRO_fecha_alta` deben mostrarse en el formulario con el siguiente formato:

   * `dd/mm/yyyy hh:mm`
   * Ejemplo: `29/03/2026 11:36`

## Notas técnicas

### Diagnóstico acotado

El problema apunta a una incidencia de mapeo/renderizado en la vista de detalle del formulario de proyectos, no a una modificación funcional amplia.

Cambios que deben evaluarse y aplicarse de forma puntual:

* Verificar el binding o mapeo del campo mostrado en cabecera para que:

  * deje de presentarse como “Fecha Alta” en la posición marcada por la [Referencia visual 1]
  * pase a mostrar “Fecha del análisis”
  * lea el valor desde `PRO_fecha_analisis`

* Verificar que el componente o campo visual asociado a “Operación” esté consumiendo correctamente `PRO_operacion` y no esté:

  * omitiendo el campo en el DTO o modelo
  * utilizando una clave incorrecta
  * sobrescribiéndose con valor vacío o `null`
  * excluido en la transformación de datos previa al render

* Verificar que el bloque “Fecha de Alta” esté consumiendo correctamente `PRO_fecha_alta` en la posición marcada por la [Referencia visual 3]

### Restricciones de alcance

* No modificar nada fuera de las correcciones asociadas a:

  * [Referencia visual 1]
  * [Referencia visual 2]
  * [Referencia visual 3]

* No cambiar estructura, labels, orden, estilos o comportamiento de otros campos no afectados.

* No alterar lógica ya funcional del formulario ni otras transformaciones de datos no relacionadas con estos tres puntos.

* La normalización o formateo de fechas debe aplicarse únicamente a:

  * `PRO_fecha_analisis`
  * `PRO_fecha_alta`

* El formato de salida requerido es:

  * `dd/mm/yyyy hh:mm`

* Sigue .governance/reglas_proyecto.md y .governance/inventario_recursos.md

### Validaciones recomendadas

* Confirmar que `PRO_fecha_analisis` se recibe con dato válido desde la fuente actual y se renderiza en cabecera.
* Confirmar que `PRO_operacion` llega al front y se representa en el bloque correcto.
* Confirmar que `PRO_fecha_alta` llega al front y se representa en el bloque correcto.
* Confirmar que ambas fechas dejan de mostrarse vacías cuando existen valores en BD.
* Confirmar que el formato final visible coincide exactamente con `dd/mm/yyyy hh:mm`.
* Confirmar que no se producen regresiones visuales o funcionales fuera de los puntos 1, 2 y 3.

### Test

Al finalizar la corrección, ejecutar test de código o validación técnica local relacionados con la vista afectada, sin despliegue.

## Resumen

Se requiere una corrección puntual en la vista `/proyectos/` para mostrar correctamente los campos `PRO_fecha_analisis`, `PRO_operacion` y `PRO_fecha_alta` de la tabla `PAI_PRO_proyectos`, respetando la correspondencia explícita con la numeración de la imagen aportada. El alcance debe limitarse estrictamente a los tres puntos indicados, aplicando formato `dd/mm/yyyy hh:mm` solo a las dos fechas y realizando validación final mediante test de código sin despliegue.
