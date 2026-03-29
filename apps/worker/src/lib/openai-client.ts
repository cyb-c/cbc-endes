/**
 * OpenAI Client - Shared module for LLM integration
 * 
 * Following R4: Accesores tipados para bindings
 * Following R2: Cero hardcoding - API key from KV, prompts from R2
 * 
 * This module provides a reusable interface for executing prompts against OpenAI
 * It is designed to be used by both Workers and Workflows
 */

import type { Env } from '../env'

import type { TrackingContext } from './tracking'
import { registrarEvento, registrarError } from './tracking'

/**
 * Prompt request structure for OpenAI Responses API
 */
export interface PromptRequest {
  model: string
  instructions: string
  input: Array<{
    role: 'user'
    content: Array<{
      type: 'input_text'
      text: string
    }>
  }>
}

/**
 * Prompt result structure
 */
export interface PromptResult {
  text: string
  raw: unknown
  usage?: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
  }
}

/**
 * OpenAI error classification
 */
export type OpenAIErrorType = 
  | 'RATE_LIMIT'      // 429
  | 'AUTHENTICATION'  // 401
  | 'PERMISSION'      // 403
  | 'NOT_FOUND'       // 404
  | 'INVALID_REQUEST' // 400
  | 'SERVER_ERROR'    // 500/502/503/504
  | 'UNKNOWN'

/**
 * Classified OpenAI error
 */
export interface ClassifiedOpenAIError extends Error {
  type: OpenAIErrorType
  statusCode?: number
  retryable: boolean
}

/**
 * Execute a prompt against OpenAI Responses API
 * 
 * @param env - Environment bindings (for KV and R2)
 * @param promptName - Name of the prompt file in R2 (e.g., '00_CrearProyecto.json')
 * @param inputJson - JSON input to substitute for %%ijson%% placeholder
 * @param tracking - Optional tracking context
 * @returns Promise with normalized result
 */
export async function executePrompt(
  env: Env,
  promptName: string,
  inputJson: string,
  tracking?: TrackingContext,
): Promise<PromptResult> {
  if (tracking) {
    registrarEvento(tracking, 'openai-inicio', 'INFO', 'Iniciando llamada a OpenAI', {
      prompt: promptName,
    })
  }

  // Get API key from KV
  if (tracking) {
    registrarEvento(tracking, 'openai-obtener-api-key', 'INFO', 'Obteniendo API key desde KV')
  }
  const apiKey = await getOpenAIApiKey(env, tracking)
  
  // Load prompt template from R2
  if (tracking) {
    registrarEvento(tracking, 'openai-cargar-prompt', 'INFO', 'Cargando prompt desde R2', {
      key: `prompts-ia/${promptName}`,
    })
  }
  const promptTemplate = await loadPromptFromR2(env, promptName, tracking)
  
  // Substitute placeholder with escaped input JSON
  if (tracking) {
    registrarEvento(tracking, 'openai-preparar-request', 'INFO', 'Preparando request body')
  }
  const requestBody = prepareRequestBody(promptTemplate, inputJson)
  
  // Execute against OpenAI Responses API
  if (tracking) {
    registrarEvento(tracking, 'openai-llamar-api', 'INFO', 'Llamando a OpenAI Responses API', {
      model: requestBody.model,
    })
  }
  const result = await callOpenAIResponses(apiKey, requestBody, tracking)
  
  if (tracking) {
    registrarEvento(tracking, 'openai-completado', 'INFO', 'Llamada a OpenAI completada', {
      response_length: result.text?.length || 0,
    })
  }
  
  return result
}

/**
 * Get OpenAI API key from KV namespace
 */
async function getOpenAIApiKey(env: Env, tracking?: TrackingContext): Promise<string> {
  try {
    const apiKey = await env.secrets_kv.get('OPENAI_API_KEY')

    if (!apiKey) {
      const error = new Error('OPENAI_API_KEY not found in KV namespace secretos-cbconsulting')
      if (tracking) registrarError(tracking, 'openai-kv-api-key-missing', error)
      throw error
    }
    
    if (tracking) {
      registrarEvento(tracking, 'openai-api-key-obtenida', 'INFO', 'API key obtenida desde KV', {
        key_length: apiKey.length,
        key_prefix: apiKey.substring(0, 10) + '...',
      })
    }

    return apiKey
  } catch (error) {
    if (tracking) registrarError(tracking, 'openai-kv-error', error)
    if (error instanceof Error && error.message.includes('KV')) {
      throw error
    }
    throw new Error(`Failed to retrieve OPENAI_API_KEY from KV: ${(error as Error).message}`)
  }
}

