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
  ciudad: string;
  provincia?: string;
  pais?: string;
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

export type EstadoProyecto =
  | 'borrador'
  | 'en_proceso'
  | 'completado'
  | 'valorado'
  | 'descartado'
  | 'error';

export interface ProyectoPAI {
  id: number;
  cii: string;
  titulo: string;
  estado: EstadoProyecto;
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

export const ESTADO_PROYECTO_COLORS: EstadoProyectoBadgeColor = {
  borrador: 'bg-gray-100 text-gray-800',
  en_proceso: 'bg-yellow-100 text-yellow-800',
  completado: 'bg-green-100 text-green-800',
  valorado: 'bg-blue-100 text-blue-800',
  descartado: 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800',
};

export const ESTADO_PROYECTO_LABELS: Record<EstadoProyecto, string> = {
  borrador: 'Borrador',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  valorado: 'Valorado',
  descartado: 'Descartado',
  error: 'Error',
};
