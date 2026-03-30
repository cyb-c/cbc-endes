/**
 * Componente de modal de cambio de estado para PAI
 * G61, G62, G63: Corregido para obtener estados desde backend y usar estado_id numérico
 * G64: Añadido campo de motivo (obligatorio para todos los estados)
 */

import { useState, useEffect } from 'react';
import type { ProyectoPAI } from '../../types/pai';

interface EstadoDisponible {
  VAL_id: number;
  VAL_nombre: string;
  VAL_orden: number;
}

interface MotivoDisponible {
  VAL_id: number;
  VAL_nombre: string;
}

interface ModalCambioEstadoProps {
  proyecto: ProyectoPAI;
  onEstadoCambiado: (proyecto: ProyectoPAI) => void;
  onCancel: () => void;
}

export function ModalCambioEstado({ proyecto, onEstadoCambiado, onCancel }: ModalCambioEstadoProps) {
  const [nuevoEstadoId, setNuevoEstadoId] = useState<number>(proyecto.estado_id);
  const [motivoId, setMotivoId] = useState<number | ''>('');
  const [estadosDisponibles, setEstadosDisponibles] = useState<EstadoDisponible[]>([]);
  const [motivosDisponibles, setMotivosDisponibles] = useState<MotivoDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingEstados, setFetchingEstados] = useState(true);

  // Cargar estados disponibles desde backend
  useEffect(() => {
    const cargarEstados = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pai/estados-disponibles`);
        const data = await response.json();

        if (response.ok && data.estados) {
          setEstadosDisponibles(data.estados);
        } else {
          setError('Error al cargar estados disponibles');
        }
      } catch (err) {
        console.error('Error al cargar estados:', err);
        setError('Error de conexión al cargar estados');
      } finally {
        setFetchingEstados(false);
      }
    };

    cargarEstados();
  }, []);

  // Cargar motivos disponibles según el estado seleccionado
  useEffect(() => {
    const cargarMotivos = async () => {
      if (!nuevoEstadoId) return;

      try {
        // Determinar si es motivo de valoración o descarte según el estado
        // Estados 4-8 son de valoración, estado 9 es descarte
        const esDescartado = nuevoEstadoId === 9;
        const endpoint = esDescartado 
          ? '/api/pai/motivos-descarte' 
          : '/api/pai/motivos-valoracion';

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`);
        const data = await response.json();

        if (response.ok && data.motivos) {
          setMotivosDisponibles(data.motivos.map((m: any) => ({
            VAL_id: m.VAL_id,
            VAL_nombre: m.VAL_nombre,
          })));
        } else {
          setMotivosDisponibles([]);
        }
      } catch (err) {
        console.error('Error al cargar motivos:', err);
        setMotivosDisponibles([]);
      }
    };

    cargarMotivos();
  }, [nuevoEstadoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que se haya seleccionado un motivo
    if (!motivoId) {
      setError('Debe seleccionar un motivo para el cambio de estado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Enviar estado_id y motivo_id al backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pai/proyectos/${proyecto.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado_id: nuevoEstadoId,
          motivo_id: motivoId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.proyecto) {
        onEstadoCambiado(data.proyecto);
      } else {
        setError(data.error?.message || 'Error al cambiar estado');
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('Error de conexión al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay con z-index más alto para cubrir top bar
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold mb-4">Cambiar Estado del Proyecto</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nuevo Estado</label>
            {fetchingEstados ? (
              <div className="text-center py-3 text-gray-500">Cargando estados...</div>
            ) : (
              <select
                value={nuevoEstadoId}
                onChange={(e) => setNuevoEstadoId(parseInt(e.target.value))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {estadosDisponibles.map((estado) => (
                  <option key={estado.VAL_id} value={estado.VAL_id}>
                    {estado.VAL_nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Motivo <span className="text-red-500">*</span>
            </label>
            {motivosDisponibles.length === 0 ? (
              <div className="text-center py-3 text-gray-500">
                {nuevoEstadoId ? 'No hay motivos disponibles' : 'Seleccione un estado primero'}
              </div>
            ) : (
              <select
                value={motivoId}
                onChange={(e) => setMotivoId(parseInt(e.target.value))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading || motivosDisponibles.length === 0}
                required
              >
                <option value="">Seleccione un motivo</option>
                {motivosDisponibles.map((motivo) => (
                  <option key={motivo.VAL_id} value={motivo.VAL_id}>
                    {motivo.VAL_nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || fetchingEstados || motivosDisponibles.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Cambiando...' : 'Cambiar Estado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
