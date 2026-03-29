# Fase 1: Configuración de Entorno de Desarrollo Cloudflare

**Fecha:** 2026-03-26  
**Tipo:** Plan de ejecución — Fase 1  
**Estado:** ✅ Listo para ejecución  
**Versión:** 1.0  

---

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Información Confirmada del Usuario](#2-información-confirmada-del-usuario)
3. [Objetivo de la Fase 1](#3-objetivo-de-la-fase-1)
4. [Alcance del Trabajo](#4-alcance-del-trabajo)
5. [Prerrequisitos y Verificaciones](#5-prerrequisitos-y-verificaciones)
6. [Tareas Detalladas](#6-tareas-detalladas)
7. [Estructura de Directorios Resultante](#7-estructura-de-directorios-resultante)
8. [Recursos Cloudflare a Crear](#8-recursos-cloudflare-a-crear)
9. [Configuración de Wrangler 4.75.0](#9-configuración-de-wrangler-4750)
10. [Criterios de Aceptación](#10-criterios-de-aceptación)
11. [Evidencias Requeridas](#11-evidencias-requeridas)
12. [Próximos Pasos](#12-próximos-pasos)

---

## 1. Resumen Ejecutivo

Este documento define el plan de trabajo para configurar un **entorno de desarrollo funcional en el repositorio de GitHub** con todos los recursos básicos de Cloudflare necesarios para comenzar a trabajar inmediatamente.

**Propósito:** Disponer de una base sólida y probada sobre la cual se construirá el proyecto de desarrollo en fases posteriores de definición y diseño.

**Enfoque:** Crear recursos de prueba funcionales que validen la integración entre todos los componentes.

---

## 2. Información Confirmada del Usuario

### 2.1 Datos del Proyecto

| Campo | Valor Confirmado |
|-------|------------------|
| **Nombre del proyecto** | `cbc-endes` |
| **Pages Project** | `pg-cbc-endes` |
| **Worker Backend** | A definir en fase de diseño |
| **D1 Database** | A definir en fase de diseño |
| **R2 Bucket** | A definir en fase de diseño |
| **Workflow** | A definir en fase de diseño |

### 2.2 Decisiones Técnicas

| Decisión | Valor |
|----------|-------|
| **Framework Frontend** | TailAdmin Free React Tailwind Admin Dashboard |
| **Backend Framework** | Hono (TypeScript) |
| **Lenguaje** | TypeScript |
| **Estructura** | Monorepo |
| **Entornos** | dev |
| **Wrangler** | Versión 4.75.0 |
| **Autenticación Cloudflare** | Cuenta y Token existentes |
| **CI/CD** | No requerido para MVP (Wrangler CLI) |
| **Repositorio** | Crear en GitHub |
| **Integraciones Externas** | Sí (IA mediante API) |
| **Autenticación Usuarios** | No para MVP |
| **R2 Almacenamiento** | Documentos y archivos |

### 2.3 Recursos de Prueba

El usuario ha autorizado explícitamente:

> "Estoy de acuerdo con ese orden, crea recurso de prueba en todos para probar el despliegue y config con wrangler 4.75.0 y disponer de un entorno de desarrollo en este repo de github listo."

---

## 3. Objetivo de la Fase 1

**Objetivo Principal:** Configurar un entorno de desarrollo completo en el repositorio de GitHub con recursos Cloudflare de prueba funcionales.

**Objetivos Específicos:**

1. ✅ Instalar y configurar Wrangler 4.75.0
2. ✅ Crear recursos de prueba en Cloudflare (Pages, Workers, D1, R2)
3. ✅ Instalar y preconfigurar Hono en el repositorio
4. ✅ Instalar e integrar la UI (TailAdmin) en el repositorio
5. ✅ Desplegar en Pages la UI para verificar integración y despliegue
6. ✅ Validar integración entre todos los componentes
7. ✅ Dejar entorno listo para fase de definición y diseño

---

## 4. Alcance del Trabajo

### 4.1 Incluido en Fase 1

| Componente | Acción | Estado |
|------------|--------|--------|
| **Wrangler CLI** | Instalar v4.75.0, configurar | ✅ |
| **Workers** | Crear worker de prueba | ✅ |
| **Pages** | Crear proyecto, desplegar UI | ✅ |
| **D1** | Crear database de prueba | ✅ |
| **R2** | Crear bucket de prueba | ✅ |
| **Hono** | Instalar, configurar en worker | ✅ |
| **TailAdmin UI** | Instalar, integrar, configurar | ✅ |
| **GitHub** | Crear repositorio | ✅ |
| **Integración** | Probar end-to-end | ✅ |

### 4.2 No Incluido en Fase 1

| Elemento | Razón | Fase |
|----------|-------|------|
| Nombres definitivos de recursos | Se definirán en fase de diseño | Fase 2 |
| Schema de base de datos definitivo | Se definirá en fase de diseño | Fase 2 |
| Endpoints de API definitivos | Se definirán en fase de diseño | Fase 2 |
| Autenticación de usuarios | No requerido para MVP | Fase 3 (opcional) |
| CI/CD con GitHub Actions | No requerido según usuario | No incluido |
| Workflows | Se definirá en fase de diseño | Fase 2 |

---

## 5. Prerrequisitos y Verificaciones

### 5.1 Software Requerido

| Herramienta | Versión | Comando Verificación | Estado |
|-------------|---------|---------------------|--------|
| Node.js | 20.x+ | `node --version` | ⏳ Verificar |
| npm | 9.x+ | `npm --version` | ⏳ Verificar |
| Git | 2.x+ | `git --version` | ⏳ Verificar |
| Wrangler | 4.75.0 | `npx wrangler --version` | ⏳ Instalar |

### 5.2 Autenticación Cloudflare

| Verificación | Comando | Estado |
|--------------|---------|--------|
| Token existente | `npx wrangler whoami` | ⏳ Verificar |
| Cuenta activa | `npx wrangler whoami` | ⏳ Verificar |

### 5.3 Acceso a GitHub

| Verificación | Acción | Estado |
|--------------|--------|--------|
| Cuenta GitHub | Verificar acceso | ⏳ |
| Crear repositorio | `cbc-endes` | ⏳ |

---

## 6. Tareas Detalladas

### 6.1 Tarea 1: Inicialización del Repositorio

| Campo | Valor |
|-------|-------|
| **ID** | T1 |
| **Nombre** | Inicializar repositorio GitHub |
| **Agente** | Orquestador |
| **Duración Estimada** | 10 minutos |

**Pasos:**

1. Crear repositorio `cbc-endes` en GitHub
2. Clonar repositorio localmente
3. Crear estructura inicial de directorios
4. Crear `.gitignore` para proyecto Cloudflare
5. Commit inicial

**Comandos:**

```bash
# Crear estructura
mkdir -p cbc-endes
cd cbc-endes
git init

# Crear .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
.wrangler/

# Environment
.env
.env.local
.env.*.local
.dev.vars
*.dev.vars

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Wrangler
.wrangler/
EOF

# Commit inicial
git add .
git commit -m "Initial commit: Estructura base cbc-endes"
```

---

### 6.2 Tarea 2: Instalar y Configurar Wrangler 4.75.0

| Campo | Valor |
|-------|-------|
| **ID** | T2 |
| **Nombre** | Instalar Wrangler 4.75.0 |
| **Agente** | cloudflare-wrangler |
| **Duración Estimada** | 10 minutos |

**Pasos:**

1. Verificar autenticación con Cloudflare
2. Instalar Wrangler 4.75.0
3. Configurar wrangler.toml base

**Comandos:**

```bash
# Verificar autenticación
npx wrangler whoami

# Instalar Wrangler versión específica
npm install -g wrangler@4.75.0

# Verificar instalación
wrangler --version

# Configurar wrangler.toml base (raíz del proyecto)
cat > wrangler.toml << EOF
# Wrangler Configuration for cbc-endes
# Versión: 4.75.0

name = "cbc-endes"
compatibility_date = "2026-03-26"

# Environment: dev
[env.dev]
name = "cbc-endes-dev"
EOF
```

**Referencia Cloudflare:**
- https://developers.cloudflare.com/workers/wrangler/install-and-update/
- https://developers.cloudflare.com/workers/wrangler/configuration/

---

### 6.3 Tarea 3: Crear Worker de Prueba con Hono

| Campo | Valor |
|-------|-------|
| **ID** | T3 |
| **Nombre** | Crear Worker de prueba con Hono |
| **Agente** | cloudflare-workers |
| **Duración Estimada** | 20 minutos |

**Pasos:**

1. Crear directorio `apps/worker/`
2. Inicializar package.json
3. Instalar Hono y dependencias
4. Crear wrangler.toml del worker
5. Crear entry point con Hono
6. Crear endpoint de health check
7. Probar localmente
8. Desplegar a Cloudflare

**Estructura:**

```
apps/worker/
├── src/
│   └── index.ts
├── package.json
└── wrangler.toml
```

**package.json:**

```json
{
  "name": "cbc-endes-worker",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy --env dev",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "hono": "^4.6.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20260326.0",
    "typescript": "^5.4.0",
    "wrangler": "4.75.0"
  }
}
```

**wrangler.toml:**

```toml
name = "worker-cbc-endes"
main = "src/index.ts"
compatibility_date = "2026-03-26"
compatibility_flags = ["nodejs_compat"]

[env.dev]
name = "worker-cbc-endes-dev"
```

**src/index.ts (Hono):**

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: AppBindings }>();

// CORS middleware
app.use('/api/*', cors({
  origin: ['http://localhost:5173', 'https://pg-cbc-endes.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'cbc-endes-worker',
    version: '0.0.1'
  });
});

// Test endpoint
app.get('/api/test', (c) => {
  return c.json({
    message: 'Worker de prueba funcionando correctamente',
    hono: true,
    typescript: true
  });
});

export default app;

// Types
type AppBindings = {
  ENV: string;
};
```

**Comandos:**

```bash
cd apps/worker
npm install
npm run dev
# Probar en http://localhost:8787/api/health
npm run deploy
```

**Referencia Cloudflare:**
- https://developers.cloudflare.com/workers/
- https://hono.dev/

---

### 6.4 Tarea 4: Crear D1 Database de Prueba

| Campo | Valor |
|-------|-------|
| **ID** | T4 |
| **Nombre** | Crear D1 Database de prueba |
| **Agente** | cloudflare-d1 |
| **Duración Estimada** | 10 minutos |

**Pasos:**

1. Crear D1 database con Wrangler
2. Crear archivo de migración inicial
3. Aplicar migración
4. Configurar binding en worker
5. Probar conexión

**Comandos:**

```bash
# Crear D1 database
wrangler d1 create cbc-endes-db-test

# Output esperado:
# ✅ Successfully created database 'cbc-endes-db-test'
# Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Crear archivo de migración
mkdir -p migrations
cat > migrations/001-initial.sql << EOF
-- Migración inicial de prueba
-- Fecha: 2026-03-26

-- Tabla de migraciones
CREATE TABLE IF NOT EXISTS d1_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de prueba
CREATE TABLE IF NOT EXISTS test_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar dato de prueba
INSERT INTO test_items (name, description) 
VALUES ('Item de prueba', 'Este es un item de prueba para validar D1');

-- Registrar migración
INSERT INTO d1_migrations (name) VALUES ('001-initial');
EOF

# Aplicar migración (remoto)
wrangler d1 migrations apply cbc-endes-db-test --remote

# Aplicar migración (local para testing)
wrangler d1 migrations apply cbc-endes-db-test --local

# Verificar datos
wrangler d1 execute cbc-endes-db-test --remote --command "SELECT * FROM test_items"
```

**Actualizar wrangler.toml del worker:**

```toml
# Agregar al wrangler.toml del worker
[[d1_databases]]
binding = "DB"
database_name = "cbc-endes-db-test"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
migrations_dir = "../migrations"
```

**Actualizar src/index.ts:**

```typescript
// Agregar endpoint de prueba D1
app.get('/api/db/test', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM test_items').all();
    return c.json({
      success: true,
      data: result.results,
      message: 'Conexión D1 funcionando correctamente'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});
```

**Referencia Cloudflare:**
- https://developers.cloudflare.com/d1/get-started/

---

### 6.5 Tarea 5: Crear R2 Bucket de Prueba

| Campo | Valor |
|-------|-------|
| **ID** | T5 |
| **Nombre** | Crear R2 Bucket de prueba |
| **Agente** | cloudflare-r2 |
| **Duración Estimada** | 10 minutos |

**Pasos:**

1. Crear R2 bucket con Wrangler
2. Configurar CORS para permitir uploads
3. Configurar binding en worker
4. Crear endpoints de prueba
5. Probar upload/download

**Comandos:**

```bash
# Crear R2 bucket
wrangler r2 bucket create cbc-endes-storage-test

# Output esperado:
# ✅ Created bucket cbc-endes-storage-test

# Configurar CORS (permitir desde frontend)
wrangler r2 bucket update cbc-endes-storage-test --cors '[{
  "allowedOrigins": ["http://localhost:5173", "https://pg-cbc-endes.pages.dev"],
  "allowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "allowedHeaders": ["Content-Type"],
  "maxAgeSeconds": 3600
}]'
```

**Actualizar wrangler.toml del worker:**

```toml
# Agregar al wrangler.toml del worker
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "cbc-endes-storage-test"
```

**Actualizar src/index.ts:**

```typescript
// Agregar endpoints de prueba R2
app.post('/api/storage/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const key = `uploads/${Date.now()}-${file.name}`;
    await c.env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    return c.json({
      success: true,
      key: key,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

app.get('/api/storage/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const object = await c.env.BUCKET.get(key);

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpContentType || 'application/octet-stream'
      }
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});
```

**Referencia Cloudflare:**
- https://developers.cloudflare.com/r2/get-started/

---

### 6.6 Tarea 6: Instalar e Integrar TailAdmin UI

| Campo | Valor |
|-------|-------|
| **ID** | T6 |
| **Nombre** | Instalar TailAdmin Free React |
| **Agente** | frontend-react |
| **Duración Estimada** | 30 minutos |

**Pasos:**

1. Crear directorio `apps/frontend/`
2. Clonar/integrar TailAdmin Free React
3. Configurar Vite + React + TypeScript
4. Configurar Tailwind CSS
5. Crear wrangler.toml para Pages
6. Configurar variables de entorno
7. Probar localmente

**TailAdmin Free React:**
- Repositorio: https://github.com/TailAdmin/free-react-tailwind-admin-dashboard
- Licencia: MIT (gratuito para uso comercial)

**Comandos:**

```bash
# Crear estructura frontend
mkdir -p apps/frontend
cd apps/frontend

# Opción A: Clonar TailAdmin
git clone https://github.com/TailAdmin/free-react-tailwind-admin-dashboard.git temp
mv temp/* temp/.* . 2>/dev/null || true
rm -rf temp

# Opción B: Crear desde cero con Vite
npm create vite@latest . -- --template react-ts

# Instalar dependencias
npm install

# Instalar Tailwind CSS (si no está incluido)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js:**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**wrangler.toml para Pages:**

```toml
name = "pg-cbc-endes"
pages_build_output_dir = "dist"
compatibility_date = "2026-03-26"

[vars]
VITE_API_BASE_URL = "http://localhost:8787"
VITE_ENVIRONMENT = "dev"

[env.dev]
name = "pg-cbc-endes-dev"
vars = { VITE_API_BASE_URL = "http://localhost:8787", VITE_ENVIRONMENT = "dev" }
```

**.env.example:**

```bash
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:8787
VITE_ENVIRONMENT=dev
```

**src/lib/api.ts (API Client):**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

export async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Health check
export async function checkHealth() {
  return fetchApi<{ status: string; timestamp: string }>('/api/health');
}

// Test endpoint
export async function getTest() {
  return fetchApi<{ message: string }>('/api/test');
}
```

**Referencia Cloudflare:**
- https://developers.cloudflare.com/pages/

---

### 6.7 Tarea 7: Desplegar UI en Pages

| Campo | Valor |
|-------|-------|
| **ID** | T7 |
| **Nombre** | Desplegar UI en Cloudflare Pages |
| **Agente** | frontend-react |
| **Duración Estimada** | 15 minutos |

**Pasos:**

1. Build del frontend
2. Desplegar a Pages con Wrangler
3. Conectar con GitHub (opcional)
4. Verificar despliegue
5. Probar integración con Worker

**Comandos:**

```bash
cd apps/frontend

# Build
npm run build

# Desplegar a Pages
wrangler pages deploy dist --project-name=pg-cbc-endes --branch=main

# Output esperado:
# ✅ Deployment complete!
# https://pg-cbc-endes.pages.dev
```

**Actualizar API Base URL para producción:**

```bash
# Actualizar wrangler.toml
cat >> wrangler.toml << EOF

[env.production]
name = "pg-cbc-endes"
vars = { VITE_API_BASE_URL = "https://worker-cbc-endes-dev.workers.dev", VITE_ENVIRONMENT = "production" }
EOF
```

**Verificar integración:**

1. Abrir https://pg-cbc-endes.pages.dev
2. Verificar que la UI carga correctamente
3. Probar llamada a API del worker desde frontend

---

### 6.8 Tarea 8: Validar Integración End-to-End

| Campo | Valor |
|-------|-------|
| **ID** | T8 |
| **Nombre** | Validar integración completa |
| **Agente** | code-validator |
| **Duración Estimada** | 20 minutos |

**Validaciones:**

| # | Validación | Endpoint/URL | Estado Esperado |
|---|------------|--------------|-----------------|
| 1 | Worker responde | http://localhost:8787/api/health | 200 OK |
| 2 | D1 conectado | http://localhost:8787/api/db/test | 200 OK + datos |
| 3 | R2 conectado | POST http://localhost:8787/api/storage/upload | 200 OK |
| 4 | Frontend carga | http://localhost:5173 | 200 OK |
| 5 | CORS funciona | Frontend → Worker | Sin errores CORS |
| 6 | Pages desplegado | https://pg-cbc-endes.pages.dev | 200 OK |
| 7 | Pages → Worker | API calls desde Pages | 200 OK |

**Script de validación:**

```bash
# Test endpoints del worker
curl http://localhost:8787/api/health
curl http://localhost:8787/api/test
curl http://localhost:8787/api/db/test

# Test upload a R2
curl -X POST http://localhost:8787/api/storage/upload \
  -F "file=@test.txt"
```

**Checklist de validación:**

- [ ] Worker local funciona
- [ ] D1 local funciona
- [ ] R2 local funciona
- [ ] Frontend local funciona
- [ ] CORS configurado correctamente
- [ ] Pages desplegado accesible
- [ ] Pages puede llamar al Worker
- [ ] Typecheck pasa
- [ ] Lint pasa (si configurado)

---

## 7. Estructura de Directorios Resultante

```
cbc-endes/
├── .git/
├── .gitignore
├── README.md
├── wrangler.toml                    # Configuración root
│
├── apps/
│   ├── worker/                      # Backend con Hono
│   │   ├── src/
│   │   │   └── index.ts             # Entry point Hono
│   │   ├── package.json
│   │   └── wrangler.toml
│   │
│   └── frontend/                    # Frontend TailAdmin
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── lib/
│       │   │   └── api.ts           # API client
│       │   └── App.tsx
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── wrangler.toml
│
├── migrations/                      # Migraciones D1
│   └── 001-initial.sql
│
├── .governance/                     # Gobernanza existente
├── .agents/                         # Agentes existentes
├── .skills/                         # Skills existentes
└── _respuestas/                     # Documentación de fase
```

---

## 8. Recursos Cloudflare a Crear

### 8.1 Resumen de Recursos

| Recurso | Nombre | Binding | Propósito | Estado |
|---------|--------|---------|-----------|--------|
| **Worker** | `worker-cbc-endes` | N/A | Backend API con Hono | 🔲 Por crear |
| **Pages** | `pg-cbc-endes` | N/A | Frontend UI | 🔲 Por crear |
| **D1** | `cbc-endes-db-test` | DB | Database de prueba | 🔲 Por crear |
| **R2** | `cbc-endes-storage-test` | BUCKET | Storage de prueba | 🔲 Por crear |

### 8.2 IDs de Recursos (por completar)

| Recurso | ID | Comando para obtener |
|---------|-----|---------------------|
| D1 Database | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | `wrangler d1 info cbc-endes-db-test` |
| R2 Bucket | N/A (nombre único) | `wrangler r2 bucket list` |
| Worker | N/A (nombre único) | `wrangler whoami` |
| Pages | N/A (nombre único) | `wrangler pages project list` |

---

## 9. Configuración de Wrangler 4.75.0

### 9.1 Versión Específica

```json
{
  "devDependencies": {
    "wrangler": "4.75.0"
  }
}
```

### 9.2 Compatibilidad

```toml
compatibility_date = "2026-03-26"
compatibility_flags = ["nodejs_compat"]
```

### 9.3 Comandos Wrangler

| Acción | Comando |
|--------|---------|
| **Worker Dev** | `cd apps/worker && npm run dev` |
| **Worker Deploy** | `cd apps/worker && npm run deploy` |
| **Frontend Dev** | `cd apps/frontend && npm run dev` |
| **Frontend Deploy** | `cd apps/frontend && wrangler pages deploy dist --project-name=pg-cbc-endes` |
| **D1 Create** | `wrangler d1 create cbc-endes-db-test` |
| **D1 Migrate** | `wrangler d1 migrations apply cbc-endes-db-test --remote` |
| **R2 Create** | `wrangler r2 bucket create cbc-endes-storage-test` |
| **Whoami** | `wrangler whoami` |

---

## 10. Criterios de Aceptación

### 10.1 Criterios Técnicos

| Criterio | Verificación | Estado |
|----------|--------------|--------|
| Wrangler 4.75.0 instalado | `wrangler --version` | ⏳ |
| Worker responde local | `curl http://localhost:8787/api/health` | ⏳ |
| Worker desplegado | `curl https://worker-cbc-endes-dev.workers.dev/api/health` | ⏳ |
| D1 conectado | Endpoint `/api/db/test` retorna datos | ⏳ |
| R2 conectado | Upload/download funciona | ⏳ |
| Frontend local | http://localhost:5173 carga | ⏳ |
| Pages desplegado | https://pg-cbc-endes.pages.dev carga | ⏳ |
| CORS configurado | Frontend → Worker sin errores | ⏳ |

### 10.2 Criterios de Gobernanza

| Criterio | Verificación | Estado |
|----------|--------------|--------|
| R1: No hardcoding | URLs en variables de entorno | ⏳ |
| R2: Secrets | No hay secrets en código | ⏳ |
| R15: Inventario | `inventariador` actualiza inventario | ⏳ |
| R12: Commit | Commit con identificador | ⏳ |

---

## 11. Evidencias Requeridas

### 11.1 Evidencias de Ejecución

| Evidencia | Formato | Ubicación |
|-----------|---------|-----------|
| Output de `wrangler whoami` | Texto | Log de ejecución |
| Output de creación de recursos | Texto | Log de ejecución |
| Screenshots de endpoints | Imagen | `_respuestas/evidencias/` |
| URLs de despliegue | Texto | Este documento |

### 11.2 Evidencias de Código

| Evidencia | Archivo |
|-----------|---------|
| wrangler.toml configurado | `apps/worker/wrangler.toml`, `apps/frontend/wrangler.toml` |
| Hono funcionando | `apps/worker/src/index.ts` |
| API client | `apps/frontend/src/lib/api.ts` |
| Migración D1 | `migrations/001-initial.sql` |

---

## 12. Próximos Pasos

### 12.1 Inmediatos (Post-Fase 1)

1. **Invocar al agente `inventariador`** para actualizar `inventario_recursos.md`
2. **Commit inicial** con identificador (R12)
3. **Verificar `git status`** para confirmar cambios

### 12.2 Fase 2: Definición y Diseño

Una vez completada la Fase 1, proceder con:

1. Definir nombres definitivos de recursos
2. Diseñar schema de base de datos
3. Diseñar endpoints de API
4. Definir flujos de Workflow
5. Planificar integración con IA

---

## Referencias de Documentación Oficial

| Recurso | URL |
|---------|-----|
| Wrangler CLI | https://developers.cloudflare.com/workers/wrangler/ |
| Cloudflare Workers | https://developers.cloudflare.com/workers/ |
| Cloudflare Pages | https://developers.cloudflare.com/pages/ |
| Cloudflare D1 | https://developers.cloudflare.com/d1/ |
| Cloudflare R2 | https://developers.cloudflare.com/r2/ |
| Hono Framework | https://hono.dev/ |
| TailAdmin React | https://github.com/TailAdmin/free-react-tailwind-admin-dashboard |

---

**Estado del Plan:** ✅ **LISTO PARA EJECUCIÓN**

**Siguiente Paso:** Ejecutar tareas T1-T8 en orden secuencial

---

**Documento guardado en:** `_respuestas/002_fase1_configuracion_entorno_desarrollo.md`
