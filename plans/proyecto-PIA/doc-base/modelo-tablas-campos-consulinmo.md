# Modelo de datos: tablas y campos

## 1. Convención de nombres

Según la definición base del proyecto, las tablas deben llevar prefijo `PAI_`, cada tabla debe incorporar un acrónimo de 3 letras, y cada campo debe comenzar por ese mismo acrónimo para garantizar unicidad en la base de datos. 

Formato general propuesto:

| Elemento         | Regla                            |
| ---------------- | -------------------------------- |
| Prefijo de tabla | `PAI_`                           |
| Nombre tabla     | `PAI_` + `Acro3_` + nombre_tabla |
| Nombre campo     | `Acro3_` + nombre_campo          |
| Ejemplo tabla    | `PAI_PRO_proyectos`              |
| Ejemplo campo PK | `PRO_id`                         |
| Ejemplo campo    | `PRO_titulo`                     |

---

## 2. Tablas identificadas o necesarias

Mínimo estas piezas: tabla de proyectos, tabla común de atributos, tabla común de valores, tabla de notas, una bitácora o tabla de pipeline relacionada con el proyecto y una tabla de artefactos asociada al proyecto para almacenar de forma estructurada las salidas generadas y otros ficheros vinculados al proceso. También se deduce la necesidad de registrar estados y motivos asociados a cambios manuales, resolviendo esos valores dentro del modelo común de atributos/valores.  

| ID |                       Tabla | Tipo                      | Estado                                  |
| -- | --------------------------: | ------------------------- | --------------------------------------- |
| 1  |         `PAI_PRO_proyectos` | Principal                 | Deducida como tabla central del sistema |
| 2  |         `PAI_ATR_atributos` | Dominio común             | Explícita                               |
| 3  |           `PAI_VAL_valores` | Dominio común             | Explícita                               |
| 4  |             `PAI_NOT_notas` | Operativa                 | Deducida con alto respaldo              |
| 5  |          `PAI_PIP_pipeline` | Trazabilidad técnica      | Deducida con alto respaldo              |
| 6  |        `PAI_ART_artefactos` | Operativa/técnica         | Propuesta consistente                   |

---

## 3. Tabla `PAI_PRO_proyectos`

Esta es la tabla base del sistema. Las fuentes indican que el proyecto nace al pegar el contenido de un archivo JSON por parte del usuario (llamado I-JSON), que el sistema utiliza para extraer campos básicos mediante prompt API-IA, asigna un CII, conserva el estado y muestra resultados analíticos en el formulario del proyecto.

### Campos mínimos confirmados

| ID |                          Campo | Tipo lógico       | Origen             | Observación                                                                         |
| -- | -----------------------------: | ----------------- | ------------------ | ----------------------------------------------------------------------------------- |
| 1  |                   `PRO_id` | entero PK         | Propuesto          | Id interno del proyecto                                                             |
| 2  |                      `PRO_cii` | texto corto único | Explícito          | Código Id de Inmueble guardado en la tabla del proyecto                             |
| 3  |                   `PRO_titulo` | texto             | Explícito/deducido | Título o nombre del proyecto mostrado en la ficha                                   |
| 4  |            `PRO_estado_val_id` | FK                | Explícito/deducido | Estado del proyecto resuelto vía atributos/valores                                  |
| 5  |            `PRO_motivo_val_id` | FK nullable       | Explícito/deducido | Motivo asociado a valoración o descarte, resuelto vía atributos/valores             |
| 6  |            `PRO_portal_nombre` | texto corto       | Deducido           | Nombre del portal inmobiliario de origen                                            |
| 7  |               `PRO_portal_url` | texto             | Deducido fuerte    | URL al inmueble concreto en el portal inmobiliario                                  |
| 8  |                `PRO_operacion` | texto corto       | Deducido fuerte    | Tipo de operación: venta, alquiler u otra modalidad                                 |
| 9  |            `PRO_tipo_inmueble` | texto corto       | Deducido fuerte    | Tipo principal del inmueble                                                         |
| 10 |                   `PRO_precio` | decimal           | Deducido fuerte    | Precio principal mostrado en el proyecto                                            |
| 11 | `PRO_superficie_construida_m2` | decimal           | Deducido fuerte    | Superficie construida del inmueble                                                  |
| 12 |                   `PRO_ciudad` | texto corto       | Deducido fuerte    | Ciudad del inmueble                                                                 |
| 13 |          `PRO_barrio_distrito` | texto             | Deducido           | Campo de visualización resumida para barrio y/o distrito                            |
| 14 |                `PRO_direccion` | texto             | Deducido fuerte    | Dirección del inmueble                                                              |
| 15 |        `PRO_resumen_ejecutivo` | texto largo       | Deducido fuerte    | Resumen ejecutivo del proyecto generado tras el análisis                            |
| 16 |               `PRO_fecha_alta` | datetime          | Propuesto          | Fecha de creación del proyecto                                                      |
| 17 |           `PRO_fecha_analisis` | datetime          | Propuesto/deducido | Fecha en la que se ejecutó el análisis desde el botón “Ejecutar Análisis”           |

