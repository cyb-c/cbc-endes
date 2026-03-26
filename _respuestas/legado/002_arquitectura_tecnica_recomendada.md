# Arquitectura Técnica Recomendada — Entorno de Desarrollo Cloudflare

**Fecha:** 2026-03-26  
**Tipo:** Propuesta de arquitectura técnica  
**Estado:** 📋 Propuesta (pendiente de validación con respuestas del usuario)  

---

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura de Referencia](#2-arquitectura-de-referencia)
3. [Componentes Detallados](#3-componentes-detallados)
4. [Flujo de Datos](#4-flujo-de-datos)
5. [Estructura de Proyecto Recomendada](#5-estructura-de-proyecto-recomendada)
6. [Configuración de Wrangler](#6-configuración-de-wrangler)
7. [Bindings y Variables de Entorno](#7-bindings-y-variables-de-entorno)
8. [Flujo de Desarrollo Local](#8-flujo-de-desarrollo-local)
9. [Flujo de Despliegue](#9-flujo-de-despliegue)
10. [Consideraciones de Seguridad](#10-consideraciones-de-seguridad)
11. [Próximos Pasos](#11-próximos-pasos)

---

## 1. Resumen Ejecutivo

Esta documentación propone una arquitectura **full-stack serverless** en Cloudflare que integra:

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Frontend** | Cloudflare Pages + React | UI interactiva con despliegue global |
| **Backend** | Cloudflare Workers | API REST/GraphQL, lógica de negocio |
| **Base de Datos** | Cloudflare D1 | Datos relacionales con SQLite |
| **Almacenamiento** | Cloudflare R2 | Objetos (imágenes, documentos, archivos) |
| **Orquestación** | Cloudflare Workflows | Procesos multi-paso duraderos |

**Ventajas Clave:**
- ✅ **Sin gestión de infraestructura** — Todo serverless
- ✅ **Despliegue global instantáneo** — Edge network de Cloudflare
- ✅ **Costos optimizados** — Sin egress fees en R2, D1 económico
- ✅ **Escalabilidad automática** — Sin provisioning manual
- ✅ **Desarrollo local** — Miniflare para testing local

---

## 2. Arquitectura de Referencia

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                 │
│                    (Navegador / Cliente)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE PAGES                             │
│  • Frontend React (Vite + TypeScript)                           │
│  • Tailwind CSS + shadcn/ui                                     │
│  • Variables de entorno: VITE_API_BASE_URL                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Fetch API / HTTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WORKER                            │
│  • Runtime: Cloudflare Workers                                  │
│  • Framework: Hono (ligero, optimizado para Workers)            │
│  • Endpoints: /api/*                                            │
│  • Bindings: D1, R2, Workflow                                   │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ D1 Binding       │ R2 Binding       │ Workflow Binding
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   CLOUDFLARE    │  │   CLOUDFLARE    │  │   CLOUDFLARE    │
│       D1        │  │       R2        │  │    WORKFLOWS    │
│  • SQLite       │  │  • Objetos      │  │  • Pasos        │
│  • Queries      │  │  • Sin egress   │  │  • Reintentos   │
│  • Migraciones  │  │  • CORS         │  │  • Sleep        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 3. Componentes Detallados

### 3.1 Cloudflare Pages (Frontend)

**Configuración Recomendada:**

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| **Framework** | React 19 | Amplia adopción, ecosistema maduro |
| **Build Tool** | Vite | Build rápido, HMR en desarrollo |
| **TypeScript** | Sí | Type safety, mejor DX |
| **Styling** | Tailwind CSS v4 | Utility-first, bundle pequeño |
| **UI Components** | shadcn/ui | Componentes accesibles, personalizables |
| **Estado** | React Context / Zustand | Simple, sin boilerplate excesivo |

**Variables de Entorno (Frontend):**

```bash
VITE_API_BASE_URL=https://api.tudominio.com
VITE_ENVIRONMENT=production
```

**Integración con Backend:**
- Fetch API hacia el Worker
- CORS configurado en Worker para origen de Pages
- Variables de entorno inyectadas en build

---

### 3.2 Cloudflare Workers (Backend)

**Configuración Recomendada:**

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| **Runtime** | Cloudflare Workers | Edge, sin cold starts significativos |
| **Framework** | Hono 4.x | Ligero (14KB), TypeScript nativo, middleware |
| **Lenguaje** | TypeScript | Type safety, mejor DX |
| **Bundle** | Esbuild | Rápido, compatible con Workers |

**Estructura de Endpoints Sugerida:**

```
/api
  /health          GET  — Health check
  /users           GET  — Listar usuarios
  /users/:id       GET  — Obtener usuario
  /users           POST — Crear usuario
  /users/:id       PUT  — Actualizar usuario
  /users/:id       DELETE — Eliminar usuario
  /upload          POST — Subir archivo a R2
  /files/:key      GET  — Obtener URL firmada de R2
  /workflow/:id    POST — Trigger workflow
```

**Bindings Requeridos:**

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "[NOMBRE_D1]"
database_id = "[ID_D1]"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "[NOMBRE_R2]"

[[workflows]]
name = "[NOMBRE_WORKFLOW]"
binding = "WORKFLOW"
```

---

### 3.3 Cloudflare D1 (Base de Datos)

**Configuración Recomendada:**

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| **Motor** | SQLite | Compatible, ligero, sin servidor |
| **Tamaño Máx** | 10 GB por DB | Escalar horizontalmente si crece |
| **Backups** | 30 días (Time Travel) | Recuperación punto-en-tiempo |

**Esquema Inicial Sugerido:**

```sql
-- 001-initial.sql

-- Tabla de migraciones (seguimiento)
CREATE TABLE IF NOT EXISTS d1_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios (ejemplo)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

**Migraciones:**

```bash
# Crear migración
wrangler d1 migrations create [NOMBRE_D1] add-table-name

# Aplicar migración (local)
wrangler d1 migrations apply [NOMBRE_D1] --local

# Aplicar migración (remoto)
wrangler d1 migrations apply [NOMBRE_D1] --remote
```

---

### 3.4 Cloudflare R2 (Almacenamiento)

**Configuración Recomendada:**

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| **Acceso** | Privado por defecto | Seguridad, URLs prefirmadas |
| **CORS** | Configurar para origen de Pages | Permitir upload desde frontend |
| **Location Hint** | Según región de usuarios | Latencia optimizada |

**Casos de Uso Típicos:**

| Caso | Configuración |
|------|---------------|
| **Imágenes de usuario** | Bucket privado, URLs prefirmadas con expiración |
| **Documentos públicos** | Bucket público, acceso directo |
| **Backups** | Bucket privado, acceso solo desde Worker |

**Operaciones Comunes desde Worker:**

```typescript
// Subir archivo
await BUCKET.put(key, file, {
  httpMetadata: { contentType: file.type }
});

// Obtener archivo
const object = await BUCKET.get(key);

// Generar URL prefirmada (acceso temporal)
const url = await BUCKET.createSignedUploadUrl(key, {
  method: 'GET',
  expiryTime: new Date(Date.now() + 3600000) // 1 hora
});
```

---

### 3.5 Cloudflare Workflows (Orquestación)

**Configuración Recomendada:**

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| **Clase** | Extender `WorkflowEntrypoint` | Patrón oficial Cloudflare |
| **Trigger** | Programático desde Worker | Control total del ciclo de vida |
| **Persistencia** | Semanas (máximo) | Para procesos largos |

**Ejemplo de Workflow:**

```typescript
// workflows/user-onboarding.ts
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

export class UserOnboardingWorkflow extends WorkflowEntrypoint {
  async run(event: WorkflowEvent<{ userId: string }>, step: WorkflowStep) {
    const { userId } = event.payload;

    // Paso 1: Crear registro de usuario
    await step.do('Create user record', async () => {
      await this.env.DB.prepare('INSERT INTO users (id) VALUES (?)')
        .bind(userId)
        .run();
    });

    // Paso 2: Esperar confirmación de email (hasta 24h)
    await step.sleepUntil('Wait for email confirmation', Date.now() + 86400000);

    // Paso 3: Enviar welcome email
    await step.do('Send welcome email', async () => {
      // Lógica de envío de email
    });

    // Paso 4: Asignar recursos iniciales
    await step.do('Assign initial resources', async () => {
      // Asignar recursos al usuario
    });
  }
}
```

**Triggers Soportados:**

| Trigger | Uso |
|---------|-----|
| **Programático** | `await WORKFLOW.create({ userId: '123' })` |
| **Schedule** | Cron desde wrangler.toml |
| **HTTP** | Desde endpoint del Worker |

---

## 4. Flujo de Datos

### 4.1 Flujo: Crear Usuario con Upload de Avatar

```
1. Frontend (Pages)
   └─> Usuario completa formulario + selecciona avatar
   └─> POST /api/users con FormData (datos + archivo)

2. Worker (Backend)
   └─> Valida datos con Zod
   └─> Transacción D1: INSERT user
   └─> Sube avatar a R2: BUCKET.put(`avatars/${userId}`, file)
   └─> Trigger Workflow: WORKFLOW.create({ userId })
   └─> Response: { data: { id, email, avatarUrl } }

3. Workflow
   └─> Paso 1: Registrar evento de creación
   └─> Paso 2: Sleep hasta confirmación de email
   └─> Paso 3: Enviar email de bienvenida
   └─> Paso 4: Asignar recursos iniciales

4. Frontend
   └─> Recibe respuesta
   └─> Navega a dashboard
   └─> Muestra notificación de éxito
```

---

### 4.2 Flujo: Obtener Lista de Usuarios con Avatares

```
1. Frontend (Pages)
   └─> GET /api/users

2. Worker (Backend)
   └─> Query D1: SELECT * FROM users
   └─> Para cada usuario, genera URL prefirmada de avatar en R2
   └─> Response: { data: [{ id, email, avatarUrl, ... }] }

3. Frontend
   └─> Renderiza lista de usuarios
   └─> Muestra avatares desde URLs prefirmadas
```

---

## 5. Estructura de Proyecto Recomendada

### 5.1 Opción A: Monorepo (Recomendada)

```
/workspaces/456/
├── .governance/              # Gobernanza del proyecto
├── .agents/                  # Agentes de IA
├── .skills/                  # Skills técnicos
├── apps/
│   ├── frontend/             # Cloudflare Pages (React)
│   │   ├── src/
│   │   │   ├── components/   # Componentes React
│   │   │   ├── pages/        # Páginas (React Router)
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── lib/          # Utilidades (API client, utils)
│   │   │   └── App.tsx
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── wrangler.toml     # Configuración Pages
│   │
│   └── backend/              # Cloudflare Worker
│       ├── src/
│       │   ├── index.ts      # Entry point (Hono)
│       │   ├── routes/       # Endpoints de API
│       │   ├── db/           # Queries y migraciones D1
│       │   ├── storage/      # Operaciones R2
│       │   ├── workflows/    # Definición de Workflows
│       │   └── env.ts        # Tipado de bindings
│       ├── migrations/       # Migraciones D1 SQL
│       ├── package.json
│       └── wrangler.toml     # Configuración Worker
│
├── package.json              # Workspace root
├── tsconfig.json             # TypeScript base
└── wrangler.toml             # Configuración compartida (opcional)
```

### 5.2 Opción B: Raíz Única (Proyectos Pequeños)

```
/workspaces/456/
├── .governance/
├── .agents/
├── .skills/
├── src/
│   ├── frontend/             # Componentes React
│   └── backend/              # Worker (Hono)
├── migrations/               # Migraciones D1
├── package.json
├── vite.config.ts
└── wrangler.toml
```

**Recomendación:** Usar **Opción A (Monorepo)** para mejor separación de responsabilidades y escalabilidad.

---

## 6. Configuración de Wrangler

### 6.1 Backend (apps/backend/wrangler.toml)

```toml
name = "[NOMBRE_WORKER]"
main = "src/index.ts"
compatibility_date = "2026-03-26"
compatibility_flags = ["nodejs_compat"]

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "[NOMBRE_D1]"
database_id = "[ID_D1]"
migrations_dir = "../migrations"

# R2 Bucket
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "[NOMBRE_R2]"

# Workflow
[[workflows]]
name = "[NOMBRE_WORKFLOW]"
binding = "WORKFLOW"
class_name = "[NOMBRE_CLASE_WORKFLOW]"

# Variables de entorno
[vars]
ENVIRONMENT = "production"
CORS_ORIGIN = "https://[NOMBRE_PAGES].pages.dev"

# Secrets (no poner valores aquí, usar wrangler secret put)
# - API_KEY
# - JWT_SECRET

# Environment: Development
[env.dev]
name = "[NOMBRE_WORKER]-dev"
vars = { ENVIRONMENT = "dev", CORS_ORIGIN = "http://localhost:5173" }

# Environment: Production
[env.production]
name = "[NOMBRE_WORKER]-prod"
vars = { ENVIRONMENT = "production", CORS_ORIGIN = "https://tudominio.com" }
```

### 6.2 Frontend (apps/frontend/wrangler.toml)

```toml
name = "[NOMBRE_PAGES]"
pages_build_output_dir = "dist"
compatibility_date = "2026-03-26"

# Variables de entorno (públicas, prefijo VITE_)
[vars]
VITE_ENVIRONMENT = "production"

# Environment: Development
[env.dev]
name = "[NOMBRE_PAGES]-dev"
vars = { VITE_ENVIRONMENT = "dev", VITE_API_BASE_URL = "http://localhost:8787" }

# Environment: Production
[env.production]
name = "[NOMBRE_PAGES]-prod"
vars = { VITE_ENVIRONMENT = "production", VITE_API_BASE_URL = "https://api.tudominio.com" }
```

---

## 7. Bindings y Variables de Entorno

### 7.1 Backend (Worker)

| Tipo | Nombre | Descripción | Sensible | Ubicación |
|------|--------|-------------|----------|-----------|
| **Binding** | `DB` | D1 Database | No | wrangler.toml |
| **Binding** | `BUCKET` | R2 Bucket | No | wrangler.toml |
| **Binding** | `WORKFLOW` | Workflow | No | wrangler.toml |
| **Var** | `ENVIRONMENT` | Entorno (dev/prod) | No | wrangler.toml |
| **Var** | `CORS_ORIGIN` | Origen permitido CORS | No | wrangler.toml |
| **Secret** | `API_KEY` | Clave de API | **Sí** | `wrangler secret put` |
| **Secret** | `JWT_SECRET` | Secreto para JWTs | **Sí** | `wrangler secret put` |

### 7.2 Frontend (Pages)

| Tipo | Nombre | Descripción | Sensible | Ubicación |
|------|--------|-------------|----------|-----------|
| **Var** | `VITE_API_BASE_URL` | URL base de API | No | wrangler.toml / .env |
| **Var** | `VITE_ENVIRONMENT` | Entorno | No | wrangler.toml / .env |

---

## 8. Flujo de Desarrollo Local

### 8.1 Prerrequisitos

```bash
# Node.js 20+
node --version

# Wrangler CLI
npm install -g wrangler

# Autenticación
npx wrangler login

# Verificar autenticación
npx wrangler whoami
```

### 8.2 Backend (Worker)

```bash
cd apps/backend

# Instalar dependencias
npm install

# Desarrollo local (con hot reload)
npm run dev

# El Worker estará disponible en http://localhost:8787
```

### 8.3 Frontend (Pages)

```bash
cd apps/frontend

# Instalar dependencias
npm install

# Desarrollo local (con hot reload)
npm run dev

# El frontend estará disponible en http://localhost:5173
```

### 8.4 Base de Datos (D1)

```bash
# Crear D1 local (primera vez)
wrangler d1 create [NOMBRE_D1] --local

# Aplicar migraciones locales
wrangler d1 migrations apply [NOMBRE_D1] --local

# Ejecutar query en D1 local
wrangler d1 execute [NOMBRE_D1] --local --command "SELECT * FROM users"

# Abrir consola interactiva
wrangler d1 execute [NOMBRE_D1] --local --interactive
```

### 8.5 Almacenamiento (R2)

```bash
# Crear bucket local (primera vez)
wrangler r2 bucket create [NOMBRE_R2] --local

# Listar objetos en bucket local
wrangler r2 object list [NOMBRE_R2] --local

# Subir objeto local
wrangler r2 object put [NOMBRE_R2]/key --local --file ./archivo.txt
```

### 8.6 Workflows

```bash
# Los workflows se ejecutan en el contexto del Worker
# No hay comando específico para desarrollo local de workflows
# Se triggeran programáticamente desde el código
```

---

## 9. Flujo de Despliegue

### 9.1 Backend (Worker)

```bash
cd apps/backend

# Deploy a production
npm run deploy

# O con wrangler directamente
wrangler deploy --env production

# Deploy a dev
wrangler deploy --env dev
```

### 9.2 Frontend (Pages)

```bash
cd apps/frontend

# Build + Deploy
npm run deploy

# O con wrangler
wrangler pages deploy dist --project-name=[NOMBRE_PAGES] --branch=main
```

### 9.3 Base de Datos (D1)

```bash
# Aplicar migraciones en production
wrangler d1 migrations apply [NOMBRE_D1] --remote
```

### 9.4 Almacenamiento (R2)

```bash
# R2 no requiere deploy, los buckets son gestionados por Cloudflare
# Solo configurar CORS si es necesario
wrangler r2 bucket update [NOMBRE_R2] --cors '[{"allowedOrigins":["*"],"allowedMethods":["GET","PUT"]}]'
```

---

## 10. Consideraciones de Seguridad

### 10.1 Secrets

| Práctica | Implementación |
|----------|----------------|
| **Nunca en código** | Usar `wrangler secret put` |
| **Nunca en .env versionado** | Usar `.env.example` sin valores |
| **GitHub Secrets para CI/CD** | `CF_API_TOKEN`, `CF_ACCOUNT_ID` |
| **KV para secrets en runtime** | Si el Worker necesita acceder programáticamente |

### 10.2 CORS

```typescript
// Backend: Configurar CORS en Hono
import { cors } from 'hono/cors';

app.use('/api/*', cors({
  origin: env.CORS_ORIGIN,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

### 10.3 R2: URLs Prefirmadas

```typescript
// Generar URL prefirmada con expiración
const url = await BUCKET.createSignedUploadUrl(key, {
  method: 'GET',
  expiryTime: new Date(Date.now() + 3600000) // 1 hora
});
```

### 10.4 Validación de Input

```typescript
// Usar Zod para validación
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

// En endpoint
const data = userSchema.parse(await req.json());
```

---

## 11. Próximos Pasos

### 11.1 Pendientes de Respuesta del Usuario

Ver documento: `_respuestas/001_preguntas_aclaracion_entorno_desarrollo.md`

### 11.2 Una vez Obtenidas las Respuestas

1. **Crear plan de ejecución** en `doc_planes/001_configuracion_entorno_desarrollo.md`
2. **Ejecutar en orden:**
   - [ ] Autenticación con Cloudflare
   - [ ] Crear D1 Database
   - [ ] Crear R2 Bucket
   - [ ] Crear Worker Backend
   - [ ] Crear Workflow
   - [ ] Crear Pages Project
   - [ ] Configurar bindings
   - [ ] Actualizar inventario (agente `inventariador`)
3. **Validar** con agente `code-validator`
4. **Commit** con identificador (R12)

---

## Referencias de Documentación Oficial

| Recurso | URL |
|---------|-----|
| Cloudflare Pages | https://developers.cloudflare.com/pages/ |
| Cloudflare D1 | https://developers.cloudflare.com/d1/ |
| Cloudflare R2 | https://developers.cloudflare.com/r2/ |
| Cloudflare Workflows | https://developers.cloudflare.com/workflows/ |
| Cloudflare Workers | https://developers.cloudflare.com/workers/ |
| Wrangler CLI | https://developers.cloudflare.com/workers/wrangler/ |
| Hono Framework | https://hono.dev/ |

---

**Documento guardado en:** `_respuestas/002_arquitectura_tecnica_recomendada.md`
