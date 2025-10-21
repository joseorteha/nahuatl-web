/**
 * Rutas para gestión de lecciones
 * Fase 2: Sistema de Lecciones - Backend API
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { supabase } = require('../config/database');

// Importar middlewares
const { authenticateToken } = require('../middleware/auth');
const { 
  verificarProfesor,
  validarLeccion,
  validarRecursosExternos,
  validarQuizPreguntas
} = require('../middleware/profesorMiddleware');

// Importar controladores
const {
  crearLeccion,
  obtenerLecciones,
  obtenerLeccionPorId,
  obtenerMisLecciones,
  actualizarLeccion,
  publicarLeccion,
  archivarLeccion
} = require('../controllers/leccionesController');

const {
  registrarProgresoConContexto
} = require('../controllers/modulosLeccionesController');

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * @route   GET /api/lecciones
 * @desc    Obtener lecciones públicas con filtros
 * @access  Public
 * @query   { categoria?, nivel?, profesor_id?, page?, limit?, search?, orden? }
 */
router.get('/', obtenerLecciones);

// Middleware opcional para autenticación (permite acceso público)
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = decoded;
      console.log('✅ Usuario autenticado opcionalmente:', decoded.userId);
    } catch (error) {
      console.log('⚠️ Token inválido, continuando sin autenticación:', error.message);
      req.user = null;
    }
  } else {
    console.log('ℹ️ Sin token de autenticación, acceso público');
    req.user = null;
  }

  next();
};

/**
 * @route   GET /api/lecciones/:id
 * @desc    Obtener lección específica por ID
 * @access  Public (lecciones publicadas) / Private (borradores del profesor)
 */
router.get('/:id', optionalAuthenticate, obtenerLeccionPorId);

// ============================================
// RUTAS DE PROFESORES
// ============================================

/**
 * @route   POST /api/lecciones
 * @desc    Crear nueva lección
 * @access  Private (solo profesores)
 * @body    { titulo, categoria, contenido_texto, descripcion?, nivel?, contenido_nahuatl?, objetivos_aprendizaje?, palabras_clave?, duracion_estimada?, orden_leccion?, recursos_externos?, quiz_preguntas? }
 */
router.post('/', 
  authenticateToken, 
  verificarProfesor,
  validarLeccion,
  validarRecursosExternos,
  validarQuizPreguntas,
  crearLeccion
);

/**
 * @route   GET /api/lecciones/profesor/estadisticas
 * @desc    Obtener estadísticas del profesor autenticado
 * @access  Private (solo profesores)
 */
