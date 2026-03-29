# 001-Concept-Brief-Workflow-Analisis-Inmobiliario.md

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

Este documento presenta el **Concept Brief** para el desarrollo del **Workflow de Análisis Inmobiliario** (WF-ANALISIS), un proceso de 7 pasos que ejecuta prompts de IA secuenciales para generar artefactos Markdown asociados a proyectos de análisis inmobiliarios (PAI) en la aplicación `cbc-endes`.

El workflow se integra con la infraestructura existente documentada en el inventario de recursos (v16.0) y debe cumplir con las reglas de gobernanza del proyecto, especialmente R1 (no asumir valores), R2 (cero hardcoding) y R15 (gestión de inventario).

---

## 2. Problemática a Resolver

### 2.1 Contexto Actual

El proyecto `cbc-endes` cuenta con:
- Un backend Worker (`wk-backend`) desplegado en Cloudflare
- Un frontend React (`pg-cbc-endes`) en Cloudflare Pages
- Almacenamiento R2 (`r2-cbconsulting`) para archivos de proyectos
- Integración con OpenAI ya implementada para creación de proyectos

### 2.2 Necesidad Identificada

Existe la necesidad de implementar un **segundo workflow** que permita:
- Ejecutar un análisis completo de 7 pasos sobre un proyecto **ya creado**
- Generar 7 artefactos Markdown que representan diferentes perspectivas de análisis
- Mostrar los resultados únicamente cuando el análisis esté **completamente finalizado**

### 2.3 Restricciones del Problema

| Restricción | Descripción |
|-------------|-------------|
| **Disponibilidad condicional** | El botón de análisis solo debe estar disponible si el estado del proyecto es anterior a `EVALUANDO_VIABILIDAD` |
| **Ejecución atómica** | Los resultados no deben mostrarse parcialmente; solo cuando los 7 pasos completan |
| **Sustitución completa** | Cada nueva ejecución reemplaza todos los resultados anteriores |
| **Dependencias estrictas** | Pasos 5-7 requieren que los pasos 1-4 hayan completado exitosamente |
| **Persistencia en R2** | Los archivos MD deben guardarse en la subcarpeta del proyecto en R2 |

---

## 3. Enfoque Propuesto

### 3.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Pages)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pantalla Edición Proyecto                           │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  Botón "Análisis" (condicional por estado)   │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  7 Pestañas (resultados MD embellecidos)     │    │   │
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
│  │  1. Validar estado del proyecto                      │   │
│  │  2. Limpiar MD anteriores (si existen)               │   │
│  │  3. Leer IJSON desde R2                              │   │
│  │  4. Leer prompts desde R2 (prompts-ia/)              │   │
│  │  5. Ejecutar pasos 1-7 secuencialmente               │   │
│  │  6. Persistir MD en R2                               │   │
│  │  7. Actualizar pipeline_eventos                      │   │
│  │  8. Retornar resultados                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    R2 (r2-cbconsulting)                      │
│  analisis-inmuebles/{CII}/                                 │
│    ├── {CII}.json           (IJSON original)               │
│    ├── {CII}_01_activo_fisico.md                           │
│    ├── {CII}_02_activo_estrategico.md                      │
│    ├── {CII}_03_activo_financiero.md                       │
│    ├── {CII}_04_activo_regulado.md                         │
│    ├── {CII}_05_inversor.md                                │
│    ├── {CII}_06_emprendedor_operador.md                    │
│    ├── {CII}_07_propietario.md                             │
│    └── {CII}_log.json         (Tracking)                   │
│  prompts-ia/                                               │
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
| **Endpoint `/api/pai/proyectos/:id/analisis` (POST)** | Orquestar la ejecución del workflow |
| **Servicio `ia-analisis-proyectos.ts`** | Contener la lógica de los 7 pasos |
| **Validación de estado** | Verificar que el proyecto esté en estado permitido |
| **Gestión de limpieza** | Eliminar MD anteriores antes de nueva ejecución |
| **Lectura de prompts** | Cargar prompts desde R2 (`prompts-ia/`) |
| **Ejecución secuencial** | Ejecutar pasos 1-4, validar dependencias, ejecutar 5-7 |
| **Persistencia** | Guardar cada MD en R2 |
| **Tracking** | Registrar eventos en `pipeline_eventos` |

#### 3.2.2 Frontend

| Componente | Responsabilidad |
|------------|-----------------|
| **Botón "Análisis"** | Mostrar/ocultar según estado del proyecto |
| **Indicador de progreso** | Mostrar número y nombre del paso actual durante ejecución |
| **7 Pestañas de resultados** | Visualizar MD embellecidos (solo tras completitud) |
| **Manejo de error** | Notificar al usuario si el workflow falla |
| **Refresco de vista** | Actualizar UI tras finalización exitosa |

### 3.3 Flujo de Ejecución

