# Inventario de Recursos y Configuración

> **Finalidad:** Fuente única de verdad para recursos Cloudflare, CI/CD, bindings, variables de entorno y configuración operativa del proyecto.
> **Versión:** 5.1
> **Importante:** Este archivo es gestionado exclusivamente por el agente `inventariador`. Las modificaciones directas serán rechazadas.
> **Última actualización:** 2026-03-26 (Fase 1 completada)

---

## Leyenda de Estado

| Símbolo | Significado |
|---------|-------------|
| ✅ | Existe en Cloudflare y está referenciado correctamente en el repositorio |
| ⚠️ | Existe en Cloudflare pero hay discrepancia con el repositorio |
| 🔲 | Declarado en configuración pero NO creado en Cloudflare |
| 🚫 | Servicio Cloudflare no habilitado en la cuenta |
| 🗑️ | Existe en Cloudflare pero sin referencia en el repositorio (huérfano) |

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
| **Finalidad** | Gestor de proyectos de análisis inmobiliarios que ejecuta prompts contra IA mediante API |
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

| Nombre | Binding | App/Proyecto | Puerto Dev | Estado CF | Último Deploy |
|--------|---------|--------------|------------|-----------|---------------|
| `worker-cbc-endes` | N/A | Backend API | 8787 | ✅ | 2026-03-26 |
| `worker-cbc-endes-dev` | N/A | Backend API (dev) | 8787 | ✅ | 2026-03-26 |

### 4.2 KV Namespaces

| Nombre en CF | ID | Binding | App | Estado |
|--------------|----|---------|-----|--------|
| *Sin KV configurado* | - | - | - | - |

### 4.3 Bases de Datos (D1)

| Nombre | Binding | App | ID | Estado |
|--------|---------|-----|----|--------|
| `cbc-endes-db-test` | DB | worker-cbc-endes | `22892bef-3878-4ef0-bd7d-d28bc9656914` | ✅ |

**Migraciones aplicadas:**

| Migración | Archivo | Estado |
|-----------|---------|--------|
| 001-initial | `migrations/001-initial.sql` | ✅ Aplicada |

**Tablas existentes:**
- `d1_migrations` - Control de versiones de migraciones
- `test_items` - Tabla de prueba (datos de demostración)

### 4.4 Buckets R2

| Nombre | Binding | App | Estado |
|--------|---------|-----|--------|
| `cbc-endes-storage-test` | BUCKET | worker-cbc-endes | ✅ |

**Configuración:**
- Storage class: Standard
- Location: WEUR (Western Europe)
- CORS: Permitido desde `http://localhost:5173` y `https://pg-cbc-endes.pages.dev`

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
| `DB` | D1 Database | ✅ | `apps/worker/wrangler.toml` | Binding a `cbc-endes-db-test` |
| `BUCKET` | R2 Bucket | ✅ | `apps/worker/wrangler.toml` | Binding a `cbc-endes-storage-test` |
| `VITE_API_BASE_URL` | Variable frontend | ✅ | `apps/frontend/wrangler.toml` | URL de la API backend |
| `VITE_ENVIRONMENT` | Variable frontend | ✅ | `apps/frontend/wrangler.toml` | Entorno de ejecución |

---

## 6. Variables de Entorno por App

### `worker-cbc-endes` (Backend)

| Variable | Tipo | Sensible | Descripción | Estado |
|----------|------|----------|-------------|--------|
| *Por definir* | String | Sí | Variables para integraciones externas | 🔲 |

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
| Frontend (Pages) | Worker (D1) | `/api/db/test` | GET | - | `{ success, data }` | ✅ |
| Frontend (Pages) | Worker (R2) | `/api/storage/upload` | POST | `FormData` | `{ success, key }` | ✅ |
| Frontend (Pages) | Worker (Health) | `/api/health` | GET | - | `{ status, timestamp }` | ✅ |

**Endpoints del Worker:**

| Endpoint | Método | Descripción | Response |
|----------|--------|-------------|----------|
| `/api/health` | GET | Health check del servicio | `{ status: "ok", timestamp, service, version }` |
| `/api/test` | GET | Endpoint de prueba | `{ message, hono, typescript }` |
| `/api/db/test` | GET | Prueba de conexión D1 | `{ success, data, message }` |
| `/api/storage/upload` | POST | Upload de archivo a R2 | `{ success, key, message }` |
| `/api/storage/:key` | GET | Download de archivo desde R2 | `File stream` |

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
| Database | Cloudflare D1 | Latest | ✅ |
| Storage | Cloudflare R2 | Latest | ✅ |
| Deployment | Wrangler | 4.75.0 | ✅ |

