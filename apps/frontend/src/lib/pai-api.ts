/**
 * Cliente API para el módulo PAI (Proyectos de Análisis Inmobiliario)
 * Basado en la especificación de API del backend
 */

import type {
  ApiResponse,
  ApiError,
  CrearProyectoRequest,
  CrearProyectoResponse,
  ListarProyectosParams,
  ListarProyectosResponse,
  ObtenerProyectoResponse,
  EjecutarAnalisisResponse,
  ObtenerArtefactosResponse,
  CrearNotaRequest,
  CrearNotaResponse,
  EditarNotaRequest,
  EditarNotaResponse,
  CambiarEstadoRequest,
  CambiarEstadoResponse,
  ObtenerHistorialResponse,
} from '../types/pai';

// ============================================================================
// Configuración
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

// ============================================================================
// Interfaz del Cliente API
// ============================================================================

class PaiApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Método privado para hacer solicitudes HTTP
   */
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

  // ==========================================================================
  // Métodos HTTP genéricos
  // ==========================================================================

  private get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  private post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // ==========================================================================
  // Endpoints de Proyectos
  // ==========================================================================

  /**
   * Crear un nuevo proyecto PAI
   * POST /api/pai/proyectos
   */
  async crearProyecto(data: CrearProyectoRequest): Promise<ApiResponse<CrearProyectoResponse>> {
    return this.post<CrearProyectoResponse>('/api/pai/proyectos', data);
  }

  /**
   * Obtener detalles de un proyecto
   * GET /api/pai/proyectos/:id
   */
  async obtenerProyecto(id: number): Promise<ApiResponse<ObtenerProyectoResponse>> {
    return this.get<ObtenerProyectoResponse>(`/api/pai/proyectos/${id}`);
  }

  /**
   * Listar proyectos con filtros y paginación
   * GET /api/pai/proyectos
   */
  async listarProyectos(params?: ListarProyectosParams): Promise<ApiResponse<ListarProyectosResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.tipo_inmueble) queryParams.append('tipo_inmueble', params.tipo_inmueble);
    if (params?.ciudad) queryParams.append('ciudad', params.ciudad);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    return this.get<ListarProyectosResponse>(
      `/api/pai/proyectos${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Ejecutar análisis completo de un proyecto
   * POST /api/pai/proyectos/:id/analisis
   */
  async ejecutarAnalisis(id: number): Promise<ApiResponse<EjecutarAnalisisResponse>> {
    return this.post<EjecutarAnalisisResponse>(`/api/pai/proyectos/${id}/analisis`);
  }

  /**
   * Obtener artefactos de un proyecto
   * GET /api/pai/proyectos/:id/artefactos
   */
  async obtenerArtefactos(id: number): Promise<ApiResponse<ObtenerArtefactosResponse>> {
    return this.get<ObtenerArtefactosResponse>(`/api/pai/proyectos/${id}/artefactos`);
  }

  /**
   * Cambiar estado manual de un proyecto
   * PUT /api/pai/proyectos/:id/estado
   */
  async cambiarEstado(id: number, data: CambiarEstadoRequest): Promise<ApiResponse<CambiarEstadoResponse>> {
    return this.put<CambiarEstadoResponse>(`/api/pai/proyectos/${id}/estado`, data);
  }

  /**
   * Eliminar un proyecto
   * DELETE /api/pai/proyectos/:id
   */
  async eliminarProyecto(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.delete<{ message: string }>(`/api/pai/proyectos/${id}`);
  }

  /**
   * Obtener historial de ejecuciones de un proyecto
   * GET /api/pai/proyectos/:id/pipeline
   * P1.3 Mejora: Método para obtener pipeline y verificar editabilidad de notas
   */
  async obtenerHistorial(id: number): Promise<ApiResponse<ObtenerHistorialResponse>> {
    return this.get<ObtenerHistorialResponse>(`/api/pai/proyectos/${id}/pipeline`);
  }

  /**
   * Obtener eventos de cambio de estado de un proyecto
   * GET /api/pai/proyectos/:id/pipeline?tipo=cambio_estado
   * P1.3 Mejora: Método específico para verificar editabilidad de notas
   */
  async obtenerCambiosEstado(id: number): Promise<ApiResponse<ObtenerHistorialResponse>> {
    return this.get<ObtenerHistorialResponse>(`/api/pai/proyectos/${id}/pipeline?tipo=cambio_estado`);
  }

  // ==========================================================================
  // Endpoints de Notas
  // ==========================================================================

  /**
   * Crear una nota para un proyecto
   * POST /api/pai/proyectos/:id/notas
   */
  async crearNota(id: number, data: CrearNotaRequest): Promise<ApiResponse<CrearNotaResponse>> {
    return this.post<CrearNotaResponse>(`/api/pai/proyectos/${id}/notas`, data);
  }

  /**
   * Editar una nota existente
   * PUT /api/pai/proyectos/:id/notas/:notaId
   */
  async editarNota(id: number, notaId: number, data: EditarNotaRequest): Promise<ApiResponse<EditarNotaResponse>> {
    return this.put<EditarNotaResponse>(`/api/pai/proyectos/${id}/notas/${notaId}`, data);
  }

  /**
   * Eliminar una nota
   * DELETE /api/pai/proyectos/:id/notas/:notaId
   */
  async eliminarNota(id: number, notaId: number): Promise<ApiResponse<{ message: string }>> {
    return this.delete<{ message: string }>(`/api/pai/proyectos/${id}/notas/${notaId}`);
  }
}

// ============================================================================
// Instancia del cliente
// ============================================================================

export const paiApiClient = new PaiApiClient(API_BASE_URL);

// ============================================================================
// Utilidades
// ============================================================================

/**
 * Función helper para obtener mensajes de error amigables
 */
export function getErrorMessage(error: ApiError | undefined): string {
  if (!error) return 'Error desconocido';

  switch (error.code) {
    case 'VALIDATION_ERROR':
      return error.message || 'Error de validación';
    case 'NOT_FOUND':
      return 'Recurso no encontrado';
    case 'CONFLICT':
      return error.message || 'Conflicto de datos';
    case 'INTERNAL_ERROR':
      return 'Error interno del servidor';
    case 'NETWORK_ERROR':
      return 'Error de conexión';
    default:
      return error.message || 'Error desconocido';
  }
}
