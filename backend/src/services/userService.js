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
          rol: 'usuario'
        }])
        .select('id, email, username, nombre_completo, rol, fecha_creacion')
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
   * @param {string} emailOrUsername - Email o username del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Usuario autenticado
   */
  async loginUser(emailOrUsername, password) {
    try {
      // Buscar usuario por email o username
      const { data: user, error } = await supabase
        .from('perfiles')
        .select('*')
        .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
        .maybeSingle();

      if (error) throw error;
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña - Compatibilidad con texto plano y bcrypt
      let validPassword = false;
      
      // Verificar si la contraseña está hasheada (bcrypt)
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        validPassword = await bcrypt.compare(password, user.password);
      } else {
        // Contraseña en texto plano (usuarios antiguos)
        validPassword = password === user.password;
        
        // Si es válida, actualizar a hash para futuras autenticaciones
        if (validPassword) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await supabase
            .from('perfiles')
            .update({ password: hashedPassword })
            .eq('id', user.id);
        }
      }
      
      if (!validPassword) {
        throw new Error('Contraseña incorrecta');
      }

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
        .select(`
          id, 
          email, 
          username, 
          nombre_completo, 
          url_avatar, 
          rol, 
          fecha_creacion, 
          fecha_actualizacion,
          biografia,
          ubicacion,
          sitio_web,
          verificado,
          es_beta_tester,
          contador_feedback,
          privacidad_perfil,
          mostrar_puntos,
          mostrar_nivel,
          notificaciones_email,
          notificaciones_push
        `)
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
      const allowedFields = [
        'nombre_completo', 
        'username', 
        'email', 
        'url_avatar',
        'biografia',
        'ubicacion',
        'sitio_web',
        'privacidad_perfil',
        'mostrar_puntos',
        'mostrar_nivel',
        'notificaciones_email',
        'notificaciones_push'
      ];
      const filteredData = {};
      
      // Filtrar solo campos permitidos
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== null && updateData[key] !== undefined) {
          filteredData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      // Agregar fecha de actualización
      filteredData.fecha_actualizacion = new Date().toISOString();

      const { data: updatedUser, error } = await supabase
        .from('perfiles')
        .update(filteredData)
        .eq('id', userId)
        .select(`
          id, 
          email, 
          username, 
          nombre_completo, 
          url_avatar, 
          rol, 
          fecha_creacion, 
          fecha_actualizacion,
          biografia,
          ubicacion,
          sitio_web,
          verificado,
          es_beta_tester,
          contador_feedback,
          privacidad_perfil,
          mostrar_puntos,
          mostrar_nivel,
          notificaciones_email,
          notificaciones_push
        `)
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

  /**
   * Obtener estadísticas del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas del usuario
   */
  async getUserStats(userId) {
    try {
      console.log('🔍 getUserStats - Starting stats collection for user:', userId);
      
      let contributions = 0;
      let temas = 0;
      let savedWords = 0;

      // Intentar obtener contribuciones (si la tabla existe)
      try {
        const { data: contributionsData, error: contributionsError } = await supabase
          .from('contribuciones_diccionario')
          .select('id')
          .eq('usuario_id', userId);

        if (!contributionsError && contributionsData) {
          contributions = contributionsData.length;
          console.log('✅ getUserStats - Contributions found:', contributions);
        }
      } catch (error) {
        console.log('⚠️ getUserStats - Contributions table not accessible, using default');
        contributions = 0;
      }

      // Intentar obtener temas (usar tabla disponible o 0)
      try {
        // Usar temas_conversacion con creador_id según el esquema de BD
        const { data: temasData, error: temasError } = await supabase
          .from('temas_conversacion')
          .select('id')
          .eq('creador_id', userId);

        if (!temasError && temasData) {
          temas = temasData.length;
          console.log('✅ getUserStats - Temas found:', temas);
        }
      } catch (error) {
        console.log('⚠️ getUserStats - Temas table not accessible, using default');
        temas = 0;
      }

      // Intentar obtener palabras guardadas
      try {
        const { data: savedWordsData, error: savedWordsError } = await supabase
          .from('palabras_guardadas')
          .select('id')
          .eq('usuario_id', userId);

        if (!savedWordsError && savedWordsData) {
          savedWords = savedWordsData.length;
          console.log('✅ getUserStats - Saved words found:', savedWords);
        }
      } catch (error) {
        console.log('⚠️ getUserStats - Saved words table not accessible, using default');
        savedWords = 0;
      }

      const stats = {
        contributions,
        temas,
        savedWords
      };

      console.log('✅ getUserStats - Final stats:', stats);
      return stats;

    } catch (error) {
      console.error('❌ getUserStats - Error general:', error);
      // Retornar estadísticas por defecto en caso de error
      return {
        contributions: 0,
        temas: 0,
        savedWords: 0
      };
    }
  }

  /**
   * Obtener palabras guardadas por el usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de palabras guardadas
   */
  async getSavedWords(userId) {
    try {
      const { data: savedWords, error } = await supabase
        .from('palabras_guardadas')
        .select(`
          id,
          fecha_creacion,
          diccionario (
            id,
            word,
            definition,
            info_gramatical
          )
        `)
        .eq('usuario_id', userId)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      return savedWords || [];
    } catch (error) {
      console.error('Error obteniendo palabras guardadas:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
