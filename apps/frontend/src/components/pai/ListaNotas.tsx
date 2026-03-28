/**
 * Componente de lista de notas para PAI
 * P1.3 Corrección Importante: Editabilidad de notas basada en cambios de estado
 */

import { useState, useEffect } from 'react';
import { paiApiClient } from '../../lib/pai-api';
import { useNotaEditable } from '../../hooks/useNotaEditable';
import { FormularioNota } from './FormularioNota';
import type { Nota } from '../../types/pai';

interface ListaNotasProps {
  proyectoId: number;
  estadoProyecto: string;
  onNotaEditada?: (nota: Nota) => void;
  onNotaEliminada?: (notaId: number) => void;
}

interface NotaEditable extends Nota {
  esEditable?: boolean;
  razonNoEditable?: string;
}

export function ListaNotas({ proyectoId, estadoProyecto, onNotaEditada, onNotaEliminada }: ListaNotasProps) {
  const [notas, setNotas] = useState<NotaEditable[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para verificar editabilidad
  const { verificar: verificarEditabilidad } = useNotaEditable(proyectoId);

  const puedeAgregarNotas = estadoProyecto !== 'descartado';

  useEffect(() => {
    cargarNotas();
  }, [proyectoId]);

  const cargarNotas = async () => {
    setLoading(true);
    setError(null);

    // Obtener proyecto completo con notas
    const response = await paiApiClient.obtenerProyecto(proyectoId);

    setLoading(false);

    if (response.success && response.data?.proyecto) {
      const notasConEditabilidad = await Promise.all(
        (response.data.proyecto.notas || []).map(async (nota: Nota) => {
          // Verificar editabilidad de cada nota
          await verificarEditabilidad(nota.id, nota.fecha_creacion);
          return { ...nota, esEditable: true }; // Se actualizará con el hook
        })
      );
      setNotas(notasConEditabilidad);
    } else {
      setError(response.error?.message || 'Error al cargar notas');
    }
  };

  const handleNotaCreada = (nuevaNota: Nota) => {
    setNotas([nuevaNota, ...notas]);
    setMostrarFormulario(false);
    onNotaEditada?.(nuevaNota);
  };

  const handleNotaEliminada = async (notaId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta nota?')) return;

    const response = await paiApiClient.eliminarNota(proyectoId, notaId);

    if (response.success) {
      setNotas(notas.filter(n => n.id !== notaId));
      onNotaEliminada?.(notaId);
    } else {
      alert(response.error?.message || 'Error al eliminar nota');
    }
  };

  if (loading) return <div className="text-center py-4">Cargando notas...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Notas del Proyecto</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-800">
          {error}
        </div>
      )}

      {notas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay notas aún.
        </div>
      ) : (
        <div className="space-y-4">
          {notas.map((nota) => {
            const mostrarBotones = estadoProyecto !== 'descartado' && nota.esEditable !== false;

            return (
            <div
              key={nota.id}
              className={`border rounded-lg p-4 transition-colors ${
                nota.esEditable === false ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">📝 Nota</h3>
                {mostrarBotones ? (
                  <div className="space-x-2">
                    <button
                      onClick={() => setMostrarFormulario(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleNotaEliminada(nota.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                ) : nota.razonNoEditable ? (
                  <span className="text-xs text-gray-500 italic" title={nota.razonNoEditable}>
                    🔒 No editable
                  </span>
                ) : null}
              </div>

              <p className="text-gray-700 whitespace-pre-wrap mb-3">
                {nota.contenido}
              </p>

              <div className="text-sm text-gray-500">
                Creado: {new Date(nota.fecha_creacion).toLocaleString('es-ES')}
                {nota.fecha_actualizacion !== nota.fecha_creacion && (
                  <span className="ml-2">
                    • Actualizado: {new Date(nota.fecha_actualizacion).toLocaleString('es-ES')}
                  </span>
                )}
                {nota.esEditable === false && nota.razonNoEditable && (
                  <div className="mt-1 text-red-500 text-xs">
                    ⚠️ {nota.razonNoEditable}
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}

      {puedeAgregarNotas && !mostrarFormulario && (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Agregar Nota
        </button>
      )}

      {mostrarFormulario && (
        <div className="mt-4 pt-4 border-t">
          <FormularioNota
            proyectoId={proyectoId}
            onGuardado={handleNotaCreada}
            onCancel={() => setMostrarFormulario(false)}
          />
        </div>
      )}
    </div>
  );
}
