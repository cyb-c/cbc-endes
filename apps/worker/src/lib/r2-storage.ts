// ============================================================================
// Librería: Almacenamiento en R2 para Proyectos PAI
// ============================================================================
// Versión: 1.0
// Fecha: 27 de marzo de 2026
// Propósito: Funciones para guardar y recuperar archivos en R2 para PAI
// ============================================================================

// ============================================================================
// Importaciones
// ============================================================================

import type { R2Bucket } from '@cloudflare/workers-types'

/**
 * Metadatos de un objeto R2
 */
export interface R2ObjectMetadata {
  httpEtag?: string
  versionId?: string
  customMetadata?: Record<string, string>
}

// ============================================================================
// Constantes
// ============================================================================

/**
 * Nombre del bucket R2 para almacenamiento de artefactos PAI
 */
const R2_BUCKET_NAME = 'r2-cbconsulting'

/**
 * Prefijo para la carpeta principal de análisis de inmuebles
 */
const ANALISIS_INMUEBLES_PREFIX = 'analisis-inmuebles/'

// ============================================================================
// Tipos
// ============================================================================

/**
 * Estructura de carpetas para un proyecto PAI
 */
export interface ProjectFolderStructure {
  /** Carpeta principal: analisis-inmuebles/CII/ */
  projectFolder: string
  /** Archivo IJSON original: CII.json */
  ijsonFile: string
  /** Prefijo para archivos Markdown: CII_ */
  markdownPrefix: string
}

/**
 * Metadatos de un artefacto
 */
export interface ArtifactMetadata {
  /** Nombre del artefacto */
  name: string
  /** Tipo MIME del archivo */
  contentType: string
  /** Metadatos personalizados */
  customMetadata?: Record<string, string>
}

/**
 * Resultado de guardar un archivo
 */
export interface SaveFileResult {
  /** Clave del archivo en R2 */
  key: string
  /** URL pública del archivo (si aplica) */
  url?: string
}

/**
 * Resultado de recuperar un archivo
 */
export interface GetFileResult {
  /** Contenido del archivo */
  content: ArrayBuffer
  /** Metadatos del archivo */
  metadata: R2ObjectMetadata
}

// ============================================================================
// Funciones de utilidad
// ============================================================================

/**
 * Extrae un valor string del ijson de forma segura
 */
function getStringValue(ijson: Record<string, unknown>, key: string): string {
  const value = ijson[key]
  if (typeof value === 'string') {
    return value
  }
  return 'No especificado'
}

/**
 * Extrae un valor array de strings del ijson de forma segura
 */
function getStringArray(ijson: Record<string, unknown>, key: string): string[] {
  const value = ijson[key]
  if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
    return value as string[]
  }
  return []
}

/**
 * Genera el CII (Código Id de Inmueble)
 * Formato: 2 dígitos del año + 2 del mes del alta + 4 dígitos del ID del proyecto
 *
 * @param projectId - ID interno del proyecto
 * @returns CII generado
 */
export function generateCII(projectId: number): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const projectIdStr = projectId.toString().padStart(4, '0')
  return `${year}${month}${projectIdStr}`
}

/**
 * Genera la estructura de carpetas para un proyecto PAI
 *
 * @param cii - Código Id de Inmueble
 * @returns Estructura de carpetas
 */
export function generateProjectFolderStructure(cii: string): ProjectFolderStructure {
  return {
    projectFolder: `${ANALISIS_INMUEBLES_PREFIX}${cii}/`,
    ijsonFile: `${ANALISIS_INMUEBLES_PREFIX}${cii}/${cii}.json`,
    markdownPrefix: `${ANALISIS_INMUEBLES_PREFIX}${cii}/${cii}_`,
  }
}

/**
 * Genera el nombre de un archivo Markdown de análisis
 *
 * @param cii - Código Id de Inmueble
 * @param tipo - Tipo de análisis (ej: 'analisis-fisico')
 * @returns Nombre del archivo Markdown
 */
