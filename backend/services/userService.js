// services/userService.js
const { supabase } = require('../config/database');
const bcrypt = require('bcrypt');

class UserService {
  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async registerUser({ email, username, password, nombre_completo }) {
    try {
      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('perfiles')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .maybeSingle();

      if (existingUser) {
        throw new Error('El usuario o email ya existe');
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const { data: newUser, error } = await supabase
        .from('perfiles')
        .insert([{
          email,
          username,
          password: hashedPassword,
          nombre_completo,
          fecha_registro: new Date().toISOString(),
          rol: 'usuario'
        }])
        .select('id, email, username, nombre_completo, rol, fecha_registro')
        .single();

      if (error) throw error;
      return newUser;
    } catch (error) {
      console.error('Error en registro de usuario:', error);
      throw error;
    }
  }

  /**
   * Autenticar usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Usuario autenticado
   */
  async loginUser(email, password) {
    try {
      // Buscar usuario por email
      const { data: user, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error('Contraseña incorrecta');
      }

      // Actualizar último acceso
      await supabase
        .from('perfiles')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', user.id);

      // Retornar usuario sin la contraseña
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Obtener perfil de usuario por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Perfil del usuario
   */
  async getUserProfile(userId) {
    try {
      const { data: user, error } = await supabase
        .from('perfiles')
        .select('id, email, username, nombre_completo, rol, fecha_registro, ultimo_acceso')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil de usuario
   * @param {string} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUserProfile(userId, updateData) {
    try {
      const allowedFields = ['nombre_completo', 'username'];
      const filteredData = {};
      
      // Filtrar solo campos permitidos
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      const { data: updatedUser, error } = await supabase
        .from('perfiles')
        .update(filteredData)
        .eq('id', userId)
        .select('id, email, username, nombre_completo, rol, fecha_registro')
        .single();

      if (error) throw error;
      return updatedUser;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Verificar si un usuario es admin o moderador
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>} True si es admin/moderador
   */
  async isUserAdmin(userId) {
    try {
      const { data: user, error } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return user && ['admin', 'moderador'].includes(user.rol);
    } catch (error) {
      console.error('Error al verificar rol admin:', error);
      return false;
    }
  }
}

module.exports = new UserService();
