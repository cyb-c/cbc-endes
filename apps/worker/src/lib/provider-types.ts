/**
 * Shared types for the multi-provider IA system
 *
 * Every IA provider (OpenAI, Z.AI, Qwen, DeepSeek, Gemini, Anthropic)
 * must implement the IAProvider interface.
 */

import type { Env } from '../env'
import type { TrackingContext } from './tracking'

/**
 * Generic result from an IA provider execution
 */
export interface IAResult {
  text: string
  raw: unknown
  usage?: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
  }
}

/**
 * Contract that every IA provider must implement.
 * The registry in ia-provider.ts uses this to route calls.
 */
export interface IAProvider {
  /** Provider name — matches IA_PROVIDER value in KV */
  name: string
  /** Execute a prompt against this provider */
  execute: (
    env: Env,
    promptName: string,
    inputs: Record<string, string>,
    tracking?: TrackingContext,
  ) => Promise<IAResult>
}
