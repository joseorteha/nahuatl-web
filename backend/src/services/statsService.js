// services/statsService.js
const { supabase } = require('../config/database');

class StatsService {
  /**
   * Obtener estadísticas del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas del usuario
   */
  async getUserStats(userId) {
    try {
      // Obtener contribuciones
      const { data: contributions, error: contributionsError } = await supabase
        .from('contribuciones_diccionario')
        .select('id')
        .eq('usuario_id', userId);

      if (contributionsError) throw contributionsError;

      // Obtener temas de conversación enviados
      const { data: temas, error: temasError } = await supabase
        .from('temas_conversacion')
        .select('id')
        .eq('usuario_id', userId);

      if (temasError) throw temasError;

      // Obtener palabras guardadas (favorites) - asumiendo que existe esta tabla
      // Por ahora pondremos 0 hasta que se implemente
      const savedWords = 0;

      return {
        contributions: contributions ? contributions.length : 0,
        temas: temas ? temas.length : 0,
        savedWords: savedWords
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del usuario:', error);
      throw error;
    }
  }
}

module.exports = new StatsService();
