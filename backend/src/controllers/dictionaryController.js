// controllers/dictionaryController.js
const dictionaryService = require('../services/dictionaryService');

class DictionaryController {
  /**
   * Buscar palabras en el diccionario
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async searchWords(req, res) {
    try {
      const { query, limit } = req.query;
      
      const results = await dictionaryService.searchWords(
        query,
        limit ? parseInt(limit) : undefined
      );

      res.json(results);
    } catch (error) {
      console.error('Error en búsqueda de diccionario:', error);
      res.status(500).json({ 
        error: 'Error al buscar en el diccionario',
        message: error.message 
      });
    }
  }

  /**
   * Obtener palabras guardadas de un usuario
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async getSavedWords(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
      }

      const savedWords = await dictionaryService.getSavedWords(userId);
      res.json({ 
        success: true,
        savedWords: savedWords 
      });
    } catch (error) {
      console.error('Error al obtener palabras guardadas:', error);
      res.status(500).json({ 
        error: 'Error al obtener palabras guardadas',
        message: error.message 
      });
    }
  }

  /**
   * Guardar una palabra para un usuario
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async saveWord(req, res) {
    try {
      const { usuario_id, diccionario_id } = req.body;

      if (!usuario_id || !diccionario_id) {
        return res.status(400).json({ 
          error: 'usuario_id y diccionario_id son requeridos' 
        });
      }

      const result = await dictionaryService.saveWord(usuario_id, diccionario_id);
      res.status(201).json({ 
        message: 'Palabra guardada exitosamente',
        data: result 
      });
    } catch (error) {
      console.error('Error al guardar palabra:', error);
      
      if (error.message === 'La palabra ya está guardada') {
        return res.status(409).json({ error: error.message });
      }
      
      res.status(500).json({ 
        error: 'Error al guardar la palabra',
        message: error.message 
      });
    }
  }

  /**
   * Eliminar palabra guardada de un usuario
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async unsaveWord(req, res) {
    try {
      const { usuario_id, diccionario_id } = req.body;

      if (!usuario_id || !diccionario_id) {
        return res.status(400).json({ 
          error: 'usuario_id y diccionario_id son requeridos' 
        });
      }

      await dictionaryService.unsaveWord(usuario_id, diccionario_id);
      res.json({ message: 'Palabra eliminada de guardados exitosamente' });
    } catch (error) {
      console.error('Error al eliminar palabra guardada:', error);
      res.status(500).json({ 
        error: 'Error al eliminar palabra guardada',
        message: error.message 
      });
    }
  }
}

module.exports = new DictionaryController();
