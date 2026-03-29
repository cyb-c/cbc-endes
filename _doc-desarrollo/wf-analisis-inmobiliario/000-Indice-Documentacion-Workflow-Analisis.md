# 000-Indice-Documentacion-Workflow-Analisis.md

---

## Índice Maestro de Documentación - Workflow de Análisis Inmobiliario

**Proyecto:** `cbc-endes`  
**Workflow:** Análisis Inmobiliario con IA Real (7 pasos)  
**Última actualización:** 2026-03-29  

---

## Documentación por Orden de Creación

| # | Documento | Ruta | Estado | Propósito |
|---|-----------|------|--------|-----------|
| 000 | **Índice de Documentación** | `000-Indice-Documentacion-Workflow-Analisis.md` | ✅ Completado | Navegación de todos los documentos |
| 001 | Concept Brief (v1) | `001-Concept-Brief-Workflow-Analisis-Inmobiliario.md` | ✅ Completado | Primera versión del Concept Brief |
| 002 | **Concept Brief (v2)** | `002-Concept-Brief-Workflow-Analisis-Inmobiliario-v2.md` | ✅ Completado | **Concept Brief aprobado con respuestas P04-P05** |
| 003 | **Reporte Sprint 1** | `003-Sprint1-Reporte-Verificacion-Prompts.md` | ✅ Completado | Verificación de prompts en R2 |
| 004 | **Especificación Técnica** | `004-Especificacion-Tecnica-Workflow-Analisis.md` | ✅ Completado | Arquitectura e implementación del backend |
| 005 | **Integración Frontend** | `005-Especificacion-Integracion-Frontend.md` | ✅ Completado | Integración UI y componentes |
| 006 | **Pruebas y Despliegue** | `006-Guia-Pruebas-Despliegue.md` | ✅ Completado | Estrategia de pruebas y deployment |

---

## Documentación por Fase

### Fase 1: Conceptualización

| Documento | Descripción |
|-----------|-------------|
| [002-Concept-Brief-v2.md](./002-Concept-Brief-Workflow-Analisis-Inmobiliario-v2.md) | Concept Brief aprobado con: estados del proyecto (1-8), 9 artefactos totales (2 en BD + 7 en R2), prompts existentes en R2, flujo de 7 pasos |

### Fase 2: Verificación (Sprint 1 - COMPLETADO)

| Documento | Descripción |
|-----------|-------------|
| [003-Sprint1-Reporte.md](./003-Sprint1-Reporte-Verificacion-Prompts.md) | Reporte de verificación de los 7 prompts en R2: estructura, placeholders, inputs (1 para pasos 1-4, 5 para pasos 5-7) |

### Fase 3: Implementación Backend (Sprint 2 - PENDIENTE)

| Documento | Descripción |
|-----------|-------------|
| [004-Especificacion-Tecnica.md](./004-Especificacion-Tecnica-Workflow-Analisis.md) | Especificación técnica del backend: servicio `ia-analisis-proyectos.ts`, endpoint `/api/pai/proyectos/:id/analisis`, persistencia en R2, registro en D1 |

### Fase 4: Implementación Frontend (Sprint 3 - PENDIENTE)

| Documento | Descripción |
|-----------|-------------|
| [005-Integracion-Frontend.md](./005-Especificacion-Integracion-Frontend.md) | Especificación de componentes frontend: botón condicional por estado, 9 pestañas, indicador de progreso, visualizador Markdown |

### Fase 5: Pruebas y Despliegue (Sprint 4 - PENDIENTE)

| Documento | Descripción |
|-----------|-------------|
| [006-Guia-Pruebas-Despliegue.md](./006-Guia-Pruebas-Despliegue.md) | Estrategia de pruebas (unitarias, integración, E2E), procedimiento de despliegue, verificación post-despliegue, rollback |

---

## Roadmap de Sprints

### Sprint 1: Verificación de Prompts en R2 ✅ COMPLETADO

**Entregables:**
- [x] Verificación de existencia de 7 prompts
- [x] Validación de estructura (1 input vs 5 inputs)
- [x] Reporte de verificación (003-Sprint1-Reporte.md)

**Documentación:**
- [003-Sprint1-Reporte-Verificacion-Prompts.md](./003-Sprint1-Reporte-Verificacion-Prompts.md)

---

### Sprint 2: Implementación del Backend - Core del Workflow 🔄 PENDIENTE

**Entregables:**
- [ ] Servicio `ia-analisis-proyectos.ts`
- [ ] Función `ejecutarPasoConIA()` con soporte multi-placeholder
- [ ] Función `ejecutarAnalisisConIA()` con flujo de 7 pasos
- [ ] Actualización de `handleEjecutarAnalisis()` en `pai-proyectos.ts`
- [ ] Extensión de `openai-client.ts` para múltiples placeholders
- [ ] Tipos TypeScript en `types/analisis.ts`

**Documentación:**
- [004-Especificacion-Tecnica-Workflow-Analisis.md](./004-Especificacion-Tecnica-Workflow-Analisis.md)

