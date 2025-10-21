/**
 * Controlador para gestión de solicitudes de maestros
 * Fase 2: Sistema de Lecciones - Backend API
 */

const { supabase } = require('../config/database');
const { validarCamposRequeridos, validarEmail } = require('../utils/validaciones');
const { NotificationService } = require('../services/notificationService');

const notificationService = new NotificationService();

/**
 * Obtener especialidades disponibles
 * GET /api/solicitudes-maestros/especialidades
 */
const obtenerEspecialidades = async (req, res) => {
  try {
    const { data: especialidades, error } = await supabase
      .from('especialidades_maestros')
      .select('*')
      .eq('activa', true)
      .order('orden_display', { ascending: true });

    if (error) {
      console.error('Error obteniendo especialidades:', error);
      return res.status(500).json({ error: 'Error al obtener especialidades' });
    }

    res.json({ especialidades });

  } catch (error) {
    console.error('Error en obtenerEspecialidades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Crear nueva solicitud de maestro
 * POST /api/solicitudes-maestros
 */
const crearSolicitudMaestro = async (req, res) => {
  try {
    const { 
      especialidad_id,
      especialidad_otra, 
      experiencia, 
      motivacion, 
      propuesta_contenido,
      habilidades_especiales,
      disponibilidad_horas,
      email,
      nombre_completo
    } = req.body;

    // Para solicitudes públicas, necesitamos email y nombre
    if (!email || !nombre_completo) {
      return res.status(400).json({
        error: 'Email y nombre completo son requeridos para solicitudes públicas'
      });
    }

    // Validar email
    if (!validarEmail(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    // Validar especialidad
    if (!especialidad_id) {
      return res.status(400).json({
        error: 'Debe seleccionar una especialidad'
      });
    }

    // Si seleccionó "otro", debe especificar la especialidad
    const { data: especialidadSeleccionada } = await supabase
      .from('especialidades_maestros')
      .select('*')
      .eq('id', especialidad_id)
      .single();

    if (especialidadSeleccionada?.nombre === 'otro' && !especialidad_otra) {
      return res.status(400).json({
        error: 'Debe especificar la especialidad en el campo "Otra especialidad"'
      });
    }

    // Validar campos requeridos
    const camposRequeridos = ['experiencia', 'motivacion', 'propuesta_contenido'];
    const validacion = validarCamposRequeridos(req.body, camposRequeridos);
    if (!validacion.valido) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        detalles: validacion.faltantes
      });
    }

    // Verificar que no tenga una solicitud pendiente con el mismo email
    const { data: solicitudExistente, error: errorVerificacion } = await supabase
      .from('solicitudes_maestros')
      .select('id, estado')
      .eq('email', email)
      .eq('estado', 'pendiente')
      .single();

    if (errorVerificacion && errorVerificacion.code !== 'PGRST116') {
      console.error('Error verificando solicitud existente:', errorVerificacion);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (solicitudExistente) {
      return res.status(400).json({ 
        error: 'Ya existe una solicitud pendiente para este email' 
      });
    }

    // Crear la solicitud
    const especialidadTexto = especialidadSeleccionada?.nombre === 'otro' 
      ? especialidad_otra 
      : especialidadSeleccionada?.nombre;

    const { data: nuevaSolicitud, error: errorCreacion } = await supabase
      .from('solicitudes_maestros')
      .insert([{
        email,
        nombre_completo,
        especialidad_id,
        especialidad: especialidadTexto,
        experiencia,
        motivacion,
        propuesta_contenido,
        habilidades_especiales,
        disponibilidad_horas,
        estado: 'pendiente',
        fecha_solicitud: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (errorCreacion) {
      console.error('Error creando solicitud:', errorCreacion);
      console.error('Datos intentados a insertar:', {
        email,
        nombre_completo,
        especialidad,
        experiencia,
        motivacion,
        propuesta_contenido,
        habilidades_especiales,
        disponibilidad_horas,
        estado: 'pendiente',
        fecha_solicitud: new Date().toISOString()
      });
      return res.status(500).json({ error: 'Error al crear la solicitud', detalles: errorCreacion.message });
    }

    // Notificar a administradores (temporalmente deshabilitado)
    // TODO: Agregar 'solicitud_maestro' al enum de relacionado_tipo en BD
    /*
    const { data: admins } = await supabase
      .from('perfiles')
      .select('id')
      .in('rol', ['admin', 'moderador']);

    if (admins) {
      for (const admin of admins) {
        await notificationService.crearNotificacion({
          usuario_id: admin.id,
          tipo: 'solicitud_maestro_nueva',
          titulo: 'Nueva solicitud de maestro',
          mensaje: `${nombre_completo} ha enviado una solicitud para ser maestro en ${especialidad}`,
          relacionado_id: nuevaSolicitud.id,
          relacionado_tipo: 'solicitud_maestro'
        });
      }
    }
    */

    res.status(201).json({
      message: 'Solicitud enviada exitosamente',
      solicitud: nuevaSolicitud
    });

  } catch (error) {
    console.error('Error en crearSolicitudMaestro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener solicitudes del usuario autenticado
 * GET /api/solicitudes-maestros/mis-solicitudes
 */
const obtenerMisSolicitudes = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const { data: solicitudes, error } = await supabase
      .from('solicitudes_maestros')
      .select(`
        *,
        admin_revisor:admin_revisor_id(nombre_completo)
      `)
      .eq('usuario_id', usuario_id)
      .order('fecha_solicitud', { ascending: false });

    if (error) {
      console.error('Error obteniendo solicitudes:', error);
      return res.status(500).json({ error: 'Error al obtener solicitudes' });
    }

    res.json({ solicitudes });

  } catch (error) {
    console.error('Error en obtenerMisSolicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener todas las solicitudes (solo admins)
 * GET /api/solicitudes-maestros/admin
 */
const obtenerTodasLasSolicitudes = async (req, res) => {
  try {
    const { estado = 'todas', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('solicitudes_maestros')
      .select(`
        *,
        especialidades_maestros:especialidad_id(nombre, descripcion, icono),
        admin_revisor:admin_revisor_id(nombre_completo)
      `, { count: 'exact' })
      .order('fecha_solicitud', { ascending: false })
      .range(offset, offset + limit - 1);

    if (estado !== 'todas') {
      query = query.eq('estado', estado);
    }

    const { data: solicitudes, error, count } = await query;

    if (error) {
      console.error('Error obteniendo solicitudes admin:', error);
      return res.status(500).json({ error: 'Error al obtener solicitudes' });
    }

    res.json({ 
      solicitudes,
      totalCount: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Error en obtenerTodasLasSolicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Procesar solicitud (aprobar/rechazar) - Solo admins
 * PUT /api/solicitudes-maestros/:id/procesar
 */
const procesarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { accion, comentarios_admin } = req.body; // accion: 'aprobar' | 'rechazar'
    const admin_id = req.user.id;

    if (!['aprobar', 'rechazar'].includes(accion)) {
      return res.status(400).json({ error: 'Acción inválida' });
    }

    // Obtener la solicitud
    const { data: solicitud, error: errorSolicitud } = await supabase
      .from('solicitudes_maestros')
      .select('*, usuario:usuario_id(nombre_completo, email)')
      .eq('id', id)
      .single();

    if (errorSolicitud || !solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Esta solicitud ya ha sido procesada' });
    }

    const nuevoEstado = accion === 'aprobar' ? 'aprobada' : 'rechazada';
    const fechaActual = new Date().toISOString();

    // Actualizar solicitud
    const { data: solicitudActualizada, error: errorActualizacion } = await supabase
      .from('solicitudes_maestros')
      .update({
        estado: nuevoEstado,
        comentarios_admin,
        admin_revisor_id: admin_id,
        fecha_revision: fechaActual,
        ...(accion === 'aprobar' && { fecha_aprobacion: fechaActual })
      })
      .eq('id', id)
      .select()
      .single();

    if (errorActualizacion) {
      console.error('Error actualizando solicitud:', errorActualizacion);
      return res.status(500).json({ error: 'Error al procesar solicitud' });
    }

    let usuarioExistente = null;

    // Si se aprueba, buscar si existe un usuario con ese email y actualizar rol
    if (accion === 'aprobar') {
      console.log('🔍 Buscando usuario con email:', solicitud.email);
      
      const { data: usuario, error: errorBusqueda } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, email, rol')
        .eq('email', solicitud.email)
        .single();

      if (!errorBusqueda && usuario) {
        console.log('✅ Usuario encontrado, actualizando rol a profesor:', usuario.id);
        usuarioExistente = usuario;
        
        const { error: errorRol } = await supabase
          .from('perfiles')
          .update({ rol: 'profesor' })
          .eq('id', usuario.id);

        if (errorRol) {
          console.error('❌ Error actualizando rol:', errorRol);
        } else {
          console.log('🎓 Rol de profesor asignado exitosamente');
        }
      } else {
        console.log('ℹ️ No se encontró usuario registrado con email:', solicitud.email);
      }
    }

    // Crear notificación para el usuario (solo si tiene cuenta registrada)
    if (usuarioExistente?.id) {
      await notificationService.crearNotificacion({
        usuario_id: usuarioExistente.id,
        tipo: accion === 'aprobar' ? 'solicitud_maestro_aprobada' : 'solicitud_maestro_rechazada',
        titulo: accion === 'aprobar' ? '¡Solicitud aprobada!' : 'Solicitud revisada',
        mensaje: accion === 'aprobar' 
          ? '¡Felicidades! Tu solicitud para ser maestro ha sido aprobada. Ya puedes crear lecciones.'
          : `Tu solicitud para ser maestro ha sido revisada. ${comentarios_admin || 'Puedes intentar nuevamente más tarde.'}`,
        relacionado_id: id,
        relacionado_tipo: 'solicitud_maestro'
      });
    }

    res.json({
      message: `Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`,
      solicitud: solicitudActualizada
    });

  } catch (error) {
    console.error('Error en procesarSolicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener estadísticas de solicitudes (admin)
 * GET /api/solicitudes-maestros/estadisticas
 */
const obtenerEstadisticasSolicitudes = async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .from('solicitudes_maestros')
      .select('estado')
      .then(response => {
        if (response.error) throw response.error;
        
        const estadisticas = response.data.reduce((acc, solicitud) => {
          acc[solicitud.estado] = (acc[solicitud.estado] || 0) + 1;
          return acc;
        }, {});

        return {
          data: {
            total: response.data.length,
            pendientes: estadisticas.pendiente || 0,
            aprobadas: estadisticas.aprobada || 0,
            rechazadas: estadisticas.rechazada || 0
          }
        };
      });

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }

    res.json({ estadisticas: stats.data });

  } catch (error) {
    console.error('Error en obtenerEstadisticasSolicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  crearSolicitudMaestro,
  obtenerMisSolicitudes,
  obtenerTodasLasSolicitudes,
  procesarSolicitud,
  obtenerEstadisticasSolicitudes,
  obtenerEspecialidades
};