export function generateMarkdownFilename(cii: string, tipo: string): string {
  return `${cii}_${tipo}.md`
}

/**
 * Genera la lista de nombres de archivos Markdown para un proyecto PAI
 *
 * @param cii - Código Id de Inmueble
 * @returns Lista de nombres de archivos Markdown
 */
export function generateMarkdownFilenames(cii: string): string[] {
  return [
    generateMarkdownFilename(cii, 'resumen-ejecutivo'),
    generateMarkdownFilename(cii, 'datos-transformados'),
    generateMarkdownFilename(cii, 'analisis-fisico'),
    generateMarkdownFilename(cii, 'analisis-estrategico'),
    generateMarkdownFilename(cii, 'analisis-financiero'),
    generateMarkdownFilename(cii, 'analisis-regulatorio'),
    generateMarkdownFilename(cii, 'lectura-inversor'),
    generateMarkdownFilename(cii, 'lectura-operador'),
    generateMarkdownFilename(cii, 'lectura-propietario'),
  ]
}

// ============================================================================
// Funciones principales: Guardar archivos
// ============================================================================

/**
 * Guarda el archivo IJSON original en R2
 *
 * @param bucket - Instancia de R2Bucket
 * @param cii - Código Id de Inmueble
 * @param ijsonContent - Contenido del IJSON
 * @returns Promise<SaveFileResult>
 */
export async function saveIJSON(
  bucket: R2Bucket,
  cii: string,
  ijsonContent: string,
): Promise<SaveFileResult> {
  const { ijsonFile } = generateProjectFolderStructure(cii)
  
  const metadata: ArtifactMetadata = {
    name: `${cii}.json`,
    contentType: 'application/json',
    customMetadata: {
      tipo: 'IJSON_ORIGINAL',
      cii,
    },
  }

  await bucket.put(ijsonFile, ijsonContent, metadata)

  return {
    key: ijsonFile,
  }
}

/**
 * Guarda un archivo Markdown en R2
 *
 * @param bucket - Instancia de R2Bucket
 * @param cii - Código Id de Inmueble
 * @param tipo - Tipo de análisis (ej: 'analisis-fisico')
 * @param content - Contenido del Markdown
 * @returns Promise<SaveFileResult>
 */
export async function saveMarkdownArtifact(
  bucket: R2Bucket,
  cii: string,
  tipo: string,
  content: string,
): Promise<SaveFileResult> {
  const { markdownPrefix } = generateProjectFolderStructure(cii)
  const filename = generateMarkdownFilename(cii, tipo)
  const key = `${markdownPrefix}${tipo}.md`

  const metadata: ArtifactMetadata = {
    name: filename,
    contentType: 'text/markdown',
    customMetadata: {
      tipo,
      cii,
    },
  }

  await bucket.put(key, content, metadata)

  return {
    key,
  }
}

/**
 * Guarda todos los archivos Markdown generados por el análisis simulado
 *
 * @param bucket - Instancia de R2Bucket
 * @param cii - Código Id de Inmueble
 * @param markdownContents - Objeto con los contenidos de cada tipo de análisis
 * @returns Promise<SaveFileResult[]>>
 */
export async function saveAllMarkdownArtifacts(
  bucket: R2Bucket,
  cii: string,
  markdownContents: Record<string, string>,
): Promise<SaveFileResult[]> {
  const results: SaveFileResult[] = []
  
  for (const [tipo, content] of Object.entries(markdownContents)) {
    const result = await saveMarkdownArtifact(bucket, cii, tipo, content)
    results.push(result)
  }

  return results
}

/**
 * Genera contenido simulado para un análisis PAI
 * Esta función genera contenido ficticio pero estructurado para simular
 * la ejecución de IA
 *
 * @param cii - Código Id de Inmueble
 * @param ijson - Contenido del IJSON original
 * @returns Objeto con los contenidos de cada tipo de análisis
 */
