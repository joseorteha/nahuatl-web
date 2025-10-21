/**
 * Rutas para gestión de solicitudes de maestros
 * Fase 2: Sistema de Lecciones - Backend API
 */

const express = require('express');
const router = express.Router();

// Importar middlewares
const { authenticateToken } = require('../middleware/auth');
const { 
  verificarAdmin, 
  verificarPuedeSolicitarMaestro, 
  validarSolicitudMaestro 
} = require('../middleware/profesorMiddleware');

// Importar controladores
const {
  crearSolicitudMaestro,
  obtenerMisSolicitudes,
  obtenerTodasLasSolicitudes,
  procesarSolicitud,
  obtenerEstadisticasSolicitudes,
  obtenerEspecialidades
} = require('../controllers/solicitudesMaestrosController');

// ============================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// ============================================

/**
 * @route   GET /api/solicitudes-maestros/especialidades
 * @desc    Obtener lista de especialidades disponibles
 * @access  Public
 */
router.get('/especialidades', obtenerEspecialidades);

/**
 * @route   POST /api/solicitudes-maestros
 * @desc    Crear nueva solicitud de maestro
 * @access  Public (no requiere autenticación)
 * @body    { especialidad, experiencia, motivacion, propuesta_contenido, habilidades_especiales?, disponibilidad_horas?, email, nombre_completo }
 */
router.post('/', 
  validarSolicitudMaestro,
  crearSolicitudMaestro
);

/**
 * @route   GET /api/solicitudes-maestros/mis-solicitudes
 * @desc    Obtener solicitudes del usuario autenticado
 * @access  Private (usuarios autenticados)
 */
router.get('/mis-solicitudes', 
  authenticateToken, 
  obtenerMisSolicitudes
);

// ============================================
// RUTAS DE ADMINISTRACIÓN
// ============================================

/**
 * @route   GET /api/solicitudes-maestros/admin
 * @desc    Obtener todas las solicitudes (solo admins)
 * @access  Private (admin/moderador)
 * @query   { estado?, page?, limit? }
 */
router.get('/admin', 
  authenticateToken, 
  verificarAdmin, 
  obtenerTodasLasSolicitudes
);

/**
 * @route   PUT /api/solicitudes-maestros/:id/procesar
 * @desc    Procesar solicitud (aprobar/rechazar)
 * @access  Private (admin/moderador)
 * @body    { accion: 'aprobar' | 'rechazar', comentarios_admin? }
 */
router.put('/:id/procesar', 
  authenticateToken, 
  verificarAdmin,
  procesarSolicitud
);

/**
 * @route   GET /api/solicitudes-maestros/estadisticas
 * @desc    Obtener estadísticas de solicitudes
 * @access  Private (admin/moderador)
 */
router.get('/estadisticas', 
  authenticateToken, 
  verificarAdmin, 
  obtenerEstadisticasSolicitudes
);

// ============================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================

// Middleware para manejar rutas no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.originalUrl,
    metodo: req.method,
    rutas_disponibles: [
      'POST /',
      'GET /mis-solicitudes',
      'GET /admin',
      'PUT /:id/procesar',
      'GET /estadisticas'
    ]
  });
});

// Middleware de manejo de errores específicos
router.use((error, req, res, next) => {
  console.error('Error en rutas de solicitudes-maestros:', error);
  
  // Error de validación de Joi/Express-validator
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: error.details || error.message
    });
  }

  // Error de Supabase
  if (error.code) {
    return res.status(500).json({
      error: 'Error de base de datos',
      codigo: error.code
    });
  }

  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

module.exports = router;
