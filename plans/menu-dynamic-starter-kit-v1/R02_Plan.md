Ahora voy a crear el plan detallado de despliegue autónomo:

Plan de Despliegue Autónomo - Menú Dinámico v1 para cbc-endes
Fecha: 2026-03-27
Versión: 1.0
Proyecto: cbc-endes

Resumen Ejecutivo
Este plan describe el despliegue autónomo del patrón de menú dinámico v1 en el proyecto cbc-endes. El objetivo es implementar la funcionalidad de menú dinámico como base para las siguientes fases del desarrollo del proyecto.

Estrategia de adopción: Estrategia 1 (Incorporación completa - nuevo proyecto), ya que no existen recursos backend activos.

1. Contexto del Proyecto
Campo	Valor
Nombre del proyecto	cbc-endes
Descripción breve	En esta fase implementar en cbc-endes la funcionalidad menú dinámico
Objetivo principal	Aprovechar funcionalidad de menú dinámico como base para las siguientes fases del desarrollo del proyecto cbc-endes
Tipo de proyecto	Proyecto existente (frontend Pages activo, sin backend)
2. Stack Tecnológico
Capa	Tecnología	Versión	Estado
Lenguaje	TypeScript	5.4.0+	✅
Backend Framework	Hono	^4.6.0	✅
Frontend	React	18.x	✅
Build tool (Frontend)	Vite	6.1.0	✅
UI Framework	TailAdmin Free React	Latest	✅
Styling	Tailwind CSS	Latest	✅
Runtime	Cloudflare Workers	Latest	✅
Database	Cloudflare D1	Latest	✅
Deployment	Wrangler	4.75.0	✅
3. Recursos a Crear
Recurso	Nombre	Binding	ID	Estado actual	Estado objetivo
Worker	wk-backend	N/A	Por generar	❌ No existe	✅ Crear
D1 Database	db-cbconsulting	db_binding_01	Por generar	❌ No existe	✅ Crear
Pages	pg-cbc-endes	N/A	Existe	✅ Activo	✅ Mantener
4. Personalizaciones del Menú Dinámico
Configuración	Valor por defecto	Valor deseado
Nombre de la tabla	MOD_modulos_config	MOD_modulos_config
Prefijo de textos	menu.	menu.
Idioma inicial	es-ES	es-ES
5. Alcance de Implementación
[x] Estructura del menú (tabla D1)
[x] Sistema de textos (i18n simple)
[ ] Componentes UI completos (se implementarán en fases posteriores)
Nota: La tabla MOD_modulos_config se creará vacía. Los módulos y funciones se añadirán en Fase 2.

6. Restricciones
[x] Sin roles ni permisos (v1)
[x] Sin cache (v1)
[x] Sin i18n multiidioma (v1)
7. Integración con Frontend
Estrategia: Integrar junto con el sidebar actual (feature flag)

El menú dinámico se implementará como un componente paralelo
Se usará un feature flag para alternar entre menú antiguo y nuevo
En Fase 2, el menú dinámico sustituirá completamente al sidebar existente
Sistema de iconos: Adaptar el código para usar los iconos SVG existentes en apps/frontend/src/icons/.

8. Plan de Despliegue
Fase 1: Preparación del Entorno
Tarea	Descripción	Archivos involucrados
1.1	Verificar autenticación con Wrangler	-
1.2	Revisar configuración de wrangler.toml	apps/worker/wrangler.toml
1.3	Revisar estructura del proyecto frontend	apps/frontend/
Fase 2: Creación de Recursos Cloudflare
Tarea	Descripción	Comando
2.1	Crear base de datos D1	wrangler d1 create db-cbconsulting
2.2	Registrar ID de la base de datos	-
2.3	Crear Worker backend	wrangler deploy (desde apps/worker/)
Fase 3: Implementación de Base de Datos
Tarea	Descripción	Archivos
3.1	Crear archivo de migración SQL	migrations/002-menu-dinamico-v1.sql
3.2	Ejecutar migración en D1	wrangler d1 execute db-cbconsulting --file=migrations/002-menu-dinamico-v1.sql --remote
3.3	Validar esquema creado	-
Esquema SQL:

