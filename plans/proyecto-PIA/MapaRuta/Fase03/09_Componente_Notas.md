# Especificación de Componentes de Notas - Frontend PAI

**Fecha:** 27 de marzo de 2026  
**Fase:** FASE 3 - Frontend - Interfaz de Usuario  
**Versión:** 1.0

---

## Índice

1. [Introducción](#1-introducción)
2. [Componente Lista de Notas](#2-componente-lista-de-notas)
3. [Componente Formulario de Creación](#3-componente-formulario-de-creación)
4. [Componente Formulario de Edición](#4-componente-formulario-de-edición)
5. [Reglas de Editabilidad](#5-reglas-de-editabilidad)
6. [Integración con API](#6-integración-con-api)

---

## 1. Introducción

Este documento especifica los componentes de notas para el módulo PAI. Las notas permiten a los usuarios agregar observaciones y comentarios a los proyectos de análisis inmobiliario.

### Objetivos

- Definir la estructura visual de los componentes de notas
- Especificar el comportamiento de creación, edición y visualización
- Establecer reglas de editabilidad basadas en el estado del proyecto
- Proveer ejemplos de implementación

---

## 2. Componente Lista de Notas

### 2.1. Descripción

El componente `ListaNotas` muestra todas las notas asociadas a un proyecto en orden cronológico inverso (más reciente primero).

### 2.2. Estructura Visual

```
┌─────────────────────────────────────────────────────────────┐
│  Notas del Proyecto                                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📝 Nota del usuario                                 │   │
│  │  ─────────────────────────────────────────────────   │   │
│  │  Contenido de la nota...                              │   │
│  │                                                       │   │
│  │  Creado: 27/03/2026 14:30                             │   │
│  │  Actualizado: 27/03/2026 15:45                        │   │
│  │                                                       │   │
│  │  [Editar] [Eliminar]                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📝 Otra nota del usuario                            │   │
│  │  ─────────────────────────────────────────────────   │   │
│  │  Contenido de la nota...                              │   │
│  │                                                       │   │
│  │  Creado: 26/03/2026 10:15                             │   │
│  │                                                       │   │
│  │  [Editar] [Eliminar]                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [+ Agregar Nota]                                           │
└─────────────────────────────────────────────────────────────┘
```

### 2.3. Props del Componente

```typescript
interface ListaNotasProps {
  proyectoId: number;
  estadoProyecto: string;
  onNotaEditada?: (nota: Nota) => void;
  onNotaEliminada?: (notaId: number) => void;
}

interface Nota {
  id: number;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_id?: number;
}
```

### 2.4. Implementación de Referencia

```typescript
// apps/frontend/src/components/pai/ListaNotas.tsx

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { FormularioNota } from './FormularioNota';
import { FormularioEditarNota } from './FormularioEditarNota';

interface Nota {
  id: number;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface ListaNotasProps {
  proyectoId: number;
  estadoProyecto: string;
}

export function ListaNotas({ proyectoId, estadoProyecto }: ListaNotasProps) {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [notaEditando, setNotaEditando] = useState<Nota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const puedeAgregarNotas = estadoProyecto !== 'descartado';

  useEffect(() => {
    cargarNotas();
  }, [proyectoId]);

  const cargarNotas = async () => {
    setLoading(true);
    const response = await apiClient.get<{ notas: Nota[] }>(
      `/api/pai/proyectos/${proyectoId}/notas`
    );

    setLoading(false);

    if (response.success) {
      setNotas(response.data?.notas || []);
    } else {
      setError(response.error?.message || 'Error al cargar notas');
    }
  };

  const handleNotaCreada = (nuevaNota: Nota) => {
    setNotas([nuevaNota, ...notas]);
    setMostrarFormulario(false);
  };

  const handleNotaEditada = (notaActualizada: Nota) => {
    setNotas(notas.map(n => n.id === notaActualizada.id ? notaActualizada : n));
    setNotaEditando(null);
  };

  const handleNotaEliminada = async (notaId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta nota?')) return;

    const response = await apiClient.delete(`/api/pai/proyectos/${proyectoId}/notas/${notaId}`);

    if (response.success) {
      setNotas(notas.filter(n => n.id !== notaId));
    } else {
      alert(response.error?.message || 'Error al eliminar nota');
    }
  };

  if (loading) return <div>Cargando notas...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Notas del Proyecto</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-800">
          {error}
        </div>
      )}

      {notas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay notas aún.
        </div>
      ) : (
        <div className="space-y-4">
          {notas.map((nota) => (
            <div
              key={nota.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">📝 Nota</h3>
                {estadoProyecto !== 'descartado' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => setNotaEditando(nota)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleNotaEliminada(nota.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 whitespace-pre-wrap mb-3">
                {nota.contenido}
              </p>
              
              <div className="text-sm text-gray-500">
                Creado: {new Date(nota.fecha_creacion).toLocaleString('es-ES')}
                {nota.fecha_actualizacion !== nota.fecha_creacion && (
                  <span className="ml-2">
                    • Actualizado: {new Date(nota.fecha_actualizacion).toLocaleString('es-ES')}
                  </span>
                )}
              </div>

              {notaEditando?.id === nota.id && (
                <div className="mt-4 pt-4 border-t">
                  <FormularioEditarNota
                    proyectoId={proyectoId}
                    nota={nota}
                    onGuardado={handleNotaEditada}
                    onCancel={() => setNotaEditando(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {puedeAgregarNotas && !mostrarFormulario && (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Agregar Nota
        </button>
      )}

      {mostrarFormulario && (
        <div className="mt-4 pt-4 border-t">
          <FormularioNota
            proyectoId={proyectoId}
            onGuardado={handleNotaCreada}
            onCancel={() => setMostrarFormulario(false)}
          />
        </div>
      )}
    </div>
  );
}
```

---

## 3. Componente Formulario de Creación

### 3.1. Descripción

El componente `FormularioNota` permite al usuario crear una nueva nota para un proyecto.

### 3.2. Estructura Visual

```
┌─────────────────────────────────────────────────────────────┐
│  Nueva Nota                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Contenido de la nota...                            │   │
│  │                                                     │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancelar] [Guardar Nota]                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.3. Props del Componente

```typescript
interface FormularioNotaProps {
  proyectoId: number;
  onGuardado: (nota: Nota) => void;
  onCancel: () => void;
}
```

### 3.4. Implementación de Referencia

```typescript
// apps/frontend/src/components/pai/FormularioNota.tsx

import { useState } from 'react';
import { apiClient } from '../../lib/api';

interface Nota {
  id: number;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface FormularioNotaProps {
  proyectoId: number;
  onGuardado: (nota: Nota) => void;
  onCancel: () => void;
}

export function FormularioNota({ proyectoId, onGuardado, onCancel }: FormularioNotaProps) {
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contenido.trim()) {
      setError('El contenido de la nota es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);

    const response = await apiClient.post<Nota>(
      `/api/pai/proyectos/${proyectoId}/notas`,
      { contenido }
    );

    setLoading(false);

    if (response.success && response.data) {
      onGuardado(response.data);
    } else {
      setError(response.error?.message || 'Error al crear nota');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium mb-3">Nueva Nota</h3>

      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        placeholder="Escribe tu nota aquí..."
        className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
      />

      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}

      <div className="mt-3 flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !contenido.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Nota'}
        </button>
      </div>
    </form>
  );
}
```

---

## 4. Componente Formulario de Edición

### 4.1. Descripción

El componente `FormularioEditarNota` permite al usuario editar una nota existente.

### 4.2. Estructura Visual

```
┌─────────────────────────────────────────────────────────────┐
│  Editar Nota                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Contenido existente de la nota...                  │   │
│  │                                                     │   │
│  │                                                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancelar] [Guardar Cambios]                                │
└─────────────────────────────────────────────────────────────┘
```

### 4.3. Props del Componente

```typescript
interface FormularioEditarNotaProps {
  proyectoId: number;
  nota: Nota;
  onGuardado: (nota: Nota) => void;
  onCancel: () => void;
}
```

### 4.4. Implementación de Referencia

```typescript
// apps/frontend/src/components/pai/FormularioEditarNota.tsx

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

interface Nota {
  id: number;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface FormularioEditarNotaProps {
  proyectoId: number;
  nota: Nota;
  onGuardado: (nota: Nota) => void;
  onCancel: () => void;
}

export function FormularioEditarNota({ proyectoId, nota, onGuardado, onCancel }: FormularioEditarNotaProps) {
  const [contenido, setContenido] = useState(nota.contenido);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contenido.trim()) {
      setError('El contenido de la nota es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);

    const response = await apiClient.put<Nota>(
      `/api/pai/proyectos/${proyectoId}/notas/${nota.id}`,
      { contenido }
    );

    setLoading(false);

    if (response.success && response.data) {
      onGuardado(response.data);
    } else {
      setError(response.error?.message || 'Error al actualizar nota');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium mb-3">Editar Nota</h3>

      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        placeholder="Escribe tu nota aquí..."
        className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
      />

      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}

      <div className="mt-3 flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !contenido.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
```

---

## 5. Reglas de Editabilidad

### 5.1. Estados del Proyecto y Permisos

| Estado del Proyecto | Puede Agregar Notas | Puede Editar Notas | Puede Eliminar Notas |
|---------------------|---------------------|-------------------|----------------------|
| `borrador` | ✅ Sí | ✅ Sí | ✅ Sí |
| `en_proceso` | ✅ Sí | ✅ Sí | ✅ Sí |
| `completado` | ✅ Sí | ✅ Sí | ✅ Sí |
| `valorado` | ✅ Sí | ✅ Sí | ✅ Sí |
| `descartado` | ❌ No | ❌ No | ❌ No |
| `error` | ✅ Sí | ✅ Sí | ✅ Sí |

### 5.2. Implementación de Validación

```typescript
// apps/frontend/src/components/pai/utils.ts

export function puedeGestionarNotas(estadoProyecto: string): boolean {
  const estadosPermitidos = ['borrador', 'en_proceso', 'completado', 'valorado', 'error'];
  return estadosPermitidos.includes(estadoProyecto);
}
```

---

## 6. Integración con API

### 6.1. Endpoints

| Operación | Método | Endpoint |
|-----------|--------|----------|
| Crear nota | POST | `/api/pai/proyectos/:id/notas` |
| Editar nota | PUT | `/api/pai/proyectos/:id/notas/:notaId` |
| Eliminar nota | DELETE | `/api/pai/proyectos/:id/notas/:notaId` |

### 6.2. Request/Response

#### Crear Nota

**Request:**
```typescript
{
  "contenido": "string (1-5000 caracteres)"
}
```

**Response Exitoso (201):**
```typescript
{
  "success": true,
  "data": {
    "id": 1,
    "contenido": "string",
    "fecha_creacion": "2026-03-27T14:30:00Z",
    "fecha_actualizacion": "2026-03-27T14:30:00Z"
  }
}
```

**Response con Error (400):**
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El contenido de la nota es obligatorio"
  }
}
```

---

## Referencias

- [`Especificacion_API_PAI.md`](../Fase02/Especificacion_API_PAI.md) - Especificación de endpoints backend
- [`08_Vista_Detalle_Proyecto.md`](./08_Vista_Detalle_Proyecto.md) - Vista de detalle donde se integran las notas
- [`11_Estados_Motivos_PAI.md`](./11_Estados_Motivos_PAI.md) - Estados del proyecto PAI

---

**Fin del Documento - Especificación de Componentes de Notas**
