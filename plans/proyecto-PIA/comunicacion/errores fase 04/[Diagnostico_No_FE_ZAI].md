# Diagnóstico Exhaustivo: Menú "Proyectos" No Visible en Frontend

> **Fecha:** 2026-03-28  
> **Fase:** FASE 4 - Integración y Pruebas  
> **Severidad:** Crítica  
> **Estado:** En Investigación  
> **Evidencia:** `plans/proyecto-PIA/comunicacion/errores fase 04/image_fe_ahora.png`

---

## Índice de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Evidencia Visual](#evidencia-visual)
3. [Hechos Comprobados](#hechos-comprobados)
4. [Hipótesis de Trabajo](#hipótesis-de-trabajo)
5. [Validaciones Pendientes](#validaciones-pendientes)
6. [Acciones de Diagnóstico](#acciones-de-diagnóstico)
7. [Análisis Técnico Detallado](#análisis-técnico-detallado)
8. [Conclusiones](#conclusiones)

---

## Resumen Ejecutivo

El frontend desplegado en Cloudflare Pages **no muestra la sección "Proyectos"** en el menú lateral, a pesar de que:

1. El backend está funcionando correctamente y devuelve el menú con la sección "Proyectos"
2. Los componentes del menú dinámico están implementados correctamente
3. La configuración de producción indica que el menú dinámico debería estar activado

Este problema ha persistido a través de múltiples intentos de corrección, lo que sugiere que hay una causa raíz más profunda que no ha sido identificada o corregida adecuadamente.

---

## Evidencia Visual

### Imagen: `image_fe_ahora.png`

**Observaciones:**
- El frontend muestra el menú lateral con opciones de demostración de TailAdmin (Dashboard, Calendar, Forms, Tables, UI Elements, Charts, etc.)
- NO aparece la sección "Proyectos" en el menú lateral
- La interfaz parece ser la plantilla de administración TailAdmin estándar, sin elementos de la aplicación PAI

**Interpretación:**
El frontend está renderizando el menú estático de TailAdmin (`AppSidebar`) en lugar del menú dinámico (`AppSidebarDynamic`).

---

## Hechos Comprobados

### 1. Backend Funcionando Correctamente

**Endpoint `/api/health`:**
```bash
$ curl -s https://wk-backend-dev.cbconsulting.workers.dev/api/health
{"status":"ok","timestamp":"2026-03-28T08:26:28.157Z","service":"cbc-endes-worker","version":"0.0.1"}
```
✅ **Resultado:** El backend responde correctamente

**Endpoint `/api/menu`:**
```bash
$ curl -s https://wk-backend-dev.cbconsulting.workers.dev/api/menu
{"data":[{"id":10,"nombre_interno":"PROYECTOS","nombre_mostrar":"Proyectos","descripcion":"Sección principal para gestionar proyectos de análisis inmobiliarios (PAI)","icono":"folder","orden":10,"funciones":[...]}]}
```
✅ **Resultado:** El backend devuelve correctamente el menú con la sección "Proyectos" y sus 8 funciones

### 2. Componentes del Menú Dinámico Implementados

**`AppSidebarDynamic.tsx`:**
- ✅ Implementado correctamente
- ✅ Usa el hook `useMenu()` para obtener los módulos del menú dinámico
- ✅ Renderiza los módulos usando el componente `SidebarModule`
- ✅ Maneja estados de carga y error

**`SidebarModule.tsx`:**
- ✅ Implementado correctamente
- ✅ Renderiza un módulo con sus funciones
- ✅ Maneja el estado de expansión/colapso
- ✅ Usa el componente `SidebarItem` para renderizar las funciones

**`SidebarItem.tsx`:**
- ✅ Implementado correctamente
- ✅ Usa `Link` de `react-router-dom` para navegar
- ✅ Muestra el estado activo de la ruta
- ✅ Renderiza el icono y el nombre de la función

**`useMenu.ts`:**
- ✅ Implementado correctamente
- ✅ Obtiene el menú del endpoint `${BACKEND_URL}/api/menu`
- ✅ Usa `import.meta.env.VITE_API_BASE_URL` para obtener la URL del backend
- ✅ Maneja estados de carga y error

### 3. Feature Flag Implementado

**`AppLayout.tsx`:**
```typescript
const USE_DYNAMIC_MENU = import.meta.env.VITE_USE_DYNAMIC_MENU === 'true';
```
✅ **Resultado:** El feature flag está implementado correctamente

### 4. Configuración de Producción

**`wrangler.toml` (sección `[env.production]`):**
```toml
[env.production]
name = "pg-cbc-endes"
vars = { VITE_API_BASE_URL = "https://worker-cbc-endes-dev.workers.dev", VITE_ENVIRONMENT = "production", VITE_USE_DYNAMIC_MENU = "true" }
```
⚠️ **Observación:** La URL `VITE_API_BASE_URL` es incorrecta

**`.env.production`:**
```bash
VITE_API_BASE_URL=https://worker-cbc-endes-dev.cbconsulting.workers.dev
VITE_ENVIRONMENT=production
```
⚠️ **Observación:** La URL `VITE_API_BASE_URL` es incorrecta y falta la variable `VITE_USE_DYNAMIC_MENU`

**Inventario de Recursos (`.governance/inventario_recursos.md`):**
```markdown
| `VITE_API_BASE_URL` | String | No | URL base del backend API | ✅ | https://wk-backend-dev.cbconsulting.workers.dev |
```
✅ **Resultado:** La URL correcta del backend es `https://wk-backend-dev.cbconsulting.workers.dev`

### 5. Rutas No Registradas

**`App.tsx`:**
- ❌ NO tiene rutas registradas para las páginas de Proyectos (`ListarProyectos` y `DetalleProyecto`)
- ❌ Solo tiene rutas para las páginas de demostración de TailAdmin

**Archivos de páginas de Proyectos:**
- ✅ `apps/frontend/src/pages/proyectos/ListarProyectos.tsx` existe
- ✅ `apps/frontend/src/pages/proyectos/DetalleProyecto.tsx` existe

---

## Hipótesis de Trabajo

### Hipótesis 1: URL Incorrecta del Backend

**Descripción:**
El frontend está configurado con una URL incorrecta del backend, lo que impide que obtenga el menú dinámico.

**Evidencia:**
- `wrangler.toml` tiene `VITE_API_BASE_URL = "https://worker-cbc-endes-dev.workers.dev"` (incorrecta)
- `.env.production` tiene `VITE_API_BASE_URL=https://worker-cbc-endes-dev.cbconsulting.workers.dev` (incorrecta)
- La URL correcta es `https://wk-backend-dev.cbconsulting.workers.dev`

**Impacto:**
Si el frontend intenta obtener el menú de una URL incorrecta, recibirá un error y mostrará el menú estático como fallback.

**Validación:**
- Verificar qué URL está usando el frontend en producción
- Verificar si el frontend está recibiendo un error al intentar obtener el menú

---

### Hipótesis 2: Variable `VITE_USE_DYNAMIC_MENU` No Definida en Runtime

**Descripción:**
La variable `VITE_USE_DYNAMIC_MENU` no está definida en el runtime de producción, lo que hace que `import.meta.env.VITE_USE_DYNAMIC_MENU` sea `undefined` y el feature flag se evalúe como `false`.

**Evidencia:**
- `.env.production` no tiene la variable `VITE_USE_DYNAMIC_MENU`
- No está claro si las variables definidas en `wrangler.toml` tienen prioridad sobre las variables definidas en `.env.production` o viceversa

**Impacto:**
Si `import.meta.env.VITE_USE_DYNAMIC_MENU` es `undefined`, entonces `import.meta.env.VITE_USE_DYNAMIC_MENU === 'true'` es `false`, y el frontend usará el menú estático.

**Validación:**
- Verificar cómo Cloudflare Pages maneja las variables de entorno durante el build y el runtime
- Verificar qué valor tiene `import.meta.env.VITE_USE_DYNAMIC_MENU` en producción

---

### Hipótesis 3: Build de Frontend No Actualizado

**Descripción:**
El frontend desplegado en Cloudflare Pages no ha sido actualizado con los cambios más recientes, por lo que sigue usando una versión antigua del código.

**Evidencia:**
- El problema ha persistido a través de múltiples intentos de corrección
- No está claro si el frontend se ha re-desplegado correctamente después de los cambios

**Impacto:**
Si el frontend no se ha actualizado, cualquier cambio en el código no se reflejará en producción.

**Validación:**
- Verificar la fecha del último despliegue del frontend
- Verificar si el código desplegado incluye los cambios más recientes

---

### Hipótesis 4: Error en el Hook `useMenu`

**Descripción:**
El hook `useMenu` está recibiendo un error al intentar obtener el menú del backend, lo que hace que muestre un estado de error en lugar del menú dinámico.

**Evidencia:**
- `AppSidebarDynamic` muestra un estado de error si `useMenu` devuelve un error
- No se ha verificado si el frontend está recibiendo un error al intentar obtener el menú

**Impacto:**
Si el hook `useMenu` recibe un error, `AppSidebarDynamic` mostrará un mensaje de error en lugar del menú dinámico.

**Validación:**
- Verificar si el frontend está recibiendo un error al intentar obtener el menú
- Verificar los logs del navegador para ver si hay errores de red

---

### Hipótesis 5: Rutas No Registradas

**Descripción:**
Aunque el menú dinámico se esté mostrando correctamente, las rutas para las páginas de Proyectos no están registradas en `App.tsx`, por lo que al hacer clic en los items del menú, el usuario no puede navegar a las páginas correspondientes.

**Evidencia:**
- `App.tsx` no tiene rutas registradas para las páginas de Proyectos (`ListarProyectos` y `DetalleProyecto`)
- Los archivos de páginas de Proyectos existen

**Impacto:**
Si las rutas no están registradas, al hacer clic en los items del menú, el usuario verá una página 404 en lugar de las páginas de Proyectos.

**Validación:**
- Verificar si las rutas para las páginas de Proyectos están registradas en `App.tsx`
- Verificar si al hacer clic en los items del menú, el usuario puede navegar a las páginas correspondientes

---

## Validaciones Pendientes

### 1. Verificar URL del Backend en Producción

**Acción:**
- Acceder al frontend desplegado en producción
- Abrir la consola del navegador
- Ejecutar `console.log(import.meta.env.VITE_API_BASE_URL)`
- Verificar qué URL está usando el frontend

**Resultado Esperado:**
- Si la URL es incorrecta, confirmar la Hipótesis 1
- Si la URL es correcta, descartar la Hipótesis 1

---

### 2. Verificar Valor de `VITE_USE_DYNAMIC_MENU` en Producción

**Acción:**
- Acceder al frontend desplegado en producción
- Abrir la consola del navegador
- Ejecutar `console.log(import.meta.env.VITE_USE_DYNAMIC_MENU)`
- Verificar qué valor tiene la variable

**Resultado Esperado:**
- Si el valor es `undefined` o `false`, confirmar la Hipótesis 2
- Si el valor es `true`, descartar la Hipótesis 2

---

### 3. Verificar Fecha del Último Despliegue

**Acción:**
- Acceder al dashboard de Cloudflare Pages
- Verificar la fecha del último despliegue del frontend
- Comparar con la fecha de los cambios más recientes

**Resultado Esperado:**
- Si el último despliegue es anterior a los cambios más recientes, confirmar la Hipótesis 3
- Si el último despliegue es posterior o igual a los cambios más recientes, descartar la Hipótesis 3

---

### 4. Verificar Errores de Red en el Navegador

**Acción:**
- Acceder al frontend desplegado en producción
- Abrir la consola del navegador
- Verificar si hay errores de red al intentar obtener el menú del backend
- Verificar si hay errores en la pestaña "Network" del navegador

**Resultado Esperado:**
- Si hay errores de red, confirmar la Hipótesis 4
- Si no hay errores de red, descartar la Hipótesis 4

---

### 5. Verificar Rutas Registradas en `App.tsx`

**Acción:**
- Revisar el archivo `apps/frontend/src/App.tsx`
- Verificar si las rutas para las páginas de Proyectos están registradas

**Resultado Esperado:**
- Si las rutas no están registradas, confirmar la Hipótesis 5
- Si las rutas están registradas, descartar la Hipótesis 5

---

## Acciones de Diagnóstico

### 1. Investigación de Variables de Entorno en Cloudflare Pages

**Objetivo:**
Entender cómo Cloudflare Pages maneja las variables de entorno durante el build y el runtime.

**Acciones:**
- Revisar la documentación de Cloudflare Pages sobre variables de entorno
- Verificar si las variables definidas en `wrangler.toml` tienen prioridad sobre las variables definidas en `.env.production` o viceversa
- Verificar si las variables definidas en `wrangler.toml` se inyectan durante el build o durante el runtime

**Evidencia a Buscar:**
- Documentación de Cloudflare Pages sobre variables de entorno
- Comportamiento de Vite con variables de entorno en Cloudflare Pages
- Cómo se resuelven las variables de entorno cuando hay múltiples fuentes

**Resultado Esperado:**
- Entender cómo se resuelven las variables de entorno en Cloudflare Pages
- Identificar si hay un problema con la resolución de variables de entorno

---

### 2. Verificación de Variables de Entorno en el Build

**Objetivo:**
Verificar qué variables de entorno están disponibles durante el build del frontend.

**Acciones:**
- Agregar un script de build que imprima todas las variables de entorno disponibles
- Ejecutar el build localmente y verificar qué variables de entorno están disponibles
- Ejecutar el build en Cloudflare Pages y verificar qué variables de entorno están disponibles

**Evidencia a Buscar:**
- Lista de variables de entorno disponibles durante el build local
- Lista de variables de entorno disponibles durante el build en Cloudflare Pages
- Diferencias entre las variables de entorno disponibles localmente y en Cloudflare Pages

**Resultado Esperado:**
- Identificar si hay variables de entorno faltantes o incorrectas durante el build
- Identificar si hay un problema con la inyección de variables de entorno durante el build

---

### 3. Verificación de Variables de Entorno en el Runtime

**Objetivo:**
Verificar qué variables de entorno están disponibles en el runtime del frontend desplegado.

**Acciones:**
- Agregar código que imprima todas las variables de entorno disponibles en el runtime
- Desplegar el frontend en Cloudflare Pages
- Acceder al frontend desplegado y verificar qué variables de entorno están disponibles

**Evidencia a Buscar:**
- Lista de variables de entorno disponibles en el runtime del frontend desplegado
- Valores de las variables de entorno disponibles en el runtime del frontend desplegado

**Resultado Esperado:**
- Identificar si hay variables de entorno faltantes o incorrectas en el runtime
- Identificar si hay un problema con la inyección de variables de entorno en el runtime

---

### 4. Verificación del Endpoint `/api/menu` desde el Frontend

**Objetivo:**
Verificar si el frontend puede acceder al endpoint `/api/menu` del backend.

**Acciones:**
- Acceder al frontend desplegado en producción
- Abrir la consola del navegador
- Ejecutar `fetch(import.meta.env.VITE_API_BASE_URL + '/api/menu').then(r => r.json()).then(console.log)`
- Verificar si el frontend puede acceder al endpoint `/api/menu`

**Evidencia a Buscar:**
- Respuesta del endpoint `/api/menu` desde el frontend
- Errores de red al intentar acceder al endpoint `/api/menu` desde el frontend

**Resultado Esperado:**
- Si el frontend puede acceder al endpoint `/api/menu`, descartar problemas de conectividad
- Si el frontend no puede acceder al endpoint `/api/menu`, confirmar problemas de conectividad

---

### 5. Verificación del Componente `AppSidebarDynamic` en el Runtime

**Objetivo:**
Verificar si el componente `AppSidebarDynamic` se está renderizando en el runtime.

**Acciones:**
- Agregar código que imprima en la consola cuando se renderiza `AppSidebarDynamic`
- Desplegar el frontend en Cloudflare Pages
- Acceder al frontend desplegado y verificar si `AppSidebarDynamic` se está renderizando

**Evidencia a Buscar:**
- Mensajes en la consola que indiquen si `AppSidebarDynamic` se está renderizando
- Mensajes en la consola que indiquen si `AppSidebar` se está renderizando

**Resultado Esperado:**
- Si `AppSidebarDynamic` se está renderizando, el feature flag está funcionando correctamente
- Si `AppSidebar` se está renderizando, el feature flag no está funcionando correctamente

---

### 6. Verificación del Hook `useMenu` en el Runtime

**Objetivo:**
Verificar si el hook `useMenu` está funcionando correctamente en el runtime.

**Acciones:**
- Agregar código que imprima en la consola el estado del hook `useMenu` (loading, error, modules)
- Desplegar el frontend en Cloudflare Pages
- Acceder al frontend desplegado y verificar el estado del hook `useMenu`

**Evidencia a Buscar:**
- Estado del hook `useMenu` (loading, error, modules)
- Errores en el hook `useMenu`

**Resultado Esperado:**
- Si el hook `useMenu` está funcionando correctamente, descartar problemas con el hook
- Si el hook `useMenu` tiene errores, confirmar problemas con el hook

---

### 7. Verificación de Rutas en `App.tsx`

**Objetivo:**
Verificar si las rutas para las páginas de Proyectos están registradas en `App.tsx`.

**Acciones:**
- Revisar el archivo `apps/frontend/src/App.tsx`
- Verificar si las rutas para las páginas de Proyectos están registradas
- Si no están registradas, agregar las rutas faltantes

**Evidencia a Buscar:**
- Lista de rutas registradas en `App.tsx`
- Rutas faltantes para las páginas de Proyectos

**Resultado Esperado:**
- Si las rutas no están registradas, agregar las rutas faltantes
- Si las rutas están registradas, descartar problemas con las rutas

---

### 8. Verificación de Despliegue en Cloudflare Pages

**Objetivo:**
Verificar si el frontend se ha desplegado correctamente en Cloudflare Pages.

**Acciones:**
- Acceder al dashboard de Cloudflare Pages
- Verificar la fecha del último despliegue
- Verificar si hay errores en el despliegue
- Verificar si el código desplegado incluye los cambios más recientes

**Evidencia a Buscar:**
- Fecha del último despliegue
- Errores en el despliegue
- Código desplegado

**Resultado Esperado:**
- Si hay errores en el despliegue, corregir los errores
- Si el código desplegado no incluye los cambios más recientes, re-desplegar el frontend

---

### 9. Verificación de CORS

**Objetivo:**
Verificar si hay problemas de CORS que impidan que el frontend acceda al backend.

**Acciones:**
- Revisar la configuración de CORS en el backend
- Verificar si el origen del frontend está incluido en la lista de orígenes permitidos
- Verificar si hay errores de CORS en la consola del navegador

**Evidencia a Buscar:**
- Configuración de CORS en el backend
- Errores de CORS en la consola del navegador

**Resultado Esperado:**
- Si hay problemas de CORS, corregir la configuración de CORS
- Si no hay problemas de CORS, descartar problemas de CORS

---

### 10. Verificación de Build Local vs Build en Cloudflare Pages

**Objetivo:**
Verificar si hay diferencias entre el build local y el build en Cloudflare Pages.

**Acciones:**
- Ejecutar el build localmente
- Verificar el contenido del directorio `dist`
- Comparar con el contenido del directorio `dist` en Cloudflare Pages
- Verificar si hay diferencias en las variables de entorno inyectadas

**Evidencia a Buscar:**
- Contenido del directorio `dist` local
- Contenido del directorio `dist` en Cloudflare Pages
- Diferencias entre los builds

**Resultado Esperado:**
- Si hay diferencias entre los builds, identificar la causa de las diferencias
- Si no hay diferencias entre los builds, descartar problemas con el build

---

## Análisis Técnico Detallado

### 1. Flujo de Carga del Menú Dinámico

**Pasos:**
1. El componente `AppLayout` se renderiza
2. `AppLayout` evalúa el feature flag `USE_DYNAMIC_MENU = import.meta.env.VITE_USE_DYNAMIC_MENU === 'true'`
3. Si `USE_DYNAMIC_MENU` es `true`, renderiza `AppSidebarDynamic`
4. Si `USE_DYNAMIC_MENU` es `false`, renderiza `AppSidebar`
5. `AppSidebarDynamic` usa el hook `useMenu()` para obtener los módulos del menú dinámico
6. `useMenu()` hace una petición GET a `${BACKEND_URL}/api/menu`
7. Si la petición es exitosa, `useMenu()` devuelve los módulos del menú
8. `AppSidebarDynamic` renderiza los módulos usando el componente `SidebarModule`
9. `SidebarModule` renderiza las funciones usando el componente `SidebarItem`
10. `SidebarItem` usa `Link` de `react-router-dom` para navegar a la ruta especificada

**Puntos de Fallo Potenciales:**
- `import.meta.env.VITE_USE_DYNAMIC_MENU` es `undefined` o `false`
- `BACKEND_URL` es incorrecta
- La petición a `${BACKEND_URL}/api/menu` falla
- La respuesta de `${BACKEND_URL}/api/menu` no tiene el formato esperado
- Las rutas para las páginas de Proyectos no están registradas en `App.tsx`

---

### 2. Manejo de Variables de Entorno en Vite

**Comportamiento de Vite:**
- Las variables que empiezan con `VITE_` se exponen al código del cliente
- Las variables se leen de archivos `.env`, `.env.production`, etc.
- Las variables se resuelven durante el build y se incrustan en el bundle

**Comportamiento de Cloudflare Pages:**
- Las variables definidas en `wrangler.toml` se inyectan durante el despliegue
- Las variables definidas en el dashboard de Cloudflare Pages se inyectan durante el runtime
- No está claro si las variables definidas en `.env.production` se usan en Cloudflare Pages

**Puntos de Incertidumbre:**
- ¿Las variables definidas en `wrangler.toml` tienen prioridad sobre las variables definidas en `.env.production` o viceversa?
- ¿Las variables definidas en `.env.production` se usan en Cloudflare Pages?
- ¿Las variables definidas en `wrangler.toml` se inyectan durante el build o durante el runtime?

---

### 3. Configuración de CORS en el Backend

**Configuración Actual:**
```typescript
app.use('/api/*', cors({
  origin: ['http://localhost:5173', 'https://pg-cbc-endes.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

**Puntos de Fallo Potenciales:**
- El origen del frontend desplegado no está incluido en la lista de orígenes permitidos
- Hay errores de CORS en la consola del navegador

---

### 4. Registro de Rutas en `App.tsx`

**Rutas Actuales:**
- `/` → `Home`
- `/profile` → `UserProfiles`
- `/calendar` → `Calendar`
- `/blank` → `Blank`
- `/form-elements` → `FormElements`
- `/basic-tables` → `BasicTables`
- `/alerts` → `Alerts`
- `/avatars` → `Avatars`
- `/badge` → `Badges`
- `/buttons` → `Buttons`
- `/images` → `Images`
- `/videos` → `Videos`
- `/line-chart` → `LineChart`
- `/bar-chart` → `BarChart`
- `/signin` → `SignIn`
- `/signup` → `SignUp`
- `*` → `NotFound`

**Rutas Faltantes:**
- `/proyectos` → `ListarProyectos`
- `/proyectos/crear` → (no existe una página específica para crear proyectos)
- `/proyectos/:id` → `DetalleProyecto`

**Puntos de Fallo Potenciales:**
- Al hacer clic en los items del menú, el usuario no puede navegar a las páginas de Proyectos
- El usuario verá una página 404 en lugar de las páginas de Proyectos

---

## Conclusiones

### Problemas Identificados

1. **URL Incorrecta del Backend:**
   - `wrangler.toml` tiene `VITE_API_BASE_URL = "https://worker-cbc-endes-dev.workers.dev"` (incorrecta)
   - `.env.production` tiene `VITE_API_BASE_URL=https://worker-cbc-endes-dev.cbconsulting.workers.dev` (incorrecta)
   - La URL correcta es `https://wk-backend-dev.cbconsulting.workers.dev`

2. **Falta la Variable `VITE_USE_DYNAMIC_MENU` en `.env.production`:**
   - `.env.production` no tiene la variable `VITE_USE_DYNAMIC_MENU`
   - No está claro si las variables definidas en `wrangler.toml` tienen prioridad sobre las variables definidas en `.env.production` o viceversa

3. **Rutas No Registradas en `App.tsx`:**
   - `App.tsx` no tiene rutas registradas para las páginas de Proyectos (`ListarProyectos` y `DetalleProyecto`)

4. **Incertidumbre sobre la Resolución de Variables de Entorno:**
   - No está claro si las variables definidas en `wrangler.toml` tienen prioridad sobre las variables definidas en `.env.production` o viceversa
   - No está claro si las variables definidas en `.env.production` se usan en Cloudflare Pages

### Acciones Recomendadas

1. **Corregir la URL del Backend:**
   - Actualizar `wrangler.toml` con la URL correcta: `VITE_API_BASE_URL = "https://wk-backend-dev.cbconsulting.workers.dev"`
   - Actualizar `.env.production` con la URL correcta: `VITE_API_BASE_URL=https://wk-backend-dev.cbconsulting.workers.dev`

2. **Agregar la Variable `VITE_USE_DYNAMIC_MENU` en `.env.production`:**
   - Agregar `VITE_USE_DYNAMIC_MENU=true` en `.env.production`

3. **Registrar las Rutas Faltantes en `App.tsx`:**
   - Agregar las rutas para las páginas de Proyectos (`ListarProyectos` y `DetalleProyecto`)

4. **Investigar la Resolución de Variables de Entorno en Cloudflare Pages:**
   - Revisar la documentación de Cloudflare Pages sobre variables de entorno
   - Verificar cómo se resuelven las variables de entorno cuando hay múltiples fuentes

5. **Re-desplegar el Frontend:**
   - Ejecutar el build del frontend
   - Desplegar el frontend en Cloudflare Pages
   - Verificar que el frontend desplegado incluye los cambios más recientes

6. **Verificar el Funcionamiento del Frontend Desplegado:**
   - Acceder al frontend desplegado en producción
   - Verificar que el menú dinámico se está mostrando
   - Verificar que la sección "Proyectos" es visible
   - Verificar que al hacer clic en los items del menú, el usuario puede navegar a las páginas correspondientes

### Datos No Verificables

- No se puede verificar qué URL está usando el frontend en producción sin acceder al frontend desplegado
- No se puede verificar qué valor tiene `import.meta.env.VITE_USE_DYNAMIC_MENU` en producción sin acceder al frontend desplegado
- No se puede verificar si el frontend está recibiendo un error al intentar obtener el menú sin acceder al frontend desplegado
- No se puede verificar si el frontend se ha desplegado correctamente sin acceder al dashboard de Cloudflare Pages
- No se puede verificar si hay errores de CORS en la consola del navegador sin acceder al frontend desplegado

---

## Referencias

- Documento de diagnóstico original: `plans/proyecto-PIA/comunicacion/errores fase 04/001_menu_proyectos_no_visible.md`
- Evidencia visual: `plans/proyecto-PIA/comunicacion/errores fase 04/image_fe_ahora.png`
- Inventario de recursos: `.governance/inventario_recursos.md`
- Reglas del proyecto: `.governance/reglas_proyecto.md`
