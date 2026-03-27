# Especificación de la Vista de Listado de Proyectos

**Fecha:** 27 de marzo de 2026  
**Versión:** 1.0

---

## 1. Introducción

Este documento define la estructura y comportamiento de la vista de listado de proyectos PAI en el frontend.

## 2. Ubicación y Ruta

**Ruta:** `/proyectos` (página dedicada al listado de proyectos)

**Navegación:**
- Desde el menú lateral: Sección "Proyectos" → "Listar Proyectos"
- Desde la página de detalle: Botón "Ver todos" en la banda de control
- Desde la cabecera: Título de la página

## 3. Estructura de la Vista

### 3.1. Cabecera (Section Header)

```
┌──────────────────────────────────────────────────────┐
│  TÍTULO DE PANTALLA                           │
│ Listar Proyectos PAI                               │
└──────────────────────────────────────────────────────┘
```

### 3.2. Banda de Búsqueda y Filtros (Filter Toolbar)

```
┌──────────────────────────────────────────────────────┐
│ 🔍 [Campo de entrada]               [Buscar] │
│ [Filtros principales]                    [Filtros] │
│ [Filtros complementarios]              [Filtros] │
│ [Ordenar]                            [Ordenar]  │
│ [Reiniciar]                           [Limpiar] │
└──────────────────────────────────────────────────────┘
```

### 3.3. Listado de Proyectos (Data Grid)

```
┌──────────────────────────────────────────────────────┐
│ │ CII  │ Título │ Estado   │ Precio │ Superficie │ Ciudad    │ Fecha Alta  │ Acciones      │
│ 0001 │ ... │ ...     │ ...     │ ...      │ ...      │ ...      │ [Ver] [⋮]  │
│ 0002 │ ... │ ...     │ ...     │ ...      │ ...      │ ...      │ [Ver] [⋮]  │
│ ...   │ ... │ ...     │ ...     │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │ [Ver] [⋮]  │
│ ...   │ ... │ ...     │ ...     │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │ ...      │ [Ver] [⋮]  │
└──────────────────────────────────────────────────────┘
```

### 3.4. Pie de Página (Pagination Footer)

```
┌──────────────────────────────────────────────────────┐
│ Mostrando 1-10 de 50                          │
│ ◀ Anterior                              │ Pág. 1 de 5    │
│ Siguiente                                    │ Total: 50 proyectos     │
│ [10 por página]                                │
│ [Tamaño de página: Grande] [M] [Mediana] [Pequeña] │
│ [Posición actual: 1]                              │
│ [Contador de resultados: 50 de 50]             │
│ [Pacing: Normal]                              │
│ [Revisión pendiente: No]                           │
└──────────────────────────────────────────────────────┘
```

## 4. Comportamiento de Navegación

### 4.1. Carga Inicial
- Mostrar indicador de carga mientras se obtienen los proyectos
- Mostrar skeleton de carga si no hay proyectos

### 4.2. Búsqueda y Filtros
- **Búsqueda directa:** Filtrar por CII, título, ciudad
- **Filtros principales:** Filtrar por estado, tipo de inmueble, rango de precios
- **Filtros complementarios:** Filtrar por barrio, fecha de alta
- **Ordenación:** Ordenar por fecha alta (descendente), precio (ascendente), superficie (descendente)
- **Reinicio:** Limpiar todos los filtros

### 4.3. Paginación
- Cargar más proyectos al hacer scroll infinito o botón "Cargar más"
- Implementar navegación por teclado (flechas)
- Mostrar posición actual en la página

### 4.4. Acciones por Fila
- **Botón "Ver":** Navegar a la página de detalle del proyecto
- **Botón "Editar"** (si el estado lo permite): Editar el proyecto
- **Botón "⋮" (Menú contextual):** Mostrar acciones disponibles (ejecutar análisis, añadir nota, cambiar estado, etc.)

### 4.5. Estados de Conjunto de Datos
- **Vacio:** Mostrar mensaje: "No hay proyectos para mostrar"
- **Cargando:** Mostrar skeleton de carga
- **Con resultados:** Mostrar tabla con datos
- **Error:** Mostrar mensaje de error con opción de reintentar

### 4.6. Interacción con el Menú Lateral
- La vista debe estar integrada con el menú dinámico
- La sección "Proyectos" debe estar activa en el menú
- El contador de resultados debe actualizarse en tiempo real

## 5. Estados del Proyecto (Dataset State Hints)

| Estado | Color de Indicador | Texto de Estado |
|--------|-------------------|----------------|
| CREADO | 🟢 Gris claro | Estado inicial, listo para análisis |
| EN_ANALISIS | 🟡 Azul claro | Análisis en progreso |
| PENDIENTE_REVISION | 🟠 Naranja | Esperando revisión del análisis |
| EVALUANDO_VIABILIDAD | 🟣 Amarillo claro | Evaluando viabilidad |
| EVALUANDO_PLAN_NEGOCIO | 🟣 Amarillo claro | Evaluando plan de negocio |
| SEGUIMIENTO_COMERCIAL | 🟢 Verde claro | En seguimiento comercial |
| DESCARTADO | 🔴 Rojo claro | Proyecto descartado |
| ANALISIS_CON_ERROR | 🔴 Rojo oscuro | Análisis con errores |

## 6. Integración con API

### 6.1. Endpoints Utilizados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `GET /api/pai/proyectos` | Listar proyectos con filtros y paginación |
| `GET /api/pai/proyectos/:id` | Obtener detalles de un proyecto |

### 6.2. Patrones de Consumo

```typescript
// Ejemplo de llamada a la API
const response = await fetch('/api/pai/proyectos?estado_id=3&pagina=1&por_pagina=20')
const data = await response.json()

// Iterar sobre proyectos
data.proyectos.forEach(proyecto => {
  console.log(`CII: ${proyecto.cii}, Estado: ${proyecto.estado}`)
})
```

### 6.3. Manejo de Estados de Carga

```typescript
interface ViewState {
  estado: 'vacio' | 'cargando' | 'con_resultados' | 'error'
}

function getEstadoVacio(): ViewState {
  return { estado: 'vacio' }
}

function getEstadoCargando(): ViewState {
  return { estado: 'cargando' }
}

function getEstadoConResultados(): ViewState {
  return { estado: 'con_resultados' }
}

function getEstadoError(): ViewState {
  return { estado: 'error' }
}
```

## 7. Consideraciones de UX

### 7.1. Rendimiento
- La tabla debe ser virtualizada o implementar paginación real para manejar grandes volúmenes de datos
- Mostrar indicador de posición actual (ej: "1 de 50")

### 7.2. Accesibilidad
- Los filtros deben ser intuitivos y fáciles de usar
- La búsqueda debe funcionar en tiempo real (debounce de 500ms)
- Los botones de acción deben ser claramente visibles

### 7.3. Diseño Responsive
- La vista debe adaptarse a diferentes tamaños de pantalla (móvil, tablet, desktop)
- La tabla debe ser scrollable horizontalmente en pantallas pequeñas

---

**Fin de la Especificación**
