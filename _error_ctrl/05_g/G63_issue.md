### Título

Investigar y corregir error al cambiar el estado del proyecto en la ventana emergente, actualizando `PAI_PRO_proyectos.PRO_estado_val_id`

### Descripción

En la pantalla de edición de proyecto (`/proyectos/`), al abrir la ventana emergente **“Cambiar Estado”** y confirmar un nuevo estado, la operación falla y se muestra el mensaje **“Error desconocido”**.

Es necesario investigar la causa del error y corregir el flujo de actualización para que el cambio de estado persista correctamente en base de datos sobre el campo `PAI_PRO_proyectos.PRO_estado_val_id`. Tras una actualización exitosa, la ventana emergente debe cerrarse y la pantalla debe refrescarse mostrando el nuevo estado del proyecto.

### Referencia visual

`G63.png`
Pantalla: `https://pg-cbc-endes.pages.dev/proyectos/`

### Problemas detectados

1. **Fallo al confirmar el cambio de estado**
   Cuando el usuario selecciona un nuevo estado y ejecuta la acción de cambio, se produce un error en la operación.

2. **El mensaje de error no aporta diagnóstico útil**
   La UI muestra el mensaje **“Error desconocido”**, lo que impide identificar desde interfaz si el problema está en validación, payload, request, respuesta del backend o persistencia.

3. **No se actualiza `PAI_PRO_proyectos.PRO_estado_val_id`**
   El flujo esperado debe actualizar el valor del campo `PRO_estado_val_id` en la tabla `PAI_PRO_proyectos`, pero actualmente la operación no completa el cambio.

4. **La ventana emergente no completa el ciclo funcional esperado**
   Tras el intento de cambio, la VE no finaliza correctamente el flujo esperado de:

   * persistir el nuevo estado,
   * cerrarse,
   * refrescar la pantalla de detalle/edición.

5. **La pantalla no refleja el nuevo estado tras la acción**
   Después de una actualización correcta, la vista `/proyectos/` debería recargarse mostrando el nuevo valor de estado, lo cual actualmente no sucede debido al error.

### Comportamiento esperado

Al abrir la ventana emergente **“Cambiar Estado”** y confirmar una nueva selección:

* el sistema debe ejecutar correctamente la actualización del proyecto,
* debe persistirse el nuevo valor en `PAI_PRO_proyectos.PRO_estado_val_id`,
* la ventana emergente debe cerrarse al finalizar con éxito,
* la pantalla `https://pg-cbc-endes.pages.dev/proyectos/` debe refrescarse,
* el estado visible del proyecto debe mostrar el nuevo valor actualizado.

En caso de error real, la interfaz debe exponer un mensaje manejable y trazable, no un error genérico no diagnosticable.

### Notas técnicas

* Pantalla afectada: edición de proyecto `/proyectos/`.
* Contexto funcional:

  * el usuario pulsa **“Cambiar Estado”**,
  * se abre una VE/modal,
  * selecciona un nuevo estado,
  * confirma la acción.
* Persistencia esperada:

  * tabla: `PAI_PRO_proyectos`
  * campo a actualizar: `PRO_estado_val_id`
* Validaciones técnicas a revisar en la investigación:

  * id del proyecto enviado en la operación,
  * valor de estado seleccionado enviado en payload,
  * correspondencia entre valor seleccionado y `VAL_id`,
  * endpoint o acción de actualización,
  * método HTTP utilizado,
  * estructura del request,
  * manejo de errores del backend,
  * parseo/manejo de respuesta en frontend,
  * refresco de estado local o invalidación de caché tras éxito.
* Flujo esperado post-éxito:

  1. actualizar `PRO_estado_val_id`,
  2. cerrar VE,
  3. refrescar la pantalla,
  4. mostrar el nuevo estado.
* El requerimiento indica **investigar la causa del error**, por lo que este issue incluye tanto diagnóstico como corrección.

### Resumen

Se debe investigar y corregir el error que ocurre al cambiar el estado de un proyecto desde la ventana emergente. La acción debe actualizar `PAI_PRO_proyectos.PRO_estado_val_id`, cerrar el modal y refrescar la pantalla `/proyectos/` mostrando el nuevo estado. Además, debe eliminarse el mensaje genérico **“Error desconocido”** en favor de un manejo de errores útil y trazable.
