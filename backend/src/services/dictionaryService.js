// services/dictionaryService.js
const { supabase } = require('../config/database');
const config = require('../config/environment');

class DictionaryService {
  constructor() {
    console.log('✅ Servicio de diccionario inicializado - Usando Supabase');
  }

  /**
   * Buscar palabras en el diccionario con algoritmo de scoring inteligente
   * @param {string} query - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Resultados ordenados por relevancia
   */
  async searchWords(query, limit = config.DEFAULT_LIMIT) {
    try {
      if (!query || query.trim().length === 0) {
        // Sin query, devolver primeras entradas
        const { data: words, error } = await supabase
          .from('diccionario')
          .select('*')
          .limit(limit);
        
        if (error) throw error;
        return words || [];
      }

      const lowerQuery = query.toLowerCase().trim();
      
      // Buscar en Supabase usando ilike para búsqueda insensible a mayúsculas
      const { data: words, error } = await supabase
        .from('diccionario')
        .select('*')
        .or(`word.ilike.%${lowerQuery}%,definition.ilike.%${lowerQuery}%`)
        .limit(100); // Obtener más para poder aplicar scoring
      
      if (error) {
        console.error('Error al buscar palabras:', error);
        throw new Error('Error al buscar en la base de datos');
      }

      // Aplicar algoritmo de scoring inteligente
      const scoredResults = this.applyIntelligentScoring(words || [], lowerQuery);
      
      // Limitar resultados finales
      return scoredResults.slice(0, limit);
      
    } catch (error) {
      console.error('Error en búsqueda de diccionario:', error);
      throw new Error('Error al buscar en el diccionario');
    }
  }

  /**
   * Algoritmo de scoring inteligente para ordenar resultados por relevancia
   * @param {Array} entries - Entradas del diccionario
   * @param {string} query - Término de búsqueda (ya en minúsculas)
   * @returns {Array} Entradas ordenadas por score
   */
  applyIntelligentScoring(entries, query) {
    const scoredResults = entries.map(entry => {
      let score = 0;
      const word = entry.word?.toLowerCase() || '';
      const definition = entry.definition?.toLowerCase() || '';
      const variants = entry.variants || [];

      // 🎯 ALGORITMO DE SCORING - 8 niveles de prioridad
      
      // 100 puntos: Coincidencia exacta con la palabra
      if (word === query) {
        score = 100;
      }
      // 95 puntos: La palabra comienza exactamente con la consulta
      else if (word.startsWith(query)) {
        score = 95;
      }
      // 90 puntos: Coincidencia exacta en definición (palabra completa)
      else if (this.isExactDefinitionMatch(definition, query)) {
        score = 90;
      }
      // 85 puntos: Variantes exactas
      else if (variants.some(v => v?.toLowerCase() === query)) {
        score = 85;
      }
      // 80 puntos: Variantes que empiezan con la consulta
      else if (variants.some(v => v?.toLowerCase().startsWith(query))) {
        score = 80;
      }
      // 70 puntos: La consulta está contenida en la palabra
      else if (word.includes(query)) {
        // Bonus si está al principio o es una alta proporción de la palabra
        const bonus = query.length / word.length > 0.5 ? 15 : 0;
        score = 70 + bonus;
      }
      // 60 puntos: Coincidencia en variantes (contiene)
      else if (variants.some(v => v?.toLowerCase().includes(query))) {
        score = 60;
      }
      // 30 puntos: La consulta está en la definición
      else if (definition.includes(query)) {
        // Bonus si aparece al principio de la definición
        const bonus = definition.startsWith(query) ? 20 : 0;
        score = 30 + bonus;
      }

      // Bonus adicional por longitud similar (evita matches muy largos)
      if (score > 0 && Math.abs(word.length - query.length) <= 2) {
        score += 5;
      }

      return { ...entry, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => {
      // Primero por score, luego por longitud de palabra (preferir más cortas)
      if (b.score === a.score) {
        return (a.word?.length || 0) - (b.word?.length || 0);
      }
      return b.score - a.score;
    });

    return scoredResults;
  }

  /**
   * Verificar si hay coincidencia exacta en definición
   * @param {string} definition - Definición a verificar
   * @param {string} query - Término de búsqueda
   * @returns {boolean}
   */
  isExactDefinitionMatch(definition, query) {
    return (
      definition.includes(` ${query} `) ||
      definition.startsWith(query + ' ') ||
      definition.endsWith(' ' + query) ||
      definition === query
    );
  }

  /**
   * Obtener palabras guardadas por un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Lista de palabras guardadas
   */
  async getSavedWords(userId) {
    try {
      const { data, error } = await supabase
        .from('palabras_guardadas')
        .select(`
          diccionario_id,
          fecha_creacion,
          diccionario (
            id,
            word,
            definition,
            info_gramatical
          )
        `)
        .eq('usuario_id', userId)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener palabras guardadas:', error);
      throw new Error('Error al obtener palabras guardadas');
    }
  }

  /**
   * Guardar una palabra para un usuario
   * @param {string} userId - ID del usuario
   * @param {string} wordId - ID de la palabra
   * @returns {Promise<Object>} Resultado de la operación
   */
  async saveWord(userId, wordId) {
    try {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('palabras_guardadas')
        .select('id')
        .eq('usuario_id', userId)
        .eq('diccionario_id', wordId)
        .maybeSingle();

      if (existing) {
        throw new Error('La palabra ya está guardada');
      }

      const { data, error } = await supabase
        .from('palabras_guardadas')
        .insert([{
          usuario_id: userId,
          diccionario_id: wordId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al guardar palabra:', error);
      throw error;
    }
  }

  /**
   * Eliminar una palabra guardada
   * @param {string} userId - ID del usuario
   * @param {string} wordId - ID de la palabra
   * @returns {Promise<boolean>} Éxito de la operación
   */
  async unsaveWord(userId, wordId) {
    try {
      const { error } = await supabase
        .from('palabras_guardadas')
        .delete()
        .eq('usuario_id', userId)
        .eq('diccionario_id', wordId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar palabra guardada:', error);
      throw new Error('Error al eliminar palabra guardada');
    }
  }
}

module.exports = new DictionaryService();
