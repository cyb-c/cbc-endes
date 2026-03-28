/**
 * Componente de Resultados de Análisis para PAI
 * P0.2 Corrección Crítica: Implementar 9 pestañas de resultados de análisis
 * P1.2 Mejora: Integrar visualizador de Markdown
 */

import { useState } from 'react';
import type { Artefacto } from '../../types/pai';
import { VisualizadorMarkdown } from './VisualizadorMarkdown';

interface ResultadosAnalisisProps {
  proyectoId: number;
  artefactos: Artefacto[];
}

interface Pestaña {
  id: string;
  label: string;
  tipoArtefacto: string;
  descripcion: string;
}

const pestañas: Pestaña[] = [
  {
    id: 'resumen-ejecutivo',
    label: 'Resumen Ejecutivo',
    tipoArtefacto: 'RESUMEN_EJECUTIVO',
    descripcion: 'Visión general del análisis del inmueble',
  },
  {
    id: 'datos-transformados',
    label: 'Datos Transformados',
    tipoArtefacto: 'DATOS_MD',
    descripcion: 'Datos estructurados del IJSON',
  },
  {
    id: 'analisis-fisico',
    label: 'Análisis Físico',
    tipoArtefacto: 'ANALISIS_FISICO',
    descripcion: 'Evaluación del estado físico del inmueble',
  },
  {
    id: 'analisis-estrategico',
    label: 'Análisis Estratégico',
    tipoArtefacto: 'ANALISIS_ESTRATEGICO',
    descripcion: 'Posicionamiento estratégico del activo',
  },
  {
    id: 'analisis-financiero',
    label: 'Análisis Financiero',
    tipoArtefacto: 'ANALISIS_FINANCIERO',
    descripcion: 'Viabilidad económica y financiera',
  },
  {
    id: 'analisis-regulatorio',
    label: 'Análisis Regulatorio',
    tipoArtefacto: 'ANALISIS_REGULATORIO',
    descripcion: 'Marco normativo aplicable',
  },
  {
    id: 'lectura-inversor',
    label: 'Lectura Inversor',
    tipoArtefacto: 'LECTURA_INVERSOR',
    descripcion: 'Perspectiva para perfil inversor',
  },
  {
    id: 'lectura-operador',
    label: 'Lectura Operador',
    tipoArtefacto: 'LECTURA_OPERADOR',
    descripcion: 'Perspectiva para perfil operador',
  },
  {
    id: 'lectura-propietario',
    label: 'Lectura Propietario',
    tipoArtefacto: 'LECTURA_PROPIETARIO',
    descripcion: 'Perspectiva para perfil propietario',
  },
];

export function ResultadosAnalisis({ artefactos }: ResultadosAnalisisProps) {
  const [pestañaActiva, setPestañaActiva] = useState<string>('resumen-ejecutivo');

  const obtenerArtefacto = (tipoArtefacto: string): Artefacto | undefined => {
    return artefactos.find(a => a.tipo === tipoArtefacto);
  };

  const pestañaSeleccionada = pestañas.find(p => p.id === pestañaActiva);
  const artefactoSeleccionado = pestañaSeleccionada ? obtenerArtefacto(pestañaSeleccionada.tipoArtefacto) : undefined;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Resultados del Análisis</h2>

      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {pestañas.map((pestaña) => {
            const tieneArtefacto = obtenerArtefacto(pestaña.tipoArtefacto) !== undefined;
            return (
              <button
                key={pestaña.id}
                onClick={() => setPestañaActiva(pestaña.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    pestañaActiva === pestaña.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  ${!tieneArtefacto ? 'opacity-50' : ''}
                `}
                title={tieneArtefacto ? pestaña.descripcion : 'Análisis no disponible'}
              >
                {pestaña.label}
                {tieneArtefacto && (
                  <span className="ml-1 text-green-500">✓</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="mt-6">
        {pestañaSeleccionada && (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{pestañaSeleccionada.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{pestañaSeleccionada.descripcion}</p>
              </div>
              {artefactoSeleccionado && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Generado: {new Date(artefactoSeleccionado.fecha_generacion).toLocaleDateString('es-ES')}
                </span>
              )}
            </div>

            {artefactoSeleccionado ? (
              <div className="prose max-w-none">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Ruta en R2: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{artefactoSeleccionado.ruta_r2}</code></span>
                  </div>
                </div>
                
                {/* Contenido Markdown de ejemplo */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <VisualizadorMarkdown
                    contenido={`# ${pestañaSeleccionada.label}

## Contenido del Análisis

Este es un ejemplo del contenido que se mostraría cuando el visualizador de Markdown cargue el archivo desde R2.

### Puntos Clave

- El archivo Markdown está almacenado en R2
- La ruta completa es: \`${artefactoSeleccionado.ruta_r2}\`
- Fecha de generación: ${new Date(artefactoSeleccionado.fecha_generacion).toLocaleDateString('es-ES')}

### Próximos Pasos

Para visualizar el contenido real, se requiere:

1. Implementar la carga del archivo desde R2
2. Parsear el contenido Markdown
3. Renderizar el contenido formateado

---

*Nota: Este es un placeholder hasta que se implemente la carga real desde R2.*`}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Análisis no disponible</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Este análisis aún no ha sido generado. Ejecuta el análisis completo del proyecto para generar todos los artefactos.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
