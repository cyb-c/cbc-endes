# Documento de concepto de proyecto — PAI

## Índice

1. Propósito del documento
2. Naturaleza document-first
3. Contexto general del proyecto
4. Problema que el proyecto busca resolver
5. Usuario principal y momento de uso
6. Qué es un PAI
7. Qué significa crear un proyecto
8. Recorrido funcional principal
9. Resultados analíticos y lectura humana
10. Estados, motivos y criterio del usuario
11. Notas, trazabilidad y memoria operativa
12. Identidad documental del inmueble
13. Eliminación, re-ejecución e historial
14. Alcance del frontend en esta fase
15. Valor del documento para perfiles técnicos y gerenciales
16. Archivos complementarios e inseparables del entendimiento del proyecto
17. Síntesis final
18. Anexo A — Aplicación de Pipeflow-PHP al proceso de análisis  

## 1. Propósito del documento

Este documento define el concepto del proyecto PAI desde una perspectiva document-first.

Su objetivo no es describir todavía una implementación técnica ni cerrar una arquitectura definitiva. Su función es establecer una base común, estable y legible del proyecto para que cualquier persona, técnica o no técnica, pueda entender con claridad:

* qué problema resuelve,
* para quién existe,
* cuál es su unidad principal de trabajo,
* cómo se recorre funcionalmente,
* qué papel tiene el análisis automático,
* y dónde interviene el juicio humano.

Este documento debe servir como referencia principal para alinear visión, producto, desarrollo y decisión. Parte del entendimiento construido en las iteraciones previas y lo consolida en una versión pensada para ser leída sin depender del contexto conversacional previo. 

## 2. Naturaleza document-first

El proyecto se plantea con enfoque document-first. Eso significa que el documento de concepto no es una descripción secundaria del sistema, sino el punto de partida desde el que después se podrán derivar decisiones funcionales, técnicas, de datos, de interfaz y de operación.

Este documento fija el lenguaje del proyecto, su intención, sus objetos principales, su flujo y sus límites. Los detalles estructurales de datos, identificación y ejemplo de entrada no se incrustan aquí como anexos internos, pero sí se reconocen explícitamente como materiales complementarios necesarios para el entendimiento completo del sistema. Esos materiales acompañan a este documento y forman parte integral de su lectura. 

## 3. Contexto general del proyecto

El proyecto se sitúa en un contexto de desarrollo sobre Cloudflare, trabajado desde un codespace y con apoyo de IA. Su objetivo funcional inicial es disponer de un frontend que permita a un usuario interno crear y trabajar proyectos de análisis inmobiliario, llamados PAI.

Ese frontend no se entiende como una simple pantalla de alta ni como un visor de datos. Se entiende como el punto de entrada a una unidad estructurada de análisis sobre un inmueble detectado en un portal inmobiliario. 

## 4. Problema que el proyecto busca resolver

El proyecto nace para resolver un problema muy concreto: la evaluación inicial de inmuebles potencialmente interesantes puede ser fragmentaria, manual, poco comparable y demasiado dependiente de la narrativa comercial del anuncio o de la intuición del analista.

El sistema PAI busca convertir ese punto de partida en una unidad de trabajo más ordenada, trazable y defendible. No pretende sustituir el criterio profesional del usuario. Pretende darle una estructura operativa que le permita pasar de un anuncio detectado a un proyecto analizable, con resultados legibles y con soporte para la valoración posterior.

Esa estructura no se limita a ordenar información. Su valor funcional consiste en traducir anuncios inmobiliarios heterogéneos en análisis estructurados y evaluables del activo desde diversos ángulos, de modo que el usuario pueda apoyar decisiones accionables sobre uso, inversión, explotación y optimización patrimonial sin depender exclusivamente de la presentación comercial del anuncio. En el producto mínimo viable, ese trabajo se concentra especialmente en activos y situaciones como local comercial, reconversión o cambio de uso y pisos utilizados como oficinas, siempre dentro del ámbito de València ciudad.  

## 5. Usuario principal y momento de uso

El usuario principal es un usuario interno de la empresa con función de asesoría. No se trata de un perfil genérico de administración ni de un consumidor final. Es una persona que trabaja con activos inmobiliarios en València ciudad y necesita valorar si un inmueble detectado merece seguimiento, revisión más profunda, uso comercial o descarte.

La herramienta aparece en un momento concreto del trabajo: después de localizar un inmueble que parece interesante y antes de tomar una decisión interna más fundada. Su valor está precisamente en estructurar ese tramo intermedio.

