# Inventario de Recursos y Configuración

> **Finalidad:** Fuente única de verdad para recursos Cloudflare, CI/CD, bindings, variables de entorno y configuración operativa del proyecto.
> **Versión:** 16.0
> **Importante:** Este archivo es gestionado exclusivamente por el agente `inventariador`. Las modificaciones directas serán rechazadas.

---

## Leyenda de Estado

| Símbolo | Significado |
|---------|-------------|
| ✅ | Existe en Cloudflare y está referenciado correctamente en el repositorio |
| ⚠️ | Existe en Cloudflare pero hay discrepancia con el repositorio |
| 🔲 | Declarado en configuración pero NO creado en Cloudflare |
| 🚫 | Servicio Cloudflare no habilitado en la cuenta |
| 🗑️ | Existe en Cloudflare pero sin referencia en el repositorio (huérfano) |
| ❌ | Eliminado (existió pero fue removido intencionalmente) |

---

## Reglas de Uso

- No inventar valores.
- No incluir secretos ni credenciales en texto plano.
- **Solo el agente `inventariador` puede actualizar este archivo.**
- Todo agente debe consultarlo antes de ejecutar trabajo con impacto operativo.
- Para solicitar cambios, usa el prompt: "Necesito actualizar el inventario: [detalles]"

---

## 1. Resumen del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre del proyecto** | `cbc-endes` |
| **Finalidad** | Gestión de proyectos de análisis inmobiliarios (PAI), menú dinámico, pipeline events, y almacenamiento de archivos en R2 |
| **Entorno de trabajo** | GitHub Codespaces |
| **Lenguaje base** | TypeScript |
| **Entornos de despliegue** | dev (preview), production |
| **CI/CD y GitHub Secrets** | GitHub Secrets configurados (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID) |
| **Estructura del proyecto** | Monorepo (`apps/worker`, `apps/frontend`) |
| **Repositorio GitHub** | https://github.com/cyb-c/cbc-endes |

---

## 2. GitHub Secrets (CI/CD)

| Secret | Uso | Consume | Estado |
|--------|-----|---------|--------|
| `CLOUDFLARE_API_TOKEN` | Token para API de Cloudflare | Wrangler CLI | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | Identificador de cuenta para despliegues | Wrangler CLI | ✅ |

**Account ID:** `ef640df5accdc7355f5892983d5ef05d`

> **Nota:** Los valores de secrets nunca se documentan en este archivo. Usar `wrangler secret put` para gestión local.

---

## 3. Secrets de Desarrollo Local

### 3.1. Backend (`.dev.vars`)

| Variable | Uso | Sensible | Estado |
|----------|-----|----------|--------|
| `OPENAI_API_KEY` | API Key para OpenAI (IA) | Sí | ✅ Configurado en KV `secretos-cbconsulting` |

### 3.2. Frontend (`.env`)

| Variable | Uso | Sensible | Estado |
|----------|-----|----------|--------|
| `VITE_API_BASE_URL` | URL base de la API backend | No | ✅ |
| `VITE_ENVIRONMENT` | Entorno de ejecución | No | ✅ |
| `VITE_USE_DYNAMIC_MENU` | Activar menú dinámico | No | ✅ |

> **Nota:** Usar `.dev.vars.example` y `.env.example` como plantillas versionadas sin valores reales.

---

## 4. Recursos Cloudflare

### 4.1 Workers

| Nombre | Binding | App/Proyecto | Puerto Dev | Estado CF | URL Producción | Último Deploy | Notas |
|--------|---------|--------------|------------|-----------|----------------|---------------|-------|
| `wk-backend-dev` | `db_binding_01, r2_binding_01, secrets_kv` | Backend API (dev) | 8787 | ✅ | https://wk-backend-dev-dev.cbconsulting.workers.dev | 2026-03-28 | FASE 4 COMPLETADA + IA DESPLEGADA: 10 endpoints PAI operativos, integración OpenAI activa (KV + R2 prompts), servicio creación proyectos con IA funcional, correcciones SQL aplicadas, pruebas E2E 100% aprobadas |

