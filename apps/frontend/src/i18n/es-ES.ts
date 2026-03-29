/**
 * Sistema de textos simple - Español
 * 
 * Following R5: Idioma y estilo - Documentación del proyecto en español
 */

export const MENU_TEXTS: Record<string, string> = {
  // Módulos
  'menu.modulos.panel': 'Panel',
  'menu.modulos.facturacion': 'Facturación',
  'menu.modulos.proyectos': 'Proyectos',
  'menu.modulos.directorio': 'Directorio',
  'menu.modulos.archivos': 'Archivos',
  'menu.modulos.administracion': 'Administración',
  'menu.modulos.perfil': 'Perfil',
  'menu.modulos.sesion': 'Sesión',

  // Funciones del módulo Panel
  'menu.funciones.dashboard': 'Dashboard',
  'menu.funciones.welcome': 'Bienvenida',

  // Funciones del módulo Facturación
  'menu.funciones.facturas_emitidas': 'Facturas emitidas',
  'menu.funciones.facturas_recibidas': 'Facturas recibidas',
  'menu.funciones.nueva_factura': 'Nueva factura',
  'menu.funciones.facturas_rectif': 'Facturas rectificativas',
  'menu.funciones.modelos_fiscales': 'Modelos fiscales',

  // Funciones del módulo Proyectos
  'menu.funciones.proyectos_todos': 'Todos los proyectos',
  'menu.funciones.proyectos_nuevo': 'Nuevo proyecto',
  'menu.funciones.proyectos_activos': 'Proyectos activos',

  // Funciones del módulo Directorio
  'menu.funciones.clientes': 'Clientes',
  'menu.funciones.proveedores': 'Proveedores',
  'menu.funciones.nueva_persona': 'Nueva persona',
  'menu.funciones.todos_contactos': 'Todos los contactos',

  // Funciones del módulo Archivos
  'menu.funciones.descargas_masivas': 'Descargas masivas',
  'menu.funciones.repositorio': 'Repositorio',

  // Funciones del módulo Administración
  'menu.funciones.config_general': 'Configuración general',
  'menu.funciones.dominios': 'Dominios',
  'menu.funciones.auditoria': 'Auditoría',
  'menu.funciones.usuarios': 'Usuarios',

  // Funciones del módulo Perfil
  'menu.funciones.editar_perfil': 'Editar perfil',
  'menu.funciones.cambiar_password': 'Cambiar contraseña',

  // Funciones del módulo Sesión
  'menu.funciones.cerrar_sesion': 'Cerrar sesión',
};

