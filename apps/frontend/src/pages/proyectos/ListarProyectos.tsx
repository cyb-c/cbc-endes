/**
 * Página de listado de proyectos PAI
 * P1.1 Corrección Importante: Implementar paginación UI
 */

import { useState, useEffect } from 'react';
import { useListarProyectos } from '../../hooks/use-pai';
import { ESTADO_PROYECTO_LABELS, ESTADO_PROYECTO_COLORS, type ProyectoPAI, type ListarProyectosParams } from '../../types/pai';
import { Paginacion } from '../../components/pai/Paginacion';

export function ListarProyectos() {
  const [proyectos, setProyectos] = useState<ProyectoPAI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<ListarProyectosParams>({});
  const [mostrarCrearModal, setMostrarCrearModal] = useState(false);
  // P1.1: Estado de paginación
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(20);

  const { listarProyectos, data: paginacionData } = useListarProyectos();

  useEffect(() => {
    cargarProyectos();
  }, [pagina, porPagina]);

  const cargarProyectos = async () => {
    const data = await listarProyectos({ ...filtros, page: pagina, limit: porPagina });
    if (data) {
      setProyectos(data.proyectos);
    }
    setLoading(false);
  };

  const handleFiltroChange = (key: keyof ListarProyectosParams, value: string) => {
    const nuevosFiltros = { ...filtros, [key]: value || undefined };
    setFiltros(nuevosFiltros);
    cargarProyectos();
  };

  const handleLimpiarFiltros = () => {
    setFiltros({});
    cargarProyectos();
  };

  const handleVerDetalle = (id: number) => {
    window.location.href = `/proyectos/${id}`;
  };

  const handleCrearProyecto = () => {
    setMostrarCrearModal(true);
  };

  if (loading) return <div className="text-center py-8">Cargando proyectos...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Banda de control */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Proyectos PAI</h1>
            <p className="text-gray-600 mt-1">
              {proyectos.length} {proyectos.length === 1 ? 'proyecto' : 'proyectos'}
            </p>
          </div>
          <button
            onClick={handleCrearProyecto}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Crear Proyecto
          </button>
        </div>
      </div>

      {/* Banda de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por título..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleFiltroChange('titulo', e.target.value)}
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="creado">Creado</option>
              <option value="procesando_analisis">En Análisis</option>
              <option value="analisis_con_error">Análisis con Error</option>
              <option value="analisis_finalizado">Análisis Finalizado</option>
              <option value="evaluando_viabilidad">Evaluando Viabilidad</option>
              <option value="evaluando_plan_negocio">Evaluando Plan de Negocio</option>
              <option value="seguimiento_comercial">Seguimiento Comercial</option>
              <option value="descartado">Descartado</option>
            </select>
          </div>

          {/* Filtro por tipo de inmueble */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Inmueble</label>
            <select
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleFiltroChange('tipo_inmueble', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="piso">Piso</option>
              <option value="casa">Casa</option>
              <option value="atico">Ático</option>
              <option value="local">Local</option>
              <option value="oficina">Oficina</option>
              <option value="nave">Nave</option>
              <option value="garaje">Garaje</option>
              <option value="trastero">Trastero</option>
            </select>
          </div>

          {/* Filtro por ciudad */}
          <div>
            <label className="block text-sm font-medium mb-2">Ciudad</label>
            <input
              type="text"
              placeholder="Filtrar por ciudad..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleFiltroChange('ciudad', e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleLimpiarFiltros}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
          {error}
        </div>
      )}

      {/* Tabla de proyectos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {proyectos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay proyectos aún. Crea el primero.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proyectos.map((proyecto) => (
                  <tr key={proyecto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{proyecto.id}</td>
                    <td className="px-6 py-4">
                      <a
                        href={`/proyectos/${proyecto.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {proyecto.titulo}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${ESTADO_PROYECTO_COLORS[proyecto.estado]}`}>
                        {ESTADO_PROYECTO_LABELS[proyecto.estado]}
                      </span>
                    </td>
                    <td className="px-6 py-4">{proyecto.datos_basicos?.tipo_inmueble || '-'}</td>
                    <td className="px-6 py-4">{proyecto.datos_basicos?.ciudad || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(proyecto.fecha_creacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleVerDetalle(proyecto.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {paginacionData && paginacionData.total_pages > 1 && (
        <Paginacion
          paginaActual={pagina}
          totalPaginas={paginacionData.total_pages}
          totalResultados={paginacionData.total}
          porPagina={porPagina}
          onPageChange={setPagina}
          onPorPaginaChange={(nuevoPorPagina) => {
            setPorPagina(nuevoPorPagina);
            setPagina(1); // Resetear a primera página al cambiar tamaño
          }}
        />
      )}

      {/* Modal de creación de proyecto */}
      {mostrarCrearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Crear Nuevo Proyecto</h2>
              <button
                onClick={() => setMostrarCrearModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <FormularioCrearProyecto
              onCreado={(proyecto) => {
                setProyectos([proyecto, ...proyectos]);
                setMostrarCrearModal(false);
              }}
              onCancel={() => setMostrarCrearModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de formulario de creación de proyecto (inline)
function FormularioCrearProyecto({ onCreado, onCancel }: { onCreado: (proyecto: ProyectoPAI) => void; onCancel: () => void }) {
  const [ijson, setIjson] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ijson.trim()) {
      setError('El IJSON es obligatorio');
      return;
    }

    // Validar JSON
    try {
      JSON.parse(ijson);
    } catch {
      setError('El IJSON no es un JSON válido');
      return;
    }

    setLoading(true);
    setError(null);

    // Llamada a API para crear proyecto
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'}/api/pai/proyectos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ijson }),
    });

    setLoading(false);

    if (response.ok) {
      const data = await response.json();
      onCreado(data.data.proyecto);
    } else {
      const data = await response.json();
      setError(data.error?.message || 'Error al crear proyecto');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">IJSON del Inmueble</label>
        <textarea
          value={ijson}
          onChange={(e) => setIjson(e.target.value)}
          placeholder='{"titulo": "...", ...}'
          className="w-full h-64 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-800">
          {error}
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
          disabled={loading || !ijson.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear Proyecto'}
        </button>
      </div>
    </form>
  );
}
