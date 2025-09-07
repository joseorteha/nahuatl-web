// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register - Registrar usuario
router.post('/register', authController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', authController.login);

// GET /api/auth/profile/:userId - Obtener perfil
router.get('/profile/:userId', authController.getProfile);

// PUT /api/auth/profile/:userId - Actualizar perfil
router.put('/profile/:userId', authController.updateProfile);

// GET /api/auth/stats/:userId - Obtener estadísticas del usuario
router.get('/stats/:userId', authController.getUserStats);

module.exports = router;