### Observación importante sobre el CII

* Formulación del CII definido como **2 dígitos de año + 2 dígitos de mes + 4 dígitos del ID del proyecto**

### Ajuste de criterio importante dentro de esta tabla

Para que esta tabla quede alineada con lo que has pedido, la lectura correcta de varios campos es esta:

* `PRO_estado_val_id` representa el **Estado** del proyecto como valor de dominio.
* `PRO_motivo_val_id` representa el **Motivo** cuando exista valoración o descarte, también como valor de dominio.
* `PRO_portal_nombre` + `PRO_portal_url` resuelven juntos el campo funcional **Portal (nombre + enlace al inmueble concreto)**.
* `PRO_resumen_ejecutivo` resuelve el campo funcional **Resumen ejecutivo**.
* `PRO_fecha_alta` resuelve **Creado (fecha)**.
* `PRO_fecha_analisis` resuelve **Análisis (fecha)** como fecha funcional principal de ejecución.

### Relaciones funcionales relevantes de esta tabla

* `PRO_estado_val_id` apunta a `PAI_VAL_valores(VAL_id)`.
* `PRO_motivo_val_id` apunta a `PAI_VAL_valores(VAL_id)`.
* Los valores de estado deben pertenecer al atributo `ESTADO_PROYECTO`.
* Los valores de motivo se almacenan en `PAI_VAL_valores` y deben pertenecer a los atributos `MOTIVO_VALORACION` o `MOTIVO_DESCARTE`.
* Los artefactos documentales o técnicos del proyecto no se almacenan ya como múltiples columnas `*_ruta` en esta tabla, sino mediante una relación con `PAI_ART_artefactos`.

---

## 4. Tabla `PAI_ATR_atributos`

La tabla de atributos de uso común para toda la aplicación. Los estados del proyecto deben mantenerse en esa estructura, no como lista rígida incrustada. Además, este mismo criterio encaja con motivos y con el campo `tipo` de notas que me has pedido añadir como atributo/valor.  

| ID |                     Campo | Tipo lógico       | Observación                   |
| -- | ------------------------: | ----------------- | ----------------------------- |
| 1  |                  `ATR_id` | entero PK         | Id del atributo               |
| 2  |              `ATR_codigo` | texto corto único | Código funcional del atributo |
| 3  |              `ATR_nombre` | texto corto       | Nombre visible                |
| 4  |         `ATR_descripcion` | texto             | Descripción                   |
| 5  |              `ATR_activo` | booleano          | Activo/inactivo               |
| 6  |               `ATR_orden` | entero            | Orden de visualización        |
| 7  |          `ATR_fecha_alta` | datetime          | Alta                          |
| 8  | `ATR_fecha_actualizacion` | datetime          | Actualización                 |

### Registros esperables en atributos

| ID |        `ATR_codigo` | `ATR_nombre`         |
| -- | ------------------: | -------------------- |
| 1  |   `ESTADO_PROYECTO` | Estado del proyecto  |
| 2  | `MOTIVO_VALORACION` | Motivo de valoración |
| 3  |   `MOTIVO_DESCARTE` | Motivo de descarte   |
| 4  |         `TIPO_NOTA` | Tipo de nota         |
| 5  |    `TIPO_ARTEFACTO` | Tipo de artefacto    |

