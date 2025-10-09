const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { updateTemaCounters } = require('../utils/temasCounters');
const { NotificationService } = require('../services/notificationService');

const notificationService = new NotificationService();

// GET /api/temas - Obtener todos los temas
router.get('/', async (req, res) => {
  try {
    const { categoria, estado, sortBy = 'recent', page = 1, limit = 20 } = req.query;
    
    // Consulta simple sin filtros que no existen
  let query = supabase
    .from('temas_conversacion')
    .select('*')
    .eq('es_tema_principal', true); // Solo temas principales

    // Filtros
    if (categoria && categoria !== 'all') {
      query = query.eq('categoria', categoria);
    }
    
    if (estado && estado !== 'all') {
      query = query.eq('estado', estado);
    }

    // Ordenamiento
    switch (sortBy) {
      case 'popular':
        query = query.order('contador_likes', { ascending: false });
        break;
      case 'trending':
        query = query.order('trending_score', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('fecha_creacion', { ascending: false });
        break;
    }

    // Paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    console.log('🔍 Ejecutando consulta de temas...');
    const { data: temas, error } = await query;

    if (error) {
      console.error('❌ Error fetching temas:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error al obtener temas',
        details: error.message 
      });
    }

    console.log('✅ Temas obtenidos:', temas?.length || 0);

    // Obtener datos de los creadores
    const temasConCreadores = await Promise.all(
      temas?.map(async (tema) => {
        const { data: creador } = await supabase
          .from('perfiles')
          .select('id, nombre_completo, username, url_avatar, verificado')
          .eq('id', tema.creador_id)
          .single();
        
        return {
          ...tema,
          creador: creador || {
            id: tema.creador_id,
            nombre_completo: 'Usuario',
            username: 'usuario',
            url_avatar: undefined,
            verificado: false
          }
        };
      }) || []
    );

    res.json({
      success: true,
      data: temasConCreadores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: temas.length
      }
    });
  } catch (error) {
    console.error('Error in GET /api/temas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// GET /api/temas/:id - Obtener tema específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Primero obtener el tema
    const { data: tema, error: temaError } = await supabase
      .from('temas_conversacion')
      .select('*')
      .eq('id', id)
      .single();

    if (temaError) {
      console.error('Error fetching tema:', temaError);
      return res.status(404).json({ 
        success: false, 
        error: 'Tema no encontrado' 
      });
    }

    // Luego obtener los datos del creador
    const { data: creador, error: creadorError } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, username, url_avatar, verificado')
      .eq('id', tema.creador_id)
      .single();

    if (creadorError) {
      console.error('Error fetching creador:', creadorError);
      // Si no se puede obtener el creador, usar valores por defecto
      tema.creador = {
        id: tema.creador_id,
        nombre_completo: 'Usuario',
        username: 'usuario',
        url_avatar: null,
        verificado: false
      };
    } else {
      tema.creador = creador;
    }

    // Obtener respuestas del tema
    const { data: respuestas, error: respuestasError } = await supabase
      .from('temas_conversacion')
      .select('id, titulo, descripcion, contenido, fecha_creacion, creador_id')
      .eq('tema_padre_id', id)
      .eq('es_respuesta', true)
      .order('fecha_creacion', { ascending: true });

    if (respuestasError) {
      console.error('Error fetching respuestas:', respuestasError);
      // No fallar si no hay respuestas, solo usar array vacío
      tema.respuestas = [];
    } else {
      // Obtener datos de creadores para cada respuesta
      const respuestasConCreador = await Promise.all(
        respuestas.map(async (respuesta) => {
          const { data: respuestaCreador } = await supabase
            .from('perfiles')
            .select('id, nombre_completo, username, url_avatar, verificado')
            .eq('id', respuesta.creador_id)
            .single();

          return {
            ...respuesta,
            creador: respuestaCreador || {
              id: respuesta.creador_id,
              nombre_completo: 'Usuario',
              username: 'usuario',
              url_avatar: null,
              verificado: false
            }
          };
        })
      );
      tema.respuestas = respuestasConCreador;
    }

    res.json({
      success: true,
      data: tema
    });
  } catch (error) {
    console.error('Error in GET /api/temas/:id:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// POST /api/temas - Crear nuevo tema
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { titulo, descripcion, categoria } = req.body;
    
    // Usar el usuario autenticado
    const userId = req.userId;

    if (!titulo || !descripcion || !categoria) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: titulo, descripcion, categoria'
      });
    }

  const { data: tema, error } = await supabase
    .from('temas_conversacion')
    .insert({
      titulo,
      descripcion,
      categoria,
      creador_id: userId,
      estado: 'activo',
      es_tema_principal: true,
      es_respuesta: false,
      contador_likes: 0,
      compartido_contador: 0,
      trending_score: 0
    })
    .select('*')
    .single();

    if (error) {
      console.error('Error creating tema:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error al crear tema' 
      });
    }

    res.status(201).json({
      success: true,
      data: tema
    });
  } catch (error) {
    console.error('Error in POST /api/temas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// POST /api/temas/:id/respuestas - Responder a un tema
router.post('/:id/respuestas', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { contenido } = req.body;
    const userId = req.userId; // Usuario autenticado

    if (!contenido) {
      return res.status(400).json({
        success: false,
        error: 'El contenido de la respuesta es requerido'
      });
    }

    // Verificar que el tema existe
    const { data: tema, error: temaError } = await supabase
      .from('temas_conversacion')
      .select('id, estado, titulo, categoria, respuestas_count')
      .eq('id', id)
      .single();

    if (temaError || !tema) {
      return res.status(404).json({
        success: false,
        error: 'Tema no encontrado'
      });
    }

    if (tema.estado === 'cerrado') {
      return res.status(400).json({
        success: false,
        error: 'No se pueden agregar respuestas a temas cerrados'
      });
    }

    // Crear respuesta como tema hijo
    const { data: respuesta, error: insertError } = await supabase
      .from('temas_conversacion')
      .insert({
        titulo: `Respuesta a: ${tema.titulo}`,
        descripcion: `Respuesta a: ${tema.titulo}`,
        contenido,
        categoria: tema.categoria, // Usar la misma categoría del tema padre
        tema_padre_id: id,
        creador_id: userId,
        es_tema_principal: false,
        es_respuesta: true,
        estado: 'activo',
        orden_respuesta: 0
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating respuesta:', insertError);
      return res.status(500).json({ 
        success: false, 
        error: 'Error al crear respuesta' 
      });
    }

    // Obtener datos del creador de la respuesta
    const { data: creadorRespuesta, error: creadorError } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, username, url_avatar, verificado')
      .eq('id', userId)
      .single();

    // Mapear respuesta con datos del creador
    const respuestaConCreador = {
      ...respuesta,
      creador: creadorRespuesta || {
        id: userId,
        nombre_completo: 'Usuario',
        username: 'usuario',
        url_avatar: null,
        verificado: false
      },
      es_respuesta_admin: false
    };

    // Actualizar contadores automáticamente
    await updateTemaCounters(id);

    // Crear notificación para el autor del tema original
    await notificationService.notificarRespuestaTema(id, userId, tema.creador_id, contenido);

    res.status(201).json({
      success: true,
      data: respuestaConCreador
    });
  } catch (error) {
    console.error('Error in POST /api/temas/:id/respuestas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// POST /api/temas/:id/like - Like/Unlike tema
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    console.log('🔥 DEBUG LIKE - Endpoint alcanzado');
    console.log('🔥 DEBUG LIKE - req.userId:', req.userId);
    console.log('🔥 DEBUG LIKE - req.user:', req.user);
    console.log('🔥 DEBUG LIKE - params:', req.params);
    
    const { id } = req.params;
    const userId = req.userId; // Usuario autenticado

    if (!userId) {
      console.log('❌ DEBUG LIKE - No userId found');
      return res.status(401).json({ 
        success: false, 
        error: 'Usuario no autenticado' 
      });
    }

    console.log('✅ DEBUG LIKE - Usuario autenticado:', userId);

    // Obtener el tema primero para tener el contador actual
    const { data: tema, error: temaError } = await supabase
      .from('temas_conversacion')
      .select('contador_likes')
      .eq('id', id)
      .single();

    if (temaError) {
      console.error('Error fetching tema:', temaError);
      return res.status(404).json({ 
        success: false, 
        error: 'Tema no encontrado' 
      });
    }

    // Verificar si ya existe el like
    const { data: existingLike, error: checkError } = await supabase
      .from('temas_likes')
      .select('id')
      .eq('tema_id', id)
      .eq('usuario_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking like:', checkError);
      return res.status(500).json({ 
        success: false, 
        error: 'Error al verificar like' 
      });
    }

    if (existingLike) {
      // Quitar like
      const { error: deleteError } = await supabase
        .from('temas_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        return res.status(500).json({ 
          success: false, 
          error: 'Error al quitar like' 
        });
      }

      // Actualizar contadores automáticamente
      await updateTemaCounters(id);

      res.json({
        success: true,
        data: { action: 'unliked' }
      });
    } else {
      // Agregar like
      const { error: insertError } = await supabase
        .from('temas_likes')
        .insert({
          tema_id: id,
          usuario_id: userId
        });

      if (insertError) {
        console.error('Error adding like:', insertError);
        return res.status(500).json({ 
          success: false, 
          error: 'Error al agregar like' 
        });
      }

      // Actualizar contadores automáticamente
      await updateTemaCounters(id);

      // Obtener autor del tema para notificación
      const { data: temaCompleto, error: temaCompletoError } = await supabase
        .from('temas_conversacion')
        .select('creador_id')
        .eq('id', id)
        .single();

      if (!temaCompletoError && temaCompleto) {
        // Crear notificación para el autor del tema
        await notificationService.notificarLikeTema(id, userId, temaCompleto.creador_id);
      }

      res.json({
        success: true,
        data: { action: 'liked' }
      });
    }
  } catch (error) {
    console.error('Error in POST /api/temas/:id/like:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

// POST /api/temas/:id/share - Compartir tema
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { plataforma = 'interno' } = req.body;
    const userId = req.userId; // Usuario autenticado

    // Verificar que el tema existe y obtener contador
    const { data: tema, error: temaError } = await supabase
      .from('temas_conversacion')
      .select('id, compartido_contador')
      .eq('id', id)
      .single();

    if (temaError) {
      console.error('Error fetching tema:', temaError);
      return res.status(404).json({ 
        success: false, 
        error: 'Tema no encontrado' 
      });
    }

    // Registrar el share
    const { error: insertError } = await supabase
      .from('temas_shares')
      .insert({
        tema_id: id,
        usuario_id: userId,
        plataforma: plataforma
      });

    if (insertError) {
      console.error('Error adding share:', insertError);
      return res.status(500).json({ 
        success: false, 
        error: 'Error al registrar share' 
      });
    }

    // Actualizar contadores automáticamente
    await updateTemaCounters(id);

    // Obtener autor del tema para notificación
    const { data: temaCompleto, error: temaCompletoError } = await supabase
      .from('temas_conversacion')
      .select('creador_id')
      .eq('id', id)
      .single();

    if (!temaCompletoError && temaCompleto) {
      // Crear notificación para el autor del tema
      await notificationService.notificarCompartirTema(id, userId, temaCompleto.creador_id);
    }

    res.json({
      success: true,
      data: { message: 'Tema compartido exitosamente' }
    });
  } catch (error) {
    console.error('Error in POST /api/temas/:id/share:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
});

module.exports = router;
