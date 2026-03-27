/**
 * Environment configuration module
 * Provides typed accessors for Cloudflare bindings and environment variables
 * 
 * Following R4: Accessores tipados para bindings
 */

export interface Env {
  // D1 Database binding
  db_binding_01: D1Database;
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
