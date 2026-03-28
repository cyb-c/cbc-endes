/**
 * useMenu — obtiene el menú desde GET /api/menu
 *
 * Devuelve los módulos con sus funciones anidadas.
 *
 * Following R2: Cero hardcoding - usa variable de entorno VITE_API_BASE_URL
 * Following R14: Variables de entorno del frontend
 * 
 * Actualizado: 2026-03-28 - Fase P2: Mejora en manejo de errores y validación
 */

import { useEffect, useState, useCallback } from 'react';

interface MenuFuncion {
  id: number;
  nombre_interno: string;
  nombre_mostrar: string;
  url_path: string;
  icono: string;
  orden: number;
}

interface MenuItem {
  id: number;
  nombre_interno: string;
  nombre_mostrar: string;
  icono: string;
  orden: number;
  funciones: MenuFuncion[];
}

interface UseMenuResult {
  modules: MenuItem[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// Following R14: Variables de entorno del frontend - Validar presencia en runtime
const BACKEND_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

// Validación de URL en tiempo de desarrollo
if (!BACKEND_URL) {
  console.error('[useMenu] VITE_API_BASE_URL no está definido');
}

// Validación básica de formato de URL
function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Constantes para retry
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function fetchMenu(url: string): Promise<{ data: MenuItem[] }> {
  const response = await fetch(`${url}/api/menu`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Hook para obtener el menú dinámico desde el backend
 * 
 * Características:
 * - Validación de URL
 * - Retry automático con backoff exponencial
 * - Manejo graceful de errores
 *
 * @returns Objeto con módulos, estado de carga, error y función de retry
 */
export function useMenu(): UseMenuResult {
  const [modules, setModules] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Validar URL una vez al montar
  const isUrlValid = useCallback(() => {
    if (!BACKEND_URL) {
      return { valid: false, message: 'VITE_API_BASE_URL no está configurado' };
    }
    if (!isValidUrl(BACKEND_URL)) {
      return { valid: false, message: `URL inválida: ${BACKEND_URL}` };
    }
    return { valid: true, message: null };
  }, []);

  // Función de carga del menú
  const loadMenu = useCallback(async () => {
    const urlValidation = isUrlValid();
    if (!urlValidation.valid) {
      setError(urlValidation.message!);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data } = await fetchMenu(BACKEND_URL);
      setModules(data);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar el menú';
      
      // Retry logic con backoff exponencial
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
        console.warn(`[useMenu] Error al cargar menú. Reintentando en ${delay}ms... (${retryCount + 1}/${MAX_RETRIES})`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
      } else {
        // Máximo de reintentos alcanzado
        setError(`No se pudo cargar el menú después de ${MAX_RETRIES} intentos. Verifica tu conexión. (${errorMessage})`);
        console.error('[useMenu] Error después de múltiples reintentos:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, retryCount, isUrlValid]);

  // Carga inicial
  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Función de retry manual
  const retry = useCallback(() => {
    setRetryCount(0);
    loadMenu();
  }, [loadMenu]);

  return { modules, loading, error, retry };
};
