// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, generateToken, generateRefreshToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');

// Middleware legacy para tokens sin issuer/audience
const authenticateTokenLegacy = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debes iniciar sesión para acceder a este recurso'
      });
    }

    // Intentar verificar con issuer/audience, si falla intentar sin ellos
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro', {
        issuer: 'nahuatl-web',
        audience: 'nahuatl-users'
      });
    } catch (error) {
      console.log('🔄 Token legacy format, trying without issuer/audience...');
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_jwt_secret_muy_seguro');
    }
    
    const { data: user, error } = await supabase
      .from('perfiles')
      .select('id, email, username, nombre_completo, rol, fecha_creacion')
      .eq('id', decoded.userId)
      .maybeSingle();
    
    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El usuario asociado a este token ya no existe'
      });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Token inválido',
      message: 'El token proporcionado no es válido'
    });
  }
};
const { validateRegistration, validateLogin, validateUUID } = require('../middleware/validation');
const { passport } = require('../config/googleOAuth');

// Rutas públicas
// POST /api/auth/register - Registrar usuario
router.post('/register', validateRegistration, authController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', validateLogin, authController.login);

// POST /api/auth/refresh - Renovar token
// Endpoint temporal para refrescar token cuando hay problemas de formato
router.post('/refresh-token-fix', authenticateTokenLegacy, async (req, res) => {
  try {
    console.log('🔄 Refreshing token for user:', req.userId);
    
    // Generar nuevo token con formato correcto
    const newAccessToken = generateToken(req.userId, req.user.email);
    const newRefreshToken = generateRefreshToken(req.userId);
    
    res.json({
      success: true,
      user: req.user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: '7d'
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/refresh-token', authController.refreshToken);

// GET /api/auth/check-session - Verificar sesión de cookies
router.get('/check-session', authController.checkSession);

// GET /api/auth/profile/:userId - Obtener perfil público (sin autenticación)
router.get('/profile/:userId', validateUUID('userId'), authController.getPublicProfile);

// Rutas protegidas (requieren autenticación)
// GET /api/auth/profile/:userId - Obtener perfil
router.get('/profile/:userId', validateUUID('userId'), authenticateToken, authController.getProfile);

// PUT /api/auth/profile/:userId - Actualizar perfil
router.put('/profile/:userId', validateUUID('userId'), authenticateToken, authController.updateProfile);

// GET /api/auth/stats/:userId - Obtener estadísticas del usuario
router.get('/stats/:userId', validateUUID('userId'), authenticateToken, authController.getUserStats);

// GET /api/auth/saved-words/:userId - Obtener palabras guardadas del usuario
router.get('/saved-words/:userId', validateUUID('userId'), authenticateToken, authController.getSavedWords);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', authenticateToken, authController.logout);

// Rutas de Google OAuth
// GET /api/auth/google - Iniciar autenticación con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback - Callback de Google OAuth
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/api/auth/google/error' }),
  authController.oauthSuccess
);

// GET /api/auth/google/error - Manejar errores de Google OAuth
router.get('/google/error', authController.oauthError);

module.exports = router;