export function generateSimulatedAnalysisContent(
  cii: string,
  ijson: Record<string, unknown>,
): Record<string, string> {
  // Extraer información básica del IJSON
  const titulo = getStringValue(ijson, 'titulo_anuncio') || 'Sin título'
  const tipoInmueble = getStringValue(ijson, 'tipo_inmueble') || 'No especificado'
  const precio = getStringValue(ijson, 'precio') || 'No especificado'
  const superficie = getStringValue(ijson, 'superficie_construida_m2') || 'No especificada'
  const ciudad = getStringValue(ijson, 'ciudad') || 'No especificada'
  const barrio = getStringValue(ijson, 'barrio') || 'No especificado'
  const descripcion = getStringValue(ijson, 'descripcion') || 'Sin descripción'

  // Generar contenido simulado para cada tipo de análisis
  return {
    'resumen-ejecutivo': generateResumenEjecutivo(cii, titulo, tipoInmueble, precio, superficie),
    'datos-transformados': generateDatosTransformados(ijson),
    'analisis-fisico': generateAnalisisFisico(cii, titulo, tipoInmueble, superficie, descripcion, ijson),
    'analisis-estrategico': generateAnalisisEstrategico(cii, titulo, tipoInmueble, precio, barrio),
    'analisis-financiero': generateAnalisisFinanciero(cii, titulo, tipoInmueble, precio),
    'analisis-regulatorio': generateAnalisisRegulatorio(cii, ciudad, tipoInmueble, ijson),
    'lectura-inversor': generateLecturaInversor(cii, titulo, tipoInmueble, precio),
    'lectura-operador': generateLecturaOperador(cii, titulo, tipoInmueble, superficie),
    'lectura-propietario': generateLecturaPropietario(cii, titulo, tipoInmueble),
  }
}

// ============================================================================
// Funciones de generación de contenido simulado
// ============================================================================

function generateResumenEjecutivo(
  cii: string,
  titulo: string,
  tipoInmueble: string,
  precio: string,
  superficie: string,
): string {
  return `# Resumen Ejecutivo - ${cii}

## Información General
- **Título**: ${titulo}
- **Tipo de Inmueble**: ${tipoInmueble}
- **Precio**: ${precio}€
- **Superficie Construida**: ${superficie}m²
- **CII**: ${cii}

## Observaciones Generales
Este proyecto ha sido creado automáticamente a partir del anuncio inmobiliario. El análisis simulado indica que el activo presenta características interesantes que merecen un análisis más profundo.

## Recomendación Inicial
Se recomienda proceder con el análisis completo para obtener una evaluación detallada del inmueble desde múltiples perspectivas (física, estratégica, financiera y regulatoria).
`
}

function generateDatosTransformados(ijson: Record<string, unknown>): string {
  return `# Datos Transformados - IJSON

## Información del Anuncio
- **Portal**: ${getStringValue(ijson, 'portal_inmobiliario')}
- **URL Fuente**: ${getStringValue(ijson, 'url_fuente')}
- **ID Anuncio**: ${getStringValue(ijson, 'id_anuncio')}
- **Título Anuncio**: ${getStringValue(ijson, 'titulo_anuncio') || 'Sin título'}

## Tipo de Operación
${getStringValue(ijson, 'tipo_operacion')}

## Tipo de Inmueble
${getStringValue(ijson, 'tipo_inmueble')}
${getStringValue(ijson, 'subtipo_inmueble') ? `- Subtipo: ${getStringValue(ijson, 'subtipo_inmueble')}` : ''}

## Precio y Superficie
- **Precio**: ${getStringValue(ijson, 'precio')}€
- **Precio por m²**: ${getStringValue(ijson, 'precio_por_m2')}€/m²
- **Superficie Total**: ${getStringValue(ijson, 'superficie_total_m2')}m²
- **Superficie Construida**: ${getStringValue(ijson, 'superficie_construida_m2')}m²
- **Superficie Útil**: ${getStringValue(ijson, 'superficie_util_m2')}m²
${getStringValue(ijson, 'terraza_m2') ? `- **Terraza**: ${getStringValue(ijson, 'terraza_m2')}m²` : ''}

## Ubicación
- **Ciudad**: ${getStringValue(ijson, 'ciudad')}
- **Provincia**: ${getStringValue(ijson, 'provincia')}
- **País**: ${getStringValue(ijson, 'pais')}
- **Código Postal**: ${getStringValue(ijson, 'codigo_postal')}
- **Barrio**: ${getStringValue(ijson, 'barrio')}
- **Distrito**: ${getStringValue(ijson, 'distrito')}
- **Dirección**: ${getStringValue(ijson, 'direccion')}

## Características
${getStringArray(ijson, 'caracteristicas').length > 0 ? getStringArray(ijson, 'caracteristicas').map((c: string) => `- ${c}`).join('\n') : '- No hay características registradas'}

## Descripción
${getStringValue(ijson, 'descripcion') || 'Sin descripción'}
`
}

