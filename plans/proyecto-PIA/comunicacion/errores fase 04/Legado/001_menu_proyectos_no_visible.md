# Menú Proyectos No Visible en Frontend

> **Fecha:** 2026-03-28  
> **Fase:** FASE 4 - Integración y Pruebas  
> **Severidad:** Crítica  
> **Estado:** Investigado

---

## Índice de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Descripción del Problema](#descripción-del-problema)
3. [Causa Raíz Identificada](#causa-raíz-identificada)
4. [Análisis Técnico Detallado](#análisis-técnico-detallado)
5. [Implicaciones para el Usuario](#implicaciones-para-el-usuario)
6. [Condiciones para Visualizar la Sección Proyectos](#condiciones-para-visualizar-la-sección-proyectos)
7. [Solución Propuesta](#solución-propuesta)
8. [Archivos Involucrados](#archivos-involucrados)

---

## Resumen Ejecutivo

El frontend actual **no muestra la sección "Proyectos"** en el menú lateral porque está configurado explícitamente para usar el **menú estático de demostración de TailAdmin** en lugar del **menú dinámico** que consume los datos de la tabla `MOD_modulos_config` de la base de datos.

La configuración `VITE_USE_DYNAMIC_MENU=false` en el archivo `wrangler.toml` del frontend fuerza la aplicación a mostrar la plantilla de administración TailAdmin en lugar de los módulos definidos en la base de datos.

---

## Descripción del Problema

### Síntoma Observado

El usuario accede al frontend desplegado en Cloudflare Pages y visualiza:

- ✅ Menú lateral con opciones de demostración de TailAdmin (Dashboard, Calendar, Forms, Tables, UI Elements, Charts, etc.)
- ✅ Componentes de ejemplo de la plantilla TailAdmin (gráficos, tablas básicas, elementos de formulario)
- ❌ **NO aparece** la sección "Proyectos" con las opciones:
  - Lista de proyectos
  - Nuevo proyecto
  - Editar proyecto
  - Lanzar análisis

### Expectativa vs Realidad

| Expectativa | Realidad |
|-------------|----------|
| Menú dinámico cargado desde `MOD_modulos_config` | Menú estático de TailAdmin |
| Sección "Proyectos" visible | Sección "Proyectos" oculta |
| Usuario puede trabajar con PAI | Usuario solo ve demo de TailAdmin |

---

## Causa Raíz Identificada

### Configuración del Feature Flag

El archivo [`wrangler.toml`](/workspaces/cbc-endes/apps/frontend/wrangler.toml) del frontend contiene la siguiente configuración:

```toml
[vars]
VITE_API_BASE_URL = "http://localhost:8787"
VITE_ENVIRONMENT = "dev"
VITE_USE_DYNAMIC_MENU = "false"  # ← PROBLEMA PRINCIPAL

[env.production]
name = "pg-cbc-endes"
vars = { 
  VITE_API_BASE_URL = "https://wk-backend-dev.cbconsulting.workers.dev", 
  VITE_ENVIRONMENT = "production", 
  VITE_USE_DYNAMIC_MENU = "false"  # ← TAMBIÉN EN PRODUCCIÓN
}
```

### Mecanismo de Conmutación

El componente [`AppLayout.tsx`](/workspaces/cbc-endes/apps/frontend/src/layout/AppLayout.tsx) implementa un feature flag que decide qué sidebar mostrar:

```typescript
// Feature flag for dynamic menu
const USE_DYNAMIC_MENU = import.meta.env.VITE_USE_DYNAMIC_MENU === 'true';

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        {USE_DYNAMIC_MENU ? <AppSidebarDynamic isExpanded={isExpanded} /> : <AppSidebar />}
        <Backdrop />
      </div>
      {/* ... resto del layout */}
    </div>
  );
};
```

**Flujo de decisión:**

```
VITE_USE_DYNAMIC_MENU = "false"
         ↓
   AppLayout.tsx evalúa la condición
         ↓
   Condición falsa → Renderiza <AppSidebar />
         ↓
   AppSidebar = Sidebar estático de TailAdmin (demo)
         ↓
   Usuario ve menú de demostración, NO ve "Proyectos"
```

---

## Análisis Técnico Detallado

### Componentes Involucrados

#### 1. `AppSidebar.tsx` (Menú Estático - TailAdmin)

- **Ubicación:** `/apps/frontend/src/layout/AppSidebar.tsx`
- **Propósito:** Sidebar de demostración de la plantilla TailAdmin
- **Contenido:** Opciones genéricas (Dashboard, Calendar, Forms, Tables, etc.)
- **Estado:** Activo cuando `VITE_USE_DYNAMIC_MENU = "false"`

#### 2. `AppSidebarDynamic.tsx` (Menú Dinámico - Aplicación Real)

- **Ubicación:** `/apps/frontend/src/components/AppSidebarDynamic.tsx`
- **Propósito:** Renderizar menú desde API `/api/menu`
- **Fuente de datos:** Tabla `MOD_modulos_config` en D1 Database
- **Estado:** Inactivo cuando `VITE_USE_DYNAMIC_MENU = "false"`

```typescript
export const AppSidebarDynamic: React.FC<{ isExpanded: boolean }> = ({
  isExpanded,
}) => {
  const { modules, loading, error } = useMenu();

  // Renderiza SidebarModule para cada módulo obtenido de la API
  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
      <nav className="space-y-1">
        {modules.map((mod) => (
          <SidebarModule
            key={mod.id}
            module={mod}
            label={MENU_TEXTS[mod.nombre_mostrar] || mod.nombre_mostrar}
            isExpanded={isExpanded}
          />
        ))}
      </nav>
    </aside>
  );
};
```

#### 3. `useMenu.ts` (Hook para Obtener Menú Dinámico)

- **Ubicación:** `/apps/frontend/src/hooks/useMenu.ts`
- **Endpoint:** `GET /api/menu`
- **Respuesta esperada:** Array de módulos con funciones anidadas

```typescript
export function useMenu(): UseMenuResult {
  const [modules, setModules] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu()
      .then(({ data }) => setModules(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { modules, loading, error };
}
```

### Módulo "Proyectos" en Base de Datos

La migración [`006-pai-modulo-menu-proyectos.sql`](/workspaces/cbc-endes/migrations/006-pai-modulo-menu-proyectos.sql) define el módulo "Proyectos" con sus funciones:

```sql
-- Módulo Principal
INSERT INTO MOD_modulos_config VALUES (
  10, NULL, 'MODULO', 'PROYECTOS', 'Proyectos', 
  'Sección principal para gestionar proyectos de análisis inmobiliarios (PAI)',
  '/proyectos', 'folder', 10, 1, datetime('now'), datetime('now')
);

-- Funciones del Módulo
INSERT INTO MOD_modulos_config VALUES 
  (11, 10, 'FUNCION', 'listar_proyectos', 'Listar Proyectos', ..., '/proyectos', 'list', 1, 1, ...),
  (12, 10, 'FUNCION', 'crear_proyecto', 'Crear Proyecto', ..., '/proyectos/crear', 'plus-circle', 2, 1, ...),
  (13, 10, 'FUNCION', 'detalle_proyecto', 'Ver Detalle', ..., '/proyectos/:id', 'eye', 3, 1, ...),
  (14, 10, 'FUNCION', 'ejecutar_analisis', 'Ejecutar Análisis', ..., '/proyectos/:id/analisis', 'play', 4, 1, ...),
  ...
```

### Páginas de Proyectos Existentes pero Inaccesibles

Las siguientes páginas están implementadas pero **no son accesibles desde el menú**:

| Página | Ruta | Archivo | Estado |
|--------|------|---------|--------|
| Listar Proyectos | `/proyectos` | `ListarProyectos.tsx` | ✅ Implementada |
| Detalle Proyecto | `/proyectos/:id` | `DetalleProyecto.tsx` | ✅ Implementada |
| Crear Proyecto | `/proyectos/crear` | No implementada | ❌ Pendiente |
| Ejecutar Análisis | `/proyectos/:id/analisis` | No implementada | ❌ Pendiente |

**Problema adicional:** Las rutas de proyectos **no están registradas** en [`App.tsx`](/workspaces/cbc-endes/apps/frontend/src/App.tsx):

```typescript
<Routes>
  <Route element={<AppLayout />}>
    <Route index path="/" element={<Home />} />
    <Route path="/profile" element={<UserProfiles />} />
    <Route path="/calendar" element={<Calendar />} />
    {/* ❌ NO HAY RUTAS PARA /proyectos */}
  </Route>
  {/* ... */}
</Routes>
```

---

## Implicaciones para el Usuario

### Impacto Funcional

| Capacidad | Estado | Consecuencia |
|-----------|--------|--------------|
| Ver lista de proyectos | ❌ Bloqueada | No puede acceder a proyectos existentes |
| Crear nuevo proyecto | ❌ Bloqueada | No puede iniciar nuevos análisis |
| Ejecutar análisis PAI | ❌ Bloqueada | No puede generar artefactos de análisis |
| Ver detalles de proyecto | ❌ Bloqueada | No puede consultar resultados |
| Gestionar notas | ❌ Bloqueada | No puede añadir valoraciones o decisiones |

### Experiencia de Usuario

1. **Confusión:** El usuario ve una interfaz de administración genérica que no corresponde a la aplicación contratada/desarrollada.
2. **Inoperatividad:** No puede realizar ninguna tarea relacionada con Proyectos de Análisis Inmobiliario (PAI).
3. **Falsa percepción de incompletitud:** La aplicación está funcional pero inaccesible.

### Riesgo Operativo

- **Datos existentes inaccesibles:** Los proyectos creados vía API están en la base de datos pero no son visibles.
- **Trabajo bloqueado:** El usuario no puede avanzar en sus tareas principales.
- **Dependencia de intervención técnica:** Se requiere modificación de configuración para habilitar funcionalidad.

---

## Condiciones para Visualizar la Sección Proyectos

### Requisitos Mínimos

Para que la sección "Proyectos" sea visible y funcional, se deben cumplir **simultáneamente** las siguientes condiciones:

#### 1. Configuración del Feature Flag

```toml
# wrangler.toml
[vars]
VITE_USE_DYNAMIC_MENU = "true"  # ← Debe ser "true"

[env.production]
vars = { 
  VITE_API_BASE_URL = "https://wk-backend-dev.cbconsulting.workers.dev", 
  VITE_ENVIRONMENT = "production", 
  VITE_USE_DYNAMIC_MENU = "true"  # ← También en producción
}
```

#### 2. Backend Disponible

El endpoint `/api/menu` debe estar accesible:

```bash
# Verificación
curl https://wk-backend-dev.cbconsulting.workers.dev/api/menu
```

Respuesta esperada:

```json
{
  "modulos": [
    {
      "id": 1,
      "nombre_interno": "PANEL",
      "nombre_mostrar": "Panel",
      "funciones": [...]
    },
    {
      "id": 10,
      "nombre_interno": "PROYECTOS",
      "nombre_mostrar": "Proyectos",
      "funciones": [
        {"nombre_interno": "listar_proyectos", "url_path": "/proyectos"},
        {"nombre_interno": "crear_proyecto", "url_path": "/proyectos/crear"},
        ...
      ]
    }
  ]
}
```

#### 3. Rutas Registradas en App.tsx

Las rutas de proyectos deben estar definidas en el enrutador:

```typescript
<Route element={<AppLayout />}>
  <Route index path="/" element={<Home />} />
  
  {/* Rutas de Proyectos - PENDIENTE DE AGREGAR */}
  <Route path="/proyectos" element={<ListarProyectos />} />
  <Route path="/proyectos/:id" element={<DetalleProyecto />} />
  <Route path="/proyectos/crear" element={<CrearProyecto />} />
  <Route path="/proyectos/:id/analisis" element={<EjecutarAnalisis />} />
  
  {/* ... otras rutas */}
</Route>
```

#### 4. Datos en MOD_modulos_config

La tabla debe contener el módulo "Proyectos":

```sql
SELECT * FROM MOD_modulos_config WHERE nombre_interno = 'PROYECTOS';
-- Debe retornar 1 módulo + 8 funciones
```

---

## Solución Propuesta

### Pasos de Corrección

#### Paso 1: Actualizar Feature Flag

**Archivo:** `apps/frontend/wrangler.toml`

```toml
[vars]
VITE_API_BASE_URL = "http://localhost:8787"
VITE_ENVIRONMENT = "dev"
VITE_USE_DYNAMIC_MENU = "true"  # ← Cambiar de "false" a "true"

[env.preview]
name = "pg-cbc-endes-preview"
vars = { 
  VITE_API_BASE_URL = "http://localhost:8787", 
  VITE_ENVIRONMENT = "preview", 
  VITE_USE_DYNAMIC_MENU = "true"  # ← Cambiar también en preview
}

[env.production]
name = "pg-cbc-endes"
vars = { 
  VITE_API_BASE_URL = "https://wk-backend-dev.cbconsulting.workers.dev", 
  VITE_ENVIRONMENT = "production", 
  VITE_USE_DYNAMIC_MENU = "true"  # ← Cambiar también en production
}
```

#### Paso 2: Registrar Rutas en App.tsx

**Archivo:** `apps/frontend/src/App.tsx`

Agregar las rutas de proyectos:

```typescript
import { ListarProyectos } from './pages/proyectos/ListarProyectos';
import { DetalleProyecto } from './pages/proyectos/DetalleProyecto';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index path="/" element={<Home />} />
          
          {/* Rutas de Proyectos PAI */}
          <Route path="/proyectos" element={<ListarProyectos />} />
          <Route path="/proyectos/:id" element={<DetalleProyecto />} />
          
          {/* ... otras rutas existentes */}
        </Route>
        {/* ... */}
      </Routes>
    </Router>
  );
}
```

#### Paso 3: Re-desplegar Frontend

```bash
cd apps/frontend
npm run build
wrangler pages deploy dist --project-name=pg-cbc-endes
```

#### Paso 4: Verificar Funcionamiento

1. Acceder a https://388b71e5.pg-cbc-endes.pages.dev
2. Verificar que el menú lateral muestra "Proyectos"
3. Expandir "Proyectos" y verificar las opciones:
   - Listar Proyectos
   - Crear Proyecto
   - Ver Detalle
   - Ejecutar Análisis
   - Ver Artefactos
   - Cambiar Estado
   - Eliminar Proyecto
   - Ver Historial
4. Navegar a `/proyectos` y verificar la lista de proyectos

---

## Archivos Involucrados

### Configuración

| Archivo | Ruta | Cambio Requerido |
|---------|------|------------------|
| `wrangler.toml` | `/apps/frontend/wrangler.toml` | `VITE_USE_DYNAMIC_MENU = "true"` |

### Código Fuente

| Archivo | Ruta | Cambio Requerido |
|---------|------|------------------|
| `App.tsx` | `/apps/frontend/src/App.tsx` | Agregar rutas de proyectos |
| `AppLayout.tsx` | `/apps/frontend/src/layout/AppLayout.tsx` | Ya implementado (no requiere cambios) |
| `AppSidebarDynamic.tsx` | `/apps/frontend/src/components/AppSidebarDynamic.tsx` | Ya implementado (no requiere cambios) |
| `useMenu.ts` | `/apps/frontend/src/hooks/useMenu.ts` | Ya implementado (no requiere cambios) |

### Páginas Existentes

| Archivo | Ruta | Estado |
|---------|------|--------|
| `ListarProyectos.tsx` | `/apps/frontend/src/pages/proyectos/` | ✅ Implementada |
| `DetalleProyecto.tsx` | `/apps/frontend/src/pages/proyectos/` | ✅ Implementada |

### Base de Datos

| Recurso | Binding | Estado |
|---------|---------|--------|
| `MOD_modulos_config` | `db_binding_01` (D1) | ✅ Módulo "Proyectos" insertado |
| Migración 006 | `006-pai-modulo-menu-proyectos.sql` | ✅ Aplicada |

---

## Conclusión

El problema **no es una falta de implementación** de la funcionalidad "Proyectos". Todos los componentes están desarrollados:

- ✅ Backend: Endpoint `/api/menu` y handlers PAI implementados
- ✅ Frontend: Componentes `AppSidebarDynamic`, `ListarProyectos`, `DetalleProyecto` implementados
- ✅ Base de datos: Módulo "Proyectos" definido en `MOD_modulos_config`

El problema es una **configuración de feature flag deshabilitada** que impide que el usuario acceda a la aplicación real, mostrándole en su lugar una plantilla de demostración.

**Acción inmediata requerida:** Cambiar `VITE_USE_DYNAMIC_MENU` de `"false"` a `"true"` en todos los entornos y registrar las rutas de proyectos en `App.tsx`.

---

> **Documento generado:** 2026-03-28  
> **Autor:** Agente de Análisis  
> **Revisión:** Pendiente aprobación del usuario  
> **Próximo paso:** Ejecutar solución propuesta y verificar funcionamiento
