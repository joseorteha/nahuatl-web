/**
 * Utilidades de validación para el sistema de lecciones
 * Fase 2: Sistema de Lecciones - Backend API
 */

/**
 * Validar que todos los campos requeridos estén presentes
 * @param {Object} data - Objeto con los datos a validar
 * @param {Array} camposRequeridos - Array con los nombres de los campos requeridos
 * @returns {Object} { valido: boolean, faltantes: string[] }
 */
const validarCamposRequeridos = (data, camposRequeridos) => {
  const faltantes = [];
  
  camposRequeridos.forEach(campo => {
    if (!data[campo] || data[campo] === '' || data[campo] === null || data[campo] === undefined) {
      faltantes.push(campo);
    }
  });

  return {
    valido: faltantes.length === 0,
    faltantes
  };
};

/**
 * Validar formato de email
 * @param {string} email 
 * @returns {boolean}
 */
const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar formato de URL
 * @param {string} url 
 * @returns {boolean}
 */
const validarURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validar URL de YouTube
 * @param {string} url 
 * @returns {boolean}
 */
const validarURLYouTube = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

/**
 * Validar que una cadena tenga una longitud mínima y máxima
 * @param {string} texto 
 * @param {number} minimo 
 * @param {number} maximo 
 * @returns {Object} { valido: boolean, mensaje: string }
 */
const validarLongitudTexto = (texto, minimo, maximo = null) => {
  if (!texto || typeof texto !== 'string') {
    return {
      valido: false,
      mensaje: 'El texto es requerido'
    };
  }

  const longitud = texto.trim().length;

  if (longitud < minimo) {
    return {
      valido: false,
      mensaje: `El texto debe tener al menos ${minimo} caracteres`
    };
  }

  if (maximo && longitud > maximo) {
    return {
      valido: false,
      mensaje: `El texto no debe exceder ${maximo} caracteres`
    };
  }

  return {
    valido: true,
    mensaje: 'Válido'
  };
};

/**
 * Validar que un valor esté en una lista de valores permitidos
 * @param {any} valor 
 * @param {Array} valoresPermitidos 
 * @returns {boolean}
 */
const validarValorPermitido = (valor, valoresPermitidos) => {
  return valoresPermitidos.includes(valor);
};

/**
 * Validar que un número esté en un rango específico
 * @param {number} numero 
 * @param {number} minimo 
 * @param {number} maximo 
 * @returns {Object} { valido: boolean, mensaje: string }
 */
const validarRangoNumerico = (numero, minimo, maximo) => {
  const num = Number(numero);
  
  if (isNaN(num)) {
    return {
      valido: false,
      mensaje: 'Debe ser un número válido'
    };
  }

  if (num < minimo || num > maximo) {
    return {
      valido: false,
      mensaje: `Debe estar entre ${minimo} y ${maximo}`
    };
  }

  return {
    valido: true,
    mensaje: 'Válido'
  };
};

/**
 * Sanitizar texto eliminando caracteres peligrosos
 * @param {string} texto 
 * @returns {string}
 */
const sanitizarTexto = (texto) => {
  if (!texto || typeof texto !== 'string') {
    return '';
  }

  return texto
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
    .replace(/<[^>]*>?/gm, '') // Remover HTML tags básicos (opcional)
    .replace(/[<>]/g, ''); // Remover caracteres peligrosos
};

/**
 * Validar estructura de pregunta de quiz
 * @param {Object} pregunta 
 * @returns {Object} { valido: boolean, errores: string[] }
 */