### 4.2 KV Namespaces

| Nombre en CF | ID | Binding | App | Estado |
|--------------|----|---------|-----|--------|
| `secretos-cbconsulting` | `50eb21ab606d4fd5a409e532347cf686` | `secrets_kv` | `wk-backend-dev` | ✅ Creado (secret `OPENAI_API_KEY` configurado) |

**Secrets configurados:**
- `OPENAI_API_KEY` - API Key para OpenAI Responses API

### 4.3 Bases de Datos (D1)

| Nombre | Binding | App | ID | Estado | Notas |
|--------|---------|-----|----|--------|-------|
| `db-cbconsulting` | `db_binding_01` | `wk-backend-dev` | `fafcd5e2-b960-49f7-8502-88a0f8ba5052` | ✅ | Menú dinámico v1 + PAI (tablas PAI_PRO_proyectos, PAI_VAL_valores modificadas en FASE 4) |

**Nota:** La D1 Database `db-cbconsulting` está activa y contiene las tablas del menú dinámico y PAI.

**Migraciones aplicadas:**
- ✅ `005-pai-mvp-datos-iniciales.sql` (corregida con INSERT OR IGNORE)
- ✅ `009-pai-agregar-columna-pro-ijson.sql`
- ✅ `010-pai-notas-estado-val-id-nullable.sql`

**Problemas conocidos:**
- ✅ Todos los problemas críticos RESUELTOS

### 4.4 Buckets R2

| Nombre | Binding | App | Estado | Notas |
|--------|---------|-----|--------|-------|
| `r2-cbconsulting` | `r2_binding_01` | `wk-backend-dev` | ✅ | Bucket R2 para almacenamiento de archivos PAI y prompts de IA |

**Estructura de carpetas:**
```
r2-cbconsulting/
├── analisis-inmuebles/{CII}/
│   ├── {CII}.json (IJSON original)
│   ├── {CII}_*.md (Artefactos Markdown: resumen-ejecutivo, datos-transformados, etc.)
│   └── {CII}_log.json (Tracking log completo)
└── prompts-ia/
    └── 00_CrearProyecto.json (Prompt template para OpenAI Responses API)
```

**Nota:** El bucket R2 de prueba fue eliminado el 2026-03-27. El bucket `r2-cbconsulting` está activo para almacenamiento de archivos PAI y prompts de IA.

### 4.5 Queues

| Nombre | Binding (Productor) | Binding (Consumidor) | App | Estado |
|--------|---------------------|----------------------|-----|--------|
| *Sin colas configuradas* | - | - | - | - |

### 4.6 Workflows

| Nombre | Binding | Clase | Worker Asociado | Estado |
|--------|---------|-------|-----------------|--------|
| *Sin workflows configurados* | - | - | - | - |

**Nota:** Workflows se implementarán en Fase 2 (definición y diseño).

### 4.7 Workers AI

| Binding | Modelo | App | Estado |
|---------|--------|-----|--------|
| *Sin AI configurado* | - | - | - |

**Nota:** Integración con IA se planificará en Fase 2.

### 4.8 Vectorize (opcional)

| Nombre | Binding | Dimensiones | Métrica | Estado |
|--------|---------|-------------|---------|--------|
| *Sin Vectorize configurado* | - | - | - | - |

### 4.9 Cloudflare Pages / Frontend

| Proyecto | URL Producción | URL Preview | App Asociada | Proveedor Git | Estado |
|----------|----------------|-------------|--------------|---------------|--------|
| `pg-cbc-endes` | https://pg-cbc-endes.pages.dev | https://pg-cbc-endes.pages.dev | TailAdmin React + PAI | GitHub | ✅ |

Nota: No cambiar ni modificar la URL `pg-cbc-endes`. https://pg-cbc-endes.pages.dev es la única URL permitida  en deb y en producción.

