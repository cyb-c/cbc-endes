# Instrucciones para Incorporar el Starter Kit a un Proyecto

**Versión:** 1.0  
**Fecha:** 27 de marzo de 2026  
**Propósito:** Guía para incorporar el Starter Kit a un proyecto existente usando un modelo IA del IDE

---

## Índice de Contenidos

1. [Escenario: Clonar el Starter Kit en un Repo](#1-escenario-clonar-el-starter-kit-en-un-repo)
2. [Instrucciones para el Modelo IA del IDE](#2-instrucciones-para-el-modelo-ia-del-ide)
3. [Prompt Template para el Modelo IA](#3-prompt-template-para-el-modelo-ia)
4. [Pasos de Incorporación Manual](#4-pasos-de-incorporación-manual)
5. [Validación de la Incorporación](#5-validación-de-la-incorporación)

---

## 1. Escenario: Clonar el Starter Kit en un Repo

### 1.1 Estructura del Repo con Starter Kit

Si clonas el directorio `plans/pipeline-eventos-starter-kit` en tu repo, la estructura sería:

```
tu-proyecto/
├── plans/
│   └── pipeline-eventos-starter-kit/    # ← Starter Kit clonado aquí
│       ├── 00-RESUMEN.md
│       ├── README.md
│       ├── 01-guia-implementacion.md
│       ├── 02-schema-sql.md
│       ├── 03-types.md
│       ├── 04-lib-pipeline-events.md
│       ├── 05-migracion.md
│       └── 06-instrucciones-ia-ide.md   # ← Este archivo
├── src/
│   ├── types/
│   └── lib/
├── migrations/
└── wrangler.toml
```

### 1.2 Objetivo

El objetivo es que el Starter Kit deje de ser documentación externa y se convierta en parte integrante del proyecto, con:

- Archivos de código copiados a las ubicaciones correctas
- Migraciones SQL en la carpeta de migraciones
- Documentación accesible desde el repo

---

## 2. Instrucciones para el Modelo IA del IDE

### 2.1 Contexto para el Modelo IA

Cuando uses un modelo IA del IDE (como Roo, Cursor, Copilot, etc.), proporciona el siguiente contexto:

```
Tengo un Starter Kit de auditoría de eventos en plans/pipeline-eventos-starter-kit/.
Quiero incorporarlo a mi proyecto actual que usa Cloudflare D1.

El Starter Kit contiene:
- 02-schema-sql.md: Schema SQL de la tabla pipeline_eventos
- 03-types.md: Tipos TypeScript
- 04-lib-pipeline-events.md: Librería de funciones

Mi estructura de proyecto es:
- src/types/: para tipos TypeScript
- src/lib/: para librerías
- migrations/: para scripts SQL
```

### 2.2 Tareas Solicitadas al Modelo IA

```
Por favor:
1. Lee el contenido de plans/pipeline-eventos-starter-kit/02-schema-sql.md
2. Crea un archivo de migración en migrations/ con el SQL
3. Lee el contenido de plans/pipeline-eventos-starter-kit/03-types.md
4. Crea src/types/pipeline-events.ts con el contenido de tipos
5. Lee el contenido de plans/pipeline-eventos-starter-kit/04-lib-pipeline-events.md
6. Crea src/lib/pipeline-events.ts con el contenido de la librería
7. Ajusta las rutas de importación en src/lib/pipeline-events.ts según mi estructura
8. Crea un ejemplo de uso en src/examples/pipeline-events-example.ts
```

---

## 3. Prompt Template para el Modelo IA

### 3.1 Prompt Completo

Copia y adapta este prompt según tu proyecto:

```
# Contexto
Tengo un Starter Kit de auditoría de eventos en plans/pipeline-eventos-starter-kit/.
Quiero incorporarlo a mi proyecto actual que usa Cloudflare D1 y TypeScript.

# Estructura del Starter Kit
- 00-RESUMEN.md: Resumen rápido
- README.md: Descripción general
- 01-guia-implementacion.md: Guía de implementación
- 02-schema-sql.md: Schema SQL (CREATE TABLE pipeline_eventos)
- 03-types.md: Tipos TypeScript (PipelineEvent, InsertPipelineEventParams, etc.)
- 04-lib-pipeline-events.md: Librería de funciones (insertPipelineEvent, getEntityEvents, etc.)
- 05-migracion.md: Script de migración desde schema acoplado

# Mi Estructura de Proyecto
- src/types/: tipos TypeScript
- src/lib/: librerías
- migrations/: scripts SQL de migración
- src/examples/: ejemplos de uso (si aplica)

# Tareas Solicitadas

1. **Crear migración SQL:**
   - Lee plans/pipeline-eventos-starter-kit/02-schema-sql.md
   - Crea migrations/001-create-pipeline-events.sql con el contenido SQL
   - Asegúrate de incluir la tabla y los índices

2. **Crear tipos TypeScript:**
   - Lee plans/pipeline-eventos-starter-kit/03-types.md
   - Crea src/types/pipeline-events.ts con el contenido de tipos
   - No modifiques los tipos, solo cópialos

3. **Crear librería:**
   - Lee plans/pipeline-eventos-starter-kit/04-lib-pipeline-events.md
   - Crea src/lib/pipeline-events.ts con el contenido de la librería
   - Ajusta la ruta de importación de tipos: '../types/pipeline-events'

4. **Crear ejemplo de uso:**
   - Crea src/examples/pipeline-events-example.ts
   - Incluye ejemplos de:
     * insertPipelineEvent con éxito
     * insertPipelineEvent con error
     * getEntityEvents
     * getLatestEvent
     * getErrorEvents

5. **Validar:**
   - Verifica que las importaciones sean correctas
   - Verifica que los tipos sean consistentes
   - Lista los archivos creados

# Restricciones
- No modifiques el contenido del Starter Kit, solo cópialo
- Ajusta solo las rutas de importación
- Usa la estructura de carpetas especificada
- No ejecutes comandos, solo crea archivos
```

### 3.2 Prompt Simplificado (para tareas específicas)

```
# Tarea: Crear migración SQL
Lee plans/pipeline-eventos-starter-kit/02-schema-sql.md y crea migrations/001-create-pipeline-events.sql con el contenido SQL.
```

```
# Tarea: Crear tipos TypeScript
Lee plans/pipeline-eventos-starter-kit/03-types.md y crea src/types/pipeline-events.ts con el contenido de tipos.
```

```
# Tarea: Crear librería
Lee plans/pipeline-eventos-starter-kit/04-lib-pipeline-events.md y crea src/lib/pipeline-events.ts con el contenido de la librería.
Ajusta la ruta de importación de tipos a '../types/pipeline-events'.
```

---

## 4. Pasos de Incorporación Manual

Si prefieres hacerlo manualmente sin usar un modelo IA:

### 4.1 Crear Migración SQL

```bash
# Crear archivo de migración
cat migrations/001-create-pipeline-events.sql <<'EOF'
-- Copia el contenido de 02-schema-sql.md aquí
EOF
```

### 4.2 Crear Tipos TypeScript

```bash
# Crear archivo de tipos
cat src/types/pipeline-events.ts <<'EOF'
// Copia el contenido de 03-types.md aquí
EOF
```

### 4.3 Crear Librería

```bash
# Crear archivo de librería
cat src/lib/pipeline-events.ts <<'EOF'
// Copia el contenido de 04-lib-pipeline-events.md aquí
// Ajusta la ruta de importación a '../types/pipeline-events'
EOF
```

### 4.4 Ejecutar Migración

```bash
# Ejecutar migración en D1
npx wrangler d1 execute <TU_DATABASE> --file=./migrations/001-create-pipeline-events.sql
```

---

## 5. Validación de la Incorporación

### 5.1 Verificar Archivos Creados

```bash
# Listar archivos creados
ls -la migrations/001-create-pipeline-events.sql
ls -la src/types/pipeline-events.ts
ls -la src/lib/pipeline-events.ts
```

### 5.2 Verificar Importaciones

En `src/lib/pipeline-events.ts`, verifica que la importación sea correcta:

```typescript
// Debe ser así (ajusta según tu estructura)
import type { ... } from '../types/pipeline-events'
```

### 5.3 Verificar Compilación

```bash
# Verificar que TypeScript compile sin errores
npx tsc --noEmit
```

### 5.4 Probar Funciones

Crea un archivo de prueba:

```typescript
// test-pipeline-events.ts
import { insertPipelineEvent, getEntityEvents } from './src/lib/pipeline-events'

async function test() {
  const db = // tu instancia de D1Database
  
  await insertPipelineEvent(db, {
    entityId: 'test-123',
    paso: 'TEST',
    nivel: 'INFO',
    tipoEvento: 'STEP_SUCCESS',
  })
  
  const eventos = await getEntityEvents(db, 'test-123')
  console.log(eventos)
}

test()
```

---

## 6. Integración en el Pipeline del Proyecto

### 6.1 Agregar a tu Pipeline Existente

```typescript
// En tu código de pipeline existente
import { insertPipelineEvent } from './lib/pipeline-events'

async function processStep(entityId: string) {
  const startTime = Date.now()
  
  try {
    // ... tu lógica de procesamiento ...
    
    await insertPipelineEvent(db, {
      entityId,
      paso: 'MY_STEP',
      nivel: 'INFO',
      tipoEvento: 'STEP_SUCCESS',
      duracionMs: Date.now() - startTime,
    })
  } catch (error) {
    await insertPipelineEvent(db, {
      entityId,
      paso: 'MY_STEP',
      nivel: 'ERROR',
      tipoEvento: 'STEP_FAILED',
      errorCodigo: 'MY_ERROR_CODE',
      detalle: error.message,
      duracionMs: Date.now() - startTime,
    })
    throw error
  }
}
```

### 6.2 Crear Endpoints HTTP (Opcional)

```typescript
// src/handlers/pipeline-events.ts
import { getEntityEvents, getLatestEvent } from '../lib/pipeline-events'

export async function handleGetCronologia(req: Request, env: Env) {
  const url = new URL(req.url)
  const entityId = url.pathname.split('/').pop()
  
  const eventos = await getEntityEvents(env.DB, entityId, {
    order: 'DESC',
    limit: 100,
  })
  
  return Response.json({ data: { entityId, eventos } })
}
```

---

## 7. Checklist Final

- [ ] Migración SQL creada en `migrations/001-create-pipeline-events.sql`
- [ ] Tipos TypeScript creados en `src/types/pipeline-events.ts`
- [ ] Librería creada en `src/lib/pipeline-events.ts`
- [ ] Rutas de importación ajustadas
- [ ] Migración ejecutada en D1
- [ ] Compilación TypeScript exitosa
- [ ] Pruebas de funciones exitosas
- [ ] Integración en el pipeline del proyecto
- [ ] Documentación actualizada

---

## 8. Recursos Adicionales

- Para más detalles, consulta [`01-guia-implementacion.md`](01-guia-implementacion.md)
- Para referencia rápida, consulta [`00-RESUMEN.md`](00-RESUMEN.md)
- Para migración desde schema acoplado, consulta [`05-migracion.md`](05-migracion.md)

---

**Fin de las Instrucciones para el Modelo IA del IDE**
