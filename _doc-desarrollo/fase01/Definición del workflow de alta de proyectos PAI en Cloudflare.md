# Definición del workflow de alta de proyectos en Cloudflare

## Objetivo del workflow

Definir el flujo de alta de un proyecto en una web-app, de modo que el usuario únicamente tenga que pegar un IJSON en un formulario y, a partir de esa acción, se ejecute un workflow que procese la información necesaria hasta dejar creado el proyecto y abrir directamente su formulario de edición.

## Resumen de ejecución

El flujo comienza cuando el usuario selecciona la opción **crear proyecto** en la web-app. A continuación, se muestra un formulario de alta en el que solo debe pegar el contenido IJSON. Al pulsar **guardar/enviar**, el formulario lanza el workflow.

El workflow toma ese IJSON, lo valida, lo guarda de forma temporal y ejecuta un prompt de IA para obtener un **Resultado-JSON** con estructura fija. Ese resultado es la pieza central del proceso, porque de él se extraen los datos con los que se crea el registro en `PAI_PRO_proyectos`.

En el instante en que se crea ese registro, el proyecto ya se considera creado. Después, el workflow completa las tareas restantes vinculadas al CII y al archivo JSON. Al finalizar, el usuario es redirigido directamente al formulario de edición del proyecto recién creado.

Si el IJSON es incorrecto o si el workflow falla antes de poder obtener un Resultado-JSON válido y crear el registro, debe mostrarse un error en el mismo formulario de alta. Si el registro ya se ha creado, el proyecto se considera creado aunque falle alguna acción posterior.

## Estructura general del workflow

### Punto de entrada

* El usuario accede a la web-app.
* El usuario selecciona la opción **crear proyecto**.
* La aplicación muestra el **formulario de alta de proyecto**.
* El formulario solo contiene un dato imprescindible: el contenido **IJSON** pegado por el usuario.
* El usuario pulsa **guardar/enviar**.
* En ese momento, el formulario debe quedar enlazado al workflow para lanzarlo.

### Comportamiento visible para el usuario

* Tras pulsar **guardar/enviar**, el texto del botón debe sustituirse por **«Ejecutando»**.
* Durante la ejecución no deben mostrarse pasos intermedios.
* El proceso debe percibirse como un bloque continuo.
* Si todo avanza correctamente, al terminar el workflow el usuario debe ser llevado directamente al **formulario de edición del proyecto recién creado**.
* Si hay error antes de crear el proyecto, el error debe mostrarse en el mismo formulario de alta.
* Si el proyecto ya ha sido creado y luego falla una tarea posterior, el usuario debe entrar igualmente en el formulario de edición del nuevo proyecto.
* En ese caso no debe mostrarse ningún aviso adicional al usuario; solo debe ver el formulario del proyecto creado.

## Elementos clave del proceso

### Entrada del workflow

* La única entrada aportada por el usuario es el **IJSON**.
* Ese IJSON no define por sí mismo el proyecto de manera directa en la interfaz.
* Su función es servir como entrada del workflow para iniciar el proceso.

### Resultado-JSON

* El **Resultado-JSON** devuelto por la ejecución del prompt es la pieza central del workflow.
* Si no existe ese Resultado-JSON, no hay base para crear el proyecto.
* La creación del registro en `PAI_PRO_proyectos` ocurre inmediatamente después de interpretar ese Resultado-JSON.
* Si el Resultado-JSON no llega, llega mal o no permite extraer campos suficientes, el proyecto no debe crearse.

### Estado del proyecto

* El proyecto se considera creado en el instante en que existe el registro en `PAI_PRO_proyectos`.
* En ese momento debe asignarse directamente a `PRO_estado_val_id` el valor correspondiente a `PAI_VAL_valores.VAL_codigo = 'CREADO'`.
* A efectos funcionales, el resultado correcto del flujo es **«proyecto creado»**.

## Desarrollo paso a paso del workflow

### 1. Recepción del IJSON

* El workflow recibe el contenido IJSON enviado desde el formulario de alta.
* El envío se produce cuando el usuario pulsa **guardar/enviar**.

### 2. Validación del formato JSON

* El workflow lee el IJSON recibido.
* Verifica que tenga formato JSON válido.

#### Casuística

* Si el contenido no es JSON válido:

  * no debe continuar el workflow;
  * no debe crearse el proyecto;
  * debe mostrarse un mensaje de error en el mismo formulario de alta.

### 3. Almacenamiento temporal del JSON

* Si el JSON es válido, el workflow lo guarda como archivo JSON en una carpeta temporal del recurso **R2** de Cloudflare.

#### Casuística

* Este archivo temporal sirve como base para la fase posterior de procesamiento.
* En esta fase aún no existe el proyecto.

### 4. Lectura del prompt de IA

* En la carpeta de la aplicación debe existir una subcarpeta llamada **`prompts-ia`**.
* En esa subcarpeta residirán los prompts destinados a ejecutarse contra la API de OpenAI y, si es posible, usando Workers AI.
* El workflow debe leer el prompt que vaya a ejecutarse desde esa carpeta.
* El prompt debe identificarse por su **nombre de archivo `.json`**.

#### Casuística

