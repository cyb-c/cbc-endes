/**
 * Componente de formulario de edición de nota para PAI
 */

import { useState, useEffect } from 'react';
import { paiApiClient } from '../../lib/pai-api';
import type { Nota } from '../../types/pai';

interface FormularioEditarNotaProps {
  proyectoId: number;
  nota: Nota;
  onGuardado: (nota: Nota) => void;
  onCancel: () => void;
}

export function FormularioEditarNota({ proyectoId, nota, onGuardado, onCancel }: FormularioEditarNotaProps) {
  const [contenido, setContenido] = useState(nota.contenido);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContenido(nota.contenido);
  }, [nota.contenido]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contenido.trim()) {
      setError('El contenido de la nota es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);

    const response = await paiApiClient.editarNota(proyectoId, nota.id, { contenido });

    setLoading(false);

    if (response.success && response.data?.nota) {
      onGuardado(response.data.nota);
    } else {
      setError(response.error?.message || 'Error al actualizar nota');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium mb-3">Editar Nota</h3>

      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        placeholder="Escribe tu nota aquí..."
        className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
      />

      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}

      <div className="mt-3 flex justify-end space-x-2">
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
          disabled={loading || !contenido.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