-- Tabla principal de configuración de menú
CREATE TABLE IF NOT EXISTS MOD_modulos_config (
  id INTEGER PRIMARY KEY,
  modulo_id INTEGER REFERENCES MOD_modulos_config(id) ON DELETE CASCADE,
  tipo_elemento TEXT NOT NULL CHECK(tipo_elemento IN ('MODULO','FUNCION')),
  nombre_interno TEXT NOT NULL UNIQUE,
  nombre_mostrar TEXT NOT NULL,
  descripcion TEXT,
  url_path TEXT,
  icono TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_menu_modulo ON MOD_modulos_config(modulo_id);
CREATE INDEX IF NOT EXISTS idx_menu_tipo ON MOD_modulos_config(tipo_elemento);
CREATE INDEX IF NOT EXISTS idx_menu_orden ON MOD_modulos_config(orden);
CREATE INDEX IF NOT EXISTS idx_menu_activo ON MOD_modulos_config(activo);
Fase 4: Implementación de Backend
Tarea	Descripción	Archivos
4.1	Crear módulo de configuración de entorno	apps/worker/src/env.ts
4.2	Crear handler del endpoint /api/menu	apps/worker/src/handlers/menu.ts
4.3	Registrar endpoint en router	apps/worker/src/index.ts
4.4	Configurar binding de D1 en wrangler.toml	apps/worker/wrangler.toml
4.5	Desplegar Worker	-
Configuración wrangler.toml:

[[d1_databases]]
binding = "db_binding_01"
database_name = "db-cbconsulting"
database_id = "[ID_GENERADO_EN_FASE_2.2]"
Fase 5: Implementación de Frontend
Tarea	Descripción	Archivos
5.1	Crear hook useMenu	apps/frontend/src/hooks/useMenu.ts
5.2	Crear componente SidebarItem	apps/frontend/src/components/SidebarItem.tsx
5.3	Crear componente SidebarModule	apps/frontend/src/components/SidebarModule.tsx
5.4	Crear componente AppSidebarDynamic	apps/frontend/src/components/AppSidebarDynamic.tsx
5.5	Crear sistema de textos i18n	apps/frontend/src/i18n/es-ES.ts
5.6	Integrar con feature flag	apps/frontend/src/layout/AppLayout.tsx
Fase 6: Validación
Tarea	Descripción	Validación
6.1	Probar endpoint /api/menu	Respuesta JSON correcta
6.2	Probar menú en frontend	Componente renderiza correctamente
6.3	Verificar feature flag	Alternancia entre menús funciona
6.4	Verificar sin errores en consola	No hay errores
Fase 7: Documentación
Tarea	Descripción	Archivos
7.1	Crear reporte de despliegue	plans/menu-dynamic-starter-kit-v1/R02_reporte_despliegue.md
7.2	Solicitar actualización del inventario	Notificar al orquestador
9. Reglas de Gobernanza Aplicables
Regla	Descripción	Aplicación
R1	No asumir valores no documentados	✅ Todos los nombres de recursos están especificados
R2	Cero hardcoding	✅ Usar variables de entorno y bindings
R4	Accesores tipados para bindings	✅ Crear módulo env.ts
R8	Configuración de despliegue	✅ No incluir account_id en wrangler.toml
R9	Migraciones de esquema	✅ Usar archivo de migración numerado
R15	Inventario actualizado	✅ Notificar al orquestador para actualizar
10. Diagrama de Arquitectura
graph TB
    subgraph Cloudflare
        WK[Worker wk-backend]
        D1[Database db-cbconsulting]
        PG[Pages pg-cbc-endes]
    end
    
    subgraph Backend
        API[GET /api/menu]
        ENV[env.ts - db_binding_01]
    end
    
    subgraph Frontend
        HM[useMenu hook]
        ASD[AppSidebarDynamic]
        SM[SidebarModule]
        SI[SidebarItem]
        I18N[i18n/es-ES.ts]
        FF[Feature Flag]
        ASB[AppSidebar existente]
    end
    
    D1 -->|db_binding_01| ENV
    ENV --> API
    API -->|JSON| HM
    HM --> ASD
    ASD --> SM
    SM --> SI
    I18N --> ASD
    FF -->|true| ASD
    FF -->|false| ASB
    PG -->|Frontend| FF
11. Checklist de Finalización
Preparación
[ ] Autenticación con Wrangler verificada
[ ] Configuración de wrangler.toml revisada
[ ] Estructura del proyecto frontend revisada
Creación de Recursos
[ ] Base de datos D1 db-cbconsulting creada
[ ] ID de D1 registrado
[ ] Worker wk-backend creado
Implementación Backend
[ ] Módulo env.ts creado
[ ] Handler menu.ts creado
[ ] Endpoint /api/menu registrado
[ ] Binding D1 configurado
[ ] Worker desplegado
Implementación Frontend
[ ] Hook useMenu creado
[ ] Componentes SidebarItem, SidebarModule creados
[ ] Componente AppSidebarDynamic creado
[ ] Sistema de textos i18n creado
[ ] Feature flag integrado
Validación
[ ] Endpoint /api/menu responde correctamente
[ ] Menú dinámico renderiza en frontend
[ ] Feature flag funciona correctamente
[ ] Sin errores en consola
Documentación
[ ] Reporte de despliegue creado
[ ] Notificación al orquestador enviada
12. Riesgos y Mitigaciones
Riesgo	Probabilidad	Impacto	Mitigación
Error al crear recursos Cloudflare	Baja	Alta	Verificar autenticación antes de ejecutar
Problemas con binding D1	Media	Alta	Validar configuración en wrangler.toml
Incompatibilidad con iconos SVG existentes	Media	Baja	Adaptar código para usar iconos existentes
Feature flag no funciona correctamente	Baja	Media	Implementar con variable de entorno
13. Próximos Pasos (Fase 2)
Una vez completado el despliegue del menú dinámico v1, en Fase 2 se:

Añadirán los módulos y funciones en la tabla MOD_modulos_config
Crearán los forms y grids correspondientes
El menú dinámico sustituirá completamente al sidebar existente
Se eliminará el feature flag
14. Aprobación Requerida
Antes de proceder con la ejecución de este plan, se requiere aprobación del usuario.

¿Aprueba este plan de despliegue autónomo?