const validarPreguntaQuiz = (pregunta) => {
  const errores = [];

  // Validar campos requeridos
  if (!pregunta.pregunta || pregunta.pregunta.trim().length < 10) {
    errores.push('La pregunta debe tener al menos 10 caracteres');
  }

  if (!pregunta.respuesta_correcta) {
    errores.push('La respuesta correcta es requerida');
  }

  // Validar tipo de pregunta
  const tiposPermitidos = ['multiple_choice', 'verdadero_falso', 'completar_texto', 'ordenar_palabras'];
  const tipo = pregunta.tipo_pregunta || 'multiple_choice';
  
  if (!tiposPermitidos.includes(tipo)) {
    errores.push(`Tipo de pregunta no válido. Permitidos: ${tiposPermitidos.join(', ')}`);
  }

  // Validar opciones para multiple choice
  if (tipo === 'multiple_choice') {
    if (!pregunta.opciones || typeof pregunta.opciones !== 'object') {
      errores.push('Las preguntas de múltiple opción requieren un objeto de opciones');
    } else {
      const opciones = Object.keys(pregunta.opciones);
      if (opciones.length < 2) {
        errores.push('Las preguntas de múltiple opción deben tener al menos 2 opciones');
      }

      if (!opciones.includes(pregunta.respuesta_correcta)) {
        errores.push('La respuesta correcta debe estar entre las opciones disponibles');
      }
    }
  }

  // Validar puntos
  if (pregunta.puntos && (isNaN(pregunta.puntos) || pregunta.puntos < 1 || pregunta.puntos > 10)) {
    errores.push('Los puntos deben ser un número entre 1 y 10');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Validar estructura de recurso externo
 * @param {Object} recurso 
 * @returns {Object} { valido: boolean, errores: string[] }
 */
const validarRecursoExterno = (recurso) => {
  const errores = [];

  // Validar campos requeridos
  if (!recurso.tipo_recurso) {
    errores.push('El tipo de recurso es requerido');
  }

  if (!recurso.titulo || recurso.titulo.trim().length < 3) {
    errores.push('El título debe tener al menos 3 caracteres');
  }

  if (!recurso.url) {
    errores.push('La URL es requerida');
  } else if (!validarURL(recurso.url)) {
    errores.push('La URL no es válida');
  }

  // Validar tipo de recurso
  const tiposPermitidos = ['video_youtube', 'imagen_drive', 'audio_externo', 'enlace_web'];
  if (recurso.tipo_recurso && !tiposPermitidos.includes(recurso.tipo_recurso)) {
    errores.push(`Tipo de recurso no válido. Permitidos: ${tiposPermitidos.join(', ')}`);
  }

  // Validaciones específicas por tipo
  if (recurso.tipo_recurso === 'video_youtube' && !validarURLYouTube(recurso.url)) {
    errores.push('Para videos de YouTube, la URL debe ser de youtube.com o youtu.be');
  }

  // Validar duración
  if (recurso.duracion_segundos && (isNaN(recurso.duracion_segundos) || recurso.duracion_segundos < 1)) {
    errores.push('La duración debe ser un número positivo en segundos');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Extraer ID de video de YouTube de una URL
 * @param {string} url 
 * @returns {string|null}
 */
const extraerIDYouTube = (url) => {
  const regexes = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const regex of regexes) {
    const match = url.match(regex);
    if (match) {
      return match[1];
    }
  }

  return null;
};

/**
 * Limpiar y formatear texto para búsqueda
 * @param {string} texto 
 * @returns {string}
 */
const formatearParaBusqueda = (texto) => {
  if (!texto || typeof texto !== 'string') {
    return '';
  }

  return texto
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, ' '); // Normalizar espacios
};

/**
 * Validar datos de solicitud de maestro
 * @param {Object} solicitud 
 * @returns {Object} { valido: boolean, errores: string[] }
 */
const validarSolicitudMaestro = (solicitud) => {
  const errores = [];

  // Validar especialidad
  const especialidadesPermitidas = [
    'numeros', 'colores', 'familia', 'naturaleza', 
    'gramatica', 'cultura', 'vocabulario', 'historia'
  ];

  if (!solicitud.especialidad) {
    errores.push('La especialidad es requerida');
  } else if (!especialidadesPermitidas.includes(solicitud.especialidad.toLowerCase())) {
    errores.push(`Especialidad no válida. Permitidas: ${especialidadesPermitidas.join(', ')}`);
  }

  // Validar experiencia
  const validacionExperiencia = validarLongitudTexto(solicitud.experiencia, 50, 1000);
  if (!validacionExperiencia.valido) {
    errores.push(`Experiencia: ${validacionExperiencia.mensaje}`);
  }

  // Validar motivación
  const validacionMotivacion = validarLongitudTexto(solicitud.motivacion, 30, 500);
  if (!validacionMotivacion.valido) {
    errores.push(`Motivación: ${validacionMotivacion.mensaje}`);
  }

  // Validar propuesta de contenido
  const validacionPropuesta = validarLongitudTexto(solicitud.propuesta_contenido, 100, 1500);
  if (!validacionPropuesta.valido) {
    errores.push(`Propuesta de contenido: ${validacionPropuesta.mensaje}`);
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

module.exports = {
  validarCamposRequeridos,
  validarEmail,
  validarURL,
  validarURLYouTube,
  validarLongitudTexto,
  validarValorPermitido,
  validarRangoNumerico,
  sanitizarTexto,
  validarPreguntaQuiz,
  validarRecursoExterno,
  extraerIDYouTube,
  formatearParaBusqueda,
  validarSolicitudMaestro
};