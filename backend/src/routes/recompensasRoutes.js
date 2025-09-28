// routes/recompensasRoutes.js
const express = require('express');
const router = express.Router();
const recompensasController = require('../controllers/recompensasController');

// GET /api/recompensas/usuario/:userId - Obtener recompensas del usuario
router.get('/usuario/:userId', recompensasController.obtenerRecompensasUsuario);

// GET /api/recompensas/ranking - Obtener ranking de usuarios
router.get('/ranking', recompensasController.obtenerRanking);

// POST /api/recompensas/procesar - Procesar acción de recompensa (interno)
router.post('/procesar', recompensasController.procesarAccion);

// GET /api/recompensas/historial/:userId - Obtener historial de puntos
router.get('/historial/:userId', recompensasController.obtenerHistorialPuntos);

module.exports = router;
