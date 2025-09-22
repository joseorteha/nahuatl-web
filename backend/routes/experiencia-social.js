const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/experiencia-social/:userId - Obtener estadísticas de experiencia social
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 Obteniendo experiencia social para usuario:', userId);

    // 1. Obtener experiencia social del usuario
    const { data: recompensas, error: recompensasError } = await supabase
      .from('recompensas_usuario')
      .select('experiencia_social, ranking_semanal, ranking_mensual, ranking_anual')
      .eq('usuario_id', userId)
      .single();

    if (recompensasError) {
      console.error('❌ Error en recompensas:', recompensasError);
      throw recompensasError;
    }
    console.log('✅ Recompensas obtenidas:', recompensas);

    // 2. Obtener rankings sociales del usuario (simplificado)
    const { data: rankings, error: rankingsError } = await supabase
      .from('ranking_social')
      .select('periodo, posicion, experiencia_social, fecha_actualizacion')
      .eq('usuario_id', userId)
      .order('fecha_actualizacion', { ascending: false });

    if (rankingsError) {
      console.error('❌ Error en rankings:', rankingsError);
      throw rankingsError;
    }
    console.log('✅ Rankings obtenidos:', rankings?.length || 0);

    // 3. Obtener estadísticas de interacciones sociales (temas)
    const { data: likesDados, error: likesDadosError } = await supabase
      .from('temas_likes')
      .select('id')
      .eq('usuario_id', userId);

    if (likesDadosError) throw likesDadosError;

    const { data: sharesDados, error: sharesDadosError } = await supabase
      .from('temas_shares')
      .select('id')
      .eq('usuario_id', userId);

    if (sharesDadosError) throw sharesDadosError;

    // 4. Obtener likes recibidos en temas del usuario
    const { data: temasUsuario, error: temasUsuarioError } = await supabase
      .from('temas_conversacion')
      .select('id')
      .eq('creador_id', userId);

    if (temasUsuarioError) throw temasUsuarioError;

    const temaIds = temasUsuario?.map(t => t.id) || [];

    const { data: likesRecibidos, error: likesRecibidosError } = await supabase
      .from('temas_likes')
      .select('id')
      .in('tema_id', temaIds);

    if (likesRecibidosError) throw likesRecibidosError;

    // 5. Obtener shares recibidos en temas del usuario
    const { data: sharesRecibidos, error: sharesRecibidosError } = await supabase
      .from('temas_shares')
      .select('id')
      .in('tema_id', temaIds);

    if (sharesRecibidosError) throw sharesRecibidosError;

    // 6. Obtener respuestas creadas por el usuario
    const { data: respuestasCreadas, error: respuestasCreadasError } = await supabase
      .from('temas_conversacion')
      .select('id')
      .eq('creador_id', userId)
      .eq('es_respuesta', true);

    if (respuestasCreadasError) throw respuestasCreadasError;

    // 7. Obtener ranking general (top usuarios por experiencia social)
    const { data: rankingGeneral, error: rankingGeneralError } = await supabase
      .from('recompensas_usuario')
      .select('usuario_id, experiencia_social')
      .order('experiencia_social', { ascending: false })
      .limit(10);

    if (rankingGeneralError) throw rankingGeneralError;

    // Obtener información de perfiles por separado
    const rankingGeneralConPerfiles = await Promise.all(
      (rankingGeneral || []).map(async (usuario) => {
        const { data: perfil, error: perfilError } = await supabase
          .from('perfiles')
          .select('nombre_completo, username, url_avatar')
          .eq('id', usuario.usuario_id)
          .single();
        
        return {
          ...usuario,
          perfiles: perfilError ? { nombre_completo: 'Usuario', username: 'usuario' } : perfil
        };
      })
    );

    // 8. Calcular experiencia social total
    const experienciaSocialTotal = 
      (likesDados?.length || 0) * 2 +           // 2 puntos por like dado
      (sharesDados?.length || 0) * 3 +           // 3 puntos por share dado
      (likesRecibidos?.length || 0) * 1 +        // 1 punto por like recibido
      (sharesRecibidos?.length || 0) * 2 +       // 2 puntos por share recibido
      (respuestasCreadas?.length || 0) * 5;      // 5 puntos por respuesta creada

    res.status(200).json({
      success: true,
      data: {
        experienciaSocial: recompensas?.experiencia_social || 0,
        experienciaSocialCalculada: experienciaSocialTotal,
        rankings: {
          semanal: recompensas?.ranking_semanal || 0,
          mensual: recompensas?.ranking_mensual || 0,
          anual: recompensas?.ranking_anual || 0
        },
        estadisticas: {
          likesDados: likesDados?.length || 0,
          sharesDados: sharesDados?.length || 0,
          likesRecibidos: likesRecibidos?.length || 0,
          sharesRecibidos: sharesRecibidos?.length || 0,
          respuestasCreadas: respuestasCreadas?.length || 0
        },
        historialRankings: rankings || [],
        rankingGeneral: rankingGeneralConPerfiles || []
      }
    });

  } catch (error) {
    console.error('Error fetching experiencia social:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener experiencia social'
    });
  }
});

