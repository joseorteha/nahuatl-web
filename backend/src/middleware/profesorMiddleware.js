/**
 * Middleware de validación para profesores
 * Fase 2: Sistema de Lecciones - Backend API
 */

const { supabase } = require('../config/database');

/**
 * Middleware para verificar que el usuario es profesor
 */
const verificarProfesor = async (req, res, next) => {
  try {
    const usuario_id = req.user?.id;
    
    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar rol en la base de datos
    const { data: usuario, error } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', usuario_id)
      .single();

    if (error || !usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.rol !== 'profesor' && usuario.rol !== 'admin') {
      return res.status(403).json({ 
        error: 'Acceso denegado. Solo profesores y administradores pueden realizar esta acción.',
        rol_requerido: 'profesor'
      });
    }

    // Agregar rol al request para uso posterior
    req.user.rol = usuario.rol;
    next();

  } catch (error) {
    console.error('Error en verificarProfesor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Middleware para verificar que el usuario es admin o moderador
 */
const verificarAdmin = async (req, res, next) => {
  try {
    const usuario_id = req.user?.id;
    
    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar rol en la base de datos
    const { data: usuario, error } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', usuario_id)
      .single();

    if (error || !usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (!['admin', 'moderador'].includes(usuario.rol)) {
      return res.status(403).json({ 
        error: 'Acceso denegado. Solo administradores y moderadores pueden realizar esta acción.',
        rol_requerido: 'admin'
      });
    }

    req.user.rol = usuario.rol;
    next();

  } catch (error) {
    console.error('Error en verificarAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Middleware para verificar que el usuario puede solicitar ser maestro
 */
const verificarPuedeSolicitarMaestro = async (req, res, next) => {
  try {
    const usuario_id = req.user?.id;
    
    if (!usuario_id) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar que no sea ya profesor
    const { data: usuario, error: errorUsuario } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', usuario_id)
      .single();

    if (errorUsuario || !usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.rol === 'profesor') {
      return res.status(400).json({ 
        error: 'Ya eres profesor. No necesitas enviar otra solicitud.' 
      });
    }

    // Verificar que no tenga solicitud pendiente
    const { data: solicitudPendiente, error: errorSolicitud } = await supabase
      .from('solicitudes_maestros')
      .select('id')
      .eq('usuario_id', usuario_id)
      .eq('estado', 'pendiente')
      .single();

    if (errorSolicitud && errorSolicitud.code !== 'PGRST116') {
      console.error('Error verificando solicitud pendiente:', errorSolicitud);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (solicitudPendiente) {
      return res.status(400).json({ 
        error: 'Ya tienes una solicitud pendiente de revisión.' 
      });
    }

    next();

  } catch (error) {
    console.error('Error en verificarPuedeSolicitarMaestro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Middleware para validar datos de solicitud de maestro
 */
const validarSolicitudMaestro = (req, res, next) => {
  const { 
    especialidad_id, 
    especialidad_otra,
    experiencia, 
    motivacion, 
    propuesta_contenido,
    email,
    nombre_completo 
  } = req.body;

  // Validar campos requeridos para solicitudes públicas
  if (!email || !nombre_completo) {
    return res.status(400).json({
      error: 'Email y nombre completo son requeridos',
      campos_requeridos: ['email', 'nombre_completo']
    });
  }

  if (!especialidad_id || !experiencia || !motivacion || !propuesta_contenido) {
    return res.status(400).json({
      error: 'Campos requeridos faltantes',
      campos_requeridos: ['especialidad_id', 'experiencia', 'motivacion', 'propuesta_contenido']
    });
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Email inválido'
    });
  }

  // Validar longitudes mínimas (más razonables para solicitudes públicas)
  if (experiencia.length < 10) {
    return res.status(400).json({
      error: 'La experiencia debe tener al menos 10 caracteres'
    });
  }

  if (motivacion.length < 10) {
    return res.status(400).json({
      error: 'La motivación debe tener al menos 10 caracteres'
    });
  }

  if (propuesta_contenido.length < 15) {
    return res.status(400).json({
      error: 'La propuesta de contenido debe tener al menos 15 caracteres'
    });
  }

  // Si especialidad_id es 12 (otro), debe tener especialidad_otra
  if (especialidad_id === '12' || especialidad_id === 12) {
    if (!especialidad_otra || especialidad_otra.trim().length < 3) {
      return res.status(400).json({
        error: 'Debe especificar la especialidad cuando selecciona "Otro"'
      });
    }
  }

  next();
};

/**
 * Middleware para validar datos de lección
 */
const validarLeccion = (req, res, next) => {
  const { titulo, categoria, contenido_texto, nivel, duracion_estimada } = req.body;

  // Validar campos requeridos
  if (!titulo || !categoria || !contenido_texto) {
    return res.status(400).json({
      error: 'Campos requeridos faltantes',
      campos_requeridos: ['titulo', 'categoria', 'contenido_texto']
    });
  }

  // Validar longitudes
  if (titulo.length < 5 || titulo.length > 200) {
    return res.status(400).json({
      error: 'El título debe tener entre 5 y 200 caracteres'
    });
  }

  if (contenido_texto.length < 50) {
    return res.status(400).json({
      error: 'El contenido debe tener al menos 50 caracteres'
    });
  }

  // Validar categorías
  const categoriasPermitidas = [
    'numeros', 'colores', 'familia', 'naturaleza', 
    'gramatica', 'cultura', 'vocabulario'
  ];

  if (!categoriasPermitidas.includes(categoria.toLowerCase())) {
    return res.status(400).json({
      error: 'Categoría no válida',
      categorias_permitidas: categoriasPermitidas
    });
  }

  // Validar nivel
  if (nivel && !['principiante', 'intermedio', 'avanzado'].includes(nivel)) {
    return res.status(400).json({
      error: 'Nivel no válido',
      niveles_permitidos: ['principiante', 'intermedio', 'avanzado']
    });
  }

  // Validar duración
  if (duracion_estimada && (isNaN(duracion_estimada) || duracion_estimada < 5 || duracion_estimada > 120)) {
    return res.status(400).json({
      error: 'La duración estimada debe ser entre 5 y 120 minutos'
    });
  }

  // Normalizar datos
  req.body.categoria = categoria.toLowerCase();
  if (duracion_estimada) {
    req.body.duracion_estimada = parseInt(duracion_estimada);
  }

  next();
};

/**
 * Middleware para validar recursos externos
 */
const validarRecursosExternos = (req, res, next) => {
  const { recursos_externos } = req.body;

  if (!recursos_externos || !Array.isArray(recursos_externos)) {
    return next(); // Los recursos son opcionales
  }

  const tiposPermitidos = ['video_youtube', 'imagen_drive', 'audio_externo', 'enlace_web'];

  for (let i = 0; i < recursos_externos.length; i++) {
    const recurso = recursos_externos[i];

    if (!recurso.tipo_recurso || !recurso.titulo || !recurso.url) {
      return res.status(400).json({
        error: `Recurso externo ${i + 1}: faltan campos requeridos`,
        campos_requeridos: ['tipo_recurso', 'titulo', 'url']
      });
    }

    if (!tiposPermitidos.includes(recurso.tipo_recurso)) {
      return res.status(400).json({
        error: `Recurso externo ${i + 1}: tipo no válido`,
        tipos_permitidos: tiposPermitidos
      });
    }

    // Validar URL básicamente
    try {
      new URL(recurso.url);
    } catch (error) {
      return res.status(400).json({
        error: `Recurso externo ${i + 1}: URL no válida`
      });
    }

    // Validar específicos por tipo
    if (recurso.tipo_recurso === 'video_youtube' && !recurso.url.includes('youtube.com') && !recurso.url.includes('youtu.be')) {
      return res.status(400).json({
        error: `Recurso externo ${i + 1}: URL debe ser de YouTube`
      });
    }
  }

  next();
};

/**
 * Middleware para validar preguntas de quiz
 */
const validarQuizPreguntas = (req, res, next) => {
  const { quiz_preguntas } = req.body;

  if (!quiz_preguntas || !Array.isArray(quiz_preguntas)) {
    return next(); // Las preguntas son opcionales
  }

  const tiposPermitidos = ['multiple_choice', 'verdadero_falso', 'completar_texto', 'ordenar_palabras'];

  for (let i = 0; i < quiz_preguntas.length; i++) {
    const pregunta = quiz_preguntas[i];

    if (!pregunta.pregunta || !pregunta.respuesta_correcta) {
      return res.status(400).json({
        error: `Pregunta ${i + 1}: faltan campos requeridos`,
        campos_requeridos: ['pregunta', 'respuesta_correcta']
      });
    }

    if (pregunta.tipo_pregunta && !tiposPermitidos.includes(pregunta.tipo_pregunta)) {
      return res.status(400).json({
        error: `Pregunta ${i + 1}: tipo no válido`,
        tipos_permitidos: tiposPermitidos
      });
    }

    if (pregunta.pregunta.length < 10) {
      return res.status(400).json({
        error: `Pregunta ${i + 1}: debe tener al menos 10 caracteres`
      });
    }

    // Validar opciones para multiple choice
    if (pregunta.tipo_pregunta === 'multiple_choice' || !pregunta.tipo_pregunta) {
      if (!pregunta.opciones || typeof pregunta.opciones !== 'object') {
        return res.status(400).json({
          error: `Pregunta ${i + 1}: preguntas de múltiple opción requieren objeto 'opciones'`
        });
      }

      const opcionesArray = Object.keys(pregunta.opciones);
      if (opcionesArray.length < 2) {
        return res.status(400).json({
          error: `Pregunta ${i + 1}: debe tener al menos 2 opciones`
        });
      }

      if (!opcionesArray.includes(pregunta.respuesta_correcta)) {
        return res.status(400).json({
          error: `Pregunta ${i + 1}: la respuesta correcta debe estar en las opciones`
        });
      }
    }
  }

  next();
};

module.exports = {
  verificarProfesor,
  verificarAdmin,
  verificarPuedeSolicitarMaestro,
  validarSolicitudMaestro,
  validarLeccion,
  validarRecursosExternos,
  validarQuizPreguntas
};