// middleware/errorHandler.js

/**
 * Middleware global para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error capturado por middleware:', err);

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.message
    });
  }

  // Error de base de datos
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      error: 'Registro duplicado',
      message: 'El recurso ya existe'
    });
  }

  // Error 404
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Recurso no encontrado',
      message: err.message || 'El recurso solicitado no existe'
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para rutas no encontradas
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl || req.url} no existe`,
    availableEndpoints: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/profile/:userId',
        'PUT /api/auth/profile/:userId'
      ],
      dictionary: [
        'GET /api/dictionary/search',
        'GET /api/dictionary/saved/:userId',
        'POST /api/dictionary/save',
        'DELETE /api/dictionary/save'
      ]
    }
  });
};

module.exports = { errorHandler, notFoundHandler };