**Configuración:**
- Production branch: `main`
- Build output dir: `dist`
- Framework: React + Vite + Tailwind CSS
- Build command: `npm run build`

**Cambios en FASE 4:**
- Sistema i18n multiidioma implementado (`es-ES` por defecto, `en-US` disponible)
- Contexto de idioma (`LocaleContext`) para gestión global
- Función `t()` con soporte de locale opcional
- Hook `useLocale()` para cambio dinámico de idioma
- Archivo `.env.production` configurado correctamente
- Correcciones de TypeScript en múltiples archivos del frontend
- Despliegue exitoso a Cloudflare Pages (2026-03-28)

**Archivos de i18n:**
- `apps/frontend/src/i18n/es-ES.ts` - Textos en español (250+ textos)
- `apps/frontend/src/i18n/en-US.ts` - Textos en inglés (250+ textos)
- `apps/frontend/src/i18n/index.ts` - Sistema de traducción multiidioma
- `apps/frontend/src/context/LocaleContext.tsx` - Contexto de idioma

**Nota:** Pages es el ÚNICO recurso mantenido de la Fase 1. En FASE 4 se integró el módulo PAI con i18n multiidioma.

---

## 5. Wrangler y Despliegue

| Campo | Valor |
|-------|-------|
| **Uso de Wrangler** | Sí |
| **Archivo de configuración** | `wrangler.toml` (raíz + por app) |
| **Método de autenticación** | API Token vía variables de entorno (GitHub Secrets) |
| **Environments configurados** | dev, preview (Pages), production |
| **account_id** | `ef640df5accdc7355f5892983d5ef05d` (inyectado vía entorno) |
| **Wrangler versión** | 4.75.0 |

### 5.1 Bindings y Variables de Entorno (wrangler)

| Clave o Binding | Tipo | Estado | Ubicación | Observaciones |
|-----------------|------|--------|-----------|---------------|
| `db_binding_01` | D1 Database | ✅ | `apps/worker/wrangler.toml` | Binding para `db-cbconsulting` |
| `r2_binding_01` | R2 Bucket | ✅ | `apps/worker/wrangler.toml` | Binding al bucket `r2-cbconsulting` para almacenamiento de archivos PAI |
| `VITE_API_BASE_URL` | Variable frontend | ✅ | `apps/frontend/wrangler.toml` | URL de la API backend |
| `VITE_ENVIRONMENT` | Variable frontend | ✅ | `apps/frontend/wrangler.toml` | Entorno de ejecución |

---

## 6. Variables de Entorno por App

### `wk-backend-dev` (Backend)

| Variable | Tipo | Sensible | Descripción | Estado |
|----------|------|----------|-------------|--------|
| `db_binding_01` | D1 Binding | No | Binding a base de datos D1 | ✅ |
| *Por definir* | String | Sí | Variables para integraciones externas (IA) | 🔲 |

### `worker-cbc-endes` (Backend - Eliminado)

| Variable | Tipo | Sensible | Descripción | Estado |
|----------|------|----------|-------------|--------|
| *Por definir* | String | Sí | Variables para integraciones externas | 🔲 |

> **Nota:** El backend `worker-cbc-endes` fue eliminado. El backend activo es `wk-backend-dev`.

### `pg-cbc-endes` (Frontend Pages)

| Variable | Tipo | Sensible | Descripción | Estado | Valor Producción |
|----------|------|----------|-------------|--------|------------------|
| `VITE_API_BASE_URL` | String | No | URL base del backend API | ✅ | https://wk-backend-dev-dev.cbconsulting.workers.dev |
| `VITE_ENVIRONMENT` | String | No | Entorno (dev/preview/production) | ✅ | production |

**Archivo de configuración:** `apps/frontend/.env.production` (creado en FASE 4)

---

## 7. Integraciones Externas