---

## 5. Tabla `PAI_VAL_valores`

La tabla de valores asociada a atributos. Ahí deben estar, como mínimo, los estados iniciales del proyecto. Del mismo modo, desde este mismo mecanismo se pueden resolver los tipos de nota, los motivos estructurados y los tipos de artefacto.  

| ID |                     Campo | Tipo lógico | Observación                      |
| -- | ------------------------: | ----------- | -------------------------------- |
| 1  |                  `VAL_id` | entero PK   | Id del valor                     |
| 2  |              `VAL_atr_id` | FK          | Relación con `PAI_ATR_atributos` |
| 3  |              `VAL_codigo` | texto corto | Código interno del valor         |
| 4  |              `VAL_nombre` | texto corto | Texto visible                    |
| 5  |         `VAL_descripcion` | texto       | Descripción                      |
| 6  |               `VAL_orden` | entero      | Orden                            |
| 7  |              `VAL_activo` | booleano    | Activo/inactivo                  |
| 8  |          `VAL_es_default` | booleano    | Marca de valor por defecto       |
| 9  |          `VAL_fecha_alta` | datetime    | Alta                             |
| 10 | `VAL_fecha_actualizacion` | datetime    | Actualización                    |

### Relaciones estructurales relevantes

* `VAL_atr_id` apunta a `PAI_ATR_atributos(ATR_id)`.
* Cada valor pertenece a un único atributo.
* `PAI_VAL_valores` es la tabla común desde la que se resuelven estados, motivos, tipos de nota y tipos de artefacto.
* `PRO_estado_val_id`, `PRO_motivo_val_id`, `NOT_tipo_val_id`, `NOT_estado_val_id`, `PIP_estado_val_id` y `ART_tipo_val_id` apuntan todos a `PAI_VAL_valores(VAL_id)`.

### Valores mínimos confirmados para estados

| ID |          Atributo | `VAL_codigo`          | `VAL_nombre`        |
| -- | ----------------: | --------------------- | ------------------- |
| 1  | `ESTADO_PROYECTO` | `CREADO`              | creado              |
| 2  | `ESTADO_PROYECTO` | `PROCESANDO_ANALISIS` | procesando análisis |
| 3  | `ESTADO_PROYECTO` | `ANALISIS_CON_ERROR`  | análisis con error  |
| 4  | `ESTADO_PROYECTO` | `ANALISIS_FINALIZADO` | análisis finalizado |

### Valores esperables para `TIPO_NOTA`

| ID |    Atributo | `VAL_codigo` | `VAL_nombre` |
| -- | ----------: | ------------ | ------------ |
| 1  | `TIPO_NOTA` | `COMENTARIO` | Comentario   |
| 2  | `TIPO_NOTA` | `VALORACION`   | Valoración     |
| 3  | `TIPO_NOTA` | `DECISION`   | Decisión     |
| 4  | `TIPO_NOTA` | `APRENDE_IA` | Correción IA   |

### Motivos de valoración

| ID | `VAL_codigo`                                  | `VAL_nombre`                               | Descripción funcional                                                                                |
| -- | --------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1  | `MV_SENTIDO_NEGOCIO_REAL`             | Sentido de negocio real                    | El activo parece tener sentido de negocio real.                                                      |
| 2  | `MV_INFRAUTILIZADO`                   | Infrautilizado                             | El activo se aprecia como infrautilizado o con margen claro de mejora.                               |
| 3  | `MV_USO_ECONOMICO_RAZONABLE`          | Uso económico razonable                    | El activo parece sostener un uso económico razonable.                                                |
| 4  | `MV_MANTENER`                         | Conviene mantener                          | La opción más defendible parece ser mantener el activo.                                              |
| 5  | `MV_TRANSFORMAR`                      | Conviene transformar                       | La opción más defendible parece ser transformar el activo.                                           |
| 6  | `MV_RECONVERSION_DEFENDIBLE_VALENCIA` | Reconversión defendible en València ciudad | Una posible reconversión o cambio de uso parece defendible en València ciudad.                       |
| 7  | `MV_OPORTUNIDAD_TRANSFORMACION`       | Oportunidad clara de transformación        | Se aprecia una oportunidad clara de mantenimiento o transformación, especialmente de transformación. |
| 8  | `MV_OPORTUNIDAD_MANTENIMIENTO`        | Oportunidad clara de mantenimiento         | Se aprecia una oportunidad clara de mantenimiento del activo.                                        |