```
1. Usuario pulsa "Análisis"
         │
         ▼
2. Validar estado < EVALUANDO_VIABILIDAD
         │
         ▼
3. ¿Existe ejecución anterior?
   ├─ SÍ → Borrar 7 MD anteriores
   └─ NO → Continuar
         │
         ▼
4. Leer IJSON desde R2
         │
         ▼
5. Leer prompts desde R2 (prompts-ia/)
         │
         ▼
6. Ejecutar Paso 1 (01_ActivoFisico)
         │
         ▼
7. ¿Éxito Paso 1?
   ├─ NO → Detener, notificar error
   └─ SÍ → Continuar
         │
         ▼
8. Ejecutar Pasos 2, 3, 4 (secuencial)
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
11. Ejecutar Pasos 5, 6, 7 (secuencial)
          │
          ▼
12. ¿Éxito todos?
    ├─ NO → Detener, notificar error
    └─ SÍ → Persistir todos los MD
          │
          ▼
13. Refrescar UI → Mostrar 7 pestañas
```

---

## 4. Roadmap por Sprints

### Sprint 1: Preparación de Prompts en R2

**Objetivo:** Cargar los 7 prompts en el bucket R2 `r2-cbconsulting`

**Tareas:**
- [ ] Verificar estructura de prompts JSON existentes (si existen)
- [ ] Crear/validar los 7 archivos de prompt:
  - `01_ActivoFisico.json`
  - `02_ActivoEstrategico.json`
  - `03_ActivoFinanciero.json`
  - `04_ActivoRegulado.json`
  - `05_Inversor.json`
  - `06_EmprendedorOperador.json`
  - `07_Propietario.json`
- [ ] Subir prompts a R2 en carpeta `prompts-ia/`
- [ ] Validar acceso a prompts desde el Worker

**Criterios de aceptación:**
- Los 7 prompts están accesibles en `r2-cbconsulting/prompts-ia/`
- El Worker puede leer los prompts vía `r2_binding_01`

**Entregables:**
- Prompts cargados en R2
- Prueba de lectura desde Worker

---

### Sprint 2: Implementación del Backend - Core del Workflow

**Objetivo:** Implementar la lógica de orquestación del workflow en el backend

**Tareas:**
- [ ] Crear servicio `ia-analisis-proyectos.ts`
- [ ] Implementar validación de estado del proyecto
- [ ] Implementar lógica de limpieza de MD anteriores
- [ ] Implementar lectura de IJSON desde R2
- [ ] Implementar ejecución secuencial de pasos 1-4
- [ ] Implementar validación de dependencias
- [ ] Implementar ejecución secuencial de pasos 5-7
- [ ] Implementar persistencia de MD en R2
- [ ] Implementar registro de eventos en `pipeline_eventos`
- [ ] Actualizar endpoint `/api/pai/proyectos/:id/analisis`

**Criterios de aceptación:**
- El endpoint acepta POST con `{ forzar_reejecucion?: boolean }`
- Los 7 pasos se ejecutan en orden correcto
- Los MD se guardan en R2 con naming convention consistente
- Los errores detienen la ejecución apropiadamente

**Entregables:**
- Servicio `ia-analisis-proyectos.ts`
- Endpoint actualizado funcional
- Tests de integración del workflow

---

### Sprint 3: Implementación del Frontend - UI del Workflow

**Objetivo:** Implementar la interfaz de usuario para disparar y visualizar el workflow

**Tareas:**
- [ ] Implementar condicionalidad del botón "Análisis" (estado < EVALUANDO_VIABILIDAD)
- [ ] Implementar indicador de progreso (número + nombre del paso)
- [ ] Implementar las 7 pestañas de resultados
- [ ] Integrar visualizador Markdown (`VisualizadorMarkdown.tsx`)
- [ ] Implementar manejo de estados de carga/error
- [ ] Implementar refresco de UI tras finalización
- [ ] Validar que no se muestren resultados parciales

**Criterios de aceptación:**
- Botón solo visible en estados permitidos
- Progreso visible durante ejecución
- Resultados solo visibles tras completitud
- 7 pestañas muestran MD embellecidos

**Entregables:**
- Componentes UI actualizados
- Integración con endpoint de análisis

---

### Sprint 4: Integración, Pruebas y Despliegue

**Objetivo:** Integrar backend y frontend, ejecutar pruebas E2E y desplegar

**Tareas:**
- [ ] Pruebas de integración backend-frontend
- [ ] Pruebas de cada casuística de error
- [ ] Pruebas de re-ejecución (sustitución de MD)
- [ ] Pruebas de condicionalidad del botón
- [ ] Actualizar documentación de contratos de servicio
- [ ] Despliegue del Worker actualizado
- [ ] Despliegue del Frontend actualizado
- [ ] Pruebas E2E en entorno de producción
- [ ] Invocar a `inventariador` para actualizar inventario

