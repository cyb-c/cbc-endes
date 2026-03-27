/**
 * useMenu — obtiene el menú desde GET /api/menu
 *
 * Devuelve los módulos con sus funciones anidadas.
 *
 * Following R2: Cero hardcoding - usa variable de entorno VITE_API_BASE_URL
 * Following R14: Variables de entorno del frontend
 */

import { useEffect, useState } from 'react';

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
}

// Following R14: Variables de entorno del frontend - Validar presencia en runtime
const BACKEND_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

if (!BACKEND_URL) {
  console.error('VITE_API_BASE_URL no está definido');
}

async function fetchMenu(): Promise<{ data: MenuItem[] }> {
  const response = await fetch(`${BACKEND_URL}/api/menu`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Hook para obtener el menú dinámico desde el backend
 * 
 * @returns Objeto con módulos, estado de carga y error
 */
export function useMenu(): UseMenuResult {
  const [modules, setModules] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMenu()
      .then(({ data }) => {
        if (!cancelled) setModules(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar el menú');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { modules, loading, error };
}
