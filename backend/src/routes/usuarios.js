const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { NotificationService } = require('../services/notificationService');

const notificationService = new NotificationService();

// GET /api/usuarios/search - Buscar usuarios por nombre o username
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    // Buscar usuarios que coincidan con el término de búsqueda
    const { data: usuarios, error } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, username, email, url_avatar, verificado')
      .or(`nombre_completo.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(10);

    if (error) {
      console.error('Error searching usuarios:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor al buscar usuarios'
      });
    }

    res.status(200).json({
      success: true,
      data: usuarios || []
    });

  } catch (error) {
    console.error('Error in usuarios search:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/usuarios/:id/perfil - Obtener perfil completo de usuario
router.get('/:id/perfil', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener datos del usuario
    const { data: usuario, error: usuarioError } = await supabase
      .from('perfiles')
      .select(`
        id,
        nombre_completo,
        username,
        email,
        url_avatar,
        verificado,
        biografia,
        ubicacion,
        sitio_web,
        fecha_creacion,
        privacidad_perfil,
        mostrar_puntos,
        mostrar_nivel
      `)
      .eq('id', id)
      .single();

    if (usuarioError || !usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Obtener estadísticas de seguimiento
    const { data: seguidores, error: seguidoresError } = await supabase
      .from('seguimientos_usuarios')
      .select('seguidor_id')
      .eq('seguido_id', id);

    const { data: seguidos, error: seguidosError } = await supabase
      .from('seguimientos_usuarios')
      .select('seguido_id')
      .eq('seguidor_id', id);

    // Obtener estadísticas de recompensas si el usuario permite mostrarlas
    let recompensas = null;
    if (usuario.mostrar_puntos || usuario.mostrar_nivel) {
      const { data: recompensasData } = await supabase
        .from('recompensas_usuario')
        .select('*')
        .eq('usuario_id', id)
        .single();
      
      recompensas = recompensasData;
    }

    res.json({
      success: true,
      data: {
        ...usuario,
        estadisticas: {
          seguidores: seguidores?.length || 0,
          seguidos: seguidos?.length || 0,
          recompensas: recompensas
        }
      }
    });

  } catch (error) {
    console.error('Error in GET /api/usuarios/:id/perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/usuarios/:id/seguir - Seguir/dejar de seguir usuario
router.post('/:id/seguir', authenticateToken, async (req, res) => {
  try {
    const { id: seguidoId } = req.params;
    const seguidorId = req.user.id;

    // Verificar que no sea el mismo usuario
    if (seguidorId === seguidoId) {
      return res.status(400).json({
        success: false,
        error: 'No puedes seguirte a ti mismo'
      });
    }

    // Verificar que el usuario a seguir existe
    const { data: usuarioSeguido, error: usuarioError } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, username')
      .eq('id', seguidoId)
      .single();

    if (usuarioError || !usuarioSeguido) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si ya existe la relación de seguimiento
    const { data: seguimientoExistente, error: checkError } = await supabase
      .from('seguimientos_usuarios')
      .select('id')
      .eq('seguidor_id', seguidorId)
      .eq('seguido_id', seguidoId)
      .single();

    let action;
    let message;

    if (seguimientoExistente) {
      // Ya lo sigue, entonces dejar de seguir
      const { error: deleteError } = await supabase
        .from('seguimientos_usuarios')
        .delete()
        .eq('seguidor_id', seguidorId)
        .eq('seguido_id', seguidoId);

      if (deleteError) {
        console.error('Error al dejar de seguir:', deleteError);
        return res.status(500).json({
          success: false,
          error: 'Error al dejar de seguir al usuario'
        });
      }

      action = 'unfollowed';
      message = `Has dejado de seguir a ${usuarioSeguido.username}`;
    } else {
      // No lo sigue, entonces seguir
      const { error: insertError } = await supabase
        .from('seguimientos_usuarios')
        .insert({
          seguidor_id: seguidorId,
          seguido_id: seguidoId,
          fecha_seguimiento: new Date().toISOString(),
          notificaciones_activas: true
        });

      if (insertError) {
        console.error('Error al seguir usuario:', insertError);
        return res.status(500).json({
          success: false,
          error: 'Error al seguir al usuario'
        });
      }

      // Crear notificación para el usuario seguido
      try {
        await notificationService.notificarNuevoSeguidor(seguidorId, seguidoId);
      } catch (notifError) {
        console.error('Error enviando notificación de seguimiento:', notifError);
      }

      action = 'followed';
      message = `Ahora sigues a ${usuarioSeguido.username}`;
    }

    res.json({
      success: true,
      message,
      data: {
        action,
        usuario_seguido: usuarioSeguido
      }
    });

  } catch (error) {
    console.error('Error in POST /api/usuarios/:id/seguir:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/usuarios/:id/seguimiento - Obtener estado de seguimiento y listas
router.get('/:id/seguimiento', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Verificar si el usuario actual sigue a este usuario
    const { data: siguiendo } = await supabase
      .from('seguimientos_usuarios')
      .select('id')
      .eq('seguidor_id', currentUserId)
      .eq('seguido_id', id)
      .single();

    // Obtener lista de seguidores
    const { data: seguidores } = await supabase
      .from('seguimientos_usuarios')
      .select(`
        seguidor_id,
        fecha_seguimiento,
        perfiles:seguidor_id (
          id,
          nombre_completo,
          username,
          url_avatar,
          verificado
        )
      `)
      .eq('seguido_id', id)
      .order('fecha_seguimiento', { ascending: false });

    // Obtener lista de seguidos
    const { data: seguidos } = await supabase
      .from('seguimientos_usuarios')
      .select(`
        seguido_id,
        fecha_seguimiento,
        perfiles:seguido_id (
          id,
          nombre_completo,
          username,
          url_avatar,
          verificado
        )
      `)
      .eq('seguidor_id', id)
      .order('fecha_seguimiento', { ascending: false });

    res.json({
      success: true,
      data: {
        esta_siguiendo: !!siguiendo,
        seguidores: seguidores?.map(s => ({
          ...s.perfiles,
          fecha_seguimiento: s.fecha_seguimiento
        })) || [],
        seguidos: seguidos?.map(s => ({
          ...s.perfiles,
          fecha_seguimiento: s.fecha_seguimiento
        })) || [],
        estadisticas: {
          total_seguidores: seguidores?.length || 0,
          total_seguidos: seguidos?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Error in GET /api/usuarios/:id/seguimiento:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
