# Guía de Despliegue Integrado - Frontend y Backend PAI

**Fecha:** 28 de marzo de 2026  
**Fase:** FASE 4 - Integración y Pruebas  
**Versión:** 1.0

---

## Índice

1. [Introducción](#1-introducción)
2. [Recursos Cloudflare](#2-recursos-cloudflare)
3. [Despliegue del Backend](#3-despliegue-del-backend)
4. [Despliegue del Frontend](#4-despliegue-del-frontend)
5. [Verificación Post-Despliegue](#5-verificación-post-despliegue)
6. [Solución de Problemas](#6-solución-de-problemas)

---

## 1. Introducción

Esta guía explica cómo desplegar el frontend y backend del proyecto PAI de manera coordinada, incluyendo verificación de integración.

### Objetivos

- Explicar cómo desplegar el backend (Worker) en Cloudflare Workers
- Explicar cómo desplegar el frontend (Pages) en Cloudflare Pages
- Proporcionar procedimientos de verificación post-despliegue
- Definir cómo verificar que la integración funciona correctamente

### Reglas del Proyecto Aplicables

- **R8 (Configuración de despliegue)**: Evitar incluir `account_id` en archivos versionados
- **R15 (Inventario de recursos actualizado)**: Solo el agente `inventariador` puede actualizar `inventario_recursos.md`

---

## 2. Recursos Cloudflare

### 2.1. Recursos Existentes

Según [`inventario_recursos.md`](../../../.governance/inventario_recursos.md:1), los recursos existentes son:

| Tipo | Nombre | Estado | Descripción |
|------|---------|--------|-------------|
| Worker | `wk-backend` | ✅ Activo | Backend API para FASE 2 (Backend Core Funcional) |
| Pages | `pg-cbc-endes` | ✅ Activo | Frontend en producción |
| D1 Database | `db-cbconsulting` | ✅ Activa | Base de datos para menú dinámico y PAI |
| R2 Bucket | `r2-cbconsulting` | ✅ Activo | Bucket R2 para almacenamiento de archivos PAI |

### 2.2. Bindings Configurados

| Binding | Tipo | App | Descripción |
|---------|------|-----|-------------|
| `db_binding_01` | D1 Database | `wk-backend` | Binding para `db-cbconsulting` |
| `r2_binding_01` | R2 Bucket | `wk-backend` | Binding al bucket `r2-cbconsulting` |
| `VITE_API_BASE_URL` | Variable frontend | `pg-cbc-endes` | URL de la API backend |
| `VITE_ENVIRONMENT` | Variable frontend | `pg-cbc-endes` | Entorno de ejecución |

---

## 3. Despliegue del Backend

### 3.1. Verificar Autenticación

Antes de desplegar, verificar que estás autenticado en Cloudflare:

```bash
npx wrangler whoami
```

Si no estás autenticado, ejecuta:

```bash
npx wrangler login
```

### 3.2. Desplegar el Worker

El Worker backend ya está desplegado y activo. Para actualizarlo con los cambios de FASE 2:

```bash
cd apps/worker
npm run deploy
```

Este comando:
- Compila el código TypeScript
- Despliega el Worker a Cloudflare Workers
- Configura los bindings (D1 y R2)
- Actualiza las variables de entorno

### 3.3. Verificar Despliegue del Backend

Verificar que el Worker está desplegado correctamente:

```bash
# Verificar health check
curl https://wk-backend.cbc-endes.workers.dev/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "timestamp": "2026-03-28T06:00:00.000Z",
  "service": "wk-backend",
  "version": "1.0.0"
}
```

### 3.4. Verificar Endpoints PAI

Verificar que los endpoints PAI responden correctamente:

```bash
# Verificar listado de proyectos
curl https://wk-backend.cbc-endes.workers.dev/api/pai/proyectos
```

---

## 4. Despliegue del Frontend

### 4.1. Verificar Autenticación

Antes de desplegar, verificar que estás autenticado en Cloudflare:

```bash
npx wrangler whoami
```

### 4.2. Construir el Frontend

Construir el frontend para producción:

```bash
cd apps/frontend
npm run build
```

Este comando:
- Compila el código TypeScript
- Optimiza el código para producción
- Genera los archivos estáticos en `dist/`

### 4.3. Desplegar en Cloudflare Pages

El frontend ya está desplegado y activo. Para actualizarlo con los cambios de FASE 3:

```bash
cd apps/frontend
npx wrangler pages deploy dist --project-name=pg-cbc-endes
```

Este comando:
- Sube los archivos estáticos a Cloudflare Pages
- Configura las variables de entorno
- Despliega a producción

### 4.4. Verificar Despliegue del Frontend

Verificar que el frontend está desplegado correctamente:

```bash
# Verificar que el frontend está accesible
curl https://d00e4cdb.pg-cbc-endes.pages.dev/
```

### 4.5. Configurar Variables de Entorno

Las variables de entorno del frontend se configuran en el proyecto Pages:

1. Ir al dashboard de Cloudflare Pages
2. Seleccionar el proyecto `pg-cbc-endes`
3. Ir a Settings → Environment variables
4. Configurar las variables:

| Variable | Valor (Producción) |
|----------|-------------------|
| `VITE_API_BASE_URL` | `https://wk-backend.cbc-endes.workers.dev` |
| `VITE_ENVIRONMENT` | `production` |

---

## 5. Verificación Post-Despliegue

### 5.1. Verificación de Integración

#### Paso 1: Verificar Backend

```bash
# Verificar health check
curl https://wk-backend.cbc-endes.workers.dev/api/health

# Verificar endpoint de menú
curl https://wk-backend.cbc-endes.workers.dev/api/menu

# Verificar endpoint de proyectos
curl https://wk-backend.cbc-endes.workers.dev/api/pai/proyectos
```

#### Paso 2: Verificar Frontend

1. Abrir el navegador y navegar a `https://d00e4cdb.pg-cbc-endes.pages.dev/`
2. Abrir las herramientas de desarrollador (F12)
3. Ir a la pestaña Console
4. Verificar que no hay errores de JavaScript

#### Paso 3: Verificar Integración

1. Navegar al módulo de Proyectos
2. Verificar que la página de listado carga correctamente
3. Verificar que no hay errores de red en la pestaña Network
4. Verificar que los datos se muestran correctamente

### 5.2. Lista de Verificación

| Verificación | Estado | Notas |
|--------------|--------|-------|
| Backend desplegado correctamente | ☐ | |
| Frontend desplegado correctamente | ☐ | |
| Endpoint `/api/health` responde | ☐ | |
| Endpoint `/api/menu` responde | ☐ | |
| Endpoint `/api/pai/proyectos` responde | ☐ | |
| Frontend es accesible | ☐ | |
| No hay errores de JavaScript | ☐ | |
| No hay errores de red | ☐ | |
| Módulo de Proyectos carga correctamente | ☐ | |
| Integración frontend-backend funciona | ☐ | |

---

## 6. Solución de Problemas

### 6.1. Problemas Comunes

#### Error: "Not authenticated"

**Solución:**

```bash
npx wrangler login
```

#### Error: "Account ID not found"

**Solución:**

Verificar que el `account_id` está configurado correctamente en `wrangler.toml` o que estás autenticado.

#### Error: "CORS policy error"

**Solución:**

1. Verificar que CORS está configurado correctamente en el backend
2. Verificar que los orígenes permitidos incluyen la URL del frontend

#### Error: "Network error"

**Solución:**

1. Verificar que el backend está en ejecución
2. Verificar que la URL del backend es correcta
3. Verificar que no hay errores de red

### 6.2. Logs y Debugging

#### Ver Logs del Worker

```bash
# Ver logs del Worker en tiempo real
npx wrangler tail wk-backend
```

#### Ver Logs de Pages

1. Ir al dashboard de Cloudflare Pages
2. Seleccionar el proyecto `pg-cbc-endes`
3. Ir a Logs
4. Verificar los logs de ejecución

### 6.3. Rollback

Si hay problemas después del despliegue, puedes hacer rollback a una versión anterior:

#### Rollback del Backend

```bash
# Desplegar una versión anterior del Worker
cd apps/worker
git checkout <commit-hash>
npm run deploy
```

#### Rollback del Frontend

```bash
# Desplegar una versión anterior del Frontend
cd apps/frontend
git checkout <commit-hash>
npm run build
npx wrangler pages deploy dist --project-name=pg-cbc-endes
```

---

## Referencias

- [`inventario_recursos.md`](../../../.governance/inventario_recursos.md:1) - Inventario de recursos y configuración
- [`reglas_proyecto.md`](../../../.governance/reglas_proyecto.md:1) - Reglas del proyecto
- [`wrangler.toml`](../../../apps/worker/wrangler.toml:1) - Configuración Wrangler del Worker
- [`apps/frontend/wrangler.toml`](../../../apps/frontend/wrangler.toml:1) - Configuración Wrangler del Frontend

---

**Fin del Documento - Guía de Despliegue Integrado**