export const PAI_TEXTS: Record<string, string> = {
  // Módulos
  'pai.modulos.proyectos': 'Proyectos',

  // Funciones
  'pai.funciones.listar_proyectos': 'Listar Proyectos',
  'pai.funciones.crear_proyecto': 'Crear Proyecto',
  'pai.funciones.detalle_proyecto': 'Ver Detalle',
  'pai.funciones.ejecutar_analisis': 'Ejecutar Análisis',
  'pai.funciones.ver_artefactos': 'Ver Artefactos',
  'pai.funciones.cambiar_estado': 'Cambiar Estado',
  'pai.funciones.eliminar_proyecto': 'Eliminar Proyecto',
  'pai.funciones.ver_historial': 'Ver Historial',

  // Páginas
  'pai.paginas.listar_proyectos.titulo': 'Proyectos PAI',
  'pai.paginas.listar_proyectos.descripcion': 'Gestión de proyectos de análisis inmobiliario',
  'pai.paginas.detalle_proyecto.titulo': 'Detalle del Proyecto',
  'pai.paginas.detalle_proyecto.descripcion': 'Información detallada y análisis del inmueble',

  // Componentes - Lista de Proyectos
  'pai.componentes.lista_proyectos.vacio': 'No hay proyectos aún. Crea el primero.',
  'pai.componentes.lista_proyectos.cargando': 'Cargando proyectos...',
  'pai.componentes.lista_proyectos.error': 'Error al cargar proyectos',

  // Componentes - Tabla de Proyectos
  'pai.componentes.tabla_proyectos.columna.id': 'ID',
  'pai.componentes.tabla_proyectos.columna.cii': 'CII',
  'pai.componentes.tabla_proyectos.columna.titulo': 'Título',
  'pai.componentes.tabla_proyectos.columna.estado': 'Estado',
  'pai.componentes.tabla_proyectos.columna.tipo': 'Tipo',
  'pai.componentes.tabla_proyectos.columna.ciudad': 'Ciudad',
  'pai.componentes.tabla_proyectos.columna.fecha': 'Fecha',
  'pai.componentes.tabla_proyectos.columna.acciones': 'Acciones',
  'pai.componentes.tabla_proyectos.accion.ver': 'Ver',

  // Componentes - Cabecera del Proyecto
  'pai.componentes.cabecera_proyecto.cii': 'CII',
  'pai.componentes.cabecera_proyecto.estado': 'Estado',

  // Componentes - Datos Básicos
  'pai.componentes.datos_basicos.titulo': 'Datos Básicos del Inmueble',
  'pai.componentes.datos_basicos.portal': 'Portal',
  'pai.componentes.datos_basicos.url_fuente': 'URL Fuente',
  'pai.componentes.datos_basicos.tipo_operacion': 'Tipo de Operación',
  'pai.componentes.datos_basicos.tipo_inmueble': 'Tipo de Inmueble',
  'pai.componentes.datos_basicos.precio': 'Precio',
  'pai.componentes.datos_basicos.precio_por_m2': 'Precio por m²',
  'pai.componentes.datos_basicos.superficie_total': 'Superficie Total',
  'pai.componentes.datos_basicos.superficie_construida': 'Superficie Construida',
  'pai.componentes.datos_basicos.superficie_util': 'Superficie Útil',
  'pai.componentes.datos_basicos.ciudad': 'Ciudad',
  'pai.componentes.datos_basicos.provincia': 'Provincia',
  'pai.componentes.datos_basicos.barrio': 'Barrio',
  'pai.componentes.datos_basicos.direccion': 'Dirección',
  'pai.componentes.datos_basicos.fecha_alta': 'Fecha de Alta',
  'pai.componentes.datos_basicos.fecha_ultima_actualizacion': 'Última Actualización',

  // Componentes - Resultados del Análisis
  'pai.componentes.resultados_analisis.titulo': 'Resultados del Análisis',
  'pai.componentes.resultados_analisis.pestana.resumen_ejecutivo': 'Resumen Ejecutivo',
  'pai.componentes.resultados_analisis.pestana.datos_transformados': 'Datos Transformados',
  'pai.componentes.resultados_analisis.pestana.analisis_fisico': 'Análisis Físico',
  'pai.componentes.resultados_analisis.pestana.analisis_estrategico': 'Análisis Estratégico',
  'pai.componentes.resultados_analisis.pestana.analisis_financiero': 'Análisis Financiero',
  'pai.componentes.resultados_analisis.pestana.analisis_regulatorio': 'Análisis Regulatorio',
  'pai.componentes.resultados_analisis.pestana.lectura_inversor': 'Lectura Inversor',
  'pai.componentes.resultados_analisis.pestana.lectura_operador': 'Lectura Operador',
  'pai.componentes.resultados_analisis.pestana.lectura_propietario': 'Lectura Propietario',

  // Componentes - Notas
  'pai.componentes.notas.titulo': 'Notas',
  'pai.componentes.notas.sin_notas': 'No hay notas para este proyecto',
  'pai.componentes.notas.cargando': 'Cargando notas...',
  'pai.componentes.notas.error': 'Error al cargar notas',
  'pai.componentes.notas.tipo.comentario': 'Comentario',
  'pai.componentes.notas.tipo.valoracion': 'Valoración',
  'pai.componentes.notas.tipo.decision': 'Decisión',
  'pai.componentes.notas.tipo.correccion_ia': 'Corrección IA',
  'pai.componentes.notas.autor': 'Autor',
  'pai.componentes.notas.fecha': 'Fecha',
  'pai.componentes.notas.contenido': 'Contenido',

  // Formularios - Crear Proyecto
  'pai.formularios.crear_proyecto.titulo': 'Crear Nuevo Proyecto PAI',
  'pai.formularios.crear_proyecto.descripcion': 'Pega el contenido JSON del anuncio inmobiliario para crear un nuevo proyecto',
  'pai.formularios.crear_proyecto.label.ijson': 'IJSON del Inmueble',
  'pai.formularios.crear_proyecto.placeholder.ijson': '{"titulo": "...", ...}',
  'pai.formularios.crear_proyecto.boton.crear': 'Crear Proyecto',
  'pai.formularios.crear_proyecto.boton.cancelar': 'Cancelar',

  // Formularios - Crear Nota
  'pai.formularios.crear_nota.titulo': 'Añadir Nota',
  'pai.formularios.crear_nota.label.tipo': 'Tipo de Nota',
  'pai.formularios.crear_nota.label.autor': 'Autor',
  'pai.formularios.crear_nota.label.contenido': 'Contenido',
  'pai.formularios.crear_nota.placeholder.contenido': 'Escribe tu nota aquí...',
  'pai.formularios.crear_nota.boton.guardar': 'Guardar Nota',
  'pai.formularios.crear_nota.boton.cancelar': 'Cancelar',

  // Formularios - Editar Nota
  'pai.formularios.editar_nota.titulo': 'Editar Nota',
  'pai.formularios.editar_nota.label.contenido': 'Contenido',
  'pai.formularios.editar_nota.placeholder.contenido': 'Escribe tu nota aquí...',
  'pai.formularios.editar_nota.boton.guardar': 'Guardar Cambios',
  'pai.formularios.editar_nota.boton.cancelar': 'Cancelar',

  // Formularios - Cambiar Estado
  'pai.formularios.cambiar_estado.titulo': 'Cambiar Estado del Proyecto',
  'pai.formularios.cambiar_estado.label.estado': 'Nuevo Estado',
  'pai.formularios.cambiar_estado.label.motivo': 'Motivo',
  'pai.formularios.cambiar_estado.label.descripcion': 'Descripción',
  'pai.formularios.cambiar_estado.placeholder.descripcion': 'Describe el motivo del cambio de estado...',
  'pai.formularios.cambiar_estado.boton.cambiar': 'Cambiar Estado',
  'pai.formularios.cambiar_estado.boton.cancelar': 'Cancelar',

  // Botones
  'pai.botones.crear_proyecto': 'Crear Proyecto',
  'pai.botones.ejecutar_analisis': 'Ejecutar Análisis',
  'pai.botones.cambiar_estado': 'Cambiar Estado',
  'pai.botones.eliminar_proyecto': 'Eliminar Proyecto',
  'pai.botones.ver_historial': 'Ver Historial',
  'pai.botones.anadir_nota': 'Añadir Nota',
  'pai.botones.editar_nota': 'Editar',
  'pai.botones.eliminar_nota': 'Eliminar',
  'pai.botones.reintentar': 'Reintentar',
  'pai.botones.confirmar': 'Confirmar',
  'pai.botones.cancelar': 'Cancelar',

  // Análisis - Estados del botón
  'pai.analisis.ejecutar': 'Ejecutar Análisis',
  'pai.analisis.en_progreso': 'Ejecutando paso {paso} de 7: {nombre}',
  'pai.analisis.finalizado': 'Análisis Finalizado',
  'pai.analisis.reintentar': 'Reintentar Análisis',
  'pai.analisis.confirmar_reejecucion': '¿Desea re-ejecutar el análisis? Se reemplazarán los resultados anteriores.',
  'pai.analisis.error': 'Error al ejecutar análisis: {mensaje}',

  // Mensajes - Éxito
  'pai.mensajes.exito.proyecto_creado': 'Proyecto creado correctamente',
  'pai.mensajes.exito.proyecto_actualizado': 'Proyecto actualizado correctamente',
  'pai.mensajes.exito.proyecto_eliminado': 'Proyecto eliminado correctamente',
  'pai.mensajes.exito.analisis_ejecutado': 'Análisis ejecutado correctamente',
  'pai.mensajes.exito.estado_cambiado': 'Estado cambiado correctamente',
  'pai.mensajes.exito.nota_creada': 'Nota creada correctamente',
  'pai.mensajes.exito.nota_editada': 'Nota editada correctamente',
  'pai.mensajes.exito.nota_eliminada': 'Nota eliminada correctamente',

  // Mensajes - Error
  'pai.mensajes.error.proyecto_no_creado': 'Error al crear el proyecto',
  'pai.mensajes.error.proyecto_no_actualizado': 'Error al actualizar el proyecto',
  'pai.mensajes.error.proyecto_no_eliminado': 'Error al eliminar el proyecto',
  'pai.mensajes.error.analisis_no_ejecutado': 'Error al ejecutar el análisis',
  'pai.mensajes.error.estado_no_cambiado': 'Error al cambiar el estado',
  'pai.mensajes.error.nota_no_creada': 'Error al crear la nota',
  'pai.mensajes.error.nota_no_editada': 'Error al editar la nota',
  'pai.mensajes.error.nota_no_eliminada': 'Error al eliminar la nota',
  'pai.mensajes.error.proyecto_no_encontrado': 'Proyecto no encontrado',
  'pai.mensajes.error.ijson_invalido': 'El IJSON no tiene el formato correcto',
  'pai.mensajes.error.conexion': 'Error de conexión con el servidor',

  // Mensajes - Información
  'pai.mensajes.info.nota_no_editable': 'Esta nota no se puede editar porque el estado del proyecto ha cambiado',
  'pai.mensajes.info.analisis_en_proceso': 'El análisis está en proceso de ejecución',
  'pai.mensajes.info.proyecto_descartado': 'Este proyecto ha sido descartado',

  // Mensajes - Confirmación
  'pai.mensajes.confirmacion.eliminar_proyecto': '¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.',
  'pai.mensajes.confirmacion.eliminar_nota': '¿Estás seguro de que deseas eliminar esta nota?',

  // Estados
  'pai.estados.creado': 'Creado',
  'pai.estados.en_analisis': 'En análisis',
  'pai.estados.pendiente_revision': 'Pendiente de revisión',
  'pai.estados.evaluando_viabilidad': 'Evaluando viabilidad',
  'pai.estados.evaluando_plan_negocio': 'Evaluando Plan de Negocio',
  'pai.estados.seguimiento_comercial': 'Seguimiento comercial',
  'pai.estados.descartado': 'Descartado',
  'pai.estados.aprobado': 'Aprobado',
  'pai.estados.analisis_con_error': 'Análisis con error',

  // Motivos de Valoración
  'pai.motivos.valoracion.sentido_negocio_real': 'Sentido de negocio real',
  'pai.motivos.valoracion.infrautilizado': 'Infrautilizado',
  'pai.motivos.valoracion.uso_economico_razonable': 'Uso económico razonable',
  'pai.motivos.valoracion.mantener': 'Conviene mantener',
  'pai.motivos.valoracion.transformar': 'Conviene transformar',
  'pai.motivos.valoracion.reconversion_defendible_valencia': 'Reconversión defendible en València',

  // Motivos de Descarte
  'pai.motivos.descarte.sin_sentido_negocio_real': 'Sin sentido de negocio real',
  'pai.motivos.descarte.no_infrautilizado_ni_mejorable': 'Sin infrautilización relevante',
  'pai.motivos.descarte.sin_uso_economico_razonable': 'Sin uso económico razonable',
  'pai.motivos.descarte.no_conviene_mantener': 'No conviene mantener',
  'pai.motivos.descarte.no_conviene_transformar': 'No conviene transformar',
  'pai.motivos.descarte.reconversion_no_defendible_valencia': 'Reconversión no defendible',
  'pai.motivos.descarte.hipotesis_atractiva_no_sostenible': 'Hipótesis atractiva no sostenible',
  'pai.motivos.descarte.hipotesis_no_sostenible': 'Hipótesis no sostenible',

  // Validaciones
  'pai.validaciones.ijson_requerido': 'El IJSON es obligatorio',
  'pai.validaciones.ijson_invalido': 'El IJSON no tiene el formato JSON válido',
  'pai.validaciones.ijson_campos_faltantes': 'El IJSON no tiene los campos obligatorios',
  'pai.validaciones.tipo_nota_requerido': 'El tipo de nota es obligatorio',
  'pai.validaciones.autor_requerido': 'El autor es obligatorio',
  'pai.validaciones.contenido_requerido': 'El contenido es obligatorio',
  'pai.validaciones.estado_requerido': 'El estado es obligatorio',
  'pai.validaciones.motivo_requerido': 'El motivo es obligatorio',
};
