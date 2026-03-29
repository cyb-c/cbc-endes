# 002-Concept-Brief-Workflow-Analisis-Inmobiliario.md

---

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Problemática a Resolver](#2-problemática-a-resolver)
3. [Enfoque Propuesto](#3-enfoque-propuesto)
4. [Roadmap por Sprints](#4-roadmap-por-sprints)
5. [Hechos](#5-hechos)
6. [Inferencias](#6-inferencias)
7. [Dudas](#7-dudas)
8. [Recomendaciones](#8-recomendaciones)

---

## 1. Resumen Ejecutivo

Este documento presenta el **Concept Brief** para el desarrollo del **Workflow de Análisis Inmobiliario (WF-ANALISIS)**, un proceso de 7 pasos que ejecuta prompts de IA secuenciales para generar 7 artefactos Markdown asociados a proyectos de análisis inmobiliarios (PAI) en la aplicación `cbc-endes`.

Este workflow **reemplaza completamente** el análisis simulado existente implementado en FASE 2.

El workflow se integra con la infraestructura existente documentada en el inventario de recursos (v16.0) y debe cumplir con las reglas de gobernanza del proyecto, especialmente R1 (no asumir valores), R2 (cero hardcoding) y R15 (gestión de inventario).

---

## 2. Problemática a Resolver

### 2.1 Contexto Actual

El proyecto `cbc-endes` cuenta con:
- Un backend Worker (`wk-backend`) desplegado en Cloudflare
- Un frontend React (`pg-cbc-endes`) en Cloudflare Pages
- Almacenamiento R2 (`r2-cbconsulting`) para archivos de proyectos
- Integración con OpenAI ya implementada para creación de proyectos (KV + R2 prompts)
- Un endpoint existente `/api/pai/proyectos/:id/analisis` que ejecuta análisis simulado (10 artefactos)

### 2.2 Necesidad Identificada

Existe la necesidad de implementar un **nuevo workflow de análisis con IA real** que permita:
- Ejecutar un análisis completo de 7 pasos sobre un proyecto **ya creado**
- Generar 7 artefactos Markdown mediante prompts de IA (OpenAI Responses API)
- Los 7 artefactos nuevos se suman a 2 artefactos existentes ("Resumen Ejecutivo" y "Datos Transformados"), totalizando **9 artefactos**
- Mostrar los resultados únicamente cuando el análisis esté **completamente finalizado**

### 2.3 Estados del Proyecto PAI

Los estados residen en `PAI_VAL_valores` (VAL_atr_id = 1 para ATR_codigo = 'ESTADO_PROYECTO'):

| VAL_id | VAL_codigo | Descripción | ¿Permite Botón Análisis? |
|--------|------------|-------------|-------------------------|
| 1 | `CREADO` | Estado inicial del proyecto | ✅ Sí |
| 2 | `PROCESANDO_ANALISIS` | El análisis está en progreso | ✅ Sí |
| 3 | `ANALISIS_CON_ERROR` | El análisis anterior falló | ✅ Sí |
| 4 | `ANALISIS_FINALIZADO` | El análisis está completo y espera revisión | ✅ Sí |
| 5 | `EVALUANDO_VIABILIDAD` | El proyecto está siendo evaluado para viabilidad | ❌ No |
| 6 | `EVALUANDO_PLAN_NEGOCIO` | El proyecto está siendo evaluado para plan de negocio | ❌ No |
| 7 | `SEGUIMIENTO_COMERCIAL` | El proyecto está en seguimiento comercial | ❌ No |
| 8 | `DESCARTADO` | El proyecto fue descartado | ❌ No |

**Regla de disponibilidad del botón "Ejecutar Análisis":**
- **Habilitado:** `PRO_estado_val_id` en (1, 2, 3, 4) — estados anteriores a `EVALUANDO_VIABILIDAD`
- **Deshabilitado:** `PRO_estado_val_id` >= 5 — estados `EVALUANDO_VIABILIDAD` o superiores

### 2.4 Restricciones del Problema

| Restricción | Descripción |
|-------------|-------------|
| **Disponibilidad condicional** | El botón de análisis solo debe estar disponible para `PRO_estado_val_id` en (1, 2, 3, 4) |
| **Ejecución atómica** | Los resultados no deben mostrarse parcialmente; solo cuando los 7 pasos completan |
| **Sustitución completa** | Cada nueva ejecución reemplaza los 7 MD anteriores en R2 (los artefactos 1 y 2 viven en `PAI_PRO_proyectos`, no se ven afectados) |
| **Dependencias estrictas** | Pasos 5-7 requieren que los pasos 1-4 hayan completado exitosamente |
| **Persistencia en R2** | Los archivos MD deben guardarse en la subcarpeta del proyecto en R2 |
| **Lectura de IJSON desde R2** | El IJSON debe leerse desde R2 (`analisis-inmuebles/{CII}/{CII}.json`), no desde D1 |

---

## 3. Enfoque Propuesto

### 3.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Pages)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pantalla Edición Proyecto                           │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  Botón "Ejecutar Análisis"                   │    │   │
│  │  │  (habilitado si estado_id en 1,2,3,4)        │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  9 Pestañas (resultados MD embellecidos)     │    │   │
│  │  │  - 2 existentes: Resumen Ejecutivo,          │    │   │
│  │  │    Datos Transformados                       │    │   │
│  │  │  - 7 nuevas: Activos 1-4, Inversor,          │    │   │
│  │  │    Emprendedor, Propietario                  │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST /api/pai/proyectos/:id/analisis
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Worker)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Workflow Orchestrator                               │   │
│  │  1. Validar estado del proyecto (1,2,3,4)            │   │
│  │  2. Limpiar 7 MD anteriores (si existen)             │   │
│  │  3. Leer IJSON desde R2                              │   │
│  │  4. Leer prompts desde R2 (prompts-ia/)              │   │
│  │  5. Ejecutar pasos 1-4 (solo IJSON input)            │   │
│  │  6. Validar dependencias (IJSON + MD 1-4)            │   │
│  │  7. Ejecutar pasos 5-7 (5 inputs: IJSON + MD 1-4)    │   │
│  │  8. Persistir 7 MD en R2                             │   │
│  │  9. Actualizar pipeline_eventos                      │   │
│  │  10. Retornar resultados                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    R2 (r2-cbconsulting)                      │
│  analisis-inmuebles/{CII}/                                 │
│    ├── {CII}.json                    (IJSON original)      │
│    ├── {CII}_resumen-ejecutivo.md    (Artefacto 1 - Keep)  │
│    ├── {CII}_datos-transformados.md  (Artefacto 2 - Keep)  │
│    ├── {CII}_01_activo_fisico.md                           │
│    ├── {CII}_02_activo_estrategico.md                      │
│    ├── {CII}_03_activo_financiero.md                       │
│    ├── {CII}_04_activo_regulado.md                         │
│    ├── {CII}_05_inversor.md                                │
│    ├── {CII}_06_emprendedor_operador.md                    │
│    ├── {CII}_07_propietario.md                             │
│    └── {CII}_log.json                (Tracking)            │
│  prompts-ia/                                               │
│    ├── 00_CrearProyecto.json         (Existente)           │
│    ├── 01_ActivoFisico.json                                │
│    ├── 02_ActivoEstrategico.json                           │
│    ├── 03_ActivoFinanciero.json                            │
│    ├── 04_ActivoRegulado.json                              │
│    ├── 05_Inversor.json                                    │
│    ├── 06_EmprendedorOperador.json                         │
│    └── 07_Propietario.json                                 │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Componentes a Implementar

#### 3.2.1 Backend

| Componente | Responsabilidad |
|------------|-----------------|
| **Endpoint `/api/pai/proyectos/:id/analisis` (POST)** | Orquestar la ejecución del workflow (reemplaza implementación actual) |
| **Servicio `ia-analisis-proyectos.ts`** | Contener la lógica de los 7 pasos con IA real |
| **Validación de estado** | Verificar `PRO_estado_val_id` en (1, 2, 3, 4) |
| **Gestión de limpieza** | Eliminar 7 MD anteriores antes de nueva ejecución (los artefactos 1 y 2 no se tocan porque viven en `PAI_PRO_proyectos`, no en R2) |
| **Lectura de IJSON desde R2** | Cargar IJSON desde `analisis-inmuebles/{CII}/{CII}.json` |
| **Lectura de prompts** | Cargar prompts desde R2 (`prompts-ia/`) |
| **Ejecución secuencial** | Ejecutar pasos 1-4 (input: IJSON), validar dependencias, ejecutar 5-7 (input: IJSON + MD 1-4) |
| **Persistencia** | Guardar cada MD en R2 con naming convention consistente |
| **Tracking** | Registrar eventos en `pipeline_eventos` y generar `log.json` en R2 |

#### 3.2.2 Frontend

| Componente | Responsabilidad |
|------------|-----------------|
| **Botón "Ejecutar Análisis"** | Habilitar solo si `PRO_estado_val_id` en (1, 2, 3, 4); deshabilitar si >= 5 |
| **Indicador de progreso** | Mostrar número y nombre del paso actual durante ejecución |
| **9 Pestañas de resultados** | 2 existentes (Resumen Ejecutivo, Datos Transformados) + 7 nuevas pestañas |
| **Visualizador Markdown** | Integrar `VisualizadorMarkdown.tsx` para embellecer MD |
| **Manejo de error** | Notificar al usuario si el workflow falla |
| **Refresco de vista** | Actualizar UI tras finalización exitosa |

### 3.3 Flujo de Ejecución

```
1. Usuario pulsa "Ejecutar Análisis"
         │
         ▼
2. Validar estado_id en (1, 2, 3, 4)
         │
         ▼
3. ¿Existe ejecución anterior (7 MD en R2)?
   ├─ SÍ → Borrar 7 MD anteriores en R2 (artefactos 1 y 2 en BD no se tocan)
   └─ NO → Continuar
         │
         ▼
4. Leer IJSON desde R2 ({CII}.json)
         │
         ▼
5. Leer prompts desde R2 (prompts-ia/01-07)
         │
         ▼
6. Ejecutar Paso 1 (01_ActivoFisico) con input: IJSON
         │
         ▼
7. ¿Éxito Paso 1?
   ├─ NO → Detener, notificar error
   └─ SÍ → Continuar
         │
         ▼
8. Ejecutar Pasos 2, 3, 4 (secuencial, cada uno con input: IJSON)
         │
         ▼
9. ¿Éxito todos?
   ├─ NO → Conservar MD generados, notificar error
   └─ SÍ → Validar dependencias
         │
         ▼
10. ¿Existen IJSON + MD 1-4?
    ├─ NO → Detener, no ejecutar 5-7
    └─ SÍ → Continuar
          │
          ▼
11. Ejecutar Pasos 5, 6, 7 (secuencial, cada uno con input: IJSON + MD 1-4)
          │
          ▼
12. ¿Éxito todos?
    ├─ NO → Detener, notificar error
    └─ SÍ → Persistir 7 MD en R2
          │
          ▼
13. Refrescar UI → Mostrar 9 pestañas (2 de BD + 7 de R2)
```

### 3.4 Estructura de Inputs por Prompt

| Prompt | Inputs | Descripción |
|--------|--------|-------------|
| `01_ActivoFisico.json` | IJSON | Análisis del activo físico del inmueble |
| `02_ActivoEstrategico.json` | IJSON | Análisis estratégico del activo |
| `03_ActivoFinanciero.json` | IJSON | Análisis financiero |
| `04_ActivoRegulado.json` | IJSON | Análisis regulatorio/normativo |
| `05_Inversor.json` | IJSON + MD_01 + MD_02 + MD_03 + MD_04 | Perspectiva del inversor |
| `06_EmprendedorOperador.json` | IJSON + MD_01 + MD_02 + MD_03 + MD_04 | Perspectiva del emprendedor/operador |
| `07_Propietario.json` | IJSON + MD_01 + MD_02 + MD_03 + MD_04 | Perspectiva del propietario |

---

## 4. Roadmap por Sprints

### Sprint 1: Verificación de Prompts en R2

**Objetivo:** Verificar que los 7 prompts existen en el bucket R2 `r2-cbconsulting` y son accesibles

**Tareas:**
- [ ] Verificar existencia de los 7 prompts en R2 (`prompts-ia/`)
- [ ] Leer contenido de cada prompt para validar estructura
- [ ] Validar que prompts 05-07 están configurados para 5 inputs (IJSON + MD 1-4)
- [ ] Validar acceso a prompts desde el Worker
- [ ] Revisar prompts para entender contenido (son autoexplicativos)

**Criterios de aceptación:**
- Los 7 prompts están accesibles en `r2-cbconsulting/prompts-ia/`
- El Worker puede leer los prompts vía `r2_binding_01`
- Los prompts 05-07 están configurados para recibir 5 inputs (IJSON + MD 1-4)
- Contenido de prompts revisado y comprendido

**Entregables:**
- Reporte de verificación de prompts
- Prueba de lectura desde Worker

---

### Sprint 2: Implementación del Backend - Core del Workflow

**Objetivo:** Reemplazar el servicio de simulación de IA con el nuevo workflow de 7 pasos

**Tareas:**
- [ ] Crear servicio `ia-analisis-proyectos.ts` (reemplaza `simulacion-ia.ts`)
- [ ] Implementar validación de estado del proyecto (`PRO_estado_val_id` in (1,2,3,4))
- [ ] Implementar lógica de limpieza de 7 MD anteriores (conservar artefactos 1 y 2)
- [ ] Implementar lectura de IJSON desde R2 (`analisis-inmuebles/{CII}/{CII}.json`)
- [ ] Implementar ejecución secuencial de pasos 1-4 (input: IJSON)
- [ ] Implementar validación de dependencias
- [ ] Implementar ejecución secuencial de pasos 5-7 (input: IJSON + MD 1-4)
- [ ] Implementar persistencia de 7 MD en R2
- [ ] Implementar registro de eventos en `pipeline_eventos`
- [ ] Actualizar endpoint `/api/pai/proyectos/:id/analisis` (reemplazar llamada a `simulacion-ia.ts`)
- [ ] Implementar sistema de tracking con `generarLogJSON()`

**Criterios de aceptación:**
- El endpoint acepta POST con `{ forzar_reejecucion?: boolean }`
- Los 7 pasos se ejecutan en orden correcto
- Los 7 MD se guardan en R2 con naming convention consistente
- Los errores detienen la ejecución apropiadamente
- El tracking se registra en `pipeline_eventos` y `log.json` en R2

**Entregables:**
- Servicio `ia-analisis-proyectos.ts`
- Endpoint actualizado funcional (reemplaza simulación)
- Tests de integración del workflow

---

### Sprint 3: Implementación del Frontend - UI del Workflow

**Objetivo:** Actualizar la interfaz de usuario para el nuevo workflow

**Tareas:**
- [ ] Implementar condicionalidad del botón "Ejecutar Análisis" (`estado_id` in (1,2,3,4))
- [ ] Implementar indicador de progreso (número + nombre del paso)
- [ ] Implementar las 7 pestañas nuevas de resultados
- [ ] Integrar con 2 pestañas existentes (Resumen Ejecutivo, Datos Transformados)
- [ ] Integrar visualizador Markdown (`VisualizadorMarkdown.tsx`)
- [ ] Implementar manejo de estados de carga/error
- [ ] Implementar refresco de UI tras finalización
- [ ] Validar que no se muestren resultados parciales

**Criterios de aceptación:**
- Botón habilitado solo para `estado_id` en (1, 2, 3, 4)
- Botón deshabilitado para `estado_id` >= 5
- Progreso visible durante ejecución
- Resultados solo visibles tras completitud
- 9 pestañas muestran MD embellecidos (2 existentes + 7 nuevas)

**Entregables:**
- Componentes UI actualizados
- Integración con endpoint de análisis

---

### Sprint 4: Integración, Pruebas y Despliegue

**Objetivo:** Integrar backend y frontend, ejecutar pruebas E2E y desplegar

**Tareas:**
- [ ] Pruebas de integración backend-frontend
- [ ] Pruebas de cada casuística de error
- [ ] Pruebas de re-ejecución (limpieza de 7 MD, conservación de artefactos 1 y 2)
- [ ] Pruebas de condicionalidad del botón por estado
- [ ] Pruebas de lectura de IJSON desde R2
- [ ] Pruebas de inputs para prompts 05-07 (5 inputs)
- [ ] Actualizar documentación de contratos de servicio
- [ ] Despliegue del Worker actualizado
- [ ] Despliegue del Frontend actualizado
- [ ] Pruebas E2E en entorno de producción
- [ ] Invocar a `inventariador` para actualizar inventario

**Criterios de aceptación:**
- 100% de casos de prueba aprobados
- Despliegue exitoso en Cloudflare
- Inventario actualizado (vía `inventariador`)

**Entregables:**
- Reporte de pruebas
- Recursos desplegados
- Inventario actualizado (vía `inventariador`)

---

## 5. Hechos

| ID | Hecho | Fuente |
|----|-------|--------|
| H1 | El proyecto `cbc-endes` tiene un Worker backend (`wk-backend`) activo | Inventario v16.0 |
| H2 | El bucket R2 `r2-cbconsulting` está activo y operativo | Inventario v16.0 |
| H3 | Existe integración con OpenAI ya implementada (KV + R2 prompts) | Inventario v16.0, integracion-openai-api.md |
| H4 | El endpoint `/api/pai/proyectos/:id/analisis` ya existe (FASE 4) | Inventario v16.0, pai-proyectos.ts |
| H5 | Existe un sistema de tracking con `log.json` en R2 | tracking-workflow.md |
| H6 | La tabla `pipeline_eventos` existe para tracking de eventos | Inventario v16.0 |
| H7 | El frontend tiene componente `VisualizadorMarkdown.tsx` | Inventario v16.0 |
| H8 | Los prompts deben leerse desde `prompts-ia/` en R2 | CONCEPTO |
| H9 | El workflow consta de 7 pasos fijos y secuenciales | CONCEPTO |
| H10 | El botón de análisis tiene condicionalidad por estado (1,2,3,4 habilitado; >=5 deshabilitado) | CONCEPTO + G61_issue.md |
| H11 | Los resultados no deben mostrarse parcialmente | CONCEPTO |
| H12 | Cada nueva ejecución sustituye los 7 MD anteriores en R2 (artefactos 1 y 2 en BD no se ven afectados) | CONCEPTO + Respuesta Usuario P04 |
| H13 | El IJSON debe leerse desde R2 (`analisis-inmuebles/{CII}/{CII}.json`) | Respuesta Usuario P04 |
| H14 | Los prompts 05-07 reciben 5 inputs (IJSON + MD 1-4); prompts 01-04 reciben solo IJSON | Respuesta Usuario P04 |
| H15 | Existen 2 artefactos previos ("Resumen Ejecutivo", "Datos Transformados") que se conservan | Respuesta Usuario P04 |
| H16 | Total de artefactos: 9 (2 en BD + 7 nuevos en R2) | Respuesta Usuario P04 |
| H17 | Este workflow reemplaza completamente el análisis simulado existente | Respuesta Usuario P04 |
| H18 | Estados correctos: 1=CREADO, 2=PROCESANDO_ANALISIS, 3=ANALISIS_CON_ERROR, 4=ANALISIS_FINALIZADO, 5=EVALUANDO_VIABILIDAD, 6=EVALUANDO_PLAN_NEGOCIO, 7=SEGUIMIENTO_COMERCIAL, 8=DESCARTADO | Respuesta Usuario P04 |
| H19 | Los 7 prompts (01-07) ya existen en R2 (`prompts-ia/`) | Respuesta Usuario P05 |
| H20 | Los artefactos 1 y 2 NO están en `PAI_ART_artefactos`; viven en `PAI_PRO_proyectos` (`PRO_resumen_ejecutivo` y `PRO_ijson`) | Respuesta Usuario P05 |
| H21 | Los prompts son autoexplicativos; no se requiere documentación externa | Respuesta Usuario P05 |

---

## 6. Inferencias

| ID | Inferencia | Justificación |
|----|------------|---------------|
| I1 | Los 7 archivos de prompt JSON pueden no existir aún en R2 | El inventario v16.0 solo menciona `00_CrearProyecto.json`; los prompts 01-07 no están listados explícitamente |
| I2 | El servicio `simulacion-ia.ts` actual será reemplazado por `ia-analisis-proyectos.ts` | El nuevo workflow usa IA real en lugar de simulación |
| I3 | La estructura de nombres de archivos MD sigue patrón `{CII}_XX_*.md` | Coherencia con estructura R2 documentada en inventario |
| I4 | El servicio `ia-creacion-proyectos.ts` puede reutilizarse como referencia | Patrón similar de integración con OpenAI ya implementado |
| I5 | El KV `secretos-cbconsulting` será necesario para la API key de OpenAI | Los prompts requieren inferencia con OpenAI Responses API |
| I6 | Los artefactos 1 y 2 ("Resumen Ejecutivo", "Datos Transformados") se generan en la creación del proyecto | Se mencionan como "existentes en el form/proyecto" |

---

## 7. Dudas

| ID | Duda | Impacto | Estado |
|----|------|---------|--------|
| D1 | ¿Los 7 prompts (01-07) ya existen en R2 o deben crearse? | Alto - Bloquea Sprint 1 | ✅ **RESUELTA**: Los 7 prompts existen en `r2-cbconsulting/prompts-ia/` |
| D2 | ¿Cuál es la estructura exacta de los prompts 05-07 para aceptar 5 inputs? | Alto - Define implementación de pasos 5-7 | ✅ **RESUELTA**: La estructura existe y es autoexplicativa en cada archivo |
| D3 | ¿Los artefactos 1 y 2 ("Resumen Ejecutivo", "Datos Transformados") están registrados en `PAI_ART_artefactos`? | Alto - Afecta lógica de conservación | ✅ **RESUELTA**: NO están en `PAI_ART_artefactos`. El Artefacto 1 vive en `PRO_resumen_ejecutivo` y el Artefacto 2 en `PRO_ijson` (tabla `PAI_PRO_proyectos`) |
| D4 | ¿Existe documentación específica sobre el contenido de cada prompt (01-07)? | Alto - Sin contenido no pueden crearse los prompts | ✅ **RESUELTA**: No se requiere documentación externa; cada prompt en su archivo JSON es autoexplicativo |

---

## 8. Recomendaciones

### 8.1 Sobre los Prompts

**R1 - Verificar estructura de prompts 05-07:**
Aunque los prompts ya existen en R2, se debe verificar su estructura para confirmar cómo reciben los 5 inputs (IJSON + MD 1-4). Usar:
```bash
wrangler r2 object get r2-cbconsulting/prompts-ia/05_Inversor.json
```

**R2 - Revisar contenido de prompts:**
Cada prompt es autoexplicativo según confirmación del usuario. Revisar el contenido de los 7 prompts para comprender:
- Formato de input esperado
- Formato de output (Markdown)
- Instrucciones específicas de cada análisis

### 8.2 Sobre la Implementación

**R3 - Reutilizar patrón existente:**
El servicio `ia-creacion-proyectos.ts` puede servir como base para `ia-analisis-proyectos.ts`, manteniendo consistencia en:
- Uso del cliente OpenAI (`openai-client.ts`)
- Sistema de tracking (`tracking.ts`)
- Persistencia en R2 (`r2-storage.ts`)

**R4 - Naming convention para archivos MD:**
Se recomienda adoptar convención:
```
{CII}_01_activo_fisico.md
{CII}_02_activo_estrategico.md
{CII}_03_activo_financiero.md
{CII}_04_activo_regulado.md
{CII}_05_inversor.md
{CII}_06_emprendedor_operador.md
{CII}_07_propietario.md
```

**R5 - Manejo de errores:**
Implementar un sistema de rollback parcial que conserve los MD generados exitosamente antes del fallo, como especifica el CONCEPTO.

### 8.3 Sobre el Inventario

**R6 - Actualizar inventario post-implementación:**
Una vez completada la implementación, el orquestador debe invocar al `inventariador` para:
- Registrar cambio en endpoint `/api/pai/proyectos/:id/analisis` (ahora usa IA real en lugar de simulación)
- Actualizar lista de prompts en R2 (`prompts-ia/01-07` ya existen)
- Documentar nuevos 7 artefactos MD en R2
- Actualizar estructura de carpetas R2 si cambia
- Registrar que artefactos 1 y 2 viven en `PAI_PRO_proyectos` (no en `PAI_ART_artefactos`)

### 8.4 Sobre Pruebas

**R7 - Casos de prueba críticos:**
Priorizar pruebas de:
- Condicionalidad del botón por estado (1,2,3,4 vs >=5)
- Re-ejecución (limpieza de 7 MD, conservación de artefactos 1 y 2)
- Error en cada uno de los 7 pasos
- Validación de dependencias (pasos 5-7 con 5 inputs)
- Lectura de IJSON desde R2 (no desde D1)

### 8.5 Sobre Frontend

**R8 - 9 Pestañas totales:**
El frontend debe mostrar 9 pestañas:
1. Resumen Ejecutivo (existente)
2. Datos Transformados (existente)
3. Activo Físico (nueva)
4. Activo Estratégico (nueva)
5. Activo Financiero (nueva)
6. Activo Regulado (nueva)
7. Inversor (nueva)
8. Emprendedor Operador (nueva)
9. Propietario (nueva)

---

## Aprobación Requerida

Este Concept Brief requiere **aprobación del usuario** antes de proceder a la fase de **documentación document-first**.

**Todas las dudas han sido resueltas:**
- ✅ D1: Los 7 prompts existen en R2
- ✅ D2: La estructura de prompts 05-07 existe
- ✅ D3: Artefactos 1 y 2 viven en `PAI_PRO_proyectos` (no en `PAI_ART_artefactos`)
- ✅ D4: Los prompts son autoexplicativos

**Pendientes de aprobación:**
- [ ] Roadmap de Sprints aprobado
- [ ] Recomendaciones consideradas

---

**Fecha de creación:** 2026-03-29  
**Fecha de actualización:** 2026-03-29 (con respuestas del usuario P04 y P05)  
**Autor:** Agente Orquestador  
**Estado:** Pendiente de aprobación  
**Próximo paso:** Generación de documentación document-first (tras aprobación)
