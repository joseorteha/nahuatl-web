// services/logrosService.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

class LogrosService {
  /**
   * Verifica y otorga logros automáticamente basado en las contribuciones del usuario
   * @param {string} userId - ID del usuario
   * @param {string} tipoAccion - Tipo de acción realizada
   * @param {Object} datosAccion - Datos adicionales de la acción
   */
  async verificarLogrosAutomaticos(userId, tipoAccion, datosAccion = {}) {
    try {
      console.log(`🔍 Verificando logros para usuario ${userId}, acción: ${tipoAccion}`);
      
      // Obtener logros disponibles para el tipo de acción
      const logrosDisponibles = await this.obtenerLogrosPorTipo(tipoAccion);
      
      if (!logrosDisponibles || logrosDisponibles.length === 0) {
        console.log(`❌ No hay logros disponibles para el tipo: ${tipoAccion}`);
        return [];
      }

      // Obtener logros ya obtenidos por el usuario
      const logrosObtenidos = await this.obtenerLogrosUsuario(userId);
      const logrosObtenidosIds = logrosObtenidos.map(l => l.logro_id);

      // Obtener estadísticas actuales del usuario
      const estadisticas = await this.obtenerEstadisticasUsuario(userId, tipoAccion);
      
      const logrosNuevos = [];

      // Verificar cada logro disponible
      for (const logro of logrosDisponibles) {
        // Saltar si ya tiene este logro
        if (logrosObtenidosIds.includes(logro.id)) {
          continue;
        }

        // Verificar si cumple la condición
        const cumpleCondicion = await this.verificarCondicionLogro(
          logro, 
          estadisticas, 
          tipoAccion, 
          datosAccion
        );

        if (cumpleCondicion) {
          // Otorgar el logro
          const logroOtorgado = await this.otorgarLogro(userId, logro.id);
          if (logroOtorgado) {
            logrosNuevos.push(logroOtorgado);
            console.log(`✅ Logro otorgado: ${logro.nombre} a usuario ${userId}`);
          }
        }
      }

      return logrosNuevos;
    } catch (error) {
      console.error('❌ Error verificando logros automáticos:', error);
      return [];
    }
  }

