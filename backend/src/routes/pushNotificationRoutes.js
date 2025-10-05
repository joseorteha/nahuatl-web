// routes/pushNotificationRoutes.js
const express = require('express');
const router = express.Router();
const pushNotificationService = require('../services/pushNotificationService');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route POST /api/push/subscribe
 * @desc Suscribir usuario a push notifications
 * @access Private
 */
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { subscription } = req.body;
    const { userId } = req;

    console.log('📱 Suscripción recibida para usuario:', userId);

    // Validar datos de suscripción
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        error: 'Datos de suscripción inválidos'
      });
    }

    const result = await pushNotificationService.subscribeToPush(userId, subscription);

    res.status(200).json({
      success: true,
      message: 'Suscripción guardada exitosamente',
      data: result.data
    });

  } catch (error) {
    console.error('Error en POST /api/push/subscribe:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * @route DELETE /api/push/unsubscribe
 * @desc Desuscribir usuario de push notifications
 * @access Private
 */
router.delete('/unsubscribe', authenticateToken, async (req, res) => {
  try {
    const { userId } = req;

    console.log('📱 Desuscribiendo usuario:', userId);

    await pushNotificationService.unsubscribeFromPush(userId);

    res.status(200).json({
      success: true,
      message: 'Desuscripción exitosa'
    });

  } catch (error) {
    console.error('Error en DELETE /api/push/unsubscribe:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * @route POST /api/push/send
 * @desc Enviar push notification a un usuario (solo admin)
 * @access Private (Admin)
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { targetUserId, title, body, url, data } = req.body;
    const { userId, role } = req;

    // Verificar que es admin o es para el mismo usuario
    if (role !== 'admin' && userId !== targetUserId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para enviar notificaciones a otros usuarios'
      });
    }

    console.log('📤 Enviando push notification:', { targetUserId, title });

    const payload = {
      title,
      body,
      url,
      data
    };

    const result = await pushNotificationService.sendToUser(targetUserId, payload);

    res.status(200).json({
      success: true,
      message: 'Push notification enviada',
      result
    });

  } catch (error) {
    console.error('Error en POST /api/push/send:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * @route POST /api/push/send-by-type
 * @desc Enviar push notification por tipo
 * @access Private
 */
router.post('/send-by-type', authenticateToken, async (req, res) => {
  try {
    const { targetUserId, type, data } = req.body;
    const { userId, role } = req;

    // Verificar permisos
    if (role !== 'admin' && userId !== targetUserId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para enviar notificaciones'
      });
    }

    console.log('📤 Enviando push notification por tipo:', { targetUserId, type });

    const result = await pushNotificationService.sendNotificationByType(targetUserId, type, data);

    res.status(200).json({
      success: true,
      message: 'Push notification enviada',
      result
    });

  } catch (error) {
    console.error('Error en POST /api/push/send-by-type:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * @route GET /api/push/vapid-public-key
 * @desc Obtener clave pública VAPID
 * @access Public
 */
router.get('/vapid-public-key', (req, res) => {
  try {
    const config = require('../config/environment');
    const publicKey = config.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      return res.status(500).json({
        success: false,
        error: 'Clave pública VAPID no configurada'
      });
    }

    res.status(200).json({
      success: true,
      publicKey
    });

  } catch (error) {
    console.error('Error en GET /api/push/vapid-public-key:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @route POST /api/push/test
 * @desc Enviar push notification de prueba
 * @access Private
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { userId } = req;

    console.log('🧪 Enviando push notification de prueba a:', userId);

    const payload = {
      title: '🧪 Prueba de Notificación',
      body: '¡Las push notifications están funcionando correctamente!',
      url: '/dashboard',
      data: { test: true }
    };

    const result = await pushNotificationService.sendToUser(userId, payload);

    res.status(200).json({
      success: true,
      message: 'Push notification de prueba enviada',
      result
    });

  } catch (error) {
    console.error('Error en POST /api/push/test:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * @route GET /api/push/stats
 * @desc Obtener estadísticas de push notifications (solo admin)
 * @access Private (Admin)
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { role } = req;

    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Solo los administradores pueden ver las estadísticas'
      });
    }

    const stats = await pushNotificationService.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error en GET /api/push/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

module.exports = router;