### Motivos de descarte

| ID | `VAL_codigo`                                   | `VAL_nombre`                                            | Descripción funcional                                                                                    |
| -- | ---------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1  | `MD_SIN_SENTIDO_NEGOCIO_REAL`            | Sin sentido de negocio real                             | El activo no parece tener sentido de negocio real.                                                       |
| 2  | `MD_NO_INFRAUTILIZADO_NI_MEJORABLE`      | Sin infrautilización relevante                          | El activo no parece infrautilizado ni presenta mejora clara que justifique su interés.                   |
| 3  | `MD_SIN_USO_ECONOMICO_RAZONABLE`         | Sin uso económico razonable                             | El activo no parece sostener un uso económico razonable.                                                 |
| 4  | `MD_NO_CONVIENE_MANTENER`                | No conviene mantener                                    | Mantener el activo no parece una opción defendible.                                                      |
| 5  | `MD_NO_CONVIENE_TRANSFORMAR`             | No conviene transformar                                 | Transformar el activo no parece una opción defendible.                                                   |
| 6  | `MD_RECONVERSION_NO_DEFENDIBLE_VALENCIA` | Reconversión no defendible en València ciudad           | Una posible reconversión o cambio de uso no parece defendible en València ciudad.                        |
| 7  | `MD_SIN_OPORTUNIDAD_CLARA`               | Sin oportunidad clara | No se aprecia una oportunidad clara de mantenimiento ni de transformación.                               |
| 8  | `MD_HIPOTESIS_NO_SOSTENIBLE`             | Hipótesis atractiva no sostenible                       | Una hipótesis inicialmente atractiva, como una reconversión o cambio de uso, deja de parecer defendible. |

### Valores esperables para `TIPO_ARTEFACTO`

| ID |         Atributo | `VAL_codigo`                 | `VAL_nombre`                    |
| -- | ---------------: | ---------------------------- | ------------------------------- |
| 1  | `TIPO_ARTEFACTO` | `DATOS_MD`                   | Markdown de datos transformados |
| 2  | `TIPO_ARTEFACTO` | `ANALISIS_FISICO`            | Análisis físico                 |
| 3  | `TIPO_ARTEFACTO` | `ANALISIS_ESTRATEGICO`       | Análisis estratégico            |
| 4  | `TIPO_ARTEFACTO` | `ANALISIS_FINANCIERO`        | Análisis financiero             |
| 5  | `TIPO_ARTEFACTO` | `ANALISIS_REGULATORIO`       | Análisis regulatorio            |
| 6  | `TIPO_ARTEFACTO` | `LECTURA_INVERSOR`           | Lectura inversor                |
| 7  | `TIPO_ARTEFACTO` | `LECTURA_OPERADOR`           | Lectura operador                |
| 8  | `TIPO_ARTEFACTO` | `LECTURA_PROPIETARIO`        | Lectura propietario             |
| 9  | `TIPO_ARTEFACTO` | `LOG_CII_JSON`               | Log CII JSON                    |

---

## 6. Tabla `PAI_NOT_notas`

Las fuentes indican que las notas son una funcionalidad propia asociada al proyecto, que incluyen al menos asunto, nota, fechas automáticas y el estado del proyecto vigente al momento de crear la nota.

| ID |                       Campo | Tipo lógico    | Observación                                                                    |
| -- | --------------------------: | -------------- | ------------------------------------------------------------------------------ |
| 1  |                    `NOT_id` | entero PK      | Id de la nota                                                                  |
| 2  |                `NOT_proyecto_id` | FK             | Proyecto al que pertenece                                                      |
| 5  |           `NOT_tipo_val_id` | FK             | Tipo de nota resuelto mediante `PAI_VAL_valores`, bajo el atributo `TIPO_NOTA` |
| 3  |                `NOT_asunto` | texto          | Asunto de la nota                                                              |
| 4  |                  `NOT_nota` | texto largo    | Contenido                                                                      |
| 6  |         `NOT_estado_val_id` | FK             | Estado del proyecto al crear la nota                                           |
| 7  |              `NOT_editable` | booleano       | Puede derivarse del estado, pero útil para control práctico                    |
| 8  |            `NOT_fecha_alta` | datetime       | Fecha automática de creación                                                   |
| 9  |   `NOT_fecha_actualizacion` | datetime       | Fecha automática de edición                                                    |
| 10 |          `NOT_usuario_alta` | entero o texto | Autor                                                                          |
| 11 | `NOT_usuario_actualizacion` | entero o texto | Último editor                                                                  |