router.get('/profesor/estadisticas', authenticateToken, verificarProfesor, async (req, res) => {
  try {
    const profesor_id = req.user.id;

    // Total de lecciones del profesor
    const { data: lecciones, error: errorLecciones } = await supabase
      .from('lecciones')
      .select('id, estado, fecha_publicacion')
      .eq('profesor_id', profesor_id);

    if (errorLecciones) {
      console.error('Error obteniendo lecciones:', errorLecciones);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }

    const total_lecciones = lecciones.length;
    const lecciones_publicadas = lecciones.filter(l => l.estado === 'publicada').length;

    // Obtener estudiantes únicos (usuarios que han progresado en las lecciones)
    const { data: progreso, error: errorProgreso } = await supabase
      .from('progreso_lecciones')
      .select('usuario_id')
      .in('leccion_id', lecciones.map(l => l.id));

    const estudiantes_totales = progreso ? new Set(progreso.map(p => p.usuario_id)).size : 0;

    // Obtener puntuación promedio
    const { data: calificaciones, error: errorCalif } = await supabase
      .from('calificaciones_lecciones')
      .select('calificacion')
      .in('leccion_id', lecciones.map(l => l.id));

    const puntuacion_promedio = calificaciones && calificaciones.length > 0
      ? calificaciones.reduce((sum, c) => sum + c.calificacion, 0) / calificaciones.length
      : 0;

    // Lecciones recientes (últimas 5)
    const { data: leccionesRecientes, error: errorRecientes } = await supabase
      .from('lecciones')
      .select('id, titulo, estado, fecha_creacion, fecha_publicacion')
      .eq('profesor_id', profesor_id)
      .order('fecha_creacion', { ascending: false })
      .limit(5);

    res.json({
      total_lecciones,
      lecciones_publicadas,
      estudiantes_totales,
      puntuacion_promedio: Math.round(puntuacion_promedio * 10) / 10,
      lecciones_recientes: leccionesRecientes || []
    });

  } catch (error) {
    console.error('Error en estadísticas profesor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   GET /api/lecciones/profesor/mis-lecciones
 * @desc    Obtener lecciones del profesor autenticado
 * @access  Private (solo profesores)
 * @query   { estado?, page?, limit? }
 */
router.get('/profesor/mis-lecciones', 
  authenticateToken, 
  verificarProfesor, 
  obtenerMisLecciones
);

/**
 * @route   GET /api/lecciones/mis-lecciones
 * @desc    Obtener lecciones del profesor autenticado (ruta alternativa)
 * @access  Private (solo profesores)
 * @query   { estado?, page?, limit? }
 */
router.get('/mis-lecciones', 
  authenticateToken, 
  verificarProfesor, 
  obtenerMisLecciones
);

/**
 * @route   PUT /api/lecciones/:id
 * @desc    Actualizar lección existente
 * @access  Private (solo profesor propietario o admin)
 * @body    { titulo?, descripcion?, categoria?, nivel?, contenido_texto?, contenido_nahuatl?, objetivos_aprendizaje?, palabras_clave?, duracion_estimada?, orden_leccion? }
 */
router.put('/:id', 
  authenticateToken, 
  validarLeccion,
  actualizarLeccion
);

/**
 * @route   PUT /api/lecciones/:id/publicar
 * @desc    Publicar lección (cambiar estado a publicada)
 * @access  Private (solo profesor propietario o admin)
 */
router.put('/:id/publicar', 
  authenticateToken, 
  publicarLeccion
);

/**
 * @route   PUT /api/lecciones/:id/archivar
 * @desc    Archivar lección
 * @access  Private (solo profesor propietario o admin)
 */
router.put('/:id/archivar', 
  authenticateToken, 
  archivarLeccion
);

/**
 * @route   DELETE /api/lecciones/:id
 * @desc    Eliminar lección permanentemente
 * @access  Private (solo profesor propietario o admin)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;
    const { supabase } = require('../config/database');

    // Verificar que la lección existe y pertenece al usuario
    const { data: leccion, error: errorLeccion } = await supabase
      .from('lecciones')
      .select('profesor_id, titulo')
      .eq('id', id)
      .single();

    if (errorLeccion || !leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    // Verificar permisos (solo el profesor propietario o admin)
    if (leccion.profesor_id !== usuario_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta lección' });
    }

    // Eliminar recursos externos asociados
    await supabase
      .from('recursos_externos')
      .delete()
      .eq('leccion_id', id);

    // Eliminar preguntas de quiz asociadas
    await supabase
      .from('quiz_preguntas')
      .delete()
      .eq('leccion_id', id);

    // Eliminar progreso de estudiantes
    await supabase
      .from('progreso_lecciones')
      .delete()
      .eq('leccion_id', id);

    // Eliminar la lección
    const { error: errorDelete } = await supabase
      .from('lecciones')
      .delete()
      .eq('id', id);

    if (errorDelete) {
      console.error('Error al eliminar lección:', errorDelete);
      return res.status(500).json({ error: 'Error al eliminar la lección' });
    }

    console.log(`✅ Lección eliminada: ${leccion.titulo} (ID: ${id})`);
    res.json({ 
      success: true, 
      message: 'Lección eliminada exitosamente',
      leccion_titulo: leccion.titulo
    });

  } catch (error) {
    console.error('Error en DELETE /api/lecciones/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================
// RUTAS ESPECÍFICAS PARA RECURSOS Y QUIZ
// ============================================

/**
 * @route   POST /api/lecciones/:id/recursos
 * @desc    Agregar recurso externo a lección
 * @access  Private (solo profesor propietario)
 */
router.post('/:id/recursos', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_recurso, titulo, descripcion, url, es_opcional, duracion_segundos } = req.body;
    const usuario_id = req.user.id;

    // Validar campos requeridos
    if (!tipo_recurso || !titulo || !url) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        campos_requeridos: ['tipo_recurso', 'titulo', 'url']
      });
    }

    // Verificar que la lección existe y pertenece al usuario
    const { supabase } = require('../config/database');
    const { data: leccion, error: errorLeccion } = await supabase
      .from('lecciones')
      .select('profesor_id')
      .eq('id', id)
      .single();

    if (errorLeccion || !leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    if (leccion.profesor_id !== usuario_id) {
      if (req.user.rol !== 'admin' && req.user.rol !== 'moderador') {
        return res.status(403).json({ error: 'No tienes permisos para modificar esta lección' });
      }
    }

    // Agregar recurso
    const { data: nuevoRecurso, error: errorRecurso } = await supabase
      .from('recursos_externos')
      .insert([{
        leccion_id: id,
        tipo_recurso,
        titulo,
        descripcion,
        url,
        es_opcional: es_opcional || false,
        duracion_segundos
      }])
      .select()
      .single();

    if (errorRecurso) {
      console.error('Error agregando recurso:', errorRecurso);
      return res.status(500).json({ error: 'Error al agregar recurso' });
    }

    res.status(201).json({
      message: 'Recurso agregado exitosamente',
      recurso: nuevoRecurso
    });

  } catch (error) {
    console.error('Error en POST /recursos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   POST /api/lecciones/:id/quiz
 * @desc    Agregar pregunta de quiz a lección
 * @access  Private (solo profesor propietario)
 */
router.post('/:id/quiz', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { pregunta, tipo_pregunta, opciones, respuesta_correcta, explicacion, puntos } = req.body;
    const usuario_id = req.user.id;

    // Validar campos requeridos
    if (!pregunta || !respuesta_correcta) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        campos_requeridos: ['pregunta', 'respuesta_correcta']
      });
    }

    // Verificar que la lección existe y pertenece al usuario
    const { supabase } = require('../config/database');
    const { data: leccion, error: errorLeccion } = await supabase
      .from('lecciones')
      .select('profesor_id')
      .eq('id', id)
      .single();

    if (errorLeccion || !leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    if (leccion.profesor_id !== usuario_id) {
      if (req.user.rol !== 'admin' && req.user.rol !== 'moderador') {
        return res.status(403).json({ error: 'No tienes permisos para modificar esta lección' });
      }
    }

    // Obtener próximo orden
    const { data: ultimaPregunta } = await supabase
      .from('quiz_preguntas')
      .select('orden_pregunta')
      .eq('leccion_id', id)
      .order('orden_pregunta', { ascending: false })
      .limit(1)
      .single();

    const proximoOrden = ultimaPregunta ? ultimaPregunta.orden_pregunta + 1 : 1;

    // Agregar pregunta
    const { data: nuevaPregunta, error: errorPregunta } = await supabase
      .from('quiz_preguntas')
      .insert([{
        leccion_id: id,
        pregunta,
        tipo_pregunta: tipo_pregunta || 'multiple_choice',
        opciones,
        respuesta_correcta,
        explicacion,
        puntos: puntos || 1,
        orden_pregunta: proximoOrden
      }])
      .select()
      .single();

    if (errorPregunta) {
      console.error('Error agregando pregunta:', errorPregunta);
      return res.status(500).json({ error: 'Error al agregar pregunta' });
    }

    res.status(201).json({
      message: 'Pregunta agregada exitosamente',
      pregunta: nuevaPregunta
    });

  } catch (error) {
    console.error('Error en POST /quiz:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================
// RUTAS DE ESTADÍSTICAS
// ============================================

/**
 * @route   GET /api/lecciones/estadisticas/generales
 * @desc    Obtener estadísticas generales de lecciones
 * @access  Public
 */
router.get('/estadisticas/generales', async (req, res) => {
  try {
    const { supabase } = require('../config/database');

    // Estadísticas básicas
    const { data: statsBasicas, error: errorStats } = await supabase
      .from('lecciones')
      .select('categoria, nivel, estado')
      .eq('estado', 'publicada');

    if (errorStats) {
      console.error('Error obteniendo estadísticas:', errorStats);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }

    // Procesar estadísticas
    const estadisticas = {
      total_lecciones: statsBasicas.length,
      por_categoria: {},
      por_nivel: {},
      lecciones_recientes: 0
    };

    // Agrupar por categoría y nivel
    statsBasicas.forEach(leccion => {
      estadisticas.por_categoria[leccion.categoria] = (estadisticas.por_categoria[leccion.categoria] || 0) + 1;
      estadisticas.por_nivel[leccion.nivel] = (estadisticas.por_nivel[leccion.nivel] || 0) + 1;
    });

    // Lecciones de la última semana
    const { data: leccionesRecientes, error: errorRecientes } = await supabase
      .from('lecciones')
      .select('id')
      .eq('estado', 'publicada')
      .gte('fecha_publicacion', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (!errorRecientes) {
      estadisticas.lecciones_recientes = leccionesRecientes.length;
    }

    res.json({ estadisticas });

  } catch (error) {
    console.error('Error en estadísticas generales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

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
      'GET /',
      'GET /:id',
      'POST /',
      'GET /profesor/estadisticas',
      'GET /profesor/mis-lecciones',
      'GET /mis-lecciones',
      'PUT /:id',
      'PUT /:id/publicar',
      'PUT /:id/archivar',
      'POST /:id/recursos',
      'POST /:id/quiz',
      'GET /estadisticas/generales'
    ]
  });
});

// Middleware de manejo de errores específicos
router.use((error, req, res, next) => {
  console.error('Error en rutas de lecciones:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: error.details || error.message
    });
  }

  if (error.code) {
    return res.status(500).json({
      error: 'Error de base de datos',
      codigo: error.code
    });
  }

  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

// ============================================
// RUTA PARA REGISTRAR PROGRESO CON CONTEXTO
// ============================================

/**
 * @route   POST /api/lecciones/:id/progreso
 * @desc    Registrar progreso de lección con contexto (catálogo, módulo, curso)
 * @access  Private
 * @body    { contexto_acceso, modulo_id?, curso_id?, estado_leccion, puntuacion_quiz?, tiempo_minutos? }
 */
router.post('/:id/progreso', authenticateToken, registrarProgresoConContexto);

module.exports = router;
