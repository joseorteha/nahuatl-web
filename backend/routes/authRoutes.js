// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin, validateUUID } = require('../middleware/validation');
const { passport } = require('../config/googleOAuth');

// Rutas públicas
// POST /api/auth/register - Registrar usuario
router.post('/register', validateRegistration, authController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', validateLogin, authController.login);

// POST /api/auth/refresh - Renovar token
router.post('/refresh', authController.refreshToken);

// GET /api/auth/profile/:userId - Obtener perfil público (sin autenticación)
router.get('/profile/:userId', validateUUID('userId'), authController.getPublicProfile);

// Rutas protegidas (requieren autenticación)
// GET /api/auth/profile/:userId - Obtener perfil
router.get('/profile/:userId', validateUUID('userId'), authenticateToken, authController.getProfile);

// PUT /api/auth/profile/:userId - Actualizar perfil
router.put('/profile/:userId', validateUUID('userId'), authenticateToken, authController.updateProfile);

// GET /api/auth/stats/:userId - Obtener estadísticas del usuario
router.get('/stats/:userId', validateUUID('userId'), authenticateToken, authController.getUserStats);

// GET /api/auth/saved-words/:userId - Obtener palabras guardadas del usuario
router.get('/saved-words/:userId', validateUUID('userId'), authenticateToken, authController.getSavedWords);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', authenticateToken, authController.logout);

// Rutas de Google OAuth
// GET /api/auth/google - Iniciar autenticación con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback - Callback de Google OAuth
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/api/auth/google/error' }),
  authController.oauthSuccess
);

// GET /api/auth/google/error - Manejar errores de Google OAuth
router.get('/google/error', authController.oauthError);

module.exports = router;
