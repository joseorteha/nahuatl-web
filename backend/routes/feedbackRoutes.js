// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// GET /api/feedback - Obtener todos los feedbacks
router.get('/', async (req, res) => {
  try {
    console.log('Obteniendo feedbacks...');
    
    const { data, error } = await supabase
      .from('retroalimentacion')
      .select(`
        *,
        perfiles (nombre_completo, username),
        retroalimentacion_respuestas (
          id,
          contenido,
          fecha_creacion,
          usuario_id,
          perfiles (nombre_completo, username)
        )
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Supabase error al obtener feedback:', error);
      return res.status(500).json({ error: 'Error al obtener las sugerencias.', details: error.message });
    }

    res.json(data);
  } catch (e) {
    console.error('Error inesperado en GET /api/feedback:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// POST /api/feedback - Crear nuevo feedback
router.post('/', async (req, res) => {
  const { user_id, title, content, category, priority } = req.body;

  if (!user_id || !title || !content) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  try {
    const { data, error } = await supabase
      .from('retroalimentacion')
      .insert({ 
        usuario_id: user_id, 
        titulo: title, 
        contenido: content, 
        categoria: category, 
        prioridad: priority 
      })
      .select();

    if (error) {
      console.error('Supabase error al crear feedback:', error);
      return res.status(500).json({ error: 'Error al crear la sugerencia.', details: error.message });
    }

    res.status(201).json(data);
  } catch (e) {
    console.error('Error inesperado en /api/feedback:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// POST /api/feedback/reply - Responder a feedback
router.post('/reply', async (req, res) => {
  const { user_id, feedback_id, content } = req.body;

  if (!user_id || !feedback_id || !content) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  try {
    const { data, error } = await supabase
      .from('retroalimentacion_respuestas')
      .insert({ 
        usuario_id: user_id, 
        retroalimentacion_id: feedback_id, 
        contenido: content 
      })
      .select();

    if (error) {
      console.error('Supabase error al crear respuesta:', error);
      return res.status(500).json({ error: 'Error al crear la respuesta.', details: error.message });
    }

    res.status(201).json(data);
  } catch (e) {
    console.error('Error inesperado en /api/feedback/reply:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// DELETE /api/feedback/:id - Eliminar feedback
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('retroalimentacion')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error al eliminar feedback:', error);
      return res.status(500).json({ error: 'Error al eliminar la sugerencia.', details: error.message });
    }

    res.json({ success: true });
  } catch (e) {
    console.error('Error inesperado en DELETE /api/feedback:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// DELETE /api/feedback/reply/:id - Eliminar respuesta
router.delete('/reply/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('retroalimentacion_respuestas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error al eliminar respuesta:', error);
      return res.status(500).json({ error: 'Error al eliminar la respuesta.', details: error.message });
    }

    res.json({ success: true });
  } catch (e) {
    console.error('Error inesperado en DELETE /api/feedback/reply:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

module.exports = router;