Además del usuario analítico principal, el entendimiento del proyecto ya contempla otros roles internos relacionados, como administrador del sistema, comercial y otros perfiles internos que puedan necesitar consultar, revisar o gestionar proyectos y resultados, aunque no sean el núcleo del uso analítico.

Junto a ello, el sistema no se limita a analizar el inmueble en abstracto. También produce lectura útil para tres perfiles de interesado o cliente potencial sobre los que el asesor puede estar trabajando: inversor, emprendedor u operador y propietario.

Por eso, aunque el producto mínimo viable se concibe como herramienta interna, su utilidad práctica se proyecta ya sobre casos en los que el asesor necesita trabajar para un propietario con un activo infrautilizado, para un inversor al que se le quiere presentar una oportunidad filtrada o para un operador que necesita valorar si el espacio sirve realmente para una actividad o para un cambio de uso.  

## 6. Qué es un PAI

Un PAI es una unidad formal de trabajo analítico sobre un inmueble.

No es solo un registro, no es solo un formulario y no es solo una carpeta documental. Es la combinación de:

* una identidad propia del inmueble dentro del sistema,
* unos datos básicos visibles,
* una fuente documental de origen,
* una serie de resultados analíticos generados,
* un historial de proceso,
* y un espacio para la intervención humana mediante lectura, notas, cambios de estado y motivos.

El PAI convierte un anuncio inmobiliario en un objeto de trabajo persistente y revisable. 

## 7. Qué significa crear un proyecto

Crear un proyecto significa que el usuario entra en la sección de proyectos, elige crear uno nuevo y pega el contenido de un archivo JSON (ej. adjunto: Ejemplo-modelo-info.json) con la información del inmueble extraida de un portal inmobiliario (Se llama IJSON para abreviar) de un anuncio inmobiliario de València ciudad. A partir de ese contenido, el sistema crea automáticamente un PAI.

Ese alta no se limita a guardar información. Según el entendimiento consolidado del proyecto, crear el PAI implica:

* interpretar el IJSON,
* ejecutar un análisis inicial contra la API de IA,
* poblar los datos básicos del proyecto,
* asignar un CII como identificador del inmueble,
* persistir el proyecto,
* conservar el IJSON original,
* y mostrar al usuario el formulario del PAI recién creado.

Por tanto, el proyecto nace ya como una entidad legible y utilizable, no como una entrada en bruto pendiente de interpretación. 

## 8. Recorrido funcional principal

El recorrido funcional principal del proyecto puede entenderse en cinco momentos.

### 8.1 Alta a partir de IJSON

El punto de entrada es un IJSON. El sistema recibe el contenido y desencadena el primer análisis, cuyo papel es transformar ese material de origen en un proyecto con datos básicos y forma legible. El ejemplo disponible muestra que el IJSON puede contener URL de origen, portal inmobiliario, id del anuncio, descripción, operación, tipo de inmueble, precio, superficies, ubicación, características, entorno y posibles usos mencionados, entre otros muchos datos.

### 8.2 Verificación del alta

Una vez creado, el usuario accede al formulario del proyecto y verifica que el alta ha salido bien. Esa verificación se apoya en ver el proyecto existente, con identidad propia, con sus datos básicos visibles, con estado inicial y con la posibilidad de continuar el trabajo.

Los campos básicos mostrados al usuario se entienden como datos visibles pero no corregibles manualmente. En este punto, la acción relevante no es editar el contenido extraído, sino decidir si el proyecto sigue adelante, se analiza o se elimina.

### 8.3 Ejecución del análisis completo

Desde el formulario del PAI, el usuario puede lanzar el análisis completo. Ese proceso recorre una secuencia de resultados analíticos y el sistema debe informar al usuario del avance, los errores y el resultado general de la ejecución.

El estado de procesando análisis cubre el flujo desde que se pega el IJSON hasta que el proceso termina en error o como finalizado, según la definición cerrada en la conversación.

### 8.4 Revisión de resultados

Cuando el análisis se completa, el usuario revisa los resultados en pantalla mediante pestañas. Esa revisión es humana. El sistema no interpreta por él el contenido final ni toma la decisión de negocio. Lo que hace es poner a disposición una estructura ordenada de lectura.

### 8.5 Decisión y seguimiento

Después de revisar resultados, el usuario puede dejar notas, cambiar estado, seleccionar un motivo y continuar el ciclo del activo según su criterio. El proyecto puede avanzar a fases posteriores de evaluación o seguimiento, o bien ser descartado. 

