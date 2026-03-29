# Análisis Comparativo de Solapamientos: Planes de Implementación

## Tabla de Contenidos

1. [Tabla 1: Archivos Previsto Modificar en Ambos Planes](#tabla-1-archivos-previstos-modificar-en-ambos-planes)
2. [Tabla 2: Archivos Previsto Crear con Mismo Nombre](#tabla-2-archivos-previsto-crear-con-el-mismo-nombre-en-ambos-planes)
3. [Tabla 3: Evaluación de Paralelización y Riesgo](#tabla-3-resumen-de-evaluacion-de-paralelizacion-y-riesgo)
4. [Conclusión](#conclusión)

---

## Tabla 1: Archivos Previsto Modificar en Ambos Planes

| Archivo | wf-analisis-inmobiliario | notas-proyecto |
|---------|--------------------------|----------------|
| `apps/frontend/src/types/pai.ts` | ✅ Sí (agregar tipos `AnalisisResult`, `ArtefactoAnalisis`) | ✅ Sí (agregar campos `asunto`, `estado_proyecto_creacion`, `esEditable`, `razonNoEditable` a interfaz `Nota`) |
| `apps/frontend/src/i18n/es-ES.ts` | ✅ Sí (agregar textos de análisis) | ❌ No mencionado explícitamente |
| `apps/frontend/src/i18n/en-US.ts` | ✅ Sí (agregar textos de análisis) | ❌ No mencionado explícitamente |
| `apps/worker/src/handlers/pai-proyectos.ts` | ✅ Sí (actualizar `handleEjecutarAnalisis()`) | ❌ No |
| `apps/worker/src/lib/openai-client.ts` | ✅ Sí (extender `executePrompt()` para múltiples placeholders) | ❌ No |
| `apps/frontend/src/pages/proyectos/DetalleProyecto.tsx` | ✅ Sí (integración con nuevo flujo) | ❌ No |
| `apps/frontend/src/components/pai/PestañasResultados.tsx` | ✅ Sí (agregar 7 nuevas pestañas de IA) | ❌ No |
| `apps/worker/src/handlers/pai-notas.ts` | ❌ No | ✅ Sí (implementar campos faltantes) |
| `apps/frontend/src/components/pai/FormularioNota.tsx` | ❌ No | ✅ Sí (agregar campo `asunto`) |
| `apps/frontend/src/components/pai/ListaNotas.tsx` | ❌ No | ✅ Sí (mostrar `asunto` y `estado_proyecto_creacion`) |
| `apps/frontend/src/components/pai/FormularioEditarNota.tsx` | ❌ No | ✅ Sí (agregar validaciones) |

---

## Tabla 2: Archivos Previsto Crear con el Mismo Nombre en Ambos Planes

| Archivo | wf-analisis-inmobiliario | notas-proyecto |
|---------|--------------------------|----------------|
| *Ningún archivo con nombre coincidente* | — | — |

**Observación:** Ambos planes prevén crear archivos nuevos, pero **ninguno comparte el mismo nombre**. No hay riesgo de creación duplicada.

---

## Tabla 3: Resumen de Evaluación de Paralelización y Riesgo

| Tipo | Archivo | Riesgo | Motivo | Impacto en Trabajo Paralelo |
|------|---------|--------|--------|----------------------------|
| **Modificación Compartida** | `apps/frontend/src/types/pai.ts` | 🔴 ALTO | Ambos planes modifican el mismo archivo para agregar tipos distintos: (1) wf-analisis agrega `AnalisisResult`, `ArtefactoAnalisis`, etc.; (2) wf-notas agrega campos a interfaz `Nota` (`asunto`, `estado_proyecto_creacion`). Riesgo de conflictos de merge si se tocan las mismas líneas o se solapan las adiciones. | **Requiere coordinación previa.** Se recomienda: (a) Acordar una estrategia de organización de tipos (ej: separar tipos de análisis en secciones distintas); (b) Establecer orden de merge; (c) Revisar tipos antes de cada push. |
| **Modificación + Creación** | `apps/frontend/src/i18n/es-ES.ts`, `en-US.ts` | 🟡 MEDIO | wf-analisis modifica estos archivos para agregar textos de análisis. wf-notas no lo menciona explícitamente en el plan, pero módulo de notas probablemente requerirá textos i18n (ej: "Agregar Nota", "Editar Nota", validaciones). Potencial conflicto si ambos agregan textos en la misma zona del archivo. | **Sin riesgo inmediato si se respeta la estructura.** Se recomienda: (a) Mantener secciones lógicas separadas (`pai.analisis.*`, `pai.notas.*`); (b) Coordinar agregar textos en orden para evitar conflictos de línea; (c) Realizar merge con cuidado. |
| **Modificación Backend (Distinct handlers)** | `apps/worker/src/handlers/pai-proyectos.ts` (wf-analisis) vs `pai-notas.ts` (wf-notas) | 🟢 BAJO | Ambos planes tocan handlers distintos: (1) wf-analisis modifica handler de proyectos para análisis; (2) wf-notas modifica handler de notas separado. No hay solapamiento directo de archivos. | **Sin conflicto.** Ambos pueden desarrollarse en paralelo sin interferencia. Archivos completamente independientes. |
| **Modificación Backend (Shared library)** | `apps/worker/src/lib/openai-client.ts` | 🟡 MEDIO | Solo wf-analisis modifica este archivo para extender `executePrompt()` al soporte de múltiples placeholders. wf-notas-proyecto no lo modifica. Cambio centralizado. | **Sin conflicto en paralelo:** wf-notas no toca este archivo. Sin embargo, si implementaciones futuras de notas requieren modificaciones a openai-client, necesitarán coordinación. Por ahora: Sin riesgo. |
| **Creación Frontend (Distinct componentes)** | `apps/frontend/src/components/pai/` | 🟢 BAJO | wf-analisis crea `BotonEjecutarAnalisis.tsx` (nuevo componente). wf-notas modifica `FormularioNota.tsx`, `ListaNotas.tsx`, `FormularioEditarNota.tsx` (componentes existentes). Archivos distintos. | **Sin conflicto.** Archivos y responsabilidades claramente separados. Pueden desarrollarse en paralelo sin interferencia. |
| **Creación Backend (Services separados)** | `apps/worker/src/services/ia-analisis-proyectos.ts` (wf-analisis) | 🟢 BAJO | wf-analisis crea servicio nuevo para análisis con IA. wf-notas no crea servicios new. Servicios completamente independientes. | **Sin conflicto.** Nuevas creaciones sin solapamiento. Ambos planes son independientes a nivel de servicios backend. |
| **Creación Types** | `apps/worker/src/types/analisis.ts` (wf-analisis) | 🟢 BAJO | wf-analisis crea archivo nuevo de tipos para análisis. wf-notas modifica `pai.ts` existente (tipos de notas). Archivos distintos. | **Sin conflicto.** Separación clara de tipos: análisis en archivo propio, notas en archivo propio. |
| **Documentación** | `01-notas-proyectos-pai-extraccion-completa.md`, `02-diagnostico-implementacion-notas.md` | 🟢 BAJO | Solo wf-notas modifica estos documentos. wf-analisis no toca documentación de notas. | **Sin conflicto.** Cada plan actualiza su propia documentación. |

---

## Conclusión

### Veredicto General: ⚠️ **COMPATIBLES PARA DESARROLLO EN PARALELO CON COORDINACIÓN LIMITADA**

#### Resumen de Hallazgos

**Riesgos Detectados:**

1. 🔴 **CRÍTICO - Modificación Compartida de `types/pai.ts`:** El único solapamiento real y potencialmente problemático es la modificación concurrente de `apps/frontend/src/types/pai.ts`. Ambos planes agregan tipos distintos a este archivo (análisis vs. notas). Existe riesgo de conflictos de merge.

2. 🟡 **MEDIO - Potencial en i18n:** Aunque wf-notas no lo menciona explícitamente, probablemente necesitará agregar textos multiidioma en `i18n/es-ES.ts` y `en-US.ts`. Esto coincide con wf-analisis. Sin embargo, usando buenas prácticas de organización (secciones separadas), el riesgo es bajo.

3. 🟢 **BAJO - Resto de Archivos:** Todos los demás archivos son completamente independientes (handlers distintos, componentes distintos, servicios distintos, tipos separados).

#### Recomendaciones para Paralelización Segura

| Acción | Prioridad | Descripción |
|--------|-----------|-------------|
| **1. Coordinación previa en `types/pai.ts`** | 🔴 CRÍTICA | Antes de iniciar ambos plans, establecer una estrategia de organización de tipos. Opciones: (a) Crear secciones comentadas (`// TIPOS ANÁLISIS`, `// TIPOS NOTAS`); (b) Separar interfaces por módulo dentro del mismo archivo; (c) Considerar archivo `types/analisis-tipos.ts` separado para tipos de análisis que no afecte pai.ts. |
| **2. Establecer orden de merge** | 🟡 MEDIA | Si ambos modifican `types/pai.ts`, acuerdar cuál se mergeará primero. El segundo debe rebasar (rebase) contra main antes de merge final para evitar conflictos. |
| **3. Dividir trabajo en i18n** | 🟡 MEDIA | Asignar secciones claras: wf-analisis usa claves como `pai.analisis.*`, wf-notas usa `pai.notas.*`. Implementar en orden acordado. |
| **4. Código review en tipos compartidos** | 🟡 MEDIA | Hacer code review cruzado de modificaciones a `types/pai.ts` para validar que no se pisan cambios. |
| **5. Integración diaria** | 🟢 BAJA | Realizar pull/merge frente a main al menos una vez al día para detectar conflictos temprano. |

#### Conclusión Final

**Los dos planes PUEDEN desarrollarse en paralelo sin riesgo significativo de pisadas**, siempre y cuando:

✅ Se coordine la modificación de `apps/frontend/src/types/pai.ts` antes de iniciar.  
✅ Se use un sistema de organización claro en archivos multiidioma (i18n).  
✅ Se realicen merges en orden establecido y se hagan rebase si es necesario.  
✅ Se implemente code review en puntos de contacto (types, i18n).

**Todas las demás modificaciones y creaciones son completamente independientes** y pueden ejecutarse simultáneamente sin interferencia.

**Tiempo de coordinación recomendado:** 30 minutos para definir estrategia de `types/pai.ts` e i18n.  
**Tiempo de desarrollo en paralelo:** 100% viable tras coordinación inicial.
