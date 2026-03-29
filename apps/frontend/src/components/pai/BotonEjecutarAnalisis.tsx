/**
 * Botón de Ejecución de Análisis para PAI
 * 
 * Sprint 3: Implementación del Frontend - UI del Workflow
 * 
 * Following R5: Code in English, documentation in Spanish
 * Following R2: No hardcoding - state labels from i18n
 */

import { useState } from 'react';
import { t } from '../../i18n';

interface BotonEjecutarAnalisisProps {
  proyectoId: number;
  estadoId: number;
  onEjecutar: (proyectoId: number) => Promise<void>;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Estados que permiten análisis (ROADMAP Section 2.3)
const ESTADOS_PERMITIDOS = [1, 2, 3, 4];

// Nombres de los 7 pasos del análisis
const NOMBRES_PASOS = [
  'Activo Físico',
  'Activo Estratégico',
  'Activo Financiero',
  'Activo Regulado',
  'Inversor',
  'Emprendedor Operador',
  'Propietario',
];

export function BotonEjecutarAnalisis({
  proyectoId,
  estadoId,
  onEjecutar,
  onSuccess,
  onError,
}: BotonEjecutarAnalisisProps) {
  // Estados del botón
  const [estado, setEstado] = useState<'idle' | 'loading' | 'success'>('idle');
  const [pasoActual, setPasoActual] = useState<number>(0);

  // Verificar si el botón está habilitado
  const habilitado = ESTADOS_PERMITIDOS.includes(estadoId) && estado !== 'loading';
  const obtenerTextoBoton = () => {
    if (estado === 'loading') {
      return `Paso ${pasoActual} de 7: ${NOMBRES_PASOS[pasoActual - 1]}`;
    }
    if (estado === 'success') {
      return t('pai.analisis.finalizado');
    }
    return t('pai.analisis.ejecutar');
  };

  // Manejar clic en el botón
  const handleClick = async () => {
    if (!habilitado) return;

    setEstado('loading');
    setPasoActual(1);

    try {
      await onEjecutar(proyectoId);
      setEstado('success');
      onSuccess();
      
      // Resetear después de 2 segundos
      setTimeout(() => {
        setEstado('idle');
        setPasoActual(0);
      }, 2000);
      
    } catch (error) {
      setEstado('idle');
      setPasoActual(0);
      onError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  // Tooltip para botón deshabilitado
  const tooltip = !ESTADOS_PERMITIDOS.includes(estadoId)
    ? 'El análisis solo está disponible para proyectos en estados: Creado, Procesando Análisis, Análisis con Error, o Análisis Finalizado'
    : '';

  // Determinar clase CSS según estado
  const obtenerClaseBoton = () => {
    if (!ESTADOS_PERMITIDOS.includes(estadoId)) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed';
    }
    if (estado === 'loading') {
      return 'bg-blue-600 text-white animate-pulse';
    }
    if (estado === 'success') {
      return 'bg-green-600 text-white';
    }
    return 'bg-blue-600 text-white hover:bg-blue-700';
  };

  return (
    <button
      onClick={handleClick}
      disabled={!habilitado}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${obtenerClaseBoton()}`}
      title={tooltip}
    >
      {obtenerTextoBoton()}
    </button>
  );
}
