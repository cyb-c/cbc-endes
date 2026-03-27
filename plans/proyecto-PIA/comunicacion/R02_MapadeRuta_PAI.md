# Mapa de Ruta - Proyecto PAI

**Versión:** 2.0  
**Fecha:** 27 de marzo de 2026  
**Propósito:** Mapa de ruta actualizado para el desarrollo del proyecto PAI con enfoque doc-first

---

## Índice de Contenidos

1. [Respuestas del Usuario Confirmadas](#1-respuestas-del-usuario-confirmadas)
2. [Hechos Confirmados](#2-hechos-confirmados)
3. [Inferencias](#3-inferencias)
4. [Dudas Resueltas](#4-dudas-resueltas)
5. [Recomendaciones](#5-recomendaciones)
6. [Mapa de Ruta Actualizado](#6-mapa-de-ruta-actualizado)
7. [Próximos Pasos Inmediatos](#7-próximos-pasos-inmediatos)

---

## 1. Respuestas del Usuario Confirmadas

### 1.1. Integración con IA
- **DECISIÓN**: Dejar para después de que esté plenamente desarrollada la parte de "Proyectos PAI"
- **SIMULACIÓN**: Crear un servicio ficticio que genere los 10 archivos en R2 cuando el usuario pegue el IJSON
- **POSTERIOR**: Implementar Workers AI de Cloudflare o API externa para inferencia

### 1.2. Almacenamiento de archivos
- **R2 Bucket**: Usar el existente `r2-cbconsulting` (creado recientemente por el usuario)
- **Política de acceso**: Privado, consultable solo desde la web-app

### 1.3. Autenticación y autorización
- **MVP**: Sin usuarios, sin login
- **Roles**: MVP con un único rol con acceso a todo

### 1.4. Escalabilidad y rendimiento
- **Volumen esperado**: 2-5 decenas por mes
- **Procesamiento en segundo plano**: SÍ, se requiere

### 1.5. Integraciones externas
- **DECISIÓN**: NO se requieren otras integraciones (mapas, servicios geográficos, APIs de portales inmobiliarios)

### 1.6. Pipeline de eventos
- **DECISIÓN**: Usar el Starter Kit de auditoría de eventos ubicado en [`plans/pipeline-eventos-starter-kit/`](plans/pipeline-eventos-starter-kit/00-RESUMEN.md:1)
- **CORRECCIÓN**: La implementación del Starter Kit elimina la necesidad de `PAI_PIP_pipeline`
- **NOTA**: Toda la lógica de la sección "11. Notas, trazabilidad y memoria operativa" debe mantenerse pero adaptada a `pipeline-eventos-starter-kit/`

### 1.7. Fases propuestas
- **DECISIÓN**: Las fases propuestas son razonables y adecuadas, pero esperar ajustes

### 1.8. Prompts de análisis
- **ESTADO**: Los prompts de análisis están ya definidos y viven en archivos JSON
- **DECISIÓN**: No se va a trabajar en esta etapa

---

## 2. Hechos Confirmados

### 2.1. Problema que el proyecto busca resolver (Sección 4 del documento)
- La evaluación inicial de inmuebles potencialmente interesantes es fragmentaria, manual, poco comparable y demasiado dependiente de la narrativa comercial del anuncio o de la intuición del analista.
- El sistema PAI busca convertir ese punto de partida en una unidad de trabajo más ordenada, trazable y defendible.
- El MVP se concentra especialmente en activos y situaciones como: local comercial, reconversión o cambio de uso y pisos utilizados como oficinas, siempre dentro del ámbito de València ciudad.

### 2.2. Usuario principal y contexto
- Usuario principal: usuario interno de la empresa con función de asesoría (NO perfil genérico de administración ni consumidor final).
- El usuario trabaja con activos inmobiliarios en València ciudad.
- Momento de uso: después de localizar un inmueble que parece interesante y antes de tomar una decisión interna más fundada.

### 2.3. Qué es un PAI
- Un PAI es una unidad formal de trabajo analítico sobre un inmueble.
- Combina: identidad propia, datos básicos visibles, fuente documental de origen, resultados analíticos generados, historial de proceso, y espacio para intervención humana.

### 2.4. Flujo funcional principal
1. **Alta a partir de IJSON**: Usuario pega contenido JSON (IJSON) del anuncio inmobiliario.
2. **Verificación del alta**: Usuario accede al formulario del proyecto y verifica.
3. **Ejecución del análisis completo**: Usuario lanza el análisis completo desde el formulario.
4. **Revisión de resultados**: Usuario revisa resultados en pestañas en formato Markdown.
5. **Decisión y seguimiento**: Usuario deja notas, cambia estado, selecciona motivo.

### 2.5. Estados del sistema
**Estados automáticos**: creado, procesando análisis, análisis con error, análisis finalizado.

**Estados manuales**: evaluando viabilidad, evaluando Plan Negocio, seguimiento comercial, descartado.

### 2.6. Estructura de datos confirmada
**Tablas principales**:
- [`PAI_PRO_proyectos`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:35): Tabla central del sistema
- [`PAI_ATR_atributos`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:86): Dominio común para atributos
- [`PAI_VAL_valores`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:113): Dominio común para valores
- [`PAI_NOT_notas`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:197): Notas asociadas al proyecto
- `pipeline_eventos`: Tabla del Starter Kit de auditoría (reemplaza `PAI_PIP_pipeline`)
- [`PAI_ART_artefactos`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:256): Artefactos asociados al proyecto

### 2.7. Sistema de identificación (CII)
- CII = 2 dígitos del año + 2 del mes del alta + 4 dígitos del ID del proyecto (con relleno a la izquierda).
- Estructura de carpetas: `analisis-inmuebles/CII/`
- Archivos: `CII.json` (IJSON original), `CII_*.md` (Markdowns de análisis), `CII_log.json`

### 2.8. Estado actual del proyecto cbc-endes
- Worker backend: `wk-backend` (activo)
- D1 Database: `db-cbconsulting` (activa)
- Pages frontend: `pg-cbc-endes` (activo)
- Menú dinámico v1 ya desplegado
- R2 Bucket: `r2-cbconsulting` (activo, creado recientemente)
- **NO hay Workers AI configurado**
- **NO hay Workflows configurados**

### 2.9. Reglas de gobernanza aplicables
- R1: No asumir valores no documentados
- R2: Cero hardcoding
- R3: Gestión de secrets y credenciales
- R4: Accesores tipados para bindings
- R8: Configuración de despliegue
- R9: Migraciones de esquema de base de datos
- R15: Solo el agente `inventariador` puede actualizar [`inventario_recursos.md`](.governance/inventario_recursos.md:1)

---

## 3. Inferencias

### 3.1. Arquitectura requerida
- El proyecto PAI requerirá integración con una API de IA para ejecutar prompts de análisis (en fase posterior).
- Se necesitará almacenamiento de archivos (R2) para los artefactos Markdown y JSON.
- La base de datos D1 actual (`db-cbconsulting`) necesitará ampliación con las tablas PAI.
- El frontend actual (TailAdmin) necesitará nuevas páginas/componentes para gestión de proyectos PAI.

### 3.2. Flujo de trabajo técnico
1. Frontend recibe IJSON del usuario → envía a backend
2. Backend valida y crea registro en `PAI_PRO_proyectos`
3. Backend invoca servicio de simulación de IA (en esta fase)
4. Backend genera CII y crea estructura de archivos en R2
5. Backend actualiza estado del proyecto
6. Frontend muestra resultados en pestañas

### 3.3. Prioridades de implementación
- La estructura de base de datos es crítica y debe implementarse primero.
- La integración con el Starter Kit de pipeline de eventos es esencial para la trazabilidad.
- El almacenamiento en R2 es necesario para la persistencia de artefactos.

---

## 4. Dudas Resueltas

### 4.1. Integración con IA
- **RESUELTO**: Dejar para después. Crear un simulador ficticio que genere los 10 archivos en R2 cuando el usuario pegue el IJSON.
- **RESUELTO**: Los prompts de análisis están ya definidos y viven en archivos JSON, pero eso no se va a trabajar en esta etapa.

### 4.2. Almacenamiento de archivos
- **RESUELTO**: Usar el R2 Bucket existente `r2-cbconsulting`.
- **RESUELTO**: Política de acceso privado, consultable solo desde la web-app.

### 4.3. Autenticación y autorización
- **RESUELTO**: MVP sin usuarios, sin login.
- **RESUELTO**: MVP con un único rol con acceso a todo.

### 4.4. Escalabilidad y rendimiento
- **RESUELTO**: Volumen esperado de 2-5 decenas por mes.
- **RESUELTO**: Sí se requiere procesamiento en segundo plano o colas.

### 4.5. Integraciones externas
- **RESUELTO**: NO se requieren otras integraciones (mapas, servicios geográficos, APIs de portales inmobiliarios).

### 4.6. Pipeline de eventos
- **RESUELTO**: Usar el Starter Kit de auditoría de eventos ubicado en [`plans/pipeline-eventos-starter-kit/`](plans/pipeline-eventos-starter-kit/00-RESUMEN.md:1).
- **RESUELTO**: La implementación del Starter Kit elimina la necesidad de `PAI_PIP_pipeline`.
- **RESUELTO**: Toda la lógica de la sección "11. Notas, trazabilidad y memoria operativa" debe mantenerse pero adaptada a `pipeline-eventos-starter-kit/`.

---

## 5. Recomendaciones

### 5.1. Recomendaciones de arquitectura
- **R1**: Implementar primero el esquema de base de datos completo con migraciones numeradas.
- **R2**: Usar el R2 Bucket existente `r2-cbconsulting` para almacenamiento de artefactos PAI.
- **R3**: Implementar servicio de simulación de IA para generar los 10 archivos Markdown (en esta fase).
- **R4**: Usar el Worker backend existente (`wk-backend`) como punto de entrada para endpoints PAI.
- **R5**: Aprovechar la estructura de menú dinámico ya desplegada para añadir módulo "Proyectos".
- **R6**: Implementar el Starter Kit de pipeline de eventos para trazabilidad completa.

### 5.2. Recomendaciones de implementación
- **R7**: Seguir el enfoque doc-first: documentar antes de implementar.
- **R8**: Implementar el flujo principal primero (alta → análisis → resultados), dejar funcionalidades secundarias para después.
- **R9**: Implementar trazabilidad completa desde el inicio usando el Starter Kit de pipeline.
- **R10**: Usar accesores tipados para bindings (R4 de reglas del proyecto).
- **R11**: No hardcodear valores sensibles (R2 de reglas del proyecto).

### 5.3. Recomendaciones de priorización
- **R12**: Priorizar la creación de proyectos y ejecución de análisis sobre funcionalidades avanzadas.
- **R13**: Implementar estados automáticos primero, luego estados manuales.
- **R14**: Implementar visualización de resultados en pestañas antes de funcionalidades de edición avanzada.

---

## 6. Mapa de Ruta Actualizado

### FASE 1: Preparación y Configuración

#### 1.1. Incorporar Sistema de Pipeline de Eventos
- **Acción**: Implementar el Starter Kit de auditoría de eventos ubicado en [`plans/pipeline-eventos-starter-kit/`](plans/pipeline-eventos-starter-kit/00-RESUMEN.md:1)
- **Guía**: Seguir [`07-guia-despliegue-autonoma.md`](plans/pipeline-eventos-starter-kit/07-guia-despliegue-autonoma.md:1)
- **Resultado**: Sistema de trazabilidad de eventos para PAI
- **NOTA**: Esta implementación elimina la necesidad de `PAI_PIP_pipeline`

#### 1.2. Ampliar esquema de base de datos
- Crear migración `003-pai-mvp.sql` con tablas PAI:
  - [`PAI_PRO_proyectos`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:35)
  - [`PAI_ATR_atributos`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:86)
  - [`PAI_VAL_valores`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:113)
  - [`PAI_NOT_notas`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:197)
  - `pipeline_eventos` (del Starter Kit)
  - [`PAI_ART_artefactos`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:256)
- Implementar migración en D1 `db-cbconsulting`
- Poblar datos iniciales (atributos, valores de estado, motivos, tipos)

#### 1.3. Configurar R2 Bucket
- **Bucket existente**: `r2-cbconsulting`
- Configurar política de acceso privado
- Implementar módulo para guardar/recuperar archivos

---

### FASE 2: Backend - Core Funcional

#### 2.1. Implementar endpoints de API para PAI
- `POST /api/pai/proyectos` - Crear proyecto desde IJSON
- `GET /api/pai/proyectos/:id` - Obtener detalles de proyecto
- `GET /api/pai/proyectos` - Listar proyectos (con filtros y paginación)
- `POST /api/pai/proyectos/:id/analisis` - Ejecutar análisis completo
- `GET /api/pai/proyectos/:id/artefactos` - Obtener artefactos
- `POST /api/pai/proyectos/:id/notas` - Crear nota
- `PUT /api/pai/proyectos/:id/notas/:notaId` - Editar nota
- `PUT /api/pai/proyectos/:id/estado` - Cambiar estado manual
- `DELETE /api/pai/proyectos/:id` - Eliminar proyecto
- `GET /api/pai/proyectos/:id/pipeline` - Obtener historial de ejecución

#### 2.2. Implementar servicio de simulación de IA
- Crear módulo que genere los 10 archivos Markdown en R2:
  - Resumen ejecutivo
  - Datos transformados
  - Análisis físico
  - Análisis estratégico
  - Análisis financiero
  - Análisis regulatorio
  - Lectura inversor
  - Lectura operador
  - Lectura propietario
  - Log del proceso
- Generar contenido ficticio pero estructurado
- Seguir sistema de identificación CII

#### 2.3. Implementar servicio de almacenamiento en R2
- Crear módulo para guardar/recuperar archivos en `r2-cbconsulting`
- Implementar estructura de carpetas: `analisis-inmuebles/CII/`
- Manejar re-ejecución de análisis (sustitución de Markdown, conservación de JSON)

#### 2.4. Implementar servicio de pipeline/trazabilidad
- **Integrar Starter Kit de auditoría de eventos**:
  - Implementar tabla `pipeline_eventos` (del Starter Kit)
  - Usar funciones del Starter Kit para registrar eventos
  - Eliminar la necesidad de `PAI_PIP_pipeline`
- **Mantener lógica de trazabilidad**:
  - Registrar eventos de proceso usando el Starter Kit
  - Implementar actualización de estados automáticos
  - Manejar errores y warnings
  - Mantener trazabilidad de cambios de estado
  - Soportar consulta de historial de ejecución
- **Adaptar sección "11. Notas, trazabilidad y memoria operativa"**:
  - Las notas se asocian al estado vigente del proyecto
  - Una nota solo puede editarse mientras siga vigente el estado con el que fue creada
  - El control de editabilidad puede contrastarse contra la trazabilidad de cambios de estado registrada en `pipeline_eventos`

---

### FASE 3: Frontend - Interfaz de Usuario

#### 3.1. Añadir módulo "Proyectos" al menú dinámico
- Configurar en `MOD_modulos_config` en D1
- Crear estructura de navegación según [`01_UI.md`](plans/proyecto-PIA/UI_Desglose/01_UI.md:1)

#### 3.2. Implementar sección Proyectos PAI
Basado en [`02_SeccionProyectos.md`](plans/proyecto-PIA/UI_Desglose/02_SeccionProyectos.md:1) y [`03_SeccionProyectos_Desglose.md`](plans/proyecto-PIA/UI_Desglose/03_SeccionProyectos_Desglose.md:1):

**Componentes a implementar**:
- **Banda de control** (`section header`)
  - Título de pantalla (`page title`)
  - Contexto resumido (`supporting context text`)
  - Acciones primarias (`primary action group`):
    - Crear nuevo proyecto (`primary CTA`)
    - Operaciones globales (`global actions cluster`)
  - Resumen operativo (`overview strip`):
    - Conteo visible (`result counter`)
    - Estado del conjunto (`dataset state hint`)

- **Banda de búsqueda y filtros** (`filter toolbar`)
  - Búsqueda directa (`search module`):
    - Campo de entrada (`search input`)
    - Reducción dinámica (`live result narrowing`)
  - Filtros principales (`primary filters cluster`)
  - Filtros complementarios (`secondary filters cluster`)
  - Ordenación (`sort control group`)
  - Reinicio de filtros (`reset control`)

- **Listado / tabla de proyectos** (`data grid`)
  - Filas de proyecto (`data rows`)
  - Estructura de columnas (`column schema`)
  - Acceso al detalle (`row navigation layer`)
  - Continuidad de trabajo (`resume workflow entry`)
  - Lectura comparativa (`comparative scan layer`)
  - Priorización implícita (`implicit ranking cue`)

- **Navegación de resultados** (`pagination footer`)
  - Paginación (`pagination control`)
  - Posición actual (`position indicator`)
  - Tamaño de página (`page size selector`)
  - Continuidad de revisión (`review pacing aid`)
  - Persistencia de contexto (`state persistence layer`)

#### 3.3. Implementar formulario de creación de proyecto
- Campo para pegar IJSON
- Validación de JSON
- Confirmación de creación
- Generación de CII

#### 3.4. Implementar página de detalle de proyecto PAI
Basado en [`01_UI.md`](plans/proyecto-PIA/UI_Desglose/01_UI.md:38):

**Secciones a implementar**:
- **Cabecera del PAI**
  - CII + título + estado + acciones

- **Datos básicos del inmueble** (solo lectura)
  - Portal (nombre + enlace)
  - Operación
  - Tipo de inmueble
  - Precio
  - Superficie
  - Ubicación
  - Fechas (alta, análisis)

- **Resumen ejecutivo**
  - Contenido Markdown generado

- **Resultados del análisis** (pestañas)
  - Resumen ejecutivo
  - Datos transformados
  - Análisis físico
  - Análisis estratégico
  - Análisis financiero
  - Análisis regulatorio
  - Lectura inversor
  - Lectura operador
  - Lectura propietario

- **Notas / Historial**
  - Sección de notas (agregar, editar, listar)
  - Sección de historial de ejecución (pipeline)

- **Acciones**
  - Ejecutar análisis
  - Cambiar estado
  - Añadir nota
  - Re-ejecutar
  - Eliminar

#### 3.5. Implementar componentes de notas
- Formulario de creación de nota
- Lista de notas agrupadas por estado
- Edición de notas (solo mientras estado vigente)

#### 3.6. Implementar modal de cambio de estado
- Selección de estado manual
- Selección de motivo (obligatorio)
- Confirmación

---

### FASE 4: Integración y Pruebas

#### 4.1. Integrar frontend con backend
- Configurar endpoints en [`api.ts`](apps/frontend/src/lib/api.ts:1)
- Implementar hooks personalizados para PAI
- Manejar estados de carga y error

#### 4.2. Implementar internacionalización (i18n)
- Añadir textos en [`es-ES.ts`](apps/frontend/src/i18n/es-ES.ts:1)
- Preparar estructura para multiidioma

#### 4.3. Pruebas end-to-end
- Crear proyecto desde IJSON
- Ejecutar análisis completo (simulado)
- Revisar resultados en pestañas
- Crear notas
- Cambiar estado
- Re-ejecutar análisis
- Eliminar proyecto

---

### FASE 5: Despliegue y Documentación

#### 5.1. Desplegar backend actualizado
- Deploy de `wk-backend` con endpoints PAI
- Verificar funcionamiento

#### 5.2. Desplegar frontend actualizado
- Deploy de `pg-cbc-endes` con módulo Proyectos
- Verificar funcionamiento

#### 5.3. Actualizar inventario de recursos
- Solicitar al orquestador que invoque al inventariador
- Documentar nuevos recursos: endpoints, variables de entorno

#### 5.4. Documentación de usuario
- Guía de uso del sistema PAI
- Manual de referencia de estados y motivos

---

## 7. Próximos Pasos Inmediatos

1. **Confirmar aprobación** del mapa de ruta actualizado
2. **Iniciar FASE 1**: Incorporar Sistema de Pipeline de Eventos
3. **Continuar FASE 1**: Ampliar esquema de base de datos
4. **Configurar R2 Bucket**: Implementar módulo de almacenamiento

---

## Referencias

- [`DocumentoConceptoProyecto _PAI.md`](plans/proyecto-PIA/doc-base/DocumentoConceptoProyecto _PAI.md:1) - Documento de concepto del proyecto
- [`modelo-tablas-campos-consulinmo.md`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md:1) - Modelo de datos
- [`Sistema-Identificacion-Almacenamiento-Inmueble.md`](plans/proyecto-PIA/doc-base/Sistema-Identificacion-Almacenamiento-Inmueble.md:1) - Sistema de CII
- [`Ejemplo-modelo-info.json`](plans/proyecto-PIA/doc-base/Ejemplo-modelo-info.json:1) - Ejemplo de IJSON
- [`reglas_proyecto.md`](.governance/reglas_proyecto.md:1) - Reglas de gobernanza
- [`inventario_recursos.md`](.governance/inventario_recursos.md:1) - Estado actual de recursos
- [`pipeline-eventos-starter-kit/`](plans/pipeline-eventos-starter-kit/00-RESUMEN.md:1) - Starter Kit de auditoría de eventos
- [`01_UI.md`](plans/proyecto-PIA/UI_Desglose/01_UI.md:1) - Vista general UI
- [`02_SeccionProyectos.md`](plans/proyecto-PIA/UI_Desglose/02_SeccionProyectos.md:1) - Sección Proyectos
- [`03_SeccionProyectos_Desglose.md`](plans/proyecto-PIA/UI_Desglose/03_SeccionProyectos_Desglose.md:1) - Desglose de componentes
- [`R01.md`](plans/proyecto-PIA/comunicacion/R01.md:1) - Respuestas del usuario

---

**Fin del Mapa de Ruta**
