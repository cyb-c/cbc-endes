# Definición del workflow de análisis de proyecto en Cloudflare

## Objetivo del workflow

Definir el flujo de análisis de un proyecto ya creado dentro de la web-app, mediante la ejecución ordenada de ocho pasos de IA. Cada paso genera un archivo Markdown asociado al proyecto, persistido en R2 y mostrado después en la interfaz de usuario, siempre como resultado cerrado de una ejecución completa.

## Resumen de ejecución

El workflow se lanza desde la pantalla de edición del proyecto mediante un botón llamado **análisis**. Ese botón solo debe estar disponible mientras el estado del proyecto sea anterior a `EVALUANDO_VIABILIDAD`.

Cuando el usuario pulsa el botón, se inicia una ejecución compuesta por ocho pasos fijos. Cada paso corresponde a un prompt ya definido en un archivo JSON dentro de la carpeta `prompts-ia`. La entrada base del proceso es el IJSON ya guardado en la subcarpeta del proyecto.

Si ya hubo una ejecución anterior, antes de empezar deben borrarse los ocho archivos MD existentes. Si es la primera ejecución, no se borra nada.

Durante la ejecución, el botón debe reflejar el avance mostrando el número y el nombre del paso actual. Sin embargo, los resultados no deben mostrarse al usuario hasta que el análisis haya terminado.

Cada paso genera un archivo MD. Los pasos 1 a 5 producen salidas base. Los pasos 6, 7 y 8 usan como entrada el IJSON más los resultados de los pasos 2, 3, 4 y 5. Si la ejecución finaliza correctamente, el usuario permanece en la misma pantalla de edición, se refresca la vista y se muestran las ocho pestañas con el análisis finalizado.

## Punto de partida del workflow

* El proyecto ya existe.
* El usuario se encuentra en la pantalla de edición del proyecto.
* El botón **análisis** debe estar disponible solo si el estado del proyecto es anterior a `EVALUANDO_VIABILIDAD`.
* El lanzamiento del workflow se produce por clic del usuario en ese botón.

## Condición de disponibilidad del botón análisis

* El botón **análisis** debe mostrarse únicamente antes de que el estado del proyecto cambie a `EVALUANDO_VIABILIDAD` o a cualquier estado superior.

### Casuística

* Si el proyecto aún no ha alcanzado `EVALUANDO_VIABILIDAD`:

  * el botón análisis puede mostrarse y utilizarse.
* Si el proyecto ya está en `EVALUANDO_VIABILIDAD` o en un estado superior:

  * el botón ya no debe estar disponible.

## Comportamiento visible durante la ejecución

* Al iniciarse el workflow, el botón debe cambiar su texto.
* El botón debe mostrar el **número y nombre del paso actual** que se esté ejecutando.
* El usuario permanece en la misma pantalla de edición durante toda la ejecución.
* Los resultados del análisis no deben mostrarse de forma parcial.

### Casuística

* Si la ejecución avanza correctamente:

  * el botón debe ir reflejando el paso actual.
* Si la ejecución falla:

  * el usuario permanece en la misma pantalla;
  * se aplica el mismo sistema de error y notificación ya definido para el workflow anterior.
* Aunque existan resultados intermedios:

  * no deben mostrarse al usuario hasta el final del análisis.

## Origen de datos y ubicación de prompts

### IJSON de entrada

* Este workflow no recibe un IJSON pegado manualmente por el usuario.
* El IJSON se toma del archivo ya guardado en la subcarpeta del proyecto.

### Carpeta de prompts

* Los prompts se leen desde la misma carpeta de la aplicación llamada **`prompts-ia`**.
* Cada prompt se identifica por su nombre de archivo JSON.

### Relación de prompts del workflow

* `01_DatosClave.json`
* `02_ActivoFisico.json`
* `03_ActivoEstrategico.json`
* `04_ActivoFinanciero.json`
* `05_ActivoRegulado.json`
* `06_Inversor.json`
* `07_EmprendedorOperador.json`
* `08_Propietario.json`

## Estructura general del workflow

### Reglas previas a la ejecución