function generateAnalisisFisico(
  cii: string,
  titulo: string,
  tipoInmueble: string,
  superficie: string,
  descripcion: string,
  ijson: Record<string, unknown>,
): string {
  return `# Análisis Físico - ${cii}

## Estado General del Inmueble
- **Título**: ${titulo}
- **Tipo**: ${tipoInmueble}
- **Superficie Construida**: ${superficie}m²

## Estado de Conservación
${getStringValue(ijson, 'anio_construccion') ? `- **Año de Construcción**: ${getStringValue(ijson, 'anio_construccion')}` : '- Año de construcción no especificado'}
${getStringValue(ijson, 'estado_conservacion') ? `- **Estado**: ${getStringValue(ijson, 'estado_conservacion')}` : '- Estado de conservación no especificado'}

## Distribución y Layout
El inmueble presenta una distribución que permite múltiples usos según la configuración actual.

## Características Físicas Relevantes
- Superficie construida de ${superficie}m² permite configuraciones flexibles
- Ubicación en zona consolidada con acceso a servicios

## Observaciones
El estado físico del inmueble parece adecuado para el uso comercial. Se recomienda verificar en sitio las condiciones reales de conservación y distribución.
`
}

function generateAnalisisEstrategico(
  cii: string,
  titulo: string,
  tipoInmueble: string,
  precio: string,
  barrio: string,
): string {
  return `# Análisis Estratégico - ${cii}

## Ubicación y Entorno
- **Barrio**: ${barrio}
- **Tipo**: ${tipoInmueble}
- **Precio**: ${precio}€

## Análisis de Ubicación
La ubicación del inmueble se encuentra en una zona con potencial comercial. La proximidad a servicios y accesos principales puede ser un factor positivo para el uso comercial.

## Potencial de Uso
El inmueble presenta características que permiten múltiples usos comerciales. La configuración actual puede adaptarse a diferentes actividades según las necesidades del mercado local.

## Observaciones Estratégicas
El inmueble presenta un potencial estratégico interesante para uso comercial. Se recomienda evaluar la compatibilidad con diferentes tipos de actividad comercial según las normativas locales.
`
}

function generateAnalisisFinanciero(cii: string, titulo: string, tipoInmueble: string, precio: string): string {
  return `# Análisis Financiero - ${cii}

## Información Financiera
- **Título**: ${titulo}
- **Tipo**: ${tipoInmueble}
- **Precio**: ${precio}€

## Análisis de Precio
El precio de ${precio}€ debe evaluarse en el contexto del mercado actual de ${tipoInmueble}s en la zona.

## Indicadores Financieros
- Precio por metro cuadrado: Calculado según superficie
- Comparación con mercado local: Pendiente de análisis de mercado

## Observaciones
Se recomienda realizar un análisis financiero detallado que incluya:
- Comparación con transacciones recientes en la zona
- Evaluación del potencial de retorno
- Análisis de costes de adaptación si fuera necesario
`
}