  /**
   * Obtiene logros disponibles para un tipo de acción específico
   */
  async obtenerLogrosPorTipo(tipoAccion) {
    try {
      const { data, error } = await supabase
        .from('logros')
        .select('*')
        .eq('categoria', this.mapearTipoAccionACategoria(tipoAccion))
        .order('condicion_valor', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo logros por tipo:', error);
      return [];
    }
  }

  /**
   * Obtiene logros ya obtenidos por el usuario
   */
  async obtenerLogrosUsuario(userId) {
    try {
      const { data, error } = await supabase
        .from('logros_usuario')
        .select('logro_id')
        .eq('usuario_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo logros del usuario:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas actuales del usuario
   */
  async obtenerEstadisticasUsuario(userId, tipoAccion) {
    try {
      const estadisticas = {};

      // Obtener contribuciones
      const { data: contribuciones, error: contribucionesError } = await supabase
        .from('contribuciones_diccionario')
        .select('id, estado, fecha_creacion')
        .eq('usuario_id', userId);

      if (!contribucionesError) {
        estadisticas.total_contribuciones = contribuciones?.length || 0;
        estadisticas.contribuciones_aprobadas = contribuciones?.filter(c => 
          c.estado === 'aprobada' || c.estado === 'publicada'
        ).length || 0;
        estadisticas.primera_contribucion = contribuciones?.length > 0;
      }

      // Obtener palabras guardadas
      const { data: palabrasGuardadas, error: palabrasError } = await supabase
        .from('palabras_guardadas')
        .select('id')
        .eq('usuario_id', userId);

      if (!palabrasError) {
        estadisticas.palabras_guardadas = palabrasGuardadas?.length || 0;
      }

      // Obtener temas de conversación
      const { data: temas, error: temasError } = await supabase
        .from('temas_conversacion')
        .select('id')
        .eq('creador_id', userId)
        .eq('es_tema_principal', true);

      if (!temasError) {
        estadisticas.temas_creados = temas?.length || 0;
      }

      // Obtener likes recibidos
      const { data: recompensas, error: recompensasError } = await supabase
        .from('recompensas_usuario')
        .select('likes_recibidos')
        .eq('usuario_id', userId)
        .single();

      if (!recompensasError && recompensas) {
        estadisticas.likes_recibidos = recompensas.likes_recibidos || 0;
      }

      return estadisticas;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del usuario:', error);
      return {};
    }
  }

  /**
   * Verifica si el usuario cumple la condición para un logro específico
   */
  async verificarCondicionLogro(logro, estadisticas, tipoAccion, datosAccion) {
    try {
      switch (logro.condicion_tipo) {
        case 'contribuciones_cantidad':
          return estadisticas.contribuciones_aprobadas >= logro.condicion_valor;
        
        case 'primera_contribucion':
          return estadisticas.primera_contribucion && tipoAccion === 'contribucion_aprobada';
        
        case 'palabras_guardadas':
          return estadisticas.palabras_guardadas >= logro.condicion_valor;
        
        case 'feedback_cantidad':
          return estadisticas.temas_creados >= logro.condicion_valor;
        
        case 'likes_recibidos':
          return estadisticas.likes_recibidos >= logro.condicion_valor;
        
        default:
          return false;
      }
    } catch (error) {
      console.error('❌ Error verificando condición del logro:', error);
      return false;
    }
  }

  /**
   * Otorga un logro a un usuario
   */
  async otorgarLogro(userId, logroId) {
    try {
      // Verificar que no tenga ya este logro
      const { data: logroExistente, error: verificarError } = await supabase
        .from('logros_usuario')
        .select('id')
        .eq('usuario_id', userId)
        .eq('logro_id', logroId)
        .single();

      if (verificarError && verificarError.code !== 'PGRST116') {
        throw verificarError;
      }

      if (logroExistente) {
        console.log(`⚠️ Usuario ${userId} ya tiene el logro ${logroId}`);
        return null;
      }

      // Otorgar el logro
      const { data, error } = await supabase
        .from('logros_usuario')
        .insert({
          usuario_id: userId,
          logro_id: logroId,
          fecha_obtenido: new Date().toISOString(),
          notificado: false
        })
        .select()
        .single();

      if (error) throw error;

      // Obtener detalles del logro
      const { data: logroDetalle, error: logroError } = await supabase
        .from('logros')
        .select('*')
        .eq('id', logroId)
        .single();

      if (logroError) throw logroError;

      return {
        ...data,
        logros: logroDetalle
      };
    } catch (error) {
      console.error('❌ Error otorgando logro:', error);
      return null;
    }
  }

  /**
   * Mapea el tipo de acción a la categoría de logros
   */
  mapearTipoAccionACategoria(tipoAccion) {
    const mapeo = {
      'contribucion_aprobada': 'contribucion',
      'palabra_guardada': 'conocimiento',
      'tema_creado': 'comunidad',
      'like_recibido': 'comunidad',
      'feedback_enviado': 'comunidad'
    };
    
    return mapeo[tipoAccion] || 'general';
  }

  /**
   * Crea logros predefinidos si no existen
   */
  async crearLogrosPredefinidos() {
    try {
      const logrosPredefinidos = [
        // Logros de Contribución
        {
          nombre: 'Primera Contribución',
          descripcion: 'Envió su primera palabra al diccionario',
          icono: '🌟',
          categoria: 'contribucion',
          condicion_tipo: 'primera_contribucion',
          condicion_valor: 1,
          puntos_otorgados: 25
        },
        {
          nombre: 'Contribuidor Activo',
          descripcion: 'Ha enviado 5 palabras al diccionario',
          icono: '⭐',
          categoria: 'contribucion',
          condicion_tipo: 'contribuciones_cantidad',
          condicion_valor: 5,
          puntos_otorgados: 100
        },
        {
          nombre: 'Experto en Palabras',
          descripcion: 'Ha enviado 20 palabras al diccionario',
          icono: '🏆',
          categoria: 'contribucion',
          condicion_tipo: 'contribuciones_cantidad',
          condicion_valor: 20,
          puntos_otorgados: 500
        },
        {
          nombre: 'Maestro del Diccionario',
          descripcion: 'Ha enviado 50 palabras al diccionario',
          icono: '👑',
          categoria: 'contribucion',
          condicion_tipo: 'contribuciones_cantidad',
          condicion_valor: 50,
          puntos_otorgados: 1000
        },
        
        // Logros de Conocimiento
        {
          nombre: 'Coleccionista',
          descripcion: 'Ha guardado 10 palabras en su diccionario personal',
          icono: '📚',
          categoria: 'conocimiento',
          condicion_tipo: 'palabras_guardadas',
          condicion_valor: 10,
          puntos_otorgados: 50
        },
        {
          nombre: 'Bibliotecario',
          descripcion: 'Ha guardado 50 palabras en su diccionario personal',
          icono: '📖',
          categoria: 'conocimiento',
          condicion_tipo: 'palabras_guardadas',
          condicion_valor: 50,
          puntos_otorgados: 200
        },
        
        // Logros de Comunidad
        {
          nombre: 'Conversador',
          descripcion: 'Ha creado 5 temas de conversación',
          icono: '💬',
          categoria: 'comunidad',
          condicion_tipo: 'feedback_cantidad',
          condicion_valor: 5,
          puntos_otorgados: 100
        },
        {
          nombre: 'Influencer',
          descripcion: 'Ha recibido 10 likes en sus temas',
          icono: '❤️',
          categoria: 'comunidad',
          condicion_tipo: 'likes_recibidos',
          condicion_valor: 10,
          puntos_otorgados: 150
        }
      ];

      for (const logro of logrosPredefinidos) {
        // Verificar si ya existe
        const { data: logroExistente, error: verificarError } = await supabase
          .from('logros')
          .select('id')
          .eq('nombre', logro.nombre)
          .single();

        if (verificarError && verificarError.code === 'PGRST116') {
          // No existe, crear el logro
          const { error: insertError } = await supabase
            .from('logros')
            .insert(logro);

          if (insertError) {
            console.error(`❌ Error creando logro ${logro.nombre}:`, insertError);
          } else {
            console.log(`✅ Logro creado: ${logro.nombre}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error creando logros predefinidos:', error);
    }
  }
}

module.exports = new LogrosService();
