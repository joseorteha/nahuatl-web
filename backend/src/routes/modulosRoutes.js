const express = require('express');
const router = express.Router();
const modulosController = require('../controllers/modulosController');
const modulosLeccionesController = require('../controllers/modulosLeccionesController');
const { authenticateToken } = require('../middleware/auth');
const { verificarProfesor } = require('../middleware/profesorMiddleware');

// ============================================
// RUTAS DE MÓDULOS
// ============================================

/**
 * @route   GET /api/modulos/:id
 * @desc    Obtener un módulo específico con sus temas
 * @access  Public
 */
router.get('/:id', modulosController.obtenerModulo);

/**
 * @route   PUT /api/modulos/:id
 * @desc    Actualizar un módulo
 * @access  Private (Profesor propietario)
 */
router.put('/:id', authenticateToken, verificarProfesor, modulosController.actualizarModulo);

/**
 * @route   DELETE /api/modulos/:id
 * @desc    Eliminar un módulo
 * @access  Private (Profesor propietario)
 */
router.delete('/:id', authenticateToken, verificarProfesor, modulosController.eliminarModulo);

/**
 * @route   POST /api/modulos/:id/temas
 * @desc    Agregar una lección (tema) a un módulo
 * @access  Private (Profesor propietario)
 */
router.post('/:id/temas', authenticateToken, verificarProfesor, modulosController.agregarTema);

/**
 * @route   DELETE /api/modulos/:id/temas/:leccionId
 * @desc    Quitar una lección (tema) de un módulo
 * @access  Private (Profesor propietario)
 */
router.delete('/:id/temas/:leccionId', authenticateToken, verificarProfesor, modulosController.quitarTema);

/**
 * @route   PUT /api/modulos/:id/reordenar
 * @desc    Reordenar temas dentro de un módulo
 * @access  Private (Profesor propietario)
 */
router.put('/:id/reordenar', authenticateToken, verificarProfesor, modulosController.reordenarTemas);

// ============================================
// RUTAS DEL SISTEMA DE LECCIONES MEJORADO
// ============================================

/**
 * @route   GET /api/modulos/:moduloId/lecciones
 * @desc    Obtener todas las lecciones de un módulo
 * @access  Public (con progreso si está autenticado)
 */
router.get('/:moduloId/lecciones', modulosLeccionesController.obtenerLeccionesModulo);

/**
 * @route   POST /api/modulos/:moduloId/lecciones/vincular
 * @desc    Vincular una lección existente al módulo
 * @access  Private (Profesor propietario)
 */
router.post('/:moduloId/lecciones/vincular', authenticateToken, verificarProfesor, modulosLeccionesController.vincularLeccionExistente);

/**
 * @route   POST /api/modulos/:moduloId/lecciones/crear
 * @desc    Crear una lección exclusiva para el módulo
 * @access  Private (Profesor propietario)
 */
router.post('/:moduloId/lecciones/crear', authenticateToken, verificarProfesor, modulosLeccionesController.crearLeccionExclusiva);

/**
 * @route   DELETE /api/modulos/:moduloId/lecciones/:leccionId
 * @desc    Desvincular una lección del módulo
 * @access  Private (Profesor propietario)
 */
router.delete('/:moduloId/lecciones/:leccionId', authenticateToken, verificarProfesor, modulosLeccionesController.desvincularLeccion);

/**
 * @route   PUT /api/modulos/:moduloId/lecciones/:leccionId
 * @desc    Actualizar configuración de lección en módulo (orden, obligatoria, etc.)
 * @access  Private (Profesor propietario)
 */
router.put('/:moduloId/lecciones/:leccionId', authenticateToken, verificarProfesor, modulosLeccionesController.actualizarConfiguracionLeccion);

module.exports = router;
