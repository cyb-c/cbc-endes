# 006-Guia-Pruebas-Despliegue.md

---

## Índice de Contenido

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Estrategia de Pruebas](#2-estrategia-de-pruebas)
3. [Casos de Prueba - Backend](#3-casos-de-prueba---backend)
4. [Casos de Prueba - Frontend](#4-casos-de-prueba---frontend)
5. [Procedimiento de Despliegue](#5-procedimiento-de-despliegue)
6. [Verificación Post-Despliegue](#6-verificación-post-despliegue)
7. [Rollback](#7-rollback)

---

## 1. Resumen Ejecutivo

### 1.1 Propósito

Este documento define la estrategia de pruebas y el procedimiento de despliegue para el **Workflow de Análisis Inmobiliario con IA Real**.

### 1.2 Entornos

| Entorno | URL | Propósito |
|---------|-----|-----------|
| **Local** | `localhost:8787` (Worker), `localhost:5173` (Frontend) | Desarrollo y pruebas unitarias |
| **Dev** | `wk-backend-dev.cbconsulting.workers.dev` | Pruebas de integración |
| **Production** | `wk-backend.cbconsulting.workers.dev` | Producción |

### 1.3 Criterios de Aceptación

| Criterio | Descripción |
|----------|-------------|
| **Pruebas unitarias** | 100% de funciones críticas cubiertas |
| **Pruebas de integración** | Todos los endpoints probados |
| **Pruebas E2E** | Flujo completo probado en dev |
| **Despliegue** | Sin errores de compilación |
| **Post-despliegue** | Health check exitoso |

---

## 2. Estrategia de Pruebas

### 2.1 Pirámide de Pruebas

```
                    ┌───────────┐
                    │   E2E     │  ← Pocas, flujo completo
                   ─┴───────────┴─
                  ┌───────────────┐
                  │  Integración  │  ← Endpoints, R2, D1
                 ─┴───────────────┴─
                ┌───────────────────┐
                │    Unitarias      │  ← Muchas, funciones aisladas
               ─┴───────────────────┴─
```

### 2.2 Tipos de Pruebas

| Tipo | Herramienta | Cobertura | Ejecución |
|------|-------------|-----------|-----------|
| **Unitarias** | Vitest | Funciones puras | `npm test` |
| **Integración** | Vitest + Miniflare | Endpoints, bindings | `npm run test:integration` |
| **E2E** | Playwright | Flujo completo | `npm run test:e2e` |
| **Manuales** | Navegador | UI/UX | Post-despliegue |

### 2.3 Datos de Prueba

```typescript
// Proyecto de prueba para análisis
const proyectoPrueba = {
  id: 1,
  cii: '26030001',
  estado_id: 1,  // CREADO
  titulo: 'Local en venta - Els Orriols, Rascanya',
}

// IJSON de prueba (almacenado en R2)
const ijsonPrueba = {
  url_fuente: 'https://www.idealista.com/inmueble/...',
  titulo_anuncio: 'Local en venta en calle Sant Joan de la Penya, Els Orriols, Rascanya',
  tipo_inmueble: 'local',
  operacion: 'venta',
  precio: '95000',
  superficie_construida_m2: '212',
  ciudad: 'València',
  barrio: 'Els Orriols, Rascanya',
  direccion: 'Calle de Sant Joan de la Penya',
}
```

---

## 3. Casos de Prueba - Backend

### 3.1 Pruebas Unitarias

#### 3.1.1 Validación de Estado

```typescript
// apps/worker/src/services/__tests__/ia-analisis-proyectos.test.ts

import { validarEstadoParaAnalisis } from '../ia-analisis-proyectos'

describe('validarEstadoParaAnalisis', () => {
  test('debe retornar true para estado CREADO (1)', () => {
    expect(validarEstadoParaAnalisis(1)).toBe(true)
  })
  
  test('debe retornar true para estado PROCESANDO_ANALISIS (2)', () => {
    expect(validarEstadoParaAnalisis(2)).toBe(true)
  })
  
  test('debe retornar true para estado ANALISIS_CON_ERROR (3)', () => {
    expect(validarEstadoParaAnalisis(3)).toBe(true)
  })
  
  test('debe retornar true para estado ANALISIS_FINALIZADO (4)', () => {
    expect(validarEstadoParaAnalisis(4)).toBe(true)
  })
  
  test('debe retornar false para estado EVALUANDO_VIABILIDAD (5)', () => {
    expect(validarEstadoParaAnalisis(5)).toBe(false)
  })
  
  test('debe retornar false para estado EVALUANDO_PLAN_NEGOCIO (6)', () => {
    expect(validarEstadoParaAnalisis(6)).toBe(false)
  })
  
  test('debe retornar false para estado SEGUIMIENTO_COMERCIAL (7)', () => {
    expect(validarEstadoParaAnalisis(7)).toBe(false)
  })
  
  test('debe retornar false para estado DESCARTADO (8)', () => {
    expect(validarEstadoParaAnalisis(8)).toBe(false)
  })
})
```

#### 3.1.2 Reemplazo de Placeholders

```typescript
// apps/worker/src/lib/__tests__/openai-client.test.ts

import { reemplazarPlaceholders } from '../openai-client'

describe('reemplazarPlaceholders', () => {
  test('debe reemplazar un solo placeholder', () => {
    const template = '{"input": "%%ijson%%"}'
    const inputs = { ijson: '{"dato": "valor"}' }
    
    const result = reemplazarPlaceholders(template, inputs)
    
    expect(result).toContain('{"dato": "valor"}')
  })
  
  test('debe reemplazar múltiples placeholders', () => {
    const template = `
      {
        "ijson": "%%ijson%%",
        "fisico": "%%analisis-fisico%%",
        "estrategico": "%%analisis-estrategico%%"
      }
    `
    const inputs = {
      ijson: '{"dato": "1"}',
      'analisis-fisico': 'Contenido físico',
      'analisis-estrategico': 'Contenido estratégico',
    }
    
    const result = reemplazarPlaceholders(template, inputs)
    
    expect(result).toContain('{"dato": "1"}')
    expect(result).toContain('Contenido físico')
    expect(result).toContain('Contenido estratégico')
  })
  
  test('debe escapar correctamente los valores para JSON', () => {
    const template = '{"input": "%%ijson%%"}'
    const inputs = { ijson: '{"texto": "con\nnueva\nlínea"}' }
    
    const result = reemplazarPlaceholders(template, inputs)
    
    expect(result).toContain('\\n')  // Nueva línea escapada
  })
})
```

### 3.2 Pruebas de Integración

#### 3.2.1 Ejecución de Análisis Completo

```typescript
// apps/worker/src/handlers/__tests__/pai-proyectos.analisis.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { mockEnv, mockDb, mockR2 } from '../../__mocks__/env'

describe('POST /api/pai/proyectos/:id/analisis', () => {
  beforeEach(() => {
    // Configurar mocks
    mockDb.reset()
    mockR2.reset()
  })
  
  it('debe ejecutar análisis exitosamente para estado CREADO', async () => {
    // 1. Configurar proyecto en BD
    mockDb.prepare.mockResolvedValue({
      first: () => Promise.resolve({
        PRO_id: 1,
        PRO_cii: '26030001',
        PRO_estado_val_id: 1,
        PRO_titulo: 'Test',
      }),
    })
    
    // 2. Configurar IJSON en R2
    mockR2.get.mockResolvedValue({
      text: () => Promise.resolve(JSON.stringify({ titulo_anuncio: 'Test' })),
    })
    
    // 3. Ejecutar request
    const response = await app.request(
      '/api/pai/proyectos/1/analisis',
      { method: 'POST', body: JSON.stringify({ forzar_reejecucion: true }) }
    )
    
    // 4. Validar respuesta
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.exito).toBe(true)
    expect(data.artefactos_generados).toHaveLength(7)
  })
  
  it('debe retornar 403 para estado EVALUANDO_VIABILIDAD', async () => {
    // Configurar proyecto con estado 5
    mockDb.prepare.mockResolvedValue({
      first: () => Promise.resolve({
        PRO_id: 1,
        PRO_cii: '26030001',
        PRO_estado_val_id: 5,  // EVALUANDO_VIABILIDAD
      }),
    })
    
    const response = await app.request(
      '/api/pai/proyectos/1/analisis',
      { method: 'POST' }
    )
    
    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toContain('no permite ejecutar análisis')
  })
  
  it('debe retornar 404 para proyecto inexistente', async () => {
    mockDb.prepare.mockResolvedValue({
      first: () => Promise.resolve(null),
    })
    
    const response = await app.request(
      '/api/pai/proyectos/999/analisis',
      { method: 'POST' }
    )
    
    expect(response.status).toBe(404)
  })
  
  it('debe limpiar MD anteriores antes de re-ejecutar', async () => {
    // Configurar proyecto
    mockDb.prepare.mockResolvedValue({
      first: () => Promise.resolve({
        PRO_id: 1,
        PRO_cii: '26030001',
        PRO_estado_val_id: 4,  // ANALISIS_FINALIZADO
      }),
    })
    
    // Configurar MD existentes en R2
    mockR2.list.mockResolvedValue({
      objects: [
        { key: 'analisis-inmuebles/26030001/26030001_01_activo_fisico.md' },
        { key: 'analisis-inmuebles/26030001/26030001_02_activo_estrategico.md' },
        // ... más MD
      ],
    })
    
    const response = await app.request(
      '/api/pai/proyectos/1/analisis',
      { method: 'POST', body: JSON.stringify({ forzar_reejecucion: true }) }
    )
    
    // Validar que se llamó a delete para cada MD
    expect(mockR2.delete).toHaveBeenCalledTimes(7)
  })
})
```

### 3.3 Pruebas E2E (Backend)

```typescript
// tests/e2e/analisis-workflow.test.ts

import { test, expect } from '@playwright/test'

test.describe('Workflow de Análisis E2E', () => {
  const API_BASE = 'https://wk-backend-dev.cbconsulting.workers.dev'
  
  test('debe ejecutar análisis completo de 7 pasos', async () => {
    // 1. Crear proyecto (o usar uno existente)
    const proyectoId = 1
    
    // 2. Verificar estado inicial
    const proyectoResponse = await fetch(`${API_BASE}/api/pai/proyectos/${proyectoId}`)
    const proyecto = await proyectoResponse.json()
    expect(proyecto.proyecto.estado_id).toBe(1)  // CREADO
    
    // 3. Ejecutar análisis
    const analisisResponse = await fetch(`${API_BASE}/api/pai/proyectos/${proyectoId}/analisis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forzar_reejecucion: true }),
    })
    
    expect(analisisResponse.status).toBe(200)
    const resultado = await analisisResponse.json()
    expect(resultado.exito).toBe(true)
    expect(resultado.artefactos_generados).toHaveLength(7)
    
    // 4. Verificar que el estado cambió a ANALISIS_FINALIZADO (4)
    const proyectoFinalResponse = await fetch(`${API_BASE}/api/pai/proyectos/${proyectoId}`)
    const proyectoFinal = await proyectoFinalResponse.json()
    expect(proyectoFinal.proyecto.estado_id).toBe(4)
    
    // 5. Verificar artefactos en R2
    const artefactosResponse = await fetch(`${API_BASE}/api/pai/proyectos/${proyectoId}/artefactos`)
    const artefactos = await artefactosResponse.json()
    expect(artefactos.artefactos).toHaveLength(7)  // + 2 existentes = 9 totales
  })
})
```

---

## 4. Casos de Prueba - Frontend

### 4.1 Pruebas de Componentes

#### 4.1.1 Botón de Análisis

```typescript
// apps/frontend/src/components/pai/__tests__/BotonEjecutarAnalisis.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BotonEjecutarAnalisis } from '../BotonEjecutarAnalisis'

