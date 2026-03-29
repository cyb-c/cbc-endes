# Frontend - Hooks y componentes React

## Hook useMenu

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

## Componente SidebarItem

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

## Componente SidebarModule

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

## Componente AppSidebar

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

## Integración en layout

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
