# Plan de Ejecución — Configuración de Entorno de Desarrollo Cloudflare

**Fecha:** 2026-03-26  
**Tipo:** Plan de ejecución (borrador pendiente de respuestas)  
**Estado:** 📋 Borrador (requiere respuestas del usuario para finalizar)  
**Versión:** 1.0  

---

## Índice de Contenido

1. [Resumen del Plan](#1-resumen-del-plan)
2. [Dependencias y Prerrequisitos](#2-dependencias-y-prerrequisitos)
3. [Fase 0: Verificación Inicial](#3-fase-0-verificación-inicial)
4. [Fase 1: Creación de Recursos Cloudflare](#4-fase-1-creación-de-recursos-cloudflare)
5. [Fase 2: Configuración del Proyecto](#5-fase-2-configuración-del-proyecto)
6. [Fase 3: Implementación del Backend](#6-fase-3-implementación-del-backend)
7. [Fase 4: Implementación del Frontend](#7-fase-4-implementación-del-frontend)
8. [Fase 5: Configuración de Workflows](#8-fase-5-configuración-de-workflows)
9. [Fase 6: Integración y Pruebas](#9-fase-6-integración-y-pruebas)
10. [Fase 7: Actualización de Inventario](#10-fase-7-actualización-de-inventario)
11. [Fase 8: Validación y Commit](#11-fase-8-validación-y-commit)
12. [Criterios de Aceptación](#12-criterios-de-aceptación)
13. [Riesgos y Mitigaciones](#13-riesgos-y-mitigaciones)

---

## 1. Resumen del Plan

### 1.1 Objetivo

Configurar un entorno de desarrollo completo en Cloudflare con:
- ✅ Pages (Frontend React)
- ✅ Workers (Backend API)
- ✅ D1 (Base de datos)
- ✅ R2 (Almacenamiento de objetos)
- ✅ Workflows (Orquestación)

### 1.2 Alcance

| Incluido | No Incluido |
|----------|-------------|
| Configuración de Wrangler | Dominio personalizado |
| Creación de recursos Cloudflare | Autenticación de usuarios (Clerk, etc.) |
| Estructura de proyecto monorepo | Integraciones externas (OpenAI, Stripe) |
| Endpoints básicos de API | CI/CD con GitHub Actions (opcional) |
| Componentes React básicos | Testing E2E |

### 1.3 Agentes Involucrados

| Agente | Responsabilidad | Fase |
|--------|-----------------|------|
| `cloudflare-infra` | Crear recursos D1, R2 | Fase 1 |
| `cloudflare-d1` | Configurar schema, migraciones | Fase 1, 3 |
| `cloudflare-r2` | Configurar bucket, CORS | Fase 1 |
| `cloudflare-workers` | Implementar backend API | Fase 3 |
| `cloudflare-workflows` | Implementar workflows | Fase 5 |
| `frontend-react` | Implementar frontend Pages | Fase 4 |
| `code-validator` | Validar calidad (lint, typecheck) | Fase 6, 8 |
| `inventariador` | Actualizar inventario | Fase 7 |

---

## 2. Dependencias y Prerrequisitos

### 2.1 Software Requerido

| Herramienta | Versión Mínima | Comando de Verificación |
|-------------|----------------|------------------------|
| Node.js | 20.x | `node --version` |
| npm | 9.x | `npm --version` |
| Wrangler CLI | 3.x | `npx wrangler --version` |
| Git | 2.x | `git --version` |

### 2.2 Autenticación

```bash
# Verificar autenticación
npx wrangler whoami

# Si no está autenticado:
npx wrangler login
```

### 2.3 Respuestas del Usuario (BLOQUEANTE)

**Estado:** ⏳ Pendiente

Ver: `_respuestas/001_preguntas_aclaracion_entorno_desarrollo.md`

**Preguntas críticas bloqueantes:**
- [ ] Nombre del proyecto
- [ ] Framework frontend preferido
- [ ] Nombre del Worker Backend
- [ ] Nombre de la Base de Datos D1
- [ ] Nombre del Bucket R2
- [ ] Nombre del Workflow
- [ ] Nombre del Pages Project
- [ ] Estado de autenticación con Cloudflare

---

## 3. Fase 0: Verificación Inicial

### 3.1 Tareas

| # | Tarea | Responsable | Estado |
|---|-------|-------------|--------|
| 0.1 | Verificar autenticación con `wrangler whoami` | Orquestador | ⏳ |
| 0.2 | Verificar estructura de directorios actual | Orquestador | ⏳ |
| 0.3 | Verificar `inventario_recursos.md` (vacío vs poblado) | Orquestador | ⏳ |
| 0.4 | Confirmar respuestas del usuario | Orquestador | ⏳ |

### 3.2 Criterios de Aceptación

- [ ] Autenticación verificada
- [ ] Estructura actual documentada
- [ ] Estado del inventario conocido
- [ ] Todas las preguntas críticas respondidas

---

## 4. Fase 1: Creación de Recursos Cloudflare

### 4.1 Tareas

| # | Tarea | Agente | Comando/Acción | Estado |
|---|-------|--------|----------------|--------|
| 1.1 | Crear D1 Database | `cloudflare-infra` | `wrangler d1 create [NOMBRE_D1]` | ⏳ |
| 1.2 | Crear R2 Bucket | `cloudflare-infra` | `wrangler r2 bucket create [NOMBRE_R2]` | ⏳ |
| 1.3 | Configurar CORS en R2 | `cloudflare-r2` | `wrangler r2 bucket update [NOMBRE_R2] --cors [...]` | ⏳ |
| 1.4 | Crear schema inicial D1 | `cloudflare-d1` | Crear `migrations/001-initial.sql` | ⏳ |
| 1.5 | Aplicar migración inicial | `cloudflare-d1` | `wrangler d1 migrations apply [NOMBRE_D1] --remote` | ⏳ |

### 4.2 Outputs Esperados

```json
{
  "d1_database": {
    "name": "[NOMBRE_D1]",
    "database_id": "[UUID]",
    "state": "created"
  },
  "r2_bucket": {
    "name": "[NOMBRE_R2]",
    "state": "created"
  },
  "migrations": {
    "applied": ["001-initial.sql"],
    "state": "applied"
  }
}
```

### 4.3 Evidencias Requeridas

- [ ] Output de `wrangler d1 create` con database_id
- [ ] Output de `wrangler r2 bucket create`
- [ ] Archivo `migrations/001-initial.sql` creado
- [ ] Output de `wrangler d1 migrations apply`

---

## 5. Fase 2: Configuración del Proyecto

### 5.1 Estructura de Directorios

**Acción:** Crear estructura monorepo

```bash
# Crear directorios
mkdir -p apps/backend/src/{routes,db,storage,workflows}
mkdir -p apps/frontend/src/{components,pages,hooks,lib}
mkdir -p migrations
```

### 5.2 Tareas

| # | Tarea | Agente | Estado |
|---|-------|--------|--------|
| 2.1 | Crear package.json root (workspace) | Orquestador | ⏳ |
| 2.2 | Crear apps/backend/package.json | `cloudflare-workers` | ⏳ |
| 2.3 | Crear apps/frontend/package.json | `frontend-react` | ⏳ |
| 2.4 | Crear tsconfig.json base | Orquestador | ⏳ |
| 2.5 | Crear apps/backend/wrangler.toml | `cloudflare-infra` | ⏳ |
| 2.6 | Crear apps/frontend/wrangler.toml | `frontend-react` | ⏳ |
| 2.7 | Crear .gitignore | Orquestador | ⏳ |
| 2.8 | Crear .dev.vars.example | `cloudflare-workers` | ⏳ |
| 2.9 | Crear .env.example | `frontend-react` | ⏳ |

### 5.3 Configuración Backend (apps/backend/wrangler.toml)

```toml
name = "[NOMBRE_WORKER]"
main = "src/index.ts"
compatibility_date = "2026-03-26"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "[NOMBRE_D1]"
database_id = "[DATABASE_ID_OBTENIDO]"
migrations_dir = "../migrations"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "[NOMBRE_R2]"

[[workflows]]
name = "[NOMBRE_WORKFLOW]"
binding = "WORKFLOW"
class_name = "[NOMBRE_CLASE]"

[vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "https://[NOMBRE_PAGES].pages.dev"

[env.dev]
name = "[NOMBRE_WORKER]-dev"
vars = { ENVIRONMENT = "dev", CORS_ORIGIN = "http://localhost:5173" }

[env.production]
name = "[NOMBRE_WORKER]-prod"
```

### 5.4 Configuración Frontend (apps/frontend/wrangler.toml)

```toml
name = "[NOMBRE_PAGES]"
pages_build_output_dir = "dist"
compatibility_date = "2026-03-26"

[vars]
VITE_ENVIRONMENT = "production"
VITE_API_BASE_URL = "https://[NOMBRE_WORKER].workers.dev"

[env.dev]
name = "[NOMBRE_PAGES]-dev"
vars = { VITE_ENVIRONMENT = "dev", VITE_API_BASE_URL = "http://localhost:8787" }

[env.production]
name = "[NOMBRE_PAGES]-prod"
```

### 5.5 Evidencias Requeridas

- [ ] Estructura de directorios creada
- [ ] package.json en root, backend, frontend
- [ ] wrangler.toml configurado en backend y frontend
- [ ] .gitignore con exclusiones apropiadas
- [ ] .dev.vars.example y .env.example creados

---

## 6. Fase 3: Implementación del Backend

### 6.1 Tareas

| # | Tarea | Agente | Estado |
|---|-------|--------|--------|
| 3.1 | Crear src/index.ts (entry point Hono) | `cloudflare-workers` | ⏳ |
| 3.2 | Crear src/env.ts (tipado de bindings) | `cloudflare-workers` | ⏳ |
| 3.3 | Crear src/routes/health.ts | `cloudflare-workers` | ⏳ |
| 3.4 | Crear src/routes/users.ts (CRUD) | `cloudflare-workers` | ⏳ |
| 3.5 | Crear src/routes/upload.ts (R2) | `cloudflare-workers` | ⏳ |
| 3.6 | Configurar CORS middleware | `cloudflare-workers` | ⏳ |
| 3.7 | Configurar validación con Zod | `cloudflare-workers` | ⏳ |
| 3.8 | Instalar dependencias backend | Orquestador | ⏳ |

### 6.2 Dependencias Backend

```json
{
  "dependencies": {
    "hono": "^4.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.x",
    "typescript": "^5.x",
    "wrangler": "^3.x"
  }
}
```

### 6.3 Evidencias Requeridas

- [ ] `npm run typecheck` sin errores
- [ ] `npm run lint` sin errores
- [ ] Endpoints probados localmente
- [ ] CORS configurado y funcionando

---

## 7. Fase 4: Implementación del Frontend

### 7.1 Tareas

| # | Tarea | Agente | Estado |
|---|-------|--------|--------|
| 4.1 | Configurar Vite + React + TypeScript | `frontend-react` | ⏳ |
| 4.2 | Configurar Tailwind CSS | `frontend-react` | ⏳ |
| 4.3 | Instalar shadcn/ui | `frontend-react` | ⏳ |
| 4.4 | Crear src/App.tsx | `frontend-react` | ⏳ |
| 4.5 | Crear src/pages/Home.tsx | `frontend-react` | ⏳ |
| 4.6 | Crear src/lib/api.ts (API client) | `frontend-react` | ⏳ |
| 4.7 | Configurar variables de entorno | `frontend-react` | ⏳ |
| 4.8 | Instalar dependencias frontend | Orquestador | ⏳ |

### 7.2 Dependencias Frontend

```json
{
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",
    "react-router-dom": "^7.x"
  },
  "devDependencies": {
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x",
    "@vitejs/plugin-react": "^4.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "tailwindcss": "^4.x",
    "typescript": "^5.x",
    "vite": "^6.x"
  }
}
```

### 7.3 Evidencias Requeridas

- [ ] `npm run typecheck` sin errores
- [ ] `npm run lint` sin errores
- [ ] Frontend renderiza correctamente en localhost:5173
- [ ] API client funciona con backend local

---

## 8. Fase 5: Configuración de Workflows

### 8.1 Tareas

| # | Tarea | Agente | Estado |
|---|-------|--------|--------|
| 5.1 | Crear src/workflows/user-onboarding.ts | `cloudflare-workflows` | ⏳ |
| 5.2 | Registrar workflow en wrangler.toml | `cloudflare-infra` | ⏳ |
| 5.3 | Crear trigger desde endpoint | `cloudflare-workers` | ⏳ |
| 5.4 | Testear workflow localmente | `cloudflare-workflows` | ⏳ |

### 8.2 Ejemplo de Workflow

```typescript
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

export class UserOnboardingWorkflow extends WorkflowEntrypoint {
  async run(event: WorkflowEvent<{ userId: string }>, step: WorkflowStep) {
    const { userId } = event.payload;

    await step.do('Create user record', async () => {
      await this.env.DB.prepare('INSERT INTO users (id) VALUES (?)')
        .bind(userId)
        .run();
    });

    await step.sleepUntil('Wait for email confirmation', Date.now() + 86400000);

    await step.do('Send welcome email', async () => {
      // Lógica de envío
    });
  }
}
```

### 8.3 Evidencias Requeridas

- [ ] Workflow compilado sin errores
- [ ] Workflow trigger probado localmente
- [ ] Workflow aparece en wrangler.toml

---

## 9. Fase 6: Integración y Pruebas

### 9.1 Tareas

| # | Tarea | Agente | Estado |
|---|-------|--------|--------|
| 6.1 | Iniciar backend local | Orquestador | ⏳ |
| 6.2 | Iniciar frontend local | Orquestador | ⏳ |
| 6.3 | Probar flujo completo | `code-validator` | ⏳ |
| 6.4 | Ejecutar typecheck global | `code-validator` | ⏳ |
| 6.5 | Ejecutar lint global | `code-validator` | ⏳ |
| 6.6 | Documentar endpoints | `cloudflare-workers` | ⏳ |

### 9.2 Comandos de Prueba

```bash
# Backend
cd apps/backend
npm run dev

# Frontend (otra terminal)
cd apps/frontend
npm run dev

# Testear endpoints
curl http://localhost:8787/api/health
curl http://localhost:8787/api/users
```

### 9.3 Evidencias Requeridas

- [ ] Backend responde en http://localhost:8787
- [ ] Frontend renderiza en http://localhost:5173
- [ ] Flujo frontend → backend → D1 → R2 probado
- [ ] Typecheck pasa en ambos proyectos
- [ ] Lint pasa en ambos proyectos

---

## 10. Fase 7: Actualización de Inventario

### 10.1 Tareas

| # | Tarea | Agente | Estado |
|---|-------|--------|--------|
| 7.1 | Invocar agente `inventariador` | Orquestador | ⏳ |
| 7.2 | Proporcionar datos de recursos creados | Orquestador | ⏳ |
| 7.3 | Esperar confirmación de actualización | Orquestador | ⏳ |
| 7.4 | Verificar inventario actualizado | Orquestador | ⏳ |

### 10.2 Datos para el Inventariador

```markdown
Necesito actualizar el inventario:

**Recursos Creados:**
- D1 Database: [NOMBRE_D1], ID: [DATABASE_ID]
- R2 Bucket: [NOMBRE_R2]
- Worker: [NOMBRE_WORKER]
- Workflow: [NOMBRE_WORKFLOW]
- Pages: [NOMBRE_PAGES]

**Bindings Configurados:**
- DB → D1
- BUCKET → R2
- WORKFLOW → Workflow

**Variables de Entorno:**
- Backend: ENVIRONMENT, CORS_ORIGIN
- Frontend: VITE_API_BASE_URL, VITE_ENVIRONMENT

**Evidencia:**
- Output de wrangler d1 create
- Output de wrangler r2 bucket create
- wrangler.toml configurado
```

### 10.3 Criterios de Aceptación

- [ ] `inventariador` confirma actualización
- [ ] `inventario_recursos.md` refleja recursos creados
- [ ] Todos los estados cambiaron de 🔲 a ✅

---

## 11. Fase 8: Validación y Commit

### 11.1 Tareas

| # | Tarea | Agente | Estado |
|---|-------|--------|--------|
| 8.1 | Revisión final de calidad | `code-validator` | ⏳ |
| 8.2 | Preparar mensaje de commit | Orquestador | ⏳ |
| 8.3 | Solicitar identificador de commit (R12) | Orquestador | ⏳ |
| 8.4 | Ejecutar commit | Orquestador | ⏳ |
| 8.5 | Verificar commit con `git status` | Orquestador | ⏳ |

### 11.2 Mensaje de Commit (Borrador)

```
[IDENTIFICADOR] Configuración inicial de entorno de desarrollo Cloudflare

Cambios realizados:
- Creación de recursos Cloudflare: D1, R2, Worker, Workflow, Pages
- Configuración de wrangler.toml para backend y frontend
- Implementación de backend API con Hono (endpoints: /health, /users, /upload)
- Implementación de frontend React con Vite, Tailwind, shadcn/ui
- Configuración de Workflow para onboarding de usuarios
- Migraciones D1 iniciales (001-initial.sql)
- Bindings configurados: DB, BUCKET, WORKFLOW
- Variables de entorno documentadas en .dev.vars.example y .env.example

Archivos afectados:
- apps/backend/: src/, package.json, wrangler.toml
- apps/frontend/: src/, package.json, wrangler.toml, vite.config.ts
- migrations/: 001-initial.sql
- .governance/inventario_recursos.md (actualizado por inventariador)

Evidencias:
- typecheck: ✅ Sin errores
- lint: ✅ Sin errores
- Desarrollo local: ✅ Backend y frontend funcionando
- Inventario: ✅ Actualizado por inventariador
```

### 11.3 Criterios de Aceptación

- [ ] Code-validator aprueba calidad
- [ ] Identificador de commit proporcionado por usuario (o "Orquestador Decide")
- [ ] Commit ejecutado exitosamente
- [ ] `git status` muestra working tree clean

---

## 12. Criterios de Aceptación

### 12.1 Criterios Técnicos

| Criterio | Verificación |
|----------|--------------|
| Backend responde | `curl http://localhost:8787/api/health` retorna 200 |
| Frontend renderiza | http://localhost:5173 muestra UI |
| D1 conectado | Query a D1 desde Worker funciona |
| R2 conectado | Upload/download desde Worker funciona |
| Workflow configurado | Trigger de workflow funciona |
| CORS configurado | Frontend puede llamar a backend sin errores CORS |
| Typecheck | `npm run typecheck` sin errores en backend y frontend |
| Lint | `npm run lint` sin errores en backend y frontend |

### 12.2 Criterios de Gobernanza

| Criterio | Verificación |
|----------|--------------|
| R1: No hardcoding | Todos los valores vienen de wrangler.toml o env |
| R2: Secrets | No hay secrets en código, solo en .dev.vars.example |
| R15: Inventario | `inventario_recursos.md` actualizado por `inventariador` |
| R12: Commit | Commit tiene identificador y descripción detallada |

---

## 13. Riesgos y Mitigaciones

### 13.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Error de autenticación | Media | Alto | Verificar con `wrangler whoami` antes de empezar |
| Nombre de recurso duplicado | Media | Medio | Usar nombres únicos proporcionados por usuario |
| CORS no configurado | Media | Alto | Configurar CORS_ORIGIN en wrangler.toml |
| Binding incorrecto | Baja | Alto | Verificar bindings en wrangler.toml y env.ts |
| Migración D1 falla | Media | Alto | Probar migración con `--local` antes de `--remote` |

### 13.2 Riesgos de Gobernanza

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Usuario no responde preguntas | Alta | Alto | Bloquear hasta obtener respuestas (R1) |
| Inventario desactualizado | Media | Medio | Invocar `inventariador` antes de commit |
| Hardcoding accidental | Media | Alto | Revisar código con `code-validator` |

---

## 14. Timeline Estimado

| Fase | Duración Estimada |
|------|-------------------|
| Fase 0: Verificación | 5 minutos |
| Fase 1: Recursos Cloudflare | 15 minutos |
| Fase 2: Configuración Proyecto | 20 minutos |
| Fase 3: Backend | 45 minutos |
| Fase 4: Frontend | 45 minutos |
| Fase 5: Workflows | 30 minutos |
| Fase 6: Integración | 30 minutos |
| Fase 7: Inventario | 10 minutos |
| Fase 8: Commit | 10 minutos |
| **Total** | **~3.5 horas** |

**Nota:** Tiempos estimados para configuración inicial. Puede variar según complejidad específica.

---

## 15. Referencias

| Documento | URL |
|-----------|-----|
| Preguntas de Aclaración | `_respuestas/001_preguntas_aclaracion_entorno_desarrollo.md` |
| Arquitectura Técnica | `_respuestas/002_arquitectura_tecnica_recomendada.md` |
| Reglas del Proyecto | `.governance/reglas_proyecto.md` |
| Inventario de Recursos | `.governance/inventario_recursos.md` |
| Documentación Cloudflare | https://developers.cloudflare.com/ |

---

**Estado del Plan:** 📋 **BORRADOR** — Pendiente de respuestas del usuario

**Próximo Paso:** Usuario debe responder preguntas en `_respuestas/001_preguntas_aclaracion_entorno_desarrollo.md`

---

**Documento guardado en:** `_respuestas/003_plan_ejecucion_entorno_desarrollo.md`
