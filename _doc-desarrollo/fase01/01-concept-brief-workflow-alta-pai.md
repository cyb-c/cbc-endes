# Concept Brief: Workflow de Alta de Proyectos PAI en Cloudflare

## Índice de Contenido

1. [Información del Documento](#información-del-documento)
2. [Resumen Ejecutivo](#resumen-ejecutivo)
3. [Contexto del Proyecto](#contexto-del-proyecto)
4. [Problemática a Resolver](#problemática-a-resolver)
5. [Objetivo del Workflow](#objetivo-del-workflow)
6. [Alcance y Límites](#alcance-y-límites)
7. [Requisitos Funcionales](#requisitos-funcionales)
8. [Requisitos No Funcionales](#requisitos-no-funcionales)
9. [Restricciones Técnicas](#restricciones-técnicas)
10. [Recursos Cloudflare Involucrados](#recursos-cloudflare-involucrados)
11. [Puntos de Decisión Pendientes](#puntos-de-decisión-pendientes)
12. [Recomendaciones Preliminares](#recomendaciones-preliminares)
13. [Próximos Pasos](#próximos-pasos)

---

## Información del Documento

| Campo | Valor |
|-------|-------|
| **Título** | Concept Brief: Workflow de Alta de Proyectos PAI |
| **Versión** | 1.0 |
| **Fecha** | 2026-03-28 |
| **Estado** | Pendiente de aprobación |
| **Fuente** | `_doc-desarrollo/fase01/Definición del workflow de alta de proyectos PAI en Cloudflare.md` |
| **Elaborado por** | Agente Cloudflare Deploy (vía análisis de CONCEPTO) |

---

## Resumen Ejecutivo

Se requiere implementar un **workflow de alta de proyectos PAI** en Cloudflare que permita a un usuario crear un proyecto de análisis inmobiliario mediante la única acción de pegar un IJSON (Inmueble JSON) en un formulario web-app.

El workflow procesará automáticamente el IJSON mediante **OpenAI API**, validará el resultado, creará el registro en la base de datos D1, generará el CII (Código de Identificación de Inmueble), organizará los artefactos en R2, y redirigirá al usuario al formulario de edición del proyecto creado.

**Valor clave**: El usuario no interactúa con pasos intermedios; todo el proceso es transparente y se percibe como una operación atómica.

**Arquitectura decidida**:
- **Orquestación**: Cloudflare Workflows (no Worker simple)
- **IA**: OpenAI API directa (no Workers AI)
- **Prompts**: Almacenados en R2 (`prompts-ia/`)
- **CII**: Formato `AA MM NNNN` (año + mes + ID)

---

## Contexto del Proyecto

### Proyecto CBC-ENDES

| Elemento | Descripción |
|----------|-------------|
| **Nombre** | `cbc-endes` |
| **Finalidad** | Gestión de proyectos de análisis inmobiliarios (PAI) |
| **Entorno** | GitHub Codespaces |
| **Stack** | TypeScript, Hono (backend), React + Vite (frontend) |
| **Despliegue** | Cloudflare Workers + Pages |

### Recursos Existentes (según `inventario_recursos.md` v11.0)

| Recurso | Nombre | Estado | Binding |
|---------|--------|--------|---------|
| **Worker Backend** | `wk-backend` | ✅ Activo | `db_binding_01`, `r2_binding_01` |
| **D1 Database** | `db-cbconsulting` | ✅ Activa | `db_binding_01` |
| **R2 Bucket** | `r2-cbconsulting` | ✅ Activo | `r2_binding_01` |
| **Frontend Pages** | `pg-cbc-endes` | ✅ Activo | - |

### Tablas PAI Existentes

- `PAI_ATR_atributos` - Atributos del sistema
- `PAI_VAL_valores` - Valores de atributos
- `PAI_PRO_proyectos` - Proyectos PAI
- `PAI_NOT_notas` - Notas de proyectos
- `PAI_ART_artefactos` - Artefactos generados
- `pipeline_eventos` - Tracking de eventos del workflow

---

## Problemática a Resolver

### Situación Actual

El proceso de alta de proyectos requiere:
1. Navegar a "Crear Proyecto"
2. Pegar IJSON en formulario
3. Enviar formulario

**Problema**: No existe automatización del procesamiento posterior. El usuario debería:
- Validar manualmente el IJSON
- Ejecutar prompts de IA externamente
- Extraer datos manualmente
- Crear el registro en DB
- Generar y organizar artefactos

### Situación Deseada

El usuario realiza **una única acción** (pegar IJSON + enviar) y el sistema:
- Valida el formato
- Ejecuta IA para extraer datos estructurados
- Crea el proyecto automáticamente
- Organiza todos los artefactos
- Redirige al formulario de edición

### Dolor del Usuario

- **Actual**: Múltiples pasos manuales, propensos a error, requieren conocimiento técnico
- **Deseado**: Un clic, resultado inmediato, cero intervención manual

---

## Objetivo del Workflow

### Objetivo Principal

Implementar un workflow automatizado que, a partir de un IJSON proporcionado por el usuario:

1. **Valide** el formato JSON
2. **Ejecute** un prompt de IA para obtener un Resultado-JSON estructurado
3. **Cree** el registro en `PAI_PRO_proyectos` con estado `CREADO`
4. **Genere** el CII del proyecto
5. **Organice** los artefactos en R2
6. **Redirija** al usuario al formulario de edición

### Criterio de Éxito

**El workflow alcanza su resultado válido cuando:**
- El registro existe en `PAI_PRO_proyectos`
- El campo `PRO_estado_val_id` corresponde a `VAL_codigo = 'CREADO'`
- El usuario es redirigido al formulario de edición

**Nota crítica**: Tareas posteriores a la creación del registro son parte del workflow pero no invalidan el éxito si fallan.

---

## Alcance y Límites

### Dentro del Alcance (In-Scope)

| Elemento | Descripción |
|----------|-------------|
| **Formulario de alta** | UI en frontend para pegar IJSON |
| **Endpoint de recepción** | Worker que recibe el IJSON |
| **Validación JSON** | Verificación de formato válido |
| **Almacenamiento temporal** | Guardado en R2 antes de procesar |
| **Ejecución de prompt IA** | Llamada a OpenAI API / Workers AI |
| **Interpretación Resultado-JSON** | Extracción de campos para DB |
| **Creación en PAI_PRO_proyectos** | Insert con estado `CREADO` |
| **Generación de CII** | Algoritmo de creación de código |
| **Organización en R2** | Carpeta por CII, archivo `CII.json` |
| **Redirección UI** | Navegación automática a edición |

### Fuera del Alcance (Out-of-Scope)

| Elemento | Justificación |
|----------|---------------|
| **Edición de proyectos** | Ya existe como funcionalidad separada |
| **Listado de proyectos** | Ya implementado en FASE 4 |
| **Gestión de notas** | Fuera del flujo de alta |
| **Re-ejecución de análisis** | Workflow separado |
| **Eliminación de proyectos** | Operación independiente |

---

## Requisitos Funcionales

### RF-001: Recepción de IJSON

**Descripción**: El workflow debe recibir el IJSON desde el formulario de alta.

**Criterios de Aceptación**:
- El formulario debe tener un único campo obligatorio: IJSON
- El envío se produce al pulsar "Guardar/Enviar"
- El botón debe cambiar a "Ejecutando" durante el procesamiento

---

### RF-002: Validación de Formato JSON

**Descripción**: Verificar que el contenido recibido es JSON válido.

**Criterios de Aceptación**:
- Si no es JSON válido: mostrar error en formulario de alta
- No continuar el workflow si la validación falla
- El mensaje debe ser claro para el usuario final

---

### RF-003: Almacenamiento Temporal en R2

**Descripción**: Guardar el JSON válido en una carpeta temporal de R2.

**Criterios de Aceptación**:
- El archivo debe guardarse antes de ejecutar IA
- Debe ser accesible para el prompt de IA
- La ruta temporal debe ser trazable al proyecto final

---

### RF-004: Lectura de Prompt desde `prompts-ia`

**Descripción**: El workflow debe leer el prompt desde la subcarpeta `prompts-ia` en el Worker.

**Criterios de Aceptación**:
- Los prompts se identifican por nombre de archivo `.json`
- El prompt debe ser legible desde el Worker
- Debe soportar múltiples prompts (futuro)

---

### RF-005: Ejecución de Prompt contra IA

**Descripción**: Ejecutar el prompt contra OpenAI API, intentando usar Workers AI si es posible.

**Criterios de Aceptación**:
- El IJSON temporal se usa como entrada del prompt
- Debe intentar Workers AI como primer medio
- Debe tener fallback a OpenAI API si Workers AI no está disponible
- El resultado debe ser un JSON con estructura fija

---

### RF-006: Validación de Resultado-JSON

**Descripción**: Verificar que el resultado de IA es un JSON válido con estructura esperada.

**Criterios de Aceptación**:
- Si no hay Resultado-JSON: error en formulario de alta
- Si el JSON es inválido: error en formulario de alta
- Si no permite extraer campos necesarios: error en formulario de alta

---

### RF-007: Creación de Registro en `PAI_PRO_proyectos`

**Descripción**: Crear el registro en la tabla `PAI_PRO_proyectos` a partir del Resultado-JSON.

**Criterios de Aceptación**:
- El registro debe crearse inmediatamente después de interpretar el Resultado-JSON
- `PRO_estado_val_id` debe corresponder a `VAL_codigo = 'CREADO'`
- Este es el punto de no retorno: el proyecto se considera creado

---

### RF-008: Obtención de ID del Proyecto

**Descripción**: Obtener el ID del registro recién creado.

**Criterios de Aceptación**:
- El ID se usa para tareas posteriores (CII, carpetas, artefactos)
- Debe obtenerse inmediatamente después del insert

---

### RF-009: Generación de CII

**Descripción**: Crear el Código de Identificación de Inmueble (CII) a partir del ID.

**Criterios de Aceptación**:
- El CII es único por proyecto
- El algoritmo de generación debe ser determinista
- El CII se usa para nombrar carpetas y archivos

---

### RF-010: Actualización de `PRO_cii`

**Descripción**: Actualizar el campo `PRO_cii` en el registro del proyecto.

**Criterios de Aceptación**:
- El CII generado se guarda en `PAI_PRO_proyectos.PRO_cii`
- La actualización ocurre después de la creación del registro

---

### RF-011: Creación de Carpeta en R2

**Descripción**: Crear la subcarpeta del proyecto en R2 usando el CII.

**Criterios de Aceptación**:
- La carpeta debe nombrarse con el CII
- Debe estar dentro del bucket `r2-cbconsulting`
- La ruta debe ser trazable al ID del proyecto

---

### RF-012: Movimiento y Renombrado de JSON

**Descripción**: Mover el JSON temporal a la carpeta del proyecto y renombrar como `CII.json`.

**Criterios de Aceptación**:
- El archivo original temporal se elimina
- El archivo final se llama `{CII}.json`
- El archivo no debe mostrarse en el formulario de edición

---

### RF-013: Redirección a Formulario de Edición

**Descripción**: Al finalizar el workflow, redirigir al usuario al formulario de edición del proyecto.

**Criterios de Aceptación**:
- La redirección es automática
- El usuario ve el proyecto recién creado
- No se muestran pasos intermedios

---

### RF-014: Manejo de Errores

**Descripción**: Gestionar errores antes y después de la creación del proyecto.

**Criterios de Aceptación**:
- Error antes de crear: mostrar en formulario de alta
- Error después de crear: redirigir a edición sin aviso
- El usuario nunca ve errores de tareas posteriores a la creación

---

## Requisitos No Funcionales

### RNF-001: Percepción de Bloque Atómico

El usuario debe percibir el proceso como una operación única y continua, sin pasos intermedios visibles.

**Métrica**: No mostrar más de 1 estado de progreso (ej. "Ejecutando").

---

### RNF-002: Tiempo de Respuesta

El workflow debe completarse en un tiempo razonable.

**Métrica**: < 30 segundos para el flujo completo (sujeto a validación con IA).

---

### RNF-003: Tolerancia a Fallos

El workflow debe manejar fallos de IA, R2 y DB de forma graceful.

**Métrica**: 100% de los errores manejados con mensaje apropiado al usuario.

---

### RNF-004: Idempotencia

El formulario no debe permitir envíos duplicados mientras se ejecuta un workflow.

**Métrica**: Botón deshabilitado durante "Ejecutando".

---

### RNF-005: Trazabilidad

Todas las acciones del workflow deben registrarse en `pipeline_eventos`.

**Métrica**: 1 evento por paso significativo del workflow.

---

## Restricciones Técnicas

### RTC-001: Uso de Recursos Cloudflare Existentes

**Restricción**: El workflow debe usar los recursos ya desplegados según `inventario_recursos.md`.

| Recurso | Nombre | Binding |
|---------|--------|---------|
| Worker | `wk-backend` | - |
| D1 | `db-cbconsulting` | `db_binding_01` |
| R2 | `r2-cbconsulting` | `r2_binding_01` |

**Justificación**: R1 (No asumir valores no documentados), R15 (Inventario actualizado).

---

### RTC-002: Integración con OpenAI API

**Decisión**: Usar OpenAI API directa como medio principal.

**Justificación**: Workers AI puede no estar disponible en la cuenta gratuita. OpenAI API garantiza funcionamiento inmediato con modelos más potentes (GPT-4).

**Requerimiento**: Secret `OPENAI_API_KEY` debe configurarse en el Workflow.

---

### RTC-003: Ubicación de Prompts en R2

**Decisión**: Los prompts deben residir en la subcarpeta `prompts-ia/` dentro del bucket R2 `r2-cbconsulting`.

**Justificación**: Permite actualizar prompts sin redeploy del Worker.

**Archivo de prompt**: `00_CrearProyecto.json`

**Ejemplo**: Ver `_doc-desarrollo/fase01/13_Propietario.json`

---

### RTC-004: Estado Inicial del Proyecto

**Restricción**: `PRO_estado_val_id` debe corresponder a `VAL_codigo = 'CREADO'`.

**Justificación**: CONCEPTO establece criterio de proyecto creado.

**Validación**: El valor existe en `PAI_VAL_valores` (migración 005).

---

### RTC-005: Algoritmo de CII

**Decisión**: Formato `AA MM NNNN` documentado en `Sistema-Identificacion-Almacenamiento-Inmueble.md`.

**Formato**:
- `AA`: 2 dígitos del año
- `MM`: 2 dígitos del mes
- `NNNN`: 4 dígitos del ID del registro (rellenado con ceros a la izquierda)

**Ejemplo**: ID=42, marzo 2026 → `26030042`

---

### RTC-006: No Hardcoding

**Restricción**: No incluir IDs de cuenta, URLs o credenciales en código.

**Justificación**: R2 (Cero hardcoding).

---

### RTC-007: Gestión de Secrets

**Restricción**: API keys de OpenAI deben guardarse en secrets, no en código.

**Justificación**: R3 (Gestión de secrets y credenciales).

---

### RTC-008: Uso de Cloudflare Workflows

**Decisión**: Implementar con Cloudflare Workflows (no Worker simple).

**Justificación**: 
- Encadenar pasos con estado persistido
- Reintentos automáticos por step
- Pausar/reanudar para esperas de IA
- Wall time ilimitado por step (Free: 10 ms CPU, pero wall time ilimitado)

---

## Recursos Cloudflare Involucrados

### Recursos Existentes (✅)

| Recurso | Nombre | Binding | Uso en Workflow |
|---------|--------|---------|-----------------|
| **Worker** | `wk-backend` | - | Endpoint de recepción |
| **D1 Database** | `db-cbconsulting` | `db_binding_01` | Tablas PAI |
| **R2 Bucket** | `r2-cbconsulting` | `r2_binding_01` | Almacenamiento JSON + prompts |
| **Pages** | `pg-cbc-endes` | - | Formulario de alta |

### Recursos Nuevos Requeridos (🔲)

| Recurso | Nombre Propuesto | Binding Propuesto | Uso | Estado |
|---------|------------------|-------------------|-----|--------|
| **Cloudflare Workflows** | `wf-alta-proyectos-pai` | `wf_binding` | Orquestación del workflow | 🔲 Por crear |
| **R2 Subcarpeta** | `prompts-ia/` | (mismo bucket) | Almacenamiento de prompts | 🔲 Por crear |

### Secrets Requeridos

| Secret | Uso | Sensible | Estado |
|--------|-----|----------|--------|
| `OPENAI_API_KEY` | API de OpenAI (ejecución de prompts) | ✅ Sí | 🔲 Pendiente de configurar |

### Variables de Entorno Requeridas

| Variable | Uso | Sensible | Valor por defecto |
|----------|-----|----------|-------------------|
| `OPENAI_MODEL` | Modelo de OpenAI a usar | ❌ No | `gpt-4o-mini` |
| `PROMPTS_IA_PATH` | Ruta en R2 para prompts | ❌ No | `prompts-ia/` |
| `R2_BUCKET_ANALISIS` | Bucket para análisis | ❌ No | `analisis-inmuebles/` |

---

## Puntos de Decisión Pendientes

### PDP-001: Disponibilidad de Workers AI

**Decisión del usuario (2026-03-28)**: Usar **OpenAI API directa** como medio principal.

**Justificación**: Workers AI puede no estar disponible en la cuenta gratuita. OpenAI API garantiza funcionamiento inmediato.

**Impacto**: 
- Se requiere secret `OPENAI_API_KEY`
- No se requiere Workers AI binding
- Mayor latencia pero modelos más potentes (GPT-4)

---

### PDP-002: Estructura del Resultado-JSON

**Decisión del usuario (2026-03-28)**: ✅ **De acuerdo** con la estructura propuesta.

**Schema confirmado**:
```json
{
  "titulo_anuncio": "string",
  "tipo_inmueble": "string",
  "operacion": "venta" | "alquiler",
  "precio": "string",
  "superficie_construida_m2": "string",
  "ciudad": "string",
  "provincia": "string (opcional)",
  "barrio_distrito": "string (opcional)",
  "direccion": "string (opcional)"
}
```

**Impacto**: Define el prompt de IA y la extracción de datos para DB.

---

### PDP-003: Algoritmo de Generación de CII

**Decisión del usuario (2026-03-28)**: Consultar documentación existente.

**Fuente**: `plans/proyecto-PIA/doc-base/Sistema-Identificacion-Almacenamiento-Inmueble.md`

**Algoritmo documentado**:
- **Formato**: `AA MM NNNN`
  - `AA`: 2 dígitos del año
  - `MM`: 2 dígitos del mes
  - `NNNN`: 4 dígitos numéricos del ID del registro (rellenado con ceros a la izquierda)
- **Ejemplo**: `26 03 0042` → `26030042`

**Estructura de almacenamiento**:
```
analisis-inmuebles/
  └── {CII}/
      ├── {CII}.json           (IJSON original)
      ├── {CII}_analisis-fisico.md
      ├── {CII}_analisis-estrategico.md
      ├── {CII}_analisis-financiero.md
      ├── {CII}_analisis-regulatorio.md
      ├── {CII}_lectura-inversor.md
      ├── {CII}_lectura-operador.md
      ├── {CII}_lectura-propietario.md
      └── {CII}_log.json       (log de ejecución)
```

**Impacto**: El CII se genera después de crear el registro en DB (se necesita el ID).

---

### PDP-004: Ubicación de Prompts IA

**Decisión del usuario (2026-03-28)**: 
- ❌ **NO** en subcarpeta del Worker
- ✅ **SÍ** en bucket R2 `r2-cbconsulting`, subcarpeta `prompts-ia/`

**Archivo de prompt**: `00_CrearProyecto.json`

**Ejemplo de estructura**: Ver `_doc-desarrollo/fase01/13_Propietario.json`

**Impacto**: 
- El prompt se lee desde R2, no desde filesystem del Worker
- Permite actualizar prompts sin redeploy
- Requiere binding `r2_binding_01` en el Workflow

---

### PDP-005: Timeout del Workflow

**Decisión del usuario (2026-03-28)**: Considerar límites de capa gratuita.

**Fuente**: `_doc-desarrollo/fase01/cf-limites-cloudflare-gratuito.md`

**Límites relevantes (Free tier)**:

| Recurso | Límite Free |
|---------|-------------|
| **Workers** | 100.000 requests/día, 10 ms CPU/invocación |
| **Workflows** | 100.000 ejecuciones/día, 10 ms CPU/step, wall time ilimitado |
| **Workflows** | 100 instancias concurrentes, 1000 steps/workflow |
| **Workflows** | 100 MB estado persistido/instancia |
| **R2** | 10 GB-month storage, 1M ops Class A/mes |
| **D1** | 5M rows read/día, 100K rows written/día |

**Impacto**: 
- Workflows permite wall time ilimitado (ideal para esperas de IA)
- CPU time es limitado (10 ms/step en Free)
- El timeout no es problema si se usa Workflows (no Worker simple)

---

### PDP-006: Tipo de Recurso para Workflow

**Decisión del usuario (2026-03-28)**: **Cloudflare Workflows**

**Fuente**: `_doc-desarrollo/fase01/cf-wk-wf.md`

**Justificación**:
- ✅ Encadenar pasos: recibir JSON → guardar temp → ejecutar OpenAI → resultado → crear DB → etc.
- ✅ Reintentar automáticamente: en caso de fallo de OpenAI API
- ✅ Pausar/reanudar: dar tiempo a que OpenAI API se ejecute y luego reanudar
- ✅ Wall time ilimitado por step (vs 10 ms CPU)
- ✅ Estado persistido entre pasos

**Alternativa descartada**: Worker simple (no soporta pausas, reintentos automáticos ni estado persistido)

**Impacto**: 
- Requiere definir Workflow como recurso separado
- Cada paso es un step independiente y reintentable
- Mayor complejidad pero más robusto

---

## Recomendaciones Preliminares

### REC-001: Enfoque Doc-First

**Recomendación**: Antes de implementar, redactar:
1. Especificación técnica del workflow
2. Contrato de API (endpoint de recepción)
3. Schema del Resultado-JSON
4. Diseño de prompts IA

**Justificación**: Evita retrabajo y asegura alineación con requisitos.

---

### REC-002: Validación de Disponibilidad de Recursos

**Recomendación**: Antes de codificar, verificar:
1. Workers AI disponible en la cuenta
2. Límites de timeout del Worker
3. Permisos del token de API para D1 y R2

**Justificación**: Previene bloqueos durante implementación.

---

### REC-003: Implementación Incremental

**Recomendación**: Implementar en fases:
1. **Fase 1**: Recepción, validación JSON, almacenamiento temporal
2. **Fase 2**: Ejecución de IA, Resultado-JSON
3. **Fase 3**: Creación en DB, generación CII
4. **Fase 4**: Organización en R2, redirección

**Justificación**: Permite validar cada paso antes de continuar.

---

### REC-004: Logging y Trazabilidad

**Recomendación**: Registrar cada paso en `pipeline_eventos`:
- `recepcion_ijson`
- `validacion_json`
- `almacenamiento_temporal`
- `ejecucion_prompt_ia`
- `resultado_json`
- `creacion_proyecto`
- `generacion_cii`
- `organizacion_r2`

**Justificación**: Permite depurar fallos y auditar el proceso.

---

### REC-005: Manejo de Errores Diferenciado

**Recomendación**: Distinguir errores:
- **Pre-creación**: Mostrar en formulario de alta
- **Post-creación**: Loggear, redirigir a edición, no mostrar error

**Justificación**: Alineado con CONCEPTO: proyecto creado = éxito, aunque fallen tareas posteriores.

---

## Próximos Pasos

### Paso 1: ✅ Aprobación del Concept Brief

**Estado**: **COMPLETADO** (2026-03-28)

**Decisiones tomadas**:
- ✅ PDP-001: OpenAI API directa (no Workers AI)
- ✅ PDP-002: Estructura de Resultado-JSON confirmada
- ✅ PDP-003: Algoritmo CII documentado (AA MM NNNN)
- ✅ PDP-004: Prompts en R2 (`prompts-ia/00_CrearProyecto.json`)
- ✅ PDP-005: Límites Free tier considerados
- ✅ PDP-006: Cloudflare Workflows como recurso

---

### Paso 2: ⏳ Especificación Técnica (Doc-First)

**Acción**: Redactar documentos técnicos:
- `02-especificacion-tecnica-workflow-alta-pai.md`
- `03-contrato-api-endpoint-alta.md`
- `04-schema-resultado-json.md`
- `05-diseno-prompts-ia.md` (prompt `00_CrearProyecto.json`)

**Criterio**: Documentación completa antes de implementación.

**Dependencias**: 
- Algoritmo CII de `Sistema-Identificacion-Almacenamiento-Inmueble.md`
- Límites Free tier de `cf-limites-cloudflare-gratuito.md`
- Patrones Workflows de `cf-wk-wf.md`

---

### Paso 3: ⏳ Actualización de Inventario

**Acción**: Invocar agente `inventariador` para actualizar `inventario_recursos.md`:
- Nuevo recurso: Cloudflare Workflows `wf-alta-proyectos-pai`
- Nuevo secret: `OPENAI_API_KEY`
- Nueva subcarpeta R2: `prompts-ia/`

**Criterio**: Inventario actualizado antes de implementación.

---

### Paso 4: ⏳ Implementación

**Acción**: Codificar workflow según especificación técnica.

**Criterio**: Tests passing, linters clean, documentación actualizada.

**Estructura de Workflows**:
```
Step 1: Recepción y validación de IJSON
  ↓
Step 2: Guardado temporal en R2
  ↓
Step 3: Lectura de prompt desde R2 (prompts-ia/00_CrearProyecto.json)
  ↓
Step 4: Ejecución de OpenAI API
  ↓
Step 5: Validación de Resultado-JSON
  ↓
Step 6: Creación de registro en PAI_PRO_proyectos
  ↓
Step 7: Generación de CII
  ↓
Step 8: Actualización de PRO_cii en DB
  ↓
Step 9: Creación de carpeta en R2
  ↓
Step 10: Movimiento de JSON temporal a carpeta CII
  ↓
Step 11: Redirección a formulario de edición
```

---

## Anexos

### A. Glosario de Términos

| Término | Definición |
|---------|------------|
| **IJSON** | Inmueble JSON: formato de datos de entrada con información del anuncio inmobiliario |
| **Resultado-JSON** | JSON estructurado devuelto por IA, usado para crear el proyecto |
| **CII** | Código de Identificación de Inmueble: identificador único del proyecto |
| **PAI** | Proyectos de Análisis Inmobiliario |
| **Workers AI** | Servicio de IA de Cloudflare para ejecutar modelos en el edge |

---

### B. Referencias a Documentos

| Documento | Ruta | Propósito |
|-----------|------|-----------|
| **CONCEPTO** | `_doc-desarrollo/fase01/Definición del workflow de alta de proyectos PAI en Cloudflare.md` | Definición original del workflow |
| **Reglas del Proyecto** | `.governance/reglas_proyecto.md` | Reglas obligatorias (R1-R16) |
| **Inventario de Recursos** | `.governance/inventario_recursos.md` | Recursos Cloudflare configurados |

---

### C. Matriz de Trazabilidad

| Requisito | Sección CONCEPTO | Implementación Propuesta |
|-----------|------------------|-------------------------|
| RF-001 | "El usuario selecciona crear proyecto" | Formulario en Pages |
| RF-002 | "Verifica que tenga formato JSON válido" | Validación en Worker |
| RF-003 | "Lo guarda como archivo JSON en carpeta temporal" | R2 temporal |
| RF-004 | "Subcarpeta llamada prompts-ia" | `src/prompts-ia/` |
| RF-005 | "Ejecuta el prompt contra la API de OpenAI" | Workers AI + fallback OpenAI |
| RF-007 | "Se crea el registro en PAI_PRO_proyectos" | INSERT en D1 |
| RF-009 | "El workflow utiliza el ID para crear el CII" | Función `generateCII()` |
| RF-013 | "Usuario es llevado directamente al formulario de edición" | Redirección HTTP |

---

**Estado del Documento**: Pendiente de aprobación

**Próxima Revisión**: Tras aprobación del usuario, proceder con resolución de PDPs y especificación técnica.
