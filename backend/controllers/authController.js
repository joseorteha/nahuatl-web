// controllers/authController.js
const userService = require('../services/userService');

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

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser
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

      res.json({
        message: 'Login exitoso',
        user
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
}

module.exports = new AuthController();
