const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { NotificationService } = require('../services/notificationService');

const notificationService = new NotificationService();

/**
 * Controlador para funcionalidades sociales de la red de feedback
 */

// ==============================================
// SEGUIMIENTOS DE USUARIOS
// ==============================================

/**
 * Seguir a un usuario
 */
const seguirUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const seguidorId = req.user.id;

    // No se puede seguir a sí mismo
    if (seguidorId === usuarioId) {
      return res.status(400).json({ 
        success: false, 
        message: 'No puedes seguirte a ti mismo' 
      });
    }

    // Verificar que el usuario a seguir existe
    const { data: usuario, error: usuarioError } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, privacidad_perfil')
      .eq('id', usuarioId)
      .single();

    if (usuarioError || !usuario) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Verificar si ya se está siguiendo
    const { data: seguimientoExistente } = await supabase
      .from('seguimientos_usuarios')
      .select('id')
      .eq('seguidor_id', seguidorId)
      .eq('seguido_id', usuarioId)
      .single();

    if (seguimientoExistente) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya estás siguiendo a este usuario' 
      });
    }

    // Crear el seguimiento
    const { data: nuevoSeguimiento, error: seguimientoError } = await supabase
      .from('seguimientos_usuarios')
      .insert({
        seguidor_id: seguidorId,
        seguido_id: usuarioId
      })
      .select()
      .single();

    if (seguimientoError) {
      throw seguimientoError;
    }

    // Crear notificación para el usuario seguido
    await notificationService.notificarNuevoSeguidor(seguidorId, usuarioId);

    res.json({
      success: true,
      message: `Ahora sigues a ${usuario.nombre_completo}`,
      data: nuevoSeguimiento
    });

  } catch (error) {
    console.error('Error al seguir usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Dejar de seguir a un usuario
 */
const dejarDeSeguir = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const seguidorId = req.user.id;

    const { error } = await supabase
      .from('seguimientos_usuarios')
      .delete()
      .eq('seguidor_id', seguidorId)
      .eq('seguido_id', usuarioId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Has dejado de seguir a este usuario'
    });

  } catch (error) {
    console.error('Error al dejar de seguir:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtener seguidores de un usuario
 */
const obtenerSeguidores = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: seguidores, error } = await supabase
      .from('seguimientos_usuarios')
      .select(`
        id,
        fecha_seguimiento,
        seguidor_id,
        seguido_id
      `)
      .eq('seguido_id', usuarioId)
      .order('fecha_seguimiento', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Obtener información de los seguidores por separado
    const seguidoresConPerfiles = await Promise.all(
      seguidores.map(async (seguimiento) => {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select(`
            id,
            nombre_completo,
            username,
            url_avatar,
            verificado,
            recompensas_usuario(nivel, puntos_totales)
          `)
          .eq('id', seguimiento.seguidor_id)
          .single();

        return {
          ...seguimiento,
          seguidor: perfil
        };
      })
    );

    res.json({
      success: true,
      data: seguidoresConPerfiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: seguidoresConPerfiles.length
      }
    });

  } catch (error) {
    console.error('Error al obtener seguidores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtener usuarios que sigue un usuario
 */
const obtenerSiguiendo = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: siguiendo, error } = await supabase
      .from('seguimientos_usuarios')
      .select(`
        id,
        fecha_seguimiento,
        seguidor_id,
        seguido_id
      `)
      .eq('seguidor_id', usuarioId)
      .order('fecha_seguimiento', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Obtener información de los usuarios seguidos por separado
    const siguiendoConPerfiles = await Promise.all(
      siguiendo.map(async (seguimiento) => {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select(`
            id,
            nombre_completo,
            username,
            url_avatar,
            verificado,
            recompensas_usuario(nivel, puntos_totales)
          `)
          .eq('id', seguimiento.seguido_id)
          .single();

        return {
          ...seguimiento,
          seguido: perfil
        };
      })
    );

    res.json({
      success: true,
      data: siguiendoConPerfiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: siguiendoConPerfiles.length
      }
    });

  } catch (error) {
    console.error('Error al obtener siguiendo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// ==============================================
// HASHTAGS
// ==============================================

/**
 * Crear o obtener hashtag
 */
const crearHashtag = async (req, res) => {
  try {
    const { nombre, descripcion, color } = req.body;
    const creadorId = req.user.id;

    // Validar formato del hashtag
    if (!/^[a-zA-Z0-9_]+$/.test(nombre)) {
      return res.status(400).json({
        success: false,
        message: 'El hashtag solo puede contener letras, números y guiones bajos'
      });
    }

    // Buscar hashtag existente
    const { data: hashtagExistente } = await supabase
      .from('hashtags')
      .select('*')
      .eq('nombre', nombre.toLowerCase())
      .single();

    if (hashtagExistente) {
      return res.json({
        success: true,
        message: 'Hashtag ya existe',
        data: hashtagExistente
      });
    }

    // Crear nuevo hashtag
    const { data: nuevoHashtag, error } = await supabase
      .from('hashtags')
      .insert({
        nombre: nombre.toLowerCase(),
        descripcion,
        color: color || '#3B82F6',
        creado_por_id: creadorId
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Hashtag creado exitosamente',
      data: nuevoHashtag
    });

  } catch (error) {
    console.error('Error al crear hashtag:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtener hashtags populares
 */
const obtenerHashtagsPopulares = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const { data: hashtags, error } = await supabase
      .from('hashtags')
      .select('*')
      .order('uso_contador', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: hashtags
    });

  } catch (error) {
    console.error('Error al obtener hashtags:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// ==============================================
// COMPARTIR Y GUARDAR FEEDBACK
// ==============================================

/**
 * Compartir feedback
 */
const compartirFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { comentario } = req.body;
    const usuarioId = req.user.id;

    // Verificar que el feedback existe y permite compartir
    const { data: feedback, error: feedbackError } = await supabase
      .from('retroalimentacion')
      .select('id, titulo, permite_compartir, usuario_id, compartido_contador')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback no encontrado'
      });
    }

    if (!feedback.permite_compartir) {
      return res.status(400).json({
        success: false,
        message: 'Este feedback no permite ser compartido'
      });
    }

    // Verificar si ya fue compartido por este usuario
    const { data: compartidoExistente } = await supabase
      .from('feedback_compartidos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('retroalimentacion_id', feedbackId)
      .single();

    if (compartidoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya has compartido este feedback'
      });
    }

    // Crear el compartir
    const { data: nuevoCompartir, error: compartirError } = await supabase
      .from('feedback_compartidos')
      .insert({
        usuario_id: usuarioId,
        retroalimentacion_id: feedbackId,
        comentario_compartir: comentario
      })
      .select()
      .single();

    if (compartirError) {
      throw compartirError;
    }

    // Actualizar contador de compartidos
    await supabase
      .from('retroalimentacion')
      .update({ compartido_contador: (feedback.compartido_contador || 0) + 1 })
      .eq('id', feedbackId);

    // Crear notificación para el autor original (si no es el mismo usuario)
    if (feedback.usuario_id !== usuarioId) {
      await supabase
        .from('notificaciones')
        .insert({
          usuario_id: feedback.usuario_id,
          tipo_notificacion: 'like_recibido', // Reutilizamos el tipo
          titulo: 'Tu feedback fue compartido',
          mensaje: `${req.user.nombre_completo} compartió tu feedback: "${feedback.titulo}"`,
          relacionado_id: feedbackId,
          relacionado_tipo: 'feedback'
        });
    }

    res.json({
      success: true,
      message: 'Feedback compartido exitosamente',
      data: nuevoCompartir
    });

  } catch (error) {
    console.error('Error al compartir feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Guardar feedback
 */
const guardarFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { notas } = req.body;
    const usuarioId = req.user.id;

    // Verificar que el feedback existe
    const { data: feedback, error: feedbackError } = await supabase
      .from('retroalimentacion')
      .select('id, titulo, guardado_contador')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback no encontrado'
      });
    }

    // Verificar si ya fue guardado por este usuario
    const { data: guardadoExistente } = await supabase
      .from('feedback_guardados')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('retroalimentacion_id', feedbackId)
      .single();

    if (guardadoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya has guardado este feedback'
      });
    }

    // Crear el guardado
    const { data: nuevoGuardado, error: guardadoError } = await supabase
      .from('feedback_guardados')
      .insert({
        usuario_id: usuarioId,
        retroalimentacion_id: feedbackId,
        notas_personales: notas
      })
      .select()
      .single();

    if (guardadoError) {
      throw guardadoError;
    }

    // Actualizar contador de guardados
    await supabase
      .from('retroalimentacion')
      .update({ guardado_contador: (feedback.guardado_contador || 0) + 1 })
      .eq('id', feedbackId);

    res.json({
      success: true,
      message: 'Feedback guardado exitosamente',
      data: nuevoGuardado
    });

  } catch (error) {
    console.error('Error al guardar feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtener feedback guardado por el usuario
 */
const obtenerFeedbackGuardado = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: feedbackGuardado, error } = await supabase
      .from('feedback_guardados')
      .select(`
        id,
        fecha_guardado,
        notas_personales,
        retroalimentacion:retroalimentacion(
          id,
          titulo,
          contenido,
          categoria,
          contador_likes,
          compartido_contador,
          guardado_contador,
          fecha_creacion,
          usuario:perfiles!retroalimentacion_usuario_id_fkey(
            id,
            nombre_completo,
            username,
            url_avatar,
            verificado
          )
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('fecha_guardado', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: feedbackGuardado,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: feedbackGuardado.length
      }
    });

  } catch (error) {
    console.error('Error al obtener feedback guardado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// ==============================================
// NOTIFICACIONES
// ==============================================

/**
 * Obtener notificaciones del usuario
 */
const obtenerNotificaciones = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { page = 1, limit = 20, soloNoLeidas = false } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('fecha_creacion', { ascending: false })
      .range(offset, offset + limit - 1);

    if (soloNoLeidas === 'true') {
      query = query.eq('leida', false);
    }

    const { data: notificaciones, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: notificaciones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notificaciones.length
      }
    });

  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Marcar notificación como leída
 */
const marcarNotificacionLeida = async (req, res) => {
  try {
    const { notificacionId } = req.params;
    const usuarioId = req.user.id;

    const { error } = await supabase
      .from('notificaciones')
      .update({ 
        leida: true, 
        fecha_leida: new Date().toISOString() 
      })
      .eq('id', notificacionId)
      .eq('usuario_id', usuarioId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });

  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
const marcarTodasLeidas = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const { error } = await supabase
      .from('notificaciones')
      .update({ 
        leida: true, 
        fecha_leida: new Date().toISOString() 
      })
      .eq('usuario_id', usuarioId)
      .eq('leida', false);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });

  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtener feedbacks compartidos por un usuario
 */
const obtenerFeedbacksCompartidos = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: compartidos, error } = await supabase
      .from('feedback_compartidos')
      .select(`
        id,
        fecha_compartido,
        comentario_compartir,
        retroalimentacion:retroalimentacion(
          id,
          titulo,
          contenido,
          categoria,
          contador_likes,
          compartido_contador,
          guardado_contador,
          fecha_creacion,
          usuario_id,
          perfiles!retroalimentacion_usuario_id_fkey(
            id,
            nombre_completo,
            username,
            url_avatar,
            verificado
          )
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('fecha_compartido', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: compartidos || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: compartidos?.length || 0
      }
    });

  } catch (error) {
    console.error('Error al obtener feedbacks compartidos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtener feedbacks guardados por un usuario
 */
const obtenerFeedbacksGuardados = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: guardados, error } = await supabase
      .from('feedback_guardados')
      .select(`
        id,
        fecha_guardado,
        notas_personales,
        retroalimentacion:retroalimentacion(
          id,
          titulo,
          contenido,
          categoria,
          contador_likes,
          compartido_contador,
          guardado_contador,
          fecha_creacion,
          usuario_id,
          perfiles!retroalimentacion_usuario_id_fkey(
            id,
            nombre_completo,
            username,
            url_avatar,
            verificado
          )
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('fecha_guardado', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: guardados || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: guardados?.length || 0
      }
    });

  } catch (error) {
    console.error('Error al obtener feedbacks guardados:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

/**
 * Obtener likes dados por un usuario
 */
const obtenerLikesDados = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: likes, error } = await supabase
      .from('retroalimentacion_likes')
      .select(`
        id,
        fecha_creacion,
        retroalimentacion:retroalimentacion(
          id,
          titulo,
          contenido,
          categoria,
          contador_likes,
          compartido_contador,
          guardado_contador,
          fecha_creacion,
          usuario_id,
          perfiles!retroalimentacion_usuario_id_fkey(
            id,
            nombre_completo,
            username,
            url_avatar,
            verificado
          )
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('fecha_creacion', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: likes || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: likes?.length || 0
      }
    });

  } catch (error) {
    console.error('Error al obtener likes dados:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  // Seguimientos
  seguirUsuario,
  dejarDeSeguir,
  obtenerSeguidores,
  obtenerSiguiendo,
  
  // Hashtags
  crearHashtag,
  obtenerHashtagsPopulares,
  
  // Compartir y guardar
  compartirFeedback,
  guardarFeedback,
  obtenerFeedbackGuardado,
  obtenerFeedbacksCompartidos,
  obtenerFeedbacksGuardados,
  obtenerLikesDados,
  
  // Notificaciones
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas
};
