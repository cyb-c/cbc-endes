# 005-Especificacion-Integracion-Frontend.md

---

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura de Integración](#2-arquitectura-de-integración)
3. [Componentes a Modificar](#3-componentes-a-modificar)
4. [Especificación de Comportamiento](#4-especificación-de-comportamiento)
5. [Manejo de Estados](#5-manejo-de-estados)
6. [Referencias](#6-referencias)

---

## 1. Resumen Ejecutivo

### 1.1 Propósito

Este documento especifica la integración del frontend con el **Workflow de Análisis Inmobiliario con IA Real**, incluyendo la modificación de componentes existentes y la implementación de nuevos comportamientos.

### 1.2 Cambios Principales

| Aspecto | Estado Actual | Estado Esperado |
|---------|--------------|-----------------|
| **Botón "Ejecutar Análisis"** | Existe, lógica básica | Condicional por estado (1,2,3,4) |
| **Indicador de progreso** | No existe | Mostrar paso actual durante ejecución |
| **Pestañas de resultados** | 2 existentes + simuladas | 2 existentes + 7 nuevas de IA |
| **Visualización de resultados** | Parcial posible | Solo tras completitud |

---

## 2. Arquitectura de Integración

### 2.1 Flujo de Interacción

```
┌─────────────────────────────────────────────────────────────────┐
│                    VISTA DE DETALLE DE PROYECTO                  │
│  /proyectos/:id                                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Cabecera del Proyecto                                     │ │
│  │  - Título, CII, Estado                                     │ │
│  │  - Botones: "Cambiar Estado", "Ejecutar Análisis", "Eliminar"│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Datos Básicos del Inmueble                                │ │
│  │  (portal, precio, superficie, ubicación, etc.)             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Resultados del Análisis                                   │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Pestaña 1: Resumen Ejecutivo (EXISTENTE - BD)       │ │ │
│  │  │  Pestaña 2: Datos Transformados (EXISTENTE - BD)     │ │ │
│  │  │  Pestaña 3: Activo Físico (NUEVA - R2)               │ │ │
│  │  │  Pestaña 4: Activo Estratégico (NUEVA - R2)          │ │ │
│  │  │  Pestaña 5: Activo Financiero (NUEVA - R2)           │ │ │
│  │  │  Pestaña 6: Activo Regulado (NUEVA - R2)             │ │ │
│  │  │  Pestaña 7: Inversor (NUEVA - R2)                    │ │ │
│  │  │  Pestaña 8: Emprendedor Operador (NUEVA - R2)        │ │ │
│  │  │  Pestaña 9: Propietario (NUEVA - R2)                 │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Secuencia de Ejecución

```
1. Usuario navega a /proyectos/:id
         │
         ▼
2. Frontend carga datos del proyecto (GET /api/pai/proyectos/:id)
         │
         ▼
3. Frontend evalúa estado_id
         │
         ├─ Si estado_id ∈ (1,2,3,4) → Habilitar botón "Ejecutar Análisis"
         └─ Si estado_id >= 5 → Deshabilitar botón
         │
         ▼
4. Usuario pulsa "Ejecutar Análisis" (si está habilitado)
         │
         ▼
5. Frontend envía POST /api/pai/proyectos/:id/analisis
         │
         ▼
6. Frontend muestra indicador de progreso
         │   - "Ejecutando paso 1 de 7: Activo Físico..."
         │   - "Ejecutando paso 2 de 7: Activo Estratégico..."
         │   - etc.
         │
         ▼
7. Frontend espera respuesta del backend
         │
         ├─ Si ÉXITO → Recargar datos y mostrar 9 pestañas
         └─ Si ERROR → Mostrar notificación de error
```

---

## 3. Componentes a Modificar

### 3.1 Archivos del Frontend

| Archivo | Ruta | Acción | Propósito |
|---------|------|--------|-----------|
| `DetalleProyecto.tsx` | `apps/frontend/src/pages/proyectos/` | **MODIFICAR** | Vista principal de detalle |
| `BotonEjecutarAnalisis.tsx` | `apps/frontend/src/components/pai/` | **CREAR** | Botón condicional con progreso |
| `PestañasResultados.tsx` | `apps/frontend/src/components/pai/` | **MODIFICAR** | 9 pestañas de resultados |
| `VisualizadorMarkdown.tsx` | `apps/frontend/src/components/pai/` | **EXISTENTE** | Renderizar MD |
| `useProyectoDetalle.ts` | `apps/frontend/src/hooks/` | **CREAR** | Hook para estado y acciones |

### 3.2 Estructura de Carpetas

```
apps/frontend/src/
├── pages/
│   └── proyectos/
│       ├── ListadoProyectos.tsx     (EXISTENTE)
│       ├── CrearProyecto.tsx        (EXISTENTE)
│       └── DetalleProyecto.tsx      (MODIFICAR)
├── components/
│   └── pai/
│       ├── BotonEjecutarAnalisis.tsx    (CREAR)
│       ├── PestañasResultados.tsx       (MODIFICAR)
│       ├── VisualizadorMarkdown.tsx     (EXISTENTE)
│       ├── ResultadosAnalisis.tsx       (EXISTENTE - ampliar)
│       └── Paginacion.tsx               (EXISTENTE)
├── hooks/
│   └── useProyectoDetalle.ts        (CREAR)
├── services/
│   └── pai-api.ts                   (CREAR)
└── i18n/
    ├── es-ES.ts                     (EXISTENTE - añadir textos)
    └── en-US.ts                     (EXISTENTE - añadir textos)
```

---

## 4. Especificación de Comportamiento

### 4.1 Botón "Ejecutar Análisis"

#### 4.1.1 Condicionalidad de Habilitación

```typescript
// Estados que permiten el botón
const estadosPermitidos = [1, 2, 3, 4]  // CREADO, PROCESANDO_ANALISIS, ANALISIS_CON_ERROR, ANALISIS_FINALIZADO

// Lógica de habilitación
const botonHabilitado = estadosPermitidos.includes(proyecto.estado_id)

// Estados y su significado:
// 1 = CREADO → ✅ Habilitado
// 2 = PROCESANDO_ANALISIS → ✅ Habilitado (reintentar)
// 3 = ANALISIS_CON_ERROR → ✅ Habilitado (reintentar)
// 4 = ANALISIS_FINALIZADO → ✅ Habilitado (re-ejecutar)
// 5 = EVALUANDO_VIABILIDAD → ❌ Deshabilitado
// 6 = EVALUANDO_PLAN_NEGOCIO → ❌ Deshabilitado
// 7 = SEGUIMIENTO_COMERCIAL → ❌ Deshabilitado
// 8 = DESCARTADO → ❌ Deshabilitado
```

#### 4.1.2 Estados del Botón

| Estado | Texto | Disabled | Loading |
|--------|-------|----------|---------|
| `idle` | "Ejecutar Análisis" | false | false |
| `loading` | "Paso X de 7: {nombre}" | true | true |
| `success` | "Análisis Finalizado" | false | false |
| `error` | "Reintentar Análisis" | false | false |

#### 4.1.3 Implementación del Componente

```typescript
interface BotonEjecutarAnalisisProps {
  proyectoId: number
  estadoId: number
  onSuccess: () => void
  onError: (error: string) => void
}

export function BotonEjecutarAnalisis({ 
  proyectoId, 
  estadoId, 
  onSuccess, 
  onError 
}: BotonEjecutarAnalisisProps) {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [pasoActual, setPasoActual] = useState(0)
  const { t } = useLocale()
  
  const estadosPermitidos = [1, 2, 3, 4]
  const habilitado = estadosPermitidos.includes(estadoId) && estado !== 'loading'
  
  const nombresPasos = [
    'Activo Físico',
    'Activo Estratégico',
    'Activo Financiero',
    'Activo Regulado',
    'Inversor',
    'Emprendedor Operador',
    'Propietario',
  ]
  
  const handleEjecutarAnalisis = async () => {
    setEstado('loading')
    setPasoActual(1)
    
    try {
      const response = await fetch(`${VITE_API_BASE_URL}/api/pai/proyectos/${proyectoId}/analisis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forzar_reejecucion: true }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al ejecutar análisis')
      }
      
      const data = await response.json()
      
      setEstado('success')
      onSuccess()
      
    } catch (error) {
      setEstado('error')
      onError(error instanceof Error ? error.message : 'Error desconocido')
    }
  }
  
  // Actualizar paso durante la ejecución (polling o WebSocket)
  useEffect(() => {
    if (estado !== 'loading') return
    
    const interval = setInterval(async () => {
      // Polling para obtener progreso actual
      // O usar WebSocket si está implementado
      const response = await fetch(`${VITE_API_BASE_URL}/api/pai/proyectos/${proyectoId}/progreso`)
      if (response.ok) {
        const { paso } = await response.json()
        setPasoActual(paso)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [estado, proyectoId])
  
  const obtenerTextoBoton = () => {
    if (estado === 'loading') {
      return `Paso ${pasoActual} de 7: ${nombresPasos[pasoActual - 1]}`
    }
    if (estado === 'success') {
      return t('pai.analisis.finalizado')
    }
    if (estado === 'error') {
      return t('pai.analisis.reintentar')
    }
    return t('pai.analisis.ejecutar')
  }
  
  return (
    <Button
      variant="primary"
      disabled={!habilitado}
      loading={estado === 'loading'}
      onClick={handleEjecutarAnalisis}
    >
      {obtenerTextoBoton()}
    </Button>
  )
}
```

### 4.2 Pestañas de Resultados

#### 4.2.1 Estructura de Pestañas

```typescript
const pestañas = [
  {
    key: 'resumen-ejecutivo',
    label: t('pai.pestanas.resumen_ejecutivo'),
    tipo: 'existente',  // Viene de BD (PRO_resumen_ejecutivo)
    orden: 1,
  },
  {
    key: 'datos-transformados',
    label: t('pai.pestanas.datos_transformados'),
    tipo: 'existente',  // Viene de BD (PRO_ijson transformado)
    orden: 2,
  },
  {
    key: 'activo-fisico',
    label: t('pai.pestanas.activo_fisico'),
    tipo: 'nuevo',  // Viene de R2
    orden: 3,
  },
  {
    key: 'activo-estrategico',
    label: t('pai.pestanas.activo_estrategico'),
    tipo: 'nuevo',
    orden: 4,
  },
  {
    key: 'activo-financiero',
    label: t('pai.pestanas.activo_financiero'),
    tipo: 'nuevo',
    orden: 5,
  },
  {
    key: 'activo-regulado',
    label: t('pai.pestanas.activo_regulado'),
    tipo: 'nuevo',
    orden: 6,
  },
  {
    key: 'inversor',
    label: t('pai.pestanas.inversor'),
    tipo: 'nuevo',
    orden: 7,
  },
  {
    key: 'emprendedor-operador',
    label: t('pai.pestanas.emprendedor_operador'),
    tipo: 'nuevo',
    orden: 8,
  },
  {
    key: 'propietario',
    label: t('pai.pestanas.propietario'),
    tipo: 'nuevo',
    orden: 9,
  },
]
```

#### 4.2.2 Carga de Contenido

```typescript
interface PestañaResultado {
  key: string
  label: string
  contenido: string | null
  cargando: boolean
  error: string | null
}

// Cargar contenido de pestañas
const cargarContenidoPestañas = async (proyectoId: number) => {
  // 1. Obtener datos del proyecto (incluye artefactos)
  const response = await fetch(`${VITE_API_BASE_URL}/api/pai/proyectos/${proyectoId}`)
  const data = await response.json()
  
  // 2. Artefactos 1 y 2 vienen en el objeto proyecto (BD)
  const resumenEjecutivo = data.proyecto.PRO_resumen_ejecutivo
  const datosTransformados = transformarIJSON(data.proyecto.PRO_ijson)
  
  // 3. Artefactos 3-9 vienen en artefactos[] (R2)
  const artefactosR2 = data.artefactos
  
  // 4. Cargar contenido de cada artefacto R2
  const contenidoPestañas = {}
  
  for (const artefacto of artefactosR2) {
    const contenidoResponse = await fetch(
      `${VITE_API_BASE_URL}/api/pai/artefactos/${artefacto.id}/contenido`
    )
    const contenido = await contenidoResponse.text()
    contenidoPestañas[artefacto.tipo] = contenido
  }
  
  return {
    'resumen-ejecutivo': resumenEjecutivo,
    'datos-transformados': datosTransformados,
    ...contenidoPestañas,
  }
}
```

### 4.3 Visualización de Progreso

#### 4.3.1 Componente de Progreso

```typescript
interface ProgresoAnalisisProps {
  pasoActual: number
  totalPasos: number
  nombrePaso: string
  estado: 'ejecutando' | 'completado' | 'error'
}

export function ProgresoAnalisis({
  pasoActual,
  totalPasos,
  nombrePaso,
  estado,
}: ProgresoAnalisisProps) {
  const porcentaje = (pasoActual / totalPasos) * 100
  
  return (
    <div className="progreso-analisis">
      <div className="progreso-header">
        <span>
          {estado === 'ejecutando' && `Ejecutando paso ${pasoActual} de ${totalPasos}`}
          {estado === 'completado' && 'Análisis completado'}
          {estado === 'error' && 'Error en el análisis'}
        </span>
        <span>{nombrePaso}</span>
      </div>
      <div className="progreso-bar">
        <div 
          className="progreso-fill" 
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}
```

---

## 5. Manejo de Estados

### 5.1 Estados del Componente

```typescript
interface ProyectoDetalleState {
  // Datos del proyecto
  proyecto: Proyecto | null
  artefactos: Artefacto[]
  notas: Nota[]
  
  // Estados de UI
  cargando: boolean
  error: string | null
  
  // Estados del análisis
  analisisEnProgreso: boolean
  pasoActual: number
  progresoPasos: ProgresoPaso[]
  
  // Pestañas
  pestañaActiva: string
  contenidoPestañas: Record<string, string>
}

interface ProgresoPaso {
  numero: number
  nombre: string
  estado: 'pendiente' | 'ejecutando' | 'completado' | 'error'
}
```

### 5.2 Acciones Disponibles

```typescript
interface ProyectoDetalleActions {
  // Carga inicial
  cargarProyecto: (id: number) => Promise<void>
  
  // Análisis
  ejecutarAnalisis: () => Promise<void>
  cancelarAnalisis: () => void
  
  // Pestañas
  seleccionarPestaña: (key: string) => void
  cargarContenidoPestaña: (key: string) => Promise<void>
  
  // Notas
  crearNota: (nota: CrearNotaDTO) => Promise<void>
  editarNota: (notaId: number, contenido: string) => Promise<void>
  
  // Cambio de estado
  cambiarEstado: (estadoId: number, motivoId?: number) => Promise<void>
  
  // Eliminación
  eliminarProyecto: () => Promise<void>
}
```

### 5.3 Diagrama de Transiciones

```
┌─────────────────────────────────────────────────────────────────┐
│                    MÁQUINA DE ESTADOS - ANÁLISIS                 │
└─────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │    IDLE      │
     │ (reposo)     │
     └──────┬───────┘
            │
            │ Usuario pulsa "Ejecutar Análisis"
            ▼
     ┌──────────────┐
     │   LOADING    │◄─────────────────────────┐
     │ (ejecutando) │                          │
     └──────┬───────┘                          │
            │                                  │
            ├──────────────┬───────────────┐   │
            │              │               │   │
            ▼              ▼               ▼   │
     ┌────────────┐ ┌────────────┐ ┌──────────┐│
     │  SUCCESS   │ │   ERROR    │ │ CANCEL   ││
     │(completado)│ │  (fallido) │ │(cancelado)│
     └────────────┘ └─────┬──────┘ └──────────┘│
                          │                    │
                          │ Usuario reintenta  │
                          └────────────────────┘
```

---

## 6. Referencias

### 6.1 Textos i18n a Añadir

```typescript
// apps/frontend/src/i18n/es-ES.ts
export const esES = {
  // ... existentes
  pai: {
    // ... existentes
    analisis: {
      ejecutar: 'Ejecutar Análisis',
      en_progreso: 'Ejecutando paso {paso} de {total}: {nombre}',
      finalizado: 'Análisis Finalizado',
      reintentar: 'Reintentar Análisis',
      error: 'Error al ejecutar análisis: {mensaje}',
      confirmar_reejecucion: '¿Desea re-ejecutar el análisis? Se reemplazarán los resultados anteriores.',
    },
    pestanas: {
      resumen_ejecutivo: 'Resumen Ejecutivo',
      datos_transformados: 'Datos Transformados',
      activo_fisico: 'Activo Físico',
      activo_estrategico: 'Activo Estratégico',
      activo_financiero: 'Activo Financiero',
      activo_regulado: 'Activo Regulado',
      inversor: 'Inversor',
      emprendedor_operador: 'Emprendedor / Operador',
      propietario: 'Propietario',
    },
  },
}
```

### 6.2 Endpoints a Consumir

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/api/pai/proyectos/:id` | GET | Obtener detalles del proyecto |
| `/api/pai/proyectos/:id/analisis` | POST | Ejecutar análisis |
| `/api/pai/proyectos/:id/artefactos` | GET | Listar artefactos |
| `/api/pai/artefactos/:id/contenido` | GET | Obtener contenido MD de artefacto |

### 6.3 Documentos Relacionados

| Documento | Ruta |
|-----------|------|
| Concept Brief | `_doc-desarrollo/wf-analisis-inmobiliario/002-Concept-Brief-Workflow-Analisis-Inmobiliario-v2.md` |
| Especificación Técnica | `_doc-desarrollo/wf-analisis-inmobiliario/004-Especificacion-Tecnica-Workflow-Analisis.md` |
| Estados PAI | `_doc-desarrollo/Legado-archivo/proyecto-PIA/MapaRuta/Fase03/11_Estados_Motivos_PAI.md` |

---

**Fecha de creación:** 2026-03-29  
**Autor:** Agente Orquestador  
**Estado:** Pendiente de implementación  
**Próximo paso:** Implementar componentes frontend
