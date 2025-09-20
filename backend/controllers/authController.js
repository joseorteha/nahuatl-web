// controllers/authController.js
const userService = require('../services/userService');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const { passport } = require('../config/googleOAuth');

class AuthController {
  /**
   * Registrar nuevo usuario
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async register(req, res) {
    try {
      const { email, username, password, nombre_completo } = req.body;

      // Validaciones básicas
      if (!email || !username || !password || !nombre_completo) {
        return res.status(400).json({ 
          error: 'Todos los campos son requeridos' 
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido' 
        });
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
      }

      const newUser = await userService.registerUser({
        email,
        username,
        password,
        nombre_completo
      });

      // Generar tokens
      const accessToken = generateToken(newUser.id, newUser.email);
      const refreshToken = generateRefreshToken(newUser.id);

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRY || '7d'
      });
    } catch (error) {
      console.error('Error en registro:', error);
      
      if (error.message === 'El usuario o email ya existe') {
        return res.status(409).json({ error: error.message });
      }
      
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  }

  /**
   * Iniciar sesión
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async login(req, res) {
    try {
      const { email, password, emailOrUsername } = req.body;

      // Aceptar tanto email como emailOrUsername para compatibilidad
      const loginIdentifier = email || emailOrUsername;

      if (!loginIdentifier || !password) {
        return res.status(400).json({ 
          error: 'Email/usuario y contraseña son requeridos' 
        });
      }

      const user = await userService.loginUser(loginIdentifier, password);

      // Generar tokens
      const accessToken = generateToken(user.id, user.email);
      const refreshToken = generateRefreshToken(user.id);

      res.json({
        message: 'Login exitoso',
        user,
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRY || '7d'
      });
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.message === 'Usuario no encontrado' || 
          error.message === 'Contraseña incorrecta') {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async getProfile(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
      }

      const userProfile = await userService.getUserProfile(userId);
      res.json(userProfile);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ 
        error: 'Error al obtener perfil',
        message: error.message 
      });
    }
  }

  /**
   * Actualizar perfil del usuario
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async updateProfile(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
      }

      const updatedUser = await userService.updateUserProfile(userId, updateData);
      
      res.json({
        message: 'Perfil actualizado exitosamente',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ 
        error: 'Error al actualizar perfil',
        message: error.message 
      });
    }
  }

  /**
   * Obtener estadísticas del usuario
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
      }

      const stats = await userService.getUserStats(userId);
      
      res.json({
        message: 'Estadísticas obtenidas exitosamente',
        stats: stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ 
        error: 'Error al obtener estadísticas',
        message: error.message 
      });
    }
  }

  /**
   * Obtener palabras guardadas del usuario
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async getSavedWords(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario requerido' });
      }

      const savedWords = await userService.getSavedWords(userId);
      
      res.json({
        message: 'Palabras guardadas obtenidas exitosamente',
        savedWords: savedWords
      });
    } catch (error) {
      console.error('Error al obtener palabras guardadas:', error);
      res.status(500).json({ 
        error: 'Error al obtener palabras guardadas',
        message: error.message 
      });
    }
  }

  /**
   * Renovar token de acceso
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ 
          error: 'Refresh token requerido' 
        });
      }

      // Verificar refresh token
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || 'tu_refresh_secret_muy_seguro'
      );

      if (decoded.type !== 'refresh') {
        return res.status(401).json({ 
          error: 'Token inválido' 
        });
      }

      // Verificar que el usuario aún existe
      const user = await userService.getUserProfile(decoded.userId);

      // Generar nuevos tokens
      const newAccessToken = generateToken(user.id, user.email);
      const newRefreshToken = generateRefreshToken(user.id);

      res.json({
        message: 'Tokens renovados exitosamente',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRY || '7d'
      });
    } catch (error) {
      console.error('Error renovando token:', error);
      
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Refresh token inválido o expirado' 
        });
      }
      
      res.status(500).json({ 
        error: 'Error renovando token',
        message: error.message 
      });
    }
  }

  /**
   * Cerrar sesión (invalidar token)
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async logout(req, res) {
    try {
      // En un sistema más avanzado, aquí podrías invalidar el token
      // agregándolo a una lista negra en Redis o BD
      
      res.json({
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      res.status(500).json({ 
        error: 'Error cerrando sesión',
        message: error.message 
      });
    }
  }

  /**
   * Iniciar autenticación con Google
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async googleAuth(req, res) {
    try {
      // Esta función será manejada por passport
      // Solo redirigir a Google
    } catch (error) {
      console.error('Error en Google Auth:', error);
      res.status(500).json({ 
        error: 'Error iniciando autenticación con Google',
        message: error.message 
      });
    }
  }

  /**
   * Callback de Google OAuth
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async googleCallback(req, res) {
    try {
      // Esta función será manejada por passport
      // El middleware de passport manejará la autenticación
    } catch (error) {
      console.error('Error en Google Callback:', error);
      res.status(500).json({ 
        error: 'Error en callback de Google',
        message: error.message 
      });
    }
  }

  /**
   * Manejar éxito de autenticación OAuth
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async oauthSuccess(req, res) {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          error: 'Error de autenticación',
          message: 'No se pudo autenticar con Google'
        });
      }

      // Generar tokens JWT
      const accessToken = generateToken(user.id, user.email);
      const refreshToken = generateRefreshToken(user.id);

      // Redirigir al frontend con los tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}&user=${encodeURIComponent(JSON.stringify(user))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error en OAuth success:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=oauth_error`);
    }
  }

  /**
   * Manejar error de autenticación OAuth
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async oauthError(req, res) {
    try {
      console.error('Error de OAuth:', req.query.error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=oauth_error&details=${encodeURIComponent(req.query.error || 'Error desconocido')}`);
    } catch (error) {
      console.error('Error en OAuth error handler:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=oauth_error`);
    }
  }
}

module.exports = new AuthController();
