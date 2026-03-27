# Especificación de Estructura de Carpetas Frontend PAI

**Fecha:** 27 de marzo de 2026  
**Versión:** 1.0  
**Estado:** PROPUESTA PARA REVISIÓN

---

## 1. Introducción

Este documento define la estructura de carpetas y archivos necesarios para el desarrollo del frontend de FASE 3 (Frontend - Interfaz de Usuario) del proyecto PAI.

## 2. Estructura de Carpetas

```
apps/frontend/src/
├── components/
│   ├── pai/                    # Componentes específicos para PAI
│   │   ├── proyectos/            # Componentes de gestión de proyectos
│   │   └── common/               # Componentes comunes reutilizables
├── lib/                         # Utilidades y servicios
│   ├── pages/                         # Páginas de la aplicación
│   │   ├── proyectos/              # Páginas específicas de proyectos
│   │   └── i18n/                   # Internacionalización
└── types/                        # Tipos TypeScript compartidos
```

## 3. Componentes PAI (apps/frontend/src/components/pai/)

### 3.1. Sección Proyectos en Menú Dinámico

**Ruta:** `/proyectos`  
**Componente:** `ProyectosSection.tsx` (por crear)

**Descripción:** Componente principal que muestra la lista de proyectos PAI con filtros y paginación.

**Responsabilidades:**
- Mostrar contador de proyectos en la cabecera
- Proporcionar acceso rápido a las acciones principales (crear proyecto, ejecutar análisis)
- Implementar filtros de búsqueda y navegación
- Mostrar indicador de carga mientras se obtienen datos

### 3.2. Página de Detalle de Proyecto

**Ruta:** `/proyectos/:id`  
**Componente:** `DetalleProyecto.tsx` (por crear)

**Descripción:** Página dedicada a mostrar todos los detalles de un proyecto PAI, incluyendo sus artefactos, notas y datos básicos.

**Responsabilidades:**
- Mostrar información completa del proyecto
- Visualizar los artefactos generados
- Mostrar notas asociadas al proyecto
- Permitir navegación a otras secciones del sistema

### 3.3. Formulario de Creación de Proyecto

**Ruta:** `/proyectos/crear` (modal integrado)  
**Componente:** `CrearProyectoModal.tsx` (por crear)

**Descripción:** Modal/formulario para crear un nuevo proyecto PAI a partir de IJSON.

**Responsabilidades:**
- Validar IJSON antes de enviar
- Mostrar indicador de progreso
- Generar CII automáticamente
- Redirigir a la página de detalle tras creación exitosa

### 3.4. Componentes de Notas

**Ruta:** `/proyectos/:id/notas` (lista)  
**Componente:** `NotasLista.tsx` (por crear)

**Descripción:** Lista de notas asociadas a un proyecto PAI, agrupadas por estado.

**Responsabilidades:**
- Mostrar notas en formato de tarjeta
- Permitir filtrar por tipo de nota
- Mostrar indicador de carga mientras se obtienen notas

**Ruta:** `/proyectos/:id/notas/:notaId` (editar)  
**Componente:** `NotaForm.tsx` (por crear)

**Descripción:** Formulario para crear una nueva nota.

**Responsabilidades:**
- Validar campos obligatorios antes de enviar
- Mostrar indicador de guardado mientras se crea la nota

### 3.5. Modal de Cambio de Estado

**Ruta:** `/proyectos/:id/estado` (modal integrado)  
**Componente:** `CambioEstadoModal.tsx` (por crear)

**Descripción:** Modal para cambiar el estado manual de un proyecto PAI.

**Responsabilidades:**
- Mostrar lista de estados disponibles
- Permitir selección de motivo si el estado lo requiere
- Validar que el nuevo estado es válido
- Confirmar el cambio antes de aplicarlo

### 3.6. Componentes Comunes Reutilizables

**Descripción:** Componentes comunes que pueden ser utilizados en las secciones de proyectos.

**Componentes:**
- `ResultCounter.tsx` - Contador de resultados en cabecera
- `LoadingSpinner.tsx` - Indicador de carga
- `EmptyState.tsx` - Estado vacío cuando no hay proyectos
- `DatasetStateHint.tsx` - Indicador de estado del conjunto de datos

---

## 4. Servicios y Hooks

### 4.1. Servicio API PAI

**Ubicación:** `apps/frontend/src/lib/api.ts` (por crear)

**Descripción:** Cliente HTTP con funciones para consumir la API de PAI.

**Funciones:**
```typescript
export async function crearProyecto(ijson: string): Promise<CrearProyectoResponse>
export async function obtenerProyecto(id: number): Promise<DetalleProyectoResponse>
export async function listarProyectos(filtros?: ListarProyectosFiltros): Promise<ListarProyectosResponse>
export async function ejecutarAnalisis(id: number, forzarReejecucion?: boolean): Promise<EjecutarAnalisisResponse>
export async function obtenerArtefactos(id: number): Promise<ObtenerArtefactosResponse>
export async function cambiarEstado(id: number, estadoId: number, motivoValoracionId?: number, motivoDescarteId?: number): Promise<CambiarEstadoResponse>
export async function eliminarProyecto(id: number): Promise<EliminarProyectoResponse>
export async function obtenerHistorial(id: number, limite?: number): Promise<HistorialEjecucionResponse>
```