---

## 10. Comandos de Desarrollo

### 10.1 Comandos Globales

```bash
# Verificar autenticación
wrangler whoami

# Listar recursos
wrangler d1 list
wrangler r2 bucket list
wrangler pages project list
```

### 10.2 Comandos por Servicio

| Servicio | Dev | Build | Deploy |
|----------|-----|-------|--------|
| Worker | `cd apps/worker && npm run dev` | - | `cd apps/worker && npm run deploy` |
| Frontend | `cd apps/frontend && npm run dev` | `cd apps/frontend && npm run build` | `wrangler pages deploy dist` |

### 10.3 Migraciones de Base de Datos

```bash
# Aplicar migraciones (remoto)
wrangler d1 execute cbc-endes-db-test --file=migrations/001-initial.sql --remote

# Aplicar migraciones (local)
wrangler d1 execute cbc-endes-db-test --file=migrations/001-initial.sql --local

# Verificar datos
wrangler d1 execute cbc-endes-db-test --command="SELECT * FROM test_items" --remote
```

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
| `apps/worker/wrangler.toml` | Configuración Worker + bindings | ✅ |
| `apps/worker/package.json` | Dependencias backend | ✅ |
| `apps/worker/tsconfig.json` | Configuración TypeScript backend | ✅ |
| `apps/frontend/wrangler.toml` | Configuración Pages + variables | ✅ |
| `apps/frontend/package.json` | Dependencias frontend | ✅ |
| `apps/frontend/.env.example` | Plantilla variables frontend | ✅ |
| `migrations/001-initial.sql` | Migración inicial D1 | ✅ |
| `.gitignore` | Exclusiones de versionado | ✅ |

---

## 12. Vacíos Pendientes de Confirmación

| Elemento | Tipo | Observaciones | Responsable |
|----------|------|---------------|-------------|
| Nombres definitivos de recursos | Recurso | Se usarán nombres de prueba en Fase 1 | Usuario (Fase 2) |
| Schema de base de datos definitivo | D1 | Definir tablas para análisis inmobiliarios | Usuario (Fase 2) |
| Endpoints de API definitivos | Worker | Diseñar API para gestión de proyectos | Usuario (Fase 2) |
| Workflows de IA | Workflow | Orquestación de prompts contra IA | Usuario (Fase 2) |
| Integraciones externas | API | OpenAI, Anthropic u otros proveedores | Usuario (Fase 2) |
| Autenticación de usuarios | Auth | No requerido para MVP | Usuario (Fase 3) |
| CI/CD con GitHub Actions | Pipeline | No requerido según usuario | Usuario (opcional) |

---

## 13. Historial de Cambios

| Fecha | Cambio | Responsable | Aprobado Por |
|-------|--------|-------------|--------------|
| 2026-03-26 | Fase 1: Creación de recursos de prueba (Worker, D1, R2, Pages) | inventariador | usuario |
| 2026-03-26 | Configuración de bindings D1 y R2 en worker | inventariador | usuario |
| 2026-03-26 | Despliegue de frontend TailAdmin en Pages | inventariador | usuario |

---

## 14. Recursos Creados en Fase 1 (Resumen)

| Recurso | Nombre | ID / URL | Estado |
|---------|--------|----------|--------|
| Worker | `worker-cbc-endes-dev` | https://worker-cbc-endes-dev.cbconsulting.workers.dev | ✅ |
| Pages | `pg-cbc-endes` | https://d00e4cdb.pg-cbc-endes.pages.dev/ | ✅ |
| D1 Database | `cbc-endes-db-test` | `22892bef-3878-4ef0-bd7d-d28bc9656914` | ✅ |
| R2 Bucket | `cbc-endes-storage-test` | N/A (nombre único) | ✅ |

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

> **Nota:** Este inventario fue actualizado tras completar la Fase 1 de configuración del entorno de desarrollo. Los recursos son de prueba y serán renombrados/reconfigurados en la Fase 2 de definición y diseño del proyecto.