/**
 * Load prompt template from R2 bucket
 */
async function loadPromptFromR2(env: Env, promptName: string, tracking?: TrackingContext): Promise<string> {
  try {
    const key = `prompts-ia/${promptName}`
    const object = await env.r2_binding_01.get(key)

    if (!object) {
      const error = new Error(`Prompt file not found: ${key}`)
      if (tracking) registrarError(tracking, 'openai-r2-prompt-not-found', error, { key })
      throw error
    }
    
    const text = await object.text()
    
    if (tracking) {
      registrarEvento(tracking, 'openai-prompt-cargado', 'INFO', 'Prompt cargado desde R2', {
        key,
        size_bytes: text.length,
      })
    }

    return text
  } catch (error) {
    if (tracking) registrarError(tracking, 'openai-r2-error', error)
    throw new Error(`Failed to load prompt from R2: ${(error as Error).message}`)
  }
}

/**
 * Prepare request body by substituting placeholder with input JSON
 */
function prepareRequestBody(promptTemplate: string, inputJson: string): PromptRequest {
  try {
    // Escape the input JSON for safe substitution in JSON string
    const escapedInputJson = JSON.stringify(inputJson).slice(1, -1)
    
    // Substitute placeholder
    const requestBodyRaw = promptTemplate.replace('%%ijson%%', escapedInputJson)
    
    // Parse to validate JSON structure
    const requestBody = JSON.parse(requestBodyRaw) as PromptRequest
    
    return requestBody
  } catch (error) {
    throw new Error(`Failed to prepare request body: ${(error as Error).message}`)
  }
}

/**
 * Extract text from OpenAI Responses API output
 * Supports multiple output formats
 */
function extractTextFromOutput(data: Record<string, unknown>, tracking?: TrackingContext): string {
  // Format 1: Direct output_text (legacy/simple)
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    if (tracking) {
      registrarEvento(tracking, 'openai-extract-method', 'DEBUG', 'Extracted from output_text')
    }
    return data.output_text
  }
  
  // Format 2: output array (Responses API)
  if (Array.isArray(data.output) && data.output.length > 0) {
    const outputs = data.output as Array<Record<string, unknown>>
    
    if (tracking) {
      registrarEvento(tracking, 'openai-output-array', 'DEBUG', 'Processing output array', {
        output_length: outputs.length,
        output_types: outputs.map(o => o.type).filter(Boolean),
      })
    }
    
    const textParts: string[] = []
    
    for (const item of outputs) {
      // Skip non-message items (reasoning, etc.)
      if (item.type === 'message' && Array.isArray(item.content)) {
        const contents = item.content as Array<Record<string, unknown>>
        
        for (const content of contents) {
          // Try different text field names
          if (typeof content.text === 'string' && content.text.trim()) {
            textParts.push(content.text)
          }
          // Some variants use 'content' field
          else if (typeof content.content === 'string' && content.content.trim()) {
            textParts.push(content.content)
          }
          // Structured output might have 'json' field
          else if (content.json) {
            textParts.push(JSON.stringify(content.json))
          }
        }
      }
      // Some responses have text directly on the item
      else if (typeof item.text === 'string' && item.text.trim()) {
        textParts.push(item.text)
      }
    }
    
    if (textParts.length > 0) {
      if (tracking) {
        registrarEvento(tracking, 'openai-extract-success', 'DEBUG', 'Extracted text from output array', {
          parts_count: textParts.length,
          total_length: textParts.join('').length,
        })
      }
      return textParts.join('\n')
    }
  }
  
  // No text found
  if (tracking) {
    registrarEvento(tracking, 'openai-extract-failed', 'WARN', 'No text found in response', {
      has_output_text: !!data.output_text,
      has_output: Array.isArray(data.output) ? data.output.length : false,
    })
  }
  
  return ''
}

/**
 * Call OpenAI Responses API
 */