describe('BotonEjecutarAnalisis', () => {
  it('debe estar habilitado para estado CREADO (1)', () => {
    render(
      <BotonEjecutarAnalisis 
        proyectoId={1} 
        estadoId={1}
        onSuccess={() => {}}
        onError={() => {}}
      />
    )
    
    const boton = screen.getByText('Ejecutar Análisis')
    expect(boton).not.toBeDisabled()
  })
  
  it('debe estar deshabilitado para estado EVALUANDO_VIABILIDAD (5)', () => {
    render(
      <BotonEjecutarAnalisis 
        proyectoId={1} 
        estadoId={5}
        onSuccess={() => {}}
        onError={() => {}}
      />
    )
    
    const boton = screen.getByText('Ejecutar Análisis')
    expect(boton).toBeDisabled()
  })
  
  it('debe mostrar progreso durante la ejecución', async () => {
    render(
      <BotonEjecutarAnalisis 
        proyectoId={1} 
        estadoId={1}
        onSuccess={() => {}}
        onError={() => {}}
      />
    )
    
    const boton = screen.getByText('Ejecutar Análisis')
    fireEvent.click(boton)
    
    await waitFor(() => {
      expect(screen.getByText(/Paso 1 de 7/)).toBeInTheDocument()
    })
  })
})
```

### 4.2 Pruebas E2E (Frontend)

```typescript
// tests/e2e/frontend-analisis.test.ts

