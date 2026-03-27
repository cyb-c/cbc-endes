# Inventario de Recursos y Configuración

> **Finalidad:** Fuente única de verdad para recursos Cloudflare, CI/CD, bindings, variables de entorno y configuración operativa del proyecto.
> **Versión:** 7.0
> **Importante:** Este archivo es gestionado exclusivamente por el agente `inventariador`. Las modificaciones directas serán rechazadas.
> **Última actualización:** 2026-03-27 (FASE 1 PAI)

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
| *Por definir* | Variables para integraciones externas (IA) | Sí | 🔲 |

### 3.2. Frontend (`.env`)

| Variable | Uso | Sensible | Estado |
|----------|-----|----------|--------|
| `VITE_API_BASE_URL` | URL base de la API backend | No | ✅ |
| `VITE_ENVIRONMENT` | Entorno de ejecución | No | ✅ |

> **Nota:** Usar `.dev.vars.example` y `.env.example` como plantillas versionadas sin valores reales.

---

## 4. Recursos Cloudflare

### 4.1 Workers

| Nombre | Binding | App/Proyecto | Puerto Dev | Estado CF | Último Deploy | Notas |
|--------|---------|--------------|------------|-----------|---------------|-------|
| `wk-backend` | `db_binding_01, r2_binding_01` | Backend API (dev) | 8787 | ✅ | 2026-03-27 | FASE 1 PAI completada (Pipeline Events, Esquema PAI, R2 Storage) |
| `worker-cbc-endes-dev` | N/A | Backend API (dev) | 8787 | ❌ Eliminado | 2026-03-26 | Recurso de prueba eliminado |

**Nota:** El Worker `wk-backend` está activo y proporciona endpoints para el menú dinámico. El Worker de prueba `worker-cbc-endes-dev` fue eliminado el 2026-03-27.

### 4.2 KV Namespaces

| Nombre en CF | ID | Binding | App | Estado |
|--------------|----|---------|-----|--------|
| *Sin KV configurado* | - | - | - | - |

### 4.3 Bases de Datos (D1)

| Nombre | Binding | App | ID | Estado | Notas |
|--------|---------|-----|----|--------|-------|
| `db-cbconsulting` | `db_binding_01` | `wk-backend` | `fafcd5e2-b960-49f7-8502-88a0f8ba5052` | ✅ | Menú dinámico v1 |
| `cbc-endes-db-test` | DB | worker-cbc-endes | `22892bef-3878-4ef0-bd7d-d28bc9656914` | ❌ Eliminada | Recurso de prueba eliminado |

**Nota:** La D1 Database `db-cbconsulting` está activa y contiene la tabla `MOD_modulos_config`. La base de datos de prueba `cbc-endes-db-test` fue eliminada el 2026-03-27.

### 4.4 Buckets R2

| Nombre | Binding | App | Estado | Notas |
|--------|---------|-----|--------|-------|
| `r2-cbconsulting` | `r2_binding_01` | `wk-backend` | ✅ | Bucket R2 para almacenamiento de archivos del proyecto PAI |
| `cbc-endes-storage-test` | BUCKET | worker-cbc-endes | ❌ Eliminado | Recurso de prueba eliminado |

**Nota:** El bucket R2 de prueba fue eliminado el 2026-03-27. El bucket `r2-cbconsulting` está activo para almacenamiento de archivos PAI.

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

| Proyecto | URL | App Asociada | Proveedor Git | Estado |
|----------|-----|--------------|---------------|--------|
| `pg-cbc-endes` | https://d00e4cdb.pg-cbc-endes.pages.dev/ | TailAdmin React | GitHub | ✅ |

**Configuración:**
- Production branch: `main`
- Build output dir: `dist`
- Framework: React + Vite + Tailwind CSS

**Nota:** Pages es el ÚNICO recurso mantenido de la Fase 1.

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
| `DB` | D1 Database | ❌ Eliminado | - | Binding eliminado (D1 eliminada) |
| `BUCKET` | R2 Bucket | ❌ Eliminado | - | Binding eliminado (R2 eliminado) |
| `VITE_API_BASE_URL` | Variable frontend | ✅ | `apps/frontend/wrangler.toml` | URL de la API backend |
| `VITE_ENVIRONMENT` | Variable frontend | ✅ | `apps/frontend/wrangler.toml` | Entorno de ejecución |

---

## 6. Variables de Entorno por App

### `wk-backend` (Backend)

| Variable | Tipo | Sensible | Descripción | Estado |
|----------|------|----------|-------------|--------|
| `db_binding_01` | D1 Binding | No | Binding a base de datos D1 | ✅ |
| *Por definir* | String | Sí | Variables para integraciones externas (IA) | 🔲 |

### `worker-cbc-endes` (Backend - Eliminado)

| Variable | Tipo | Sensible | Descripción | Estado |
|----------|------|----------|-------------|--------|
| *Por definir* | String | Sí | Variables para integraciones externas | 🔲 |

> **Nota:** El backend `worker-cbc-endes` fue eliminado. El backend activo es `wk-backend`.

### `pg-cbc-endes` (Frontend Pages)

| Variable | Tipo | Sensible | Descripción | Estado |
|----------|------|----------|-------------|--------|
| `VITE_API_BASE_URL` | String | No | URL base del backend API | ✅ |
| `VITE_ENVIRONMENT` | String | No | Entorno (dev/preview/production) | ✅ |

---

## 7. Integraciones Externas

| Servicio | Propósito | Variables Requeridas | Estado |
|----------|-----------|---------------------|--------|
| *Por definir* | Inferencia IA (OpenAI, Anthropic, etc.) | `OPENAI_API_KEY` o `ANTHROPIC_API_KEY` | 🔲 |

