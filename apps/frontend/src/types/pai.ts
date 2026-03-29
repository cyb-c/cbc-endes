/**
 * Tipos TypeScript para el módulo PAI (Proyectos de Análisis Inmobiliario)
 * Basado en la especificación de API del backend
 */

// ============================================================================
// Tipos de Datos Básicos
// ============================================================================

export interface DatosBasicosInmueble {
  portal: string;
  portal_url?: string;
  operacion: string;
  tipo_inmueble: string;
  precio: string;
  superficie: string;
  superficie_construida_m2?: string;
  ciudad: string;
  provincia?: string;
  pais?: string;
  barrio?: string;
  direccion?: string;
  fecha_alta: string;
  fecha_analisis?: string;
}

export interface Nota {
  id: number;
  proyecto_id: number;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_id?: number;
}

export interface Artefacto {
  id: number;
  proyecto_id: number;
  tipo: string;
  ruta_r2: string;
  url?: string;
  fecha_generacion: string;
}

export interface PipelineEvent {
  id: number;
  entidad_id: number;
  entidad_tipo: string;
  evento_tipo: string;
  paso: string;
  nivel: 'info' | 'warning' | 'error';
  mensaje: string;
  detalle?: string | Record<string, unknown>;
  created_at: string;
}

// ============================================================================
// Tipos de Proyecto PAI
// ============================================================================

/**
 * Estados de proyecto PAI - Alineados con backend (migración 005-pai-mvp-datos-iniciales.sql)
 * P0.1 Corrección Crítica: Alinear tipos con valores reales de PAI_VAL_valores
 */
export type EstadoProyecto =
  // Estados automáticos
  | 'creado'
  | 'procesando_analisis'
  | 'analisis_con_error'
  | 'analisis_finalizado'
  // Estados manuales
  | 'evaluando_viabilidad'
  | 'evaluando_plan_negocio'
  | 'seguimiento_comercial'
  | 'descartado';

export interface ProyectoPAI {
  id: number;
  cii: string;
  titulo: string;
  estado: EstadoProyecto;
  estado_id: number;
  ijson?: string;
  resumen_ejecutivo?: string;
  fecha_analisis?: string | null;
  datos_basicos: DatosBasicosInmueble;
  fecha_creacion: string;
  fecha_actualizacion?: string;
  notas?: Nota[];
  artefactos?: Artefacto[];
  pipeline_eventos?: PipelineEvent[];
}

// ============================================================================
// Tipos de Request
// ============================================================================

export interface CrearProyectoRequest {
  ijson: string;
}

export interface ListarProyectosParams {
  titulo?: string;
  estado?: string;
  tipo_inmueble?: string;
  ciudad?: string;
  page?: number;
  limit?: number;
}

export interface CambiarEstadoRequest {
  nuevo_estado: string;
  motivo_id?: number;
  motivo_texto?: string;
}

export interface CrearNotaRequest {
  tipo_nota_id: number;
  autor: string;
  contenido: string;
}

export interface EditarNotaRequest {
  contenido: string;
}

// ============================================================================
// Tipos de Response
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ListarProyectosResponse {
  proyectos: ProyectoPAI[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ObtenerProyectoResponse {
  proyecto: ProyectoPAI;
}

export interface CrearProyectoResponse {
  proyecto: ProyectoPAI;
}

export interface EjecutarAnalisisResponse {
  proyecto: ProyectoPAI;
  artefactos_generados: Artefacto[];
}

export interface ObtenerArtefactosResponse {
  artefactos: Artefacto[];
}

export interface CrearNotaResponse {
  nota: Nota;
}

export interface EditarNotaResponse {
  nota: Nota;
}

export interface CambiarEstadoResponse {
  proyecto: ProyectoPAI;
}

export interface ObtenerHistorialResponse {
  eventos: PipelineEvent[];
}

// ============================================================================
// Tipos de Motivos
// ============================================================================

export interface Motivo {
  id: number;
  codigo: string;
  nombre: string;
  tipo: 'valoracion' | 'descarte';
  activo: boolean;
}

// ============================================================================
// Utilidades de Tipo
// ============================================================================

export type EstadoProyectoBadgeColor = {
  [K in EstadoProyecto]: string;
};

/**
 * Colores para badges de estado - P0.1 Corrección Crítica
 * Alineados con los nuevos estados del backend
 */
export const ESTADO_PROYECTO_COLORS: EstadoProyectoBadgeColor = {
  // Estados automáticos
  creado: 'bg-gray-100 text-gray-800',
  procesando_analisis: 'bg-yellow-100 text-yellow-800',
  analisis_con_error: 'bg-red-100 text-red-800',
  analisis_finalizado: 'bg-green-100 text-green-800',
  // Estados manuales
  evaluando_viabilidad: 'bg-blue-100 text-blue-800',
  evaluando_plan_negocio: 'bg-purple-100 text-purple-800',
  seguimiento_comercial: 'bg-indigo-100 text-indigo-800',
  descartado: 'bg-red-100 text-red-800',
};

/**
 * Labels para estados - P0.1 Corrección Crítica
 * Alineados con los nuevos estados del backend
 */
export const ESTADO_PROYECTO_LABELS: Record<EstadoProyecto, string> = {
  // Estados automáticos
  creado: 'Creado',
  procesando_analisis: 'En Análisis',
  analisis_con_error: 'Análisis con Error',
  analisis_finalizado: 'Análisis Finalizado',
  // Estados manuales
  evaluando_viabilidad: 'Evaluando Viabilidad',
  evaluando_plan_negocio: 'Evaluando Plan de Negocio',
  seguimiento_comercial: 'Seguimiento Comercial',
  descartado: 'Descartado',
};