import { test, expect } from '@playwright/test'

test.describe('Análisis desde Frontend', () => {
  const FRONTEND_URL = 'https://d00e4cdb.pg-cbc-endes.pages.dev'
  
  test('debe ejecutar análisis desde la UI', async ({ page }) => {
    // 1. Navegar a detalle de proyecto
    await page.goto(`${FRONTEND_URL}/proyectos/1`)
    
    // 2. Verificar que el botón está habilitado
    const botonAnalisis = page.getByText('Ejecutar Análisis')
    await expect(botonAnalisis).toBeEnabled()
    
    // 3. Hacer clic en el botón
    await botonAnalisis.click()
    
    // 4. Esperar indicador de progreso
    await expect(page.getByText(/Paso 1 de 7/)).toBeVisible()
    
    // 5. Esperar finalización
    await expect(page.getByText('Análisis Finalizado')).toBeVisible({ timeout: 120000 })
    
    // 6. Verificar que las 9 pestañas están visibles
    const pestanas = [
      'Resumen Ejecutivo',
      'Datos Transformados',
      'Activo Físico',
      'Activo Estratégico',
      'Activo Financiero',
      'Activo Regulado',
      'Inversor',
      'Emprendedor Operador',
      'Propietario',
    ]
    
    for (const pestana of pestanas) {
      await expect(page.getByText(pestana)).toBeVisible()
    }
  })
})
```

---

## 5. Procedimiento de Despliegue

### 5.1 Pre-Despliegue

#### 5.1.1 Checklist de Verificación

```bash
# 1. Verificar autenticación
npx wrangler whoami

