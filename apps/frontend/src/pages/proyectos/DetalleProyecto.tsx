/**
 * Página de detalle de proyecto PAI
 * G51, G52, G61: Corregido mapeo, formatos, renderizado y lógica de estado
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useObtenerProyecto, useEjecutarAnalisis, useEliminarProyecto } from '../../hooks/use-pai';
import { ESTADO_PROYECTO_LABELS, ESTADO_PROYECTO_COLORS, type ProyectoPAI, type Nota } from '../../types/pai';
import { ListaNotas } from '../../components/pai/ListaNotas';
import { ModalCambioEstado } from '../../components/pai/ModalCambioEstado';
import { VisualizadorMarkdown } from './VisualizadorMarkdown';
import { BotonEjecutarAnalisis } from '../../components/pai/BotonEjecutarAnalisis';
import { t } from '../../i18n';

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

// G51-10: Función para formatear fecha como dd/mm/yyyy hh:mm
function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return '-';
  
  try {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

export function DetalleProyecto() {
  const { id } = useParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoPAI | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]); // ← Notas separadas
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  
  // Sprint 3 Corrección: 9 pestañas (resumen, datos, 7 análisis)
  const [pestañaActiva, setPestañaActiva] = useState<string>('resumen');
  const [contenidoAnalisis, setContenidoAnalisis] = useState<Record<string, string>>({});
  const [loadingAnalisis, setLoadingAnalisis] = useState<Record<string, boolean>>({});

  const { obtenerProyecto } = useObtenerProyecto();
  const { ejecutarAnalisis } = useEjecutarAnalisis();
  const { eliminarProyecto, loading: loadingEliminar } = useEliminarProyecto();

  // Tipos de análisis disponibles
  const tiposAnalisis = [
    { key: 'analisis-fisico', label: 'Análisis Físico' },
    { key: 'analisis-estrategico', label: 'Análisis Estratégico' },
    { key: 'analisis-financiero', label: 'Análisis Financiero' },
    { key: 'analisis-regulatorio', label: 'Análisis Regulatorio' },
    { key: 'inversor', label: 'Lectura Inversor' },
    { key: 'emprendedor-operador', label: 'Lectura Operador' },
    { key: 'propietario', label: 'Lectura Propietario' },
  ];

  useEffect(() => {
    cargarProyecto();
  }, [id]);

  const cargarProyecto = async () => {
    if (!id) return;
    const data = await obtenerProyecto(parseInt(id));
    if (data) {
      setProyecto(data.proyecto);
      setNotas(data.notas || []); // ← Guardar notas también
    }
    setLoading(false);
  };

  // Sprint 3 Corrección: Cargar contenido de análisis desde R2
  const cargarContenidoAnalisis = async (tipo: string) => {
    if (contenidoAnalisis[tipo] || loadingAnalisis[tipo]) return;

    setLoadingAnalisis(prev => ({ ...prev, [tipo]: true }));

    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/pai/proyectos/${id}/artefactos/${tipo}/contenido`;
      console.log(`Cargando análisis ${tipo}:`, url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`HTTP error ${response.status}: ${response.statusText}`);
        const errorData = await response.json();
        console.error('Error details:', errorData);
        return;
      }
      
      const data = await response.json();
      console.log(`Contenido cargado para ${tipo}:`, data.contenido?.length, 'chars');
      setContenidoAnalisis(prev => ({ ...prev, [tipo]: data.contenido }));
    } catch (error) {
      console.error(`Error loading análisis ${tipo}:`, error);
    } finally {
      setLoadingAnalisis(prev => ({ ...prev, [tipo]: false }));
    }
  };

  const handleEjecutarAnalisis = async (proyectoId: number) => {
    if (!confirm(t('pai.analisis.confirmar_reejecucion'))) {
      throw new Error('Cancelado por el usuario');
    }

    const resultado = await ejecutarAnalisis(proyectoId, { forzar_reejecucion: true });

    if (!resultado) {
      throw new Error(t('pai.analisis.error'));
    }

    // Recargar datos del proyecto
    await cargarProyecto();
  };

  const handleAnalisisSuccess = () => {
    // Refrescar la vista después del éxito
    cargarProyecto();
  };

  const handleAnalisisError = (errorMsg: string) => {
    alert(t('pai.analisis.error') + ': ' + errorMsg);
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
              {/* G51-1: Fecha del análisis formateada como DD/MM/YYYY HH:MM */}
              <span className="mr-4">CII: <code className="bg-gray-100 px-2 py-1 rounded">{proyecto.cii}</code></span>
              <span>Fecha del análisis: {formatFecha(proyecto.fecha_analisis)}</span>
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
            <BotonEjecutarAnalisis
              proyectoId={proyecto.id}
              estadoId={proyecto.estado_id}
              onEjecutar={handleEjecutarAnalisis}
              onSuccess={handleAnalisisSuccess}
              onError={handleAnalisisError}
            />
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
          
          {/* G51-1: Fecha de alta formateada como dd/mm/yyyy hh:mm */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Fecha de Alta</label>
            <div className="mt-1">{formatFecha(proyecto.datos_basicos?.fecha_alta)}</div>
          </div>
        </div>
      </div>

      {/* G52: Pestañas de Resultados del Análisis */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Resultados del Análisis</h2>

        {/* Navegación de pestañas - Sprint 3 Corrección: 9 pestañas */}
        <div className="border-b border-gray-200 mb-4 overflow-x-auto">
          <nav className="-mb-px flex space-x-4 min-w-max">
            <button
              onClick={() => setPestañaActiva('resumen')}
              className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                pestañaActiva === 'resumen'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📄 Resumen Ejecutivo
            </button>
            <button
              onClick={() => setPestañaActiva('datos')}
              className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                pestañaActiva === 'datos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Datos Transformados
            </button>
            {/* Sprint 3 Corrección: 7 pestañas de análisis */}
            {tiposAnalisis.map((tipo) => (
              <button
                key={tipo.key}
                onClick={() => {
                  setPestañaActiva(tipo.key);
                  cargarContenidoAnalisis(tipo.key);
                }}
                className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  pestañaActiva === tipo.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tipo.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de pestañas */}
        <div className="min-h-[400px]">
          {/* Pestaña "Resumen Ejecutivo" */}
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

          {/* Pestaña "Datos Transformados" */}
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

          {/* Sprint 3 Corrección: 7 pestañas de análisis desde R2 */}
          {tiposAnalisis.some(t => t.key === pestañaActiva) && (
            <div>
              {loadingAnalisis[pestañaActiva] ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-500">Cargando análisis...</p>
                </div>
              ) : contenidoAnalisis[pestañaActiva] ? (
                <div className="prose prose-blue max-w-none">
                  <VisualizadorMarkdown contenido={contenidoAnalisis[pestañaActiva]} />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">No hay contenido disponible para este análisis.</p>
                  <p className="text-sm">Haz clic en la pestaña para intentar cargar el contenido.</p>
                  <p className="text-xs mt-2">Si el problema persiste, ejecuta el análisis completo del proyecto.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notas */}
      <ListaNotas
        proyectoId={proyecto.id}
        estadoProyecto={proyecto.estado}
        notasIniciales={notas}
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
