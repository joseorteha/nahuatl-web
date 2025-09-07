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

// GET /api/auth/saved-words/:userId - Obtener palabras guardadas del usuario
router.get('/saved-words/:userId', authController.getSavedWords);

module.exports = router;
