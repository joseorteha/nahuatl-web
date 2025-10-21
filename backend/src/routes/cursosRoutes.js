const express = require('express');
const router = express.Router();
const cursosController = require('../controllers/cursosController');
const modulosController = require('../controllers/modulosController');
const { authenticateToken } = require('../middleware/auth');
const { verificarProfesor } = require('../middleware/profesorMiddleware');

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * @route   GET /api/cursos
 * @desc    Obtener todos los cursos públicos
 * @access  Public
 */
router.get('/', cursosController.obtenerCursos);

/**
 * @route   GET /api/cursos/:id
 * @desc    Obtener un curso completo con módulos y temas
 * @access  Public
 */
router.get('/:id', cursosController.obtenerCursoCompleto);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * @route   GET /api/cursos/mis-cursos
 * @desc    Obtener cursos del profesor autenticado
 * @access  Private (Profesor)
 */
router.get('/profesor/mis-cursos', authenticateToken, verificarProfesor, cursosController.obtenerMisCursos);

/**
 * @route   POST /api/cursos
 * @desc    Crear un nuevo curso
 * @access  Private (Profesor)
 */
router.post('/', authenticateToken, verificarProfesor, cursosController.crearCurso);

/**
 * @route   PUT /api/cursos/:id
 * @desc    Actualizar un curso
 * @access  Private (Profesor propietario o Admin)
 */
router.put('/:id', authenticateToken, verificarProfesor, cursosController.actualizarCurso);

/**
 * @route   DELETE /api/cursos/:id
 * @desc    Eliminar un curso
 * @access  Private (Profesor propietario o Admin)
 */
router.delete('/:id', authenticateToken, verificarProfesor, cursosController.eliminarCurso);

/**
 * @route   POST /api/cursos/:id/inscribir
 * @desc    Inscribir al usuario autenticado en un curso
 * @access  Private
 */
router.post('/:id/inscribir', authenticateToken, cursosController.inscribirEnCurso);

/**
 * @route   GET /api/cursos/:id/verificar-inscripcion
 * @desc    Verificar si el usuario autenticado está inscrito en un curso
 * @access  Private
 */
router.get('/:id/verificar-inscripcion', authenticateToken, cursosController.verificarInscripcion);

// ============================================
// RUTAS DE MÓDULOS
// ============================================

/**
 * @route   GET /api/cursos/:cursoId/modulos
 * @desc    Obtener módulos de un curso
 * @access  Public
 */
router.get('/:cursoId/modulos', modulosController.obtenerModulos);

/**
 * @route   POST /api/cursos/:cursoId/modulos
 * @desc    Crear un nuevo módulo en un curso
 * @access  Private (Profesor propietario)
 */
router.post('/:cursoId/modulos', authenticateToken, verificarProfesor, modulosController.crearModulo);

module.exports = router;
