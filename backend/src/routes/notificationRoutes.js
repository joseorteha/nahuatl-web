// routes/notificationRoutes.js - Rutas para el sistema de notificaciones
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { NotificationService } = require('../services/notificationService');

const notificationService = new NotificationService();

/**
 * GET /api/notifications - Obtener notificaciones del usuario
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.userId;
    const limite = parseInt(req.query.limite) || 20;
    const offset = parseInt(req.query.offset) || 0;

    console.log('📋 Obteniendo notificaciones para usuario:', usuarioId);

    const notificaciones = await notificationService.obtenerNotificaciones(usuarioId, limite, offset);
    const noLeidas = await notificationService.contarNoLeidas(usuarioId);

    res.json({
      success: true,
      data: {
        notificaciones,
        total_no_leidas: noLeidas,
        limite,
        offset
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
});

/**
 * GET /api/notifications/count - Contar notificaciones no leídas
 */
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.userId;
    const noLeidas = await notificationService.contarNoLeidas(usuarioId);

    res.json({
      success: true,
      data: {
        no_leidas: noLeidas
      }
    });

  } catch (error) {
    console.error('❌ Error contando notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al contar notificaciones',
      error: error.message
    });
  }
});

/**
 * PUT /api/notifications/:id/read - Marcar notificación como leída
 */
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { id } = req.params;

    console.log('✅ Marcando notificación como leída:', id);

    const notificacion = await notificationService.marcarComoLeida(id, usuarioId);

    res.json({
      success: true,
      data: notificacion,
      message: 'Notificación marcada como leída'
    });

  } catch (error) {
    console.error('❌ Error marcando notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación como leída',
      error: error.message
    });
  }
});

/**
 * PUT /api/notifications/read-all - Marcar todas las notificaciones como leídas
 */
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.userId;

    console.log('✅ Marcando todas las notificaciones como leídas para usuario:', usuarioId);

    await notificationService.marcarTodasComoLeidas(usuarioId);

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });

  } catch (error) {
    console.error('❌ Error marcando todas las notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar todas las notificaciones como leídas',
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/test - Crear notificación de prueba (solo desarrollo)
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint de prueba no disponible en producción'
      });
    }

    const usuarioId = req.userId;
    const { tipo = 'like_recibido', titulo = '🧪 Notificación de prueba', mensaje = 'Esta es una notificación de prueba' } = req.body;

    console.log('🧪 Creando notificación de prueba para usuario:', usuarioId);

    const notificacion = await notificationService.crearNotificacion({
      usuario_id: usuarioId,
      tipo: tipo,
      titulo: titulo,
      mensaje: mensaje,
      relacionado_id: null,
      relacionado_tipo: 'test'
    });

    res.json({
      success: true,
      data: notificacion,
      message: 'Notificación de prueba creada'
    });

  } catch (error) {
    console.error('❌ Error creando notificación de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear notificación de prueba',
      error: error.message
    });
  }
});

module.exports = router;