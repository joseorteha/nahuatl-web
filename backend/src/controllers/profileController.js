// controllers/profileController.js
const { supabase } = require('../config/database');

// Funciones auxiliares para calcular niveles
function calcularNivelConocimiento(puntos) {
  if (puntos >= 1000) return 'experto';
  if (puntos >= 500) return 'maestro';
  if (puntos >= 200) return 'conocedor';
  if (puntos >= 50) return 'estudiante';
  return 'principiante';
}

function obtenerSiguienteNivelConocimiento(nivelActual) {
  const niveles = ['principiante', 'estudiante', 'conocedor', 'maestro', 'experto'];
  const indiceActual = niveles.indexOf(nivelActual);
  return indiceActual < niveles.length - 1 ? niveles[indiceActual + 1] : null;
}

function obtenerPuntosParaSiguienteNivel(nivelActual, puntosActuales) {
  const umbrales = {
    'principiante': 50,
    'estudiante': 200,
    'conocedor': 500,
    'maestro': 1000,
    'experto': null
  };
  
  const siguienteNivel = obtenerSiguienteNivelConocimiento(nivelActual);
  if (!siguienteNivel) return 0;
  
  const puntosNecesarios = umbrales[siguienteNivel];
  return Math.max(0, puntosNecesarios - puntosActuales);
}

function calcularNivelComunidad(puntos) {
  if (puntos >= 500) return 'embajador';
  if (puntos >= 200) return 'lider';
  if (puntos >= 100) return 'influencer';
  if (puntos >= 50) return 'participante';
  return 'novato';
}

function obtenerSiguienteNivelComunidad(nivelActual) {
  const niveles = ['novato', 'participante', 'influencer', 'lider', 'embajador'];
  const indiceActual = niveles.indexOf(nivelActual);
  return indiceActual < niveles.length - 1 ? niveles[indiceActual + 1] : null;
}

function obtenerPuntosParaSiguienteNivelComunidad(nivelActual, puntosActuales) {
  const umbrales = {
    'novato': 50,
    'participante': 100,
    'influencer': 200,
    'lider': 500,
    'embajador': null
  };
  
  const siguienteNivel = obtenerSiguienteNivelComunidad(nivelActual);
  if (!siguienteNivel) return 0;
  
  const puntosNecesarios = umbrales[siguienteNivel];
  return Math.max(0, puntosNecesarios - puntosActuales);
}

function calcularProgresoPorcentaje(puntos, nivel) {
  const umbrales = {
    'principiante': { min: 0, max: 50 },
    'estudiante': { min: 50, max: 200 },
    'conocedor': { min: 200, max: 500 },
    'maestro': { min: 500, max: 1000 },
    'experto': { min: 1000, max: null }
  };
  
  const umbral = umbrales[nivel];
  if (!umbral) return 100;
  
  const progreso = umbral.max ? 
    ((puntos - umbral.min) / (umbral.max - umbral.min)) * 100 : 100;
  
  return Math.min(100, Math.max(0, progreso));
}

function calcularProgresoPorcentajeComunidad(puntos, nivel) {
  const umbrales = {
    'novato': { min: 0, max: 50 },
    'participante': { min: 50, max: 100 },
    'influencer': { min: 100, max: 200 },
    'lider': { min: 200, max: 500 },
    'embajador': { min: 500, max: null }
  };
  
  const umbral = umbrales[nivel];
  if (!umbral) return 100;
  
  const progreso = umbral.max ? 
    ((puntos - umbral.min) / (umbral.max - umbral.min)) * 100 : 100;
  
  return Math.min(100, Math.max(0, progreso));
}

