/**
 * Environment configuration module
 * Provides typed accessors for Cloudflare bindings and environment variables
 *
 * Following R4: Accessores tipados para bindings
 */

export interface Env {
  // D1 Database binding
  db_binding_01: D1Database;
  // R2 Bucket binding
  r2_binding_01: R2Bucket;
  // KV Namespace for secrets
  secrets_kv: KVNamespace;
}

/**
 * Get the D1 database binding from environment
 *
 * @param env - Cloudflare environment bindings
 * @returns D1 database instance
 */
export function getDB(env: Env): D1Database {
  if (!env.db_binding_01) {
    throw new Error('D1 database binding "db_binding_01" is not configured');
  }
  return env.db_binding_01;
}

/**
 * Get the R2 bucket binding from environment
 *
 * @param env - Cloudflare environment bindings
 * @returns R2 bucket instance
 */
export function getR2Bucket(env: Env): R2Bucket {
  if (!env.r2_binding_01) {
    throw new Error('R2 bucket binding "r2_binding_01" is not configured');
  }
  return env.r2_binding_01;
}

/**
 * Get the KV namespace for secrets from environment
 *
 * @param env - Cloudflare environment bindings
 * @returns KV namespace instance
 */
export function getSecretsKV(env: Env): KVNamespace {
  if (!env.secrets_kv) {
    throw new Error('KV namespace binding "secrets_kv" is not configured');
  }
  return env.secrets_kv;
}
