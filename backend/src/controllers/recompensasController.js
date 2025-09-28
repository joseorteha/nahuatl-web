// controllers/recompensasController.js
const recompensasService = require('../services/recompensasService');
const { supabase } = require('../config/database');

class RecompensasController {
  /**
   * Obtener recompensas del usuario
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async obtenerRecompensasUsuario(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
      }

      const recompensas = await recompensasService.obtenerRecompensasUsuario(userId);
      const logros = await recompensasService.obtenerLogrosUsuario(userId);
      
      res.json({
        message: 'Recompensas obtenidas exitosamente',
        recompensas,
        logros,
        stats: {
          puntos_totales: recompensas.puntos_totales,
          nivel: recompensas.nivel,
          experiencia: recompensas.experiencia,
          logros_obtenidos: logros.length
        }
      });
    } catch (error) {
      console.error('Error al obtener recompensas:', error);
      res.status(500).json({ 
        error: 'Error al obtener recompensas',
        message: error.message 
      });
    }
  }

  /**
   * Obtener ranking de usuarios
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async obtenerRanking(req, res) {
    try {
      const { limite = 10 } = req.query;
      
      const ranking = await recompensasService.obtenerRanking(parseInt(limite));
      
      res.json({
        message: 'Ranking obtenido exitosamente',
        ranking
      });
    } catch (error) {
      console.error('Error al obtener ranking:', error);
      res.status(500).json({ 
        error: 'Error al obtener ranking',
        message: error.message 
      });
    }
  }

  /**
   * Procesar acción de recompensa (para uso interno)
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async procesarAccion(req, res) {
    try {
      const { userId, accion, datos } = req.body;

      if (!userId || !accion) {
        return res.status(400).json({ error: 'userId y accion son requeridos' });
      }

      let puntos = 0;
      let motivo = '';
      let descripcion = '';

      switch (accion) {
        case 'nueva_contribucion':
          puntos = 10;
          motivo = 'contribucion_diccionario';
          descripcion = 'Nueva palabra contribuida al diccionario';
          break;
        case 'contribucion_aprobada':
          puntos = 5;
          motivo = 'contribucion_aprobada';
          descripcion = 'Contribución aprobada por moderador';
          break;
        case 'feedback_enviado':
          puntos = 3;
          motivo = 'feedback_comunidad';
          descripcion = 'Feedback enviado a la comunidad';
          break;
        case 'like_recibido':
          puntos = 2;
          motivo = 'like_recibido';
          descripcion = 'Like recibido en contribución';
          break;
        case 'palabra_guardada':
          puntos = 1;
          motivo = 'palabra_guardada';
          descripcion = 'Nueva palabra guardada';
          break;
        case 'tema_creado':
          puntos = 15;
          motivo = 'tema_creado';
          descripcion = 'Nuevo tema de conversación creado';
          break;
        case 'like_dado':
          puntos = 2;
          motivo = 'like_dado';
          descripcion = 'Like dado a tema';
          break;
        default:
          return res.status(400).json({ error: 'Acción no reconocida' });
      }

      await recompensasService.otorgarPuntos(userId, puntos, motivo, descripcion);
      
      // Actualizar experiencia social si es una acción social
      if (['tema_creado', 'like_dado', 'share_dado', 'like_recibido', 'share_recibido', 'respuesta_creada'].includes(accion)) {
        try {
          const { data: recompensasActuales, error: recompensasError } = await supabase
            .from('recompensas_usuario')
            .select('experiencia_social')
            .eq('usuario_id', userId)
            .single();

          if (!recompensasError && recompensasActuales) {
            let puntosExperiencia = 0;
            switch (accion) {
              case 'tema_creado':
                puntosExperiencia = 10;
                break;
              case 'like_dado':
                puntosExperiencia = 2;
                break;
              case 'share_dado':
                puntosExperiencia = 3;
                break;
              case 'like_recibido':
                puntosExperiencia = 1;
                break;
              case 'share_recibido':
                puntosExperiencia = 2;
                break;
              case 'respuesta_creada':
                puntosExperiencia = 5;
                break;
            }

            const nuevaExperienciaSocial = (recompensasActuales.experiencia_social || 0) + puntosExperiencia;

            await supabase
              .from('recompensas_usuario')
              .update({ 
                experiencia_social: nuevaExperienciaSocial,
                fecha_actualizacion: new Date().toISOString()
              })
              .eq('usuario_id', userId);
          }
        } catch (expError) {
          console.warn('Error updating experiencia social:', expError);
          // No fallar la operación principal por esto
        }
      }
      
      res.json({
        message: 'Acción procesada exitosamente',
        puntos_otorgados: puntos
      });
    } catch (error) {
      console.error('Error al procesar acción:', error);
      res.status(500).json({ 
        error: 'Error al procesar acción',
        message: error.message 
      });
    }
  }

  /**
   * Obtener historial de puntos del usuario
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async obtenerHistorialPuntos(req, res) {
    try {
      const { userId } = req.params;
      const { limite = 20 } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
      }

      const { data: historial, error } = await supabase
        .from('historial_puntos')
        .select('*')
        .eq('usuario_id', userId)
        .order('fecha_creacion', { ascending: false })
        .limit(parseInt(limite));

      if (error) throw error;
      
      res.json({
        message: 'Historial obtenido exitosamente',
        historial: historial || []
      });
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({ 
        error: 'Error al obtener historial',
        message: error.message 
      });
    }
  }
}

module.exports = new RecompensasController();