class ProfileController {
  /**
   * Obtener datos específicos del sistema de conocimiento
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async obtenerConocimiento(req, res) {
    try {
      const { userId } = req.params;
      
      // Debug logs
      console.log('Debug - req.user:', req.user);
      console.log('Debug - userId from params:', userId);
      
      // Verificar permisos
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'No autenticado',
          message: 'Debes iniciar sesión para acceder a este recurso'
        });
      }
      
      if (req.user.id !== userId && req.user.rol !== 'admin') {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permisos para acceder a estos datos' 
        });
      }

      // Obtener datos de conocimiento del usuario
      const { data: recompensas, error: recompensasError } = await supabase
        .from('recompensas_usuario')
        .select('puntos_conocimiento, contribuciones_aprobadas, nivel')
        .eq('usuario_id', userId)
        .single();

      if (recompensasError && recompensasError.code !== 'PGRST116') {
        throw recompensasError;
      }

      // Obtener contribuciones del usuario
      const { data: contribuciones, error: contribucionesError } = await supabase
        .from('contribuciones_diccionario')
        .select('*')
        .eq('usuario_id', userId)
        .order('fecha_creacion', { ascending: false });

      if (contribucionesError) {
        throw contribucionesError;
      }

      // Obtener palabras guardadas
      const { data: palabrasGuardadas, error: palabrasError } = await supabase
        .from('palabras_guardadas')
        .select(`
          id,
          fecha_creacion,
          diccionario:diccionario(
            id,
            word,
            definition,
            info_gramatical
          )
        `)
        .eq('usuario_id', userId)
        .order('fecha_creacion', { ascending: false })
        .limit(10);

      if (palabrasError) {
        throw palabrasError;
      }

      // Obtener datos de lecciones (simulado por ahora)
      const leccionesCompletadas = 0; // TODO: Implementar cuando exista tabla de lecciones
      const evaluacionesAprobadas = 0; // TODO: Implementar cuando exista tabla de evaluaciones

      // Obtener logros de conocimiento
      const { data: logros, error: logrosError } = await supabase
        .from('logros_usuario')
        .select(`
          fecha_obtenido,
          logros (
            id,
            nombre,
            descripcion,
            icono,
            categoria,
            puntos_otorgados
          )
        `)
        .eq('usuario_id', userId)
        .eq('logros.categoria', 'conocimiento')
        .order('fecha_obtenido', { ascending: false });

      if (logrosError) {
        throw logrosError;
      }

      // Obtener historial de puntos de conocimiento
      const { data: historial, error: historialError } = await supabase
        .from('historial_puntos')
        .select('*')
        .eq('usuario_id', userId)
        .in('motivo', [
          'contribucion_diccionario',
          'contribucion_aprobada',
          'palabra_guardada',
          'leccion_completada',
          'evaluacion_aprobada'
        ])
        .order('fecha_creacion', { ascending: false })
        .limit(20);

      if (historialError) {
        throw historialError;
      }

      // Calcular puntos de conocimiento desde el historial
      const puntosConocimientoHistorial = historial?.reduce((total, h) => {
        if (['contribucion_aprobada', 'palabra_guardada', 'leccion_completada', 'evaluacion_aprobada'].includes(h.motivo)) {
          return total + h.puntos_ganados;
        }
        return total;
      }, 0) || 0;
      
      // Usar los puntos del historial si son mayores que los de recompensas
      const puntosConocimiento = Math.max(puntosConocimientoHistorial, recompensas?.puntos_conocimiento || 0);
      const nivelConocimiento = calcularNivelConocimiento(puntosConocimiento);
      const siguienteNivel = obtenerSiguienteNivelConocimiento(nivelConocimiento);
      const puntosParaSiguiente = obtenerPuntosParaSiguienteNivel(nivelConocimiento, puntosConocimiento);

      // Estadísticas
      const totalContribuciones = contribuciones?.length || 0;
      const contribucionesAprobadas = contribuciones?.filter(c => c.estado === 'aprobada' || c.estado === 'publicada').length || 0;
      const contribucionesPendientes = contribuciones?.filter(c => c.estado === 'pendiente').length || 0;
      const contribucionesRechazadas = contribuciones?.filter(c => c.estado === 'rechazada').length || 0;
      const palabrasGuardadasCount = palabrasGuardadas?.length || 0;

      res.json({
        success: true,
        data: {
          // Puntos y nivel
          puntos_conocimiento: puntosConocimiento,
          nivel_conocimiento: nivelConocimiento,
          siguiente_nivel: siguienteNivel,
          puntos_para_siguiente: puntosParaSiguiente,
          progreso_porcentaje: calcularProgresoPorcentaje(puntosConocimiento, nivelConocimiento),
          
          // Estadísticas
          total_contribuciones: totalContribuciones,
          contribuciones_aprobadas: contribucionesAprobadas,
          contribuciones_pendientes: contribucionesPendientes,
          contribuciones_rechazadas: contribucionesRechazadas,
          palabras_guardadas: palabrasGuardadasCount,
          lecciones_completadas: leccionesCompletadas,
          evaluaciones_aprobadas: evaluacionesAprobadas,
          
          // Logros
          logros_conocimiento: (() => {
            console.log('Debug - logros:', logros);
            return logros?.filter(l => l.logros).map(l => ({
              id: l.logros.id,
              nombre: l.logros.nombre,
              descripcion: l.logros.descripcion,
              icono: l.logros.icono,
              puntos_otorgados: l.logros.puntos_otorgados,
              fecha_obtenido: l.fecha_obtenido
            })) || [];
          })(),
          
          // Historial
          historial_conocimiento: historial?.filter(h => h).map(h => ({
            id: h.id,
            puntos_ganados: h.puntos_ganados,
            motivo: h.motivo,
            descripcion: h.descripcion,
            fecha_creacion: h.fecha_creacion
          })) || [],
          
          // Contribuciones recientes
          contribuciones_recientes: contribuciones?.filter(c => c).slice(0, 5).map(c => ({
            id: c.id,
            word: c.word,
            definition: c.definition,
            estado: c.estado,
            fecha_creacion: c.fecha_creacion,
            info_gramatical: c.info_gramatical,
            razon_contribucion: c.razon_contribucion
          })) || [],
          
          // Palabras guardadas recientes
          palabras_guardadas_recientes: palabrasGuardadas?.filter(p => p.diccionario).slice(0, 5).map(p => ({
            id: p.id,
            word: p.diccionario.word,
            definition: p.diccionario.definition,
            info_gramatical: p.diccionario.info_gramatical,
            fecha_guardado: p.fecha_creacion
          })) || []
        }
      });

    } catch (error) {
      console.error('Error obteniendo datos de conocimiento:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * Obtener datos específicos del sistema social/comunidad
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async obtenerComunidad(req, res) {
    try {
      const { userId } = req.params;
      
      // Verificar permisos
      if (req.user.id !== userId && req.user.rol !== 'admin') {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permisos para acceder a estos datos' 
        });
      }

      // Obtener datos sociales del usuario
      const { data: recompensas, error: recompensasError } = await supabase
        .from('recompensas_usuario')
        .select('experiencia_social, likes_recibidos, ranking_semanal, ranking_mensual, ranking_anual')
        .eq('usuario_id', userId)
        .single();

      if (recompensasError && recompensasError.code !== 'PGRST116') {
        throw recompensasError;
      }

      // Obtener datos de ranking social
      const { data: ranking, error: rankingError } = await supabase
        .from('ranking_social')
        .select('*')
        .eq('usuario_id', userId)
        .order('fecha_actualizacion', { ascending: false })
        .limit(1);

      if (rankingError) {
        throw rankingError;
      }

      // Obtener temas creados por el usuario
      const { data: temas, error: temasError } = await supabase
        .from('temas_conversacion')
        .select('id, titulo, contador_likes, compartido_contador, fecha_creacion')
        .eq('creador_id', userId)
        .eq('es_tema_principal', true)
        .order('fecha_creacion', { ascending: false });

      if (temasError) {
        throw temasError;
      }

      // Obtener likes dados en temas
      const { data: likesDados, error: likesError } = await supabase
        .from('temas_likes')
        .select('id, fecha_creacion')
        .eq('usuario_id', userId);

      if (likesError) {
        throw likesError;
      }

      // Obtener respuestas creadas en temas
      const { data: respuestas, error: respuestasError } = await supabase
        .from('temas_conversacion')
        .select('id, fecha_creacion')
        .eq('creador_id', userId)
        .eq('es_respuesta', true);

      if (respuestasError) {
        throw respuestasError;
      }

      // Obtener contenido compartido en temas
      const { data: compartidos, error: compartidosError } = await supabase
        .from('temas_shares')
        .select('id, fecha_creacion')
        .eq('usuario_id', userId);

      if (compartidosError) {
        throw compartidosError;
      }

      // Obtener seguidores del usuario
      const { data: seguidores, error: seguidoresError } = await supabase
        .from('seguimientos_usuarios')
        .select(`
          id,
          fecha_seguimiento,
          seguidor:seguidor_id (
            id,
            nombre_completo,
            username,
            url_avatar
          )
        `)
        .eq('seguido_id', userId)
        .order('fecha_seguimiento', { ascending: false });

      if (seguidoresError) {
        throw seguidoresError;
      }

      // Obtener usuarios que sigue
      const { data: seguidos, error: seguidosError } = await supabase
        .from('seguimientos_usuarios')
        .select(`
          id,
          fecha_seguimiento,
          seguido:seguido_id (
            id,
            nombre_completo,
            username,
            url_avatar
          )
        `)
        .eq('seguidor_id', userId)
        .order('fecha_seguimiento', { ascending: false });

      if (seguidosError) {
        throw seguidosError;
      }

      // Obtener logros de comunidad
      const { data: logros, error: logrosError } = await supabase
        .from('logros_usuario')
        .select(`
          fecha_obtenido,
          logros (
            id,
            nombre,
            descripcion,
            icono,
            categoria,
            puntos_otorgados
          )
        `)
        .eq('usuario_id', userId)
        .eq('logros.categoria', 'comunidad')
        .order('fecha_obtenido', { ascending: false });

      if (logrosError) {
        throw logrosError;
      }

      // Obtener historial de experiencia social
      const { data: historial, error: historialError } = await supabase
        .from('historial_puntos')
        .select('*')
        .eq('usuario_id', userId)
        .in('motivo', [
          'tema_creado',
          'like_dado',
          'like_recibido',
          'share_dado',
          'share_recibido',
          'respuesta_creada',
          'feedback_enviado',
          'mencion_usuario'
        ])
        .order('fecha_creacion', { ascending: false })
        .limit(20);

      if (historialError) {
        throw historialError;
      }

      // Calcular nivel de comunidad
      const experienciaSocial = recompensas?.experiencia_social || 0;
      const nivelComunidad = calcularNivelComunidad(experienciaSocial);
      const siguienteNivel = obtenerSiguienteNivelComunidad(nivelComunidad);
      const puntosParaSiguiente = obtenerPuntosParaSiguienteNivelComunidad(nivelComunidad, experienciaSocial);

      // Estadísticas
      const totalTemas = temas?.length || 0;
      const totalLikesDados = likesDados?.length || 0;
      const totalLikesRecibidos = recompensas?.likes_recibidos || 0;
      const totalRespuestas = respuestas?.length || 0;
      const totalCompartidos = compartidos?.length || 0;
      const rankingSemanal = recompensas?.ranking_semanal || 0;
      const rankingMensual = recompensas?.ranking_mensual || 0;

      res.json({
        success: true,
        data: {
          // Puntos y nivel
          experiencia_social: experienciaSocial,
          nivel_comunidad: nivelComunidad,
          siguiente_nivel: siguienteNivel,
          puntos_para_siguiente: puntosParaSiguiente,
          progreso_porcentaje: calcularProgresoPorcentajeComunidad(experienciaSocial, nivelComunidad),
          
          // Estadísticas
          total_feedbacks: totalTemas,
          likes_dados: totalLikesDados,
          likes_recibidos: totalLikesRecibidos,
          respuestas_creadas: totalRespuestas,
          contenido_compartido: totalCompartidos,
          
          // Rankings
          ranking_semanal: rankingSemanal,
          ranking_mensual: rankingMensual,
          ranking_anual: recompensas?.ranking_anual || 0,
          
          // Seguimiento
          seguidores: seguidores?.filter(s => s.seguidor) || [],
          seguidos: seguidos?.filter(s => s.seguido) || [],
          total_seguidores: seguidores?.length || 0,
          total_seguidos: seguidos?.length || 0,
          
          // Logros
          logros_comunidad: logros?.filter(l => l.logros).map(l => ({
            id: l.logros.id,
            nombre: l.logros.nombre,
            descripcion: l.logros.descripcion,
            icono: l.logros.icono,
            puntos_otorgados: l.logros.puntos_otorgados,
            fecha_obtenido: l.fecha_obtenido
          })) || [],
          
          // Historial
          historial_comunidad: historial?.filter(h => h).map(h => ({
            id: h.id,
            puntos_ganados: h.puntos_ganados,
            motivo: h.motivo,
            descripcion: h.descripcion,
            fecha_creacion: h.fecha_creacion
          })) || [],
          
          // Temas recientes
          feedbacks_recientes: temas?.filter(t => t).slice(0, 5).map(t => ({
            id: t.id,
            titulo: t.titulo,
            likes: t.contador_likes,
            compartidos: t.compartido_contador,
            fecha_creacion: t.fecha_creacion
          })) || []
        }
      });

    } catch (error) {
      console.error('Error obteniendo datos de comunidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }

  /**
   * Obtener resumen general del perfil (ambos sistemas)
   * @param {Request} req - Objeto de request
   * @param {Response} res - Objeto de response
   */
  async obtenerResumen(req, res) {
    try {
      const { userId } = req.params;
      
      // Verificar permisos
      if (req.user.id !== userId && req.user.rol !== 'admin') {
        return res.status(403).json({ 
          success: false,
          error: 'No tienes permisos para acceder a estos datos' 
        });
      }

      // Obtener datos del perfil
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('nombre_completo, username, url_avatar, biografia, verificado, fecha_creacion')
        .eq('id', userId)
        .single();

      if (perfilError) {
        throw perfilError;
      }

      // Obtener datos de recompensas
      const { data: recompensas, error: recompensasError } = await supabase
        .from('recompensas_usuario')
        .select('puntos_conocimiento, experiencia_social, nivel')
        .eq('usuario_id', userId)
        .single();

      if (recompensasError && recompensasError.code !== 'PGRST116') {
        throw recompensasError;
      }

      // Obtener estadísticas básicas
      const { data: contribuciones, error: contribucionesError } = await supabase
        .from('contribuciones_diccionario')
        .select('estado')
        .eq('usuario_id', userId);

      if (contribucionesError) {
        throw contribucionesError;
      }

      const { data: feedbacks, error: feedbacksError } = await supabase
        .from('retroalimentacion')
        .select('id')
        .eq('usuario_id', userId);

      if (feedbacksError) {
        throw feedbacksError;
      }

      res.json({
        success: true,
        data: {
          // Información del perfil
          perfil: {
            nombre_completo: perfil.nombre_completo,
            username: perfil.username,
            url_avatar: perfil.url_avatar,
            biografia: perfil.biografia,
            verificado: perfil.verificado,
            fecha_creacion: perfil.fecha_creacion
          },
          
          // Resumen de puntos
          puntos: {
            conocimiento: recompensas?.puntos_conocimiento || 0,
            comunidad: recompensas?.experiencia_social || 0,
            total: (recompensas?.puntos_conocimiento || 0) + (recompensas?.experiencia_social || 0)
          },
          
          // Niveles
          niveles: {
            conocimiento: calcularNivelConocimiento(recompensas?.puntos_conocimiento || 0),
            comunidad: calcularNivelComunidad(recompensas?.experiencia_social || 0)
          },
          
          // Estadísticas básicas
          estadisticas: {
            contribuciones_aprobadas: contribuciones?.filter(c => c.estado === 'aprobada').length || 0,
            total_contribuciones: contribuciones?.length || 0,
            total_feedbacks: feedbacks?.length || 0
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo resumen del perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  }


  calcularProgresoPorcentaje(puntos, nivel) {
    const umbrales = {
      'principiante': { min: 0, max: 100 },
      'estudiante': { min: 100, max: 300 },
      'conocedor': { min: 300, max: 600 },
      'maestro': { min: 600, max: 1000 },
      'experto': { min: 1000, max: 1000 }
    };
    
    const umbral = umbrales[nivel];
    if (!umbral) return 100;
    
    const progreso = ((puntos - umbral.min) / (umbral.max - umbral.min)) * 100;
    return Math.min(100, Math.max(0, progreso));
  }

  calcularProgresoPorcentajeComunidad(puntos, nivel) {
    const umbrales = {
      'novato': { min: 0, max: 50 },
      'participante': { min: 50, max: 150 },
      'influencer': { min: 150, max: 300 },
      'lider': { min: 300, max: 500 },
      'embajador': { min: 500, max: 500 }
    };
    
    const umbral = umbrales[nivel];
    if (!umbral) return 100;
    
    const progreso = ((puntos - umbral.min) / (umbral.max - umbral.min)) * 100;
    return Math.min(100, Math.max(0, progreso));
  }

  calcularNivelConocimiento(puntos) {
    if (puntos >= 1000) return 'experto';
    if (puntos >= 500) return 'maestro';
    if (puntos >= 200) return 'conocedor';
    if (puntos >= 50) return 'estudiante';
    return 'principiante';
  }

  obtenerSiguienteNivelConocimiento(nivelActual) {
    const niveles = ['principiante', 'estudiante', 'conocedor', 'maestro', 'experto'];
    const indiceActual = niveles.indexOf(nivelActual);
    return indiceActual < niveles.length - 1 ? niveles[indiceActual + 1] : null;
  }

  obtenerPuntosParaSiguienteNivel(nivelActual, puntosActuales) {
    const umbrales = {
      'principiante': 50,
      'estudiante': 200,
      'conocedor': 500,
      'maestro': 1000,
      'experto': null
    };
    
    const siguienteNivel = this.obtenerSiguienteNivelConocimiento(nivelActual);
    if (!siguienteNivel) return 0;
    
    const puntosNecesarios = umbrales[siguienteNivel];
    return Math.max(0, puntosNecesarios - puntosActuales);
  }

  calcularNivelComunidad(puntos) {
    if (puntos >= 500) return 'embajador';
    if (puntos >= 200) return 'lider';
    if (puntos >= 100) return 'influencer';
    if (puntos >= 50) return 'participante';
    return 'novato';
  }

  obtenerSiguienteNivelComunidad(nivelActual) {
    const niveles = ['novato', 'participante', 'influencer', 'lider', 'embajador'];
    const indiceActual = niveles.indexOf(nivelActual);
    return indiceActual < niveles.length - 1 ? niveles[indiceActual + 1] : null;
  }

  obtenerPuntosParaSiguienteNivelComunidad(nivelActual, puntosActuales) {
    const umbrales = {
      'novato': 50,
      'participante': 100,
      'influencer': 200,
      'lider': 500,
      'embajador': null
    };
    
    const siguienteNivel = this.obtenerSiguienteNivelComunidad(nivelActual);
    if (!siguienteNivel) return 0;
    
    const puntosNecesarios = umbrales[siguienteNivel];
    return Math.max(0, puntosNecesarios - puntosActuales);
  }

  // Obtener perfil completo de un usuario específico
  async obtenerPerfilUsuario(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario requerido'
        });
      }

      // Obtener datos básicos del usuario
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (perfilError || !perfil) {
        return res.status(404).json({
          success: false,
          error: 'Perfil no encontrado'
        });
      }

      // Obtener puntos de recompensas
      const { data: recompensas } = await supabase
        .from('recompensas_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .single();

      const puntosConocimiento = recompensas?.puntos_conocimiento || 0;
      const experienciaSocial = recompensas?.puntos_comunidad || 0;

      // Calcular niveles
      const nivelConocimiento = this.calcularNivelConocimiento(puntosConocimiento);
      const nivelSocial = this.calcularNivelComunidad(experienciaSocial);

      // Obtener estadísticas de temas
      const { data: temasCreados } = await supabase
        .from('temas_conversacion')
        .select('id, titulo, categoria, fecha_creacion, respuestas_count, contador_likes')
        .eq('creador_id', userId)
        .is('tema_padre_id', null)
        .order('fecha_creacion', { ascending: false })
        .limit(5);

      const { data: respuestasCreadas } = await supabase
        .from('temas_conversacion')
        .select('id')
        .eq('creador_id', userId)
        .not('tema_padre_id', 'is', null);

      // Obtener likes dados y recibidos
      const { data: likesDados } = await supabase
        .from('temas_likes')
        .select('id')
        .eq('usuario_id', userId);

      const { data: likesRecibidos } = await supabase
        .from('temas_likes')
        .select('id, temas_conversacion!inner(creador_id)')
        .eq('temas_conversacion.creador_id', userId);

      // Obtener shares dados y recibidos
      const { data: sharesDados } = await supabase
        .from('temas_shares')
        .select('id')
        .eq('usuario_id', userId);

      const { data: sharesRecibidos } = await supabase
        .from('temas_shares')
        .select('id, temas_conversacion!inner(creador_id)')
        .eq('temas_conversacion.creador_id', userId);

      // Obtener logros recientes
      const { data: logrosRecientes } = await supabase
        .from('logros_usuario')
        .select(`
          fecha_obtenido,
          logros (
            id,
            nombre,
            descripcion,
            icono
          )
        `)
        .eq('usuario_id', userId)
        .order('fecha_obtenido', { ascending: false })
        .limit(5);

      // Obtener rankings (simulados por ahora)
      const rankings = {
        semanal: Math.floor(Math.random() * 50) + 1,
        mensual: Math.floor(Math.random() * 100) + 1,
        anual: Math.floor(Math.random() * 200) + 1
      };

      res.json({
        success: true,
        data: {
          id: perfil.id,
          nombre_completo: perfil.nombre_completo,
          username: perfil.username,
          email: perfil.email,
          url_avatar: perfil.url_avatar,
          fecha_registro: perfil.fecha_creacion,
          ultima_actividad: perfil.fecha_actualizacion,
          biografia: perfil.biografia,
          ubicacion: perfil.ubicacion,
          sitio_web: perfil.sitio_web,
          verificado: perfil.verificado,
          experiencia_social: experienciaSocial,
          puntos_conocimiento: puntosConocimiento,
          nivel_conocimiento: nivelConocimiento,
          nivel_social: nivelSocial,
          configuraciones: {
            privacidad_perfil: perfil.privacidad_perfil,
            mostrar_puntos: perfil.mostrar_puntos,
            mostrar_nivel: perfil.mostrar_nivel,
            notificaciones_email: perfil.notificaciones_email,
            notificaciones_push: perfil.notificaciones_push
          },
          estadisticas: {
            temas_creados: temasCreados?.length || 0,
            respuestas_creadas: respuestasCreadas?.length || 0,
            likes_dados: likesDados?.length || 0,
            likes_recibidos: likesRecibidos?.length || 0,
            shares_dados: sharesDados?.length || 0,
            shares_recibidos: sharesRecibidos?.length || 0
          },
          rankings,
          logros_recientes: logrosRecientes?.map(l => ({
            id: l.logros.id,
            nombre: l.logros.nombre,
            descripcion: l.logros.descripcion,
            icono: l.logros.icono,
            fecha_obtenido: l.fecha_obtenido
          })) || [],
          temas_recientes: temasCreados?.map(t => ({
            id: t.id,
            titulo: t.titulo,
            categoria: t.categoria,
            fecha_creacion: t.fecha_creacion,
            respuestas_count: t.respuestas_count,
            contador_likes: t.contador_likes
          })) || []
        }
      });
    } catch (error) {
      console.error('Error en obtenerPerfilUsuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = ProfileController;