### Ajuste estructural asociado

* `NOT_tipo_val_id` **no** apunta a una tabla nueva.
* `NOT_tipo_val_id` apunta a `PAI_VAL_valores`.
* esos valores deben pertenecer al atributo `TIPO_NOTA` en `PAI_ATR_atributos`.
* `NOT_proyecto_id` apunta a `PAI_PRO_proyectos(PRO_id)`.
* `NOT_estado_val_id` apunta a `PAI_VAL_valores(VAL_id)`.
* Las notas solo podrán agregarse/editarse cuando el estado del proyecto sea "análisis finalizado" o posterior.
* Regla funcional importante: una nota solo puede editarse mientras siga vigente el estado con el que fue creada. Ese control puede contrastarse contra la trazabilidad de cambios de estado registrada en `PAI_PIP_pipeline`. A eso añado ahora el nuevo campo `tipo`, resuelto mediante atributo/valor. 

---

## 7. Tabla `PAI_PIP_pipeline`

Se deduce una bitácora o tabla de pipeline relacionada con proyectos, donde se registran proceso de análisis, errores y cambios de estado. Además, la documentación del proceso deja claro que la aplicación debe registrar avance, errores y actualización de estado durante la ejecución del propio análisis o se relanzamiento.  

| ID |               Campo | Tipo lógico        | Observación                              |
| -- | ------------------: | ------------------ | ---------------------------------------- |
| 1  |            `PIP_id` | entero PK          | Id del evento de pipeline                |
| 2  |        `PIP_proyecto_id` | FK                 | Proyecto relacionado                     |
| 3  |   `PIP_tipo_evento` | texto corto        | Inicio, stage, error, fin, cambio_estado |
| 4  |   `PIP_paso_codigo` | texto corto        | Identificador del paso                   |
| 5  |   `PIP_paso_nombre` | texto              | Nombre visible del paso                  |
| 6  | `PIP_estado_val_id` | FK nullable        | Estado del proyecto asociado al evento   |
| 7  |     `PIP_resultado` | texto corto        | ok / error / warning                     |
| 8  |       `PIP_mensaje` | texto largo        | Detalle del evento                       |
| 9  |  `PIP_payload_json` | json o texto largo | Datos técnicos auxiliares                |
| 10 |  `PIP_fecha_evento` | datetime           | Marca temporal                           |
| 11 |    `PIP_usuario_id` | entero nullable    | Solo si el evento fue manual             |
| 12 |        `PIP_origen` | texto corto        | sistema / usuario                        |

### Ajuste estructural asociado

* `PIP_proyecto_id` apunta a `PAI_PRO_proyectos(PRO_id)`.
* `PIP_estado_val_id` apunta a `PAI_VAL_valores(VAL_id)`.
* Esta tabla actúa como bitácora formal de trazabilidad del proyecto.
* Aquí deben quedar registrados proceso de análisis, errores y cambios de estado.
* Desde esta tabla puede deducirse el historial funcional necesario para contrastar cuándo una nota sigue siendo editable respecto del estado vigente del proyecto.

---

## 8. Tabla `PAI_ART_artefactos`

Para no cargar la tabla `PAI_PRO_proyectos` con múltiples columnas `*_ruta`, se propone una tabla específica de artefactos relacionada con el proyecto, donde se registran las salidas documentales, analíticas o técnicas generadas durante el proceso.

