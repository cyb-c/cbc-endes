/**
 * IA Provider Registry — Router de proveedores de IA
 *
 * Selecciona el proveedor basado en la variable IA_PROVIDER en KV.
 * Los servicios importan executePrompt() y formatIAError() de aquí.
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'
import type { IAProvider, IAResult } from './provider-types'
import { openaiProvider, formatOpenAIError } from './openai-client'
import { zaiProvider } from './zai-provider'

/**
 * Registry de proveedores — cada key coincide con el valor de IA_PROVIDER en KV
 */
const REGISTRY: Record<string, IAProvider> = {
  'openaiProvider': openaiProvider,
  'zaiProvider': zaiProvider,
  // Alias para compatibilidad
  'openai': openaiProvider,
  'zai': zaiProvider,
  // Más providers en sprints siguientes:
  // 'qwenProvider': qwenProvider,
  // 'deepseekProvider': deepseekProvider,
  // 'geminiProvider': geminiProvider,
  // 'anthropicProvider': anthropicProvider,
}

/**
 * Ejecuta un prompt contra el proveedor activo.
 *
 * @param env - Environment bindings
 * @param promptName - Nombre del prompt (ej. '00_CrearProyecto.json')
 * @param inputs - Inputs para reemplazar placeholders (ej. { ijson: "..." })
 * @param tracking - Contexto de tracking opcional
 */
export async function executePrompt(
  env: Env,
  promptName: string,
  inputs: Record<string, string>,
  tracking?: TrackingContext,
): Promise<IAResult> {
  const providerName = (await env.secrets_kv.get('IA_PROVIDER')) || 'openaiProvider'

  const provider = REGISTRY[providerName]
  if (!provider) {
    throw new Error(
      `Proveedor IA no soportado: ${providerName}. Disponibles: ${Object.keys(REGISTRY).join(', ')}`,
    )
  }

  return provider.execute(env, promptName, inputs, tracking)
}

/**
 * Formatear error genérico de IA
 */
export function formatIAError(error: unknown): string {
  return formatOpenAIError(error)
}