**Criterios de aceptación:**
- 100% de casos de prueba aprobados
- Despliegue exitoso en Cloudflare
- Inventario actualizado

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
| H3 | Existe integración con OpenAI ya implementada (KV + R2 prompts) | Inventario v16.0 |
| H4 | El endpoint `/api/pai/proyectos/:id/analisis` ya existe (FASE 4) | Inventario v16.0 |
| H5 | Existe un sistema de tracking con `log.json` en R2 | Inventario v16.0 |
| H6 | La tabla `pipeline_eventos` existe para tracking de eventos | Inventario v16.0 |
| H7 | El frontend tiene componente `VisualizadorMarkdown.tsx` | Inventario v16.0 |
| H8 | Los prompts deben leerse desde `prompts-ia/` en R2 | CONCEPTO |
| H9 | El workflow consta de 7 pasos fijos y secuenciales | CONCEPTO |
| H10 | El botón de análisis tiene condicionalidad por estado | CONCEPTO |
| H11 | Los resultados no deben mostrarse parcialmente | CONCEPTO |
| H12 | Cada ejecución sustituye completamente la anterior | CONCEPTO |

---

## 6. Inferencias

| ID | Inferencia | Justificación |
|----|------------|---------------|
| I1 | Los 7 archivos de prompt JSON **pueden no existir** aún en R2 | El inventario solo menciona `00_CrearProyecto.json`; los prompts 01-07 no están listados |
| I2 | El endpoint `/api/pai/proyectos/:id/analisis` actual **requiere modificación** | El CONCEPTO describe un comportamiento diferente al existente (7 pasos vs. análisis simple) |
| I3 | El estado `EVALUANDO_VIABILIDAD` **debe existir** en la tabla `PAI_VAL_valores` | El CONCEPTO lo referencia como umbral de disponibilidad del botón |
| I4 | La estructura de nombres de archivos MD sigue patrón `{CII}_XX_*.md` | Coherencia con estructura R2 documentada en inventario |
| I5 | El servicio `ia-creacion-proyectos.ts` existente **puede reutilizarse** como referencia | Patrón similar de integración con OpenAI |
| I6 | El KV `secretos-cbconsulting` **será necesario** para la API key de OpenAI | Los prompts requieren inferencia con OpenAI Responses API |

---

## 7. Dudas

| ID | Duda | Impacto | Requiere Confirmación |
|----|------|---------|----------------------|
| D1 | ¿Los 7 archivos de prompt JSON (`01_ActivoFisico.json` a `07_Propietario.json`) **ya existen** o deben crearse? | Alto - Bloquea Sprint 1 | **USUARIO** |
| D2 | ¿El contenido/estructura de los prompts es el mismo que el workflow anterior o son nuevos? | Alto - Define el diseño de los prompts | **USUARIO** |
| D3 | ¿El estado `EVALUANDO_VIABILIDAD` ya existe en `PAI_VAL_valores` con su `VAL_id` correspondiente? | Medio - Required para validación | **USUARIO** |
| D4 | ¿Qué estados específicos permiten la disponibilidad del botón? (lista completa de estados < `EVALUANDO_VIABILIDAD`) | Medio - Define lógica de condicionalidad | **USUARIO** |
| D5 | ¿El endpoint actual `/api/pai/proyectos/:id/analisis` debe **modificarse** o crearse uno nuevo? | Medio - Define estrategia de implementación | **USUARIO** |
| D6 | ¿Existe algún prompt template de referencia para los 7 pasos? | Alto - Sin prompts no puede implementarse | **USUARIO** |
| D7 | ¿Los prompts 05-07 usan exactamente la misma entrada (IJSON + MD 1-4) o hay variaciones entre ellos? | Medio - Afecta implementación de pasos 5-7 | **USUARIO** |

---

## 8. Recomendaciones

### 8.1 Sobre los Prompts

**R1 - Confirmar existencia de prompts:**
Antes de iniciar el Sprint 1, se debe confirmar si los 7 archivos de prompt ya existen en algún lugar (R2, repositorio local, documentación externa) o si deben ser creados desde cero.

**R2 - Estructura de prompts:**
Si los prompts deben crearse, se recomienda seguir la misma estructura que `00_CrearProyecto.json` (ya existente en R2) para mantener consistencia.

### 8.2 Sobre la Implementación

**R3 - Reutilizar patrón existente:**
El servicio `ia-creacion-proyectos.ts` puede servir como base para `ia-analisis-proyectos.ts`, manteniendo consistencia en:
- Uso del cliente OpenAI
- Sistema de tracking
- Persistencia en R2

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
- Registrar nuevos endpoints o cambios en contratos
- Actualizar estructura de carpetas R2 (si cambia)
- Documentar nuevos estados del proyecto (si aplican)

### 8.4 Sobre Pruebas

**R7 - Casos de prueba críticos:**
Priorizar pruebas de:
- Condicionalidad del botón por estado
- Re-ejecución (limpieza de MD anteriores)
- Error en cada uno de los 7 pasos
- Validación de dependencias (pasos 5-7)

---

## Aprobación Requerida

Este Concept Brief requiere **aprobación del usuario** antes de proceder a la fase de **documentación document-first**.

**Pendientes de confirmación:**
- [ ] Dudas D1-D7 resueltas
- [ ] Roadmap de Sprints aprobado
- [ ] Recomendaciones consideradas

---

**Fecha de creación:** 2026-03-29  
**Autor:** Agente Orquestador  
**Estado:** Pendiente de aprobación  
**Próximo paso:** Generación de documentación document-first (tras aprobación)