## 9. Resultados analíticos y lectura humana

El sistema distingue dos niveles analíticos.

El primero ocurre inmediatamente después de recibir el IJSON y sirve para interpretar la entrada y poblar el proyecto.

El segundo corresponde al análisis completo lanzado por el usuario, que genera una secuencia de resultados en formato Markdown. Dentro de esa secuencia, el Resumen ejecutivo se trata como el primer resultado analítico visible y, además, queda almacenado en un campo del proyecto. El resultado de datos transforma la información del IJSON a un formato legible para el usuario, y el resto de resultados se organiza en piezas analíticas posteriores.

La lectura se realiza en pestañas y en formato embellecido. El sistema obliga a una ejecución secuencial del análisis, pero no impone un patrón rígido de lectura al usuario. Esa lectura puede ser completa o selectiva, según lo que el usuario necesite confirmar para construir criterio.

Dentro de esa secuencia, la estructura analítica principal del proyecto debe entenderse también como una lectura del activo desde cuatro planos: activo físico, activo estratégico, activo financiero y activo regulado. Después de esos cuatro planos, el sistema incorpora una lectura específica según perfil decisor, orientada a inversor, emprendedor u operador y propietario. De ese modo, el análisis no se limita a describir el inmueble, sino que organiza la información para facilitar decisiones internas desde perspectivas de negocio distintas.  

## 10. Estados, motivos y criterio del usuario

El proyecto distingue claramente entre estados gestionados automáticamente por el sistema y estados gestionados manualmente por el usuario.

Los estados automáticos que han quedado fijados son:

* creado,
* procesando análisis,
* análisis con error,
* análisis finalizado.

Los estados manuales que han quedado fijados son:

* evaluando viabilidad,
* evaluando Plan Negocio,
* seguimiento comercial,
* descartado.

Estos estados manuales no son equivalentes entre sí. Evaluando viabilidad y evaluando Plan Negocio representan fases distintas con sentido funcional propio, y seguimiento comercial indica que el activo ha pasado de la fase de evaluación a acciones comerciales o de cliente.

Cada vez que el usuario cambia manualmente el estado, debe seleccionar siempre un motivo. Ese motivo queda congelado como parte del estado alcanzado y no puede modificarse después sin volver a cambiar el estado. Los motivos no sustituyen la valoración del usuario: la acompañan y la estructuran. Su papel es dar una explicación categorizada de por qué el proyecto continúa o por qué se descarta. Ese sistema de estados, motivos y valores se articula en el modelo complementario de tablas y campos. 

## 11. Notas, trazabilidad y memoria operativa

Las notas forman parte esencial del PAI. No son un extra documental. Son el mecanismo mediante el que el usuario añade lectura, justificación o memoria operativa al proyecto.

Las notas empiezan a tener sentido después de ejecutar el análisis. No pertenecen al momento inicial del alta. Se asocian al proyecto y al estado vigente en el momento de su creación. Una nota solo puede editarse mientras siga vigente el estado con el que fue creada. Cuando el proyecto cambia de estado, las notas asociadas al estado anterior dejan de ser editables.

Además, el concepto del proyecto ya incorpora tipos de nota como parte estable del sistema. El archivo complementario de modelo de datos recoge tipos como comentario, valoración, decisión y corrección IA, y esos tipos forman parte del entendimiento actual del proyecto. 

## 12. Identidad documental del inmueble

Cada inmueble se convierte en una unidad documental única mediante el CII, Código Id de Inmueble. El CII se compone de dos dígitos del año, dos del mes del alta y cuatro dígitos derivados del id del proyecto, con relleno a la izquierda. Su función no es solo técnica: también es el identificador principal de trabajo para el usuario, por encima del título del proyecto.

El CII organiza la estructura documental del proyecto. Existe una carpeta principal `analisis-inmuebles/` y dentro de ella una subcarpeta por proyecto cuyo nombre coincide con el CII. En esa subcarpeta se conserva el IJSON del proyecto como `CII.json` y se guardan los Markdown generados por el análisis, todos con prefijo `CII_`. El documento complementario de identificación y almacenamiento define también la estructura conjunta de carpeta, IJSON, Markdown y log del proyecto.

Esto refuerza una idea central: el PAI no es solo una ficha de interfaz, sino también una unidad documental organizada. 

## 13. Eliminación, re-ejecución e historial

