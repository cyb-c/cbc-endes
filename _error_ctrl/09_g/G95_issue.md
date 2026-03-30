**Issue**

* Edición de notas del proyecto no precarga los datos existentes en el formulario de edición

**Descripción**

* En la pantalla `https://pg-cbc-endes.pages.dev/proyectos`, en la sección **Notas del Proyecto**, al intentar editar una nota existente, el formulario de edición no muestra la información actual de la nota.
* El contenido de la nota sí se visualiza en la tarjeta/listado antes de iniciar la edición, pero al pulsar **Editar** los campos del formulario aparecen vacíos.
* Esto impide editar sobre la información existente y obliga a reingresar los datos manualmente.

**Referencia visual**

* Imagen: `_error_ctrl/09_g/G95.png`
* Contexto visual: sección **Notas del Proyecto** en la pantalla de proyectos

**Problemas detectados**

* [Referencia visual 1]

  * La nota existente muestra información visible en pantalla antes de editar:

    * asunto/título de la nota
    * estado al crear
    * contenido de la nota
    * autor
    * fecha/hora de creación

* [Referencia visual 2]

  * El usuario pulsa la acción **Editar** sobre una nota existente.

* [Referencia visual 3]

  * El formulario de edición se muestra sin los datos previos de la nota seleccionada.
  * Los campos aparecen vacíos en lugar de mostrar la información actual de la nota a editar.

**Comportamiento esperado**

* Al pulsar **Editar** sobre una nota existente:

  * el formulario debe cargarse con los valores actuales de la nota seleccionada
  * el usuario debe ver los datos previos antes de guardar cambios
  * los campos visibles en la nota deberían mantenerse disponibles para edición según corresponda

**Notas técnicas**

* Pantalla afectada:

  * `https://pg-cbc-endes.pages.dev/proyectos`

* Sección afectada:

  * **Notas del Proyecto**

* Acción afectada:

  * edición de notas existentes

* Campos visibles en el formulario según la captura:

  * `Tipo de Nota`
  * `Autor`
  * `Asunto`
  * `Contenido`

* Validación solicitada por negocio/QA:

  * antes de aplicar cualquier cambio, realizar diagnóstico completo del flujo de edición
  * identificar los elementos involucrados en el error:

    * componentes
    * funciones
    * endpoints
    * campos
    * cualquier otro elemento técnico relacionado con la carga de datos en edición

* Restricción:

  * no aplicar cambios sin finalizar primero el diagnóstico del origen del problema

**Resumen**

* La edición de notas en **Notas del Proyecto** no está recuperando ni mostrando los datos existentes de la nota seleccionada.
* La relación visual reportada es:

  * [Referencia visual 1] la nota se ve correctamente
  * [Referencia visual 2] el usuario pulsa **Editar**
  * [Referencia visual 3] el formulario aparece vacío
* Se requiere diagnóstico completo previo del flujo de edición antes de realizar cualquier corrección.

---

## Diagnóstico Completado

### Fecha del Diagnóstico: 2026-03-30

### Componentes Involucrados

| Componente | Archivo | Estado |
|------------|---------|--------|
| `ListaNotas.tsx` | `apps/frontend/src/components/pai/` | ❌ Bug identificado |
| `FormularioEditarNota.tsx` | `apps/frontend/src/components/pai/` | ✅ Correcto |
| `FormularioNota.tsx` | `apps/frontend/src/components/pai/` | ✅ Correcto (solo creación) |

### Causa Raíz Identificada

**El botón "Editar" está llamando al formulario incorrecto.**

**Código problemático (`ListaNotas.tsx`, línea ~127):**

```tsx
<button
  onClick={() => setMostrarFormulario(true)}
  className="text-blue-600 hover:text-blue-800 text-sm"
>
  Editar
</button>
```

**Problema:**
- El botón abre `FormularioNota` (formulario de CREACIÓN)
- Debería abrir `FormularioEditarNota` (formulario de EDICIÓN)
- No se pasa la nota seleccionada al formulario

**Flujo actual (INCORRECTO):**
```
1. Click en "Editar" 
   ↓
2. setMostrarFormulario(true)
   ↓
3. Se muestra <FormularioNota /> (vacío, para crear)
   ↓
4. Usuario ve campos vacíos ❌
```

**Flujo esperado (CORRECTO):**
```
1. Click en "Editar"
   ↓
2. setNotaEditando(nota)
   ↓
3. Se muestra <FormularioEditarNota nota={nota} />
   ↓
4. Usuario ve datos precargados ✅
```

### Estado del Componente `FormularioEditarNota`

El componente **SÍ EXISTE** y está **CORRECTAMENTE IMPLEMENTADO**:

```tsx
// FormularioEditarNota.tsx
export function FormularioEditarNota({ proyectoId, nota, onGuardado, onCancel }) {
  const [contenido, setContenido] = useState(nota.contenido); // ✅ Precarga datos
  
  useEffect(() => {
    setContenido(nota.contenido); // ✅ Actualiza si cambia la nota
  }, [nota.contenido]);
  
  // ... resto del código correcto
}
```

### Solución Requerida

**Modificar `ListaNotas.tsx`:**

1. Añadir estado `notaEditando`:
```tsx
const [notaEditando, setNotaEditando] = useState<Nota | null>(null);
```

2. Cambiar el botón "Editar":
```tsx
<button
  onClick={() => setNotaEditando(nota)}
  className="text-blue-600 hover:text-blue-800 text-sm"
>
  Editar
</button>
```

3. Renderizar `FormularioEditarNota` cuando hay nota seleccionada:
```tsx
{notaEditando ? (
  <FormularioEditarNota
    proyectoId={proyectoId}
    nota={notaEditando}
    onGuardado={handleNotaEditada}
    onCancel={() => setNotaEditando(null)}
  />
) : mostrarFormulario ? (
  <FormularioNota
    proyectoId={proyectoId}
    onGuardado={handleNotaCreada}
    onCancel={() => setMostrarFormulario(false)}
  />
)}
```

4. Añadir handler para nota editada:
```tsx
const handleNotaEditada = (notaActualizada: Nota) => {
  setNotas(notas.map(n => n.id === notaActualizada.id ? notaActualizada : n));
  setNotaEditando(null);
};
```

---

## Corrección Aplicada

**Archivos modificados:**
- `apps/frontend/src/components/pai/ListaNotas.tsx`

**Cambios realizados:**
1. Añadido estado `notaEditando`
2. Añadido handler `handleNotaEditada`
3. Cambiado botón "Editar" para usar `setNotaEditando(nota)`
4. Renderizado condicional de `FormularioEditarNota` vs `FormularioNota`

**Deploy:**
- Frontend: pendiente de deploy

---

**Diagnóstico completado:** 2026-03-30  
**Estado:** ✅ DIAGNOSTICADO Y CORREGIDO  
**Próximo paso:** Verificar que la edición precarga los datos correctamente
