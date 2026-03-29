/**
 * Página de detalle de proyecto PAI
 * G51, G52, G61: Corregido mapeo, formatos, renderizado y lógica de estado
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useObtenerProyecto, useEjecutarAnalisis, useEliminarProyecto } from '../../hooks/use-pai';
import { ESTADO_PROYECTO_LABELS, ESTADO_PROYECTO_COLORS, type ProyectoPAI } from '../../types/pai';
import { ListaNotas } from '../../components/pai/ListaNotas';
import { ModalCambioEstado } from '../../components/pai/ModalCambioEstado';
import { VisualizadorMarkdown } from './VisualizadorMarkdown';

// G51-8: Función para formatear precio en formato español
function formatPrecio(precio: string): string {
  if (!precio) return '-';
  
  // Eliminar cualquier símbolo de moneda existente
  const cleanPrice = precio.replace(/[^0-9.,]/g, '');
  
  // Intentar parsear como número
  const num = parseFloat(cleanPrice.replace(',', '.'));
  
  if (isNaN(num)) return precio;
  
  // Formatear con separador de miles (.) y decimales (,)
  const formatted = num.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${formatted} €`;
}

export function DetalleProyecto() {
  const { id } = useParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoPAI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  const [pestañaActiva, setPestañaActiva] = useState<'resumen' | 'datos' | 'otros'>('resumen');

  const { obtenerProyecto } = useObtenerProyecto();
  const { ejecutarAnalisis, loading: loadingEjecutar } = useEjecutarAnalisis();
  const { eliminarProyecto, loading: loadingEliminar } = useEliminarProyecto();

  useEffect(() => {
    cargarProyecto();
  }, [id]);

  const cargarProyecto = async () => {
    if (!id) return;
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

  // G61: El botón debe estar deshabilitado si estado_id <= 3
  const botonCambiarEstadoDeshabilitado = proyecto ? proyecto.estado_id <= 3 : true;

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
              {/* G51-1: Fecha de alta formateada como DD/MM/YYYY */}
              <span className="mr-4">CII: <code className="bg-gray-100 px-2 py-1 rounded">{proyecto.cii}</code></span>
              <span>Fecha Alta: {proyecto.fecha_creacion ? new Date(proyecto.fecha_creacion).toLocaleDateString('es-ES') : '-'}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            {/* G61: Botón deshabilitado si estado_id <= 3 */}
            <button
              onClick={() => setMostrarModalEstado(true)}
              disabled={botonCambiarEstadoDeshabilitado}
              className={`px-3 py-2 border rounded-lg text-sm ${
                botonCambiarEstadoDeshabilitado 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-gray-50'
              }`}
              title={botonCambiarEstadoDeshabilitado ? 'El cambio de estado no está disponible hasta que el análisis esté finalizado' : ''}
            >
              Cambiar Estado
            </button>
            {proyecto.estado !== 'procesando_analisis' && (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* G51-2: Portal con enlace navegable */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Portal</label>
            <div className="mt-1">
              {proyecto.datos_basicos?.portal_url ? (
                <a 
                  href={proyecto.datos_basicos.portal_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {proyecto.datos_basicos.portal}
                </a>
              ) : (
                <span>{proyecto.datos_basicos?.portal || '-'}</span>
              )}
            </div>
          </div>
          
          {/* G51-5: Operación informada correctamente */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Operación</label>
            <div className="mt-1 capitalize">{proyecto.datos_basicos?.operacion || '-'}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600">Tipo de Inmueble</label>
            <div className="mt-1 capitalize">{proyecto.datos_basicos?.tipo_inmueble || '-'}</div>
          </div>
          
          {/* G51-8: Precio formateado en formato español */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Precio</label>
            <div className="mt-1 font-medium">{formatPrecio(proyecto.datos_basicos?.precio || '')}</div>
          </div>
          
          {/* G51-3: Superficie desde PRO_superficie_construida_m2 */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Superficie Construida</label>
            <div className="mt-1">{proyecto.datos_basicos?.superficie_construida_m2 ? `${proyecto.datos_basicos.superficie_construida_m2} m²` : '-'}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600">Ciudad</label>
            <div className="mt-1">{proyecto.datos_basicos?.ciudad || '-'}</div>
          </div>
          
          {/* G51-9: Campo "Barrio" agregado */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Barrio/Distrito</label>
            <div className="mt-1">{proyecto.datos_basicos?.barrio || '-'}</div>
          </div>
          
          {/* G51-4: Label cambiado de "Fecha" a "Dirección" */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Dirección</label>
            <div className="mt-1">{proyecto.datos_basicos?.direccion || '-'}</div>
          </div>
          
          {/* G51-1: Fecha de alta formateada */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Fecha de Alta</label>
            <div className="mt-1">{proyecto.fecha_creacion ? new Date(proyecto.fecha_creacion).toLocaleDateString('es-ES') : '-'}</div>
          </div>
        </div>
      </div>

      {/* G52: Pestañas de Resultados del Análisis */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Resultados del Análisis</h2>
        
        {/* Navegación de pestañas */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setPestañaActiva('resumen')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                pestañaActiva === 'resumen'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen Ejecutivo
            </button>
            {/* G52: Pestaña "Datos Transformados" agregada */}
            <button
              onClick={() => setPestañaActiva('datos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                pestañaActiva === 'datos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Datos Transformados
            </button>
            <button
              onClick={() => setPestañaActiva('otros')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                pestañaActiva === 'otros'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Otros Artefactos
            </button>
          </nav>
        </div>

        {/* Contenido de pestañas */}
        <div className="min-h-[400px]">
          {/* G51-6, G51-7: Pestaña "Resumen Ejecutivo" con contenido Markdown renderizado */}
          {pestañaActiva === 'resumen' && (
            <div>
              {proyecto.resumen_ejecutivo ? (
                <VisualizadorMarkdown contenido={proyecto.resumen_ejecutivo} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No hay resumen ejecutivo disponible. Ejecuta el análisis para generarlo.
                </div>
              )}
            </div>
          )}
          
          {/* G52: Pestaña "Datos Transformados" con JSON embellecido */}
          {pestañaActiva === 'datos' && (
            <div>
              {proyecto.ijson ? (
                <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-[600px]">
                  <pre className="text-sm font-mono text-gray-800">
                    {JSON.stringify(JSON.parse(proyecto.ijson), null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No hay datos transformados disponibles. El IJSON no está disponible para este proyecto.
                </div>
              )}
            </div>
          )}
          
          {/* Otros artefactos */}
          {pestañaActiva === 'otros' && (
            <div className="text-center py-12 text-gray-500">
              Otros artefactos del análisis. Esta funcionalidad está en desarrollo.
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
