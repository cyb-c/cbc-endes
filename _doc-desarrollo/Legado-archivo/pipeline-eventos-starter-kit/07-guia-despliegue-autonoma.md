# Guía de Despliegue Autónoma: Sistema de Auditoría de Eventos

**Versión:** 1.0  
**Fecha:** 27 de marzo de 2026  
**Propósito:** Guía completa para que un modelo IA del IDE ejecute el proceso de incorporación del Starter Kit de principio a fin

---

## Índice de Contenidos

1. [Sección 0: Configuración del Usuario](#0-sección-0-configuración-del-usuario)
2. [Sección 1: Análisis del Contexto](#1-sección-1-análisis-del-contexto)
3. [Sección 2: Creación de Migración SQL](#2-sección-2-creación-de-migración-sql)
4. [Sección 3: Creación de Tipos TypeScript](#3-sección-3-creación-de-tipos-typescript)
5. [Sección 4: Creación de Librería](#4-sección-4-creación-de-librería)
6. [Sección 5: Creación de Ejemplos](#5-sección-5-creación-de-ejemplos)
7. [Sección 6: Ejecución de Migración](#6-sección-6-ejecución-de-migración)
8. [Sección 7: Validación](#7-sección-7-validación)
9. [Sección 8: Integración en el Pipeline](#8-sección-8-integración-en-el-pipeline)
10. [Sección 9: Creación de Endpoints HTTP](#9-sección-9-creación-de-endpoints-http)
11. [Sección 10: Documentación Final](#10-sección-10-documentación-final)

---

## 0. Sección 0: Configuración del Usuario

⚠️ **IMPORTANTE:** Esta sección debe ser completada por el usuario antes de iniciar el proceso.

### 0.1 Contexto del Proyecto

```
Nombre del proyecto: [COMPLETAR POR EL USUARIO]
Descripción breve: [COMPLETAR POR EL USUARIO]
Stack tecnológico: [COMPLETAR POR EL USUARIO - ej: Cloudflare Workers, D1, TypeScript]
```

### 0.2 Estructura de Carpetas del Proyecto

```
Ruta base del proyecto: [COMPLETAR POR EL USUARIO - ej: . o ./plrfcf]

Carpetas existentes:
- src/types/: [SÍ/NO] - Ruta alternativa: [COMPLETAR SI NO EXISTE]
- src/lib/: [SÍ/NO] - Ruta alternativa: [COMPLETAR SI NO EXISTE]
- migrations/: [SÍ/NO] - Ruta alternativa: [COMPLETAR SI NO EXISTE]
- src/handlers/: [SÍ/NO] - Ruta alternativa: [COMPLETAR SI NO EXISTE]
- src/examples/: [SÍ/NO] - Ruta alternativa: [COMPLETAR SI NO EXISTE]
```

### 0.3 Configuración de Base de Datos

```
Nombre de la base de datos D1: [COMPLETAR POR EL USUARIO]
Variable de entorno para DB: [COMPLETAR POR EL USUARIO - ej: env.DB o env.D1_DATABASE]
```

### 0.4 Requerimientos Específicos

```
¿Necesita migración desde schema acoplado?: [SÍ/NO]
  - Si SÍ, nombre de la tabla acoplada: [COMPLETAR POR EL USUARIO]

¿Necesita endpoints HTTP?: [SÍ/NO]
  - Si SÍ, ruta base de endpoints: [COMPLETAR POR EL USUARIO - ej: /api/pipeline]

¿Necesita integración en pipeline existente?: [SÍ/NO]
  - Si SÍ, archivos del pipeline: [COMPLETAR POR EL USUARIO - lista de archivos]

Convenciones de nombres para pasos: [COMPLETAR POR EL USUARIO o DEJAR EN BLANCO para usar valores por defecto]
Taxonomía de códigos de error: [COMPLETAR POR EL USUARIO o DEJAR EN BLANCO para definir más tarde]
```

### 0.5 Información Adicional

```
[COMPLETAR POR EL USUARIO - Cualquier información adicional relevante]
```

---

## 1. Sección 1: Análisis del Contexto

### 1.1 Objetivo de esta Sección

El modelo IA debe analizar el contexto del proyecto para entender:

- La estructura de carpetas existente
- La configuración de TypeScript
- La configuración de Cloudflare Workers
- Los archivos existentes que podrían entrar en conflicto

### 1.2 Tareas para el Modelo IA

**Tarea 1.1: Listar estructura de carpetas**

```
Ejecuta: list_files en la ruta base del proyecto con recursive=true
Objetivo: Identificar si existen las carpetas src/types, src/lib, migrations, src/handlers, src/examples
Resultado esperado: Lista de carpetas y archivos existentes
```

**Tarea 1.2: Leer configuración de TypeScript**

```
Ejecuta: read_file en tsconfig.json o equivalentes
Objetivo: Identificar rutas de alias y configuración de compilación
Resultado esperado: Configuración de TypeScript
```

**Tarea 1.3: Leer configuración de Cloudflare Workers**

```
Ejecuta: read_file en wrangler.toml o wrangler.jsonc
Objetivo: Identificar nombre de la base de datos D1
Resultado esperado: Configuración de D1
```

**Tarea 1.4: Leer archivos existentes relevantes**

```
Ejecuta: read_file en archivos de handlers o librerías existentes
Objetivo: Identificar patrones de código existentes para mantener consistencia
Resultado esperado: Patrones de código existentes
```

### 1.3 Decisiones del Modelo IA

Basado en el análisis, el modelo IA debe decidir:

- Si las carpetas necesarias existen o deben crearse
- Si hay conflictos de nombres con archivos existentes
- Si hay patrones de código que deben seguirse
- Si hay alias de TypeScript que deben usarse

**Resultado esperado:** Plan de acción con decisiones documentadas

---

## 2. Sección 2: Creación de Migración SQL

### 2.1 Objetivo de esta Sección

Crear el archivo de migración SQL con el schema de la tabla `pipeline_eventos`.

### 2.2 Tareas para el Modelo IA

**Tarea 2.1: Leer el schema SQL**

```
Ejecuta: read_file en plans/pipeline-eventos-starter-kit/02-schema-sql.md
Objetivo: Extraer el código SQL completo
Resultado esperado: Contenido SQL del schema
```

**Tarea 2.2: Determinar nombre de archivo de migración**

```
Regla: Usar formato 00XX-descripcion.sql donde XX es el siguiente número disponible
Ejemplo: Si existe 0019-..., usar 0020-create-pipeline-events.sql
Resultado esperado: Nombre de archivo de migración
```

**Tarea 2.3: Crear archivo de migración**

```
Ejecuta: write_to_file en migrations/[NOMBRE_DETERMINADO]
Contenido: Código SQL extraído de 02-schema-sql.md
Resultado esperado: Archivo de migración creado
```

### 2.3 Validación del Modelo IA

```
Verificar:
- [ ] El archivo se creó en la ubicación correcta
- [ ] El contenido SQL incluye la tabla pipeline_eventos
- [ ] El contenido SQL incluye los 3 índices (idx_pe_entity_id, idx_pe_error, idx_pe_paso_nivel)
- [ ] El nombre del archivo sigue el formato correcto
```

---

## 3. Sección 3: Creación de Tipos TypeScript

### 3.1 Objetivo de esta Sección

Crear el archivo de tipos TypeScript con todas las interfaces y tipos necesarios.

### 3.2 Tareas para el Modelo IA

**Tarea 3.1: Leer los tipos TypeScript**

```
Ejecuta: read_file en plans/pipeline-eventos-starter-kit/03-types.md
Objetivo: Extraer el código TypeScript completo
Resultado esperado: Contenido TypeScript de tipos
```

**Tarea 3.2: Determinar ubicación del archivo**

```
Regla: Usar src/types/pipeline-events.ts o la ruta alternativa especificada por el usuario
Si la carpeta no existe, crearla primero
Resultado esperado: Ubicación del archivo de tipos
```

**Tarea 3.3: Crear archivo de tipos**

```
Ejecuta: write_to_file en [UBICACIÓN_DETERMINADA]
Contenido: Código TypeScript extraído de 03-types.md
Resultado esperado: Archivo de tipos creado
```

### 3.3 Validación del Modelo IA

```
Verificar:
- [ ] El archivo se creó en la ubicación correcta
- [ ] El contenido incluye todos los tipos: PipelineEvent, InsertPipelineEventParams, etc.
- [ ] Los tipos exportados son correctos
- [ ] No hay errores de sintaxis TypeScript
```

---

## 4. Sección 4: Creación de Librería

### 4.1 Objetivo de esta Sección

Crear el archivo de librería con todas las funciones de escritura y lectura.

### 4.2 Tareas para el Modelo IA

**Tarea 4.1: Leer la librería**

```
Ejecuta: read_file en plans/pipeline-eventos-starter-kit/04-lib-pipeline-events.md
Objetivo: Extraer el código TypeScript completo
Resultado esperado: Contenido TypeScript de la librería
```

**Tarea 4.2: Ajustar rutas de importación**

```
Regla: Ajustar la ruta de importación de tipos según la estructura del proyecto
Ejemplo: Si types está en src/types, usar '../types/pipeline-events'
Resultado esperado: Ruta de importación ajustada
```

**Tarea 4.3: Determinar ubicación del archivo**

```
Regla: Usar src/lib/pipeline-events.ts o la ruta alternativa especificada por el usuario
Si la carpeta no existe, crearla primero
Resultado esperado: Ubicación del archivo de librería
```

**Tarea 4.4: Crear archivo de librería**

```
Ejecuta: write_to_file en [UBICACIÓN_DETERMINADA]
Contenido: Código TypeScript extraído de 04-lib-pipeline-events.md con rutas ajustadas
Resultado esperado: Archivo de librería creado
```

### 4.3 Validación del Modelo IA

```
Verificar:
- [ ] El archivo se creó en la ubicación correcta
- [ ] La ruta de importación de tipos es correcta
- [ ] Todas las funciones están exportadas
- [ ] No hay errores de sintaxis TypeScript
- [ ] Los tipos de parámetros coinciden con los tipos definidos
```

---

## 5. Sección 5: Creación de Ejemplos

### 5.1 Objetivo de esta Sección

Crear ejemplos de uso para facilitar la adopción del sistema.

### 5.2 Tareas para el Modelo IA

**Tarea 5.1: Determinar ubicación del archivo**

```
Regla: Usar src/examples/pipeline-events-example.ts o la ruta alternativa especificada por el usuario
Si la carpeta no existe, crearla primero
Resultado esperado: Ubicación del archivo de ejemplos
```

**Tarea 5.2: Crear archivo de ejemplos**

```
Ejecuta: write_to_file en [UBICACIÓN_DETERMINADA]
Contenido: Ejemplos de uso de las funciones principales

Debe incluir:
1. Ejemplo de insertPipelineEvent con éxito
2. Ejemplo de insertPipelineEvent con error
3. Ejemplo de getEntityEvents
4. Ejemplo de getLatestEvent
5. Ejemplo de getErrorEvents
6. Ejemplo de getStepDurationMetrics

Resultado esperado: Archivo de ejemplos creado
```

### 5.3 Contenido Sugerido para Ejemplos

```typescript
import {
  insertPipelineEvent,
  getEntityEvents,
  getLatestEvent,
  getErrorEvents,
  getStepDurationMetrics,
} from '../lib/pipeline-events'

// Ejemplo 1: Insertar evento de éxito
async function ejemploInsertSuccess() {
  const db = // tu instancia de D1Database
  
  await insertPipelineEvent(db, {
    entityId: 'process-uuid-123',
    paso: 'PROCESS_DATA',
    nivel: 'INFO',
    tipoEvento: 'STEP_SUCCESS',
    detalle: { records: 150, duration: '2.5s' },
    duracionMs: 2500,
  })
}

// Ejemplo 2: Insertar evento de error
async function ejemploInsertError() {
  const db = // tu instancia de D1Database
  
  await insertPipelineEvent(db, {
    entityId: 'process-uuid-123',
    paso: 'PROCESS_DATA',
    nivel: 'ERROR',
    tipoEvento: 'STEP_FAILED',
    origen: 'wk-processor',
    errorCodigo: 'DATA_VALIDATION_FAILED',
    detalle: 'El campo "email" es inválido',
    duracionMs: 120,
  })
}

// Ejemplo 3: Obtener cronología de eventos
async function ejemploGetEntityEvents() {
  const db = // tu instancia de D1Database
  
  const eventos = await getEntityEvents(db, 'process-uuid-123', {
    order: 'DESC',
    limit: 100,
  })
  
  console.log('Cronología:', eventos)
}

// Ejemplo 4: Obtener último evento
async function ejemploGetLatestEvent() {
  const db = // tu instancia de D1Database
  
  const ultimoEvento = await getLatestEvent(db, 'process-uuid-123')
  
  if (ultimoEvento) {
    console.log('Último paso:', ultimoEvento.paso)
    console.log('Nivel:', ultimoEvento.nivel)
  }
}

// Ejemplo 5: Obtener eventos con error
async function ejemploGetErrorEvents() {
  const db = // tu instancia de D1Database
  
  const errores = await getErrorEvents(db, {
    errorCodigo: 'DATA_VALIDATION_FAILED',
    since: '2026-03-20T00:00:00Z',
  })
  
  console.log(`Se encontraron ${errores.length} errores`)
}

// Ejemplo 6: Obtener métricas de duración
async function ejemploGetStepDurationMetrics() {
  const db = // tu instancia de D1Database
  
  const metricas = await getStepDurationMetrics(db, {
    since: '2026-03-20T00:00:00Z',
  })
  
  console.table(metricas)
}
```

### 5.4 Validación del Modelo IA

```
Verificar:
- [ ] El archivo se creó en la ubicación correcta
- [ ] Todos los ejemplos están incluidos
- [ ] Los ejemplos son claros y ejecutables
- [ ] Las importaciones son correctas
```

---

## 6. Sección 6: Ejecución de Migración

### 6.1 Objetivo de esta Sección

Ejecutar la migración SQL en la base de datos D1.

### 6.2 Tareas para el Modelo IA

**Tarea 6.1: Verificar disponibilidad de wrangler**

```
Ejecuta: No ejecutar comando, solo documentar
Objetivo: Confirmar que el usuario tiene wrangler instalado
Resultado esperado: Instrucción para el usuario
```

**Tarea 6.2: Generar comando de ejecución**

```
Regla: Usar formato: npx wrangler d1 execute <DATABASE_NAME> --file=./migrations/<MIGRATION_FILE>
Resultado esperado: Comando listo para ejecutar
```

**Tarea 6.3: Documentar instrucciones**

```
Crear instrucciones claras para el usuario:
1. Verificar que wrangler está instalado
2. Ejecutar el comando generado
3. Verificar que la tabla se creó correctamente
Resultado esperado: Instrucciones documentadas
```

### 6.3 Validación del Modelo IA

```
Verificar:
- [ ] El comando incluye el nombre correcto de la base de datos
- [ ] El comando incluye la ruta correcta del archivo de migración
- [ ] Las instrucciones son claras y fáciles de seguir
```

---

## 7. Sección 7: Validación

### 7.1 Objetivo de esta Sección

Validar que todos los archivos se crearon correctamente y que el sistema funciona.

### 7.2 Tareas para el Modelo IA

**Tarea 7.1: Verificar archivos creados**

```
Ejecuta: list_files en las carpetas correspondientes
Objetivo: Confirmar que todos los archivos se crearon
Resultado esperado: Lista de archivos creados
```

**Tarea 7.2: Verificar importaciones**

```
Ejecuta: read_file en src/lib/pipeline-events.ts
Objetivo: Confirmar que la ruta de importación de tipos es correcta
Resultado esperado: Confirmación de importación correcta
```

**Tarea 7.3: Generar comando de verificación de TypeScript**

```
Regla: Usar formato: npx tsc --noEmit
Resultado esperado: Comando para verificar compilación
```

**Tarea 7.4: Documentar instrucciones de validación**

```
Crear instrucciones para el usuario:
1. Ejecutar npx tsc --noEmit para verificar que no hay errores
2. Revisar los archivos creados
3. Probar los ejemplos
Resultado esperado: Instrucciones documentadas
```

### 7.3 Validación del Modelo IA

```
Verificar:
- [ ] Todos los archivos están en la lista
- [ ] Las rutas de importación son correctas
- [ ] El comando de verificación es correcto
- [ ] Las instrucciones son completas
```

---

## 8. Sección 8: Integración en el Pipeline

### 8.1 Objetivo de esta Sección

Integrar el sistema de auditoría en el pipeline existente del proyecto.

### 8.2 Tareas para el Modelo IA

**CONDICIÓN:** Solo ejecutar si el usuario especificó "SÍ" en "¿Necesita integración en pipeline existente?"

**Tarea 8.1: Leer archivos del pipeline**

```
Ejecuta: read_file en los archivos especificados por el usuario
Objetivo: Entender el flujo del pipeline existente
Resultado esperado: Comprensión del pipeline
```

**Tarea 8.2: Identificar puntos de inserción**

```
Regla: Identificar dónde insertar llamadas a insertPipelineEvent
Puntos típicos:
- Inicio de cada paso del pipeline
- Éxito de cada paso
- Error de cada paso
Resultado esperado: Lista de puntos de inserción
```

**Tarea 8.3: Generar código de integración**

```
Para cada punto de inserción, generar código que:
1. Importe insertPipelineEvent
2. Registre el inicio del paso (opcional)
3. Registre el éxito del paso
4. Registre el error del paso (en bloques catch)
Resultado esperado: Código de integración generado
```

**Tarea 8.4: Documentar cambios**

```
Crear lista de cambios a aplicar:
1. Archivo: [NOMBRE]
   - Línea: [NÚMERO]
   - Cambio: [DESCRIPCIÓN]
   - Código a agregar: [CÓDIGO]
Resultado esperado: Lista de cambios documentada
```

### 8.3 Validación del Modelo IA

```
Verificar:
- [ ] Todos los puntos de inserción están identificados
- [ ] El código de integración es correcto
- [ ] Los cambios están bien documentados
- [ ] No se rompe la funcionalidad existente
```

---

## 9. Sección 9: Creación de Endpoints HTTP

### 9.1 Objetivo de esta Sección

Crear endpoints HTTP para consultar eventos (si el usuario lo solicitó).

### 9.2 Tareas para el Modelo IA

**CONDICIÓN:** Solo ejecutar si el usuario especificó "SÍ" en "¿Necesita endpoints HTTP?"

**Tarea 9.1: Determinar ubicación del handler**

```
Regla: Usar src/handlers/pipeline-events.ts o la ruta alternativa especificada
Si la carpeta no existe, crearla primero
Resultado esperado: Ubicación del archivo de handlers
```

**Tarea 9.2: Leer handlers existentes**

```
Ejecuta: read_file en handlers existentes del proyecto
Objetivo: Entener el patrón de handlers existentes
Resultado esperado: Comprensión del patrón de handlers
```

**Tarea 9.3: Crear handler de cronología**

```
Ejecuta: write_to_file en [UBICACIÓN_DETERMINADA]
Contenido: Handler para GET /api/pipeline/cronologia/:entityId

Debe incluir:
1. Importación de getEntityEvents
2. Extracción de entityId de los parámetros
3. Llamada a getEntityEvents
4. Retorno de respuesta JSON
Resultado esperado: Handler de cronología creado
```

**Tarea 9.4: Crear handler de monitor**

```
Ejecuta: write_to_file en [UBICACIÓN_DETERMINADA] (mismo archivo)
Contenido: Handler para GET /api/pipeline/monitor

Debe incluir:
1. Importación de getLatestEventsByMultipleEntities
2. Extracción de parámetros de paginación
3. Llamada a getLatestEventsByMultipleEntities
4. Retorno de respuesta JSON
Resultado esperado: Handler de monitor creado
```

**Tarea 9.5: Documentar rutas**

```
Crear lista de rutas a agregar:
1. GET /api/pipeline/cronologia/:entityId - Obtiene cronología de eventos
2. GET /api/pipeline/monitor - Obtiene últimos eventos de múltiples entidades
Resultado esperado: Lista de rutas documentada
```

### 9.3 Validación del Modelo IA

```
Verificar:
- [ ] Los handlers siguen el patrón existente
- [ ] Las rutas están bien definidas
- [ ] Los handlers manejan errores correctamente
- [ ] Las respuestas tienen el formato correcto
```

---

## 10. Sección 10: Documentación Final

### 10.1 Objetivo de esta Sección

Crear documentación final para el proyecto.

### 10.2 Tareas para el Modelo IA

**Tarea 10.1: Crear README del sistema**

```
Ejecuta: write_to_file en README-pipeline-events.md
Contenido: Documentación del sistema de auditoría

Debe incluir:
1. Descripción del sistema
2. Cómo usarlo
3. Referencia a ejemplos
4. Referencia a documentación del Starter Kit
Resultado esperado: README del sistema creado
```

**Tarea 10.2: Actualizar README principal del proyecto**

```
Ejecuta: read_file en README.md del proyecto
Objetivo: Identificar dónde agregar referencia al sistema
Resultado esperado: Ubicación para agregar referencia
```

**Tarea 10.3: Generar resumen de cambios**

```
Crear resumen completo de todos los cambios realizados:
1. Archivos creados
2. Archivos modificados
3. Comandos a ejecutar
4. Próximos pasos
Resultado esperado: Resumen de cambios generado
```

### 10.3 Validación del Modelo IA

```
Verificar:
- [ ] El README del sistema es claro y completo
- [ ] La referencia en el README principal está bien ubicada
- [ ] El resumen de cambios es completo
- [ ] No falta información importante
```

---

## Prompt Principal para el Modelo IA

Copia y usa este prompt para activar la guía completa:

```
# Instrucciones para el Modelo IA

Quiero incorporar el Starter Kit de auditoría de eventos ubicado en plans/pipeline-eventos-starter-kit/ a mi proyecto.

## Contexto del Proyecto

[PEGA AQUÍ EL CONTENIDO COMPLETO DE LA SECCIÓN 0 DEL ARCHIVO 07-guia-despliegue-autonoma.md]

## Instrucciones de Ejecución

Por favor, ejecuta la guía completa de despliegue autónoma ubicada en plans/pipeline-eventos-starter-kit/07-guia-despliegue-autonoma.md.

Sigue todas las secciones en orden:
1. Sección 1: Análisis del Contexto
2. Sección 2: Creación de Migración SQL
3. Sección 3: Creación de Tipos TypeScript
4. Sección 4: Creación de Librería
5. Sección 5: Creación de Ejemplos
6. Sección 6: Ejecución de Migración
7. Sección 7: Validación
8. Sección 8: Integración en el Pipeline (si aplica)
9. Sección 9: Creación de Endpoints HTTP (si aplica)
10. Sección 10: Documentación Final

Para cada sección:
- Lee las tareas detalladas
- Ejecuta cada tarea en el orden indicado
- Verifica los resultados esperados
- Documenta cualquier desviación o problema

## Restricciones

- No modifiques el contenido del Starter Kit, solo cópialo
- Ajusta solo las rutas de importación según la estructura del proyecto
- Usa la estructura de carpetas especificada en el contexto
- Sigue los patrones de código existentes en el proyecto
- No ejecutes comandos que modifiquen la base de datos sin confirmación
- Documenta todos los cambios realizados

## Resultado Esperado

Al finalizar, proporciona:
1. Lista de archivos creados
2. Lista de archivos modificados
3. Comandos a ejecutar por el usuario
4. Resumen de validaciones
5. Próximos pasos recomendados
```

---

## Notas Importantes

1. **Autonomía:** Esta guía está diseñada para funcionar como un sistema autónomo. El modelo IA debe poder ejecutar todas las tareas sin necesidad de instrucciones adicionales.

2. **Validación en cada sección:** Cada sección incluye tareas de validación que el modelo IA debe ejecutar antes de pasar a la siguiente sección.

3. **Condicionales:** Algunas secciones (8 y 9) solo se ejecutan si el usuario lo especificó en la Sección 0.

4. **Documentación:** El modelo IA debe documentar todos los cambios realizados y proporcionar instrucciones claras para el usuario.

5. **Seguridad:** El modelo IA no debe ejecutar comandos que modifiquen la base de datos sin confirmación explícita del usuario.

---

**Fin de la Guía de Despliegue Autónoma**
