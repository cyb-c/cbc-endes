/**
 * Simple text system - English (US)
 *
 * Following R5: Idioma y estilo - Multi-language system with es-ES as default
 */

export const MENU_TEXTS: Record<string, string> = {
  // Modules
  'menu.modulos.panel': 'Panel',
  'menu.modulos.facturacion': 'Billing',
  'menu.modulos.proyectos': 'Projects',
  'menu.modulos.directorio': 'Directory',
  'menu.modulos.archivos': 'Files',
  'menu.modulos.administracion': 'Administration',
  'menu.modulos.perfil': 'Profile',
  'menu.modulos.sesion': 'Session',

  // Panel module functions
  'menu.funciones.dashboard': 'Dashboard',
  'menu.funciones.welcome': 'Welcome',

  // Billing module functions
  'menu.funciones.facturas_emitidas': 'Invoices issued',
  'menu.funciones.facturas_recibidas': 'Invoices received',
  'menu.funciones.nueva_factura': 'New invoice',
  'menu.funciones.facturas_rectif': 'Rectifying invoices',
  'menu.funciones.modelos_fiscales': 'Tax forms',

  // Projects module functions
  'menu.funciones.proyectos_todos': 'All projects',
  'menu.funciones.proyectos_nuevo': 'New project',
  'menu.funciones.proyectos_activos': 'Active projects',

  // Directory module functions
  'menu.funciones.clientes': 'Clients',
  'menu.funciones.proveedores': 'Suppliers',
  'menu.funciones.nueva_persona': 'New person',
  'menu.funciones.todos_contactos': 'All contacts',

  // Files module functions
  'menu.funciones.descargas_masivas': 'Mass downloads',
  'menu.funciones.repositorio': 'Repository',

  // Administration module functions
  'menu.funciones.config_general': 'General configuration',
  'menu.funciones.dominios': 'Domains',
  'menu.funciones.auditoria': 'Audit',
  'menu.funciones.usuarios': 'Users',

  // Profile module functions
  'menu.funciones.editar_perfil': 'Edit profile',
  'menu.funciones.cambiar_password': 'Change password',

  // Session module functions
  'menu.funciones.cerrar_sesion': 'Logout',
};