function generateAnalisisRegulatorio(cii: string, ciudad: string, tipoInmueble: string, ijson: Record<string, unknown>): string {
  const posiblesUsos = getStringArray(ijson, 'posibles_usos_mencionados')
  return `# Análisis Regulatorio - ${cii}

## Contexto Normativo
- **Ciudad**: ${ciudad}
- **Tipo de Inmueble**: ${tipoInmueble}

## Normativa Aplicable
El inmueble se encuentra en València ciudad, por lo que le es de aplicación la normativa urbanística y de uso del suelo municipal.

## Uso Actual y Posibles Cambios
${posiblesUsos.length > 0 ?
`**Usos Posibles Mencionados**:
${posiblesUsos.map((u: string) => `- ${u}`).join('\n')}` : '- No hay usos mencionados en el anuncio'}

## Observaciones Regulatorias
Se recomienda verificar:
- La normativa urbanística vigente para la zona específica
- Los requisitos para cambios de uso si se considera una reconversión
- Las licencias y permisos necesarios para el uso pretendido
`
}

function generateLecturaInversor(cii: string, titulo: string, tipoInmueble: string, precio: string): string {
  return `# Lectura para Inversor - ${cii}

## Resumen del Activo
- **Título**: ${titulo}
- **Tipo**: ${tipoInmueble}
- **Precio**: ${precio}€

## Oportunidad de Inversión
Este inmueble presenta una oportunidad de inversión que requiere un análisis más detallado de los aspectos financieros y de mercado.

## Recomendaciones para el Inversor
- Evaluar el potencial de retorno de inversión
- Considerar el contexto de mercado local
- Analizar los riesgos asociados al tipo de inmueble
- Evaluar la necesidad de obras o adaptaciones

## Siguientes Pasos
Se recomienda realizar un análisis financiero detallado y una visita al inmueble para completar la evaluación.
`
}

function generateLecturaOperador(cii: string, titulo: string, tipoInmueble: string, superficie: string): string {
  return `# Lectura para Operador - ${cii}

## Resumen del Activo
- **Título**: ${titulo}
- **Tipo**: ${tipoInmueble}
- **Superficie**: ${superficie}m²

## Potencial de Uso Operativo
El inmueble presenta características que pueden adaptarse a diferentes tipos de actividad comercial.

## Recomendaciones para el Operador
- Evaluar la distribución actual del espacio
- Considerar las necesidades de adaptación según el tipo de actividad
- Verificar la adecuación de las instalaciones existentes

## Siguientes Pasos
Se recomienda realizar una visita técnica al inmueble para evaluar las condiciones reales y las necesidades de adaptación.
`
}

function generateLecturaPropietario(cii: string, titulo: string, tipoInmueble: string): string {
  return `# Lectura para Propietario - ${cii}

## Resumen del Activo
- **Título**: ${titulo}
- **Tipo**: ${tipoInmueble}

## Valoración del Activo
Este inmueble presenta características que pueden tener un valor potencial en el mercado actual.

## Recomendaciones para el Propietario
- Considerar el potencial de optimización del uso del inmueble
- Evaluar la posibilidad de cambio de uso si el uso actual no es el más eficiente
- Consultar sobre las oportunidades de mejora del valor del activo

## Siguientes Pasos
Se recomienda realizar un análisis detallado del potencial del inmueble para explorar opciones de optimización.
`
}

// ============================================================================
// Funciones principales: Recuperar archivos
// ============================================================================

/**
 * Recupera el archivo IJSON original de un proyecto PAI
 *
 * @param bucket - Instancia de R2Bucket
 * @param cii - Código Id de Inmueble
 * @returns Promise<GetFileResult | null>
 */
