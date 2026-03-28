/**
 * Página de detalle de proyecto PAI
 */

import { useState, useEffect } from 'react';
import { useObtenerProyecto, useEjecutarAnalisis, useEliminarProyecto } from '../../hooks/use-pai';
import { ESTADO_PROYECTO_LABELS, ESTADO_PROYECTO_COLORS, type ProyectoPAI } from '../../types/pai';
import { ListaNotas } from '../../components/pai/ListaNotas';
import { ModalCambioEstado } from '../../components/pai/ModalCambioEstado';

interface DetalleProyectoProps {
  id: string;
}

export function DetalleProyecto({ id }: DetalleProyectoProps) {
  const [proyecto, setProyecto] = useState<ProyectoPAI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  const [pestañaActiva, setPestañaActiva] = useState('resumen');

  const { obtenerProyecto } = useObtenerProyecto();
  const { ejecutarAnalisis, loading: loadingEjecutar } = useEjecutarAnalisis();
  const { eliminarProyecto, loading: loadingEliminar } = useEliminarProyecto();

  useEffect(() => {
    cargarProyecto();
  }, [id]);

  const cargarProyecto = async () => {
    const data = await obtenerProyecto(parseInt(id));
    if (data) {
      setProyecto(data);
    }
    setLoading(false);
  };

  const handleEjecutarAnalisis = async () => {
    if (!proyecto) return;
    if (!confirm('¿Estás seguro de ejecutar el análisis completo de este proyecto?')) return;

    const resultado = await ejecutarAnalisis(proyecto.id);
    if (resultado) {
      alert('Análisis ejecutado correctamente');
      cargarProyecto();
    } else {
      alert('Error al ejecutar análisis');
    }
  };

  const handleEliminarProyecto = async () => {
    if (!proyecto) return;
    if (!confirm('¿Estás seguro de eliminar este proyecto y todos sus artefactos? Esta acción no se puede deshacer.')) return;

    const resultado = await eliminarProyecto(proyecto.id);
    if (resultado) {
      alert('Proyecto eliminado correctamente');
      window.location.href = '/proyectos';
    } else {
      alert('Error al eliminar proyecto');
    }
  };

  if (loading) return <div className="text-center py-8">Cargando proyecto...</div>;

  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  if (!proyecto) return <div className="text-center py-8 text-gray-500">Proyecto no encontrado</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Cabecera del PAI */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-2xl font-bold">{proyecto.titulo}</h1>
              <span className={`px-3 py-1 rounded text-sm ${ESTADO_PROYECTO_COLORS[proyecto.estado]}`}>
                {ESTADO_PROYECTO_LABELS[proyecto.estado]}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="mr-4">CII: <code className="bg-gray-100 px-2 py-1 rounded">{proyecto.cii}</code></span>
              <span>Creado: {new Date(proyecto.fecha_creacion).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setMostrarModalEstado(true)}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Cambiar Estado
            </button>
            {proyecto.estado !== 'en_proceso' && (
              <button
                onClick={handleEjecutarAnalisis}
                disabled={loadingEjecutar}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {loadingEjecutar ? 'Ejecutando...' : 'Ejecutar Análisis'}
              </button>
            )}
            <button
              onClick={handleEliminarProyecto}
              disabled={loadingEliminar}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
            >
              {loadingEliminar ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>

      {/* Datos básicos del inmueble */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Datos Básicos del Inmueble</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Portal</label>
            <div className="mt-1">
              {proyecto.datos_basicos?.portal_url ? (
                <a href={proyecto.datos_basicos.portal_url} target="_blank" className="text-blue-600 hover:underline">
                  {proyecto.datos_basicos.portal}
                </a>
              ) : (
                <span>{proyecto.datos_basicos?.portal || '-'}</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Operación</label>
            <div className="mt-1">{proyecto.datos_basicos?.operacion || '-'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Tipo de Inmueble</label>
            <div className="mt-1">{proyecto.datos_basicos?.tipo_inmueble || '-'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Precio</label>
            <div className="mt-1">{proyecto.datos_basicos?.precio || '-'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Superficie</label>
            <div className="mt-1">{proyecto.datos_basicos?.superficie || '-'}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Ubicación</label>
            <div className="mt-1">
              {proyecto.datos_basicos?.ciudad}
              {proyecto.datos_basicos?.provincia && `, ${proyecto.datos_basicos.provincia}`}
              {proyecto.datos_basicos?.pais && `, ${proyecto.datos_basicos.pais}`}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Fecha Alta</label>
            <div className="mt-1">{proyecto.datos_basicos?.fecha_alta ? new Date(proyecto.datos_basicos.fecha_alta).toLocaleDateString('es-ES') : '-'}</div>
          </div>
        </div>
      </div>

      {/* Resultados del análisis */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Resultados del Análisis</h2>
        
        {/* Pestañas */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            {['resumen', 'datos', 'fisico', 'estrategico', 'financiero', 'regulatorio', 'inversor', 'operador', 'propietario'].map((pestaña) => (
              <button
                key={pestaña}
                onClick={() => setPestañaActiva(pestaña)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  pestañaActiva === pestaña
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {pestaña.charAt(0).toUpperCase() + pestaña.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="mt-4">
          {pestañaActiva === 'resumen' && (
            <div className="prose max-w-none">
              <h3 className="text-lg font-medium mb-2">Resumen Ejecutivo</h3>
              <p className="text-gray-700">
                {proyecto.artefactos?.find(a => a.tipo === 'resumen_ejecutivo')?.ruta_r2 ? (
                  <em>El resumen ejecutivo se generó correctamente. Ver archivo en R2.</em>
                ) : (
                  <em>No se ha ejecutado el análisis aún.</em>
                )}
              </p>
            </div>
          )}
          {pestañaActiva !== 'resumen' && (
            <div className="text-center py-8 text-gray-500">
              Contenido de {pestañaActiva.charAt(0).toUpperCase() + pestañaActiva.slice(1)}
            </div>
          )}
        </div>
      </div>

      {/* Notas */}
      <ListaNotas
        proyectoId={proyecto.id}
        estadoProyecto={proyecto.estado}
      />

      {/* Modal de cambio de estado */}
      {mostrarModalEstado && (
        <ModalCambioEstado
          proyecto={proyecto}
          onEstadoCambiado={(proyectoActualizado) => {
            setProyecto(proyectoActualizado);
            setMostrarModalEstado(false);
          }}
          onCancel={() => setMostrarModalEstado(false)}
        />
      )}
    </div>
  );
}
