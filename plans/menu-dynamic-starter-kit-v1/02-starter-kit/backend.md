# Backend - Handler del endpoint

```typescript
/**
 * Handler: GET /api/menu
 *
 * Devuelve los ítems del menú visibles, agrupados en módulos.
 */

import { getDB } from '../env'

type Env = Cloudflare.Env

interface MenuRow {
  id: number
  modulo_id: number | null
  tipo_elemento: 'MODULO' | 'FUNCION'
  nombre_interno: string
  nombre_mostrar: string
  descripcion: string | null
  url_path: string | null
  icono: string | null
  orden: number
  activo: number
}

interface MenuModule {
  id: number
  nombre_interno: string
  nombre_mostrar: string
  descripcion: string | null
  icono: string | null
  orden: number
  funciones: MenuFuncion[]
}

interface MenuFuncion {
  id: number
  nombre_interno: string
  nombre_mostrar: string
  descripcion: string | null
  url_path: string
  icono: string | null
  orden: number
}

export async function handleGetMenu(
  _request: Request,
  env: Env,
): Promise<Response> {
  const db = getDB(env)

  const { results } = await db
    .prepare(
      `SELECT id, modulo_id, tipo_elemento, nombre_interno, nombre_mostrar,
              descripcion, url_path, icono, orden, activo
         FROM MOD_modulos_config
         WHERE activo = 1
         ORDER BY modulo_id NULLS FIRST, orden`,
    )
    .all<MenuRow>()

  // Agrupar funciones bajo su módulo padre
  const modulosMap = new Map<number, MenuModule>()
  const funciones: MenuRow[] = []

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
      })
    } else {
      funciones.push(row)
    }
  }

  for (const fn of funciones) {
    const parent = modulosMap.get(fn.modulo_id!)
    if (parent) {
      parent.funciones.push({
        id: fn.id,
        nombre_interno: fn.nombre_interno,
        nombre_mostrar: fn.nombre_mostrar,
        descripcion: fn.descripcion,
        url_path: fn.url_path ?? '',
        icono: fn.icono,
        orden: fn.orden,
      })
    }
  }

  const data = Array.from(modulosMap.values()).sort((a, b) => a.orden - b.orden)

  return Response.json({ data })
}
```

## Integración en el router

```typescript
import { handleGetMenu } from './handlers/menu'

// En tu archivo principal del Worker (ej: src/index.ts)
router.get('/api/menu', handleGetMenu)
```

## Configuración wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tu-worker",
  "main": "src/index.ts",
  "compatibility_date": "2025-10-08",
  
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "tu-base-datos",
      "database_id": "tu-database-id"
    }
  ]
}
```
