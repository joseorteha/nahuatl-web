// services/pointsService.js
const { supabase } = require('../config/database');

class PointsService {
  /**
   * Otorgar puntos de conocimiento
   * @param {string} userId - ID del usuario
   * @param {number} puntos - Puntos a otorgar
   * @param {string} motivo - Motivo de los puntos
   * @param {string} descripcion - Descripción detallada
   */
  async otorgarPuntosConocimiento(userId, puntos, motivo, descripcion = '') {
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

      // Obtener puntos actuales de conocimiento
      const { data: recompensas, error: recompensasError } = await supabase
        .from('recompensas_usuario')
        .select('puntos_conocimiento')
        .eq('usuario_id', userId)
        .single();

      if (recompensasError && recompensasError.code !== 'PGRST116') {
        throw recompensasError;
      }

      const nuevosPuntosConocimiento = (recompensas?.puntos_conocimiento || 0) + puntos;
      const nuevoNivelConocimiento = this.calcularNivelConocimiento(nuevosPuntosConocimiento);

      // Actualizar solo puntos de conocimiento
      const { error: updateError } = await supabase
        .from('recompensas_usuario')
        .update({
          puntos_conocimiento: nuevosPuntosConocimiento,
          nivel: nuevoNivelConocimiento,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('usuario_id', userId);

      if (updateError) throw updateError;

      // Verificar logros de conocimiento
      await this.verificarLogrosConocimiento(userId);

      return {
        puntos_anteriores: recompensas?.puntos_conocimiento || 0,
        puntos_nuevos: nuevosPuntosConocimiento,
        puntos_ganados: puntos,
        nivel_anterior: recompensas?.nivel || 'principiante',
        nivel_nuevo: nuevoNivelConocimiento
      };

    } catch (error) {
      console.error('Error otorgando puntos de conocimiento:', error);
      throw error;
    }
  }

  /**
   * Otorgar puntos de comunidad
   * @param {string} userId - ID del usuario
   * @param {number} puntos - Puntos a otorgar
   * @param {string} motivo - Motivo de los puntos
   * @param {string} descripcion - Descripción detallada
   */
  async otorgarPuntosComunidad(userId, puntos, motivo, descripcion = '') {
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

      // Obtener experiencia social actual
      const { data: recompensas, error: recompensasError } = await supabase
        .from('recompensas_usuario')
        .select('experiencia_social')
        .eq('usuario_id', userId)
        .single();

      if (recompensasError && recompensasError.code !== 'PGRST116') {
        throw recompensasError;
      }

      const nuevaExperienciaSocial = (recompensas?.experiencia_social || 0) + puntos;

      // Actualizar solo experiencia social
      const { error: updateError } = await supabase
        .from('recompensas_usuario')
        .update({
          experiencia_social: nuevaExperienciaSocial,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('usuario_id', userId);

      if (updateError) throw updateError;

      // Verificar logros de comunidad
      await this.verificarLogrosComunidad(userId);

      return {
        experiencia_anterior: recompensas?.experiencia_social || 0,
        experiencia_nueva: nuevaExperienciaSocial,
        puntos_ganados: puntos
      };

    } catch (error) {
      console.error('Error otorgando puntos de comunidad:', error);
      throw error;
    }
  }

  /**
   * Verificar logros de conocimiento
   * @param {string} userId - ID del usuario
   */
  async verificarLogrosConocimiento(userId) {
    try {
      // Obtener puntos de conocimiento actuales
      const { data: recompensas, error: recompensasError } = await supabase
        .from('recompensas_usuario')
        .select('puntos_conocimiento, contribuciones_aprobadas')
        .eq('usuario_id', userId)
        .single();

      if (recompensasError) throw recompensasError;

      const puntosConocimiento = recompensas?.puntos_conocimiento || 0;
      const contribucionesAprobadas = recompensas?.contribuciones_aprobadas || 0;

      // Obtener logros de conocimiento disponibles
      const { data: logrosDisponibles, error: logrosError } = await supabase
        .from('logros')
        .select('*')
        .eq('categoria', 'conocimiento');

      if (logrosError) throw logrosError;

      // Obtener logros ya obtenidos
      const { data: logrosObtenidos, error: obtenidosError } = await supabase
        .from('logros_usuario')
        .select('logro_id')
        .eq('usuario_id', userId);

      if (obtenidosError) throw obtenidosError;

      const logrosObtenidosIds = logrosObtenidos?.map(l => l.logro_id) || [];

      // Verificar cada logro
      for (const logro of logrosDisponibles) {
        if (logrosObtenidosIds.includes(logro.id)) continue;

        let cumpleCondicion = false;

        switch (logro.condicion_tipo) {
          case 'contribuciones_cantidad':
            cumpleCondicion = contribucionesAprobadas >= logro.condicion_valor;
            break;
          case 'primera_contribucion':
            cumpleCondicion = contribucionesAprobadas >= 1;
            break;
          case 'palabras_guardadas':
            // Verificar palabras guardadas
            const { data: palabrasGuardadas } = await supabase
              .from('palabras_guardadas')
              .select('id')
              .eq('usuario_id', userId);
            cumpleCondicion = (palabrasGuardadas?.length || 0) >= logro.condicion_valor;
            break;
        }

        if (cumpleCondicion) {
          // Otorgar logro
          await supabase
            .from('logros_usuario')
            .insert([{
              usuario_id: userId,
              logro_id: logro.id,
              fecha_obtenido: new Date().toISOString()
            }]);

          // Otorgar puntos del logro si los tiene
          if (logro.puntos_otorgados > 0) {
            await this.otorgarPuntosConocimiento(
              userId, 
              logro.puntos_otorgados, 
              'logro_obtenido', 
              `Logro obtenido: ${logro.nombre}`
            );
          }
        }
      }

    } catch (error) {
      console.error('Error verificando logros de conocimiento:', error);
      throw error;
    }
  }

  /**
   * Verificar logros de comunidad
   * @param {string} userId - ID del usuario
   */
  async verificarLogrosComunidad(userId) {
    try {
      // Obtener experiencia social actual
      const { data: recompensas, error: recompensasError } = await supabase
        .from('recompensas_usuario')
        .select('experiencia_social, likes_recibidos')
        .eq('usuario_id', userId)
        .single();

      if (recompensasError) throw recompensasError;

      const experienciaSocial = recompensas?.experiencia_social || 0;
      const likesRecibidos = recompensas?.likes_recibidos || 0;

      // Obtener logros de comunidad disponibles
      const { data: logrosDisponibles, error: logrosError } = await supabase
        .from('logros')
        .select('*')
        .eq('categoria', 'comunidad');

      if (logrosError) throw logrosError;

      // Obtener logros ya obtenidos
      const { data: logrosObtenidos, error: obtenidosError } = await supabase
        .from('logros_usuario')
        .select('logro_id')
        .eq('usuario_id', userId);

      if (obtenidosError) throw obtenidosError;

      const logrosObtenidosIds = logrosObtenidos?.map(l => l.logro_id) || [];

      // Verificar cada logro
      for (const logro of logrosDisponibles) {
        if (logrosObtenidosIds.includes(logro.id)) continue;

        let cumpleCondicion = false;

        switch (logro.condicion_tipo) {
          case 'likes_recibidos':
            cumpleCondicion = likesRecibidos >= logro.condicion_valor;
            break;
          case 'feedback_cantidad':
            // Verificar cantidad de feedbacks
            const { data: feedbacks } = await supabase
              .from('retroalimentacion')
              .select('id')
              .eq('usuario_id', userId);
            cumpleCondicion = (feedbacks?.length || 0) >= logro.condicion_valor;
            break;
        }

        if (cumpleCondicion) {
          // Otorgar logro
          await supabase
            .from('logros_usuario')
            .insert([{
              usuario_id: userId,
              logro_id: logro.id,
              fecha_obtenido: new Date().toISOString()
            }]);

          // Otorgar puntos del logro si los tiene
          if (logro.puntos_otorgados > 0) {
            await this.otorgarPuntosComunidad(
              userId, 
              logro.puntos_otorgados, 
              'logro_obtenido', 
              `Logro obtenido: ${logro.nombre}`
            );
          }
        }
      }

    } catch (error) {
      console.error('Error verificando logros de comunidad:', error);
      throw error;
    }
  }

  /**
   * Calcular nivel de conocimiento
   * @param {number} puntos - Puntos de conocimiento
   * @returns {string} Nivel
   */
  calcularNivelConocimiento(puntos) {
    if (puntos >= 1000) return 'experto';
    if (puntos >= 600) return 'maestro';
    if (puntos >= 300) return 'conocedor';
    if (puntos >= 100) return 'estudiante';
    return 'principiante';
  }

  /**
   * Calcular nivel de comunidad
   * @param {number} puntos - Puntos de experiencia social
   * @returns {string} Nivel
   */
  calcularNivelComunidad(puntos) {
    if (puntos >= 500) return 'embajador';
    if (puntos >= 300) return 'lider';
    if (puntos >= 150) return 'influencer';
    if (puntos >= 50) return 'participante';
    return 'novato';
  }

  /**
   * Obtener estadísticas de puntos por sistema
   * @param {string} userId - ID del usuario
   * @returns {Object} Estadísticas separadas por sistema
   */
  async obtenerEstadisticasSeparadas(userId) {
    try {
      // Obtener datos de recompensas
      const { data: recompensas, error: recompensasError } = await supabase
        .from('recompensas_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .single();

      if (recompensasError && recompensasError.code !== 'PGRST116') {
        throw recompensasError;
      }

      // Obtener estadísticas de conocimiento
      const { data: contribuciones, error: contribucionesError } = await supabase
        .from('contribuciones_diccionario')
        .select('estado')
        .eq('usuario_id', userId);

      if (contribucionesError) throw contribucionesError;

      const { data: palabrasGuardadas, error: palabrasError } = await supabase
        .from('palabras_guardadas')
        .select('id')
        .eq('usuario_id', userId);

      if (palabrasError) throw palabrasError;

      // Obtener estadísticas de comunidad
      const { data: feedbacks, error: feedbacksError } = await supabase
        .from('retroalimentacion')
        .select('id, contador_likes')
        .eq('usuario_id', userId);

      if (feedbacksError) throw feedbacksError;

      const { data: likesDados, error: likesError } = await supabase
        .from('retroalimentacion_likes')
        .select('id')
        .eq('usuario_id', userId);

      if (likesError) throw likesError;

      const { data: respuestas, error: respuestasError } = await supabase
        .from('retroalimentacion_respuestas')
        .select('id')
        .eq('usuario_id', userId);

      if (respuestasError) throw respuestasError;

      return {
        conocimiento: {
          puntos: recompensas?.puntos_conocimiento || 0,
          nivel: this.calcularNivelConocimiento(recompensas?.puntos_conocimiento || 0),
          contribuciones_aprobadas: contribuciones?.filter(c => c.estado === 'aprobada').length || 0,
          total_contribuciones: contribuciones?.length || 0,
          palabras_guardadas: palabrasGuardadas?.length || 0
        },
        comunidad: {
          puntos: recompensas?.experiencia_social || 0,
          nivel: this.calcularNivelComunidad(recompensas?.experiencia_social || 0),
          total_feedbacks: feedbacks?.length || 0,
          likes_dados: likesDados?.length || 0,
          likes_recibidos: recompensas?.likes_recibidos || 0,
          respuestas_creadas: respuestas?.length || 0,
          ranking_semanal: recompensas?.ranking_semanal || 0,
          ranking_mensual: recompensas?.ranking_mensual || 0
        }
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas separadas:', error);
      throw error;
    }
  }
}

module.exports = new PointsService();
