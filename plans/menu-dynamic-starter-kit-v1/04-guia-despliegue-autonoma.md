# Guía de Despliegue Autónomo - Menú Dinámico v1

**Versión**: 1.0  
**Fecha**: 2026-03-27  
**Objetivo**: Guía para que un modelo de IA tipo IDE ejecute el proceso de principio a fin de forma autónoma

---

## Índice

1. [Sección del Usuario - Contexto y Requerimientos](#1-sección-del-usuario---contexto-y-requerimientos)
2. [Proceso de Despliegue Autónomo](#2-proceso-de-despliegue-autónomo)
3. [Tareas del Modelo de IA](#3-tareas-del-modelo-de-ia)
4. [Validación y Verificación](#4-validación-y-verificación)

---

## 1. Sección del Usuario - Contexto y Requerimientos

> **INSTRUCCIÓN PARA EL USUARIO**: Completa esta sección antes de iniciar el proceso de despliegue autónomo. Esta información será utilizada por el modelo de IA para personalizar el despliegue.

### 1.1. Contexto del Proyecto

**Nombre del proyecto**: `[ESPECIFICAR]`

**Descripción breve**: `[ESPECIFICAR]`

**Tipo de proyecto**: `[ ] Nuevo proyecto` `[ ] Proyecto existente`

**Stack tecnológico**:
- Backend: `[ ] Cloudflare Workers + D1` `[ ] Otro (especificar): ____________`
- Frontend: `[ ] React` `[ ] Vue` `[ ] Angular` `[ ] Otro (especificar): ____________`

**Estado actual del menú**:
- `[ ] No existe menú aún`
- `[ ] Menú hardcodeado en frontend`
- `[ ] Menú dinámico parcialmente implementado`

### 1.2. Requerimientos Específicos

**Objetivo principal del despliegue**:
`[ESPECIFICAR - Ej: Implementar menú dinámico v1 en el proyecto X]`

**Alcance deseado**:
- `[ ] Solo estructura del menú (módulos y funciones)`
- `[ ] Estructura del menú + sistema de textos`
- `[ ] Estructura del menú + sistema de textos + componentes UI`

**Personalizaciones requeridas**:
- Nombre de la tabla: `[ ] MOD_modulos_config (por defecto)` `[ ] Otro (especificar): ____________`
- Prefijo de textos: `[ ] menu. (por defecto)` `[ ] Otro (especificar): ____________`
- Idioma inicial: `[ ] es-ES (por defecto)` `[ ] Otro (especificar): ____________`

**Restricciones**:
- `[ ] Sin roles ni permisos (v1)`
- `[ ] Sin cache (v1)`
- `[ ] Sin i18n multiidioma (v1)`
- `[ ] Otras (especificar): ____________`

### 1.3. Información Adicional Relevante

**URL del backend** (si existe): `________________________________________________________`

**URL del frontend** (si existe): `________________________________________________________`

**Base de datos D1** (si existe):
- Nombre: `________________________________________________________`
- ID: `________________________________________________________`

**Notas o consideraciones especiales**:
```
[ESPECIFICAR CUALQUIER INFORMACIÓN ADICIONAL]
```

---

## 2. Proceso de Despliegue Autónomo

Esta sección describe el flujo de trabajo que el modelo de IA debe seguir para ejecutar el despliegue del menú dinámico v1 de forma autónoma.

### 2.1. Fase de Preparación

**Objetivo**: Analizar el contexto del proyecto y preparar el entorno para el despliegue.

**Tareas**:
1. Leer y analizar la sección del usuario (Sección 1)
2. Identificar el stack tecnológico del proyecto
3. Determinar la estrategia de despliegue (nuevo proyecto vs existente)
4. Revisar la documentación del starter kit
5. Preparar el plan de despliegue específico

**Resultados esperados**:
- Estrategia de despliegue definida
- Lista de archivos a crear/modificar
- Lista de comandos a ejecutar

### 2.2. Fase de Implementación

**Objetivo**: Implementar el patrón de menú dinámico v1 en el proyecto.

**Tareas**:
1. **Crear base de datos y esquema**
   - Ejecutar el esquema SQL en D1
   - Insertar datos iniciales de ejemplo
   - Validar la estructura

2. **Implementar backend**
   - Crear handler del endpoint `/api/menu`
   - Registrar el endpoint en el router
   - Configurar binding de D1 en wrangler.jsonc
   - Probar el endpoint

3. **Implementar frontend**
   - Crear hook `useMenu`
   - Crear componentes `SidebarItem`, `SidebarModule`, `AppSidebar`
   - Integrar en el layout principal
   - Implementar sistema de textos

4. **Validar integración**
   - Probar el menú en el navegador
   - Verificar navegación
   - Verificar textos

**Resultados esperados**:
- Base de datos creada y poblada
- Endpoint backend funcional
- Componentes frontend implementados
- Menú visible y funcional

### 2.3. Fase de Validación

**Objetivo**: Validar que el despliegue cumple con los requerimientos.

**Tareas**:
1. Ejecutar casos de prueba definidos en la guía de implementación
2. Verificar que todas las funcionalidades requeridas funcionan
3. Validar que no hay errores en consola
4. Verificar que el menú se carga correctamente

**Resultados esperados**:
- Todos los casos de prueba pasan
- Sin errores en consola
- Menú funcional según requerimientos

### 2.4. Fase de Documentación

**Objetivo**: Documentar el despliegue realizado.

**Tareas**:
1. Registrar cambios realizados
2. Documentar personalizaciones aplicadas
3. Crear registro de decisiones tomadas
4. Generar reporte de despliegue

**Resultados esperados**:
- Registro completo de cambios
- Documentación de personalizaciones
- Reporte de despliegue

---

## 3. Tareas del Modelo de IA

Esta sección describe las tareas específicas que el modelo de IA debe ejecutar, con instrucciones claras y ejecutables.

### 3.1. Tarea 1: Análisis del Contexto

**Objetivo**: Leer y comprender el contexto del proyecto proporcionado por el usuario.

**Instrucciones paso a paso**:
1. Lee la "Sección del Usuario - Contexto y Requerimientos" (Sección 1)
2. Extrae la siguiente información:
   - Nombre del proyecto
   - Stack tecnológico (backend y frontend)
   - Estado actual del menú
   - Objetivo principal del despliegue
   - Alcance deseado
   - Personalizaciones requeridas
   - Restricciones
   - Información adicional relevante

3. Determina la estrategia de despliegue:
   - Si es un **nuevo proyecto**, usa la Estrategia 1 de la guía de adopción
   - Si es un **proyecto existente**, usa la Estrategia 2 o 3 de la guía de adopción

4. Genera un resumen del contexto:
   - Resume el proyecto en 2-3 frases
   - Lista los requerimientos principales
   - Identifica cualquier riesgo o consideración especial

**Validación**:
- [ ] Se ha leído completamente la Sección 1
- [ ] Se ha extraído toda la información requerida
- [ ] Se ha determinado la estrategia de despliegue
- [ ] Se ha generado el resumen del contexto

### 3.2. Tarea 2: Preparación del Entorno

**Objetivo**: Preparar el entorno para el despliegue.

**Instrucciones paso a paso**:
1. Lee el documento de arquitectura (`00-patron-arquitectura.md`)
2. Lee la guía de implementación (`01-guia-implementacion.md`)
3. Lee el código de ejemplo en `02-starter-kit/`
4. Identifica qué archivos del starter kit son relevantes para el proyecto
5. Prepara una lista de archivos a crear/modificar
6. Prepara una lista de comandos SQL a ejecutar

**Validación**:
- [ ] Se han leído todos los documentos relevantes
- [ ] Se han identificado los archivos relevantes
- [ ] Se ha preparado la lista de archivos a crear/modificar
- [ ] Se ha preparado la lista de comandos SQL

### 3.3. Tarea 3: Implementación de Base de Datos

**Objetivo**: Crear la base de datos y el esquema del menú dinámico.

**Instrucciones paso a paso**:
1. Si el proyecto no tiene base de datos D1:
   - Ejecuta: `wrangler d1 create [nombre-base-datos]`
   - Registra el database ID generado

2. Copia el esquema SQL desde `02-starter-kit/database.md`
3. Adapta el nombre de la tabla si el usuario especificó uno diferente
4. Ejecuta el esquema SQL en la base de datos D1:
   - Opción A: Usando wrangler CLI: `wrangler d1 execute [nombre-base-datos] --file=schema.sql`
   - Opción B: Usando el dashboard de Cloudflare
5. Si el usuario requiere datos iniciales, inserta los datos de ejemplo

**Validación**:
- [ ] Base de datos D1 creada
- [ ] Esquema SQL ejecutado correctamente
- [ ] Tabla `MOD_modulos_config` existe
- [ ] Índices creados correctamente
- [ ] Datos iniciales insertados (si aplica)

### 3.4. Tarea 4: Implementación de Backend

**Objetivo**: Implementar el endpoint del menú dinámico en el backend.

**Instrucciones paso a paso**:
1. Lee el código de ejemplo en `02-starter-kit/backend.md`
2. Adapta el código al proyecto existente:
   - Ajusta las rutas de importación
   - Ajusta la función `getDB` según el proyecto
   - Ajusta el tipo `Env` según el proyecto
3. Crea el archivo `src/handlers/menu.ts` (o ruta equivalente)
4. Copia el handler `handleGetMenu` al archivo
5. En el archivo principal del Worker (ej: `src/index.ts`):
   - Importa el handler: `import { handleGetMenu } from './handlers/menu'`
   - Registra el endpoint: `router.get('/api/menu', handleGetMenu)`
6. En `wrangler.jsonc`:
   - Verifica que existe el binding de D1
   - Si no existe, añádelo según la configuración del proyecto
7. Despliega el Worker: `wrangler deploy`

**Validación**:
- [ ] Archivo `menu.ts` creado
- [ ] Handler importado correctamente
- [ ] Endpoint registrado en el router
- [ ] Binding de D1 configurado en wrangler.jsonc
- [ ] Worker desplegado correctamente
- [ ] Endpoint `/api/menu` responde correctamente

### 3.5. Tarea 5: Implementación de Frontend

**Objetivo**: Implementar los componentes del menú dinámico en el frontend.

**Instrucciones paso a paso**:
1. Lee el código de ejemplo en `02-starter-kit/frontend.md`
2. Adapta el código al framework del proyecto:
   - Si es React, usa el código tal cual
   - Si es Vue/Angular/Otro, adapta los patrones equivalentes
3. Crea el hook `useMenu`:
   - Crea el archivo `src/hooks/useMenu.ts` (o ruta equivalente)
   - Copia el código del ejemplo
   - Ajusta `VITE_BACKEND_URL` según el proyecto
4. Crea el componente `SidebarItem`:
   - Crea el archivo `src/components/SidebarItem.tsx` (o ruta equivalente)
   - Copia el código del ejemplo
   - Ajusta el sistema de iconos según el proyecto
5. Crea el componente `SidebarModule`:
   - Crea el archivo `src/components/SidebarModule.tsx` (o ruta equivalente)
   - Copia el código del ejemplo
   - Ajusta el sistema de iconos según el proyecto
6. Crea el componente `AppSidebar`:
   - Crea el archivo `src/components/AppSidebar.tsx` (o ruta equivalente)
   - Copia el código del ejemplo
   - Ajusta las rutas de importación
7. En el layout principal del proyecto:
   - Importa `AppSidebar`
   - Añádelo en la estructura de la página
   - Asegúrate de que se renderiza correctamente
8. Si el proyecto usa un sistema de rutas diferente, adapta el componente `SidebarItem`:
   - Cambia `Link` de react-router-dom por el equivalente del proyecto

**Validación**:
- [ ] Hook `useMenu` creado
- [ ] Componente `SidebarItem` creado
- [ ] Componente `SidebarModule` creado
- [ ] Componente `AppSidebar` creado
- [ ] Componentes importados en el layout
- [ ] Menú visible en la interfaz

### 3.6. Tarea 6: Implementación de Sistema de Textos

**Objetivo**: Implementar el sistema de textos para el menú.

**Instrucciones paso a paso**:
1. Lee el código de ejemplo en `02-starter-kit/i18n.md`
2. Si el usuario especificó un idioma diferente a es-ES:
   - Crea el archivo correspondiente (ej: `i18n/en-EN.js`)
   - Traduce los textos al idioma especificado
3. Si el usuario especificó un prefijo diferente a `menu.`:
   - Reemplaza el prefijo en todas las claves
4. Crea el archivo `src/i18n/es-ES.js` (o ruta equivalente):
   - Copia el código del ejemplo
   - Adapta los textos al dominio del proyecto
5. En los componentes del frontend:
   - Importa `MENU_TEXTS` desde el archivo i18n
   - Usa `MENU_TEXTS[clave]` para resolver los textos

**Validación**:
- [ ] Archivo i18n creado
- [ ] Textos adaptados al dominio del proyecto
- [ ] Componentes importan y usan los textos correctamente
- [ ] Textos visibles en la interfaz

### 3.7. Tarea 7: Validación del Despliegue

**Objetivo**: Validar que el despliegue cumple con los requerimientos del usuario.

**Instrucciones paso a paso**:
1. Abre la aplicación en el navegador
2. Verifica que el menú se carga correctamente
3. Verifica que todos los módulos y funciones esperados aparecen
4. Navega por cada función del menú
5. Verifica que la navegación funciona correctamente
6. Verifica que el ítem activo se resalta correctamente
7. Verifica que los textos aparecen en el idioma correcto
8. Abre la consola del navegador y verifica que no hay errores
9. Ejecuta los casos de prueba de la guía de implementación

**Validación**:
- [ ] Menú se carga correctamente
- [ ] Todos los módulos esperados aparecen
- [ ] Todas las funciones esperadas aparecen
- [ ] Navegación funciona correctamente
- [ ] Ítem activo se resalta
- [ ] Textos en idioma correcto
- [ ] Sin errores en consola
- [ ] Casos de prueba pasan

### 3.8. Tarea 8: Documentación del Despliegue

**Objetivo**: Documentar el despliegue realizado.

**Instrucciones paso a paso**:
1. Crea un archivo de reporte de despliegue:
   - Nombre sugerido: `despliegue-menu-dinamico-v1-[fecha].md`
   - Ubicación sugerida: Raíz del proyecto o carpeta de documentación
2. En el reporte, incluye:
   - Contexto del proyecto (resumen de la Sección 1)
   - Estrategia de despliegue utilizada
   - Lista de archivos creados/modificados
   - Lista de comandos ejecutados
   - Personalizaciones aplicadas
   - Resultados de validación
   - Problemas encontrados y soluciones
   - Decisiones tomadas durante el despliegue
3. Guarda el reporte en el workspace

**Validación**:
- [ ] Reporte de despliegue creado
- [ ] Reporte incluye toda la información relevante
- [ ] Reporte guardado en el workspace

---

## 4. Validación y Verificación

### 4.1. Checklist de Finalización

Antes de considerar el despliegue completado, verifica:

**Preparación**:
- [ ] Sección del usuario completada
- [ ] Contexto analizado y comprendido
- [ ] Estrategia de despliegue definida
- [ ] Documentación leída

**Implementación**:
- [ ] Base de datos creada y esquema ejecutado
- [ ] Backend implementado y desplegado
- [ ] Frontend implementado y funcionando
- [ ] Sistema de textos implementado

**Validación**:
- [ ] Menú visible y funcional
- [ ] Navegación correcta
- [ ] Textos correctos
- [ ] Sin errores en consola
- [ ] Casos de prueba pasan

**Documentación**:
- [ ] Reporte de despliegue creado
- [ ] Cambios documentados
- [ ] Decisiones registradas

### 4.2. Criterios de Éxito

El despliegue se considera exitoso si:

1. **Todos los elementos del checklist están marcados**
2. **El menú funciona según los requerimientos del usuario**
3. **No hay errores críticos en consola**
4. **El reporte de despliegue está completo**

Si no se cumplen estos criterios, el modelo de IA debe:
1. Identificar los problemas encontrados
2. Proponer soluciones
3. Documentar los problemas en el reporte de despliegue

---

## Notas para el Modelo de IA

### Consideraciones Generales

1. **Lee completamente la Sección del Usuario antes de empezar**
   - No asumas valores por defecto
   - Si falta información, pregunta al usuario

2. **Adapta el código al contexto del proyecto**
   - No copies el código tal cual sin adaptar
   - Considera el stack tecnológico del proyecto
   - Considera las convenciones del proyecto

3. **Valida cada paso antes de continuar**
   - No asumas que un paso funcionó si no has verificado
   - Si hay un error, detente y reporta el problema

4. **Documenta todo**
   - Registra todos los cambios realizados
   - Documenta las decisiones tomadas
   - Guarda el reporte de despliegue

5. **Sé proactivo**
   - Si detectas un problema potencial, reporta antes de continuar
   - Si no estás seguro de cómo hacer algo, pregunta antes de intentar

### Manejo de Errores

Si encuentras un error durante el despliegue:

1. **Identifica el error**: ¿Qué paso falló? ¿Cuál fue el mensaje de error?
2. **Analiza la causa**: ¿Por qué ocurrió el error? ¿Es un problema de configuración, código o entorno?
3. **Propone una solución**: ¿Cómo se puede resolver el error?
4. **Documenta el error**: Registra el error en el reporte de despliegue con la solución propuesta
5. **Pregunta al usuario**: Si no puedes resolver el error, pregunta al usuario antes de continuar

### Comunicación con el Usuario

1. **Informa el progreso**: Reporta el progreso regularmente (ej: después de cada fase)
2. **Sé claro**: Usa lenguaje claro y sin ambigüedades
3. **Sé conciso**: Ve al punto, no incluyas información irrelevante
4. **Usa el formato apropiado**: Usa listas, tablas o código según corresponda

---

## Fin de la Guía

Una vez completadas todas las tareas y validaciones, el modelo de IA debe:

1. Presentar un resumen del despliegue
2. Indicar el estado final (exitoso o con problemas)
3. Proporcionar el reporte de despliegue
4. Sugerir próximos pasos si aplica

**El usuario puede entonces revisar el despliegue y decidir los siguientes pasos.**
