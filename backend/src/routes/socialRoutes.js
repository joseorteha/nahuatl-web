const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  // Seguimientos
  seguirUsuario,
  dejarDeSeguir,
  obtenerSeguidores,
  obtenerSiguiendo,
  
  // Hashtags
  crearHashtag,
  obtenerHashtagsPopulares,
  
  // Compartir y guardar
  compartirFeedback,
  guardarFeedback,
  obtenerFeedbackGuardado,
  obtenerFeedbacksCompartidos,
  obtenerFeedbacksGuardados,
  obtenerLikesDados,
  
  // Notificaciones
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas
} = require('../controllers/socialController');

// ==============================================
// RUTAS DE SEGUIMIENTOS
// ==============================================

/**
 * @route POST /api/social/seguir/:usuarioId
 * @desc Seguir a un usuario
 * @access Private
 */
router.post('/seguir/:usuarioId', authenticateToken, seguirUsuario);

/**
 * @route DELETE /api/social/seguir/:usuarioId
 * @desc Dejar de seguir a un usuario
 * @access Private
 */
router.delete('/seguir/:usuarioId', authenticateToken, dejarDeSeguir);

/**
 * @route GET /api/social/seguidores/:usuarioId
 * @desc Obtener seguidores de un usuario
 * @access Public
 */
router.get('/seguidores/:usuarioId', obtenerSeguidores);

/**
 * @route GET /api/social/siguiendo/:usuarioId
 * @desc Obtener usuarios que sigue un usuario
 * @access Public
 */
router.get('/siguiendo/:usuarioId', obtenerSiguiendo);

// ==============================================
// RUTAS DE HASHTAGS
// ==============================================

/**
 * @route POST /api/social/hashtags
 * @desc Crear o obtener hashtag
 * @access Private
 */
router.post('/hashtags', authenticateToken, crearHashtag);

/**
 * @route GET /api/social/hashtags/populares
 * @desc Obtener hashtags populares
 * @access Public
 */
router.get('/hashtags/populares', obtenerHashtagsPopulares);

// ==============================================
// RUTAS DE COMPARTIR Y GUARDAR FEEDBACK
// ==============================================

/**
 * @route POST /api/social/feedback/:feedbackId/compartir
 * @desc Compartir un feedback
 * @access Private
 */
router.post('/feedback/:feedbackId/compartir', authenticateToken, compartirFeedback);

/**
 * @route POST /api/social/feedback/:feedbackId/guardar
 * @desc Guardar un feedback
 * @access Private
 */
router.post('/feedback/:feedbackId/guardar', authenticateToken, guardarFeedback);

/**
 * @route GET /api/social/feedback/guardado
 * @desc Obtener feedback guardado por el usuario
 * @access Private
 */
router.get('/feedback/guardado', authenticateToken, obtenerFeedbackGuardado);

/**
 * @route GET /api/social/feedback/compartidos/:usuarioId
 * @desc Obtener feedbacks compartidos por un usuario
 * @access Public
 */
router.get('/feedback/compartidos/:usuarioId', obtenerFeedbacksCompartidos);

/**
 * @route GET /api/social/feedback/guardados/:usuarioId
 * @desc Obtener feedbacks guardados por un usuario
 * @access Public
 */
router.get('/feedback/guardados/:usuarioId', obtenerFeedbacksGuardados);

/**
 * @route GET /api/social/feedback/likes/:usuarioId
 * @desc Obtener likes dados por un usuario
 * @access Public
 */
router.get('/feedback/likes/:usuarioId', obtenerLikesDados);

// ==============================================
// RUTAS DE NOTIFICACIONES
// ==============================================

/**
 * @route GET /api/social/notificaciones
 * @desc Obtener notificaciones del usuario
 * @access Private
 */
router.get('/notificaciones', authenticateToken, obtenerNotificaciones);

/**
 * @route PUT /api/social/notificaciones/:notificacionId/leer
 * @desc Marcar notificación como leída
 * @access Private
 */
router.put('/notificaciones/:notificacionId/leer', authenticateToken, marcarNotificacionLeida);

/**
 * @route PUT /api/social/notificaciones/leer-todas
 * @desc Marcar todas las notificaciones como leídas
 * @access Private
 */
router.put('/notificaciones/leer-todas', authenticateToken, marcarTodasLeidas);

module.exports = router;
