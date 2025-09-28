// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/feedback/usuario/:userId - Obtener feedbacks de un usuario específico
router.get('/usuario/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    console.log(`Obteniendo feedbacks del usuario: ${userId}`);
    
    const { data, error } = await supabase
      .from('retroalimentacion')
      .select(`
        *,
        perfiles (
          id,
          nombre_completo, 
          username, 
          url_avatar,
          verificado,
          recompensas_usuario(nivel, puntos_totales)
        ),
        retroalimentacion_respuestas (
          id,
          contenido,
          fecha_creacion,
          usuario_id,
          perfiles (nombre_completo, username, url_avatar, verificado)
        ),
        retroalimentacion_likes (
          usuario_id
        ),
        retroalimentacion_hashtags (
          hashtag_id,
          hashtags (nombre, color)
        )
      `)
      .eq('usuario_id', userId)
      .eq('archivado', false)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Supabase error al obtener feedbacks del usuario:', error);
      return res.status(500).json({ error: 'Error al obtener los feedbacks del usuario.', details: error.message });
    }

    // Procesar feedbacks con datos sociales
    const feedbacksWithSocialData = data.map(feedback => ({
      ...feedback,
      total_likes: feedback.retroalimentacion_likes ? feedback.retroalimentacion_likes.length : 0,
      total_respuestas: feedback.retroalimentacion_respuestas ? feedback.retroalimentacion_respuestas.length : 0,
      // Asegurar que los contadores se devuelvan correctamente
      compartido_contador: feedback.compartido_contador || 0,
      guardado_contador: feedback.guardado_contador || 0,
      hashtags: feedback.retroalimentacion_hashtags ? 
        feedback.retroalimentacion_hashtags.map(rh => ({
          id: rh.hashtag_id,
          nombre: rh.hashtags.nombre,
          color: rh.hashtags.color
        })) : [],
      // Mantener retroalimentacion_likes para verificar likes del usuario
      retroalimentacion_likes: feedback.retroalimentacion_likes || [],
      retroalimentacion_respuestas: feedback.retroalimentacion_respuestas || [],
      retroalimentacion_hashtags: undefined
    }));

    res.json(feedbacksWithSocialData);
  } catch (e) {
    console.error('Error inesperado en GET /api/feedback/usuario/:userId:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// GET /api/feedback - Obtener todos los feedbacks
router.get('/', async (req, res) => {
  try {
    console.log('Obteniendo feedbacks...');
    
    const { data, error } = await supabase
      .from('retroalimentacion')
      .select(`
        *,
        perfiles (
          id,
          nombre_completo, 
          username, 
          url_avatar,
          verificado,
          recompensas_usuario(nivel, puntos_totales)
        ),
        retroalimentacion_respuestas (
          id,
          contenido,
          fecha_creacion,
          usuario_id,
          perfiles (nombre_completo, username, url_avatar, verificado)
        ),
        retroalimentacion_likes (
          usuario_id
        ),
        retroalimentacion_hashtags (
          hashtag_id,
          hashtags (nombre, color)
        )
      `)
      .eq('archivado', false)
      .order('trending_score', { ascending: false })
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Supabase error al obtener feedback:', error);
      return res.status(500).json({ error: 'Error al obtener las sugerencias.', details: error.message });
    }

    // Procesar feedbacks con datos sociales
    const feedbacksWithSocialData = data.map(feedback => ({
      ...feedback,
      total_likes: feedback.retroalimentacion_likes ? feedback.retroalimentacion_likes.length : 0,
      total_respuestas: feedback.retroalimentacion_respuestas ? feedback.retroalimentacion_respuestas.length : 0,
      // Asegurar que los contadores se devuelvan correctamente
      compartido_contador: feedback.compartido_contador || 0,
      guardado_contador: feedback.guardado_contador || 0,
      hashtags: feedback.retroalimentacion_hashtags ? 
        feedback.retroalimentacion_hashtags.map(rh => ({
          id: rh.hashtag_id,
          nombre: rh.hashtags.nombre,
          color: rh.hashtags.color
        })) : [],
      // Mantener retroalimentacion_likes para verificar likes del usuario
      retroalimentacion_likes: feedback.retroalimentacion_likes || [],
      retroalimentacion_respuestas: feedback.retroalimentacion_respuestas || [],
      retroalimentacion_hashtags: undefined
    }));

    res.json(feedbacksWithSocialData);
  } catch (e) {
    console.error('Error inesperado en GET /api/feedback:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// POST /api/feedback - Crear nuevo feedback
router.post('/', authenticateToken, async (req, res) => {
  const { title, content, category, priority, hashtags, visibilidad } = req.body;
  const user_id = req.user.id;

  if (!title || !content) {
    return res.status(400).json({ error: 'Título y contenido son requeridos.' });
  }

  try {
    // Crear el feedback
    const { data: feedback, error } = await supabase
      .from('retroalimentacion')
      .insert({ 
        usuario_id: user_id, 
        titulo: title, 
        contenido: content, 
        categoria: category || 'general', 
        prioridad: priority || 'medium',
        visibilidad: visibilidad || 'publico',
        hashtags: hashtags || []
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error al crear feedback:', error);
      return res.status(500).json({ error: 'Error al crear la sugerencia.', details: error.message });
    }

    // Procesar hashtags si se proporcionaron
    if (hashtags && hashtags.length > 0) {
      for (const hashtagNombre of hashtags) {
        // Buscar o crear hashtag
        const { data: hashtag, error: hashtagError } = await supabase
          .from('hashtags')
          .select('id')
          .eq('nombre', hashtagNombre.toLowerCase())
          .single();

        let hashtagId;
        if (hashtagError && hashtagError.code === 'PGRST116') {
          // Crear nuevo hashtag
          const { data: nuevoHashtag, error: crearError } = await supabase
            .from('hashtags')
            .insert({
              nombre: hashtagNombre.toLowerCase(),
              creado_por_id: user_id
            })
            .select('id')
            .single();

          if (crearError) {
            console.error('Error creando hashtag:', crearError);
            continue;
          }
          hashtagId = nuevoHashtag.id;
        } else if (hashtag) {
          hashtagId = hashtag.id;
        }

        // Asociar hashtag con feedback
        if (hashtagId) {
          await supabase
            .from('retroalimentacion_hashtags')
            .insert({
              retroalimentacion_id: feedback.id,
              hashtag_id: hashtagId
            });
        }
      }
    }

    res.status(201).json(feedback);
  } catch (e) {
    console.error('Error inesperado en /api/feedback:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// POST /api/feedback/reply - Responder a feedback
router.post('/reply', authenticateToken, async (req, res) => {
  const { feedback_id, content } = req.body;
  const user_id = req.user.id;

  if (!feedback_id || !content) {
    return res.status(400).json({ error: 'ID del feedback y contenido son requeridos.' });
  }

  try {
    // Verificar que el feedback existe
    const { data: feedback, error: feedbackError } = await supabase
      .from('retroalimentacion')
      .select('id, usuario_id, titulo')
      .eq('id', feedback_id)
      .single();

    if (feedbackError || !feedback) {
      return res.status(404).json({ error: 'Feedback no encontrado.' });
    }

    // Crear la respuesta
    const { data, error } = await supabase
      .from('retroalimentacion_respuestas')
      .insert({ 
        usuario_id: user_id, 
        retroalimentacion_id: feedback_id, 
        contenido: content 
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error al crear respuesta:', error);
      return res.status(500).json({ error: 'Error al crear la respuesta.', details: error.message });
    }

    // Crear notificación para el autor del feedback (si no es el mismo usuario)
    if (feedback.usuario_id !== user_id) {
      await supabase
        .from('notificaciones')
        .insert({
          usuario_id: feedback.usuario_id,
          tipo_notificacion: 'respuesta_recibida',
          titulo: 'Nueva respuesta en tu feedback',
          mensaje: `${req.user.nombre_completo} respondió a tu feedback: "${feedback.titulo}"`,
          relacionado_id: feedback_id,
          relacionado_tipo: 'feedback'
        });
    }

    res.status(201).json(data);
  } catch (e) {
    console.error('Error inesperado en /api/feedback/reply:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// POST /api/feedback/like - Toggle like en feedback
router.post('/like', authenticateToken, async (req, res) => {
  const { feedback_id } = req.body;
  const user_id = req.user.id;

  if (!feedback_id) {
    return res.status(400).json({ error: 'ID del feedback es requerido.' });
  }

  try {
    // Verificar si el usuario ya le dio like
    const { data: existingLikes, error: checkError } = await supabase
      .from('retroalimentacion_likes')
      .select('id')
      .eq('usuario_id', user_id)
      .eq('retroalimentacion_id', feedback_id);

    if (checkError) {
      console.error('Error verificando like existente:', checkError);
      return res.status(500).json({ error: 'Error al verificar like.', details: checkError.message });
    }

    const existingLike = existingLikes && existingLikes.length > 0 ? existingLikes[0] : null;

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

      // Obtener el autor del feedback para otorgar puntos y notificación
      const { data: feedback, error: feedbackError } = await supabase
        .from('retroalimentacion')
        .select('usuario_id, titulo')
        .eq('id', feedback_id)
        .single();

      if (!feedbackError && feedback) {
        // Crear notificación para el autor del feedback (si no es el mismo usuario)
        if (feedback.usuario_id !== user_id) {
          await supabase
            .from('notificaciones')
            .insert({
              usuario_id: feedback.usuario_id,
              tipo_notificacion: 'like_recibido',
              titulo: 'Tu feedback recibió un like',
              mensaje: `${req.user.nombre_completo} le dio like a tu feedback: "${feedback.titulo}"`,
              relacionado_id: feedback_id,
              relacionado_tipo: 'feedback'
            });
        }

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
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido, categoria, hashtags, visibilidad } = req.body;
  const user_id = req.user.id;

  if (!titulo || !contenido) {
    return res.status(400).json({ error: 'Título y contenido son requeridos.' });
  }

  try {
    // Verificar que el usuario es el autor del feedback
    const { data: existingFeedback, error: checkError } = await supabase
      .from('retroalimentacion')
      .select('usuario_id')
      .eq('id', id)
      .single();

    if (checkError || !existingFeedback) {
      return res.status(404).json({ error: 'Feedback no encontrado.' });
    }

    if (existingFeedback.usuario_id !== user_id) {
      return res.status(403).json({ error: 'No tienes permisos para editar este feedback.' });
    }

    const { data, error } = await supabase
      .from('retroalimentacion')
      .update({ 
        titulo, 
        contenido, 
        categoria: categoria || 'general',
        visibilidad: visibilidad || 'publico',
        hashtags: hashtags || []
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
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Verificar que el usuario es el autor del feedback
    const { data: existingFeedback, error: checkError } = await supabase
      .from('retroalimentacion')
      .select('usuario_id')
      .eq('id', id)
      .single();

    if (checkError || !existingFeedback) {
      return res.status(404).json({ error: 'Feedback no encontrado.' });
    }

    if (existingFeedback.usuario_id !== user_id) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este feedback.' });
    }

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
router.delete('/reply/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Verificar que el usuario es el autor de la respuesta
    const { data: existingReply, error: checkError } = await supabase
      .from('retroalimentacion_respuestas')
      .select('usuario_id')
      .eq('id', id)
      .single();

    if (checkError || !existingReply) {
      return res.status(404).json({ error: 'Respuesta no encontrada.' });
    }

    if (existingReply.usuario_id !== user_id) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta respuesta.' });
    }

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