| Servicio | Propósito | Variables Requeridas | Estado |
|----------|-----------|---------------------|--------|
| **OpenAI Responses API** | Inferencia IA para extracción de datos y generación de resúmenes | `OPENAI_API_KEY` (en KV `secretos-cbconsulting`) | ✅ Implementada (FASE 4) |
| *Anthropic, etc.* | Proveedores alternativos de IA | `ANTHROPIC_API_KEY` | 🔲 Pendiente |

**Nota:** La integración con OpenAI está implementada y operativa desde FASE 4. El prompt template está almacenado en R2 (`prompts-ia/00_CrearProyecto.json`).

---

## 8. Contratos entre Servicios

| Servicio Origen | Servicio Destino | Endpoint | Método | Request | Response | Estado |
|-----------------|------------------|----------|--------|---------|----------|--------|
| Frontend (Pages) | `wk-backend-dev` | `/api/menu` | GET | Ninguno | JSON con estructura de menú agrupada por módulos | ✅ |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos` | POST | `{ ijson: string }` | `{ proyecto: {...} }` | ✅ |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos/:id` | GET | Ninguno | `{ proyecto: {...}, artefactos: [...], notas: [...] }` | ✅ |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos` | GET | Query params (filtros, paginación) | `{ proyectos: [...], paginacion: {...} }` | ✅ |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos/:id/analisis` | POST | `{ forzar_reejecucion?: boolean }` | `{ proyecto: {...}, artefactos_generados: [...] }` | ✅ |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos/:id/artefactos` | GET | Ninguno | `{ artefactos: [...] }` | ✅ |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos/:id/estado` | PUT | `{ estado_id: number, ... }` | `{ proyecto: {...} }` | ✅ |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos/:id` | DELETE | Ninguno | `{ mensaje: "...", proyecto_eliminado: {...} }` | ✅ |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos/:id/pipeline` | GET | Query params (limite) | `{ eventos: [...] }` | ✅ |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos/:id/pipeline` | GET | `?tipo=cambio_estado` | `{ eventos: [...] }` | ✅ (FASE 3 P1.3) |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos/:id/notas` | POST | `{ tipo_nota_id, autor, contenido }` | `{ nota: {...} }` | ✅ |
| Frontend (Pages) | `wk-backend-dev` | `/api/pai/proyectos/:id/notas/:notaId` | PUT | `{ contenido: string }` | `{ nota: {...} }` | ✅ |

**Endpoints del Worker:**

| Endpoint | Método | Descripción | Response | Estado |
|----------|--------|-------------|----------|--------|
| `/api/health` | GET | Health check del servicio | `{ status: "ok", timestamp, service, version }` | ✅ |
| `/api/test` | GET | Test endpoint de disponibilidad | `{ message, hono, typescript }` | ✅ |
| `/api/menu` | GET | Obtiene estructura de menú dinámico | `{ modulos: [...] }` con módulos y funciones | ✅ |
| `/api/pai/proyectos` | POST | Crear nuevo proyecto PAI | `{ proyecto: {...} }` | ✅ |
| `/api/pai/proyectos/:id` | GET | Obtener detalles de proyecto PAI | `{ proyecto: {...}, artefactos: [...], notas: [...] }` | ✅ |
| `/api/pai/proyectos` | GET | Listar proyectos PAI con filtros y paginación | `{ proyectos: [...], paginacion: {...} }` | ✅ |
| `/api/pai/proyectos/:id/analisis` | POST | Ejecutar análisis completo de proyecto PAI | `{ proyecto: {...}, artefactos_generados: [...] }` | ✅ |
| `/api/pai/proyectos/:id/artefactos` | GET | Obtener artefactos de proyecto PAI | `{ artefactos: [...] }` | ✅ |
| `/api/pai/proyectos/:id/estado` | PUT | Cambiar estado manual de proyecto PAI | `{ proyecto: {...} }` | ✅ |
| `/api/pai/proyectos/:id` | DELETE | Eliminar proyecto PAI y sus artefactos | `{ mensaje: "...", proyecto_eliminado: {...} }` | ✅ |
| `/api/pai/proyectos/:id/pipeline` | GET | Obtener historial de ejecución de proyecto PAI | `{ eventos: [...] }` | ✅ |
| `/api/pai/proyectos/:id/notas` | POST | Crear nota asociada a proyecto PAI | `{ nota: {...} }` | ✅ |
| `/api/pai/proyectos/:id/notas/:notaId` | PUT | Editar nota existente de proyecto PAI | `{ nota: {...} }` | ✅ |

