/**
 * Controlador para gestión de lecciones en módulos
 * Sistema de Lecciones Mejorado - Relación Módulos-Lecciones
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Obtener lecciones de un módulo específico
 * GET /api/modulos/:moduloId/lecciones
 */
const obtenerLeccionesModulo = async (req, res) => {
  try {
    const { moduloId } = req.params;
    const usuario_id = req.user?.id;

    console.log('📚 Obteniendo lecciones del módulo:', moduloId);

    // Obtener lecciones del módulo con progreso del usuario
    const { data: leccionesModulo, error } = await supabase
      .from('modulos_lecciones')
      .select(`
        id,
        orden_en_modulo,
        es_obligatoria,
        puntos_requeridos,
        leccion:lecciones(
          id,
          titulo,
          descripcion,
          categoria,
          nivel,
          duracion_estimada,
          es_publica,
          es_exclusiva_modulo,
          estado,
          profesor_id
        )
      `)
      .eq('modulo_id', moduloId)
      .order('orden_en_modulo', { ascending: true });

    if (error) {
      console.error('Error obteniendo lecciones del módulo:', error);
      return res.status(500).json({ error: 'Error al obtener lecciones' });
    }

    // Si hay usuario autenticado, obtener su progreso
    let progresosMap = {};
    if (usuario_id) {
      const leccionIds = leccionesModulo.map(ml => ml.leccion.id);
      
      const { data: progresos } = await supabase
        .from('progreso_lecciones')
        .select('leccion_id, estado_leccion, fecha_completada, puntuacion_quiz')
        .eq('usuario_id', usuario_id)
        .in('leccion_id', leccionIds);

      progresosMap = (progresos || []).reduce((acc, p) => {
        acc[p.leccion_id] = p;
        return acc;
      }, {});
    }

    // Mapear lecciones con progreso
    const leccionesConProgreso = leccionesModulo.map(ml => ({
      ...ml.leccion,
      orden_en_modulo: ml.orden_en_modulo,
      es_obligatoria: ml.es_obligatoria,
      puntos_requeridos: ml.puntos_requeridos,
      progreso: progresosMap[ml.leccion.id] || null,
      completada: progresosMap[ml.leccion.id]?.estado_leccion === 'completada'
    }));

    res.json({
      lecciones: leccionesConProgreso,
      total: leccionesConProgreso.length
    });

  } catch (error) {
    console.error('Error en obtenerLeccionesModulo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Vincular lección existente a un módulo
 * POST /api/modulos/:moduloId/lecciones/vincular
 */
const vincularLeccionExistente = async (req, res) => {
  try {
    const { moduloId } = req.params;
    const { leccion_id, orden_en_modulo, es_obligatoria = true, puntos_requeridos = 0 } = req.body;
    const profesor_id = req.user.id;

    console.log('🔗 Vinculando lección', leccion_id, 'al módulo', moduloId);

    // Verificar que el módulo existe y pertenece al profesor
    const { data: modulo, error: errorModulo } = await supabase
      .from('modulos')
      .select('id, curso_id, cursos(profesor_id)')
      .eq('id', moduloId)
      .single();

    if (errorModulo || !modulo) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    if (modulo.cursos.profesor_id !== profesor_id) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este módulo' });
    }

    // Verificar que la lección existe y está publicada
    const { data: leccion, error: errorLeccion } = await supabase
      .from('lecciones')
      .select('id, titulo, es_exclusiva_modulo, modulo_exclusivo_id')
      .eq('id', leccion_id)
      .single();

    if (errorLeccion || !leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    // No se puede vincular una lección exclusiva de otro módulo
    if (leccion.es_exclusiva_modulo && leccion.modulo_exclusivo_id !== moduloId) {
      return res.status(400).json({ 
        error: 'Esta lección es exclusiva de otro módulo y no puede ser vinculada' 
      });
    }

    // Verificar que no esté ya vinculada
    const { data: vinculoExistente } = await supabase
      .from('modulos_lecciones')
      .select('id')
      .eq('modulo_id', moduloId)
      .eq('leccion_id', leccion_id)
      .single();

    if (vinculoExistente) {
      return res.status(400).json({ error: 'La lección ya está vinculada a este módulo' });
    }

    // Crear vínculo
    const { data: vinculo, error: errorVinculo } = await supabase
      .from('modulos_lecciones')
      .insert([{
        modulo_id: moduloId,
        leccion_id,
        orden_en_modulo: orden_en_modulo || 1,
        es_obligatoria,
        puntos_requeridos
      }])
      .select()
      .single();

    if (errorVinculo) {
      console.error('Error creando vínculo:', errorVinculo);
      return res.status(500).json({ error: 'Error al vincular la lección' });
    }

    res.status(201).json({
      message: 'Lección vinculada exitosamente',
      vinculo
    });

  } catch (error) {
    console.error('Error en vincularLeccionExistente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Crear lección exclusiva para un módulo
 * POST /api/modulos/:moduloId/lecciones/crear
 */
const crearLeccionExclusiva = async (req, res) => {
  try {
    const { moduloId } = req.params;
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
      orden_en_modulo = 1,
      es_obligatoria = true,
      recursos_externos = [],
      quiz_preguntas = []
    } = req.body;

    const profesor_id = req.user.id;

    console.log('✨ Creando lección exclusiva para módulo:', moduloId);

    // Verificar que el módulo existe y pertenece al profesor
    const { data: modulo, error: errorModulo } = await supabase
      .from('modulos')
      .select('id, curso_id, cursos(profesor_id)')
      .eq('id', moduloId)
      .single();

    if (errorModulo || !modulo) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    if (modulo.cursos.profesor_id !== profesor_id) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este módulo' });
    }

    // Validar campos requeridos
    if (!titulo || !categoria || !contenido_texto) {
      return res.status(400).json({ 
        error: 'Campos requeridos faltantes',
        requeridos: ['titulo', 'categoria', 'contenido_texto']
      });
    }

    // Crear lección exclusiva
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
      profesor_id,
      es_publica: false,
      es_exclusiva_modulo: true,
      modulo_exclusivo_id: moduloId,
      estado: 'publicada', // Las lecciones exclusivas se publican automáticamente
      fecha_publicacion: new Date().toISOString()
    };

    const { data: nuevaLeccion, error: errorLeccion } = await supabase
      .from('lecciones')
      .insert([leccionData])
      .select()
      .single();

    if (errorLeccion) {
      console.error('Error creando lección:', errorLeccion);
      return res.status(500).json({ error: 'Error al crear la lección' });
    }

    // Agregar recursos externos
    if (recursos_externos.length > 0) {
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

      await supabase
        .from('recursos_externos')
        .insert(recursosParaInsertar);
    }

    // Agregar preguntas de quiz
    if (quiz_preguntas.length > 0) {
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

      await supabase
        .from('quiz_preguntas')
        .insert(preguntasParaInsertar);
    }

    // Vincular automáticamente al módulo
    const { data: vinculo, error: errorVinculo } = await supabase
      .from('modulos_lecciones')
      .insert([{
        modulo_id: moduloId,
        leccion_id: nuevaLeccion.id,
        orden_en_modulo,
        es_obligatoria
      }])
      .select()
      .single();

    if (errorVinculo) {
      console.error('Error vinculando lección:', errorVinculo);
      // No fallar, la lección ya está creada
    }

    res.status(201).json({
      message: 'Lección exclusiva creada exitosamente',
      leccion: nuevaLeccion,
      vinculo
    });

  } catch (error) {
    console.error('Error en crearLeccionExclusiva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Desvincular lección de un módulo
 * DELETE /api/modulos/:moduloId/lecciones/:leccionId
 */
const desvincularLeccion = async (req, res) => {
  try {
    const { moduloId, leccionId } = req.params;
    const profesor_id = req.user.id;

    console.log('🔓 Desvinculando lección', leccionId, 'del módulo', moduloId);

    // Verificar permisos
    const { data: modulo, error: errorModulo } = await supabase
      .from('modulos')
      .select('id, curso_id, cursos(profesor_id)')
      .eq('id', moduloId)
      .single();

    if (errorModulo || !modulo) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    if (modulo.cursos.profesor_id !== profesor_id) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este módulo' });
    }

    // Verificar si la lección es exclusiva del módulo
    const { data: leccion } = await supabase
      .from('lecciones')
      .select('es_exclusiva_modulo, modulo_exclusivo_id')
      .eq('id', leccionId)
      .single();

    if (leccion?.es_exclusiva_modulo && leccion.modulo_exclusivo_id === moduloId) {
      return res.status(400).json({ 
        error: 'No puedes desvincular una lección exclusiva. Debes eliminarla completamente.' 
      });
    }

    // Desvincular
    const { error: errorDesvincular } = await supabase
      .from('modulos_lecciones')
      .delete()
      .eq('modulo_id', moduloId)
      .eq('leccion_id', leccionId);

    if (errorDesvincular) {
      console.error('Error desvinculando lección:', errorDesvincular);
      return res.status(500).json({ error: 'Error al desvincular la lección' });
    }

    res.json({ message: 'Lección desvinculada exitosamente' });

  } catch (error) {
    console.error('Error en desvincularLeccion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Actualizar orden y configuración de lección en módulo
 * PUT /api/modulos/:moduloId/lecciones/:leccionId
 */
const actualizarConfiguracionLeccion = async (req, res) => {
  try {
    const { moduloId, leccionId } = req.params;
    const { orden_en_modulo, es_obligatoria, puntos_requeridos } = req.body;
    const profesor_id = req.user.id;

    // Verificar permisos
    const { data: modulo, error: errorModulo } = await supabase
      .from('modulos')
      .select('id, curso_id, cursos(profesor_id)')
      .eq('id', moduloId)
      .single();

    if (errorModulo || !modulo) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    if (modulo.cursos.profesor_id !== profesor_id) {
      return res.status(403).json({ error: 'No tienes permisos para modificar este módulo' });
    }

    // Actualizar configuración
    const datosActualizacion = {};
    if (orden_en_modulo !== undefined) datosActualizacion.orden_en_modulo = orden_en_modulo;
    if (es_obligatoria !== undefined) datosActualizacion.es_obligatoria = es_obligatoria;
    if (puntos_requeridos !== undefined) datosActualizacion.puntos_requeridos = puntos_requeridos;

    const { data: vinculoActualizado, error: errorActualizar } = await supabase
      .from('modulos_lecciones')
      .update(datosActualizacion)
      .eq('modulo_id', moduloId)
      .eq('leccion_id', leccionId)
      .select()
      .single();

    if (errorActualizar) {
      console.error('Error actualizando configuración:', errorActualizar);
      return res.status(500).json({ error: 'Error al actualizar configuración' });
    }

    res.json({
      message: 'Configuración actualizada exitosamente',
      vinculo: vinculoActualizado
    });

  } catch (error) {
    console.error('Error en actualizarConfiguracionLeccion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Registrar progreso de lección con contexto de módulo
 * POST /api/lecciones/:id/progreso
 */
const registrarProgresoConContexto = async (req, res) => {
  try {
    const { id: leccion_id } = req.params;
    const {
      contexto_acceso = 'catalogo',
      modulo_id = null,
      curso_id = null,
      estado_leccion = 'en_progreso',
      puntuacion_quiz = 0,
      tiempo_minutos = 0
    } = req.body;

    const usuario_id = req.user.id;

    console.log('📝 Registrando progreso:', { usuario_id, leccion_id, contexto_acceso });

    // Buscar progreso existente
    const { data: progresoExistente } = await supabase
      .from('progreso_lecciones')
      .select('id, estado_leccion')
      .eq('usuario_id', usuario_id)
      .eq('leccion_id', leccion_id)
      .single();

    let progreso;

    if (!progresoExistente) {
      // Crear nuevo progreso
      const { data, error } = await supabase
        .from('progreso_lecciones')
        .insert([{
          usuario_id,
          leccion_id,
          contexto_acceso,
          modulo_id,
          curso_id,
          estado_leccion,
          puntuacion_quiz,
          tiempo_total_minutos: tiempo_minutos,
          fecha_inicio: new Date().toISOString(),
          fecha_ultima_actividad: new Date().toISOString(),
          fecha_completada: estado_leccion === 'completada' ? new Date().toISOString() : null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creando progreso:', error);
        return res.status(500).json({ error: 'Error al registrar progreso' });
      }

      progreso = data;

    } else {
      // Actualizar progreso existente
      const datosActualizacion = {
        contexto_acceso,
        modulo_id: modulo_id || progresoExistente.modulo_id,
        curso_id: curso_id || progresoExistente.curso_id,
        fecha_ultima_actividad: new Date().toISOString()
      };

      // Solo actualizar estado si avanza (no retrocede)
      if (estado_leccion === 'completada' && progresoExistente.estado_leccion !== 'completada') {
        datosActualizacion.estado_leccion = 'completada';
        datosActualizacion.fecha_completada = new Date().toISOString();
      } else if (estado_leccion === 'en_progreso' && progresoExistente.estado_leccion === 'no_iniciada') {
        datosActualizacion.estado_leccion = 'en_progreso';
      }

      if (puntuacion_quiz > 0) {
        datosActualizacion.puntuacion_quiz = puntuacion_quiz;
      }

      if (tiempo_minutos > 0) {
        datosActualizacion.tiempo_total_minutos = (progresoExistente.tiempo_total_minutos || 0) + tiempo_minutos;
      }

      const { data, error } = await supabase
        .from('progreso_lecciones')
        .update(datosActualizacion)
        .eq('id', progresoExistente.id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando progreso:', error);
        return res.status(500).json({ error: 'Error al actualizar progreso' });
      }

      progreso = data;
    }

    // Si completó la lección, actualizar contador en la tabla lecciones
    if (estado_leccion === 'completada' && (!progresoExistente || progresoExistente.estado_leccion !== 'completada')) {
      await supabase.rpc('increment', {
        table_name: 'lecciones',
        row_id: leccion_id,
        column_name: 'estudiantes_completados'
      });
    }

    res.json({
      message: 'Progreso registrado exitosamente',
      progreso
    });

  } catch (error) {
    console.error('Error en registrarProgresoConContexto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerLeccionesModulo,
  vincularLeccionExistente,
  crearLeccionExclusiva,
  desvincularLeccion,
  actualizarConfiguracionLeccion,
  registrarProgresoConContexto
};