export async function getIJSON(
  bucket: R2Bucket,
  cii: string,
): Promise<GetFileResult | null> {
  const { ijsonFile } = generateProjectFolderStructure(cii)

  try {
    const object = await bucket.get(ijsonFile)
    if (!object) {
      return null
    }

    const content = await object.arrayBuffer()
    return {
      content,
      metadata: object.customMetadata || {},
    }
  } catch (error) {
    console.error(`Error al recuperar IJSON para CII ${cii}:`, error)
    return null
  }
}

/**
 * Recupera un archivo Markdown específico de un proyecto PAI
 *
 * @param bucket - Instancia de R2Bucket
 * @param cii - Código Id de Inmueble
 * @param tipo - Tipo de análisis (ej: 'analisis-fisico')
 * @returns Promise<GetFileResult | null>
 */
export async function getMarkdownArtifact(
  bucket: R2Bucket,
  cii: string,
  tipo: string,
): Promise<GetFileResult | null> {
  const { markdownPrefix } = generateProjectFolderStructure(cii)
  const key = `${markdownPrefix}${tipo}.md`

  try {
    const object = await bucket.get(key)
    if (!object) {
      return null
    }

    const content = await object.arrayBuffer()
    return {
      content,
      metadata: object.customMetadata || {},
    }
  } catch (error) {
    console.error(`Error al recuperar Markdown ${tipo} para CII ${cii}:`, error)
    return null
  }
}

/**
 * Recupera todos los archivos Markdown de un proyecto PAI
 *
 * @param bucket - Instancia de R2Bucket
 * @param cii - Código Id de Inmueble
 * @returns Promise<Record<string, GetFileResult>>
 */
export async function getAllMarkdownArtifacts(
  bucket: R2Bucket,
  cii: string,
): Promise<Record<string, GetFileResult>> {
  const { markdownPrefix } = generateProjectFolderStructure(cii)
  const filenames = generateMarkdownFilenames(cii)

  const results: Record<string, GetFileResult> = {}

  for (const filename of filenames) {
    const key = `${markdownPrefix}${filename}`
    try {
      const object = await bucket.get(key)
      if (object) {
        const tipo = filename.replace(`${cii}_`, '').replace('.md', '')
        results[tipo] = {
          content: await object.arrayBuffer(),
          metadata: object.customMetadata || {},
        }
      }
    } catch (error) {
      console.error(`Error al recuperar ${filename} para CII ${cii}:`, error)
    }
  }

  return results
}

/**
 * Elimina todos los archivos Markdown de un proyecto PAI
 * Se usa para re-ejecución del análisis
 * El IJSON original NO se elimina
 *
 * @param bucket - Instancia de R2Bucket
 * @param cii - Código Id de Inmueble
 * @returns Promise<void>
 */
export async function deleteMarkdownArtifacts(
  bucket: R2Bucket,
  cii: string,
): Promise<void> {
  const { markdownPrefix } = generateProjectFolderStructure(cii)
  const filenames = generateMarkdownFilenames(cii)

  for (const filename of filenames) {
    const key = `${markdownPrefix}${filename}`
    try {
      await bucket.delete(key)
    } catch (error) {
      console.error(`Error al eliminar ${filename} para CII ${cii}:`, error)
    }
  }
}

/**
 * Elimina un proyecto PAI completo (carpeta y todos sus archivos)
 *
 * @param bucket - Instancia de R2Bucket
 * @param cii - Código Id de Inmueble
 * @returns Promise<void>
 */
export async function deleteProjectFolder(
  bucket: R2Bucket,
  cii: string,
): Promise<void> {
  const { projectFolder } = generateProjectFolderStructure(cii)

  try {
    // Listar todos los objetos en la carpeta del proyecto
    const listed = await bucket.list({ prefix: projectFolder })

    // Eliminar todos los objetos
    for (const object of listed.objects) {
      await bucket.delete(object.key)
    }
  } catch (error) {
    console.error(`Error al eliminar carpeta del proyecto CII ${cii}:`, error)
  }
}

