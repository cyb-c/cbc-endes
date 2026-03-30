### Título

Corregir comportamiento de la ventana emergente “Cambiar Estado” y filtrar la lista de estados según `PAI_VAL_valores`

### Descripción

En la pantalla de edición de proyecto (`/proyectos/`), al pulsar el botón **“Cambiar Estado”** se abre una ventana emergente (VE) para seleccionar un nuevo estado. Se han detectado dos problemas funcionales en esta interacción:

Por un lado, la VE no está aislando visualmente la pantalla, ya que la **top bar** sigue visible. Por otro, la lista de estados mostrada en el selector no está restringida según las reglas indicadas para los valores de estado del proyecto.

Es necesario corregir tanto la presentación visual del modal como la consulta/filtro de los estados disponibles.

### Referencia visual

`G62.png`
Pantalla: `https://pg-cbc-endes.pages.dev/proyectos/`

### Problemas detectados

1. **La top bar permanece visible al abrir la ventana emergente**
   Cuando el usuario pulsa **“Cambiar Estado”**, la ventana emergente no se muestra de forma aislada. El área superior de la pantalla (top bar) sigue visible, cuando debería quedar oculta detrás del overlay.

2. **El fondo de la VE no cubre completamente la pantalla**
   La ventana emergente debe visualizarse sola, con el resto de la interfaz completamente cubierta por un fondo negro o difuminado.

3. **La lista de estados no está filtrada correctamente**
   La lista de estados debe provenir de `PAI_VAL_valores`, restringida por la relación con el atributo `ESTADO_PROYECTO`.

4. **La fuente de datos de estados debe limitarse al atributo correcto**
   Solo deben mostrarse valores donde `PAI_VAL_valores.VAL_atr_id = 1`, correspondiente al atributo relacionado con:

   * `PAI_ATR_atributos.ATR_id = 1`
   * atributo: `ESTADO_PROYECTO`

5. **La lista debe excluir estados fuera del rango permitido**
   Solo deben mostrarse en la lista los estados con:

   * `PAI_VAL_valores.VAL_id > 4`
   * `PAI_VAL_valores.VAL_id < 9`

6. **La lista debe excluir valores inactivos**
   Solo deben incluirse estados con `PAI_VAL_valores.VAL_activo = 1`.

7. **La lista debe respetar el orden definido en datos**
   Los estados deben mostrarse ordenados por `PAI_VAL_valores.VAL_orden`.

### Comportamiento esperado

Al abrir la ventana emergente **“Cambiar Estado”**:

* la interfaz principal debe quedar visualmente bloqueada,
* la **top bar** no debe permanecer visible,
* el fondo debe cubrir toda la pantalla con overlay negro o difuminado,
* la VE debe mostrarse centrada y aislada.

En el selector de estados:

* la lista debe cargarse desde `PAI_VAL_valores`,
* solo deben mostrarse valores con:

  * `VAL_atr_id = 1`
  * `VAL_id > 4`
  * `VAL_id < 9`
  * `VAL_activo = 1`
* el orden de visualización debe seguir `VAL_orden`.

### Notas técnicas

* Pantalla afectada: edición de proyecto `/proyectos/`.
* Contexto funcional:

  * al pulsar el botón **“Cambiar Estado”** se abre una VE/modal.
* Origen de datos de estados:

  * tabla: `PAI_VAL_valores`
  * filtro por atributo: `PAI_VAL_valores.VAL_atr_id = 1`
* Relación atributo-valor:

  * `PAI_VAL_valores.VAL_atr_id` relaciona con `PAI_ATR_atributos`
  * `PAI_ATR_atributos.ATR_id = 1`
  * atributo asociado: `ESTADO_PROYECTO`
* Filtros requeridos para la lista:

  * `VAL_id > 4`
  * `VAL_id < 9`
  * `VAL_atr_id = 1`
  * `VAL_activo = 1`
* Orden requerido:

  * `ORDER BY VAL_orden`
* A nivel de UI, revisar:

  * overlay fullscreen,
  * z-index del modal y backdrop,
  * ocultación visual de la top bar mientras la VE esté abierta,
  * bloqueo de interacción con elementos del layout base.

### Resumen

La incidencia requiere corregir la ventana emergente de cambio de estado para que se muestre como un modal real, aislando completamente la pantalla base, y ajustar la carga de estados para que el selector solo muestre valores válidos de `PAI_VAL_valores` asociados a `ESTADO_PROYECTO`, filtrados por rango, estado activo y ordenados por `VAL_orden`.
