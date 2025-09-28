const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/temas-stats/:userId - Obtener estadísticas de temas de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, username')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Obtener temas creados por el usuario
    const { data: temasCreados, error: temasError } = await supabase
      .from('temas_conversacion')
      .select('id, titulo, contador_likes, compartido_contador, respuestas_count, fecha_creacion')
      .eq('creador_id', userId)
      .eq('es_tema_principal', true);

    if (temasError) {
      console.error('Error fetching temas creados:', temasError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener temas creados'
      });
    }

    // Obtener respuestas creadas por el usuario
    const { data: respuestasCreadas, error: respuestasError } = await supabase
      .from('temas_conversacion')
      .select('id, titulo, contador_likes, compartido_contador, fecha_creacion')
      .eq('creador_id', userId)
      .eq('es_respuesta', true);

    if (respuestasError) {
      console.error('Error fetching respuestas creadas:', respuestasError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener respuestas creadas'
      });
    }

    // Obtener likes dados por el usuario
    const { data: likesDados, error: likesDadosError } = await supabase
      .from('temas_likes')
      .select('id, fecha_creacion')
      .eq('usuario_id', userId);

    if (likesDadosError) {
      console.error('Error fetching likes dados:', likesDadosError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener likes dados'
      });
    }

    // Obtener shares dados por el usuario
    const { data: sharesDados, error: sharesDadosError } = await supabase
      .from('temas_shares')
      .select('id, fecha_creacion')
      .eq('usuario_id', userId);

    if (sharesDadosError) {
      console.error('Error fetching shares dados:', sharesDadosError);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener shares dados'
      });
    }

    // Calcular estadísticas
    const totalTemasCreados = temasCreados?.length || 0;
    const totalRespuestasCreadas = respuestasCreadas?.length || 0;
    const totalLikesDados = likesDados?.length || 0;
    const totalSharesDados = sharesDados?.length || 0;
    
    // Likes recibidos en temas
    const totalLikesRecibidos = temasCreados?.reduce((sum, tema) => sum + (tema.contador_likes || 0), 0) || 0;
    
    // Likes recibidos en respuestas
    const totalLikesRecibidosRespuestas = respuestasCreadas?.reduce((sum, respuesta) => sum + (respuesta.contador_likes || 0), 0) || 0;
    
    // Total likes recibidos
    const totalLikesRecibidosTotal = totalLikesRecibidos + totalLikesRecibidosRespuestas;
    
    // Shares recibidos en temas
    const totalSharesRecibidos = temasCreados?.reduce((sum, tema) => sum + (tema.compartido_contador || 0), 0) || 0;
    
    // Shares recibidos en respuestas
    const totalSharesRecibidosRespuestas = respuestasCreadas?.reduce((sum, respuesta) => sum + (respuesta.compartido_contador || 0), 0) || 0;
    
    // Total shares recibidos
    const totalSharesRecibidosTotal = totalSharesRecibidos + totalSharesRecibidosRespuestas;
    
    // Respuestas recibidas en temas
    const totalRespuestasRecibidas = temasCreados?.reduce((sum, tema) => sum + (tema.respuestas_count || 0), 0) || 0;

    // Obtener temas más populares (por likes)
    const temasPopulares = temasCreados
      ?.sort((a, b) => (b.contador_likes || 0) - (a.contador_likes || 0))
      .slice(0, 5) || [];

    // Obtener temas más compartidos
    const temasCompartidos = temasCreados
      ?.sort((a, b) => (b.compartido_contador || 0) - (a.compartido_contador || 0))
      .slice(0, 5) || [];

    // Obtener temas más comentados
    const temasComentados = temasCreados
      ?.sort((a, b) => (b.respuestas_count || 0) - (a.respuestas_count || 0))
      .slice(0, 5) || [];

    const stats = {
      // Estadísticas básicas
      totalTemasCreados,
      totalRespuestasCreadas,
      totalLikesDados,
      totalSharesDados,
      totalLikesRecibidos: totalLikesRecibidosTotal,
      totalSharesRecibidos: totalSharesRecibidosTotal,
      totalRespuestasRecibidas,
      
      // Desglose por tipo
      likesRecibidosTemas: totalLikesRecibidos,
      likesRecibidosRespuestas: totalLikesRecibidosRespuestas,
      sharesRecibidosTemas: totalSharesRecibidos,
      sharesRecibidosRespuestas: totalSharesRecibidosRespuestas,
      
      // Rankings
      temasPopulares,
      temasCompartidos,
      temasComentados,
      
      // Datos del usuario
      usuario: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        username: user.username
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in GET /api/temas-stats/:userId:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