El sistema admite eliminación de proyectos, pero el significado funcional de eliminar no es banal.

Eliminar un PAI implica borrar el registro principal del proyecto, sus notas, sus artefactos y su carpeta documental. Sin embargo, el pipeline no se elimina. En el pipeline debe quedar un registro que deje constancia de que el PAI fue borrado. Esto confirma que la trazabilidad del proyecto tiene valor incluso cuando el proyecto deja de existir operativamente.

El sistema también admite re-ejecución del análisis. Cuando se relanza, los archivos Markdown del proyecto se sustituyen, pero el IJSON original no se elimina. Además, debe quedar huella visible de que hubo ejecuciones previas a través del pipeline. Esa huella no es solo interna: el concepto ya prevé que el usuario pueda consultar el historial de ejecución desde una opción del menú lateral, accediendo al pipeline de cada proyecto. 

## 14. Alcance del frontend en esta fase

El foco del frontend en esta primera etapa debe mantenerse en el ciclo principal del PAI:

* creación del proyecto,
* visualización del formulario,
* ejecución del análisis,
* consulta de resultados,
* notas,
* cambio de estado,
* selección de motivo,
* re-ejecución,
* eliminación,
* y consulta de historial de ejecución.

La gestión de dominios y valores, aunque debe existir y ser funcional a nivel del MVP, se entiende aquí como capacidad asociada y secundaria, no como el centro del concepto de producto.

Además, la organización base de la interfaz puede entenderse ya mediante una estructura formada por barra superior, menú lateral izquierdo y área de trabajo principal. Esa estructura no define por sí sola la experiencia completa, pero sí fija una lógica espacial suficientemente estable para situar el módulo de Proyectos, el acceso al formulario del PAI, la navegación por resultados y la consulta del historial de ejecución.

En esta fase, el producto no debe plantearse como marketplace ni como producto transaccional. Su foco sigue siendo convertir anuncios en análisis estructurados, comparables y útiles para decisión interna, no gestionar operaciones inmobiliarias completas ni abrir todavía una capa comercial o de cliente final como núcleo del sistema.  

### 14.1 Qué no incluir en el producto mínimo viable

El alcance de esta fase también se aclara por exclusión. No deben incluirse como parte del producto mínimo viable:

* marketplace de inmuebles,
* gestión comercial completa,
* automatización avanzada con todos los municipios del área metropolitana,
* integraciones amplias con portales, scoring masivo o scraping a gran escala,
* simulación financiera exhaustiva o tasación formal,
* cobertura normativa profunda de todos los supuestos sectoriales desde el día 1,
* software como servicio multiproyecto complejo con paneles avanzados de gestión interna.

Además, en esta fase tampoco debe incluirse como prioridad:

* automatización masiva de captura de múltiples anuncios,
* producto orientado plenamente a cliente final,
* comparadores complejos de escenarios como núcleo del producto mínimo viable,
* funcionalidades ajenas a la cadena principal de creación de proyecto, ejecución de análisis y consulta de resultados Markdown.

Y tampoco debe incluirse en esta fase:

* ejecución parcial por módulos del proceso de análisis,
* relanzamiento aislado de un único análisis,
* versionado de prompts,
* versionado de resultados analíticos,
* colas de procesamiento,
* tareas programadas,
* y procesamiento en segundo plano como requisito de esta fase.

Estas exclusiones no son accesorias. Forman parte del cierre conceptual del alcance y ayudan a evitar que el MVP derive prematuramente hacia complejidades de operación, infraestructura o producto que no son necesarias para validar el núcleo funcional del sistema. 

## 15. Valor del documento para perfiles técnicos y gerenciales

Este documento debe servir a dos grandes perfiles y tiene valor distinto para cada uno.

Para el personal técnico, ofrece una definición funcional previa a la implementación. Permite entender qué representa un PAI, cuáles son sus objetos principales, qué recorrido espera el usuario y qué elementos son estructurales antes de decidir tecnología, interfaces, persistencia o integraciones.

Para el personal gerencial, ofrece una visión operativa del sentido del proyecto. Permite entender qué problema se resuelve, cuál es la lógica del producto, qué decisiones apoya y por qué el proyecto no es simplemente una extracción de datos ni un repositorio documental, sino una herramienta para transformar anuncios en unidades de decisión internas.

Para ambos perfiles, este documento cumple una función común: evitar que el proyecto se defina por piezas sueltas o por interpretaciones implícitas. 

## 16. Archivos complementarios e inseparables del entendimiento del proyecto

