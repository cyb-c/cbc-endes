# Plan de Pruebas End-to-End - PAI

**Fecha:** 28 de marzo de 2026  
**Fase:** FASE 4 - Integración y Pruebas  
**Versión:** 1.0

---

## Índice

1. [Introducción](#1-introducción)
2. [Objetivos de las Pruebas](#2-objetivos-de-las-pruebas)
3. [Casos de Prueba](#3-casos-de-prueba)
4. [Criterios de Aceptación](#4-criterios-de-aceptación)
5. [Procedimiento de Ejecución](#5-procedimiento-de-ejecución)
6. [Reporte de Resultados](#6-reporte-de-resultados)

---

## 1. Introducción

Este documento define los casos de prueba, criterios de aceptación y procedimientos para validar el flujo completo del sistema PAI.

### Objetivos

- Definir los casos de prueba para validar el flujo completo del sistema
- Establecer criterios de aceptación para cada caso de prueba
- Proporcionar procedimientos para ejecutar las pruebas
- Definir cómo se documentarán los resultados

### Reglas del Proyecto Aplicables

- **R10 (Estrategia de pruebas)**: Usar un framework de test apropiado que ejecute el código en el entorno real o emulado
- **R11 (Calidad de código antes de commit)**: Ejecutar linters y typechecks; el proyecto debe compilarse sin errores

---

## 2. Objetivos de las Pruebas

### 2.1. Objetivos Generales

- Validar que la integración frontend-backend funciona correctamente
- Verificar que todos los componentes del módulo PAI funcionan como se espera
- Asegurar que el flujo completo del sistema (creación → análisis → revisión → decisión) funciona correctamente
- Identificar y corregir errores antes del despliegue a producción

### 2.2. Objetivos Específicos

- Validar la creación de proyectos desde IJSON
- Verificar la ejecución de análisis completos (simulados)
- Confirmar la visualización de resultados en pestañas
- Validar la creación y edición de notas
- Verificar el cambio de estado del proyecto
- Confirmar la re-ejecución de análisis
- Validar la eliminación de proyectos

---

## 3. Casos de Prueba

### 3.1. Caso de Prueba 1: Creación de Proyecto desde IJSON

**ID:** TC-PAI-001  
**Título:** Crear un nuevo proyecto PAI desde un IJSON válido  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Descripción

El usuario debe poder crear un nuevo proyecto PAI pegando el contenido de un IJSON válido en el formulario de creación.

#### Precondiciones

- El backend está en ejecución
- El frontend está en ejecución
- El usuario tiene un IJSON válido

#### Pasos

1. Navegar a la página de listado de proyectos
2. Hacer clic en el botón "Crear Proyecto"
3. Pegar un IJSON válido en el campo de texto
4. Hacer clic en el botón "Crear Proyecto"
5. Verificar que el proyecto se crea correctamente

#### Resultados Esperados

- El proyecto se crea correctamente
- Se muestra un mensaje de éxito
- El usuario es redirigido a la página de detalle del proyecto
- El proyecto tiene el estado "Creado"
- El CII se genera correctamente

#### Criterios de Aceptación

- ☐ El proyecto se crea en la base de datos
- ☐ El CII se genera correctamente
- ☐ El estado inicial es "Creado"
- ☐ El IJSON se guarda en R2
- ☐ No hay errores en la consola del navegador

#### Datos de Prueba

Usar el IJSON de ejemplo de [`Ejemplo-modelo-info.json`](../../../plans/proyecto-PIA/doc-base/Ejemplo-modelo-info.json:1).

---

### 3.2. Caso de Prueba 2: Ejecutar Análisis Completo

**ID:** TC-PAI-002  
**Título:** Ejecutar el análisis completo de un proyecto PAI  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Descripción

El usuario debe poder ejecutar el análisis completo de un proyecto PAI desde la página de detalle.

#### Precondiciones

- El backend está en ejecución
- El frontend está en ejecución
- Existe un proyecto PAI con estado "Creado"

#### Pasos

1. Navegar a la página de detalle de un proyecto
2. Hacer clic en el botón "Ejecutar Análisis"
3. Verificar que el estado cambia a "En análisis"
4. Esperar a que el análisis se complete
5. Verificar que el estado cambia a "Análisis finalizado"

#### Resultados Esperados

- El análisis se ejecuta correctamente
- El estado cambia a "En análisis" durante la ejecución
- El estado cambia a "Análisis finalizado" al completar
- Se generan los 10 archivos Markdown en R2
- Los artefactos se muestran en la página de detalle

#### Criterios de Aceptación

- ☐ El estado cambia a "En análisis"
- ☐ El estado cambia a "Análisis finalizado"
- ☐ Se generan los 10 archivos Markdown en R2
- ☐ Los artefactos se muestran en la página de detalle
- ☐ No hay errores en la consola del navegador

---

### 3.3. Caso de Prueba 3: Visualizar Resultados del Análisis

**ID:** TC-PAI-003  
**Título:** Visualizar los resultados del análisis en pestañas  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Descripción

El usuario debe poder visualizar los resultados del análisis en diferentes pestañas en la página de detalle.

#### Precondiciones

- El backend está en ejecución
- El frontend está en ejecución
- Existe un proyecto PAI con análisis completado

#### Pasos

1. Navegar a la página de detalle de un proyecto con análisis completado
2. Hacer clic en cada pestaña de resultados
3. Verificar que el contenido se muestra correctamente

#### Resultados Esperados

- Todas las pestañas de resultados se muestran
- El contenido de cada pestaña se carga correctamente
- El contenido se muestra en formato Markdown
- No hay errores de carga

#### Criterios de Aceptación

- ☐ Se muestran todas las pestañas de resultados
- ☐ El contenido de cada pestaña se carga correctamente
- ☐ El contenido se muestra en formato Markdown
- ☐ No hay errores en la consola del navegador

---

### 3.4. Caso de Prueba 4: Crear Nota

**ID:** TC-PAI-004  
**Título:** Crear una nota asociada a un proyecto PAI  
**Prioridad:** Media  
**Tipo:** Funcional

#### Descripción

El usuario debe poder crear una nota asociada a un proyecto PAI.

#### Precondiciones

- El backend está en ejecución
- El frontend está en ejecución
- Existe un proyecto PAI

#### Pasos

1. Navegar a la página de detalle de un proyecto
2. Hacer clic en el botón "Añadir Nota"
3. Seleccionar un tipo de nota
4. Ingresar el autor
5. Ingresar el contenido de la nota
6. Hacer clic en el botón "Guardar Nota"
7. Verificar que la nota se crea correctamente

#### Resultados Esperados

- La nota se crea correctamente
- Se muestra un mensaje de éxito
- La nota se añade a la lista de notas
- La nota se muestra en orden cronológico inverso

#### Criterios de Aceptación

- ☐ La nota se crea en la base de datos
- ☐ La nota se muestra en la lista de notas
- ☐ La nota se muestra en orden cronológico inverso
- ☐ No hay errores en la consola del navegador

---

### 3.5. Caso de Prueba 5: Editar Nota

**ID:** TC-PAI-005  
**Título:** Editar una nota existente de un proyecto PAI  
**Prioridad:** Media  
**Tipo:** Funcional

#### Descripción

El usuario debe poder editar una nota existente mientras el estado del proyecto no haya cambiado.

#### Precondiciones

- El backend está en ejecución
- El frontend está en ejecución
- Existe un proyecto PAI con al menos una nota

#### Pasos

1. Navegar a la página de detalle de un proyecto con notas
2. Hacer clic en el botón "Editar" de una nota
3. Modificar el contenido de la nota
4. Hacer clic en el botón "Guardar Cambios"
5. Verificar que la nota se actualiza correctamente

#### Resultados Esperados

- La nota se actualiza correctamente
- Se muestra un mensaje de éxito
- El contenido actualizado se muestra en la lista de notas

#### Criterios de Aceptación

- ☐ La nota se actualiza en la base de datos
- ☐ El contenido actualizado se muestra en la lista de notas
- ☐ No hay errores en la consola del navegador

#### Escenario Negativo

Si el estado del proyecto ha cambiado desde que se creó la nota, el usuario no debe poder editarla.

1. Cambiar el estado del proyecto
2. Intentar editar una nota creada antes del cambio de estado
3. Verificar que se muestra un mensaje de error

#### Resultados Esperados (Escenario Negativo)

- Se muestra un mensaje de error indicando que la nota no se puede editar
- El formulario de edición no se abre

---

### 3.6. Caso de Prueba 6: Cambiar Estado del Proyecto

**ID:** TC-PAI-006  
**Título:** Cambiar el estado manual de un proyecto PAI  
**Prioridad:** Alta  
**Tipo:** Funcional

#### Descripción

El usuario debe poder cambiar el estado manual de un proyecto PAI seleccionando un estado y un motivo.

#### Precondiciones

- El backend está en ejecución
- El frontend está en ejecución
- Existe un proyecto PAI

#### Pasos

1. Navegar a la página de detalle de un proyecto
2. Hacer clic en el botón "Cambiar Estado"
3. Seleccionar un estado manual
4. Seleccionar un motivo (si aplica)
5. Ingresar una descripción (opcional)
6. Hacer clic en el botón "Cambiar Estado"
7. Verificar que el estado se actualiza correctamente

#### Resultados Esperados

- El estado se actualiza correctamente
- Se muestra un mensaje de éxito
- El nuevo estado se muestra en la página de detalle

#### Criterios de Aceptación

- ☐ El estado se actualiza en la base de datos
- ☐ El nuevo estado se muestra en la página de detalle
- ☐ El motivo se guarda correctamente (si aplica)
- ☐ No hay errores en la consola del navegador

---

### 3.7. Caso de Prueba 7: Re-ejecutar Análisis

**ID:** TC-PAI-007  
**Título:** Re-ejecutar el análisis de un proyecto PAI  
**Prioridad:** Media  
**Tipo:** Funcional

#### Descripción

El usuario debe poder re-ejecutar el análisis de un proyecto PAI, lo que debe sustituir los archivos Markdown pero conservar el IJSON original.

#### Precondiciones

- El backend está en ejecución
- El frontend está en ejecución
- Existe un proyecto PAI con análisis completado

#### Pasos

1. Navegar a la página de detalle de un proyecto con análisis completado
2. Hacer clic en el botón "Ejecutar Análisis"
3. Confirmar la re-ejecución
4. Verificar que el análisis se ejecuta correctamente

#### Resultados Esperados

- El análisis se ejecuta correctamente
- Los archivos Markdown se sustituyen
- El IJSON original se conserva
- Se muestra un mensaje de éxito

#### Criterios de Aceptación

- ☐ Los archivos Markdown se sustituyen en R2
- ☐ El IJSON original se conserva en R2
- ☐ No hay errores en la consola del navegador

---

### 3.8. Caso de Prueba 8: Eliminar Proyecto

**ID:** TC-PAI-008  
**Título:** Eliminar un proyecto PAI y sus artefactos  
**Prioridad:** Media  
**Tipo:** Funcional

#### Descripción

El usuario debe poder eliminar un proyecto PAI, lo que debe eliminar el registro del proyecto, sus notas, sus artefactos y su carpeta documental, pero mantener el registro en el pipeline.

#### Precondiciones

- El backend está en ejecución
- El frontend está en ejecución
- Existe un proyecto PAI

#### Pasos

1. Navegar a la página de detalle de un proyecto
2. Hacer clic en el botón "Eliminar Proyecto"
3. Confirmar la eliminación
4. Verificar que el proyecto se elimina correctamente

#### Resultados Esperados

- El proyecto se elimina correctamente
- Se muestra un mensaje de éxito
- El usuario es redirigido a la lista de proyectos
- El proyecto ya no aparece en la lista

#### Criterios de Aceptación

- ☐ El proyecto se elimina de la base de datos
- ☐ Las notas se eliminan de la base de datos
- ☐ Los artefactos se eliminan de la base de datos
- ☐ La carpeta documental se elimina de R2
- ☐ El registro en el pipeline se mantiene
- ☐ No hay errores en la consola del navegador

---

### 3.9. Caso de Prueba 9: Listar Proyectos con Filtros

**ID:** TC-PAI-009  
**Título:** Listar proyectos PAI con filtros y paginación  
**Prioridad:** Media  
**Tipo:** Funcional

#### Descripción

El usuario debe poder listar proyectos PAI aplicando filtros y paginación.

#### Precondiciones

- El backend está en ejecución
- El frontend está en ejecución
- Existen varios proyectos PAI

#### Pasos

1. Navegar a la página de listado de proyectos
2. Aplicar filtros (estado, tipo de inmueble, ciudad)
3. Verificar que los proyectos se filtran correctamente
4. Navegar entre páginas
5. Verificar que la paginación funciona correctamente

#### Resultados Esperados

- Los proyectos se listan correctamente
- Los filtros funcionan correctamente
- La paginación funciona correctamente
- Los contadores se actualizan correctamente

#### Criterios de Aceptación

- ☐ Los proyectos se listan correctamente
- ☐ Los filtros funcionan correctamente
- ☐ La paginación funciona correctamente
- ☐ Los contadores se actualizan correctamente
- ☐ No hay errores en la consola del navegador

---

### 3.10. Caso de Prueba 10: Ver Historial de Ejecución

**ID:** TC-PAI-010  
**Título:** Ver el historial de ejecución de un proyecto PAI  
**Prioridad:** Baja  
**Tipo:** Funcional

#### Descripción

El usuario debe poder ver el historial de ejecución de un proyecto PAI.

#### Precondiciones

- El backend está en ejecución
- El frontend está en ejecución
- Existe un proyecto PAI con al menos una ejecución de análisis

#### Pasos

1. Navegar a la página de detalle de un proyecto
2. Hacer clic en el botón "Ver Historial"
3. Verificar que el historial se muestra correctamente

#### Resultados Esperados

- El historial se muestra correctamente
- Los eventos se muestran en orden cronológico
- Los niveles de eventos se diferencian con colores

#### Criterios de Aceptación

- ☐ El historial se muestra correctamente
- ☐ Los eventos se muestran en orden cronológico
- ☐ Los niveles de eventos se diferencian con colores
- ☐ No hay errores en la consola del navegador

---

## 4. Criterios de Aceptación

### 4.1. Criterios Generales

- ☐ Todos los casos de prueba se ejecutan sin errores críticos
- ☐ La integración frontend-backend funciona correctamente
- ☐ No hay errores en la consola del navegador
- ☐ No hay errores en el backend
- ☐ El flujo completo del sistema funciona correctamente

### 4.2. Criterios Específicos por Componente

#### Frontend

- ☐ Todas las páginas cargan correctamente
- ☐ Todos los componentes se muestran correctamente
- ☐ Todos los formularios funcionan correctamente
- ☐ Todos los botones funcionan correctamente
- ☐ La navegación funciona correctamente

#### Backend

- ☐ Todos los endpoints responden correctamente
- ☐ Todos los endpoints manejan errores correctamente
- ☐ Todos los endpoints retornan datos correctos
- ☐ CORS está configurado correctamente

#### Integración

- ☐ El frontend se comunica correctamente con el backend
- ☐ Los datos se transfieren correctamente
- ☐ Los errores se manejan correctamente
- ☐ Los estados de carga se muestran correctamente

---

## 5. Procedimiento de Ejecución

### 5.1. Preparación

#### Paso 1: Verificar Entorno de Desarrollo

```bash
# Verificar que el backend está en ejecución
curl http://localhost:8787/api/health

# Verificar que el frontend está en ejecución
curl http://localhost:5173
```

#### Paso 2: Verificar Base de Datos

```bash
# Verificar que la base de datos tiene las tablas PAI
cd apps/worker
npx wrangler d1 execute db-cbconsulting --local --command "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'PAI_%'"
```

#### Paso 3: Verificar Bucket R2

```bash
# Verificar que el bucket R2 existe
cd apps/worker
npx wrangler r2 bucket list
```

### 5.2. Ejecución de Pruebas

#### Paso 1: Ejecutar Casos de Prueba

Ejecutar cada caso de prueba en el orden definido:

1. TC-PAI-001: Creación de Proyecto desde IJSON
2. TC-PAI-002: Ejecutar Análisis Completo
3. TC-PAI-003: Visualizar Resultados del Análisis
4. TC-PAI-004: Crear Nota
5. TC-PAI-005: Editar Nota
6. TC-PAI-006: Cambiar Estado del Proyecto
7. TC-PAI-007: Re-ejecutar Análisis
8. TC-PAI-008: Eliminar Proyecto
9. TC-PAI-009: Listar Proyectos con Filtros
10. TC-PAI-010: Ver Historial de Ejecución

#### Paso 2: Documentar Resultados

Para cada caso de prueba, documentar:

- Estado: Pasó / Falló / Bloqueado
- Observaciones: Comentarios sobre la ejecución
- Errores: Errores encontrados
- Capturas de pantalla: (opcional)

### 5.3. Verificación Post-Pruebas

#### Paso 1: Verificar Consola del Navegador

Abrir las herramientas de desarrollador del navegador y verificar:

1. No hay errores de JavaScript
2. No hay errores de red
3. No hay errores de carga de recursos

#### Paso 2: Verificar Logs del Backend

Verificar los logs del backend para identificar errores:

```bash
# Ver logs del backend en desarrollo
cd apps/worker
npm run dev
```

#### Paso 3: Verificar Base de Datos

Verificar que los datos se han guardado correctamente:

```bash
# Ver proyectos creados
cd apps/worker
npx wrangler d1 execute db-cbconsulting --local --command "SELECT * FROM PAI_PRO_proyectos"
```

---

## 6. Reporte de Resultados

### 6.1. Estructura del Reporte

El reporte de pruebas debe incluir:

1. Resumen Ejecutivo
2. Casos de Prueba Ejecutados
3. Resultados por Caso de Prueba
4. Errores Encontrados
5. Recomendaciones

### 6.2. Plantilla de Reporte

Usar la plantilla definida en [`06_Reporte_Pruebas.md`](./06_Reporte_Pruebas.md:1).

### 6.3. Criterios de Aprobación

La FASE 4 se considera aprobada si:

- Todos los casos de prueba de prioridad Alta pasan
- Al menos el 80% de los casos de prueba de prioridad Media pasan
- No hay errores críticos que bloqueen el flujo principal del sistema
- Los errores encontrados tienen un plan de corrección definido

---

## Referencias

- [`DocumentoConceptoProyecto _PAI.md`](../../../plans/proyecto-PIA/doc-base/DocumentoConceptoProyecto _PAI.md:1) - Documento de concepto del proyecto
- [`R02_MapadeRuta_PAI.md`](../../../plans/proyecto-PIA/comunicacion/R02_MapadeRuta_PAI.md:1) - Mapa de ruta del proyecto
- [`reglas_proyecto.md`](../../../.governance/reglas_proyecto.md:1) - Reglas del proyecto
- [`Ejemplo-modelo-info.json`](../../../plans/proyecto-PIA/doc-base/Ejemplo-modelo-info.json:1) - Ejemplo de IJSON

---

**Fin del Documento - Plan de Pruebas End-to-End**
