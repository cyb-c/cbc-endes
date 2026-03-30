/**
 * Componente de lista de notas para PAI
 * P1.3 Corrección Importante: Editabilidad de notas basada en cambios de estado
 */

import { useState, useEffect } from 'react';
import { paiApiClient } from '../../lib/pai-api';
import { useNotaEditable } from '../../hooks/useNotaEditable';
import { FormularioNota } from './FormularioNota';
import { FormularioEditarNota } from './FormularioEditarNota';
import type { Nota } from '../../types/pai';

interface ListaNotasProps {
  proyectoId: number;
  estadoProyecto: string;
  notasIniciales?: Nota[]; // Notas cargadas desde el padre
  onNotaEditada?: (nota: Nota) => void;
  onNotaEliminada?: (notaId: number) => void;
}

interface NotaEditable extends Nota {
  esEditable?: boolean;
  razonNoEditable?: string;
}

export function ListaNotas({ proyectoId, estadoProyecto, notasIniciales, onNotaEditada, onNotaEliminada }: ListaNotasProps) {
  const [notas, setNotas] = useState<NotaEditable[]>(notasIniciales?.map(n => ({ ...n, esEditable: true })) || []);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [notaEditando, setNotaEditando] = useState<Nota | null>(null);
  const [loading, setLoading] = useState(notasIniciales === undefined); // Solo loading si no hay notas iniciales
  const [error, setError] = useState<string | null>(null);

  // Hook para verificar editabilidad
  const { verificar: verificarEditabilidad } = useNotaEditable(proyectoId);

  const puedeAgregarNotas = estadoProyecto !== 'descartado';

  useEffect(() => {
    // Si hay notas iniciales, usarlas y no cargar
    if (notasIniciales !== undefined) {
      setNotas(notasIniciales.map(n => ({ ...n, esEditable: true })));
      setLoading(false);
      return;
    }
    
    // Si no hay notas iniciales, cargar desde API
    cargarNotas();
  }, [proyectoId, notasIniciales]);

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

  const handleNotaEditada = (notaActualizada: Nota) => {
    setNotas(notas.map(n => n.id === notaActualizada.id ? notaActualizada : n));
    setNotaEditando(null);
    onNotaEditada?.(notaActualizada);
  };

  const handleNotaEliminada = async (notaId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta nota?')) return;

    const response = await paiApiClient.eliminarNota(proyectoId, notaId);

    if (response.success) {
      setNotas(notas.filter(n => n.id !== notaId));
      onNotaEliminada?.(notaId);
    } else {
      // Sprint 2 Día 4: Manejar error 403 - nota no editable
      if (response.error?.code === 'NOTA_NO_EDITABLE') {
        alert(`No se puede eliminar: ${response.error.message}`);
      } else {
        alert(response.error?.message || 'Error al eliminar nota');
      }
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
                <div>
                  {/* Mostrar tipo y asunto */}
                  <div className="flex items-center gap-2 mb-1">
                    {nota.tipo && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {nota.tipo}
                      </span>
                    )}
                    {nota.asunto && (
                      <h3 className="font-medium text-lg">{nota.asunto}</h3>
                    )}
                    {!nota.tipo && !nota.asunto && (
                      <h3 className="font-medium text-lg">📝 Nota</h3>
                    )}
                  </div>
                  {/* Estado del proyecto al crear */}
                  {nota.estado_proyecto_creacion && (
                    <span className="text-xs text-gray-500 italic">
                      Estado al crear: {nota.estado_proyecto_creacion}
                    </span>
                  )}
                </div>
                {mostrarBotones ? (
                  <div className="space-x-2">
                    <button
                      onClick={() => setNotaEditando(nota)}
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
                Autor: {nota.autor} • Creado: {new Date(nota.fecha_creacion).toLocaleString('es-ES')}
                {nota.fecha_actualizacion && nota.fecha_actualizacion !== nota.fecha_creacion && (
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

      {puedeAgregarNotas && !mostrarFormulario && !notaEditando && (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Agregar Nota
        </button>
      )}

      {/* Formulario de creación */}
      {mostrarFormulario && (
        <div className="mt-4 pt-4 border-t">
          <FormularioNota
            proyectoId={proyectoId}
            onGuardado={handleNotaCreada}
            onCancel={() => setMostrarFormulario(false)}
          />
        </div>
      )}

      {/* Formulario de edición */}
      {notaEditando && (
        <div className="mt-4 pt-4 border-t">
          <FormularioEditarNota
            proyectoId={proyectoId}
            nota={notaEditando}
            onGuardado={handleNotaEditada}
            onCancel={() => setNotaEditando(null)}
          />
        </div>
      )}
    </div>
  );
}