---

## 9. Stack Tecnológico

| Capa | Tecnología | Versión | Estado |
|------|------------|---------|--------|
| Lenguaje | TypeScript | 5.4.0+ | ✅ |
| Backend Framework | Hono | ^4.6.0 | ✅ |
| Frontend | React | 18.x | ✅ |
| Build tool (Frontend) | Vite | 6.1.0 | ✅ |
| UI Framework | TailAdmin Free React | Latest | ✅ |
| Styling | Tailwind CSS | Latest | ✅ |
| Runtime | Cloudflare Workers | Latest | ✅ |
| Deployment | Wrangler | 4.75.0 | ✅ |

---

## 10. Comandos de Desarrollo

### 10.1 Comandos Globales

```bash
# Verificar autenticación
wrangler whoami

# Listar recursos
wrangler pages project list
wrangler d1 list          # Sin D1 activas
wrangler r2 bucket list   # Sin R2 activos
```

### 10.2 Comandos por Servicio

| Servicio | Dev | Build | Deploy |
|----------|-----|-------|--------|
| Worker | `cd apps/worker && npm run dev` | - | `cd apps/worker && npm run deploy` |
| Frontend | `cd apps/frontend && npm run dev` | `cd apps/frontend && npm run build` | `wrangler pages deploy dist` |

### 10.3 Migraciones de Base de Datos

```bash
# Migración aplicada a db-cbconsulting
wrangler d1 migrations apply db-cbconsulting

# Ver migraciones ejecutadas
wrangler d1 migrations list db-cbconsulting
```

**Migraciones aplicadas:**
- `002-menu-dinamico-v1.sql` - Crea tabla `MOD_modulos_config` para menú dinámico
- `003-pipeline-events.sql` - Crea tabla `pipeline_eventos` para tracking de eventos del pipeline
- `004-pai-mvp.sql` - Crea tablas PAI (PAI_ATR_atributos, PAI_VAL_valores, PAI_PRO_proyectos, PAI_NOT_notas, PAI_ART_artefactos) para gestión de proyectos de análisis inmobiliarios
- `005-pai-mvp-datos-iniciales.sql` - Datos iniciales para tablas PAI (37 registros en PAI_VAL_valores) ⚠️ Requiere re-ejecución en producción
- `006-pai-modulo-menu-proyectos.sql` - Agrega módulo "Proyectos" al menú dinámico
- `007-pai-agregar-columna-fecha-ultima-actualizacion.sql` - Agrega columna `PRO_fecha_ultima_actualizacion` a PAI_PRO_proyectos (FASE 4)
- `008-pai-agregar-valor-resumen-ejecutivo.sql` - Agrega valor `RESUMEN_EJECUTIVO` a PAI_VAL_valores (FASE 4)
- `009-pai-agregar-columna-pro-ijson.sql` - Agrega columna `PRO_ijson` a PAI_PRO_proyectos (FASE 2 P0.1)
- `010-pai-notas-estado-val-id-nullable.sql` - Hace nullable `NOT_estado_val_id` en PAI_NOT_notas (FASE 2 P0.3)

### 10.4 Gestión de Secrets

```bash
# Secret remoto (producción)
wrangler secret put [SECRET_NAME]

# Secret para entorno específico
wrangler secret put [SECRET_NAME] --env dev
```

---

