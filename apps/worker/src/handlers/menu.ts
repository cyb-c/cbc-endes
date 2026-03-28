/**
 * Handler: GET /api/menu
 *
 * Devuelve los ítems del menú visibles, agrupados en módulos.
 *
 * Following R2: Cero hardcoding - uses environment bindings
 * Following R4: Accesores tipados para bindings
 */

import { Context } from 'hono';
import { getDB } from '../env';

type Env = import('../env').Env;

type AppBindings = {
  db_binding_01: D1Database;
  r2_binding_01: R2Bucket;
  secrets_kv: KVNamespace;
};

type AppContext = Context<{ Bindings: AppBindings }>;

interface MenuRow {
  id: number;
  modulo_id: number | null;
  tipo_elemento: 'MODULO' | 'FUNCION';
  nombre_interno: string;
  nombre_mostrar: string;
  descripcion: string | null;
  url_path: string | null;
  icono: string | null;
  orden: number;
  activo: number;
}

interface MenuModule {
  id: number;
  nombre_interno: string;
  nombre_mostrar: string;
  descripcion: string | null;
  icono: string | null;
  orden: number;
  funciones: MenuFuncion[];
}

interface MenuFuncion {
  id: number;
  nombre_interno: string;
  nombre_mostrar: string;
  descripcion: string | null;
  url_path: string;
  icono: string | null;
  orden: number;
}

/**
 * Handle GET /api/menu
 *
 * Returns the menu structure with active items grouped by modules
 *
 * @param c - Hono context
 * @returns JSON response with menu data
 */
export async function handleGetMenu(c: AppContext): Promise<Response> {
  const db = getDB(c.env);

  const { results } = await db
    .prepare(
      `SELECT id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar,
              descripcion, url_path, icono, orden, activo
         FROM MOD_modulos_config
         WHERE activo = 1
         ORDER BY modulo_id NULLS FIRST, orden`,
    )
    .all<MenuRow>();

  // Agrupar funciones bajo su módulo padre
  const modulosMap = new Map<number, MenuModule>();
  const funciones: MenuRow[] = [];

  for (const row of results) {
    if (row.tipo_elemento === 'MODULO') {
      modulosMap.set(row.id, {
        id: row.id,
        nombre_interno: row.nombre_interno,
        nombre_mostrar: row.nombre_mostrar,
        descripcion: row.descripcion,
        icono: row.icono,
        orden: row.orden,
        funciones: [],
      });
    } else {
      funciones.push(row);
    }
  }

  for (const fn of funciones) {
    const parent = modulosMap.get(fn.modulo_id!);
    if (parent) {
      parent.funciones.push({
        id: fn.id,
        nombre_interno: fn.nombre_interno,
        nombre_mostrar: fn.nombre_mostrar,
        descripcion: fn.descripcion,
        url_path: fn.url_path ?? '',
        icono: fn.icono,
        orden: fn.orden,
      });
    }
  }

  const data = Array.from(modulosMap.values()).sort((a, b) => a.orden - b.orden);

  return Response.json({ data });
}