* El workflow puede ejecutarse **n veces** sobre el mismo proyecto.
* Cada nueva ejecución sustituye completamente a la anterior.

### Casuística previa

* Si es la primera ejecución sobre el proyecto:

  * no se borra ningún archivo MD previo.
* Si ya hubo una ejecución anterior:

  * antes de empezar deben borrarse los ocho archivos MD existentes.

## Desarrollo paso a paso del workflow

## 1. Inicio del análisis

* El usuario pulsa el botón **análisis**.
* Se valida que el proyecto se encuentre en un estado que permita esta acción.
* Si procede, comienza el workflow.

### Casuística

* Si el proyecto ya está en `EVALUANDO_VIABILIDAD` o superior:

  * el workflow no debe poder lanzarse.
* Si el proyecto está en un estado anterior:

  * puede iniciarse la ejecución.

## 2. Limpieza previa de resultados anteriores

* Antes de empezar la nueva ejecución, el sistema comprueba si ya existen resultados previos del análisis.

### Casuística

* Si es la primera ejecución:

  * no se elimina nada.
* Si ya hubo una ejecución anterior:

  * deben borrarse los ocho archivos MD existentes antes de iniciar los nuevos pasos.

## 3. Lectura de recursos base

* El workflow toma el IJSON ya guardado en la subcarpeta del proyecto.
* El workflow localiza en `prompts-ia` los archivos de prompt necesarios por su nombre.

## 4. Ejecución del paso 1

* Se ejecuta el prompt `01_DatosClave.json`.
* La entrada base es el IJSON del proyecto.
* El resultado debe ser un archivo MD.

### Casuística

* Si el paso 1 termina correctamente:

  * se guarda su archivo MD correspondiente;
  * el workflow puede continuar.
* Si el paso 1 falla:

  * el workflow se detiene completamente;
  * no deben ejecutarse los pasos 2 a 8;
  * el usuario permanece en la pantalla de edición y recibe la notificación de error.

## 5. Ejecución de los pasos 2, 3, 4 y 5

* Se ejecutan en orden fijo.
* Cada uno usa el mismo IJSON del proyecto.
* Son independientes entre sí en cuanto a su lógica de entrada.
* Cada paso genera su propio archivo MD.

### Paso 2

* Prompt: `02_ActivoFisico.json`

### Paso 3

* Prompt: `03_ActivoEstrategico.json`

### Paso 4

* Prompt: `04_ActivoFinanciero.json`

### Paso 5

* Prompt: `05_ActivoRegulado.json`

### Casuística del bloque 2-5

* Si un paso termina correctamente:

  * se conserva su archivo MD.
* Si uno de estos pasos falla:

  * los archivos MD ya generados correctamente deben conservarse;
  * los pasos 6, 7 y 8 no deben ejecutarse;
  * el usuario permanece en la pantalla de edición y recibe la notificación de error.

## 6. Validación de dependencias para los pasos 6, 7 y 8

Antes de ejecutar el bloque final, deben existir correctamente estos cinco elementos:

* IJSON;
* resultado del paso 2;
* resultado del paso 3;
* resultado del paso 4;
* resultado del paso 5.

### Casuística

* Si falta cualquiera de esos elementos:

  * los pasos 6, 7 y 8 no deben ejecutarse.
* Si todos existen correctamente:

  * puede iniciarse el bloque final.

## 7. Ejecución del paso 6

* Se ejecuta el prompt `06_Inversor.json`.
* Usa como parámetros:

  * IJSON;
  * resultado del paso 2;
  * resultado del paso 3;
  * resultado del paso 4;
  * resultado del paso 5.
* Genera un archivo MD.

## 8. Ejecución del paso 7

* Se ejecuta el prompt `07_EmprendedorOperador.json`.
* Usa como parámetros:

  * IJSON;
  * resultado del paso 2;
  * resultado del paso 3;
  * resultado del paso 4;
  * resultado del paso 5.
* Genera un archivo MD.

## 9. Ejecución del paso 8

