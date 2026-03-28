/**
 * Hooks personalizados para el módulo PAI (Proyectos de Análisis Inmobiliario)
 */

import { useState, useCallback, useEffect } from 'react';
import { paiApiClient, getErrorMessage } from '../lib/pai-api';
import type {
  ProyectoPAI,
  CrearProyectoRequest,
  ListarProyectosParams,
  ListarProyectosResponse,
  CrearNotaRequest,
  EditarNotaRequest,
  CambiarEstadoRequest,
  Artefacto,
  PipelineEvent,
} from '../types/pai';

// ============================================================================
// Hook: Crear Proyecto
// ============================================================================

export function useCrearProyecto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearProyecto = useCallback(async (data: CrearProyectoRequest) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.crearProyecto(data);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return null;
    }

    return response.data?.proyecto || null;
  }, []);

  return { crearProyecto, loading, error };
}

// ============================================================================
// Hook: Obtener Proyecto
// ============================================================================

export function useObtenerProyecto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerProyecto = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.obtenerProyecto(id);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return null;
    }

    return response.data?.proyecto || null;
  }, []);

  return { obtenerProyecto, loading, error };
}

// ============================================================================
// Hook: Listar Proyectos
// ============================================================================

export function useListarProyectos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ListarProyectosResponse | null>(null);

  const listarProyectos = useCallback(async (params?: ListarProyectosParams) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.listarProyectos(params);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return null;
    }

    setData(response.data || null);
    return response.data || null;
  }, []);

  return { listarProyectos, loading, error, data };
}

// ============================================================================
// Hook: Ejecutar Análisis
// ============================================================================

export function useEjecutarAnalisis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ejecutarAnalisis = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.ejecutarAnalisis(id);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return null;
    }

    return response.data || null;
  }, []);

  return { ejecutarAnalisis, loading, error };
}

// ============================================================================
// Hook: Obtener Artefactos
// ============================================================================

export function useObtenerArtefactos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artefactos, setArtefactos] = useState<Artefacto[]>([]);

  const obtenerArtefactos = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.obtenerArtefactos(id);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return;
    }

    setArtefactos(response.data?.artefactos || []);
  }, []);

  return { obtenerArtefactos, loading, error, artefactos };
}

// ============================================================================
// Hook: Cambiar Estado
// ============================================================================

export function useCambiarEstado() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cambiarEstado = useCallback(async (id: number, data: CambiarEstadoRequest) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.cambiarEstado(id, data);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return null;
    }

    return response.data?.proyecto || null;
  }, []);

  return { cambiarEstado, loading, error };
}

// ============================================================================
// Hook: Eliminar Proyecto
// ============================================================================

export function useEliminarProyecto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eliminarProyecto = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.eliminarProyecto(id);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return false;
    }

    return true;
  }, []);

  return { eliminarProyecto, loading, error };
}

// ============================================================================
// Hook: Obtener Historial
// ============================================================================

export function useObtenerHistorial() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventos, setEventos] = useState<PipelineEvent[]>([]);

  const obtenerHistorial = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.obtenerHistorial(id);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return;
    }

    setEventos(response.data?.eventos || []);
  }, []);

  return { obtenerHistorial, loading, error, eventos };
}

// ============================================================================
// Hook: Crear Nota
// ============================================================================

export function useCrearNota() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearNota = useCallback(async (proyectoId: number, data: CrearNotaRequest) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.crearNota(proyectoId, data);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return null;
    }

    return response.data?.nota || null;
  }, []);

  return { crearNota, loading, error };
}

// ============================================================================
// Hook: Editar Nota
// ============================================================================

export function useEditarNota() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editarNota = useCallback(async (proyectoId: number, notaId: number, data: EditarNotaRequest) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.editarNota(proyectoId, notaId, data);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return null;
    }

    return response.data?.nota || null;
  }, []);

  return { editarNota, loading, error };
}

// ============================================================================
// Hook: Eliminar Nota
// ============================================================================

export function useEliminarNota() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eliminarNota = useCallback(async (proyectoId: number, notaId: number) => {
    setLoading(true);
    setError(null);

    const response = await paiApiClient.eliminarNota(proyectoId, notaId);

    setLoading(false);

    if (!response.success) {
      setError(getErrorMessage(response.error));
      return false;
    }

    return true;
  }, []);

  return { eliminarNota, loading, error };
}

// ============================================================================
// Hook: Cargar Proyecto con Notas
// ============================================================================

export function useProyectoConNotas(proyectoId: number | null) {
  const [proyecto, setProyecto] = useState<ProyectoPAI | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!proyectoId) return;

    const cargarProyecto = async () => {
      setLoading(true);
      setError(null);

      const response = await paiApiClient.obtenerProyecto(proyectoId);

      setLoading(false);

      if (!response.success) {
        setError(getErrorMessage(response.error));
        return;
      }

      setProyecto(response.data?.proyecto || null);
    };

    cargarProyecto();
  }, [proyectoId]);

  return { proyecto, loading, error, refetch: () => proyectoId && paiApiClient.obtenerProyecto(proyectoId) };
}

// ============================================================================
// Hook: Debounce
// ============================================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

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
