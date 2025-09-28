// utils/helpers.js

/**
 * Funciones auxiliares para el backend
 */

/**
 * Función para mezclar arrays (algoritmo Fisher-Yates)
 * @param {Array} array - Array a mezclar
 * @returns {Array} Array mezclado
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Función para sanitizar entrada de usuario
 * @param {string} input - Entrada a sanitizar
 * @returns {string} Entrada sanitizada
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover posibles tags HTML
    .substring(0, 1000); // Limitar longitud
}

/**
 * Función para validar email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Función para generar respuesta de error estándar
 * @param {string} message - Mensaje de error
 * @param {number} status - Código de estado HTTP
 * @param {Object} details - Detalles adicionales
 * @returns {Object} Objeto de error estándar
 */
function createErrorResponse(message, status = 500, details = null) {
  const response = {
    error: message,
    timestamp: new Date().toISOString(),
    status
  };
  
  if (details) {
    response.details = details;
  }
  
  return response;
}

/**
 * Función para generar respuesta de éxito estándar
 * @param {string} message - Mensaje de éxito
 * @param {Object} data - Datos de respuesta
 * @returns {Object} Objeto de respuesta estándar
 */
function createSuccessResponse(message, data = null) {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return response;
}

/**
 * Función para parsear parámetros de paginación
 * @param {Object} query - Query parameters
 * @returns {Object} Parámetros de paginación parseados
 */
function parsePaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

/**
 * Función para formatear respuesta paginada
 * @param {Array} data - Datos de la página actual
 * @param {number} total - Total de elementos
 * @param {number} page - Página actual
 * @param {number} limit - Elementos por página
 * @returns {Object} Respuesta paginada
 */
function formatPaginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_items: total,
      items_per_page: limit,
      has_next: page < totalPages,
      has_prev: page > 1
    }
  };
}

/**
 * Función para delay/sleep
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promesa que se resuelve después del delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  shuffleArray,
  sanitizeInput,
  isValidEmail,
  createErrorResponse,
  createSuccessResponse,
  parsePaginationParams,
  formatPaginatedResponse,
  sleep
};