* Se ejecuta el prompt `08_Propietario.json`.
* Usa como parámetros:

  * IJSON;
  * resultado del paso 2;
  * resultado del paso 3;
  * resultado del paso 4;
  * resultado del paso 5.
* Genera un archivo MD.

### Casuística del bloque 6-8

* Los pasos 6, 7 y 8 son independientes entre sí una vez que existen correctamente sus dependencias de entrada.
* Si uno de ellos falla:

  * no deben seguir ejecutándose los demás;
  * el usuario permanece en la pantalla de edición y recibe la notificación de error.

## 10. Persistencia de resultados

* Cada paso genera un archivo MD.
* Todos los archivos MD se guardan en la subcarpeta del proyecto dentro de R2.

### Casuística

* Los resultados generados forman parte del proyecto.
* En una nueva ejecución correcta, los resultados anteriores quedan sustituidos por los nuevos.
* El sistema debe trabajar siempre con la lógica de que los MD visibles correspondan a la última ejecución válida mostrada al usuario.

## 11. Visualización en la web-app

* Cada archivo MD se corresponde de forma fija con una pestaña concreta.
* El contenido debe mostrarse en la web-app como **MD embellecido**.
* Las pestañas no deben mostrarse al usuario durante una ejecución incompleta.

### Casuística

* Si el análisis no ha terminado:

  * el usuario no debe ver resultados parciales.
* Si el análisis finaliza correctamente:

  * deben mostrarse las ocho pestañas con sus ocho resultados.

## 12. Finalización del workflow

* El workflow se considera concluido cuando la ejecución termina y el resultado queda reflejado visualmente para el usuario en la pantalla de edición.
* El usuario permanece en esa misma pantalla.
* Debe producirse un refresco de pantalla, aunque la decisión concreta sobre ese comportamiento queda a criterio del desarrollador.

## Criterio de éxito del flujo

El resultado visible correcto del workflow debe entenderse como:

**análisis finalizado**

Eso implica que:

* los ocho pasos previstos han sido ejecutados;
* cada paso ha producido su archivo MD correspondiente;
* los resultados están persistidos en la subcarpeta del proyecto;
* la pantalla de edición refleja el análisis completo en sus pestañas correspondientes.

## Casuística resumida

### Casos de ejecución normal

* El proyecto está en un estado anterior a `EVALUANDO_VIABILIDAD`.
* El usuario pulsa el botón análisis.
* Si hubo una ejecución anterior, se borran los ocho MD previos.
* Se ejecutan los ocho pasos conforme a sus dependencias.
* Se generan los ocho MD.
* Se refresca la pantalla.
* El usuario ve el resultado como **análisis finalizado**.

### Casos de error en paso 1

* Falla el primer paso.
* El workflow se detiene.
* No se ejecuta ningún paso posterior.
* El usuario permanece en edición y recibe la notificación.

### Casos de error en pasos 2-5

* Falla cualquiera de esos pasos.
* Se conservan los MD que ya se hayan generado correctamente.
* No se ejecutan los pasos 6, 7 y 8.
* El usuario permanece en edición y recibe la notificación.

### Casos de error en pasos 6-8

* Falla uno de esos pasos.
* Los otros dos no deben seguir ejecutándose.
* El usuario permanece en edición y recibe la notificación.

### Reglas de visualización

* No deben mostrarse resultados parciales.
* Las pestañas con los MD solo deben quedar visibles al final del análisis.
* Cada pestaña se corresponde siempre con el mismo resultado.

## Síntesis final

Este segundo workflow define un proceso de análisis sobre un proyecto ya existente. Se inicia desde la edición del proyecto, usa como base el IJSON archivado y ejecuta ocho prompts fijos leídos desde `prompts-ia`. Su lógica combina un primer paso bloqueante, un bloque intermedio de resultados base y un bloque final dependiente de los resultados 2, 3, 4 y 5. El proceso puede repetirse tantas veces como sea necesario, sustituyendo los resultados anteriores, pero el usuario solo debe ver el resultado cuando el análisis haya concluido. El resultado funcional esperado es un único estado visible y cerrado: **análisis finalizado**.