## 11. Archivos de Configuración

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `wrangler.toml` | Configuración Wrangler (raíz) | ✅ |
| `apps/worker/wrangler.toml` | Configuración Worker (sin bindings) | ✅ |
| `apps/worker/package.json` | Dependencias backend | ✅ |
| `apps/worker/tsconfig.json` | Configuración TypeScript backend | ✅ |
| `apps/frontend/wrangler.toml` | Configuración Pages + variables | ✅ |
| `apps/frontend/package.json` | Dependencias frontend | ✅ |
| `apps/frontend/.env.example` | Plantilla variables frontend | ✅ |
| `.gitignore` | Exclusiones de versionado | ✅ |

**Archivos de Librería Backend (FASE 4):**

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `apps/worker/src/lib/openai-client.ts` | Cliente reutilizable para OpenAI Responses API | ✅ (FASE 4) |
| `apps/worker/src/lib/tracking.ts` | Sistema de tracking y generación de log.json | ✅ (FASE 4) |
| `apps/worker/src/services/ia-creacion-proyectos.ts` | Servicio de creación de proyectos con IA | ✅ (FASE 4) |

**Archivos de Documentación Backend:**

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `apps/worker/docs/PAI_ERROR_HANDLING.md` | Estrategia de manejo de errores para endpoints PAI | ✅ (FASE 2 P2.3) |

**Archivos de Documentación Técnica (FASE 4):**

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `plans/proyecto-PIA/doc-base/integracion-openai-api.md` | Documentación completa de integración con OpenAI | ✅ (FASE 4) |
| `plans/proyecto-PIA/doc-base/tracking-workflow.md` | Documentación del sistema de tracking | ✅ (FASE 4) |

**Archivos de Componentes Frontend PAI:**

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `apps/frontend/src/components/pai/ResultadosAnalisis.tsx` | Componente de 9 pestañas de resultados de análisis | ✅ (FASE 3 P0.2) |
| `apps/frontend/src/components/pai/Paginacion.tsx` | Componente de paginación UI para listados | ✅ (FASE 3 P1.1) |
| `apps/frontend/src/components/pai/VisualizadorMarkdown.tsx` | Visualizador de contenido Markdown | ✅ (FASE 3 P1.2) |

**Archivos de Hooks Frontend PAI:**

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `apps/frontend/src/hooks/useNotaEditable.ts` | Hook para verificar editabilidad de notas por pipeline | ✅ (FASE 3 P1.3) |

**Archivos eliminados:**
- `migrations/001-initial.sql` - Migración D1 eliminada (ya no aplica)

---

## 13. Historial de Cambios

