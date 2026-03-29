/**
 * Página de Crear Proyecto PAI
 * 
 * Formulario para crear un nuevo proyecto a partir de IJSON
 * Sin modal - formulario en página completa con menú lateral visible
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';

export function CrearProyecto() {
  const navigate = useNavigate();
  const [ijson, setIjson] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'}/api/pai/proyectos`;

    // Llamada a API para crear proyecto
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ijson }),
    });

    setLoading(false);

    if (response.ok) {
      await response.json();
      setSuccess('Proyecto creado correctamente');
      // Redirigir al listado después de 2 segundos
      setTimeout(() => {
        navigate('/proyectos');
      }, 2000);
    } else {
      const data = await response.json();
      setError(data.error?.message || 'Error al crear proyecto');
    }
  };

  const handleCancelar = () => {
    navigate('/proyectos');
  };

  return (
    <>
      <PageMeta
        title="Crear Proyecto PAI | CBC Endes"
        description="Crear nuevo proyecto de análisis inmobiliario a partir de IJSON"
      />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Cabecera */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Crear Nuevo Proyecto
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Introduce el IJSON del inmueble para crear un nuevo proyecto de análisis
          </p>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-green-800">Éxito</h3>
                <p className="text-sm text-green-700 mt-1">{success}</p>
                <p className="text-xs text-green-600 mt-1">Redirigiendo al listado...</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-4">
            <label htmlFor="ijson" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              IJSON del Inmueble <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ijson"
              value={ijson}
              onChange={(e) => setIjson(e.target.value)}
              placeholder='{"titulo_anuncio": "...", "tipo_inmueble": "...", "precio": "...", ...}'
              className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Introduce el JSON completo del anuncio inmobiliario incluyendo: título, tipo de inmueble, precio, superficie, ubicación, etc.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancelar}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !ijson.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando...
                </span>
              ) : (
                'Crear Proyecto'
              )}
            </button>
          </div>
        </form>

        {/* Ayuda */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            ¿Qué es el IJSON?
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            El IJSON (Inmueble JSON) es el formato de datos que contiene toda la información del anuncio inmobiliario. La información del inmueble se obtiene desde el Custom GPT:{' '}
            <a
              href="https://chatgpt.com/g/g-69af3823839c81919da0d4da6c9233f7-extractor-portales-inmobiliarios"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Extractor Portales Inmobiliarios (clic aquí)
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
