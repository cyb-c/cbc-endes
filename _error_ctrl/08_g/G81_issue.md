## Issue

Personalización global de UI y parametrización de elementos del layout principal

## Descripción

* Se requieren cambios de personalización sobre la UI general de la aplicación.
* La referencia principal es la imagen `_error_ctrl/08_g/G81.png`.
* La numeración de `_error_ctrl/08_g/G81.png` coincide explícitamente con los elementos descritos en `informe-elementos-ui.md`. 
* `informe-elementos-ui.png` es solo una guía/anexo del documento técnico, no la referencia principal para esta petición.
* Este issue afecta elementos globales del layout: cabecera, sidebar y bloque de usuario.
* Hay que evitar hardcoding para branding, logos, enlaces y visibilidad de elementos, salvo donde se indica expresamente que se acepta de forma temporal. 

## Referencia visual

* Imagen principal: `_error_ctrl/08_g/G81.png`
* Anexo técnico: `informe-elementos-ui.md`
* La relación entre numeración visual y cambios solicitados es explícita y debe respetarse en el issue.
* `informe-elementos-ui.png` solo sirve como apoyo visual del informe.

## Problemas detectados

* **[Referencia visual 1]**

  * Cambiar el título de la página.
  * Nuevo valor:

    * `Proyectos de Análisis Inmobiliarios • C&B Consulting`

* **[Referencia visual 2]**

  * Sustituir el logo y nombre actuales del template por los de la empresa.
  * Datos:

    * Logo empresa: `https://srrhhmx.s-ul.eu/BgmSpQcc`
    * Nombre empresa: `C&B Consulting`

* **[Referencia visual 4]**

  * Ocultar la búsqueda dentro de la aplicación.
  * No eliminar el componente ni su lógica.
  * Debe quedar deshabilitada visualmente, pero preparada para volver a mostrarse.

* **[Referencia visual 5]**

  * Ocultar el icono de notificaciones y su punto de acceso.
  * No eliminar.

* **[Referencia visual 6]**

  * Ocultar el panel desplegable de notificaciones y sus componentes internos.
  * No eliminar.

* **[Referencia visual 7]**

  * Sustituir la foto/avatar de usuario por un icono de usuario.
  * Mostrar como nombre:

    * `Asesor Inmobiliario`
  * Para este texto, se acepta hardcoding temporal según lo indicado por el requerimiento.

* **[Referencia visual 8]**

  * Ocultar el menú desplegable de usuario y sus componentes internos.
  * No eliminar.

* **[Referencia visual 9]**

  * Eliminar completamente este bloque.
  * No debe mostrarse nada de ese contenido en la UI.

* **[Referencia visual 10]**

  * Mover este elemento a la posición actual del **[Referencia visual 11]**.
  * Este bloque debe pasar a mostrar la información de la empresa desarrolladora.
  * Datos requeridos:

    * Logo empresa desarrolladora: `https://srrhhmx.s-ul.eu/D2Flxfr7`
    * Texto visible: `Diseño y desarrollo: PáginaVIVA`
    * Enlace: `https://www.paginaviva.net/`
    * El enlace debe abrir con `target="_blank"`

* **Configuración/parametrización**

  * Deben existir variables o alguna configuración centralizada para mostrar/ocultar los elementos que ahora deben quedar ocultos.
  * Estas variables podrán cambiar en el futuro.

## Comportamiento esperado

* **[Referencia visual 1]**

  * La página debe mostrar el título:

    * `Proyectos de Análisis Inmobiliarios • C&B Consulting`

* **[Referencia visual 2]**

  * El layout debe mostrar el logo y nombre de `C&B Consulting`.

* **[Referencia visual 4]**

  * La búsqueda no debe verse en la UI, pero debe seguir existiendo internamente.

* **[Referencia visual 5]**

  * El acceso visual a notificaciones no debe mostrarse.

* **[Referencia visual 6]**

  * El panel de notificaciones no debe estar visible ni disponible en la UI mientras esté oculto por configuración.

* **[Referencia visual 7]**

  * Debe mostrarse un icono de usuario genérico.
  * Debe mostrarse el nombre `Asesor Inmobiliario`.

* **[Referencia visual 8]**

  * El menú desplegable de usuario no debe mostrarse.

* **[Referencia visual 9]**

  * El bloque debe desaparecer completamente.

* **[Referencia visual 10]**

  * El bloque debe moverse abajo, a la posición del **[Referencia visual 11]**.
  * Debe mostrar el logo, texto y enlace de la empresa desarrolladora.

* Los elementos ocultados deben poder reactivarse sin tocar el código estructural del componente.

## Notas técnicas

* Evitar hardcoding para:

  * título de página
  * logo empresa
  * nombre empresa
  * logo empresa desarrolladora
  * texto empresa desarrolladora
  * enlace empresa desarrolladora
  * flags de visibilidad para elementos ocultables

* Se necesita un mecanismo de configuración centralizado, archivo de config o sistema equivalente para mantener estos valores de forma editable y reutilizable. 

* Los elementos marcados como “ocultar, no eliminar” deben seguir existiendo en código y poder activarse/desactivarse por configuración.

* El texto `Asesor Inmobiliario` puede resolverse temporalmente con hardcoding, porque el requerimiento lo permite expresamente.

* El enlace de la empresa desarrolladora debe abrir en nueva pestaña con `target="_blank"`.

* Este issue es de personalización global de UI, no de rediseño funcional ni de lógica de negocio.

## Resumen

* Se requiere adaptar el layout principal al branding de `C&B Consulting`.
* También hay que ocultar varios elementos del template sin eliminarlos.
* Debe eliminarse el bloque marcado como **[Referencia visual 9]**.
* Debe recolocarse y reutilizarse el bloque **[Referencia visual 10]** para mostrar la referencia de la empresa desarrolladora.
* Todo lo posible debe quedar parametrizado para evitar hardcoding y facilitar cambios futuros.

---