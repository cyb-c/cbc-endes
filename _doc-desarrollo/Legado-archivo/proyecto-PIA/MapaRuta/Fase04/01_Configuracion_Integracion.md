# Configuración de Integración Frontend-Backend - PAI

**Fecha:** 28 de marzo de 2026  
**Fase:** FASE 4 - Integración y Pruebas  
**Versión:** 1.0

---

## Índice

1. [Introducción](#1-introducción)
2. [Variables de Entorno](#2-variables-de-entorno)
3. [Configuración de CORS](#3-configuración-de-cors)
4. [Endpoints de API](#4-endpoints-de-api)
5. [Configuración de Cliente HTTP](#5-configuración-de-cliente-http)
6. [Verificación de Integración](#6-verificación-de-integración)

---

## 1. Introducción

Este documento define la configuración necesaria para que el frontend del proyecto PAI se comunique correctamente con el backend implementado en FASE 2.

### Objetivos

- Establecer la configuración de variables de entorno para la integración
- Definir la configuración de CORS para el backend
- Documentar los endpoints de API disponibles
- Proporcionar procedimientos de verificación de la integración

---

## 2. Variables de Entorno

### 2.1. Variables del Frontend

Según [`inventario_recursos.md`](../../../.governance/inventario_recursos.md:199), las variables de entorno del frontend son:

| Variable | Tipo | Sensible | Descripción | Valor por Defecto |
|----------|------|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | String | No | URL base del backend API | - |
| `VITE_ENVIRONMENT` | String | No | Entorno (dev/preview/production) | - |

### 2.2. Configuración por Entorno

#### Desarrollo Local

Archivo: `apps/frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8787
VITE_ENVIRONMENT=dev
```

#### Preview (Cloudflare Pages)

Configurado en `apps/frontend/wrangler.toml`:

```toml
[env.preview]
vars = { VITE_ENVIRONMENT = "preview" }
```

La URL base se configura en el proyecto Pages.

#### Producción (Cloudflare Pages)

Configurado en `apps/frontend/wrangler.toml`:

```toml
[env.production]
vars = { VITE_ENVIRONMENT = "production" }
```

La URL base se configura en el proyecto Pages.

### 2.3. Reglas del Proyecto Aplicables

- **R2 (Cero hardcoding)**: No incluir URLs ni configuraciones fijas en el código
- **R14 (Variables de entorno del frontend)**: Declarar y documentar todas las variables expuestas al frontend en CI
- **R3 (Gestión de secrets y credenciales)**: Los valores de secrets no se versionan en el repositorio

---

## 3. Configuración de CORS

### 3.1. Configuración en el Backend

El backend debe configurar CORS para permitir solicitudes desde el frontend.

#### Orígenes Permitidos

| Entorno | Orígenes Permitidos |
|---------|---------------------|
| Desarrollo local | `http://localhost:5173`, `http://localhost:3000` |
| Preview | `https://d00e4cdb.pg-cbc-endes.pages.dev` |
| Producción | URL de producción del frontend |

#### Encabezados CORS

El backend debe incluir los siguientes encabezados en todas las respuestas:

```typescript
headers: {
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}
```

### 3.2. Reglas del Proyecto Aplicables

- **R7 (CORS y seguridad de orígenes)**: Las aplicaciones que sirven a frontends deben respetar CORS
- **R8 (Configuración de despliegue)**: Evitar incluir `account_id` en archivos versionados

---

## 4. Endpoints de API

### 4.1. Endpoints del Backend

Según [`inventario_recursos.md`](../../../.governance/inventario_recursos.md:234), los endpoints del Worker backend son:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check del servicio |
| `/api/test` | GET | Test endpoint de disponibilidad |
| `/api/menu` | GET | Obtiene estructura de menú dinámico |
| `/api/pai/proyectos` | POST | Crear nuevo proyecto PAI |
| `/api/pai/proyectos/:id` | GET | Obtener detalles de proyecto PAI |
| `/api/pai/proyectos` | GET | Listar proyectos PAI con filtros y paginación |
| `/api/pai/proyectos/:id/analisis` | POST | Ejecutar análisis completo de proyecto PAI |
| `/api/pai/proyectos/:id/artefactos` | GET | Obtener artefactos de proyecto PAI |
| `/api/pai/proyectos/:id/estado` | PUT | Cambiar estado manual de proyecto PAI |
| `/api/pai/proyectos/:id` | DELETE | Eliminar proyecto PAI y sus artefactos |
| `/api/pai/proyectos/:id/pipeline` | GET | Obtener historial de ejecución de proyecto PAI |
| `/api/pai/proyectos/:id/notas` | POST | Crear nota asociada a proyecto PAI |
| `/api/pai/proyectos/:id/notas/:notaId` | PUT | Editar nota existente de proyecto PAI |

### 4.2. Contratos de API

Para detalles completos de los contratos de API, consultar:

- [`04_Specificacion_API_Frontend.md`](../Fase03/04_Specificacion_API_Frontend.md:1) - Especificación de interfaces TypeScript
- [`Especificacion_API_PAI.md`](../Fase02/Especificacion_API_PAI.md:1) - Especificación completa de endpoints backend

### 4.3. Reglas del Proyecto Aplicables

- **R13 (Contratos entre servicios)**: Documentar las rutas, métodos y formatos de request/response de cada endpoint
- **R6 (Convención de respuestas HTTP)**: Seguir la estructura de respuestas definida

---

## 5. Configuración de Cliente HTTP

### 5.1. Cliente API Implementado

El cliente API ya está implementado en [`apps/frontend/src/lib/pai-api.ts`](../../../apps/frontend/src/lib/pai-api.ts:1).

### 5.2. Clase PaiApiClient

La clase `PaiApiClient` proporciona métodos para todos los endpoints PAI:

```typescript
class PaiApiClient {
  // Endpoints de Proyectos
  crearProyecto(data: CrearProyectoRequest)
  obtenerProyecto(id: number)
  listarProyectos(params?: ListarProyectosParams)
  ejecutarAnalisis(id: number)
  obtenerArtefactos(id: number)
  cambiarEstado(id: number, data: CambiarEstadoRequest)
  eliminarProyecto(id: number)
  obtenerHistorial(id: number)
  
  // Endpoints de Notas
  crearNota(id: number, data: CrearNotaRequest)
  editarNota(id: number, notaId: number, data: EditarNotaRequest)
  eliminarNota(id: number, notaId: number)
  
  // Utilidades
  getErrorMessage(error: ApiError | undefined): string
}
```

### 5.3. Configuración Base URL

La URL base se obtiene de la variable de entorno `VITE_API_BASE_URL`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
```

### 5.4. Manejo de Errores

El cliente API implementa manejo de errores estandarizado:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

### 5.5. Reglas del Proyecto Aplicables

- **R4 (Accesores tipados para bindings)**: Proporcionar un módulo con funciones/accessors tipados para obtener bindings y variables
- **R6 (Convención de respuestas HTTP)**: Seguir la estructura de respuestas definida

---

## 6. Verificación de Integración

### 6.1. Procedimiento de Verificación

#### Paso 1: Verificar Variables de Entorno

```bash
# Verificar que las variables de entorno están configuradas
cd apps/frontend
cat .env
```

#### Paso 2: Verificar Backend en Ejecución

```bash
# Verificar que el backend está en ejecución
curl http://localhost:8787/api/health
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

#### Paso 3: Verificar Endpoint de Menú

```bash
# Verificar que el endpoint de menú funciona
curl http://localhost:8787/api/menu
```

Respuesta esperada:

```json
{
  "modulos": [...]
}
```

#### Paso 4: Verificar Endpoints PAI

```bash
# Verificar que los endpoints PAI responden correctamente
curl http://localhost:8787/api/pai/proyectos
```

Respuesta esperada:

```json
{
  "proyectos": [],
  "paginacion": {
    "pagina_actual": 1,
    "por_pagina": 20,
    "total": 0,
    "total_paginas": 0
  }
}
```

### 6.2. Verificación desde el Frontend

#### Paso 1: Iniciar Frontend en Desarrollo

```bash
cd apps/frontend
npm run dev
```

El frontend debería estar disponible en `http://localhost:5173`.

#### Paso 2: Abrir Consola del Navegador

Abrir las herramientas de desarrollador del navegador y verificar:

1. No hay errores de conexión
2. Las solicitudes a la API responden correctamente
3. Los datos se muestran en la interfaz

#### Paso 3: Navegar al Módulo de Proyectos

1. Abrir el menú lateral
2. Seleccionar "Proyectos"
3. Verificar que la página de listado de proyectos carga correctamente

### 6.3. Lista de Verificación

| Verificación | Estado | Notas |
|--------------|--------|-------|
| Variables de entorno configuradas | ☐ | |
| Backend en ejecución | ☐ | |
| Endpoint `/api/health` responde | ☐ | |
| Endpoint `/api/menu` responde | ☐ | |
| Endpoint `/api/pai/proyectos` responde | ☐ | |
| Frontend inicia sin errores | ☐ | |
| No hay errores de CORS en consola | ☐ | |
| Módulo de Proyectos carga correctamente | ☐ | |
| Listado de proyectos muestra datos | ☐ | |
| Creación de proyecto funciona | ☐ | |

---

## Referencias

- [`inventario_recursos.md`](../../../.governance/inventario_recursos.md:1) - Inventario de recursos y configuración
- [`reglas_proyecto.md`](../../../.governance/reglas_proyecto.md:1) - Reglas del proyecto
- [`pai-api.ts`](../../../apps/frontend/src/lib/pai-api.ts:1) - Cliente API implementado
- [`04_Specificacion_API_Frontend.md`](../Fase03/04_Specificacion_API_Frontend.md:1) - Especificación de interfaces TypeScript
- [`Especificacion_API_PAI.md`](../Fase02/Especificacion_API_PAI.md:1) - Especificación completa de endpoints backend

---

**Fin del Documento - Configuración de Integración**
