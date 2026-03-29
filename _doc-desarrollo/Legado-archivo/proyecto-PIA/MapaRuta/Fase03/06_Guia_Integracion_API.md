# Guía de Integración de API - Frontend PAI

**Fecha:** 27 de marzo de 2026  
**Fase:** FASE 3 - Frontend - Interfaz de Usuario  
**Versión:** 1.0

---

## Índice

1. [Introducción](#1-introducción)
2. [Configuración Base](#2-configuración-base)
3. [Patrones de Consumo de Endpoints](#3-patrones-de-consumo-de-endpoints)
4. [Manejo de Errores](#4-manejo-de-errores)
5. [Autenticación](#5-autenticación)
6. [Ejemplos de Implementación](#6-ejemplos-de-implementación)
7. [Consideraciones de Performance](#7-consideraciones-de-performance)

---

## 1. Introducción

Esta guía proporciona instrucciones detalladas para integrar el frontend del proyecto PAI con la API backend implementada en FASE 2. La integración debe seguir patrones consistentes para asegurar mantenibilidad y escalabilidad.

### Objetivos

- Establecer un patrón consistente para consumo de endpoints
- Definir manejo de errores y estados de carga
- Especificar cómo gestionar respuestas exitosas y fallidas
- Proveer ejemplos prácticos de implementación

---

## 2. Configuración Base

### 2.1. Variables de Entorno

Configurar la URL base de la API en el archivo `.env` del frontend:

```env
VITE_API_BASE_URL=https://api.cbc-endes.com
```

### 2.2. Cliente HTTP

Crear un cliente HTTP configurado en `apps/frontend/src/lib/api.ts`:

```typescript
// apps/frontend/src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'UNKNOWN_ERROR',
            message: data.error?.message || 'Error desconocido',
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión con el servidor',
          details: error instanceof Error ? { message: error.message } : undefined,
        },
      };
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

---

## 3. Patrones de Consumo de Endpoints

### 3.1. Patrón con Custom Hook

Crear hooks reutilizables para cada endpoint en `apps/frontend/src/hooks/use-pai.ts`:

```typescript
// apps/frontend/src/hooks/use-pai.ts

import { useState, useCallback } from 'react';
import { apiClient } from '../lib/api';
import type { ProyectoPAI, CrearProyectoRequest, ListarProyectosResponse } from '../types/pai';

export function useCrearProyecto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearProyecto = useCallback(async (data: CrearProyectoRequest) => {
    setLoading(true);
    setError(null);

    const response = await apiClient.post<ProyectoPAI>('/api/pai/proyectos', data);

    setLoading(false);

    if (!response.success) {
      setError(response.error?.message || 'Error al crear proyecto');
      return null;
    }

    return response.data;
  }, []);

  return { crearProyecto, loading, error };
}

export function useObtenerProyecto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerProyecto = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    const response = await apiClient.get<ProyectoPAI>(`/api/pai/proyectos/${id}`);

    setLoading(false);

    if (!response.success) {
      setError(response.error?.message || 'Error al obtener proyecto');
      return null;
    }

    return response.data;
  }, []);

  return { obtenerProyecto, loading, error };
}

export function useListarProyectos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listarProyectos = useCallback(async (params?: {
    estado?: string;
    tipo_inmueble?: string;
    ciudad?: string;
    page?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.tipo_inmueble) queryParams.append('tipo_inmueble', params.tipo_inmueble);
    if (params?.ciudad) queryParams.append('ciudad', params.ciudad);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<ListarProyectosResponse>(
      `/api/pai/proyectos?${queryParams.toString()}`
    );

    setLoading(false);

    if (!response.success) {
      setError(response.error?.message || 'Error al listar proyectos');
      return null;
    }

    return response.data;
  }, []);

  return { listarProyectos, loading, error };
}

// ... hooks para otros endpoints
```

### 3.2. Patrón con React Query (Recomendado)

Si se utiliza React Query (TanStack Query) para cacheo automático:

```typescript
// apps/frontend/src/lib/api-client.ts

import { QueryClient, QueryFunctionContext } from '@tanstack/react-query';
import { apiClient } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Query keys
export const paiKeys = {
  all: ['pai'] as const,
  proyectos: () => [...paiKeys.all, 'proyectos'] as const,
  proyecto: (id: number) => [...paiKeys.proyectos(), id] as const,
  artefactos: (id: number) => [...paiKeys.proyecto(id), 'artefactos'] as const,
  historial: (id: number) => [...paiKeys.proyecto(id), 'historial'] as const,
};

// Query functions
export const fetchProyecto = async ({ queryKey }: QueryFunctionContext<ReturnType<typeof paiKeys.proyecto>>) => {
  const [, , id] = queryKey;
  const response = await apiClient.get<ProyectoPAI>(`/api/pai/proyectos/${id}`);
  
  if (!response.success) {
    throw new Error(response.error?.message || 'Error al obtener proyecto');
  }
  
  return response.data;
};

export const fetchProyectos = async ({ queryKey }: QueryFunctionContext<ReturnType<typeof paiKeys.proyectos>>) => {
  const response = await apiClient.get<ListarProyectosResponse>('/api/pai/proyectos');
  
  if (!response.success) {
    throw new Error(response.error?.message || 'Error al listar proyectos');
  }
  
  return response.data;
};
```

---

## 4. Manejo de Errores

### 4.1. Clasificación de Errores

| Código de Error | Tipo | Acción Sugerida |
|-----------------|------|-----------------|
| `VALIDATION_ERROR` | 400 | Mostrar mensaje de validación al usuario |
| `NOT_FOUND` | 404 | Redirigir a página 404 o mostrar mensaje |
| `CONFLICT` | 409 | Mostrar mensaje de conflicto |
| `INTERNAL_ERROR` | 500 | Mostrar mensaje genérico de error |
| `NETWORK_ERROR` | - | Mostrar mensaje de conexión |

### 4.2. Componente de Manejo de Errores

Crear un componente para mostrar errores de manera consistente:

```typescript
// apps/frontend/src/components/ErrorMessage.tsx

interface ErrorMessageProps {
  error: string | null;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="text-red-800">{error}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
```

---

## 5. Autenticación

### 5.1. Headers de Autenticación

Si se implementa autenticación, agregar el token a cada solicitud:

```typescript
// apps/frontend/src/lib/api.ts (extendido)

class ApiClient {
  // ... código existente

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    // ... resto del código
  }
}
```

---

## 6. Ejemplos de Implementación

### 6.1. Crear Proyecto

```typescript
// apps/frontend/src/pages/proyectos/CrearProyecto.tsx

import { useState } from 'react';
import { useCrearProyecto } from '../../hooks/use-pai';
import { ErrorMessage } from '../../components/ErrorMessage';

export function CrearProyecto() {
  const [ijson, setIjson] = useState('');
  const { crearProyecto, loading, error } = useCrearProyecto();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const proyecto = await crearProyecto({ ijson });
    
    if (proyecto) {
      // Redirigir a la página de detalle
      window.location.href = `/proyectos/${proyecto.id}`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Proyecto PAI</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">IJSON del Inmueble</label>
          <textarea
            value={ijson}
            onChange={(e) => setIjson(e.target.value)}
            className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
            placeholder='{"titulo": "...", ...}'
            required
          />
        </div>

        <ErrorMessage error={error} />

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Proyecto'}
        </button>
      </form>
    </div>
  );
}
```

### 6.2. Listar Proyectos

```typescript
// apps/frontend/src/pages/proyectos/ListarProyectos.tsx

import { useEffect, useState } from 'react';
import { useListarProyectos } from '../../hooks/use-pai';
import { ErrorMessage } from '../../components/ErrorMessage';

export function ListarProyectos() {
  const [proyectos, setProyectos] = useState(null);
  const { listarProyectos, loading, error } = useListarProyectos();

  useEffect(() => {
    const fetchData = async () => {
      const data = await listarProyectos();
      if (data) {
        setProyectos(data);
      }
    };
    fetchData();
  }, [listarProyectos]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Proyectos PAI</h1>

      <ErrorMessage error={error} />

      {proyectos && proyectos.proyectos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay proyectos aún. Crea el primero.
        </div>
      )}

      {proyectos && proyectos.proyectos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Título</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.proyectos.map((proyecto) => (
                <tr key={proyecto.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{proyecto.id}</td>
                  <td className="py-3 px-4">{proyecto.titulo}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      proyecto.estado === 'completado' ? 'bg-green-100 text-green-800' :
                      proyecto.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {proyecto.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4">{new Date(proyecto.fecha_creacion).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <a
                      href={`/proyectos/${proyecto.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver detalle
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## 7. Consideraciones de Performance

### 7.1. Estrategias de Optimización

1. **Paginación**: Utilizar siempre paginación en listados para no cargar todos los registros
2. **Cacheo**: Implementar cacheo de respuestas con React Query o similar
3. **Lazy Loading**: Cargar datos solo cuando sean necesarios
4. **Debouncing**: Implementar debouncing en filtros de búsqueda
5. **Optimistic Updates**: Actualizar la UI inmediatamente antes de recibir respuesta del servidor

### 7.2. Ejemplo de Debouncing para Filtros

```typescript
import { useState, useEffect, useCallback } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Uso en componente de listado
export function ListarProyectosConFiltros() {
  const [filtro, setFiltro] = useState('');
  const filtroDebounced = useDebounce(filtro, 300);
  const { listarProyectos, loading, error, data } = useListarProyectos();

  useEffect(() => {
    listarProyectos({ ciudad: filtroDebounced });
  }, [filtroDebounced, listarProyectos]);

  // ... resto del componente
}
```

---

## Referencias

- [`Especificacion_API_PAI.md`](../Fase02/Especificacion_API_PAI.md) - Especificación completa de endpoints backend
- [`04_Specificacion_API_Frontend.md`](./04_Specificacion_API_Frontend.md) - Especificación de interfaces TypeScript
- [`.governance/reglas_proyecto.md`](../../../.governance/reglas_proyecto.md) - Reglas del proyecto

---

**Fin del Documento - Guía de Integración de API**
