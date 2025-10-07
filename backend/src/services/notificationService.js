// services/notificationService.js - Sistema completo de notificaciones sociales
const { supabase } = require('../config/database');

class NotificationService {
  
  /**
   * Crear una notificación genérica
   */
  async crearNotificacion(datosNotificacion) {
    try {
      console.log('📢 Creando notificación:', datosNotificacion);
      
      const { data, error } = await supabase
        .from('notificaciones')
        .insert({
          usuario_id: datosNotificacion.usuario_id,
          tipo_notificacion: datosNotificacion.tipo,
          titulo: datosNotificacion.titulo,
          mensaje: datosNotificacion.mensaje,
          relacionado_id: datosNotificacion.relacionado_id || null,
          relacionado_tipo: datosNotificacion.relacionado_tipo || null,
          fecha_creacion: new Date().toISOString(),
          leida: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando notificación:', error);
        throw error;
      }

      console.log('✅ Notificación creada:', data);
      
      // Intentar enviar push notification si está disponible
      await this.enviarPushNotification(datosNotificacion.usuario_id, {
        title: datosNotificacion.titulo,
        body: datosNotificacion.mensaje,
        icon: '/logo.png',
        badge: '/logo.png',
        data: {
          type: datosNotificacion.tipo,
          relacionado_id: datosNotificacion.relacionado_id,
          relacionado_tipo: datosNotificacion.relacionado_tipo
        }
      });

      return data;
    } catch (error) {
      console.error('❌ Error en crearNotificacion:', error);
      throw error;
    }
  }

  /**
   * Notificación cuando alguien da like a un tema
   */
  async notificarLikeTema(temaId, usuarioQueDaLike, autorTema) {
    if (usuarioQueDaLike === autorTema) return; // No notificar si es el mismo usuario

    try {
      // Obtener datos del tema
      const { data: tema, error: temaError } = await supabase
        .from('temas_conversacion')
        .select('titulo')
        .eq('id', temaId)
        .single();

      if (temaError) throw temaError;

      // Obtener datos del usuario que da like
      const { data: usuario, error: usuarioError } = await supabase
        .from('perfiles')
        .select('nombre_completo, username')
        .eq('id', usuarioQueDaLike)
        .single();

      if (usuarioError) throw usuarioError;

      const nombreUsuario = usuario.username || usuario.nombre_completo;
      
      await this.crearNotificacion({
        usuario_id: autorTema,
        tipo: 'like_recibido',
        titulo: '👍 ¡Te dieron like!',
        mensaje: `${nombreUsuario} le gustó tu tema: "${tema.titulo}"`,
        relacionado_id: temaId,
        relacionado_tipo: 'tema'
      });

    } catch (error) {
      console.error('❌ Error en notificarLikeTema:', error);
    }
  }

  /**
   * Notificación cuando alguien comparte un tema
   */
  async notificarCompartirTema(temaId, usuarioQueComparte, autorTema) {
    if (usuarioQueComparte === autorTema) return;

    try {
      const { data: tema, error: temaError } = await supabase
        .from('temas_conversacion')
        .select('titulo')
        .eq('id', temaId)
        .single();

      if (temaError) throw temaError;

      const { data: usuario, error: usuarioError } = await supabase
        .from('perfiles')
        .select('nombre_completo, username')
        .eq('id', usuarioQueComparte)
        .single();

      if (usuarioError) throw usuarioError;

      const nombreUsuario = usuario.username || usuario.nombre_completo;
      
      await this.crearNotificacion({
        usuario_id: autorTema,
        tipo: 'contenido_compartido',
        titulo: '🔗 ¡Compartieron tu tema!',
        mensaje: `${nombreUsuario} compartió tu tema: "${tema.titulo}"`,
        relacionado_id: temaId,
        relacionado_tipo: 'tema'
      });

    } catch (error) {
      console.error('❌ Error en notificarCompartirTema:', error);
    }
  }

  /**
   * Notificación cuando alguien responde a un tema
   */
  async notificarRespuestaTema(temaId, usuarioQueResponde, autorTema, contenidoRespuesta) {
    console.log('🔔 DEBUG notificarRespuestaTema:', { temaId, usuarioQueResponde, autorTema, contenidoRespuesta });
    
    if (usuarioQueResponde === autorTema) {
      console.log('🔔 DEBUG: Usuario responde a su propio tema, no enviando notificación');
      return;
    }

    try {
      const { data: tema, error: temaError } = await supabase
        .from('temas_conversacion')
        .select('titulo')
        .eq('id', temaId)
        .single();

      if (temaError) throw temaError;

      const { data: usuario, error: usuarioError } = await supabase
        .from('perfiles')
        .select('nombre_completo, username')
        .eq('id', usuarioQueResponde)
        .single();

      if (usuarioError) throw usuarioError;

      const nombreUsuario = usuario.username || usuario.nombre_completo;
      const preview = contenidoRespuesta.length > 50 ? 
        contenidoRespuesta.substring(0, 50) + '...' : 
        contenidoRespuesta;
      
      await this.crearNotificacion({
        usuario_id: autorTema,
        tipo: 'respuesta_recibida',
        titulo: '💬 Nueva respuesta en tu tema',
        mensaje: `${nombreUsuario} respondió: "${preview}"`,
        relacionado_id: temaId,
        relacionado_tipo: 'tema'
      });

    } catch (error) {
      console.error('❌ Error en notificarRespuestaTema:', error);
    }
  }

  /**
   * Notificación cuando alguien te sigue
   */
  async notificarNuevoSeguidor(seguidorId, seguidoId) {
    try {
      const { data: seguidor, error: seguidorError } = await supabase
        .from('perfiles')
        .select('nombre_completo, username')
        .eq('id', seguidorId)
        .single();

      if (seguidorError) throw seguidorError;

      const nombreSeguidor = seguidor.username || seguidor.nombre_completo;
      
      await this.crearNotificacion({
        usuario_id: seguidoId,
        tipo: 'nuevo_seguidor',
        titulo: '👥 ¡Tienes un nuevo seguidor!',
        mensaje: `${nombreSeguidor} ahora te sigue`,
        relacionado_id: seguidorId,
        relacionado_tipo: 'usuario'
      });

    } catch (error) {
      console.error('❌ Error en notificarNuevoSeguidor:', error);
    }
  }

  /**
   * Notificación cuando una contribución cambia de estado
   */
  async notificarEstadoContribucion(contribucionId, usuarioId, nuevoEstado) {
    try {
      const { data: contribucion, error: contribucionError } = await supabase
        .from('contribuciones_diccionario')
        .select('word, comentarios_admin')
        .eq('id', contribucionId)
        .single();

      if (contribucionError) throw contribucionError;

      let titulo, mensaje, tipo;
      
      switch (nuevoEstado) {
        case 'aprobada':
          titulo = '✅ ¡Contribución aprobada!';
          mensaje = `Tu contribución "${contribucion.word}" ha sido aprobada y está disponible en el diccionario`;
          tipo = 'contribucion_aprobada';
          break;
        case 'rechazada':
          titulo = '❌ Contribución rechazada';
          mensaje = `Tu contribución "${contribucion.word}" fue rechazada. ${contribucion.comentarios_admin || ''}`;
          tipo = 'contribucion_rechazada';
          break;
        case 'publicada':
          titulo = '🎉 ¡Contribución publicada!';
          mensaje = `Tu contribución "${contribucion.word}" ya está disponible públicamente`;
          tipo = 'contribucion_publicada';
          break;
        default:
          return;
      }
      
      await this.crearNotificacion({
        usuario_id: usuarioId,
        tipo: tipo,
        titulo: titulo,
        mensaje: mensaje,
        relacionado_id: contribucionId,
        relacionado_tipo: 'contribucion'
      });

    } catch (error) {
      console.error('❌ Error en notificarEstadoContribucion:', error);
    }
  }

  /**
   * Notificación cuando se obtiene un logro
   */
  async notificarLogroObtenido(usuarioId, logroId) {
    try {
      const { data: logro, error: logroError } = await supabase
        .from('logros')
        .select('nombre, descripcion, puntos_otorgados')
        .eq('id', logroId)
        .single();

      if (logroError) throw logroError;
      
      await this.crearNotificacion({
        usuario_id: usuarioId,
        tipo: 'logro_obtenido',
        titulo: '🏆 ¡Nuevo logro desbloqueado!',
        mensaje: `Has obtenido "${logro.nombre}" (+${logro.puntos_otorgados} puntos)`,
        relacionado_id: logroId,
        relacionado_tipo: 'logro'
      });

    } catch (error) {
      console.error('❌ Error en notificarLogroObtenido:', error);
    }
  }

  /**
   * Notificación cuando se ganan puntos
   */
  async notificarPuntosGanados(usuarioId, puntos, motivo) {
    try {
      await this.crearNotificacion({
        usuario_id: usuarioId,
        tipo: 'puntos_ganados',
        titulo: '⭐ ¡Puntos ganados!',
        mensaje: `Has ganado ${puntos} puntos por: ${motivo}`,
        relacionado_id: null,
        relacionado_tipo: 'puntos'
      });

    } catch (error) {
      console.error('❌ Error en notificarPuntosGanados:', error);
    }
  }

  /**
   * Notificación cuando hay cambios en el ranking
   */
  async notificarCambioRanking(usuarioId, nuevaPosicion, periodo) {
    try {
      const emoji = nuevaPosicion <= 3 ? '🥇' : nuevaPosicion <= 10 ? '🥈' : '📈';
      
      await this.crearNotificacion({
        usuario_id: usuarioId,
        tipo: 'ranking_actualizado',
        titulo: `${emoji} Ranking ${periodo} actualizado`,
        mensaje: `Estás en la posición #${nuevaPosicion} del ranking ${periodo}`,
        relacionado_id: null,
        relacionado_tipo: 'ranking'
      });

    } catch (error) {
      console.error('❌ Error en notificarCambioRanking:', error);
    }
  }

  /**
   * Notificación por mención
   */
  async notificarMencion(mencionadorId, mencionadoId, tipoContenido, contenidoId, contexto) {
    if (mencionadorId === mencionadoId) return;

    try {
      const { data: mencionador, error: mencionadorError } = await supabase
        .from('perfiles')
        .select('nombre_completo, username')
        .eq('id', mencionadorId)
        .single();

      if (mencionadorError) throw mencionadorError;

      const nombreMencionador = mencionador.username || mencionador.nombre_completo;
      
      await this.crearNotificacion({
        usuario_id: mencionadoId,
        tipo: 'mencion',
        titulo: '🔔 Te mencionaron',
        mensaje: `${nombreMencionador} te mencionó en ${tipoContenido}: "${contexto}"`,
        relacionado_id: contenidoId,
        relacionado_tipo: tipoContenido
      });

    } catch (error) {
      console.error('❌ Error en notificarMencion:', error);
    }
  }

  /**
   * Enviar push notification (integración con pushNotificationService)
   */
  async enviarPushNotification(usuarioId, payload) {
    try {
      // Importar dinámicamente para evitar dependencias circulares
      const pushNotificationService = require('./pushNotificationService');
      
      await pushNotificationService.sendToUser(usuarioId, payload);
    } catch (error) {
      console.log('📱 Push notification no disponible o falló:', error.message);
      // No lanzar error, las push notifications son opcionales
    }
  }

  /**
   * Obtener notificaciones de un usuario
   */
  async obtenerNotificaciones(usuarioId, limite = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('fecha_creacion', { ascending: false })
        .limit(limite)
        .range(offset, offset + limite - 1);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  async marcarComoLeida(notificacionId, usuarioId) {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .update({ 
          leida: true, 
          fecha_leida: new Date().toISOString() 
        })
        .eq('id', notificacionId)
        .eq('usuario_id', usuarioId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(usuarioId) {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .update({ 
          leida: true, 
          fecha_leida: new Date().toISOString() 
        })
        .eq('usuario_id', usuarioId)
        .eq('leida', false);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Contar notificaciones no leídas
   */
  async contarNoLeidas(usuarioId) {
    try {
      const { count, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', usuarioId)
        .eq('leida', false);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('❌ Error contando notificaciones no leídas:', error);
      return 0;
    }
  }
}

module.exports = { NotificationService };