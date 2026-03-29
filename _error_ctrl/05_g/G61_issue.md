### Título

Alinear visualización del estado del proyecto y habilitación del botón “Cambiar Estado” según `PAI_PRO_proyectos.PRO_estado_val_id`

### Descripción

En la pantalla de edición de proyecto (`/proyectos/`) es necesario ajustar la lógica asociada al estado actual del proyecto y al comportamiento del botón **“Cambiar Estado”**.

Actualmente, el estado del proyecto debe tomarse del campo `PAI_PRO_proyectos.PRO_estado_val_id`, y la disponibilidad del botón debe depender de ese mismo valor. Se requiere aplicar reglas de habilitación/deshabilitación explícitas para evitar cambios de estado no permitidos en estados iniciales.

### Referencia visual

`G61.png`
Pantalla: `https://pg-cbc-endes.pages.dev/proyectos/`

### Problemas detectados

1. **El estado actual del proyecto debe vincularse a `PRO_estado_val_id`**
   El estado mostrado en la cabecera del proyecto debe corresponder al valor almacenado en `PAI_PRO_proyectos.PRO_estado_val_id`.

2. **La lógica de habilitación del botón “Cambiar Estado” no cumple la regla requerida**
   El botón debe estar deshabilitado cuando `PAI_PRO_proyectos.PRO_estado_val_id` tenga valor `1`, `2` o `3`.

3. **El botón debe habilitarse solo a partir de estado 4**
   El botón **“Cambiar Estado”** debe activarse únicamente cuando `PAI_PRO_proyectos.PRO_estado_val_id >= 4`.

### Comportamiento esperado

* El estado actual visible del proyecto debe reflejar el valor de `PAI_PRO_proyectos.PRO_estado_val_id`.
* El botón **“Cambiar Estado”** debe estar:

  * **deshabilitado** si `PRO_estado_val_id` es `1`, `2` o `3`,
  * **habilitado** si `PRO_estado_val_id >= 4`.

### Notas técnicas

* Tabla origen: `PAI_PRO_proyectos`.
* Campo de control: `PRO_estado_val_id`.
* Regla funcional:

  * deshabilitar botón cuando `PRO_estado_val_id IN (1, 2, 3)`
  * habilitar botón cuando `PRO_estado_val_id >= 4`
* Validar que el estado visualizado y la condición de habilitación del botón usen la misma fuente de datos para evitar inconsistencias entre UI y lógica de negocio.
* Revisar también el estado visual del botón en UI para que refleje claramente su condición de deshabilitado.

### Resumen

Se debe corregir la lógica de estado en la pantalla de edición de proyecto para que tanto la visualización del estado actual como la disponibilidad del botón **“Cambiar Estado”** dependan correctamente de `PAI_PRO_proyectos.PRO_estado_val_id`. El botón no debe permitir interacción en estados `1`, `2` o `3`, y solo debe habilitarse a partir de `4`.
