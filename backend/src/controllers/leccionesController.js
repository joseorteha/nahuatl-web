/**
 * Controlador para gestión de lecciones
 * Fase 2: Sistema de Lecciones - Backend API
 */

const { supabase } = require('../config/database');
const { validarCamposRequeridos, validarURL } = require('../utils/validaciones');
const { NotificationService } = require('../services/notificationService');

const notificationService = new NotificationService();

/**
 * Crear nueva lección (solo profesores)
 * POST /api/lecciones
 */
const crearLeccion = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      categoria,
      nivel = 'principiante',
      contenido_texto,
      contenido_nahuatl,
      objetivos_aprendizaje = [],
      palabras_clave = [],
      duracion_estimada = 15,
      orden_leccion = 1,
      estado = 'borrador',
      recursos_externos = [],
      quiz_preguntas = []
    } = req.body;

    const profesor_id = req.user.id;

    // Validar campos requeridos
    const camposRequeridos = ['titulo', 'categoria', 'contenido_texto'];
    const validacion = validarCamposRequeridos(req.body, camposRequeridos);
    if (!validacion.valido) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        detalles: validacion.faltantes
      });
    }

    // Validar categorías permitidas
    const categoriasPermitidas = ['numeros', 'colores', 'familia', 'naturaleza', 'gramatica', 'cultura', 'vocabulario'];
    if (!categoriasPermitidas.includes(categoria.toLowerCase())) {
      return res.status(400).json({
        error: 'Categoría no válida',
        categorias_permitidas: categoriasPermitidas
      });
    }

    // Crear la lección
    const leccionData = {
      titulo,
      descripcion,
      categoria: categoria.toLowerCase(),
      nivel,
      contenido_texto,
      contenido_nahuatl,
      objetivos_aprendizaje,
      palabras_clave,
      duracion_estimada: parseInt(duracion_estimada),
      orden_leccion: parseInt(orden_leccion),
      profesor_id,
      estado: estado === 'publicada' ? 'publicada' : 'borrador'
    };

    // Si se publica directamente, agregar fecha de publicación
    if (estado === 'publicada') {
      leccionData.fecha_publicacion = new Date().toISOString();
    }

    const { data: nuevaLeccion, error: errorLeccion } = await supabase
      .from('lecciones')
      .insert([leccionData])
      .select()
      .single();

    if (errorLeccion) {
      console.error('Error creando lección:', errorLeccion);
      return res.status(500).json({ error: 'Error al crear la lección' });
    }

    // Agregar recursos externos si los hay
    if (recursos_externos && recursos_externos.length > 0) {
      const recursosParaInsertar = recursos_externos.map((recurso, index) => ({
        leccion_id: nuevaLeccion.id,
        tipo_recurso: recurso.tipo_recurso,
        titulo: recurso.titulo,
        descripcion: recurso.descripcion || null,
        url: recurso.url,
        orden_visualizacion: recurso.orden_visualizacion || index + 1,
        es_opcional: recurso.es_opcional || false,
        duracion_segundos: recurso.duracion_segundos || null
      }));

      const { error: errorRecursos } = await supabase
        .from('recursos_externos')
        .insert(recursosParaInsertar);

      if (errorRecursos) {
        console.error('Error agregando recursos:', errorRecursos);
        // No fallar la operación, solo logear
      }
    }

    // Agregar preguntas de quiz si las hay
    if (quiz_preguntas && quiz_preguntas.length > 0) {
      const preguntasParaInsertar = quiz_preguntas.map((pregunta, index) => ({
        leccion_id: nuevaLeccion.id,
        pregunta: pregunta.pregunta,
        tipo_pregunta: pregunta.tipo_pregunta || 'multiple_choice',
        opciones: pregunta.opciones || null,
        respuesta_correcta: pregunta.respuesta_correcta,
        explicacion: pregunta.explicacion || null,
        puntos: pregunta.puntos || 1,
        orden_pregunta: pregunta.orden_pregunta || index + 1
      }));

      const { error: errorPreguntas } = await supabase
        .from('quiz_preguntas')
        .insert(preguntasParaInsertar);

      if (errorPreguntas) {
        console.error('Error agregando preguntas:', errorPreguntas);
        // No fallar la operación, solo logear
      }
    }

    // Obtener la lección completa con sus recursos y preguntas
    const leccionCompleta = await obtenerLeccionCompleta(nuevaLeccion.id);

    res.status(201).json({
      message: 'Lección creada exitosamente',
      leccion: leccionCompleta
    });

  } catch (error) {
    console.error('Error en crearLeccion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener lecciones públicas con filtros
 * GET /api/lecciones
 */
const obtenerLecciones = async (req, res) => {
  try {
    const { 
      categoria, 
      nivel, 
      profesor_id, 
      page = 1, 
      limit = 10,
      search = '',
      orden = 'fecha_creacion'
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('lecciones')
      .select(`
        *,
        profesor:profesor_id(nombre_completo, username, url_avatar),
        recursos_externos(id, tipo_recurso, titulo, url, es_opcional),
        quiz_preguntas(id)
      `)
      .eq('estado', 'publicada');

    // Aplicar filtros
    if (categoria) query = query.eq('categoria', categoria.toLowerCase());
    if (nivel) query = query.eq('nivel', nivel);
    if (profesor_id) query = query.eq('profesor_id', profesor_id);
    if (search) {
      query = query.or(`titulo.ilike.%${search}%, descripcion.ilike.%${search}%`);
    }

    // Aplicar ordenamiento
    const ordenesPermitidos = ['fecha_creacion', 'titulo', 'duracion_estimada', 'puntuacion_promedio'];
    if (ordenesPermitidos.includes(orden)) {
      query = query.order(orden, { ascending: orden === 'titulo' });
    } else {
      query = query.order('fecha_creacion', { ascending: false });
    }

    const { data: lecciones, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error obteniendo lecciones:', error);
      return res.status(500).json({ error: 'Error al obtener lecciones' });
    }

    // Agregar información adicional
    const leccionesConInfo = lecciones.map(leccion => ({
      ...leccion,
      total_recursos: leccion.recursos_externos?.length || 0,
      total_preguntas_quiz: leccion.quiz_preguntas?.length || 0,
      tiene_quiz: leccion.quiz_preguntas?.length > 0
    }));

    res.json({
      lecciones: leccionesConInfo,
      totalCount: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Error en obtenerLecciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener lección específica por ID
 * GET /api/lecciones/:id
 */
const obtenerLeccionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user?.id;

    console.log('🔍 Buscando lección:', id);
    console.log('👤 Usuario actual:', usuario_id ? 'Autenticado' : 'No autenticado');

    const leccion = await obtenerLeccionCompleta(id);
    
    if (!leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    // Verificar permisos: solo lecciones publicadas o del mismo profesor
    if (leccion.estado !== 'publicada' && leccion.profesor_id !== usuario_id) {
      // Verificar si es admin/moderador
      if (req.user?.rol !== 'admin' && req.user?.rol !== 'moderador') {
        return res.status(403).json({ error: 'No tienes permisos para ver esta lección' });
      }
    }

    // Si es un estudiante viendo una lección publicada, registrar/actualizar progreso
    if (usuario_id && leccion.estado === 'publicada' && leccion.profesor_id !== usuario_id) {
      await registrarInicioLeccion(usuario_id, id);
    }

    res.json({ leccion });

  } catch (error) {
    console.error('Error en obtenerLeccionPorId:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener lecciones del profesor autenticado
 * GET /api/lecciones/mis-lecciones
 */
const obtenerMisLecciones = async (req, res) => {
  try {
    const profesor_id = req.user.id;
    const { estado = 'todas', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('lecciones')
      .select(`
        *,
        recursos_externos(id, tipo_recurso, titulo),
        quiz_preguntas(id),
        progreso_lecciones(estado_leccion)
      `)
      .eq('profesor_id', profesor_id)
      .order('fecha_creacion', { ascending: false })
      .range(offset, offset + limit - 1);

    if (estado !== 'todas') {
      query = query.eq('estado', estado);
    }

    const { data: lecciones, error, count } = await query;

    if (error) {
      console.error('Error obteniendo mis lecciones:', error);
      return res.status(500).json({ error: 'Error al obtener lecciones' });
    }

    // Agregar estadísticas
    const leccionesConStats = lecciones.map(leccion => {
      const progesos = leccion.progreso_lecciones || [];
      return {
        ...leccion,
        total_recursos: leccion.recursos_externos?.length || 0,
        total_preguntas: leccion.quiz_preguntas?.length || 0,
        estudiantes_total: progesos.length,
        estudiantes_completados: progesos.filter(p => p.estado_leccion === 'completada').length
      };
    });

    res.json({
      lecciones: leccionesConStats,
      totalCount: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Error en obtenerMisLecciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Actualizar lección (solo el profesor propietario)
 * PUT /api/lecciones/:id
 */
const actualizarLeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor_id = req.user.id;
    const datosActualizacion = req.body;

    console.log('📝 Actualizando lección:', id);

    // Verificar que la lección existe y pertenece al profesor
    const { data: leccionExistente, error: errorVerificacion } = await supabase
      .from('lecciones')
      .select('profesor_id, estado')
      .eq('id', id)
      .single();

    if (errorVerificacion || !leccionExistente) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    if (leccionExistente.profesor_id !== profesor_id) {
      // Verificar si es admin/moderador
      if (req.user.rol !== 'admin' && req.user.rol !== 'moderador') {
        return res.status(403).json({ error: 'No tienes permisos para editar esta lección' });
      }
    }

    // Preparar datos para actualización
    const camposPermitidos = [
      'titulo', 'descripcion', 'categoria', 'nivel', 'contenido_texto', 
      'contenido_nahuatl', 'objetivos_aprendizaje', 'palabras_clave', 
      'duracion_estimada', 'orden_leccion'
    ];

    const datosLimpios = {};
    camposPermitidos.forEach(campo => {
      if (datosActualizacion[campo] !== undefined) {
        datosLimpios[campo] = datosActualizacion[campo];
      }
    });

    datosLimpios.fecha_actualizacion = new Date().toISOString();

    // Actualizar lección
    const { data: leccionActualizada, error: errorActualizacion } = await supabase
      .from('lecciones')
      .update(datosLimpios)
      .eq('id', id)
      .select()
      .single();

    if (errorActualizacion) {
      console.error('Error actualizando lección:', errorActualizacion);
      return res.status(500).json({ error: 'Error al actualizar la lección' });
    }

    // ========== SINCRONIZAR RECURSOS EXTERNOS ==========
    if (datosActualizacion.recursos_externos !== undefined) {
      console.log('🔄 Sincronizando recursos externos...');
      
      // Obtener recursos actuales
      const { data: recursosActuales } = await supabase
        .from('recursos_externos')
        .select('id')
        .eq('leccion_id', id);

      const idsActuales = recursosActuales?.map(r => r.id) || [];
      const recursosNuevos = datosActualizacion.recursos_externos;

      // IDs que vienen del frontend
      const idsEnviados = recursosNuevos
        .filter(r => r.id)
        .map(r => r.id);

      // Eliminar recursos que ya no están
      const idsAEliminar = idsActuales.filter(id => !idsEnviados.includes(id));
      if (idsAEliminar.length > 0) {
        await supabase
          .from('recursos_externos')
          .delete()
          .in('id', idsAEliminar);
        console.log(`🗑️  Eliminados ${idsAEliminar.length} recursos`);
      }

      // Actualizar o crear recursos
      for (const recurso of recursosNuevos) {
        const recursoData = {
          leccion_id: id,
          tipo_recurso: recurso.tipo_recurso || recurso.tipo,
          titulo: recurso.titulo,
          descripcion: recurso.descripcion || null,
          url: recurso.url,
          orden_visualizacion: recurso.orden_visualizacion || recurso.orden || 1,
          es_opcional: recurso.es_opcional || false,
          duracion_segundos: recurso.duracion_segundos || null
        };

        if (recurso.id) {
          // Actualizar existente
          await supabase
            .from('recursos_externos')
            .update(recursoData)
            .eq('id', recurso.id);
        } else {
          // Crear nuevo
          await supabase
            .from('recursos_externos')
            .insert([recursoData]);
        }
      }
      console.log(`✅ Sincronizados ${recursosNuevos.length} recursos`);
    }

    // ========== SINCRONIZAR QUIZ PREGUNTAS ==========
    if (datosActualizacion.quiz_preguntas !== undefined) {
      console.log('🔄 Sincronizando preguntas de quiz...');
      
      // Obtener preguntas actuales
      const { data: preguntasActuales } = await supabase
        .from('quiz_preguntas')
        .select('id')
        .eq('leccion_id', id);

      const idsActuales = preguntasActuales?.map(p => p.id) || [];
      const preguntasNuevas = datosActualizacion.quiz_preguntas;

      // IDs que vienen del frontend
      const idsEnviados = preguntasNuevas
        .filter(p => p.id)
        .map(p => p.id);

      // Eliminar preguntas que ya no están
      const idsAEliminar = idsActuales.filter(id => !idsEnviados.includes(id));
      if (idsAEliminar.length > 0) {
        await supabase
          .from('quiz_preguntas')
          .delete()
          .in('id', idsAEliminar);
        console.log(`🗑️  Eliminadas ${idsAEliminar.length} preguntas`);
      }

      // Actualizar o crear preguntas
      for (const pregunta of preguntasNuevas) {
        const preguntaData = {
          leccion_id: id,
          pregunta: pregunta.pregunta,
          tipo_pregunta: pregunta.tipo_pregunta || 'multiple_choice',
          opciones: pregunta.opciones || null,
          respuesta_correcta: pregunta.respuesta_correcta,
          explicacion: pregunta.explicacion || null,
          puntos: pregunta.puntos || 1,
          orden_pregunta: pregunta.orden_pregunta || pregunta.orden || 1
        };

        if (pregunta.id) {
          // Actualizar existente
          await supabase
            .from('quiz_preguntas')
            .update(preguntaData)
            .eq('id', pregunta.id);
        } else {
          // Crear nueva
          await supabase
            .from('quiz_preguntas')
            .insert([preguntaData]);
        }
      }
      console.log(`✅ Sincronizadas ${preguntasNuevas.length} preguntas`);
    }

    // Obtener lección completa actualizada
    const leccionCompleta = await obtenerLeccionCompleta(id);

    res.json({
      message: 'Lección actualizada exitosamente',
      leccion: leccionCompleta
    });

  } catch (error) {
    console.error('Error en actualizarLeccion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Publicar lección (cambiar estado a publicada)
 * PUT /api/lecciones/:id/publicar
 */
const publicarLeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor_id = req.user.id;

    // Verificar que la lección existe y pertenece al profesor
    const leccion = await obtenerLeccionCompleta(id);
    
    if (!leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    if (leccion.profesor_id !== profesor_id) {
      if (req.user.rol !== 'admin' && req.user.rol !== 'moderador') {
        return res.status(403).json({ error: 'No tienes permisos para publicar esta lección' });
      }
    }

    if (leccion.estado === 'publicada') {
      return res.status(400).json({ error: 'La lección ya está publicada' });
    }

    // Validar que la lección tiene contenido mínimo
    if (!leccion.contenido_texto || leccion.contenido_texto.trim().length < 50) {
      return res.status(400).json({ 
        error: 'La lección necesita al menos 50 caracteres de contenido para ser publicada' 
      });
    }

    // Publicar lección
    const { data: leccionPublicada, error: errorPublicacion } = await supabase
      .from('lecciones')
      .update({
        estado: 'publicada',
        fecha_publicacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (errorPublicacion) {
      console.error('Error publicando lección:', errorPublicacion);
      return res.status(500).json({ error: 'Error al publicar la lección' });
    }

    // Notificar a usuarios interesados en la categoría (opcional)
    // Esta funcionalidad se puede implementar más tarde

    res.json({
      message: 'Lección publicada exitosamente',
      leccion: leccionPublicada
    });

  } catch (error) {
    console.error('Error en publicarLeccion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Archivar lección
 * PUT /api/lecciones/:id/archivar
 */
const archivarLeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor_id = req.user.id;

    // Verificar permisos
    const { data: leccion, error: errorVerificacion } = await supabase
      .from('lecciones')
      .select('profesor_id, estado')
      .eq('id', id)
      .single();

    if (errorVerificacion || !leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    if (leccion.profesor_id !== profesor_id) {
      if (req.user.rol !== 'admin' && req.user.rol !== 'moderador') {
        return res.status(403).json({ error: 'No tienes permisos para archivar esta lección' });
      }
    }

    // Archivar lección
    const { data: leccionArchivada, error: errorArchivo } = await supabase
      .from('lecciones')
      .update({
        estado: 'archivada',
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (errorArchivo) {
      console.error('Error archivando lección:', errorArchivo);
      return res.status(500).json({ error: 'Error al archivar la lección' });
    }

    res.json({
      message: 'Lección archivada exitosamente',
      leccion: leccionArchivada
    });

  } catch (error) {
    console.error('Error en archivarLeccion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtener lección completa con todos sus recursos y preguntas
 */
const obtenerLeccionCompleta = async (leccionId) => {
  try {
    const { data: leccion, error } = await supabase
      .from('lecciones')
      .select(`
        *,
        profesor:profesor_id(nombre_completo, username, url_avatar, verificado),
        recursos_externos(*),
        quiz_preguntas(*)
      `)
      .eq('id', leccionId)
      .single();

    if (error) {
      console.error('Error obteniendo lección completa:', error);
      return null;
    }

    return leccion;
  } catch (error) {
    console.error('Error en obtenerLeccionCompleta:', error);
    return null;
  }
};

/**
 * Registrar inicio de lección para un estudiante
 */
const registrarInicioLeccion = async (usuario_id, leccion_id) => {
  try {
    // Verificar si ya existe progreso
    const { data: progresoExistente } = await supabase
      .from('progreso_lecciones')
      .select('id, estado_leccion')
      .eq('usuario_id', usuario_id)
      .eq('leccion_id', leccion_id)
      .single();

    if (!progresoExistente) {
      // Crear nuevo progreso
      await supabase
        .from('progreso_lecciones')
        .insert([{
          usuario_id,
          leccion_id,
          estado_leccion: 'en_progreso',
          fecha_inicio: new Date().toISOString(),
          fecha_ultima_actividad: new Date().toISOString()
        }]);
    } else if (progresoExistente.estado_leccion === 'no_iniciada') {
      // Actualizar a en progreso
      await supabase
        .from('progreso_lecciones')
        .update({
          estado_leccion: 'en_progreso',
          fecha_inicio: new Date().toISOString(),
          fecha_ultima_actividad: new Date().toISOString()
        })
        .eq('id', progresoExistente.id);
    }
  } catch (error) {
    console.error('Error registrando inicio de lección:', error);
  }
};

module.exports = {
  crearLeccion,
  obtenerLecciones,
  obtenerLeccionPorId,
  obtenerMisLecciones,
  actualizarLeccion,
  publicarLeccion,
  archivarLeccion
};