# Especificación del Modal de Cambio de Estado

**Fecha:** 27 de marzo de 2026  
**Versión:** 1.0

---

## 1. Introducción

Este documento especifica el comportamiento y estructura del modal de cambio de estado manual para proyectos PAI.

## 2. Ubicación

**Ruta:** Sección de página de detalle de proyecto PAI
**Componente:** Modal de cambio de estado

## 3. Props del Modal

```typescript
interface CambioEstadoModalProps {
  isOpen: boolean
  proyectoId: number
  proyectoEstadoId: number
  proyectoEstadoActual: string
  onCerrar: () => void
  onConfirmar: (estadoId: number, motivoValoracionId?: number, motivoDescarteId?: number) => void
  onCancelar: () => void
}
```

## 4. Estados Disponibles

| ID | Código | Nombre | Descripción | ¿Requiere Motivo? |
|----|-------|---------|-------------------|
| 1 | 4 | PENDIENTE_REVISION | En revisión | No |
| 2 | 5 | EVALUANDO_VIABILIDAD | Evaluando viabilidad | No |
| 3 | 6 | EVALUANDO_PLAN_NEGOCIO | Evaluando plan de negocio | No |
| 4 | 7 | SEGUIMIENTO_COMERCIAL | Seguimiento comercial | No |
| 5 | 8 | APROBADO | Aprobado | No |
| 6 | 9 | DESCARTADO | Descartado | Sí |
| 7 | 10 | ANALISIS_CON_ERROR | Análisis con error | No |

## 5. Motivos de Valoración

| ID | Código | Nombre | Descripción |
|----|-------|---------|----------|
| 1 | 1 | MV_SENTIDO_NEGOCIO_REAL | Sentido de negocio real | El activo parece tener sentido de negocio real |
| 2 | 2 | MV_INFRAUTILIZADO | Infrautilizado | El activo se aprecia como infrautilizado o con margen claro de mejora |
| 3 | 3 | MV_USO_ECONOMICO_RAZONABLE | Uso económico razonable | El activo parece sostener un uso económico razonable |
| 4 | 4 | MV_MANTENER | Conviene mantener | La opción más defendible parece ser mantener el activo |
| 5 | 5 | MV_TRANSFORMAR | Conviene transformar | La opción más defendible parece ser transformar el activo |

## 6. Motivos de Descarte

| ID | Código | Nombre | Descripción |
|----|-------|---------|----------|
| 1 | 1 | MD_SIN_SENTIDO_NEGOCIO_REAL | Sin sentido de negocio real | El activo no parece tener sentido de negocio real |
| 2 | 2 | MD_NO_INFRAUTILIZADO | Sin infrautilización relevante | El activo no parece estar infrautilizado de manera relevante |
| 3 | 3 | MD_NO_USO_ECONOMICO_RAZONABLE | Uso económico no razonable | El activo no parece sostener un uso económico razonable |
| 4 | 4 | MD_NO_MANTENER | No conviene mantener | La opción de mantener no parece ser la más defendible |
| 5 | 5 | MD_NO_TRANSFORMAR | No conviene transformar | La opción de transformación no parece ser la más defendible |

## 7. Comportamiento del Modal

### 7.1. Estados del Modal

1. **Cerrado:** Modal no visible
2. **Abierto:** Modal visible, mostrando formulario
3. **Cargando:** Modal visible, mostrando indicador de carga mientras se valida
4. **Error:** Modal visible, mostrando mensaje de error

### 7.2. Interacción con Backend

**Al Abrir:**
- El modal debe cargar los estados disponibles del proyecto
- Debe obtener el estado actual del proyecto
- Mostrar el estado actual seleccionado

**Al Confirmar:**
- Validar que el nuevo estado es válido
- Si se requiere motivo, validar que está seleccionado
- Llamar al endpoint `PUT /api/pai/proyectos/:id/estado`
- Mostrar indicador de guardado mientras se actualiza

**Al Cancelar:**
- Cerrar el modal sin realizar cambios

### 7.3. Validaciones

- El estado seleccionado debe ser diferente del estado actual
- El estado debe ser válido (existente en PAI_VAL_valores)
- Si se selecciona un estado que requiere motivo, el motivo correspondiente también debe ser seleccionado

## 8. Integración con Pipeline Events

**Evento a registrar:**
- **Tipo:** `cambiar_estado`
- **Nivel:** `INFO`
- **Detalle:** Incluye `estado_id` (nuevo) y `motivo_valoracion_id` o `motivo_descarte_id` (si aplica)

## 9. Referencias

- **Endpoints PAI:** [`Especificacion_API_PAI.md`](../Especificacion_API_PAI.md)
- **Estados y Motivos:** [`11_Estados_Motivos.md`](../11_Estados_Motivos.md)
- **Tipos PAI:** [`apps/worker/src/types/pai.ts`](../../apps/worker/src/types/pai.ts)

---

**Fin del Documento**