# 2. Ejecutar typecheck
cd apps/worker && npm run typecheck
cd apps/frontend && npm run typecheck

# 3. Ejecutar tests unitarios
cd apps/worker && npm test
cd apps/frontend && npm test

# 4. Ejecutar linter
cd apps/worker && npm run lint
cd apps/frontend && npm run lint
```

#### 5.1.2 Verificación de Cambios

```bash
# Revisar cambios en git
git status
git diff HEAD

# Verificar que todos los archivos nuevos están añadidos
git add .
```

### 5.2 Despliegue del Backend

```bash
# 1. Navegar a directorio del worker
cd /workspaces/cbc-endes/apps/worker

# 2. Desplegar en dev
npm run deploy

# Output esperado:
# Total Upload: X KiB
# Worker Startup Time: Y ms
# Deployment ID: abc123...
# https://wk-backend-dev.cbconsulting.workers.dev
```

### 5.3 Despliegue del Frontend

```bash
# 1. Navegar a directorio del frontend
cd /workspaces/cbc-endes/apps/frontend

# 2. Build
npm run build

# 3. Desplegar en Pages
npx wrangler pages deploy dist --project-name=pg-cbc-endes

# Output esperado:
# ✨ Deployment complete!
# https://d00e4cdb.pg-cbc-endes.pages.dev
```

### 5.4 Actualización de Inventario

```bash
# Notificar al orquestador para que invoque al inventariador
# El inventariador actualizará .governance/inventario_recursos.md
```

---

## 6. Verificación Post-Despliegue

### 6.1 Health Check del Backend

```bash
# Verificar endpoint de health
curl https://wk-backend-dev.cbconsulting.workers.dev/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2026-03-29T...","service":"wk-backend","version":"1.0.0"}
```

### 6.2 Verificación de Endpoints

```bash
# 1. Verificar endpoint de análisis
curl -X POST https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/1/analisis \
  -H "Content-Type: application/json" \
  -d '{"forzar_reejecucion": false}'

# 2. Verificar endpoint de proyecto
curl https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/1

