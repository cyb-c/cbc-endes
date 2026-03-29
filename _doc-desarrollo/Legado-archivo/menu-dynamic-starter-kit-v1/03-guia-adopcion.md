# Guía de Adopción - Menú Dinámico v1

**Versión**: 1.0  
**Fecha**: 2026-03-27

---

## Índice

1. [Evaluación de idoneidad](#1-evaluación-de-idoneidad)
2. [Estrategias de incorporación](#2-estrategias-de-incorporación)
3. [Consideraciones de rollback](#3-consideraciones-de-rollback)
4. [Casos de uso típicos](#4-casos-de-uso-típicos)
5. [Preguntas frecuentes](#5-preguntas-frecuentes)

---

## 1. Evaluación de idoneidad

### 1.1. Cuándo usar este patrón

El patrón de menú dinámico v1 es adecuado para tu proyecto si:

- **Necesitas cambiar la estructura del menú sin desplegar código**
  - Ej: Activar/desactivar funcionalidades por cliente
  - Ej: Añadir/eliminar secciones temporalmente

- **Tienes múltiples usuarios con el mismo menú**
  - Ej: Aplicación SaaS con mismos módulos para todos los clientes
  - Ej: Aplicación interna con diferentes departamentos

- **Quieres ordenar elementos dinámicamente**
  - Ej: Permitir reordenación de módulos por usuario
  - Ej: Cambiar prioridad de funciones

- **Tu backend usa Cloudflare Workers + D1**
  - El patrón está optimizado para este stack
  - Adaptable a otros stacks con modificaciones menores

### 1.2. Cuándo NO usar este patrón

El patrón NO es adecuado si:

- **Necesitas control de acceso por roles**
  - v1 no incluye filtrado por roles
  - Considera esperar v2 o implementar roles por tu cuenta

- **Necesitas configuración dinámica de campos**
  - v1 no incluye personalización de campos en tiempo de ejecución
  - Considera esperar v2 o implementar por tu cuenta

- **Tu menú es estático y nunca cambia**
  - El patrón añade complejidad innecesaria
  - Un menú hardcodeado es más simple

- **Necesitas cache de configuración**
  - v1 no incluye cache
  - Considera esperar v2 o implementar cache por tu cuenta

---

## 2. Estrategias de incorporación

### 2.1. Estrategia 1: Incorporación completa (nuevo proyecto)

**Cuándo usar**: Proyectos nuevos desde cero

**Pasos**:

1. **Crear base de datos D1**
   ```bash
   wrangler d1 create tu-base-datos
   ```

2. **Ejecutar esquema SQL**
   - Copia el esquema desde `02-starter-kit/database.md`
   - Ejecuta en tu base de datos D1

3. **Insertar datos iniciales**
   - Usa los datos de ejemplo del mismo archivo
   - Adáptalos a tu dominio

4. **Implementar backend**
   - Crea el handler `handleGetMenu` en tu Worker
   - Registra el endpoint `/api/menu` en tu router
   - Configura el binding de D1 en `wrangler.jsonc`

5. **Implementar frontend**
   - Crea el hook `useMenu`
   - Crea los componentes `SidebarItem`, `SidebarModule`, `AppSidebar`
   - Integra en tu layout principal

6. **Implementar sistema de textos**
   - Crea el archivo `i18n/es-ES.js`
   - Adapta los textos a tu dominio

7. **Probar y validar**
   - Sigue los casos de prueba de la guía de implementación

**Ventajas**:
- Implementación limpia desde el inicio
- Sin deuda técnica de menú hardcodeado
- Fácil de mantener

**Desventajas**:
- Requiere más tiempo inicial
- No hay código existente que reutilizar

### 2.2. Estrategia 2: Incorporación incremental (proyecto existente)

**Cuándo usar**: Proyectos existentes con menú hardcodeado

**Pasos**:

1. **Crear base de datos y esquema**
   - Sigue los pasos de la Estrategia 1

2. **Implementar backend en paralelo**
   - Crea el handler `handleGetMenu` sin modificar el existente
   - Registra el endpoint `/api/menu` nuevo

3. **Mantener menú existente como fallback**
   - No elimines el menú hardcodeado aún
   - Permite rollback inmediato si hay problemas

4. **Implementar frontend en paralelo**
   - Crea los componentes nuevos sin modificar los existentes
   - Usa un feature flag para elegir entre menú viejo y nuevo

5. **Migrar datos de menú**
   - Convierte tu menú hardcodeado a datos SQL
   - Inserta en `MOD_modulos_config`

6. **Probar en desarrollo**
   - Activa el feature flag en desarrollo
   - Valida que todo funciona correctamente

7. **Lanzamiento gradual**
   - Lanza el nuevo menú a un subset de usuarios
   - Recoge feedback
   - Amplía gradualmente

8. **Eliminación del código antiguo**
   - Una vez validado, elimina el menú hardcodeado
   - Limpia el feature flag

**Ventajas**:
- Menor riesgo de interrupción
- Posibilidad de rollback inmediato
- Validación gradual

**Desventajas**:
- Más complejo de implementar
- Código duplicado temporalmente

### 2.3. Estrategia 3: Incorporación por módulo

**Cuándo usar**: Proyectos existentes donde solo algunos módulos necesitan ser dinámicos

**Pasos**:

1. **Identifica qué módulos serán dinámicos**
   - Ej: Solo "Administración" necesita ser dinámico
   - Otros módulos pueden seguir hardcodeados

2. **Implementa solo para esos módulos**
   - Sigue la Estrategia 2 pero solo para módulos seleccionados
   - Otros módulos no se ven afectados

3. **Amplía gradualmente**
   - Una vez validado, añade más módulos
   - Progresa según necesidades

**Ventajas**:
- Menor esfuerzo inicial
- Validación por módulo
- Menor riesgo

**Desventajas**:
- Inconsistencia en la experiencia
- Más complejo de mantener

---

## 3. Consideraciones de rollback

### 3.1. Rollback inmediato

**Cuándo**: Si hay problemas críticos tras la incorporación

**Pasos**:

1. **Desactivar endpoint nuevo**
   - Comenta o elimina el registro del endpoint `/api/menu`
   - El menú antiguo sigue funcionando

2. **Revertir cambios en frontend**
   - Si usaste feature flag, desactívalo
   - Si reemplazaste código, restaura desde git

3. **Investigar el problema**
   - Analiza logs y errores
   - Identifica la causa raíz

### 3.2. Rollback gradual

**Cuándo**: Si hay problemas menores o de usabilidad

**Pasos**:

1. **Mantener ambos menús activos**
   - Usa feature flag para alternar
   - Permite a usuarios elegir menú antiguo

2. **Recoger feedback**
   - Solicita feedback de usuarios
   - Identifica problemas específicos

3. **Corregir y relanzar**
   - Corrige los problemas identificados
   - Relanza gradualmente

---

## 4. Casos de uso típicos

### 4.1. Caso 1: Activación de nueva funcionalidad

**Escenario**: Lanzas una nueva funcionalidad y quieres que aparezca en el menú

**Solución**:

```sql
-- Insertar nueva función en el menú
INSERT INTO MOD_modulos_config (
  id, modulo_id, tipo_elemento, nombre_interno, 
  nombre_mostrar, descripcion, url_path, icono, orden, activo
) VALUES (
  100, 2, 'FUNCION', 'FACTURAS_EXPORTAR',
  'menu.funciones.exportar_facturas', 'Exportar facturas',
  '/facturas/exportar', 'download', 6, 1
);
```

**Resultado**: La nueva función aparece inmediatamente en el menú sin desplegar código.

### 4.2. Caso 2: Desactivación temporal de módulo

**Escenario**: Necesitas desactivar un módulo temporalmente por mantenimiento

**Solución**:

```sql
-- Desactivar módulo
UPDATE MOD_modulos_config SET activo = 0 WHERE id = 2;
```

**Resultado**: El módulo y todas sus funciones desaparecen del menú. Para reactivar:

```sql
-- Reactivar módulo
UPDATE MOD_modulos_config SET activo = 1 WHERE id = 2;
```

### 4.3. Caso 3: Reordenamiento de elementos

**Escenario**: Quieres cambiar el orden de visualización de módulos

**Solución**:

```sql
-- Reordenar módulos
UPDATE MOD_modulos_config SET orden = 10 WHERE id = 1;
UPDATE MOD_modulos_config SET orden = 1 WHERE id = 2;
UPDATE MOD_modulos_config SET orden = 2 WHERE id = 3;
```

**Resultado**: Los módulos aparecen en el nuevo orden en la próxima carga del menú.

### 4.4. Caso 4: Añadir nuevo módulo

**Escenario**: Quieres añadir un nuevo módulo completo con sus funciones

**Solución**:

```sql
-- Insertar nuevo módulo
INSERT INTO MOD_modulos_config (
  id, modulo_id, tipo_elemento, nombre_interno, 
  nombre_mostrar, descripcion, icono, orden, activo
) VALUES (
  4, NULL, 'MODULO', 'MOD_REPORTES',
  'menu.modulos.reportes', 'Reportes y estadísticas',
  'bar-chart-2', 30, 1
);

-- Insertar funciones del módulo
INSERT INTO MOD_modulos_config (
  id, modulo_id, tipo_elemento, nombre_interno, 
  nombre_mostrar, descripcion, url_path, icono, orden, activo
) VALUES
(40, 4, 'FUNCION', 'REPORTES_VENTAS', 'menu.funciones.reportes_ventas', 
 'Reportes de ventas', '/reportes/ventas', 'trending-up', 1, 1),
(41, 4, 'FUNCION', 'REPORTES_COMPRAS', 'menu.funciones.reportes_compras', 
 'Reportes de compras', '/reportes/compras', 'trending-down', 2, 1);
```

**Resultado**: El nuevo módulo con sus funciones aparece en el menú.

---

## 5. Preguntas frecuentes

### 5.1. Preguntas técnicas

**P: ¿Puedo usar este patrón con otro stack tecnológico?**  
R: Sí, el patrón es agnóstico a nivel de arquitectura. Necesitarás adaptar:
- El código backend a tu framework/servidor
- El código frontend a tu framework UI
- El SQL a tu motor de base de datos

**P: ¿Puedo añadir campos adicionales a la tabla?**  
R: Sí, puedes añadir campos según tus necesidades. Ejemplos:
- `permisos_granulares`: JSON con permisos específicos
- `metadata`: JSON con metadatos adicionales
- `created_by`: Usuario que creó el elemento

**P: ¿Cómo manejo iconos si no uso lucide-react?**  
R: El campo `icono` es un string que puedes interpretar como:
- Nombre de componente en tu sistema de iconos
- Nombre de clase CSS
- URL de imagen
- Emoji

**P: ¿Puedo anidar módulos dentro de módulos?**  
R: No con el diseño actual de v1. La estructura es de 2 niveles:
- Nivel 1: Módulos (modulo_id = NULL)
- Nivel 2: Funciones (modulo_id = ID del módulo)

Para anidación más profunda, necesitarías modificar el diseño.

### 5.2. Preguntas operativas

**P: ¿Cómo hago cambios en producción?**  
R: Ejecuta los SQL directamente en tu base de datos D1 de producción:
```bash
wrangler d1 execute tu-base-datos --file=changes.sql
```

**P: ¿Cómo versiono los cambios en configuración?**  
R: v1 no incluye versionado. Puedes implementarlo:
- Guardando cada cambio en una tabla de auditoría
- Usando un sistema de control de versiones externo
- Considera esperar v2 que incluirá versionado

**P: ¿Qué pasa si borro un módulo que tiene funciones?**  
R: Gracias a `ON DELETE CASCADE`, todas las funciones hijas se borran automáticamente. Esto mantiene la integridad referencial.

**P: ¿Puedo tener múltiples menús diferentes?**  
R: Con el diseño actual de v1, no. Todos los usuarios ven el mismo menú. Para menús diferentes:
- Implementa filtrado por roles (v2)
- Añade campo `cliente_id` o `tenant_id` y filtra por ese campo

---

## Conclusión

Esta guía proporciona estrategias para incorporar el patrón de menú dinámico v1 en tu proyecto, ya sea nuevo o existente.

La estrategia que elijas dependerá de:
- Tu situación actual (nuevo proyecto vs existente)
- Tu tolerancia al riesgo
- Tu timeline de implementación

Para cualquier duda no resuelta en esta guía, consulta la documentación de arquitectura y la guía de implementación.
