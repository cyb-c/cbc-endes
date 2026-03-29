# Menu Dynamic Starter Kit v1

**Versión**: 1.0  
**Fecha**: 2026-03-27  
**Stack objetivo**: Cloudflare Workers + D1 (backend), UI agnóstico (frontend)

---

## ¿Qué es este starter kit?

Este starter kit proporciona un patrón de menú dinámico simplificado que permite controlar la estructura del menú lateral de una aplicación sin modificar código.

Se basa en una tabla de base de datos que define la jerarquía de módulos y funciones, un endpoint backend que expone esta configuración, y componentes frontend que la consumen y renderizan.

## Características principales

- ✅ Activación/desactivación de elementos sin desplegar código
- ✅ Ordenamiento configurable de módulos y funciones
- ✅ Separación entre configuración y código
- ✅ Implementación simple y fácil de adoptar
- ✅ Sistema de textos simple (español)

## Limitaciones de v1

- ❌ Sin configuración dinámica de campos
- ❌ Sin control de acceso por roles
- ❌ Sin cache
- ❌ Sin sistema i18n multiidioma
- ❌ Sin auditoría de cambios
- ❌ Sin versionado de configuraciones
- ❌ Sin testing formal

Para mejoras futuras, consulta el roadmap en el documento de arquitectura.

## Estructura del starter kit

```
menu-dynamic-starter-kit-v1/
├── README.md (este archivo)
├── 00-patron-arquitectura.md    # Documento de arquitectura del patrón
├── 01-guia-implementacion.md     # Guía paso a paso de implementación
├── 02-starter-kit/                # Código de ejemplo
│   ├── README.md                   # Descripción del starter kit
│   ├── database.md                 # Esquema SQL
│   ├── backend.md                  # Handler del endpoint
│   ├── frontend.md                 # Hooks y componentes React
│   └── i18n.md                    # Sistema de textos (es-ES)
└── 03-guia-adopcion.md           # Guía de adopción a proyectos existentes
```

## Tecnologías

### Backend
- Cloudflare Workers
- D1 (SQLite en Cloudflare)
- TypeScript

### Frontend (ejemplos)
- React 19
- React Router
- Lucide React (iconos)
- TypeScript

> **Nota**: El código de frontend es adaptable a otros frameworks (Vue, Angular, Svelte, etc.)

## Comenzar rápidamente

### Opción 1: Nuevo proyecto

1. Lee [`00-patron-arquitectura.md`](00-patron-arquitectura.md) para entender el patrón
2. Sigue [`01-guia-implementacion.md`](01-guia-implementacion.md) paso a paso
3. Usa el código de ejemplo en [`02-starter-kit/`](02-starter-kit/) como referencia

### Opción 2: Proyecto existente

1. Lee [`03-guia-adopcion.md`](03-guia-adopcion.md) para estrategias de incorporación
2. Elige la estrategia que mejor se adapte a tu situación
3. Implementa gradualmente con posibilidad de rollback

### Opción 3: Despliegue autónomo con IA

1. Completa la sección del usuario en [`04-guia-despliegue-autonoma.md`](04-guia-despliegue-autonoma.md)
2. Proporciona la guía a un modelo de IA tipo IDE
3. El modelo ejecutará el proceso de principio a fin de forma autónoma

## Casos de uso típicos

- **Activación de nueva funcionalidad**: Añadir una función al menú sin desplegar código
- **Desactivación temporal**: Ocultar un módulo por mantenimiento
- **Reordenamiento**: Cambiar el orden de visualización de elementos
- **Añadir nuevo módulo**: Crear un nuevo módulo con sus funciones

Para más detalles, consulta la guía de adopción.

## Roadmap v2

El roadmap de versión 2 incluye:

1. Configuración dinámica de campos
2. Control de acceso por roles
3. Cache de configuración
4. Sistema i18n multiidioma
5. Auditoría de cambios
6. Testing formal

Consulta [`00-patron-arquitectura.md`](00-patron-arquitectura.md#7-roadmap-de-versión-2) para más detalles.

## Soporte

Para preguntas o problemas:

1. Consulta la documentación de arquitectura
2. Revisa la guía de implementación
3. Lee la guía de adopción
4. Revisa el código de ejemplo

## Licencia

Este starter kit se proporciona tal cual para su uso en proyectos.

## Créditos

Basado en el análisis del sistema de gestión de módulos del repositorio `plrfcf`.
