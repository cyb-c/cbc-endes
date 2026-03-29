# Comandos de Ejecución — Fase 1 Configuración de Entorno

**Fecha:** 2026-03-26  
**Tipo:** Guía de comandos rápida  
**Estado:** ✅ Listo para ejecución  
**Versión:** 1.0  

---

## Índice de Contenido

1. [Verificación Inicial](#1-verificación-inicial)
2. [T1: Inicializar Repositorio](#2-t1-inicializar-repositorio)
3. [T2: Instalar Wrangler 4.75.0](#3-t2-instalar-wrangler-4750)
4. [T3: Crear Worker con Hono](#4-t3-crear-worker-con-hono)
5. [T4: Crear D1 Database](#5-t4-crear-d1-database)
6. [T5: Crear R2 Bucket](#6-t5-crear-r2-bucket)
7. [T6: Instalar TailAdmin UI](#7-t6-instalar-tailadmin-ui)
8. [T7: Desplegar en Pages](#8-t7-desplegar-en-pages)
9. [T8: Validar Integración](#9-t8-validar-integración)
10. [Post-Fase 1](#10-post-fase-1)

---

## 1. Verificación Inicial

```bash
# Verificar autenticación con Cloudflare
npx wrangler whoami

# Expected output:
#  ✓ Logged in as [tu-email]
#  ✓ Account: [nombre-cuenta]

# Si no estás autenticado:
npx wrangler login

# Verificar versión de Node.js
node --version  # Debe ser 20.x o superior

# Verificar versión de npm
npm --version  # Debe ser 9.x o superior

# Verificar Git
git --version
```

---

## 2. T1: Inicializar Repositorio

```bash
# Crear directorio del proyecto
mkdir -p /workspaces/456
cd /workspaces/456

# Inicializar Git (si no está inicializado)
git init

# Crear .gitignore específico para Cloudflare
cat > .gitignore << 'EOF'
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
git add .gitignore
git commit -m "Initial commit: cbc-endes project structure"

# Si el repo ya está en GitHub, configurar remote
# git remote add origin https://github.com/[tu-usuario]/cbc-endes.git
# git push -u origin main
```

---

## 3. T2: Instalar Wrangler 4.75.0

```bash
# Instalar Wrangler versión específica (global)
npm install -g wrangler@4.75.0

# Verificar instalación
wrangler --version

# Expected: wrangler 4.75.0

# Crear wrangler.toml base en raíz
cat > wrangler.toml << 'EOF'
# Wrangler Configuration for cbc-endes
# Versión: 4.75.0

name = "cbc-endes"
compatibility_date = "2026-03-26"

# Environment: dev
[env.dev]
name = "cbc-endes-dev"
EOF

# Verificar configuración
wrangler config
```

---

## 4. T3: Crear Worker con Hono

```bash
# Crear estructura del worker
mkdir -p apps/worker/src
cd apps/worker

# Crear package.json
cat > package.json << 'EOF'
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
EOF

# Crear wrangler.toml del worker
cat > wrangler.toml << 'EOF'
name = "worker-cbc-endes"
main = "src/index.ts"
compatibility_date = "2026-03-26"
compatibility_flags = ["nodejs_compat"]

[env.dev]
name = "worker-cbc-endes-dev"
EOF

# Crear tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*"]
}
EOF

# Crear entry point con Hono
cat > src/index.ts << 'EOF'
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
EOF

# Instalar dependencias
npm install

# Probar localmente
npm run dev
# El worker estará disponible en http://localhost:8787

# En otra terminal, probar endpoints:
curl http://localhost:8787/api/health
curl http://localhost:8787/api/test

# Desplegar a Cloudflare
npm run deploy

# Verificar despliegue
curl https://worker-cbc-endes-dev.workers.dev/api/health
```

---

## 5. T4: Crear D1 Database

```bash
# Volver a raíz del proyecto
cd /workspaces/456

# Crear directorio de migraciones
mkdir -p migrations

# Crear D1 database
wrangler d1 create cbc-endes-db-test

# Expected output:
# ✅ Successfully created database 'cbc-endes-db-test'
# Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Guardar el Database ID para el siguiente paso
DATABASE_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Crear archivo de migración inicial
cat > migrations/001-initial.sql << 'EOF'
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

# Actualizar wrangler.toml del worker con binding D1
cd apps/worker
cat >> wrangler.toml << EOF

# D1 Database Binding
[[d1_databases]]
binding = "DB"
database_name = "cbc-endes-db-test"
database_id = "$DATABASE_ID"
migrations_dir = "../migrations"
EOF

# Aplicar migración (remoto)
wrangler d1 migrations apply cbc-endes-db-test --remote

# Aplicar migración (local para testing)
wrangler d1 migrations apply cbc-endes-db-test --local

# Verificar datos
wrangler d1 execute cbc-endes-db-test --remote --command "SELECT * FROM test_items"
wrangler d1 execute cbc-endes-db-test --local --command "SELECT * FROM test_items"

# Actualizar src/index.ts del worker con endpoint D1
cat >> src/index.ts << 'EOF'

// D1 Test endpoint
app.get('/api/db/test', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM test_items').all();
    return c.json({
      success: true,
      data: result.results,
      message: 'Conexión D1 funcionando correctamente'
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});
EOF

# Redeploy para aplicar cambios
npm run deploy

# Probar endpoint D1
curl https://worker-cbc-endes-dev.workers.dev/api/db/test
```

---

## 6. T5: Crear R2 Bucket

```bash
# Volver a raíz del proyecto
cd /workspaces/456

# Crear R2 bucket
wrangler r2 bucket create cbc-endes-storage-test

# Expected output:
# ✅ Created bucket cbc-endes-storage-test

# Configurar CORS
wrangler r2 bucket update cbc-endes-storage-test --cors '[{
  "allowedOrigins": ["http://localhost:5173", "https://pg-cbc-endes.pages.dev"],
  "allowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "allowedHeaders": ["Content-Type"],
  "maxAgeSeconds": 3600
}]'

# Actualizar wrangler.toml del worker con binding R2
cd apps/worker
cat >> wrangler.toml << 'EOF'

# R2 Bucket Binding
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "cbc-endes-storage-test"
EOF

# Actualizar src/index.ts del worker con endpoints R2
cat >> src/index.ts << 'EOF'

// R2 Upload endpoint
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
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// R2 Download endpoint
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
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
EOF

# Redeploy para aplicar cambios
npm run deploy

# Probar upload a R2
echo "Contenido de prueba" > test.txt
curl -X POST https://worker-cbc-endes-dev.workers.dev/api/storage/upload \
  -F "file=@test.txt"

# Limpiar
rm test.txt
```

---

## 7. T6: Instalar TailAdmin UI

```bash
# Volver a raíz del proyecto
cd /workspaces/456

# Crear estructura del frontend
mkdir -p apps/frontend
cd apps/frontend

# Opción A: Clonar TailAdmin (recomendado)
git clone https://github.com/TailAdmin/free-react-tailwind-admin-dashboard.git temp
mv temp/* temp/.* . 2>/dev/null || true
rm -rf temp

# Opción B: Crear con Vite (alternativa)
# npm create vite@latest . -- --template react-ts

# Instalar dependencias
npm install

# Verificar/instalar Tailwind CSS (si no está incluido)
npm install -D tailwindcss postcss autoprefixer

# Si es instalación nueva, inicializar Tailwind
# npx tailwindcss init -p

# Crear wrangler.toml para Pages
cat > wrangler.toml << 'EOF'
name = "pg-cbc-endes"
pages_build_output_dir = "dist"
compatibility_date = "2026-03-26"

[vars]
VITE_API_BASE_URL = "http://localhost:8787"
VITE_ENVIRONMENT = "dev"

[env.dev]
name = "pg-cbc-endes-dev"
vars = { VITE_API_BASE_URL = "http://localhost:8787", VITE_ENVIRONMENT = "dev" }

[env.production]
name = "pg-cbc-endes"
vars = { VITE_API_BASE_URL = "https://worker-cbc-endes-dev.workers.dev", VITE_ENVIRONMENT = "production" }
EOF

# Crear .env.example
cat > .env.example << 'EOF'
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:8787
VITE_ENVIRONMENT=dev
EOF

# Crear API client en src/lib/api.ts
mkdir -p src/lib
cat > src/lib/api.ts << 'EOF'
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

// D1 test
export async function getDbTest() {
  return fetchApi<{ success: boolean; data: any[] }>('/api/db/test');
}
EOF

# Probar localmente
npm run dev
# El frontend estará disponible en http://localhost:5173
```

---

## 8. T7: Desplegar en Pages

```bash
# Asegurarse de estar en directorio del frontend
cd /workspaces/456/apps/frontend

# Build del frontend
npm run build

# Verificar que se creó el directorio dist
ls -la dist/

# Desplegar a Cloudflare Pages
wrangler pages deploy dist --project-name=pg-cbc-endes --branch=main

# Expected output:
# ✅ Deployment complete!
# https://pg-cbc-endes.pages.dev

# Verificar despliegue
curl https://pg-cbc-endes.pages.dev

# Actualizar wrangler.toml del worker con CORS para production URL
cd ../worker
# (Ya está configurado en el wrangler.toml)

# Redeploy del worker si es necesario
npm run deploy
```

---

## 9. T8: Validar Integración

```bash
# Test endpoints del worker
echo "=== Worker Health Check ==="
curl http://localhost:8787/api/health
curl https://worker-cbc-endes-dev.workers.dev/api/health

echo -e "\n=== Worker Test Endpoint ==="
curl http://localhost:8787/api/test
curl https://worker-cbc-endes-dev.workers.dev/api/test

echo -e "\n=== D1 Connection Test ==="
curl http://localhost:8787/api/db/test
curl https://worker-cbc-endes-dev.workers.dev/api/db/test

echo -e "\n=== R2 Upload Test ==="
echo "Contenido de prueba $(date)" > test-r2.txt
curl -X POST http://localhost:8787/api/storage/upload \
  -F "file=@test-r2.txt"
rm test-r2.txt

echo -e "\n=== Frontend Local ==="
# Abrir en navegador: http://localhost:5173

echo -e "\n=== Pages Desplegado ==="
curl https://pg-cbc-endes.pages.dev

echo -e "\n=== Validación Completada ==="
```

**Checklist de Validación:**

- [ ] Worker local responde (http://localhost:8787)
- [ ] Worker remoto responde (workers.dev)
- [ ] D1 retorna datos de prueba
- [ ] R2 acepta uploads
- [ ] Frontend local carga (http://localhost:5173)
- [ ] Pages desplegado carga (pages.dev)
- [ ] CORS permite comunicación frontend → worker

---

## 10. Post-Fase 1

```bash
# Volver a raíz del proyecto
cd /workspaces/456

# Verificar estado de Git
git status

# Agregar todos los archivos nuevos
git add .

# Verificar qué se va a commitear
git status

# Commit con identificador (R12)
# El usuario debe proporcionar identificador o responder "Orquestador Decide"
git commit -m "[IDENTIFICADOR] Fase 1: Configuración de entorno de desarrollo

- Wrangler 4.75.0 instalado y configurado
- Worker creado con Hono (endpoints: /health, /test, /db/test, /storage/*)
- D1 database creada: cbc-endes-db-test
- R2 bucket creado: cbc-endes-storage-test
- Frontend TailAdmin React instalado
- Pages desplegado: pg-cbc-endes
- Bindings configurados: DB, BUCKET
- Migraciones D1: 001-initial.sql

Recursos de prueba para validar integración end-to-end.
Listo para fase de definición y diseño del proyecto."

# Verificar commit
git log -n 1
git status
```

---

## Comandos de Referencia Rápida

### Desarrollo Local

```bash
# Worker (terminal 1)
cd apps/worker && npm run dev

# Frontend (terminal 2)
cd apps/frontend && npm run dev
```

### Despliegue

```bash
# Worker
cd apps/worker && npm run deploy

# Pages
cd apps/frontend && wrangler pages deploy dist --project-name=pg-cbc-endes
```

### Bases de Datos

```bash
# D1: Crear
wrangler d1 create cbc-endes-db-test

# D1: Aplicar migraciones
wrangler d1 migrations apply cbc-endes-db-test --remote

# D1: Ejecutar query
wrangler d1 execute cbc-endes-db-test --remote --command "SELECT * FROM test_items"

# R2: Crear bucket
wrangler r2 bucket create cbc-endes-storage-test

# R2: Listar objetos
wrangler r2 object list cbc-endes-storage-test
```

### Utilidades

```bash
# Verificar autenticación
wrangler whoami

# Verificar versión
wrangler --version

# Listar proyectos
wrangler pages project list

# Listar databases
wrangler d1 list

# Listar buckets
wrangler r2 bucket list
```

---

## Referencias

| Recurso | URL |
|---------|-----|
| Wrangler CLI | https://developers.cloudflare.com/workers/wrangler/ |
| Cloudflare Workers | https://developers.cloudflare.com/workers/ |
| Cloudflare Pages | https://developers.cloudflare.com/pages/ |
| Cloudflare D1 | https://developers.cloudflare.com/d1/ |
| Cloudflare R2 | https://developers.cloudflare.com/r2/ |
| Hono Framework | https://hono.dev/ |

---

**Estado:** ✅ **LISTO PARA EJECUCIÓN**

**Documento guardado en:** `_respuestas/004_comandos_ejecucion_fase1.md`
