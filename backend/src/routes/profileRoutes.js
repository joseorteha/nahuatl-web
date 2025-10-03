// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const ProfileController = require('../controllers/profileController');
const profileController = new ProfileController();

// ==============================================
// RUTAS DE PERFIL ÚNICO CON DOS SISTEMAS
// ==============================================

/**
 * @route GET /api/profile/conocimiento/:userId
 * @desc Obtener datos específicos del sistema de conocimiento
 * @access Private
 */
router.get('/conocimiento/:userId', authenticateToken, (req, res) => profileController.obtenerConocimiento(req, res));

/**
 * @route GET /api/profile/comunidad/:userId
 * @desc Obtener datos específicos del sistema social/comunidad
 * @access Private
 */
router.get('/comunidad/:userId', authenticateToken, (req, res) => profileController.obtenerComunidad(req, res));

/**
 * @route GET /api/profile/resumen/:userId
 * @desc Obtener resumen general del perfil (ambos sistemas)
 * @access Private
 */
router.get('/resumen/:userId', authenticateToken, (req, res) => profileController.obtenerResumen(req, res));

/**
 * @route GET /api/profile/:userId
 * @desc Obtener perfil completo de un usuario específico
 * @access Public (no requiere autenticación para ver perfiles de otros)
 */
router.get('/:userId', (req, res) => profileController.obtenerPerfilUsuario(req, res));

/**
 * @route GET /api/profile/test
 * @desc Ruta de prueba para verificar middleware
 * @access Private
 */
router.get('/test', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Middleware funcionando correctamente',
    user: req.user
  });
});

module.exports = router;