**Nota:** Las integraciones con IA se definirán en Fase 2.

---

## 8. Contratos entre Servicios

| Servicio Origen | Servicio Destino | Endpoint | Método | Request | Response | Estado |
|-----------------|------------------|----------|--------|---------|----------|--------|
| Frontend (Pages) | `wk-backend` | `/api/menu` | GET | Ninguno | JSON con estructura de menú agrupada por módulos | ✅ |

**Endpoints del Worker:**

| Endpoint | Método | Descripción | Response | Estado |
|----------|--------|-------------|----------|--------|
| `/api/health` | GET | Health check del servicio | `{ status: "ok", timestamp, service, version }` | ✅ |
| `/api/test` | GET | Test endpoint de disponibilidad | `{ message, hono, typescript }` | ✅ |
| `/api/menu` | GET | Obtiene estructura de menú dinámico | `{ modulos: [...] }` con módulos y funciones | ✅ |

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

**Recursos eliminados (Fase 1 de prueba):**
- Cloudflare D1 ❌
- Cloudflare R2 ❌

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
- `004-pai-mvp.sql` - Crea tablas PAI (PRO, ATR, VAL, NOT, ART) para gestión de proyectos de análisis inmobiliarios
- `005-pai-mvp-datos-iniciales.sql` - Datos iniciales para tablas PAI

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

**Archivos eliminados:**
- `migrations/001-initial.sql` - Migración D1 eliminada (ya no aplica)

---

## 12. Vacíos Pendientes de Confirmación

| Elemento | Tipo | Observaciones | Responsable |
|----------|------|---------------|-------------|
| R2 Bucket definitivo | Recurso | Definir nombre y configuración de acceso | Usuario (Fase 2) |
| Workflows | Recurso | Orquestación de prompts contra IA | Usuario (Fase 2) |
| Integraciones externas | API | OpenAI, Anthropic u otros proveedores | Usuario (Fase 2) |
| Autenticación de usuarios | Auth | No requerido para MVP | Usuario (Fase 3) |
| CI/CD con GitHub Actions | Pipeline | No requerido según usuario | Usuario (opcional) |

> **Nota:** El Worker backend (`wk-backend`) y la D1 Database (`db-cbconsulting`) ya están desplegados y activos.

---

## 13. Historial de Cambios

| Fecha | Cambio | Responsable | Aprobado Por |
|-------|--------|-------------|--------------|
| 2026-03-27 | Actualización v7.0 - FASE 1 PAI completada: Pipeline Events, Esquema PAI (PRO/ATR/VAL/NOT/ART), R2 Storage | Orchestrator | Aprobado |
| 2026-03-27 | Despliegue de menú dinámico v1: Worker `wk-backend`, D1 `db-cbconsulting`, binding `db_binding_01`, endpoint `/api/menu` | inventariador | usuario |
| 2026-03-27 | Eliminación de recursos de prueba (Worker, D1, R2) | inventariador | usuario |
| 2026-03-26 | Despliegue de frontend TailAdmin en Pages | inventariador | usuario |
| 2026-03-26 | Fase 1: Creación de recursos de prueba (Worker, D1, R2, Pages) | inventariador | usuario |

---

## 14. Estado Actual de Recursos

| Recurso | Nombre | Estado | Notas |
|---------|--------|--------|-------|
| Worker | `wk-backend` | ✅ Activo | Backend API para FASE 1 PAI |
| Worker | `worker-cbc-endes-dev` | ❌ Eliminado | Recurso de prueba temporal |
| Pages | `pg-cbc-endes` | ✅ Activo | Frontend en producción |
| D1 Database | `db-cbconsulting` | ✅ Activo | Base de datos para menú dinámico y PAI |
| D1 Database | `cbc-endes-db-test` | ❌ Eliminado | Recurso de prueba temporal |
| R2 Bucket | `r2-cbconsulting` | ✅ Activo | Bucket R2 para almacenamiento de archivos PAI |
| R2 Bucket | `cbc-endes-storage-test` | ❌ Eliminado | Recurso de prueba temporal |

---

## 15. Próximos Pasos (Fase 2)

La Fase 2 de definición y diseño del proyecto incluirá:

1. **Definir nombre definitivo** de R2 Bucket
2. **Ampliar schema de base de datos** para análisis inmobiliarios
3. **Diseñar endpoints adicionales de API** para gestión de proyectos
4. **Definir flujos de Workflow** para prompts de IA
5. **Planificar integración con APIs de IA** (OpenAI, Anthropic, etc.)
6. **Crear R2 Bucket** con nombre definitivo

> **Nota:** El Worker backend (`wk-backend`) y la D1 Database (`db-cbconsulting`) ya están desplegados y activos como parte del menú dinámico v1.

---

## Notas de Mantenimiento

1. **Actualización exclusiva:** Solo el agente `inventariador` puede actualizar este archivo.
2. **Solicitud de cambios:** Los usuarios deben solicitar cambios a través del orquestador.
3. **Auditoría periódica:** El agente `inventory-auditor` verifica consistencia con recursos reales en Cloudflare.
4. **Aprobación:** Los cambios críticos requieren aprobación explícita del usuario antes de commit.
5. **Consulta previa:** Todo agente debe consultar este inventario antes de generar código que referencie recursos.
6. **No hardcoding:** Toda la información configurable debe quedar fuera del código o en KV si fuera necesario.
7. **Sistema multidioma (i18n):** Usar código de idioma `es-ES` por defecto para mensajes al usuario.

---

> **Nota:** Este inventario refleja el estado actual del proyecto tras el despliegue del menú dinámico v1. Los recursos activos incluyen el Worker backend (`wk-backend`), la D1 Database (`db-cbconsulting`) y el proyecto Pages (`pg-cbc-endes`) para el frontend de producción.