// POST /api/experiencia-social/update - Actualizar experiencia social del usuario
router.post('/update', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.userId;
    const { accion, puntos } = req.body;

    // Calcular puntos de experiencia social
    let puntosExperiencia = 0;
    switch (accion) {
      case 'like_dado':
        puntosExperiencia = 2;
        break;
      case 'share_dado':
        puntosExperiencia = 3;
        break;
      case 'like_recibido':
        puntosExperiencia = 1;
        break;
      case 'share_recibido':
        puntosExperiencia = 2;
        break;
      case 'respuesta_creada':
        puntosExperiencia = 5;
        break;
      default:
        puntosExperiencia = puntos || 0;
    }

    // Actualizar experiencia social en recompensas_usuario
    const { data: recompensasActuales, error: recompensasError } = await supabase
      .from('recompensas_usuario')
      .select('experiencia_social')
      .eq('usuario_id', userId)
      .single();

    if (recompensasError) throw recompensasError;

    const nuevaExperienciaSocial = (recompensasActuales?.experiencia_social || 0) + puntosExperiencia;

    const { error: updateError } = await supabase
      .from('recompensas_usuario')
      .update({ 
        experiencia_social: nuevaExperienciaSocial,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('usuario_id', userId);

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      data: {
        experienciaSocialAnterior: recompensasActuales?.experiencia_social || 0,
        experienciaSocialNueva: nuevaExperienciaSocial,
        puntosGanados: puntosExperiencia,
        accion
      }
    });

  } catch (error) {
    console.error('Error updating experiencia social:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al actualizar experiencia social'
    });
  }
});

// GET /api/experiencia-social/ranking/:periodo - Obtener ranking por período
router.get('/ranking/:periodo', async (req, res) => {
  try {
    const { periodo } = req.params;
    const { limit = 50 } = req.query;

    if (!['semanal', 'mensual', 'anual'].includes(periodo)) {
      return res.status(400).json({
        success: false,
        error: 'Período inválido. Debe ser: semanal, mensual o anual'
      });
    }

    // Obtener ranking del período específico
    const { data: ranking, error: rankingError } = await supabase
      .from('ranking_social')
      .select(`
        posicion,
        experiencia_social,
        likes_dados,
        likes_recibidos,
        comentarios_realizados,
        contenido_compartido,
        fecha_actualizacion,
        perfiles!ranking_social_usuario_fkey(nombre_completo, username, url_avatar, verificado)
      `)
      .eq('periodo', periodo)
      .order('posicion', { ascending: true })
      .limit(parseInt(limit));

    if (rankingError) throw rankingError;

    res.status(200).json({
      success: true,
      data: {
        periodo,
        ranking: ranking || [],
        total: ranking?.length || 0
      }
    });

  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener ranking'
    });
  }
});

module.exports = router;
