/**
 * Componente de modal de cambio de estado para PAI
 */

import { useState } from 'react';
import { paiApiClient } from '../../lib/pai-api';
import type { ProyectoPAI, CambiarEstadoRequest, EstadoProyecto } from '../../types/pai';
import { ESTADO_PROYECTO_LABELS } from '../../types/pai';

interface ModalCambioEstadoProps {
  proyecto: ProyectoPAI;
  onEstadoCambiado: (proyecto: ProyectoPAI) => void;
  onCancel: () => void;
}

export function ModalCambioEstado({ proyecto, onEstadoCambiado, onCancel }: ModalCambioEstadoProps) {
  const [nuevoEstado, setNuevoEstado] = useState(proyecto.estado);
  const [motivoId, setMotivoId] = useState<number | undefined>(undefined);
  const [motivoTexto, setMotivoTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estadosDisponibles: Array<{ value: string; label: string }> = [
    { value: 'borrador', label: ESTADO_PROYECTO_LABELS.borrador },
    { value: 'en_proceso', label: ESTADO_PROYECTO_LABELS.en_proceso },
    { value: 'completado', label: ESTADO_PROYECTO_LABELS.completado },
    { value: 'valorado', label: ESTADO_PROYECTO_LABELS.valorado },
    { value: 'descartado', label: ESTADO_PROYECTO_LABELS.descartado },
  ];

  const motivosValoracion = [
    { id: 1, nombre: 'Buen potencial de inversión' },
    { id: 2, nombre: 'Ubicación estratégica' },
    { id: 3, nombre: 'Precio atractivo' },
    { id: 4, nombre: 'Oportunidad única' },
    { id: 5, nombre: 'Alta demanda' },
    { id: 6, nombre: 'Buen estado general' },
    { id: 7, nombre: 'Otros' },
  ];

  const motivosDescarte = [
    { id: 1, nombre: 'Precio demasiado alto' },
    { id: 2, nombre: 'Ubicación no adecuada' },
    { id: 3, nombre: 'Estado deficiente' },
    { id: 4, nombre: 'Dimensiones insuficientes' },
    { id: 5, nombre: 'Problemas legales' },
    { id: 6, nombre: 'No cumple requisitos' },
    { id: 7, nombre: 'Otros' },
  ];

  const requiereMotivo = nuevoEstado === 'valorado' || nuevoEstado === 'descartado';
  const motivos = nuevoEstado === 'valorado' ? motivosValoracion : motivosDescarte;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requiereMotivo && !motivoId && !motivoTexto.trim()) {
      setError('Debes seleccionar un motivo o proporcionar una descripción');
      return;
    }

    setLoading(true);
    setError(null);

    const data: CambiarEstadoRequest = {
      nuevo_estado: nuevoEstado,
      motivo_id: motivoId,
      motivo_texto: motivoTexto.trim() || undefined,
    };

    const response = await paiApiClient.cambiarEstado(proyecto.id, data);

    setLoading(false);

    if (response.success && response.data?.proyecto) {
      onEstadoCambiado(response.data.proyecto);
    } else {
      setError(response.error?.message || 'Error al cambiar estado');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value as EstadoProyecto)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {estadosDisponibles.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          {requiereMotivo && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Motivo</label>
              
              <select
                value={motivoId || ''}
                onChange={(e) => setMotivoId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                disabled={loading}
              >
                <option value="">Seleccionar motivo...</option>
                {motivos.map((motivo) => (
                  <option key={motivo.id} value={motivo.id}>
                    {motivo.nombre}
                  </option>
                ))}
              </select>

              <div className="text-sm text-gray-500 mb-2">O proporciona una descripción:</div>
              
              <textarea
                value={motivoTexto}
                onChange={(e) => setMotivoTexto(e.target.value)}
                placeholder="Descripción del motivo..."
                className="w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          )}

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
              disabled={loading}
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