* La localización de los prompts forma parte del comportamiento esperado de la aplicación.
* La identificación del prompt no se hace por contenido libre, sino por nombre de archivo.

### 5. Ejecución del prompt

* El workflow ejecuta el prompt contra la API de OpenAI.
* Como parámetro de entrada se utiliza el archivo JSON guardado en la carpeta temporal.
* La ejecución del prompt debe intentar realizarse con Workers AI, si ello resulta posible.
* Workers AI se concibe aquí como medio para controlar la ejecución, el resultado y el error, siempre que pueda asumirse dentro del entorno previsto.

#### Casuística

* Si la ejecución no produce un Resultado-JSON válido:

  * no debe crearse el proyecto;
  * debe mostrarse error en el formulario de alta.

### 6. Recepción del Resultado-JSON

* La ejecución del prompt devuelve un JSON con una **estructura fija**.
* Ese Resultado-JSON se usa para extraer la información con la que se creará el proyecto.

#### Casuística

* Si el Resultado-JSON no llega:

  * no se crea el proyecto.
* Si el Resultado-JSON llega con formato no válido:

  * no se crea el proyecto.
* Si el Resultado-JSON llega, pero no permite extraer los campos necesarios:

  * no se crea el proyecto.
* En todos esos casos:

  * el usuario debe recibir el error en el formulario de alta.

### 7. Creación del registro en `PAI_PRO_proyectos`

* A partir del Resultado-JSON, el workflow extrae la información necesaria para los campos del proyecto.
* Inmediatamente después de interpretar ese Resultado-JSON, se crea el registro en la tabla `PAI_PRO_proyectos`.
* En ese mismo momento:

  * el proyecto ya se considera creado;
  * debe establecerse `PRO_estado_val_id` con el valor correspondiente a `VAL_codigo = 'CREADO'`.

#### Casuística

* Este es el **primer resultado válido del flujo**.
* Desde este instante, el proyecto existe aunque alguna tarea posterior falle.

### 8. Obtención del ID del proyecto

* Una vez creado el registro en `PAI_PRO_proyectos`, el workflow obtiene su **ID**.

#### Casuística

* El ID se usa como base para las tareas siguientes del workflow.

### 9. Creación del CII

* El workflow utiliza el ID del proyecto para crear el **CII**.
* El CII es un concepto ya asumido por el desarrollador y no necesita redefinirse en este documento.

### 10. Actualización de `PRO_cii`

* Una vez obtenido el CII, el workflow actualiza el campo `PRO_cii` en `PAI_PRO_proyectos`.

### 11. Creación de la subcarpeta del proyecto

* Con el CII, el workflow crea la subcarpeta correspondiente al proyecto.

### 12. Movimiento y renombrado del JSON

* El archivo JSON guardado inicialmente en la carpeta temporal se mueve a la subcarpeta del proyecto.
* El archivo se renombra como **`CII.json`**.

#### Casuística

* El archivo JSON forma parte de los artefactos del workflow.
* Ese archivo no debe mostrarse en el formulario de edición.
* Todo lo demás que genere el workflow debe reflejarse en el registro de `PAI_PRO_proyectos`.

### 13. Fin del workflow

* Cuando el workflow termina, se considera cerrada la fase de creación.
* El usuario debe ser llevado directamente a la pantalla del proyecto recién creado, es decir, a su **formulario de edición**.

## Criterio de éxito del flujo

Se considera que el flujo ha alcanzado su resultado válido cuando el proyecto ha sido creado en `PAI_PRO_proyectos` con estado `CREADO`.

El postprocesado posterior forma parte del workflow, pero no altera el hecho de que el proyecto ya existe desde la creación del registro.

## Casuística resumida

### Casos en los que no debe crearse el proyecto

* El IJSON no es JSON válido.
* El prompt no devuelve un Resultado-JSON válido.
* El Resultado-JSON no llega.
* El Resultado-JSON no permite extraer la información necesaria para crear el registro.

### Casos en los que el proyecto sí debe considerarse creado

* Se ha creado el registro en `PAI_PRO_proyectos`.
* Se ha asignado el estado `CREADO`.
* Aunque falle una tarea posterior del workflow, el proyecto sigue considerándose creado.

### Comportamiento de la interfaz

* Mientras se ejecuta el workflow:

  * el botón debe mostrar **«Ejecutando»**.
* Si falla antes de crear el proyecto:

  * se muestra error en el formulario de alta.
* Si el proyecto ya se ha creado:

  * el usuario entra en el formulario de edición del nuevo proyecto;
  * no debe mostrarse el archivo JSON;
  * no debe requerirse intervención manual previa de otro actor.

## Síntesis final

Este workflow define un alta de proyecto guiada por IJSON, en la que el usuario solo inicia el proceso y el sistema resuelve toda la creación real mediante una secuencia cerrada de tareas. El eje del flujo es el Resultado-JSON obtenido tras la ejecución del prompt. Sin ese resultado no hay proyecto; con él, el sistema crea el registro en `PAI_PRO_proyectos`, le asigna el estado `CREADO`, completa las operaciones auxiliares y muestra al usuario el formulario de edición del proyecto recién creado.