### 4.2. Hooks Personalizados para PAI

**Ubicación:** `apps/frontend/src/hooks/use-pai.ts` (por crear)

**Descripción:** Hooks personalizados para la gestión de estado de proyectos PAI.

**Hooks:**
```typescript
export function usePAIProyecto() {
  // Retorna: { proyecto, isLoading, error, refetch }
}
export function usePAIListado() {
  // Retorna: { proyectos, isLoading, error, refetch }
}
export function usePAIDetalle(id: number) {
  // Retorna: { proyecto, isLoading, error, refetch }
}
```

---

## 5. Páginas de Proyectos

### 5.1. Página de Listado de Proyectos

**Ruta:** `/proyectos` (página principal)

**Componente:** `ListadoProyectosPage.tsx` (por crear)

**Descripción:** Página principal que muestra la lista de proyectos PAI con filtros y paginación.

**Responsabilidades:**
- Implementar filtros de búsqueda y navegación
- Mostrar contador de proyectos en cabecera
- Implementar paginación con controles
- Mostrar estado vacío si no hay proyectos

### 5.2. Página de Detalle de Proyecto

**Ruta:** `/proyectos/:id` (página de detalle)

**Componente:** `DetalleProyectoPage.tsx` (por crear)

**Descripción:** Página dedicada a mostrar todos los detalles de un proyecto PAI, incluyendo sus artefactos, notas y datos básicos.

**Responsabilidades:**
- Mostrar información completa del proyecto
- Visualizar los artefactos generados en pestañas
- Mostrar notas en sección dedicada
- Permitir navegación a otras secciones del sistema

---

## 6. Internacionalización

### 6.1. Archivo de Traducciones

**Ubicación:** `apps/frontend/src/i18n/es-ES.ts` (por crear)

**Descripción:** Archivo de traducciones en español para la interfaz de PAI.

**Contenido:**
```typescript
export const translations = {
  // Títulos de páginas
  proyectos: {
    title: 'Proyectos',
    subtitle: 'Gestión de proyectos de análisis inmobiliarios',
  },
  detalle: {
    title: 'Detalle de Proyecto PAI',
    subtitle: 'Análisis completo del inmueble',
  },
  listado: {
    title: 'Listado de Proyectos',
    subtitle: 'Todos los proyectos de análisis',
  },
}
}
```

---

## 7. Tipos Compartidos

### 7.1. Ubicación

**Archivo:** `apps/frontend/src/types/pai.ts` (por crear)

**Descripción:** Tipos TypeScript compartidos para PAI.

**Contenido:**
```typescript
export interface ProyectoPAI {
  id: number
  cii: string
  titulo: string
  estado_id: number
  estado: string
  motivo_valoracion_id: number | null
  motivo_descarte_id: number | null
  fecha_alta: string
  fecha_ultima_actualizacion: string
}

export interface DatosBasicosInmueble {
  portal: string
  url_fuente: string
  tipo_operacion: string
  tipo_inmueble: string
  precio: string
  precio_por_m2: string
  superficie_total_m2: string
  superficie_construida_m2: string
  superficie_util_m2: string
  ciudad: string
  provincia: string
  barrio: string | direccion: string | null
}

export interface Artefacto {
  id: number
  tipo_artefacto_id: number
  tipo: string
  ruta_r2: string
  fecha_creacion: string
}

export interface Nota {
  id: number
  proyecto_id: number
  tipo_nota_id: number
  tipo: string
  autor: string
  contenido: string
  fecha_creacion: string
}

export interface Estado {
  id: number
  codigo: string
  nombre: string
  descripcion: string
}

export interface MotivoValoracion {
  id: number
  codigo: string
  nombre: string
  descripcion: string
}

export interface MotivoDescarte {
  id: number
  codigo: string
  nombre: string
  descripcion: string
}
```

---

## 8. Referencias

### 8.1. Documentación de Backend

**API de PAI:** [`Especificacion_API_PAI.md`](../../MapaRuta/Fase02/Especificacion_API_PAI.md)
**Servicio de IA:** [`Servicio_Simulacion_IA.md`](../../MapaRuta/Fase02/Servicio_Simulacion_IA.md)
**Tipos PAI:** [`apps/worker/src/types/pai.ts`](../../apps/worker/src/types/pai.ts)

---

## 9. Referencias de Diseño

**Vista General UI:** [`01_UI.md`](../../UI_Desglose/01_UI.md)
**Sección Proyectos:** [`02_SeccionProyectos.md`](../../UI_Desglose/02_SeccionProyectos.md)
**Componentes de Notas:** [`03_SeccionProyectos.md`](../../UI_Desglose/03_SeccionProyectos.md)
**Componentes de Notas:** [`09_Componentes_Notas.md`](../../UI_Desglose/09_Componentes_Notas.md)

**Layout de Proyectos:** [`04_SeccionProyectos_Layout.png`](../../UI_Desglose/04_SeccionProyectos_Layout.png)

---

**Fin del Documento**
