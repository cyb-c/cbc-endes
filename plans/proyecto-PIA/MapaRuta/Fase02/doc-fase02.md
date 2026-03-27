Basándome en el análisis de la FASE 2 del mapa de ruta y la documentación existente, presento la siguiente propuesta de documentación necesaria:

## Análisis de FASE 2: Backend - Core Funcional

### Hechos Confirmados

La FASE 2 tiene como objetivo implementar el backend funcional para el sistema PAI, incluyendo:

1. **Endpoints de API** - 8 endpoints para gestión de proyectos PAI
2. **Servicio de simulación de IA** - Generación de 10 archivos Markdown en R2
3. **Servicio de almacenamiento R2** - Ya implementado en FASE 1
4. **Servicio de pipeline/trazabilidad** - Ya implementado en FASE 1 (Starter Kit)

### Documentación Existente Relevante

- [`plans/proyecto-PIA/doc-base/DocumentoConceptoProyecto _PAI.md`](plans/proyecto-PIA/doc-base/DocumentoConceptoProyecto _PAI.md) - Concepto del proyecto y flujo funcional
- [`plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md) - Esquema de base de datos PAI
- [`plans/proyecto-PIA/doc-base/Ejemplo-modelo-info.json`](plans/proyecto-PIA/doc-base/Ejemplo-modelo-info.json) - Ejemplo de IJSON
- [`plans/proyecto-PIA/doc-base/Sistema-Identificacion-Almacenamiento-Inmueble.md`](plans/proyecto-PIA/doc-base/Sistema-Identificacion-Almacenamiento-Inmueble.md) - Sistema de identificación CII
- [`apps/worker/src/lib/r2-storage.ts`](apps/worker/src/lib/r2-storage.ts) - Librería R2 Storage (implementada en FASE 1)
- [`apps/worker/src/lib/pipeline-events.ts`](apps/worker/src/lib/pipeline-events.ts) - Librería Pipeline Events (implementada en FASE 1)

### Documentación Propuesta para FASE 2

| Nombre del documento | Descripción | Propósito dentro de la fase | Relación con otros documentos o recursos existentes |
|-------------------|-------------|------------------------|----------------------------------------------|
| `Especificacion_API_PAI.md` | Definición completa de los 8 endpoints de API para gestión de proyectos PAI, incluyendo métodos, rutas, parámetros, esquemas de request/response y códigos de estado HTTP | Proporcionar la especificación técnica necesaria para implementar los endpoints de API de forma consistente y alineada con las reglas del proyecto (R6: Convención de respuestas HTTP) | Se basa en el flujo funcional definido en [`DocumentoConceptoProyecto _PAI.md`](plans/proyecto-PIA/doc-base/DocumentoConceptoProyecto _PAI.md:88) y en las tablas PAI definidas en [`modelo-tablas-campos-consulinmo.md`](plans/proyecto-PIA/doc-base/modelo-tablas-campos-consulinmo.md). Integra con el sistema de pipeline events definido en [`pipeline-events.ts`](apps/worker/src/lib/pipeline-events.ts) |
| `Servicio_Simulacion_IA.md` | Especificación del servicio de simulación de IA que genera los 10 archivos Markdown en R2, incluyendo estructura del servicio, tipos de análisis, formato de archivos y manejo de errores | Definir cómo debe comportarse el servicio de simulación de IA para generar los artefactos de análisis, siguiendo el sistema de identificación CII definido en [`Sistema-Identificacion-Almacenamiento-Inmueble.md`](plans/proyecto-PIA/doc-base/Sistema-Identificacion-Almacenamiento-Inmueble.md) y usando la librería [`r2-storage.ts`](apps/worker/src/lib/r2-storage.ts) | Se integra con la librería [`r2-storage.ts`](apps/worker/src/lib/r2-storage.ts) implementada en FASE 1. Los tipos de análisis corresponden a los artefactos definidos en la migración [`005-pai-mvp-datos-iniciales.sql`](migrations/005-pai-mvp-datos-iniciales.sql) |
| `Integracion_Pipeline_Events_PAI.md` | Especificación de cómo integrar el sistema de pipeline events en las operaciones PAI, incluyendo qué eventos registrar en cada operación, mapeo de estados automáticos a eventos y estrategia de trazabilidad | Definir la estrategia de trazabilidad para las operaciones PAI, utilizando las funciones del Starter Kit de pipeline events implementadas en [`pipeline-events.ts`](apps/worker/src/lib/pipeline-events.ts) | Se basa en el Starter Kit implementado en [`plans/pipeline-eventos-starter-kit/`](plans/pipeline-eventos-starter-kit/00-RESUMEN.md:1). Mantiene la lógica de la sección "11. Notas, trazabilidad y memoria operativa" del concepto del proyecto |
| `Guia_Implementacion_Endpoints_PAI.md` | Guía de implementación para los endpoints PAI, incluyendo estructura de carpetas, patrones de implementación, integración con pipeline events y R2 storage | Proporcionar instrucciones prácticas para implementar los endpoints PAI siguiendo las reglas del proyecto (R1: No asumir valores no documentados, R2: Cero hardcoding, R4: Accesores tipados para bindings) | Se integra con [`Especificacion_API_PAI.md`](plans/proyecto-PIA/doc-base/Especificacion_API_PAI.md), [`Servicio_Simulacion_IA.md`](plans/proyecto-PIA/doc-base/Servicio_Simulacion_IA.md) y [`Integracion_Pipeline_Events_PAI.md`](plans/proyecto-PIA/doc-base/Integracion_Pipeline_Events_PAI.md). Usa las librerías [`pipeline-events.ts`](apps/worker/src/lib/pipeline-events.ts) y [`r2-storage.ts`](apps/worker/src/lib/r2-storage.ts) |
| `Especificacion_Reejecucion_Analisis.md` | Especificación del comportamiento de re-ejecución de análisis, incluyendo criterios para permitir re-ejecución, estrategia de preservación de artefactos, manejo de notas asociadas y actualización de trazabilidad | Definir cómo manejar la re-ejecución de análisis, incluyendo qué artefactos preservar y cómo actualizar la trazabilidad con el sistema de pipeline events | Se integra con [`Integracion_Pipeline_Events_PAI.md`](plans/proyecto-PIA/doc-base/Integracion_Pipeline_Events_PAI.md) y con la lógica de notas y estados definida en [`DocumentoConceptoProyecto _PAI.md`](plans/proyecto-PIA/doc-base/DocumentoConceptoProyecto _PAI.md). Usa la librería [`pipeline-events.ts`](apps/worker/src/lib/pipeline-events.ts) para registrar eventos de re-ejecución |

### Inferencias

1. **La librería R2 Storage ya está implementada** - No es necesario crear documentación adicional para el servicio de almacenamiento en R2, ya que [`r2-storage.ts`](apps/worker/src/lib/r2-storage.ts) proporciona todas las funciones necesarias.

2. **El sistema de pipeline events ya está implementado** - No es necesario crear documentación adicional para el servicio de pipeline, ya que [`pipeline-events.ts`](apps/worker/src/lib/pipeline-events.ts) proporciona todas las funciones necesarias.

3. **La estructura de carpetas para handlers PAI debe definirse** - Se recomienda seguir el patrón existente en [`apps/worker/src/handlers/`](apps/worker/src/handlers/menu.ts) para mantener consistencia.

### Dudas

1. **¿Es necesario crear un documento separado para la validación de IJSON?** - La validación de JSON podría incluirse en la especificación del endpoint de creación de proyecto o en un documento separado.

Si a JSON podría incluirse en la especificación del endpoint de creación de proyecto o en un documento separado

2. **¿Debe documentarse la estrategia de paginación para el listado de proyectos?** - La especificación de API debería incluir cómo se implementará la paginación.

si a La especificación de API debería incluir cómo se implementará la paginación.

### Recomendaciones

1. **Priorizar la especificación de API** - Este documento es crítico para la implementación de los endpoints y debería ser el primero en crearse.

2. **Alinear con las reglas del proyecto** - Todos los documentos deben seguir las reglas R1-R15 definidas en [`.governance/reglas_proyecto.md`](.governance/reglas_proyecto.md).

3. **Incluir ejemplos prácticos** - Cada documento debería incluir ejemplos de uso y casos de prueba para facilitar la implementación.