| ID |                    Campo | Tipo lógico        | Observación                                                                 |
| -- | -----------------------: | ------------------ | --------------------------------------------------------------------------- |
| 1  |               `ART_id` | entero PK          | Id del artefacto                                                            |
| 2  |      `ART_proyecto_id` | FK                 | Proyecto al que pertenece                                                   |
| 3  |       `ART_tipo_val_id` | FK                 | Tipo de artefacto resuelto mediante `PAI_VAL_valores`, bajo `TIPO_ARTEFACTO` |
| 4  |          `ART_nombre` | texto corto        | Nombre visible del artefacto                                                |
| 5  |            `ART_ruta` | texto              | Ruta o localización del fichero                                             |
| 6  |          `ART_mime` | texto corto        | Tipo MIME o formato lógico del artefacto                                    |
| 7  | `ART_fecha_generacion` | datetime           | Fecha de generación del artefacto                                           |
| 8  |        `ART_origen` | texto corto        | sistema / usuario                                                           |
| 9  |       `ART_activo` | booleano           | Permite marcar la versión vigente o visible                                 |
| 10 |   `ART_descripcion` | texto              | Descripción funcional o técnica                                             |

### Ajuste estructural asociado

* `ART_proyecto_id` apunta a `PAI_PRO_proyectos(PRO_id)`.
* `ART_tipo_val_id` apunta a `PAI_VAL_valores(VAL_id)`.
* Los valores de `ART_tipo_val_id` deben pertenecer al atributo `TIPO_ARTEFACTO`.
* Esta tabla sustituye funcionalmente las anteriores columnas:
  * `PRO_datos_md_ruta`
  * `PRO_analisis_fisico_ruta`
  * `PRO_analisis_estrategico_ruta`
  * `PRO_analisis_financiero_ruta`
  * `PRO_analisis_regulatorio_ruta`
  * `PRO_lectura_inversor_ruta`
  * `PRO_lectura_operador_ruta`
  * `PRO_lectura_propietario_ruta`
  * `PRO_log_ruta`
* El proyecto puede tener uno o varios artefactos por tipo, si más adelante se requiere versionado o regeneración de salidas.

---

## 9. Resumen mínimo del esquema relacional

| ID |                       Tabla | Clave principal | Relaciones principales                                                                 |
| -- | --------------------------: | --------------- | -------------------------------------------------------------------------------------- |
| 1  |         `PAI_PRO_proyectos` | `PRO_id`        | Se relaciona con estado actual, motivo actual, notas, pipeline y artefactos           |
| 2  |         `PAI_ATR_atributos` | `ATR_id`        | Padre de valores                                                                       |
| 3  |           `PAI_VAL_valores` | `VAL_id`        | Hijo de atributos; usado por proyectos, notas, pipeline y artefactos                  |
| 4  |             `PAI_NOT_notas` | `NOT_id`        | FK a proyecto, a estado vigente al crear y a tipo de nota                              |
| 5  |          `PAI_PIP_pipeline` | `PIP_id`        | FK a proyecto; opcionalmente a estado; registra trazabilidad y cambios de estado      |
| 6  |        `PAI_ART_artefactos` | `ART_id`        | FK a proyecto y a tipo de artefacto; almacena rutas y salidas del proceso             |

### Relaciones principales explicitadas

* `PAI_VAL_valores.VAL_atr_id` → `PAI_ATR_atributos.ATR_id`
* `PAI_PRO_proyectos.PRO_estado_val_id` → `PAI_VAL_valores.VAL_id`
* `PAI_PRO_proyectos.PRO_motivo_val_id` → `PAI_VAL_valores.VAL_id`
* `PAI_NOT_notas.NOT_proyecto_id` → `PAI_PRO_proyectos.PRO_id`
* `PAI_NOT_notas.NOT_tipo_val_id` → `PAI_VAL_valores.VAL_id`
* `PAI_NOT_notas.NOT_estado_val_id` → `PAI_VAL_valores.VAL_id`
* `PAI_PIP_pipeline.PIP_proyecto_id` → `PAI_PRO_proyectos.PRO_id`
* `PAI_PIP_pipeline.PIP_estado_val_id` → `PAI_VAL_valores.VAL_id`
* `PAI_ART_artefactos.ART_proyecto_id` → `PAI_PRO_proyectos.PRO_id`
* `PAI_ART_artefactos.ART_tipo_val_id` → `PAI_VAL_valores.VAL_id`

---