---

### Sprint 3: Implementación del Frontend - UI del Workflow 🔄 PENDIENTE

**Entregables:**
- [ ] Componente `BotonEjecutarAnalisis.tsx` con condicionalidad por estado
- [ ] Componente `ProgresoAnalisis.tsx` para indicador de pasos
- [ ] Actualización de `PestañasResultados.tsx` para 9 pestañas
- [ ] Hook `useProyectoDetalle.ts` para estado y acciones
- [ ] Servicio `pai-api.ts` para llamadas a API
- [ ] Textos i18n en `es-ES.ts` y `en-US.ts`

**Documentación:**
- [005-Especificacion-Integracion-Frontend.md](./005-Especificacion-Integracion-Frontend.md)

---

### Sprint 4: Integración, Pruebas y Despliegue 🔄 PENDIENTE

**Entregables:**
- [ ] Pruebas unitarias de backend y frontend
- [ ] Pruebas de integración de endpoints
- [ ] Pruebas E2E de flujo completo
- [ ] Despliegue en entorno dev
- [ ] Verificación post-despliegue
- [ ] Actualización de inventario (vía `inventariador`)

**Documentación:**
- [006-Guia-Pruebas-Despliegue.md](./006-Guia-Pruebas-Despliegue.md)

---

## Referencias Cruzadas

### Documentos de Gobernanza

| Documento | Ruta |
|-----------|------|
| Reglas del Proyecto | `/.governance/reglas_proyecto.md` |
| Inventario de Recursos | `/.governance/inventario_recursos.md` |

### Documentos de Conocimiento

| Documento | Ruta |
|-----------|------|
| Integración OpenAI API | `/_doc-desarrollo/doc-apoyo-conocimiento/integracion-openai-api.md` |
| Tracking Workflow | `/_doc-desarrollo/doc-apoyo-conocimiento/tracking-workflow.md` |

### Documentos Legado (FASE 2-3)

| Documento | Ruta |
|-----------|------|
| Especificación API PAI | `/_doc-desarrollo/Legado-archivo/proyecto-PIA/MapaRuta/Fase02/Especificacion_API_PAI.md` |
| Especificación Re-ejecución | `/_doc-desarrollo/Legado-archivo/proyecto-PIA/MapaRuta/Fase02/Especificacion_Reejecucion_Analisis.md` |
| Estados y Motivos PAI | `/_doc-desarrollo/Legado-archivo/proyecto-PIA/MapaRuta/Fase03/11_Estados_Motivos_PAI.md` |

### Concepto Original

| Documento | Ruta |
|-----------|------|
| Definición del Workflow | `/_doc-desarrollo/wf-analisis-inmobiliario/Definicion del wf analisis.md` |

---

## Glosario de Términos

| Término | Definición |
|---------|------------|
| **IJSON** | JSON del anuncio inmobiliario original, almacenado en R2 y D1 |
| **CII** | Código de Identificación de Inmueble, generado a partir del ID del proyecto |
| **PAI** | Proyectos de Análisis Inmobiliario |
| **Artefacto 1-2** | Resumen Ejecutivo y Datos Transformados (viven en `PAI_PRO_proyectos`) |
| **Artefactos 3-9** | 7 análisis de IA (viven en R2 como MD) |
| **Prompts 01-04** | Prompts que reciben 1 input (IJSON) |
| **Prompts 05-07** | Prompts que reciben 5 inputs (IJSON + 4 análisis) |
| **Estados 1-4** | Estados que permiten ejecutar análisis: CREADO, PROCESANDO_ANALISIS, ANALISIS_CON_ERROR, ANALISIS_FINALIZADO |
| **Estados 5-8** | Estados que NO permiten análisis: EVALUANDO_VIABILIDAD, EVALUANDO_PLAN_NEGOCIO, SEGUIMIENTO_COMERCIAL, DESCARTADO |

---

## Historial de Cambios

| Fecha | Documento | Cambio | Autor |
|-------|-----------|--------|-------|
| 2026-03-29 | 000-Indice | Creación del índice maestro | Agente Orquestador |
| 2026-03-29 | 001-Concept-Brief | Creación de primera versión | Agente Orquestador |
| 2026-03-29 | 002-Concept-Brief-v2 | Actualización con respuestas P04-P05 | Agente Orquestador |
| 2026-03-29 | 003-Sprint1-Reporte | Verificación de prompts en R2 | Agente Orquestador |
| 2026-03-29 | 004-Especificacion-Tecnica | Documentación de backend | Agente Orquestador |
| 2026-03-29 | 005-Integracion-Frontend | Documentación de frontend | Agente Orquestador |
| 2026-03-29 | 006-Guia-Pruebas-Despliegue | Documentación de pruebas y despliegue | Agente Orquestador |

---

**Estado de la Documentación:** ✅ **FASE DOCUMENT-FIRST COMPLETADA**

**Próximo Paso:** Esperar instrucciones para comenzar implementación del **Sprint 2: Backend - Core del Workflow**
