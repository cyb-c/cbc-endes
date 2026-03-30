/**
 * Componente de formulario de creación de nota para PAI
 * 
 * G06 Corrección: Agregar campos requeridos tipo_nota_id y autor
 *                 El backend espera { tipo_nota_id, autor, contenido }
 */

import { useState } from 'react';
import { paiApiClient } from '../../lib/pai-api';
import type { Nota } from '../../types/pai';

interface FormularioNotaProps {
  proyectoId: number;
  onGuardado: (nota: Nota) => void;
  onCancel: () => void;
}

// Tipos de nota disponibles (deben coincidir con DB PAI_VAL_valores para TIPO_NOTA)
const TIPOS_NOTA = [
  { id: 1, nombre: 'Comentario' },
  { id: 2, nombre: 'Valoración' },
  { id: 3, nombre: 'Decisión' },
  { id: 4, nombre: 'Corrección IA' },
] as const;

export function FormularioNota({ proyectoId, onGuardado, onCancel }: FormularioNotaProps) {
  const [contenido, setContenido] = useState('');
  const [tipoNota, setTipoNota] = useState<number>(1); // Default: Comentario
  const [autor, setAutor] = useState(''); // Nombre del autor
  const [asunto, setAsunto] = useState(''); // Asunto de la nota
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sprint 2 Día 6: Validaciones de longitud de campos
    if (!asunto.trim()) {
      setError('El asunto es obligatorio');
      return;
    }
    if (asunto.trim().length < 3) {
      setError('El asunto debe tener al menos 3 caracteres');
      return;
    }
    if (asunto.length > 200) {
      setError('El asunto no puede exceder los 200 caracteres');
      return;
    }

    // Validar autor
    if (!autor.trim()) {
      setError('El autor es obligatorio');
      return;
    }
    if (autor.trim().length < 2) {
      setError('El autor debe tener al menos 2 caracteres');
      return;
    }
    if (autor.length > 100) {
      setError('El autor no puede exceder los 100 caracteres');
      return;
    }

    // Validar contenido
    if (!contenido.trim()) {
      setError('El contenido es obligatorio');
      return;
    }
    if (contenido.trim().length < 10) {
      setError('El contenido debe tener al menos 10 caracteres');
      return;
    }
    if (contenido.length > 5000) {
      setError('El contenido no puede exceder los 5000 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    // Sprint 1: Enviar todos los campos requeridos incluyendo asunto
    const response = await paiApiClient.crearNota(proyectoId, {
      tipo_nota_id: tipoNota,
      autor: autor.trim(),
      asunto: asunto.trim(),
      contenido: contenido.trim()
    });

    setLoading(false);

    if (response.success && response.data?.nota) {
      onGuardado(response.data.nota);
    } else {
      setError(response.error?.message || 'Error al crear nota');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium mb-3">Nueva Nota</h3>

      {/* Campo: Tipo de Nota */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo de Nota <span className="text-red-500">*</span>
        </label>
        <select
          value={tipoNota}
          onChange={(e) => setTipoNota(parseInt(e.target.value))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          disabled={loading}
        >
          {TIPOS_NOTA.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Campo: Autor */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Autor <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          placeholder="Tu nombre o identificador"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          disabled={loading}
          required
        />
      </div>

      {/* Campo: Asunto */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Asunto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Asunto de la nota"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          disabled={loading}
          required
        />
      </div>

      {/* Campo: Contenido */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contenido <span className="text-red-500">*</span>
        </label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe tu nota aquí..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          disabled={loading}
          required
        />
      </div>

      {error && (
        <div className="mt-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="mt-3 flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !contenido.trim() || !autor.trim() || !asunto.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Nota'}
        </button>
      </div>
    </form>
  );
}