export async function callOpenAIResponses(
  apiKey: string,
  requestBody: PromptRequest,
  tracking?: TrackingContext,
): Promise<PromptResult> {
  const url = 'https://api.openai.com/v1/responses'
  
  if (tracking) {
    registrarEvento(tracking, 'openai-http-request', 'INFO', 'Enviando HTTP POST a OpenAI', {
      url,
      model: requestBody.model,
    })
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })
    
    if (tracking) {
      registrarEvento(tracking, 'openai-http-response', 'INFO', 'Respuesta HTTP recibida', {
        status: response.status,
        statusText: response.statusText,
      })
    }
    
    if (!response.ok) {
      const error = await classifyOpenAIError(response)
      if (tracking) registrarError(tracking, 'openai-http-error', error, {
        status: response.status,
      })
      throw error
    }
    
    const data = await response.json() as Record<string, unknown>
    
    // Capturar respuesta completa para debugging
    if (tracking) {
      registrarEvento(tracking, 'openai-raw-response', 'DEBUG', 'Respuesta completa de OpenAI', {
        raw_response: data,
        has_output_text: !!data.output_text,
        has_output: !!data.output,
        output_type: Array.isArray(data.output) ? 'array' : typeof data.output,
        has_usage: !!data.usage,
        model: data.model,
        status: data.status,
      })
    }
    
    // Extraer texto de la respuesta - Soportar múltiples formatos
    let outputText = extractTextFromOutput(data, tracking)
    
    if (tracking) {
      registrarEvento(tracking, 'openai-extract-text', 'INFO', 'Extrayendo texto de respuesta', {
        output_text_length: outputText.length,
        output_text_preview: outputText.substring(0, 500),
        extraction_method: outputText.length > 0 ? 'success' : 'failed',
      })
    }

    // Normalize response according to Responses API structure
    const result: PromptResult = {
      text: outputText,
      raw: data,
      usage: data.usage ? {
        input_tokens: (data.usage as Record<string, number>).input_tokens || 0,
        output_tokens: (data.usage as Record<string, number>).output_tokens || 0,
        total_tokens: ((data.usage as Record<string, number>).input_tokens || 0) + 
                      ((data.usage as Record<string, number>).output_tokens || 0),
      } : undefined,
    }
    
    if (tracking) {
      registrarEvento(tracking, 'openai-result', 'INFO', 'Resultado normalizado', {
        text_length: result.text.length,
        total_tokens: result.usage?.total_tokens,
      })
    }

    return result
  } catch (error) {
    if (tracking) registrarError(tracking, 'openai-fetch-error', error)
    if (error instanceof Error && error.name === 'ClassifiedOpenAIError') {
      throw error
    }
    throw new Error(`Failed to call OpenAI Responses API: ${(error as Error).message}`)
  }
}

/**
 * Classify OpenAI error for proper handling
 */
async function classifyOpenAIError(response: Response): Promise<ClassifiedOpenAIError> {
  let errorBody: { error?: { message?: string; type?: string } } | undefined
  
  try {
    errorBody = await response.json()
  } catch {
    errorBody = undefined
  }
  
  const errorMessage = errorBody?.error?.message || `HTTP ${response.status}`
  const errorType: OpenAIErrorType = getErrorTypeFromStatus(response.status)
  
  const error = new Error(errorMessage) as ClassifiedOpenAIError
  error.name = 'ClassifiedOpenAIError'
  error.type = errorType
  error.statusCode = response.status
  error.retryable = isRetryableError(errorType)
  
  return error
}

/**
 * Map HTTP status to error type
 */
function getErrorTypeFromStatus(status: number): OpenAIErrorType {
  switch (status) {
    case 429:
      return 'RATE_LIMIT'
    case 401:
      return 'AUTHENTICATION'
    case 403:
      return 'PERMISSION'
    case 404:
      return 'NOT_FOUND'
    case 400:
      return 'INVALID_REQUEST'
    case 500:
    case 502:
    case 503:
    case 504:
      return 'SERVER_ERROR'
    default:
      return 'UNKNOWN'
  }
}

/**
 * Determine if error is retryable
 */
function isRetryableError(type: OpenAIErrorType): boolean {
  switch (type) {
    case 'RATE_LIMIT':
    case 'SERVER_ERROR':
      return true
    default:
      return false
  }
}

/**
 * Parse OpenAI error for logging
 */
export function formatOpenAIError(error: unknown): string {
  if (error instanceof Error) {
    const classified = error as ClassifiedOpenAIError
    if (classified.type) {
      return `[${classified.type}] ${error.message} (retryable: ${classified.retryable})`
    }
    return error.message
  }
  return String(error)
}
