// services/recompensasService.js
const { supabase } = require('../config/database');

class RecompensasService {
  /**
   * Obtener recompensas del usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Recompensas del usuario
   */
  async obtenerRecompensasUsuario(userId) {
    try {
      const { data: recompensas, error } = await supabase
        .from('recompensas_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // Si no existe, crear registro inicial
      if (!recompensas) {
        const { data: nuevasRecompensas, error: createError } = await supabase
          .from('recompensas_usuario')
          .insert([{
            usuario_id: userId,
            puntos_totales: 0,
            nivel: 'principiante',
            experiencia: 0
          }])
          .select()
          .single();

        if (createError) throw createError;
        return nuevasRecompensas;
      }

      return recompensas;
    } catch (error) {
      console.error('Error obteniendo recompensas del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener logros del usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Logros obtenidos
   */
  async obtenerLogrosUsuario(userId) {
    try {
      const { data: logros, error } = await supabase
        .from('logros_usuario')
        .select(`
          *,
          logros (
            nombre,
            descripcion,
            icono,
            categoria,
            puntos_otorgados
          )
        `)
        .eq('usuario_id', userId)
        .order('fecha_obtenido', { ascending: false });

      if (error) throw error;
      return logros || [];
    } catch (error) {
      console.error('Error obteniendo logros del usuario:', error);
      throw error;
    }
  }

  /**
   * Otorgar puntos al usuario
   * @param {string} userId - ID del usuario
   * @param {number} puntos - Puntos a otorgar
   * @param {string} motivo - Motivo de los puntos
   * @param {string} descripcion - Descripción detallada
   */
  async otorgarPuntos(userId, puntos, motivo, descripcion = '') {
    try {
      // Registrar en historial
      await supabase
        .from('historial_puntos')
        .insert([{
          usuario_id: userId,
          puntos_ganados: puntos,
          motivo,
          descripcion
        }]);

      // Actualizar puntos totales y experiencia
      const { data: recompensas } = await this.obtenerRecompensasUsuario(userId);
      const nuevosPuntos = recompensas.puntos_totales + puntos;
      const nuevaExperiencia = recompensas.experiencia + puntos;
      
      // Calcular nuevo nivel
      const nuevoNivel = this.calcularNivel(nuevaExperiencia);

      await supabase
        .from('recompensas_usuario')
        .update({
          puntos_totales: nuevosPuntos,
          experiencia: nuevaExperiencia,
          nivel: nuevoNivel,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('usuario_id', userId);

      // Verificar nuevos logros
      await this.verificarLogros(userId);

    } catch (error) {
      console.error('Error otorgando puntos:', error);
      throw error;
    }
  }

  /**
   * Calcular nivel basado en experiencia
   * @param {number} experiencia - Puntos de experiencia
   * @returns {string} Nivel del usuario
   */
  calcularNivel(experiencia) {
    if (experiencia < 50) return 'principiante';
    if (experiencia < 200) return 'contribuidor';
    if (experiencia < 500) return 'experto';
    if (experiencia < 1000) return 'maestro';
    return 'leyenda';
  }

  /**
   * Verificar si el usuario ha obtenido nuevos logros
   * @param {string} userId - ID del usuario
   */
  async verificarLogros(userId) {
    try {
      // Obtener estadísticas actuales del usuario
      const stats = await this.obtenerEstadisticasParaLogros(userId);
      
      // Obtener todos los logros disponibles
      const { data: logrosDisponibles } = await supabase
        .from('logros')
        .select('*');

      // Obtener logros ya obtenidos
      const { data: logrosObtenidos } = await supabase
        .from('logros_usuario')
        .select('logro_id')
        .eq('usuario_id', userId);

      const idsLogrosObtenidos = new Set(logrosObtenidos?.map(l => l.logro_id) || []);

      // Verificar cada logro
      for (const logro of logrosDisponibles) {
        if (idsLogrosObtenidos.has(logro.id)) continue; // Ya obtenido

        const cumpleCondicion = this.verificarCondicionLogro(logro, stats);
        
        if (cumpleCondicion) {
          await this.otorgarLogro(userId, logro.id, logro.puntos_otorgados);
        }
      }
    } catch (error) {
      console.error('Error verificando logros:', error);
    }
  }

  /**
   * Obtener estadísticas del usuario para verificar logros
   * @param {string} userId - ID del usuario
   */
  async obtenerEstadisticasParaLogros(userId) {
    try {
      // Obtener contribuciones
      const { data: contribuciones } = await supabase
        .from('contribuciones_diccionario')
        .select('id')
        .eq('usuario_id', userId);

      // Obtener feedback
      const { data: feedback } = await supabase
        .from('retroalimentacion')
        .select('id')
        .eq('usuario_id', userId);

      // Obtener palabras guardadas
      const { data: palabrasGuardadas } = await supabase
        .from('palabras_guardadas')
        .select('id')
        .eq('usuario_id', userId);

      // Obtener likes recibidos (esto requiere una consulta más compleja)
      const { data: likesRecibidos } = await supabase
        .from('retroalimentacion_likes')
        .select('id, retroalimentacion(usuario_id)')
        .eq('retroalimentacion.usuario_id', userId);

      return {
        contribuciones_cantidad: contribuciones?.length || 0,
        feedback_cantidad: feedback?.length || 0,
        palabras_guardadas: palabrasGuardadas?.length || 0,
        likes_recibidos: likesRecibidos?.length || 0,
        dias_consecutivos: 0 // Por implementar
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas para logros:', error);
      return {
        contribuciones_cantidad: 0,
        feedback_cantidad: 0,
        palabras_guardadas: 0,
        likes_recibidos: 0,
        dias_consecutivos: 0
      };
    }
  }

  /**
   * Verificar si se cumple la condición para un logro
   * @param {Object} logro - Datos del logro
   * @param {Object} stats - Estadísticas del usuario
   */
  verificarCondicionLogro(logro, stats) {
    switch (logro.condicion_tipo) {
      case 'contribuciones_cantidad':
        return stats.contribuciones_cantidad >= logro.condicion_valor;
      case 'feedback_cantidad':
        return stats.feedback_cantidad >= logro.condicion_valor;
      case 'palabras_guardadas':
        return stats.palabras_guardadas >= logro.condicion_valor;
      case 'likes_recibidos':
        return stats.likes_recibidos >= logro.condicion_valor;
      case 'primera_contribucion':
        return stats.contribuciones_cantidad >= 1;
      case 'dias_consecutivos':
        return stats.dias_consecutivos >= logro.condicion_valor;
      default:
        return false;
    }
  }

  /**
   * Otorgar un logro al usuario
   * @param {string} userId - ID del usuario
   * @param {string} logroId - ID del logro
   * @param {number} puntosExtra - Puntos adicionales del logro
   */
  async otorgarLogro(userId, logroId, puntosExtra = 0) {
    try {
      // Insertar logro obtenido
      await supabase
        .from('logros_usuario')
        .insert([{
          usuario_id: userId,
          logro_id: logroId,
          notificado: false
        }]);

      // Otorgar puntos adicionales si los hay
      if (puntosExtra > 0) {
        await this.otorgarPuntos(userId, puntosExtra, 'logro_obtenido', `Logro desbloqueado: ${puntosExtra} puntos`);
      }
    } catch (error) {
      console.error('Error otorgando logro:', error);
    }
  }

  /**
   * Obtener ranking de usuarios
   * @param {number} limite - Número de usuarios a mostrar
   */
  async obtenerRanking(limite = 10) {
    try {
      const { data: ranking, error } = await supabase
        .from('recompensas_usuario')
        .select(`
          *,
          perfiles (
            nombre_completo,
            username
          )
        `)
        .order('puntos_totales', { ascending: false })
        .limit(limite);

      if (error) throw error;
      return ranking || [];
    } catch (error) {
      console.error('Error obteniendo ranking:', error);
      throw error;
    }
  }
}

module.exports = new RecompensasService();
