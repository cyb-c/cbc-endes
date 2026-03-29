# Guía de Implementación - Menú Dinámico v1

**Versión**: 1.0  
**Fecha**: 2026-03-27

---

## Índice

1. [Prerrequisitos](#1-prerrequisitos)
2. [Paso 1: Diseñar esquema SQL](#2-paso-1-diseñar-esquema-sql)
3. [Paso 2: Implementar backend](#3-paso-2-implementar-backend)
4. [Paso 3: Implementar frontend](#4-paso-3-implementar-frontend)
5. [Paso 4: Implementar sistema de textos](#5-paso-4-implementar-sistema-de-textos)
6. [Paso 5: Testing y validación](#6-paso-5-testing-y-validación)
7. [Buenas prácticas](#7-buenas-prácticas)
8. [Antipatrones](#8-antipatrones)

---

## 1. Prerrequisitos

### 1.1. Backend (Cloudflare Workers + D1)

- Cuenta de Cloudflare con acceso a Workers y D1
- Wrangler CLI instalado (`npm install -g wrangler`)
- Proyecto de Cloudflare Worker configurado
- Base de datos D1 creada

### 1.2. Frontend

- Proyecto frontend configurado (React, Vue, Angular, etc.)
- Sistema de enrutamiento configurado
- Sistema de iconos disponible (ej: lucide-react, heroicons, etc.)

### 1.3. Conocimientos

- SQL básico
- TypeScript/JavaScript
- React Hooks (o equivalente en el framework elegido)
- Manejo de APIs REST

---

## 2. Paso 1: Diseñar esquema SQL

### 2.1. Crear tabla de configuración

Ejecuta el siguiente SQL en tu base de datos D1:

```sql
CREATE TABLE MOD_modulos_config (
  id INTEGER PRIMARY KEY,
  
  -- Jerarquía autorreferencial
  modulo_id INTEGER REFERENCES MOD_modulos_config(id) ON DELETE CASCADE,
  
  -- Tipo de elemento
  tipo_elemento TEXT NOT NULL CHECK(tipo_elemento IN ('MODULO','FUNCION')),
  
  -- Identificadores
  nombre_interno TEXT NOT NULL UNIQUE,
  nombre_mostrar TEXT NOT NULL,
  
  -- Metadatos
  descripcion TEXT,
  url_path TEXT,
  icono TEXT,
  
  -- Control de visibilidad
  orden INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  
  -- Auditoría
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices para optimizar consultas
CREATE INDEX idx_menu_modulo ON MOD_modulos_config(modulo_id);
CREATE INDEX idx_menu_tipo ON MOD_modulos_config(tipo_elemento);
CREATE INDEX idx_menu_orden ON MOD_modulos_config(orden);
CREATE INDEX idx_menu_activo ON MOD_modulos_config(activo);
```

### 2.2. Insertar datos de ejemplo

```sql
-- Módulos raíz
INSERT INTO MOD_modulos_config (id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar, descripcion, url_path, icono, orden, activo) VALUES
(1, NULL, 'MODULO', 'MOD_PANEL', 'menu.modulos.panel', 'Panel principal', NULL, 'layout-dashboard', 1, 1),
(2, NULL, 'MODULO', 'MOD_FACTURACION', 'menu.modulos.facturacion', 'Facturación', NULL, 'receipt', 10, 1),
(3, NULL, 'MODULO', 'MOD_PROYECTOS', 'menu.modulos.proyectos', 'Proyectos', NULL, 'folder', 20, 1);

-- Funciones del módulo Panel
INSERT INTO MOD_modulos_config (id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar, descripcion, url_path, icono, orden, activo) VALUES
(10, 1, 'FUNCION', 'DASHBOARD', 'menu.funciones.dashboard', 'Visión general', '/dashboard', 'home', 1, 1);

-- Funciones del módulo Facturación
INSERT INTO MOD_modulos_config (id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar, descripcion, url_path, icono, orden, activo) VALUES
(20, 2, 'FUNCION', 'FACTURAS_VENTAS', 'menu.funciones.facturas_emitidas', 'Facturas emitidas', '/facturas/emitidas', 'arrow-up-right', 1, 1),
(21, 2, 'FUNCION', 'FACTURAS_COMPRAS', 'menu.funciones.facturas_recibidas', 'Facturas recibidas', '/facturas/recibidas', 'arrow-down-left', 2, 1),
(22, 2, 'FUNCION', 'FACTURAS_NUEVA', 'menu.funciones.nueva_factura', 'Nueva factura', '/facturas/nueva', 'plus', 3, 1);

-- Funciones del módulo Proyectos
INSERT INTO MOD_modulos_config (id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar, descripcion, url_path, icono, orden, activo) VALUES
(30, 3, 'FUNCION', 'PROYECTOS_TODOS', 'menu.funciones.proyectos_todos', 'Todos los proyectos', '/proyectos', 'list', 1, 1),
(31, 3, 'FUNCION', 'PROYECTOS_NUEVO', 'menu.funciones.proyectos_nuevo', 'Nuevo proyecto', '/proyectos/nuevo', 'plus', 2, 1);
```

### 2.3. Validar esquema

Ejecuta esta consulta para verificar la estructura:

```sql
SELECT * FROM MOD_modulos_config ORDER BY modulo_id NULLS FIRST, orden;
```

Deberías ver:
- Módulos raíz (modulo_id = NULL)
- Funciones agrupadas bajo su módulo padre

---

## 3. Paso 2: Implementar backend

### 3.1. Crear handler del endpoint

Crea un archivo `src/handlers/menu.ts` en tu Worker:

```typescript
/**
 * Handler: GET /api/menu
 *
 * Devuelve los ítems del menú visibles, agrupados en módulos.
 */

import { getDB } from '../env'

type Env = Cloudflare.Env

interface MenuRow {
  id: number
  modulo_id: number | null
  tipo_elemento: 'MODULO' | 'FUNCION'
  nombre_interno: string
  nombre_mostrar: string
  descripcion: string | null
  url_path: string | null
  icono: string | null
  orden: number
  activo: number
}

interface MenuModule {
  id: number
  nombre_interno: string
  nombre_mostrar: string
  descripcion: string | null
  icono: string | null
  orden: number
  funciones: MenuFuncion[]
}

interface MenuFuncion {
  id: number
  nombre_interno: string
  nombre_mostrar: string
  descripcion: string | null
  url_path: string
  icono: string | null
  orden: number
}

export async function handleGetMenu(
  _request: Request,
  env: Env,
): Promise<Response> {
  const db = getDB(env)

  const { results } = await db
    .prepare(
      `SELECT id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar,
              descripcion, url_path, icono, orden, activo
         FROM MOD_modulos_config
         WHERE activo = 1
         ORDER BY modulo_id NULLS FIRST, orden`,
    )
    .all<MenuRow>()

  // Agrupar funciones bajo su módulo padre
  const modulosMap = new Map<number, MenuModule>()
  const funciones: MenuRow[] = []

  for (const row of results) {
    if (row.tipo_elemento === 'MODULO') {
      modulosMap.set(row.id, {
        id: row.id,
        nombre_interno: row.nombre_interno,
        nombre_mostrar: row.nombre_mostrar,
        descripcion: row.descripcion,
        icono: row.icono,
        orden: row.orden,
        funciones: [],
      })
    } else {
      funciones.push(row)
    }
  }

  for (const fn of funciones) {
    const parent = modulosMap.get(fn.modulo_id!)
    if (parent) {
      parent.funciones.push({
        id: fn.id,
        nombre_interno: fn.nombre_interno,
        nombre_mostrar: fn.nombre_mostrar,
        descripcion: fn.descripcion,
        url_path: fn.url_path ?? '',
        icono: fn.icono,
        orden: fn.orden,
      })
    }
  }

  const data = Array.from(modulosMap.values()).sort((a, b) => a.orden - b.orden)

  return Response.json({ data })
}
```

### 3.2. Registrar el endpoint en el router

En tu archivo principal del Worker (ej: `src/index.ts`):

```typescript
import { handleGetMenu } from './handlers/menu'

// ... otras importaciones

// Registrar el endpoint
router.get('/api/menu', handleGetMenu)
```

### 3.3. Configurar binding de D1

En `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tu-worker",
  "main": "src/index.ts",
  "compatibility_date": "2025-10-08",
  
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "tu-base-datos",
      "database_id": "tu-database-id"
    }
  ]
}
```

### 3.4. Probar el endpoint

```bash
# Desplegar el worker
wrangler deploy

# Probar el endpoint
curl https://tu-worker.workers.dev/api/menu
```

Deberías recibir una respuesta JSON con la estructura del menú.

---

## 4. Paso 3: Implementar frontend

### 4.1. Crear hook de obtención de menú

Crea `src/hooks/useMenu.ts`:

```typescript
/**
 * useMenu — obtiene el menú desde GET /api/menu
 *
 * Devuelve los módulos con sus funciones anidadas.
 */

import { useEffect, useState } from 'react'

interface MenuFuncion {
  id: number
  nombre_interno: string
  nombre_mostrar: string
  url_path: string
  icono: string
  orden: number
}

interface MenuItem {
  id: number
  nombre_interno: string
  nombre_mostrar: string
  icono: string
  orden: number
  funciones: MenuFuncion[]
}

interface UseMenuResult {
  modules: MenuItem[]
  loading: boolean
  error: string | null
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

async function fetchMenu(): Promise<{ data: MenuItem[] }> {
  const response = await fetch(`${BACKEND_URL}/api/menu`)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
}

export function useMenu(): UseMenuResult {
  const [modules, setModules] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchMenu()
      .then(({ data }) => {
        if (!cancelled) setModules(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar el menú')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { modules, loading, error }
}
```

### 4.2. Crear componente SidebarItem

Crea `src/components/SidebarItem.tsx`:

```typescript
import { Link, useLocation } from 'react-router-dom'

interface SidebarItemProps {
  funcion: {
    id: number
    nombre_interno: string
    nombre_mostrar: string
    url_path: string
    icono: string
  }
  label: string
  isExpanded: boolean
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  funcion,
  label,
  isExpanded,
}) => {
  const location = useLocation()
  const isActive = location.pathname === funcion.url_path

  return (
    <Link
      to={funcion.url_path}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      {/* Icono - ajusta según tu sistema de iconos */}
      <span className="text-lg">{funcion.icono}</span>
      {isExpanded && <span>{label}</span>}
    </Link>
  )
}
```

### 4.3. Crear componente SidebarModule

Crea `src/components/SidebarModule.tsx`:

```typescript
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SidebarItem } from './SidebarItem'

interface SidebarModuleProps {
  module: {
    id: number
    nombre_interno: string
    nombre_mostrar: string
    icono: string
    orden: number
    funciones: Array<{
      id: number
      nombre_interno: string
      nombre_mostrar: string
      url_path: string
      icono: string
    }>
  }
  label: string
  isExpanded: boolean
}

export const SidebarModule: React.FC<SidebarModuleProps> = ({
  module,
  label,
  isExpanded,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-2">
      {/* Botón del módulo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Icono - ajusta según tu sistema de iconos */}
          <span className="text-lg">{module.icono}</span>
          {isExpanded && <span>{label}</span>}
        </div>
        {isExpanded && (
          <ChevronDown
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            size={16}
          />
        )}
      </button>

      {/* Funciones del módulo */}
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {module.funciones.map((funcion) => (
            <SidebarItem
              key={funcion.id}
              funcion={funcion}
              label={label} // Deberías pasar el texto correcto
              isExpanded={isExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### 4.4. Crear componente AppSidebar

Crea `src/components/AppSidebar.tsx`:

```typescript
import { useMenu } from '../hooks/useMenu'
import { SidebarModule } from './SidebarModule'
import { MENU_TEXTS } from '../i18n/es-ES'

export const AppSidebar: React.FC<{ isExpanded: boolean }> = ({
  isExpanded,
}) => {
  const { modules, loading, error } = useMenu()

  if (loading) {
    return (
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </aside>
    )
  }

  if (error) {
    return (
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
        <div className="text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      </aside>
    )
  }

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
  )
}
```

### 4.5. Integrar en tu aplicación

En tu componente principal de layout:

```typescript
import { AppSidebar } from './components/AppSidebar'

export const AppLayout: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="flex min-h-screen">
      <AppSidebar isExpanded={isExpanded} />
      <main className="flex-1">
        {/* Contenido principal */}
      </main>
    </div>
  )
}
```

---

## 5. Paso 4: Implementar sistema de textos

### 5.1. Crear archivo de textos

Crea `src/i18n/es-ES.js`:

```javascript
/**
 * Sistema de textos simple - Español
 */

export const MENU_TEXTS = {
  // Módulos
  'menu.modulos.panel': 'Panel',
  'menu.modulos.facturacion': 'Facturación',
  'menu.modulos.proyectos': 'Proyectos',
  'menu.modulos.directorio': 'Directorio',
  'menu.modulos.archivos': 'Archivos',
  'menu.modulos.administracion': 'Administración',
  'menu.modulos.perfil': 'Perfil',
  'menu.modulos.sesion': 'Sesión',

  // Funciones del módulo Panel
  'menu.funciones.dashboard': 'Dashboard',
  'menu.funciones.welcome': 'Bienvenida',

  // Funciones del módulo Facturación
  'menu.funciones.facturas_emitidas': 'Facturas emitidas',
  'menu.funciones.facturas_recibidas': 'Facturas recibidas',
  'menu.funciones.nueva_factura': 'Nueva factura',
  'menu.funciones.facturas_rectif': 'Facturas rectificativas',
  'menu.funciones.modelos_fiscales': 'Modelos fiscales',

  // Funciones del módulo Proyectos
  'menu.funciones.proyectos_todos': 'Todos los proyectos',
  'menu.funciones.proyectos_nuevo': 'Nuevo proyecto',
  'menu.funciones.proyectos_activos': 'Proyectos activos',

  // Funciones del módulo Directorio
  'menu.funciones.clientes': 'Clientes',
  'menu.funciones.proveedores': 'Proveedores',
  'menu.funciones.nueva_persona': 'Nueva persona',
  'menu.funciones.todos_contactos': 'Todos los contactos',

  // Funciones del módulo Archivos
  'menu.funciones.descargas_masivas': 'Descargas masivas',
  'menu.funciones.repositorio': 'Repositorio',

  // Funciones del módulo Administración
  'menu.funciones.config_general': 'Configuración general',
  'menu.funciones.dominios': 'Dominios',
  'menu.funciones.auditoria': 'Auditoría',
  'menu.funciones.usuarios': 'Usuarios',

  // Funciones del módulo Perfil
  'menu.funciones.editar_perfil': 'Editar perfil',
  'menu.funciones.cambiar_password': 'Cambiar contraseña',

  // Funciones del módulo Sesión
  'menu.funciones.cerrar_sesion': 'Cerrar sesión',
}
```

### 5.2. Usar los textos en componentes

```typescript
import { MENU_TEXTS } from '../i18n/es-ES'

// En tu componente
const label = MENU_TEXTS[mod.nombre_mostrar] || mod.nombre_mostrar
```

---

## 6. Paso 5: Testing y validación

### 6.1. Validar backend

1. **Probar endpoint directamente**:
   ```bash
   curl https://tu-worker.workers.dev/api/menu
   ```

2. **Verificar estructura JSON**:
   - Debe tener propiedad `data`
   - Debe ser un array de módulos
   - Cada módulo debe tener `funciones` como array

3. **Probar activación/desactivación**:
   ```sql
   -- Desactivar un módulo
   UPDATE MOD_modulos_config SET activo = 0 WHERE id = 2;
   
   -- Verificar que no aparece en el endpoint
   ```

### 6.2. Validar frontend

1. **Verificar renderizado**:
   - El sidebar debe mostrar los módulos
   - Al expandir un módulo, deben aparecer sus funciones
   - Los textos deben aparecer en español

2. **Verificar navegación**:
   - Al hacer clic en una función, debe navegar a su `url_path`
   - El ítem activo debe resaltarse

3. **Verificar estados**:
   - Debe mostrar skeleton mientras carga
   - Debe mostrar mensaje de error si falla

### 6.3. Casos de prueba

| Caso | Pasos | Resultado esperado |
|-------|---------|-------------------|
| Menú carga correctamente | Abrir aplicación | Sidebar muestra módulos y funciones |
| Navegación funciona | Hacer clic en función | Navega a la ruta correcta |
| Ítem activo resaltado | Navegar a una función | El ítem correspondiente aparece activo |
| Módulo se expande/colapsa | Hacer clic en módulo | Funciones aparecen/desaparecen |
| Módulo desactivado no aparece | Desactivar módulo en BD | No aparece en el menú |
| Textos en español | Ver menú | Todos los textos están en español |

---

## 7. Buenas prácticas

### 7.1. Backend

- **Usar índices**: Los índices en `modulo_id`, `tipo_elemento`, `orden` y `activo` mejoran el rendimiento
- **Validar tipos**: Usa TypeScript para validar la estructura de los datos
- **Manejar errores**: Proporciona mensajes de error claros
- **Documentar endpoints**: Incluye descripción, parámetros y respuestas esperadas

### 7.2. Frontend

- **Usar custom hooks**: Encapsula la lógica de obtención de datos
- **Gestionar estados**: Muestra estados de carga y error
- **Componentes pequeños**: Divide la UI en componentes reutilizables
- **Separar textos**: Usa un sistema de textos centralizado
- **Accesibilidad**: Usa elementos semánticos y atributos ARIA

### 7.3. Base de datos

- **Usar transacciones**: Para operaciones complejas que modifican múltiples registros
- **Validar datos**: Usa constraints y checks para mantener integridad
- **Documentar esquema**: Incluye comentarios en SQL
- **Versionar migraciones**: Guarda cada cambio en un archivo separado

---

## 8. Antipatrones

### 8.1. Backend

| Antipatrón | Problema | Solución |
|--------------|-----------|-----------|
| Hardcodear menú en código | Requiere despliegue para cambiar | Usar tabla de configuración |
| No validar tipos de datos | Errores en tiempo de ejecución | Usar TypeScript |
| No manejar errores | Experiencia de usuario pobre | Gestionar errores y mostrar mensajes |
| Consultas sin índices | Rendimiento pobre | Crear índices en campos clave |

### 8.2. Frontend

| Antipatrón | Problema | Solución |
|--------------|-----------|-----------|
| Hardcodear textos en componentes | Difícil de mantener | Usar sistema de textos centralizado |
| No gestionar estados de carga | Experiencia de usuario pobre | Mostrar skeletons mientras carga |
| Componentes monolíticos | Difícil de mantener | Dividir en componentes pequeños |
| No validar rutas | Errores de navegación | Usar sistema de rutas del framework |

### 8.3. Base de datos

| Antipatrón | Problema | Solución |
|--------------|-----------|-----------|
| No usar índices | Rendimiento pobre | Crear índices en campos clave |
| Eliminar registros en lugar de desactivar | Pérdida de histórico | Usar campo `activo` |
| No usar constraints | Datos inconsistentes | Usar CHECK y FOREIGN KEY |
| Mezclar lógica de negocio con datos | Difícil de mantener | Mantener lógica en código |

---

## Conclusión

Esta guía proporciona los pasos necesarios para implementar el patrón de menú dinámico v1 en tu proyecto. Siguiendo estos pasos, podrás:

- Controlar la estructura del menú desde la base de datos
- Activar/desactivar elementos sin desplegar código
- Mantener una separación clara entre configuración y lógica de negocio

Para funcionalidades más avanzadas (roles, cache, i18n multiidioma), consulta el roadmap de versión 2 en el documento de arquitectura.