export const PAI_TEXTS: Record<string, string> = {
  // Modules
  'pai.modulos.proyectos': 'Projects',

  // Functions
  'pai.funciones.listar_proyectos': 'List Projects',
  'pai.funciones.crear_proyecto': 'Create Project',
  'pai.funciones.detalle_proyecto': 'View Details',
  'pai.funciones.ejecutar_analisis': 'Execute Analysis',
  'pai.funciones.ver_artefactos': 'View Artifacts',
  'pai.funciones.cambiar_estado': 'Change Status',
  'pai.funciones.eliminar_proyecto': 'Delete Project',
  'pai.funciones.ver_historial': 'View History',

  // Pages
  'pai.paginas.listar_proyectos.titulo': 'PAI Projects',
  'pai.paginas.listar_proyectos.descripcion': 'Real estate analysis project management',
  'pai.paginas.detalle_proyecto.titulo': 'Project Details',
  'pai.paginas.detalle_proyecto.descripcion': 'Detailed information and property analysis',

  // Components - Project List
  'pai.componentes.lista_proyectos.vacio': 'No projects yet. Create the first one.',
  'pai.componentes.lista_proyectos.cargando': 'Loading projects...',
  'pai.componentes.lista_proyectos.error': 'Error loading projects',

  // Components - Project Table
  'pai.componentes.tabla_proyectos.columna.id': 'ID',
  'pai.componentes.tabla_proyectos.columna.cii': 'CII',
  'pai.componentes.tabla_proyectos.columna.titulo': 'Title',
  'pai.componentes.tabla_proyectos.columna.estado': 'Status',
  'pai.componentes.tabla_proyectos.columna.tipo': 'Type',
  'pai.componentes.tabla_proyectos.columna.ciudad': 'City',
  'pai.componentes.tabla_proyectos.columna.fecha': 'Date',
  'pai.componentes.tabla_proyectos.columna.acciones': 'Actions',
  'pai.componentes.tabla_proyectos.accion.ver': 'View',

  // Components - Project Header
  'pai.componentes.cabecera_proyecto.cii': 'CII',
  'pai.componentes.cabecera_proyecto.estado': 'Status',

  // Components - Basic Data
  'pai.componentes.datos_basicos.titulo': 'Property Basic Data',
  'pai.componentes.datos_basicos.portal': 'Portal',
  'pai.componentes.datos_basicos.url_fuente': 'Source URL',
  'pai.componentes.datos_basicos.tipo_operacion': 'Operation Type',
  'pai.componentes.datos_basicos.tipo_inmueble': 'Property Type',
  'pai.componentes.datos_basicos.precio': 'Price',
  'pai.componentes.datos_basicos.precio_por_m2': 'Price per m²',
  'pai.componentes.datos_basicos.superficie_total': 'Total Area',
  'pai.componentes.datos_basicos.superficie_construida': 'Built Area',
  'pai.componentes.datos_basicos.superficie_util': 'Useful Area',
  'pai.componentes.datos_basicos.ciudad': 'City',
  'pai.componentes.datos_basicos.provincia': 'Province',
  'pai.componentes.datos_basicos.barrio': 'Neighborhood',
  'pai.componentes.datos_basicos.direccion': 'Address',
  'pai.componentes.datos_basicos.fecha_alta': 'Registration Date',
  'pai.componentes.datos_basicos.fecha_ultima_actualizacion': 'Last Update',

  // Components - Analysis Results
  'pai.componentes.resultados_analisis.titulo': 'Analysis Results',
  'pai.componentes.resultados_analisis.pestana.resumen_ejecutivo': 'Executive Summary',
  'pai.componentes.resultados_analisis.pestana.datos_transformados': 'Transformed Data',
  'pai.componentes.resultados_analisis.pestana.analisis_fisico': 'Physical Analysis',
  'pai.componentes.resultados_analisis.pestana.analisis_estrategico': 'Strategic Analysis',
  'pai.componentes.resultados_analisis.pestana.analisis_financiero': 'Financial Analysis',
  'pai.componentes.resultados_analisis.pestana.analisis_regulatorio': 'Regulatory Analysis',
  'pai.componentes.resultados_analisis.pestana.lectura_inversor': 'Investor Reading',
  'pai.componentes.resultados_analisis.pestana.lectura_operador': 'Operator Reading',
  'pai.componentes.resultados_analisis.pestana.lectura_propietario': 'Owner Reading',

  // Components - Notes
  'pai.componentes.notas.titulo': 'Notes',
  'pai.componentes.notas.sin_notas': 'No notes for this project',
  'pai.componentes.notas.cargando': 'Loading notes...',
  'pai.componentes.notas.error': 'Error loading notes',
  'pai.componentes.notas.tipo.comentario': 'Comment',
  'pai.componentes.notas.tipo.valoracion': 'Assessment',
  'pai.componentes.notas.tipo.decision': 'Decision',
  'pai.componentes.notas.tipo.correccion_ia': 'AI Correction',
  'pai.componentes.notas.autor': 'Author',
  'pai.componentes.notas.fecha': 'Date',
  'pai.componentes.notas.contenido': 'Content',

  // Forms - Create Project
  'pai.formularios.crear_proyecto.titulo': 'Create New PAI Project',
  'pai.formularios.crear_proyecto.descripcion': 'Paste the JSON content of the property listing to create a new project',
  'pai.formularios.crear_proyecto.label.ijson': 'Property IJSON',
  'pai.formularios.crear_proyecto.placeholder.ijson': '{"titulo": "...", ...}',
  'pai.formularios.crear_proyecto.boton.crear': 'Create Project',
  'pai.formularios.crear_proyecto.boton.cancelar': 'Cancel',

  // Forms - Create Note
  'pai.formularios.crear_nota.titulo': 'Add Note',
  'pai.formularios.crear_nota.label.tipo': 'Note Type',
  'pai.formularios.crear_nota.label.autor': 'Author',
  'pai.formularios.crear_nota.label.contenido': 'Content',
  'pai.formularios.crear_nota.placeholder.contenido': 'Write your note here...',
  'pai.formularios.crear_nota.boton.guardar': 'Save Note',
  'pai.formularios.crear_nota.boton.cancelar': 'Cancel',

  // Forms - Edit Note
  'pai.formularios.editar_nota.titulo': 'Edit Note',
  'pai.formularios.editar_nota.label.contenido': 'Content',
  'pai.formularios.editar_nota.placeholder.contenido': 'Write your note here...',
  'pai.formularios.editar_nota.boton.guardar': 'Save Changes',
  'pai.formularios.editar_nota.boton.cancelar': 'Cancel',

  // Forms - Change Status
  'pai.formularios.cambiar_estado.titulo': 'Change Project Status',
  'pai.formularios.cambiar_estado.label.estado': 'New Status',
  'pai.formularios.cambiar_estado.label.motivo': 'Reason',
  'pai.formularios.cambiar_estado.label.descripcion': 'Description',
  'pai.formularios.cambiar_estado.placeholder.descripcion': 'Describe the reason for the status change...',
  'pai.formularios.cambiar_estado.boton.cambiar': 'Change Status',
  'pai.formularios.cambiar_estado.boton.cancelar': 'Cancel',

  // Buttons
  'pai.botones.crear_proyecto': 'Create Project',
  'pai.botones.ejecutar_analisis': 'Execute Analysis',
  'pai.botones.cambiar_estado': 'Change Status',
  'pai.botones.eliminar_proyecto': 'Delete Project',
  'pai.botones.ver_historial': 'View History',
  'pai.botones.anadir_nota': 'Add Note',
  'pai.botones.editar_nota': 'Edit',
  'pai.botones.eliminar_nota': 'Delete',
  'pai.botones.reintentar': 'Retry',
  'pai.botones.confirmar': 'Confirm',
  'pai.botones.cancelar': 'Cancel',

  // Messages - Success
  'pai.mensajes.exito.proyecto_creado': 'Project created successfully',
  'pai.mensajes.exito.proyecto_actualizado': 'Project updated successfully',
  'pai.mensajes.exito.proyecto_eliminado': 'Project deleted successfully',
  'pai.mensajes.exito.analisis_ejecutado': 'Analysis executed successfully',
  'pai.mensajes.exito.estado_cambiado': 'Status changed successfully',
  'pai.mensajes.exito.nota_creada': 'Note created successfully',
  'pai.mensajes.exito.nota_editada': 'Note edited successfully',
  'pai.mensajes.exito.nota_eliminada': 'Note deleted successfully',

  // Messages - Error
  'pai.mensajes.error.proyecto_no_creado': 'Error creating project',
  'pai.mensajes.error.proyecto_no_actualizado': 'Error updating project',
  'pai.mensajes.error.proyecto_no_eliminado': 'Error deleting project',
  'pai.mensajes.error.analisis_no_ejecutado': 'Error executing analysis',
  'pai.mensajes.error.estado_no_cambiado': 'Error changing status',
  'pai.mensajes.error.nota_no_creada': 'Error creating note',
  'pai.mensajes.error.nota_no_editada': 'Error editing note',
  'pai.mensajes.error.nota_no_eliminada': 'Error deleting note',
  'pai.mensajes.error.proyecto_no_encontrado': 'Project not found',
  'pai.mensajes.error.ijson_invalido': 'IJSON is not in valid JSON format',
  'pai.mensajes.error.conexion': 'Connection error with server',

  // Messages - Information
  'pai.mensajes.info.nota_no_editable': 'This note cannot be edited because the project status has changed',
  'pai.mensajes.info.analisis_en_proceso': 'Analysis is in progress',
  'pai.mensajes.info.proyecto_descartado': 'This project has been discarded',

  // Messages - Confirmation
  'pai.mensajes.confirmacion.eliminar_proyecto': 'Are you sure you want to delete this project? This action cannot be undone.',
  'pai.mensajes.confirmacion.eliminar_nota': 'Are you sure you want to delete this note?',

  // Status
  'pai.estados.creado': 'Created',
  'pai.estados.en_analisis': 'In Analysis',
  'pai.estados.pendiente_revision': 'Pending Review',
  'pai.estados.evaluando_viabilidad': 'Evaluating Viability',
  'pai.estados.evaluando_plan_negocio': 'Evaluating Business Plan',
  'pai.estados.seguimiento_comercial': 'Commercial Follow-up',
  'pai.estados.descartado': 'Discarded',
  'pai.estados.aprobado': 'Approved',
  'pai.estados.analisis_con_error': 'Analysis with Error',

  // Assessment Reasons
  'pai.motivos.valoracion.sentido_negocio_real': 'Real business sense',
  'pai.motivos.valoracion.infrautilizado': 'Underutilized',
  'pai.motivos.valoracion.uso_economico_razonable': 'Reasonable economic use',
  'pai.motivos.valoracion.mantener': 'Should maintain',
  'pai.motivos.valoracion.transformar': 'Should transform',
  'pai.motivos.valoracion.reconversion_defendible_valencia': 'Defensible reconversion in Valencia',

  // Discard Reasons
  'pai.motivos.descarte.sin_sentido_negocio_real': 'No real business sense',
  'pai.motivos.descarte.no_infrautilizado_ni_mejorable': 'No relevant underutilization',
  'pai.motivos.descarte.sin_uso_economico_razonable': 'No reasonable economic use',
  'pai.motivos.descarte.no_conviene_mantener': 'Not advisable to maintain',
  'pai.motivos.descarte.no_conviene_transformar': 'Not advisable to transform',
  'pai.motivos.descarte.reconversion_no_defendible_valencia': 'Reconversion not defensible',
  'pai.motivos.descarte.hipotesis_atractiva_no_sostenible': 'Attractive hypothesis not sustainable',
  'pai.motivos.descarte.hipotesis_no_sostenible': 'Hypothesis not sustainable',

  // Validations
  'pai.validaciones.ijson_requerido': 'IJSON is required',
  'pai.validaciones.ijson_invalido': 'IJSON is not in valid JSON format',
  'pai.validaciones.ijson_campos_faltantes': 'IJSON is missing required fields',
  'pai.validaciones.tipo_nota_requerido': 'Note type is required',
  'pai.validaciones.autor_requerido': 'Author is required',
  'pai.validaciones.contenido_requerido': 'Content is required',
  'pai.validaciones.estado_requerido': 'Status is required',
  'pai.validaciones.motivo_requerido': 'Reason is required',
};
