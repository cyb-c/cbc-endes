# Patrón de Menú Dinámico v1 - Arquitectura

**Versión**: 1.0  
**Fecha**: 2026-03-27  
**Nombre del activo**: menu-dynamic-starter-kit-v1

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Componentes del patrón](#3-componentes-del-patrón)
4. [Arquitectura y flujo de datos](#4-arquitectura-y-flujo-de-datos)
5. [Decisiones de diseño y trade-offs](#5-decisiones-de-diseño-y-trade-offs)
6. [Limitaciones de versión 1](#6-limitaciones-de-versión-1)
7. [Roadmap de versión 2](#7-roadmap-de-versión-2)
8. [Riesgos y mitigaciones](#8-riesgos-y-mitigaciones)

---

## 1. Resumen ejecutivo

El patrón de menú dinámico v1 es un mecanismo de configuración centralizada que permite controlar la estructura del menú lateral de una aplicación sin modificar código.

Se basa en una tabla de base de datos que define la jerarquía de módulos y funciones, un endpoint backend que expone esta configuración, y componentes frontend que la consumen y renderizan.

**Características principales**:
- Activación/desactivación de elementos sin desplegar código
- Ordenamiento configurable de módulos y funciones
- Separación entre configuración y código
- Implementación simple y fácil de adoptar

**Tecnologías objetivo**:
- Backend: Cloudflare Workers + D1
- Frontend: UI agnóstico (ejemplos en React, pero adaptable a otros frameworks)

---

## 2. Problema que resuelve

### Problemas abordados

1. **Menú hardcodeado en frontend**: Los cambios en la estructura del menú requieren modificar código y desplegar

2. **Dificultad para activar/desactivar funcionalidades**: No hay mecanismo simple para habilitar o deshabilitar secciones sin tocar código

3. **Falta de flexibilidad en ordenamiento**: El orden de elementos está fijado en código

4. **Acoplamiento entre configuración y lógica de negocio**: Las decisiones de UX están mezcladas con el código de negocio

### Solución propuesta

Un patrón de configuración dinámica donde:
- La estructura del menú se define en base de datos
- El frontend obtiene esta configuración en tiempo de ejecución
- Los cambios en configuración no requieren despliegue de código

---

## 3. Componentes del patrón

### 3.1. Tabla de configuración de menú

**Nombre**: `MOD_modulos_config`

**Propósito**: Almacenar la estructura jerárquica del menú (módulos y funciones)

**Esquema SQL**:

```sql
CREATE TABLE MOD_modulos_config (
  id INTEGER PRIMARY KEY,
  
  -- Jerarquía autorreferencial
  modulo_id INTEGER REFERENCES MOD_modulos_config(id) ON DELETE CASCADE,
  
  -- Tipo de elemento
  tipo_elemento TEXT NOT NULL CHECK(tipo_elemento IN ('MODULO','FUNCION')),
  
  -- Identificadores
  nombre_interno TEXT NOT NULL UNIQUE,
  nombre_mostrar TEXT NOT NULL,
  
  -- Metadatos
  descripcion TEXT,
  url_path TEXT,
  icono TEXT,
  
  -- Control de visibilidad
  orden INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  
  -- Auditoría
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices para optimizar consultas
CREATE INDEX idx_menu_modulo ON MOD_modulos_config(modulo_id);
CREATE INDEX idx_menu_tipo ON MOD_modulos_config(tipo_elemento);
CREATE INDEX idx_menu_orden ON MOD_modulos_config(orden);
CREATE INDEX idx_menu_activo ON MOD_modulos_config(activo);
```

**Campos clave**:

| Campo | Descripción |
|--------|-------------|
| `id` | Identificador único del elemento |
| `modulo_id` | NULL para módulos raíz, ID del módulo padre para funciones |
| `tipo_elemento` | 'MODULO' para secciones principales, 'FUNCION' para opciones navegables |
| `nombre_interno` | Código estable para lógica de negocio (ej: 'MOD_PANEL', 'DASHBOARD') |
| `nombre_mostrar` | Clave para sistema de textos (ej: 'menu.modulos.panel') |
| `url_path` | Ruta de navegación (NULL para módulos) |
| `icono` | Nombre del icono (depende del sistema de iconos del frontend) |
| `orden` | Orden de visualización |
| `activo` | 1 = visible, 0 = oculto |

### 3.2. Endpoint backend

**Ruta**: `GET /api/menu`

**Propósito**: Devolver la estructura del menú filtrada por elementos activos

**Respuesta JSON**:

```json
{
  "data": [
    {
      "id": 1,
      "nombre_interno": "MOD_PANEL",
      "nombre_mostrar": "menu.modulos.panel",
      "icono": "layout-dashboard",
      "orden": 1,
      "funciones": [
        {
          "id": 9,
          "nombre_interno": "DASHBOARD",
          "nombre_mostrar": "menu.funciones.dashboard",
          "url_path": "/dashboard",
          "icono": "home",
          "orden": 1
        }
      ]
    }
  ]
}
```

**Lógica**:
1. Consulta elementos activos de la tabla
2. Agrupa funciones bajo su módulo padre
3. Devuelve estructura anidada

### 3.3. Hook de obtención de menú (frontend)

**Propósito**: Encapsular la lógica de obtención del menú desde el backend

**Responsabilidades**:
- Llamar al endpoint `/api/menu`
- Almacenar resultado en estado local
- Gestionar estados de carga y error

### 3.4. Componentes de renderizado (frontend)

**Componentes principales**:

| Componente | Responsabilidad |
|------------|-----------------|
| `SidebarModule` | Renderiza un módulo con sus funciones, maneja expansión/colapso |
| `SidebarItem` | Renderiza una función de menú, maneja navegación y estado activo |
| `AppSidebar` | Componente contenedor que mapea módulos a `SidebarModule` |

### 3.5. Sistema de textos simple

**Propósito**: Proporcionar textos localizados para el menú

**Implementación**: Archivo de constantes con claves y valores

**Ejemplo**:

```javascript
// i18n/es-ES.js
export const MENU_TEXTS = {
  'menu.modulos.panel': 'Panel',
  'menu.modulos.facturacion': 'Facturación',
  'menu.funciones.dashboard': 'Dashboard',
  'menu.funciones.facturas_emitidas': 'Facturas emitidas',
  // ...
}
```

---

## 4. Arquitectura y flujo de datos

### 4.1. Diagrama de arquitectura

```mermaid
graph TB
    subgraph Base de Datos D1
        DB[MOD_modulos_config]
    end
    
    subgraph Backend Worker
        API[GET /api/menu]
    end
    
    subgraph Frontend
        HM[useMenu hook]
        AS[AppSidebar]
        SM[SidebarModule]
        SI[SidebarItem]
        I18N[Sistema de textos]
    end
    
    DB -->|SELECT WHERE activo=1| API
    API -->|JSON: modules[]| HM
    HM -->|modules| AS
    AS -->|map| SM
    SM -->|map| SI
    I18N -->|textos| AS
    SI -->|url_path| Navegación
```

### 4.2. Flujo de datos

1. **Inicialización**: El componente `AppSidebar` se monta
2. **Obtención**: El hook `useMenu` llama a `/api/menu`
3. **Consulta**: El backend consulta `MOD_modulos_config` WHERE activo=1
4. **Agrupación**: El backend agrupa funciones bajo módulos padre
5. **Respuesta**: El backend devuelve JSON con estructura anidada
6. **Almacenamiento**: El hook almacena los módulos en estado local
7. **Renderizado**: `AppSidebar` mapea módulos a `SidebarModule`
8. **Resolución de textos**: Los componentes resuelven claves i18n usando el sistema de textos
9. **Navegación**: Al hacer clic en un `SidebarItem`, se navega a su `url_path`

---

## 5. Decisiones de diseño y trade-offs

### 5.1. Jerarquía autorreferencial

**Decisión**: Usar una sola tabla con autorreferencia (`modulo_id`)

**Justificación**:
- Simplicidad: una sola tabla para toda la jerarquía
- Flexibilidad: permite profundidad arbitraria
- Integridad referencial: ON DELETE CASCADE mantiene consistencia

**Trade-off**:
- Consultas más complejas para obtener estructura anidada
- Requiere lógica de agrupación en backend

### 5.2. Separación entre módulos y funciones

**Decisión**: Diferenciar mediante `tipo_elemento` ('MODULO' vs 'FUNCION')

**Justificación**:
- Claridad semántica: módulos son contenedores, funciones son navegables
- Permite validación de datos (CHECK constraint)
- Facilita filtrado y ordenamiento

**Trade-off**:
- No permite anidación más profunda (módulos dentro de módulos)
- Si se requiere profundidad mayor, habría que cambiar el diseño

### 5.3. Campo `activo` para control de visibilidad

**Decisión**: Usar campo `activo` (0/1) en lugar de eliminar registros

**Justificación**:
- Activación/desactivación sin perder datos
- Facilita reactivación futura
- Permite mantenimiento de histórico

**Trade-off**:
- Tabla puede crecer con elementos desactivados
- Requiere filtrado en todas las consultas

### 5.4. Sin roles ni permisos en v1

**Decisión**: No implementar filtrado por roles en versión 1

**Justificación**:
- Simplicidad: patrón fácil de adoptar
- Suficiente para muchos casos de uso básicos
- Reduces complejidad y tiempo de implementación

**Trade-off**:
- Todos los usuarios ven el mismo menú
- No hay control de acceso granular

### 5.5. Sin cache en v1

**Decisión**: No implementar cache en frontend

**Justificación**:
- Simplicidad: menos código y menos complejidad
- Menos riesgo de inconsistencias
- Consultas son rápidas (tabla pequeña)

**Trade-off**:
- Más peticiones al backend
- Latencia adicional en cada navegación

### 5.6. Sistema de textos simple (solo es-ES)

**Decisión**: Usar archivo de constantes en lugar de sistema i18n completo

**Justificación**:
- Simplicidad: fácil de implementar y mantener
- Suficiente para proyectos monolingües
- Menos dependencias

**Trade-off**:
- No soporta múltiples idiomas
- No hay carga dinámica de traducciones

---

## 6. Limitaciones de versión 1

| Limitación | Descripción | Impacto |
|-------------|-------------|------------|
| Sin configuración dinámica de campos | Los campos de forms y grids son fijos en los diseños | No se pueden personalizar en tiempo de ejecución |
| Sin control de acceso por roles | No hay filtrado por roles ni permisos | Todos los usuarios ven el mismo menú |
| Sin cache | Cada petición obtiene el menú desde backend | Más peticiones al backend |
| Sin sistema i18n multiidioma | Solo archivo simple de constantes, solo es-ES | No soporta múltiples idiomas |
| Sin auditoría de cambios | No se registran cambios en configuraciones de menú | No hay histórico de modificaciones |
| Sin versionado de configuraciones | No hay control de versiones | Dificultad para rollback |
| Sin testing formal | No se incluyen estrategias de testing | Mayor riesgo de errores |

---

## 7. Roadmap de versión 2

### 7.1. Prioridad alta

1. **Configuración dinámica de campos**
   - Sistema para personalizar campos en tiempo de ejecución
   - Similar al patrón KV original del análisis
   - Permite activar/desactivar campos sin código

2. **Control de acceso por roles**
   - Filtros por roles en backend y frontend
   - Permisos granulares a nivel de módulo o función
   - Herencia de permisos (ej: ADMIN ve todo)

3. **Cache de configuración**
   - Implementación de cache en frontend (sessionStorage)
   - Reducción de peticiones al backend
   - Invalidación de cache en logout

### 7.2. Prioridad media

4. **Sistema i18n multiidioma**
   - Soporte para múltiples idiomas
   - Carga dinámica de traducciones
   - Detección automática de idioma

5. **Auditoría de cambios**
   - Registro de cambios en configuraciones de menú
   - Tabla de auditoría con usuario, fecha, cambio
   - Interfaz para consultar histórico

### 7.3. Prioridad baja

6. **Versionado de configuraciones**
   - Control de versiones de configuraciones
   - Capacidad de rollback a versiones anteriores
   - Comparación entre versiones

7. **Testing formal**
   - Estrategias de testing unitario
   - Testing de integración
   - Testing E2E

8. **Generalización de stack**
   - Adaptación del patrón a otros stacks
   - Ejemplos para Node.js + PostgreSQL
   - Ejemplos para otros frameworks frontend (Vue, Angular)

---

## 8. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---------|--------------|-----------|-------------|
| Consultas SQL lentas con muchos elementos | Baja | Media | Índices en campos clave (modulo_id, tipo_elemento, orden, activo) |
| Inconsistencia entre frontend y backend | Baja | Alta | Validación de tipos TypeScript, pruebas de integración |
| Dificultad de adopción en proyectos existentes | Media | Media | Guía de adopción paso a paso, ejemplos claros |
| Errores en sistema de textos (claves no encontradas) | Media | Baja | Validación de claves en desarrollo, fallback a clave original |
| Problemas de rendimiento con muchas peticiones | Media | Baja | Considerar cache en v2, optimizar consultas SQL |
| Dificultad para extender funcionalidad | Baja | Media | Documentar puntos de extensión, mantener diseño modular |

---

## Conclusión

El patrón de menú dinámico v1 proporciona una solución simple y efectiva para controlar la estructura del menú sin modificar código. Su diseño minimalista facilita la adopción rápida en nuevos proyectos, mientras que el roadmap de versión 2 establece un camino claro para funcionalidades más avanzadas.

La separación entre configuración y código, junto con la activación/desactivación sin despliegue, ofrece flexibilidad suficiente para muchos casos de uso sin la complejidad de soluciones más avanzadas.