# 3. Verificar endpoint de artefactos
curl https://wk-backend-dev.cbconsulting.workers.dev/api/pai/proyectos/1/artefactos
```

### 6.3 Verificación del Frontend

```bash
# 1. Abrir navegador en URL de dev
# https://d00e4cdb.pg-cbc-endes.pages.dev/proyectos/1

# 2. Verificar:
# - Botón "Ejecutar Análisis" habilitado (si estado_id en 1,2,3,4)
# - 9 pestañas visibles tras ejecutar análisis
# - Contenido Markdown renderizado correctamente
```

### 6.4 Verificación de R2

```bash
# Listar objetos en carpeta de proyecto
npx wrangler r2 object get r2-cbconsulting/analisis-inmuebles/26030001/ --remote

# Verificar existencia de:
# - 26030001.json (IJSON)
# - 26030001_01_activo_fisico.md
# - 26030001_02_activo_estrategico.md
# - ... (7 MD totales)
# - 26030001_log.json (tracking)
```

### 6.5 Verificación de D1

```bash
# Verificar artefactos en BD
npx wrangler d1 execute db-cbconsulting --remote --command "
  SELECT * FROM PAI_ART_artefactos 
  WHERE ART_proyecto_id = 1 
  ORDER BY ART_fecha_generacion DESC
"

# Verificar estado del proyecto
npx wrangler d1 execute db-cbconsulting --remote --command "
  SELECT PRO_id, PRO_cii, PRO_estado_val_id, PRO_fecha_ultima_actualizacion 
  FROM PAI_PRO_proyectos 
  WHERE PRO_id = 1
"
```

---

## 7. Rollback

### 7.1 Criterios de Rollback

| Criterio | Descripción |
|----------|-------------|
| **Error crítico** | Endpoint de análisis no responde |
| **Error de datos** | Artefactos no se guardan correctamente |
| **Error de IA** | OpenAI API retorna errores consistentes |
| **Error de UI** | Frontend no muestra resultados |

### 7.2 Procedimiento de Rollback - Backend

```bash
# 1. Identificar deployment anterior
npx wrangler deployments list --env dev

# 2. Hacer rollback al deployment anterior
npx wrangler rollback --env dev <deployment-id-anterior>
```

### 7.3 Procedimiento de Rollback - Frontend

```bash
# 1. Identificar deployment anterior
npx wrangler pages deployment list --project-name=pg-cbc-endes

# 2. Hacer rollback
npx wrangler pages deployment rollback --project-name=pg-cbc-endes <deployment-id-anterior>
```

### 7.4 Limpieza de Datos (si aplica)

```typescript
// Si el rollback es por datos corruptos, limpiar artefactos
// NOTA: Solo en casos críticos

// Eliminar artefactos de análisis fallido
const cii = '26030001'
const artefactosAEliminar = [
  `${cii}_01_activo_fisico.md`,
  `${cii}_02_activo_estrategico.md`,
  // ... etc.
]

for (const archivo of artefactosAEliminar) {
  await r2Bucket.delete(`analisis-inmuebles/${cii}/${archivo}`)
}

// Revertir estado del proyecto
await db
  .prepare('UPDATE PAI_PRO_proyectos SET PRO_estado_val_id = 1 WHERE PRO_id = ?')
  .bind(proyectoId)
  .run()
```

---

## 8. Monitoreo Post-Despliegue

### 8.1 Wrangler Tail

```bash
# Monitorear logs en tiempo real
cd /workspaces/cbc-endes/apps/worker
npx wrangler tail --env dev
```

### 8.2 Métricas a Observar

| Métrica | Umbral | Acción |
|---------|--------|--------|
| **Latencia p95** | > 30s | Revisar prompts/tokens |
| **Error rate** | > 5% | Investigar causa |
| **Token usage** | Alto | Optimizar prompts |
| **R2 writes** | Fallos | Verificar permisos |

### 8.3 Alertas Configurar

```typescript
// Configurar alertas en Cloudflare Dashboard:
// - Error rate > 5% en 5 minutos
// - Latencia p95 > 30s en 10 minutos
// - R2 write errors > 10 en 1 hora
```

---

**Fecha de creación:** 2026-03-29  
**Autor:** Agente Orquestador  
**Estado:** Pendiente de ejecución  
**Próximo paso:** Ejecutar pruebas tras implementación