Este documento principal debe leerse acompañado de tres archivos complementarios. No son anexos accesorios. Forman parte integral del entendimiento completo del proyecto.

### 16.1 `modelo-tablas-campos-consulinmo.md`

Este archivo describe el modelo estructural de datos del proyecto. Su valor no está solo en enumerar tablas o campos, sino en explicar cómo se organizan las piezas persistentes del sistema y cómo se relacionan entre sí. Ahí aparecen como mínimo la tabla central de proyectos, la tabla de atributos, la tabla de valores, la tabla de notas, la bitácora de pipeline y la tabla de artefactos. También fija la convención de nombres `PAI_` y muestra cómo estados, motivos, tipos de nota y tipos de artefacto se resuelven mediante el esquema común de atributos y valores.

Su función dentro del proyecto es traducir el concepto funcional del PAI a una estructura persistente coherente. Su contenido es esencial para comprender cómo se sostienen en datos el estado actual del proyecto, su motivo, sus notas, su trazabilidad y sus artefactos. Su valor para el equipo es que evita que la comprensión funcional y la comprensión estructural diverjan.

### 16.2 `Sistema-Identificacion-Almacenamiento-Inmueble.md`

Este archivo explica cómo cada inmueble se convierte en una unidad documental única y organizada. Su función es definir la lógica del CII y cómo ese identificador estructura carpetas, nombres de archivo y persistencia de resultados. Describe la carpeta principal `analisis-inmuebles/`, la subcarpeta por CII, el uso de `CII.json`, el prefijo `CII_` en los Markdown y la regla de re-ejecución que sustituye Markdown pero conserva el JSON original.

Su valor es decisivo porque conecta la identidad funcional del proyecto con su identidad documental. Permite comprender que un PAI no es solo una entidad de base de datos ni solo una vista de UI, sino también un contenedor documental consistente.

### 16.3 `Ejemplo-modelo-info.json`

Este archivo muestra un ejemplo realista del tipo de IJSON que da origen al proyecto. Su función es materializar qué significa la entrada del sistema y qué riqueza informativa puede contener: portal de origen, url fuente, id de anuncio, título, descripción, operación, tipología, precio, superficies, localización, características, entorno, recursos disponibles, usos posibles y otra información del anuncio.

Su valor es doble. Para negocio y producto, permite entender qué información entra realmente al sistema. Para el equipo técnico, permite comprender el tipo de material a partir del cual se construye el PAI y se disparan los análisis posteriores. Sin este archivo, el concepto de “pegar un IJSON” quedaría demasiado abstracto.

### 16.4 Relación entre el documento principal y los complementarios

El documento principal define el sentido del sistema. Los archivos complementarios definen su soporte estructural, documental y ejemplificativo.

Por eso deben considerarse conjuntamente:

* este documento explica qué es el proyecto y cómo funciona,
* `modelo-tablas-campos-consulinmo.md` explica cómo se organiza su estructura persistente,
* `Sistema-Identificacion-Almacenamiento-Inmueble.md` explica cómo se organiza su identidad documental,
* y `Ejemplo-modelo-info.json` muestra el material real que da origen al flujo.

La comprensión completa del proyecto requiere los cuatro. 

## 17. Síntesis final

PAI es un sistema para convertir un anuncio inmobiliario expresado como IJSON en una unidad formal de trabajo analítico dentro de una aplicación. Esa unidad tiene identidad propia, conserva su origen documental, genera resultados analíticos legibles, mantiene trazabilidad de proceso y deja espacio a la decisión humana posterior. El sistema no reemplaza al asesor. Le da una estructura más ordenada, trazable y defendible para pasar de una oportunidad detectada a una evaluación interna con criterio.

Al mismo tiempo, esa estructura debe entenderse como un análisis organizado del activo desde varios planos y desde varios perfiles de lectura, orientado a apoyar decisiones sobre uso, inversión, explotación y optimización patrimonial dentro del alcance acotado del producto mínimo viable. Ese alcance se centra en una herramienta interna, no transaccional, sin marketplace, sin colas ni procesamiento en segundo plano como requisito de esta fase, y con especial atención a casos como local comercial, reconversión o cambio de uso y pisos utilizados como oficinas en València ciudad.

Este documento debe ser la base central de referencia del proyecto. A partir de él, y acompañado inseparablemente por los tres archivos complementarios citados, ya puede construirse el siguiente nivel de documentación doc-first sin perder contexto ni fragmentar el entendimiento del sistema.  

---