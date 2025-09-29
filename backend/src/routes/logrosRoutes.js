// routes/logrosRoutes.js
const express = require('express');
const router = express.Router();
const logrosService = require('../services/logrosService');
const { authenticateToken } = require('../middleware/auth');
const { supabase } = require('../config/database');

/**
 * GET /api/logros/inicializar
 * Inicializa los logros predefinidos en la base de datos
 */
router.get('/inicializar', authenticateToken, async (req, res) => {
  try {
    await logrosService.crearLogrosPredefinidos();
    res.json({
      success: true,
      message: 'Logros predefinidos inicializados correctamente'
    });
  } catch (error) {
    console.error('Error inicializando logros:', error);
    res.status(500).json({
      success: false,
      message: 'Error inicializando logros',
      error: error.message
    });
  }
});

/**
 * GET /api/logros/usuario/:userId
 * Obtiene los logros de un usuario específico
 */
router.get('/usuario/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario solo pueda ver sus propios logros o ser admin
    if (req.user.id !== userId && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver estos logros'
      });
    }

    const { data: logrosUsuario, error } = await supabase
      .from('logros_usuario')
      .select(`
        id,
        fecha_obtenido,
        notificado,
        logros (
          id,
          nombre,
          descripcion,
          icono,
          categoria,
          puntos_otorgados
        )
      `)
      .eq('usuario_id', userId)
      .order('fecha_obtenido', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: logrosUsuario || []
    });
  } catch (error) {
    console.error('Error obteniendo logros del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo logros del usuario',
      error: error.message
    });
  }
});

/**
 * GET /api/logros/disponibles
 * Obtiene todos los logros disponibles en el sistema
 */
router.get('/disponibles', authenticateToken, async (req, res) => {
  try {
    const { data: logros, error } = await supabase
      .from('logros')
      .select('*')
      .order('categoria', { ascending: true })
      .order('condicion_valor', { ascending: true });

    if (error) throw error;

    // Agrupar por categoría
    const logrosPorCategoria = logros?.reduce((acc, logro) => {
      if (!acc[logro.categoria]) {
        acc[logro.categoria] = [];
      }
      acc[logro.categoria].push(logro);
      return acc;
    }, {}) || {};

    res.json({
      success: true,
      data: logrosPorCategoria
    });
  } catch (error) {
    console.error('Error obteniendo logros disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo logros disponibles',
      error: error.message
    });
  }
});

/**
 * POST /api/logros/verificar/:userId
 * Fuerza la verificación de logros para un usuario específico
 */
router.post('/verificar/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { tipoAccion, datosAccion } = req.body;
    
    // Verificar que el usuario solo pueda verificar sus propios logros o ser admin
    if (req.user.id !== userId && req.user.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para verificar estos logros'
      });
    }

    const logrosNuevos = await logrosService.verificarLogrosAutomaticos(
      userId, 
      tipoAccion || 'general', 
      datosAccion || {}
    );

    res.json({
      success: true,
      data: {
        logros_nuevos: logrosNuevos,
        total_nuevos: logrosNuevos.length
      }
    });
  } catch (error) {
    console.error('Error verificando logros:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando logros',
      error: error.message
    });
  }
});

module.exports = router;