| Fecha | Cambio | Responsable | Aprobado Por |
|-------|--------|-------------|--------------|
| 2026-03-28 | Actualización v16.0 - Inventario actualizado con integración OpenAI completa: librerías (openai-client.ts, tracking.ts, ia-creacion-proyectos.ts), documentación técnica (integracion-openai-api.md, tracking-workflow.md), estructura R2 detallada, endpoints documentados | inventariador | Pendiente aprobación usuario |
| 2026-03-28 | Actualización v15.0 - Documentación técnica creada: integracion-openai-api.md, tracking-workflow.md en `plans/proyecto-PIA/doc-base/` | inventariador | Pendiente aprobación usuario |
| 2026-03-28 | Actualización v14.0 - Sistema de tracking implementado: tracking.ts, log.json en R2, wrangler tail operativo | inventariador | Pendiente aprobación usuario |
| 2026-03-28 | Actualización v13.0 - Integración OpenAI DESPLEGADA: KV ID confirmado, worker deployado con IA, prompt en R2 operativo | inventariador | Pendiente aprobación usuario |
| 2026-03-28 | Actualización v12.0 - Integración OpenAI: KV `secretos-cbconsulting` con `OPENAI_API_KEY`, prompts en R2 `prompts-ia/` | inventariador | Pendiente aprobación usuario |
| 2026-03-28 | Actualización v11.0 - FASE 4 COMPLETADA: Correcciones P0 (PRO_ijson, ACTIVO, SQL), P1 (reportes), P2 (i18n multiidioma en-US), Pruebas E2E 100% aprobadas | inventariador | Pendiente aprobación usuario |
| 2026-03-28 | Actualización v10.0 - FASE 2 P0/P1 y FASE 3 P0/P1 completadas (correcciones críticas e importantes) | inventariador | Pendiente aprobación usuario |
| 2026-03-28 | Actualización v9.0 - FASE 4: Integración y Pruebas completada (i18n, .env.production, Migraciones 007/008, Despliegue Pages, Pruebas E2E) | inventariador | Pendiente aprobación usuario |
| 2026-03-27 | Actualización v7.0 - FASE 1 PAI completada: Pipeline Events, Esquema PAI (PRO/ATR/VAL/NOT/ART), R2 Storage | Orchestrator | Aprobado |
| 2026-03-27 | Despliegue de menú dinámico v1: Worker `wk-backend-dev`, D1 `db-cbconsulting`, binding `db_binding_01`, endpoint `/api/menu` | inventariador | usuario |
| 2026-03-27 | Eliminación de recursos de prueba (Worker, D1, R2) | inventariador | usuario |
| 2026-03-26 | Despliegue de frontend TailAdmin en Pages | inventariador | usuario |
| 2026-03-26 | Fase 1: Creación de recursos de prueba (Worker, D1, R2, Pages) | inventariador | usuario |

---

## Notas de Mantenimiento

1. **Actualización exclusiva:** Solo el agente `inventariador` puede actualizar este archivo.
2. **Solicitud de cambios:** Los usuarios deben solicitar cambios a través del orquestador.
3. **Auditoría periódica:** El agente `inventory-auditor` verifica consistencia con recursos reales en Cloudflare.
4. **Aprobación:** Los cambios críticos requieren aprobación explícita del usuario antes de commit.
5. **Consulta previa:** Todo agente debe consultar este inventario antes de generar código que referencie recursos.
6. **No hardcoding:** Toda la información configurable debe quedar fuera del código o en KV si fuera necesario.
7. **Sistema multidioma (i18n):** 
   - Idioma por defecto: `es-ES` (Español de España) según R5
   - Idioma secundario disponible: `en-US` (English US)
   - Archivos: `apps/frontend/src/i18n/es-ES.ts`, `apps/frontend/src/i18n/en-US.ts`
   - Contexto: `apps/frontend/src/context/LocaleContext.tsx`
   - Función de traducción: `t(key, locale?)` con soporte de locale opcional
8. **Integración con OpenAI:**
   - KV namespace: `secretos-cbconsulting`
   - Secret: `OPENAI_API_KEY` (acceso runtime desde Worker)
   - Prompts almacenados en R2: `r2-cbconsulting/prompts-ia/`
   - Prompt principal: `00_CrearProyecto.json` (Responses API format)
   - Modelo: Definido dentro de cada prompt JSON (no requiere variable OPENAI_MODEL)
   - Librerías: `apps/worker/src/lib/openai-client.ts`, `apps/worker/src/services/ia-creacion-proyectos.ts`
   
9. **Sistema de Tracking:**
   - Librería: `apps/worker/src/lib/tracking.ts`
   - log.json almacenado en R2: `analisis-inmuebles/{CII}/{CII}_log.json`
   - Wrangler tail: Disponible para debugging en tiempo real
   - Documentación: `plans/proyecto-PIA/doc-base/tracking-workflow.md`

10. **Documentación Técnica FASE 4:**
    - `plans/proyecto-PIA/doc-base/integracion-openai-api.md` - Documentación completa de integración con OpenAI
    - `plans/proyecto-PIA/doc-base/tracking-workflow.md` - Documentación del sistema de tracking
    - `temp/faltantes-inventario-recursos.md` - Lista de faltantes para actualización del inventario
