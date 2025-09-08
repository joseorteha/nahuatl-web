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
        ),
        retroalimentacion_likes (
          usuario_id
        )
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Supabase error al obtener feedback:', error);
      return res.status(500).json({ error: 'Error al obtener las sugerencias.', details: error.message });
    }

    // Calcular total_likes para cada feedback
    const feedbacksWithLikes = data.map(feedback => ({
      ...feedback,
      total_likes: feedback.retroalimentacion_likes ? feedback.retroalimentacion_likes.length : 0
    }));

    res.json(feedbacksWithLikes);
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

// POST /api/feedback/like - Toggle like en feedback
router.post('/like', async (req, res) => {
  const { user_id, feedback_id } = req.body;

  if (!user_id || !feedback_id) {
    return res.status(400).json({ error: 'Faltan campos requeridos: user_id, feedback_id.' });
  }

  try {
    // Verificar si el usuario ya le dio like
    const { data: existingLike, error: checkError } = await supabase
      .from('retroalimentacion_likes')
      .select('id')
      .eq('usuario_id', user_id)
      .eq('retroalimentacion_id', feedback_id)
      .maybeSingle();

    if (checkError) {
      console.error('Error verificando like existente:', checkError);
      return res.status(500).json({ error: 'Error al verificar like.', details: checkError.message });
    }

    if (existingLike) {
      // Quitar like
      const { error: deleteError } = await supabase
        .from('retroalimentacion_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Error eliminando like:', deleteError);
        return res.status(500).json({ error: 'Error al quitar like.', details: deleteError.message });
      }

      res.json({ success: true, action: 'unliked' });
    } else {
      // Agregar like
      const { error: insertError } = await supabase
        .from('retroalimentacion_likes')
        .insert({ 
          usuario_id: user_id, 
          retroalimentacion_id: feedback_id 
        });

      if (insertError) {
        console.error('Error agregando like:', insertError);
        return res.status(500).json({ error: 'Error al agregar like.', details: insertError.message });
      }

      // Obtener el autor del feedback para otorgar puntos
      const { data: feedback, error: feedbackError } = await supabase
        .from('retroalimentacion_usuarios')
        .select('usuario_id')
        .eq('id', feedback_id)
        .single();

      if (!feedbackError && feedback) {
        // Llamar al endpoint de recompensas para otorgar puntos por like recibido
        try {
          const recompensasResponse = await fetch('http://localhost:3001/api/recompensas/procesar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: feedback.usuario_id,
              accion: 'like_recibido',
              datos: { feedback_id }
            })
          });

          if (recompensasResponse.ok) {
            console.log('Puntos otorgados por like recibido al usuario:', feedback.usuario_id);
          }
        } catch (recompensasError) {
          console.error('Error al procesar recompensa por like:', recompensasError);
          // No fallar la operación principal si falla la recompensa
        }
      }

      res.json({ success: true, action: 'liked' });
    }
  } catch (e) {
    console.error('Error inesperado en /api/feedback/like:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// PUT /api/feedback/:id - Editar feedback
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido, categoria } = req.body;

  if (!titulo || !contenido) {
    return res.status(400).json({ error: 'Título y contenido son requeridos.' });
  }

  try {
    const { data, error } = await supabase
      .from('retroalimentacion')
      .update({ 
        titulo, 
        contenido, 
        categoria: categoria || 'general' 
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error al actualizar feedback:', error);
      return res.status(500).json({ error: 'Error al actualizar la sugerencia.', details: error.message });
    }

    res.json(data);
  } catch (e) {
    console.error('Error inesperado en PUT /api/feedback:', e);
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