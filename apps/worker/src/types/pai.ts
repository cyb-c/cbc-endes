/**
 * Tipos TypeScript para Proyectos PAI
 * Proyectos de Análisis Inmobiliario
 */

// ============================================================================
// Tipos de Proyecto PAI
// ============================================================================

/**
 * Proyecto PAI completo
 */
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

/**
 * Datos básicos del inmueble
 */
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
  barrio: string
  direccion: string
}

/**
 * Artefacto de análisis
 */
export interface Artefacto {
  id: number
  proyecto_id: number
  tipo_artefacto_id: number
  tipo: string
  ruta_r2: string
  fecha_creacion: string
}

/**
 * Nota asociada a un proyecto
 */
export interface Nota {
  id: number
  proyecto_id: number
  tipo_nota_id: number
  tipo: string
  autor: string
  contenido: string
  fecha_creacion: string
}

// ============================================================================
// Tipos de Request/Response
// ============================================================================

/**
 * Request para crear proyecto
 */
export interface CrearProyectoRequest {
  ijson: string
}

/**
 * Response para crear proyecto
 */
export interface CrearProyectoResponse {
  proyecto: ProyectoPAI
}

/**
 * Response para obtener detalle de proyecto
 */
export interface DetalleProyectoResponse {
  proyecto: ProyectoPAI
  datos_basicos: DatosBasicosInmueble
  artefactos: Artefacto[]
  notas: Nota[]
}

/**
 * Response para listar proyectos
 */
export interface ListarProyectosResponse {
  proyectos: ProyectoPAI[]
  paginacion: {
    pagina_actual: number
    por_pagina: number
    total: number
    total_paginas: number
  }
}

/**
 * Request para ejecutar análisis
 */
export interface EjecutarAnalisisRequest {
  forzar_reejecucion?: boolean
}

/**
 * Response para ejecutar análisis
 */
export interface EjecutarAnalisisResponse {
  proyecto: {
    id: number
    cii: string
    estado_id: number
    estado: string
    fecha_ultima_actualizacion: string
  }
  artefactos_generados: Artefacto[]
}

/**
 * Request para crear nota
 */
export interface CrearNotaRequest {
  tipo_nota_id: number
  autor: string
  contenido: string
}

/**
 * Response para crear/editar nota
 */
export interface NotaResponse {
  nota: Nota
}

/**
 * Request para cambiar estado
 */
export interface CambiarEstadoRequest {
  estado_id: number
  motivo_valoracion_id?: number
  motivo_descarte_id?: number
}

/**
 * Response para cambiar estado
 */
export interface CambiarEstadoResponse {
  proyecto: ProyectoPAI
}

/**
 * Response para eliminar proyecto
 */
export interface EliminarProyectoResponse {
  mensaje: string
  proyecto_eliminado: {
    id: number
    cii: string
  }
}

/**
 * Response para obtener historial de ejecución
 */
export interface HistorialEjecucionResponse {
  eventos: PipelineEvent[]
}

/**
 * Evento de pipeline (del Starter Kit)
 */
export interface PipelineEvent {
  id: number
  entity_id: string
  paso: string
  nivel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  tipo_evento: string
  origen: string | null
  error_codigo: string | null
  detalle: string | null
  duracion_ms: number | null
  created_at: string
}

// ============================================================================
// Tipos de Validación
// ============================================================================

/**
 * Resultado de validación de IJSON
 */
export interface IJSONValidacion {
  valido: boolean
  error?: string
  ijson?: Record<string, unknown>
}

/**
 * Resultado de validación de estado para re-ejecución
 */
export interface ValidacionReejecucion {
  permitido: boolean
  razon?: string
}

// ============================================================================
// Tipos de Resultado de Operaciones
// ============================================================================

/**
 * Resultado de ejecución de análisis
 */
export interface AnalisisResultado {
  exito: boolean
  error_codigo?: string
  error_mensaje?: string
  artefactos_generados?: Artefacto[]
}

/**
 * Resultado de operación genérico
 */
export interface OperacionResultado {
  exito: boolean
  error_codigo?: string
  error_mensaje?: string
}
