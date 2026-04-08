/**
 * Z.AI (GLM) Provider — Chat Completions API
 *
 * Lee prompts desde prompts-ia/zaiProvider/ en formato Chat Completions
 * y los ejecuta contra https://api.z.ai/api/paas/v4/chat/completions
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'
import { registrarEvento, registrarError } from './tracking'
import type { IAProvider, IAResult } from './provider-types'

const PROMPT_PREFIX = 'prompts-ia/zaiProvider/'
const ZAI_API_URL = 'https://api.z.ai/api/paas/v4/chat/completions'

function reemplazarPlaceholders(promptRaw: string, inputs: Record<string, string>): string {
  let text = promptRaw
  for (const [key, value] of Object.entries(inputs)) {
    // Escape value for safe JSON string insertion (same as openai-client.ts)
    const escapedValue = JSON.stringify(value).slice(1, -1)
    text = text.replace(new RegExp(`%%${key}%%`, 'g'), escapedValue)
  }
  return text
}

async function execute(
  env: Env,
  promptName: string,
  inputs: Record<string, string>,
  tracking?: TrackingContext,
): Promise<IAResult> {
  if (tracking) registrarEvento(tracking, 'ia-inicio', 'INFO', 'Iniciando llamada a Z.AI', {
    provider: 'zai', prompt: promptName,
  })

  const apiKey = await env.secrets_kv.get('ZAI_API_KEY')
  if (!apiKey) throw new Error('ZAI_API_KEY no encontrada en KV')

  const promptObject = await env.r2_binding_01.get(`${PROMPT_PREFIX}${promptName}`)
  if (!promptObject) throw new Error(`Prompt no encontrado: ${PROMPT_PREFIX}${promptName}`)

  const promptTemplate = await promptObject.text()
  const promptBody = reemplazarPlaceholders(promptTemplate, inputs)
  const parsed = JSON.parse(promptBody)

  if (tracking) registrarEvento(tracking, 'ia-llamar-api', 'INFO', 'Llamando a Z.AI', {
    provider: 'zai', model: parsed.model,
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180000)

  const response = await fetch(ZAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(parsed),
    signal: controller.signal,
  })

  clearTimeout(timeoutId)

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Z.AI API error ${response.status}: ${body}`)
  }

  const data = await response.json() as Record<string, unknown>
  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined
  const text = choices?.[0]?.message?.content || ''

  if (!text) throw new Error('Z.AI no generó contenido')

  const usage = data.usage as Record<string, number> | undefined

  if (tracking) registrarEvento(tracking, 'ia-completado', 'INFO', 'Z.AI completada', {
    provider: 'zai', response_length: text.length,
  })

  return {
    text,
    raw: data,
    usage: usage ? {
      input_tokens: usage.prompt_tokens || 0,
      output_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
    } : undefined,
  }
}

export const zaiProvider: IAProvider = { name: 'zaiProvider', execute }
export function formatZAIError(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}
