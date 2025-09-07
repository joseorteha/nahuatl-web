// middleware/validation.js

/**
 * Middleware para validar parámetros de búsqueda
 */
const validateSearchParams = (req, res, next) => {
  const { query, limit } = req.query;
  
  // Validar límite si se proporciona
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Parámetro limit inválido',
        message: 'El límite debe ser un número entre 1 y 100'
      });
    }
  }

  // Validar query si se proporciona
  if (query && query.trim().length > 100) {
    return res.status(400).json({
      error: 'Query demasiado largo',
      message: 'La consulta no puede exceder 100 caracteres'
    });
  }

  next();
};

/**
 * Middleware para validar datos de registro
 */
const validateRegistration = (req, res, next) => {
  const { email, username, password, nombre_completo } = req.body;
  const errors = [];

  // Validar email
  if (!email) {
    errors.push('Email es requerido');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Formato de email inválido');
  }

  // Validar username
  if (!username) {
    errors.push('Username es requerido');
  } else if (username.length < 3 || username.length > 20) {
    errors.push('Username debe tener entre 3 y 20 caracteres');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username solo puede contener letras, números y guiones bajos');
  }

  // Validar password
  if (!password) {
    errors.push('Contraseña es requerida');
  } else if (password.length < 6) {
    errors.push('Contraseña debe tener al menos 6 caracteres');
  }

  // Validar nombre completo
  if (!nombre_completo) {
    errors.push('Nombre completo es requerido');
  } else if (nombre_completo.trim().length < 2) {
    errors.push('Nombre completo debe tener al menos 2 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Errores de validación',
      details: errors
    });
  }

  next();
};

/**
 * Middleware para validar datos de login
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email es requerido');
  }

  if (!password) {
    errors.push('Contraseña es requerida');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Errores de validación',
      details: errors
    });
  }

  next();
};

/**
 * Middleware para validar UUID
 */
const validateUUID = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: `El parámetro ${paramName} debe ser un UUID válido`
      });
    }
    
    next();
  };
};

module.exports = {
  validateSearchParams,
  validateRegistration,
  validateLogin,
  validateUUID
};
