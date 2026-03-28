/**
 * Hook personalizado para verificar si una nota es editable
 * P1.3 Corrección Importante: Editabilidad de notas basada en cambios de estado
 */

import { useState, useEffect, useCallback } from 'react';
import { paiApiClient } from '../lib/pai-api';

interface UseNotaEditableResult {
  esEditable: boolean;
  loading: boolean;
  razon?: string;
  verificar: (notaId: number, fechaCreacion: string) => Promise<void>;
}

/**
 * Hook para verificar si una nota es editable según los cambios de estado del proyecto
 * 
 * Una nota solo puede editarse mientras siga vigente el estado con el que fue creada.
 * Si el estado del proyecto cambió después de crear la nota, la nota ya no es editable.
 * 
 * @param proyectoId - ID del proyecto
 * @returns Resultado de la verificación de editabilidad
 */
export function useNotaEditable(proyectoId: number): UseNotaEditableResult {
  const [esEditable, setEsEditable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [razon, setRazon] = useState<string | undefined>(undefined);

  const verificar = useCallback(async (notaId: number, fechaCreacion: string) => {
    setLoading(true);
    setRazon(undefined);

    try {
      // Obtener eventos de cambio de estado
      const response = await paiApiClient.obtenerCambiosEstado(proyectoId);

      if (!response.success || !response.data?.eventos) {
        // Si no hay eventos, asumimos que es editable
        setEsEditable(true);
        return;
      }

      const notaFecha = new Date(fechaCreacion);
      
      // Buscar cambios de estado después de la creación de la nota
      const cambiosDespuesDeNota = response.data.eventos.filter(evento => {
        const eventoFecha = new Date(evento.created_at);
        return eventoFecha > notaFecha && evento.paso === 'cambiar_estado';
      });

      if (cambiosDespuesDeNota.length > 0) {
        // El estado cambió después de crear la nota
        setEsEditable(false);
        setRazon('El estado del proyecto ha cambiado desde la creación de esta nota');
      } else {
        // No hubo cambios de estado, la nota es editable
        setEsEditable(true);
      }
    } catch (error) {
      console.error('Error al verificar editabilidad de nota:', error);
      // En caso de error, permitimos la edición por defecto
      setEsEditable(true);
      setRazon('No se pudo verificar el estado del proyecto');
    } finally {
      setLoading(false);
    }
  }, [proyectoId]);

  return { esEditable, loading, razon, verificar };
}

/**
 * Hook simplificado para verificar editabilidad de una nota específica
 * 
 * @param proyectoId - ID del proyecto
 * @param notaId - ID de la nota
 * @param fechaCreacion - Fecha de creación de la nota (ISO string)
 * @returns boolean indicando si la nota es editable
 */
export function useEsNotaEditable(
  proyectoId: number,
  notaId: number,
  fechaCreacion: string
): boolean {
  const [esEditable, setEsEditable] = useState(true);
  const hook = useNotaEditable(proyectoId);

  useEffect(() => {
    hook.verificar(notaId, fechaCreacion);
  }, [notaId, fechaCreacion, hook]);

  useEffect(() => {
    setEsEditable(hook.esEditable);
  }, [hook.esEditable]);

  return esEditable;
}
