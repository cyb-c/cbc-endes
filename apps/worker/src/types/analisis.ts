/**
 * TypeScript types for the Real Estate Analysis Workflow (WF-ANALISIS)
 * 
 * Following R5: Code in English, documentation in Spanish
 * Following R4: Typed accessors for bindings
 */

// ============================================================================
// Analysis Workflow Types
// ============================================================================

/**
 * Project states that allow analysis execution
 * According to ROADMAP: states 1, 2, 3, 4 allow analysis button
 */
export const ESTADOS_PERMITIDOS_ANALISIS = [1, 2, 3, 4] as const

export type EstadoPermitidoAnalisis = typeof ESTADOS_PERMITIDOS_ANALISIS[number]

/**
 * Analysis workflow steps (7 steps total)
 */
export const PASOS_ANALISIS = [
  { numero: 1, clave: 'analisis-fisico', archivo: '01_ActivoFisico.json', nombre: 'Activo Físico' },
  { numero: 2, clave: 'analisis-estrategico', archivo: '02_ActivoEstrategico.json', nombre: 'Activo Estratégico' },
  { numero: 3, clave: 'analisis-financiero', archivo: '03_ActivoFinanciero.json', nombre: 'Activo Financiero' },
  { numero: 4, clave: 'analisis-regulatorio', archivo: '04_ActivoRegulado.json', nombre: 'Activo Regulado' },
  { numero: 5, clave: 'inversor', archivo: '05_Inversor.json', nombre: 'Inversor' },
  { numero: 6, clave: 'emprendedor-operador', archivo: '06_EmprendedorOperador.json', nombre: 'Emprendedor Operador' },
  { numero: 7, clave: 'propietario', archivo: '07_Propietario.json', nombre: 'Propietario' },
] as const

export type PasoAnalisis = typeof PASOS_ANALISIS[number]
export type PasoAnalisisNumero = PasoAnalisis['numero']
export type PasoAnalisisClave = PasoAnalisis['clave']

/**
 * Analysis step execution result
 */
export interface EjecutarPasoConIAResult {
  exito: boolean
  contenido?: string
  error_codigo?: string
  error_mensaje?: string
}

/**
 * Inputs for analysis steps
 * Steps 1-4: only IJSON
 * Steps 5-7: IJSON + MD 1-4 (5 inputs total)
 */
export interface InputsParaPaso {
  ijson: string
  'analisis-fisico'?: string
  'analisis-estrategico'?: string
  'analisis-financiero'?: string
  'analisis-regulatorio'?: string
}

/**
 * Complete analysis execution result
 */
export interface EjecutarAnalisisConIAResult {
  exito: boolean
  artefactos_generados?: Array<{
    id: number
    tipo: string
    ruta_r2: string
    fecha_generacion: string
  }>
  error_codigo?: string
  error_mensaje?: string
}

/**
 * Analysis progress tracking
 */
export interface ProgresoAnalisis {
  paso_actual: PasoAnalisisNumero
  total_pasos: 7
  nombre_paso: string
  estado: 'ejecutando' | 'completado' | 'error'
}

// ============================================================================
// Artifact Types
// ============================================================================

/**
 * Artifact type codes for PAI_ART_artefactos
 */
export const TIPOS_ARTEFACTOS = [
  'ACTIVO_FISICO',
  'ACTIVO_ESTRATEGICO',
  'ACTIVO_FINANCIERO',
  'ACTIVO_REGULADO',
  'INVERSOR',
  'EMPRENDEDOR_OPERADOR',
  'PROPIETARIO',
] as const

export type TipoArtefacto = typeof TIPOS_ARTEFACTOS[number]

/**
 * Artifact file naming convention
 * Pattern: {CII}_{step_number}_{artifact_name}.md
 */
export interface ArtefactoArchivo {
  cii: string
  paso: PasoAnalisisNumero
  nombre: string
  ruta: string  // Full R2 key: analisis-inmuebles/{CII}/{CII}_{paso}_{nombre}.md
}

/**
 * Artifact mapping from step to file name
 */
export const MAPEO_ARCHIVOS: Record<PasoAnalisisClave, string> = {
  'analisis-fisico': '{cii}_01_activo_fisico.md',
  'analisis-estrategico': '{cii}_02_activo_estrategico.md',
  'analisis-financiero': '{cii}_03_activo_financiero.md',
  'analisis-regulatorio': '{cii}_04_activo_regulado.md',
  'inversor': '{cii}_05_inversor.md',
  'emprendedor-operador': '{cii}_06_emprendedor_operador.md',
  'propietario': '{cii}_07_propietario.md',
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Analysis error codes
 */
export const ERROR_CODES = {
  INVALID_PROJECT_ID: 'INVALID_PROJECT_ID',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  INVALID_STATE: 'INVALID_STATE',
  IJSON_NOT_FOUND: 'IJSON_NOT_FOUND',
  PROMPT_NOT_FOUND: 'PROMPT_NOT_FOUND',
  OPENAI_ERROR: 'OPENAI_ERROR',
  EMPTY_RESPONSE: 'EMPTY_RESPONSE',
  DEPENDENCIAS_INCOMPLETAS: 'DEPENDENCIAS_INCOMPLETAS',
  R2_WRITE_ERROR: 'R2_WRITE_ERROR',
  DB_INSERT_ERROR: 'DB_INSERT_ERROR',
  ANALISIS_ERROR: 'ANALISIS_ERROR',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

/**
 * Analysis error response
 */
export interface AnalisisError {
  codigo: ErrorCode
  mensaje: string
  detalles?: Record<string, unknown>
}

// ============================================================================
// Tracking Types
// ============================================================================

/**
 * Analysis workflow events for pipeline_eventos table
 */
export const EVENTOS_ANALISIS = {
  ANALISIS_HANDLER_INICIO: 'analisis-handler-inicio',
  VALIDAR_ESTADO: 'validar-estado',
  LEER_IJSON_R2: 'leer-ijson-r2',
  LIMPIAR_MD_ANTERIORES: 'limpiar-md-anteriores',
  ANALISIS_INICIO: 'analisis-inicio',
  PASO_N_COMPLETADO: 'paso-n-completado',
  PERSISTIR_ARTEFACTOS: 'persistir-artefactos',
  REGISTRAR_EN_BD: 'registrar-en-bd',
  ACTUALIZAR_ESTADO: 'actualizar-estado',
  ANALISIS_COMPLETADO: 'analisis-completado',
  ANALISIS_ERROR: 'analisis-error',
} as const

export type EventoAnalisis = typeof EVENTOS_ANALISIS[keyof typeof EVENTOS_ANALISIS]

// ============================================================================
// Helper Functions Types
// ============================================================================

/**
 * Validation result for project state
 */
export interface ValidarEstadoResult {
  valido: boolean
  estado_id?: number
  error_mensaje?: string
}

/**
 * Dependency validation result
 */
export interface ValidarDependenciasResult {
  valido: boolean
  faltantes?: PasoAnalisisClave[]
}
