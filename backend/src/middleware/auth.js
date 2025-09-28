// middleware/auth.js
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');

/**
 * Middleware para verificar JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debes iniciar sesión para acceder a este recurso'
      });
    }

    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro');
    
    // Verificar que el usuario aún existe en la base de datos
    const { data: user, error } = await supabase
      .from('perfiles')
      .select('id, email, username, nombre_completo, rol, fecha_creacion')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (error) {
      console.error('Error verificando usuario en BD:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo verificar la autenticación'
      });
    }

    if (!user) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El usuario asociado a este token ya no existe'
      });
    }

    // Agregar información del usuario al request
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Tu sesión ha expirado, por favor inicia sesión nuevamente'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error procesando la autenticación'
    });
  }
};

/**
 * Middleware opcional para verificar token (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro');
    
    const { data: user } = await supabase
      .from('perfiles')
      .select('id, email, username, nombre_completo, rol')
      .eq('id', decoded.userId)
      .maybeSingle();

    req.user = user;
    req.userId = user ? user.id : null;
    next();
  } catch (error) {
    // Si hay error, continuar sin autenticación
    req.user = null;
    req.userId = null;
    next();
  }
};

/**
 * Middleware para verificar roles de administrador
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Debes iniciar sesión para acceder a este recurso'
    });
  }

  if (!['admin', 'moderador'].includes(req.user.rol)) {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'No tienes permisos para acceder a este recurso'
    });
  }

  next();
};

/**
 * Generar token JWT
 */
const generateToken = (userId, email) => {
  return jwt.sign(
    { 
      userId, 
      email,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro',
    { 
      expiresIn: process.env.JWT_EXPIRY || '7d',
      issuer: 'nahuatl-web',
      audience: 'nahuatl-users'
    }
  );
};

/**
 * Generar refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { 
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_REFRESH_SECRET || 'tu_refresh_secret_muy_seguro',
    { 
      expiresIn: '30d',
      issuer: 'nahuatl-web',
      audience: 'nahuatl-users'
    }
  );
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  generateToken,
  generateRefreshToken
};
