/**
 * Rutas para gestión de progreso de lecciones
 * Sistema de inscripción y seguimiento de estudiantes
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/progreso/inscribirse/:leccionId
 * @desc    Inscribirse en una lección
 * @access  Private (estudiantes)
 */
router.post('/inscribirse/:leccionId', authenticateToken, async (req, res) => {
  try {
    const { leccionId } = req.params;
    const usuario_id = req.user.id;

    console.log('📝 Inscripción solicitada:', { usuario_id, leccionId });

    // Verificar que la lección existe y está publicada
    const { data: leccion, error: errorLeccion } = await supabase
      .from('lecciones')
      .select('id, titulo, estado')
      .eq('id', leccionId)
      .single();

    if (errorLeccion || !leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    if (leccion.estado !== 'publicada') {
      return res.status(403).json({ error: 'Esta lección no está disponible para inscripción' });
    }

    // Verificar si ya está inscrito
    const { data: progresoExistente } = await supabase
      .from('progreso_lecciones')
      .select('id, estado_leccion')
      .eq('usuario_id', usuario_id)
      .eq('leccion_id', leccionId)
      .single();

    if (progresoExistente) {
      return res.json({
        message: 'Ya estás inscrito en esta lección',
        progreso: progresoExistente,
        yaInscrito: true
      });
    }

    // Crear registro de progreso (inscripción)
    const { data: nuevoProgreso, error: errorProgreso } = await supabase
      .from('progreso_lecciones')
      .insert([{
        usuario_id,
        leccion_id: leccionId,
        estado_leccion: 'en_progreso',
        fecha_inicio: new Date().toISOString(),
        fecha_ultima_actividad: new Date().toISOString()
      }])
      .select()
      .single();

    if (errorProgreso) {
      console.error('Error creando progreso:', errorProgreso);
      return res.status(500).json({ error: 'Error al inscribirse en la lección' });
    }

    // Crear notificación para el profesor (opcional)
    const { data: profesorData } = await supabase
      .from('lecciones')
      .select('profesor_id')
      .eq('id', leccionId)
      .single();

    if (profesorData?.profesor_id) {
      await supabase
        .from('notificaciones')
        .insert([{
          usuario_id: profesorData.profesor_id,
          tipo_notificacion: 'nueva_leccion_disponible',
          titulo: 'Nuevo estudiante inscrito',
          mensaje: `Un estudiante se ha inscrito en tu lección "${leccion.titulo}"`,
          relacionado_id: leccionId,
          relacionado_tipo: 'leccion'
        }]);
    }

    console.log('✅ Inscripción exitosa:', nuevoProgreso.id);

    res.status(201).json({
      message: 'Inscripción exitosa',
      progreso: nuevoProgreso,
      yaInscrito: false
    });

  } catch (error) {
    console.error('Error en inscripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   GET /api/progreso/verificar/:leccionId
 * @desc    Verificar si el usuario está inscrito en una lección
 * @access  Private
 */
router.get('/verificar/:leccionId', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 [VERIFICAR] Iniciando verificación de inscripción');
    const { leccionId } = req.params;
    const usuario_id = req.user.id;
    console.log('🔍 [VERIFICAR] Usuario ID:', usuario_id);
    console.log('🔍 [VERIFICAR] Lección ID:', leccionId);

    console.log('🔍 [VERIFICAR] Consultando Supabase...');
    const { data: progreso, error } = await supabase
      .from('progreso_lecciones')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('leccion_id', leccionId)
      .single();

    console.log('🔍 [VERIFICAR] Resultado de consulta:', { progreso, error });

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ [VERIFICAR] Error verificando inscripción:', error);
      return res.status(500).json({ error: 'Error al verificar inscripción' });
    }

    const response = {
      inscrito: !!progreso,
      progreso: progreso || null
    };
    
    console.log('✅ [VERIFICAR] Enviando respuesta:', response);
    res.json(response);

  } catch (error) {
    console.error('❌ [VERIFICAR] Error en verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   PUT /api/progreso/actualizar/:leccionId
 * @desc    Actualizar progreso de lección (puntuación, estado, etc.)
 * @access  Private
 */
router.put('/actualizar/:leccionId', authenticateToken, async (req, res) => {
  try {
    const { leccionId } = req.params;
    const usuario_id = req.user.id;
    const { 
      puntuacion_quiz, 
      total_preguntas_quiz, 
      estado_leccion, 
      tiempo_total_minutos,
      notas_estudiante 
    } = req.body;

    // Buscar progreso existente
    const { data: progresoExistente, error: errorBusqueda } = await supabase
      .from('progreso_lecciones')
      .select('id, intentos_quiz')
      .eq('usuario_id', usuario_id)
      .eq('leccion_id', leccionId)
      .single();

    if (errorBusqueda || !progresoExistente) {
      return res.status(404).json({ error: 'No estás inscrito en esta lección' });
    }

    // Preparar datos de actualización
    const datosActualizacion = {
      fecha_ultima_actividad: new Date().toISOString()
    };

    if (puntuacion_quiz !== undefined) {
      datosActualizacion.puntuacion_quiz = puntuacion_quiz;
      datosActualizacion.intentos_quiz = (progresoExistente.intentos_quiz || 0) + 1;
    }

    if (total_preguntas_quiz !== undefined) {
      datosActualizacion.total_preguntas_quiz = total_preguntas_quiz;
    }

    if (estado_leccion) {
      datosActualizacion.estado_leccion = estado_leccion;
      if (estado_leccion === 'completada') {
        datosActualizacion.fecha_completada = new Date().toISOString();
      }
    }

    if (tiempo_total_minutos !== undefined) {
      datosActualizacion.tiempo_total_minutos = tiempo_total_minutos;
    }

    if (notas_estudiante) {
      datosActualizacion.notas_estudiante = notas_estudiante;
    }

    // Actualizar progreso
    const { data: progresoActualizado, error: errorActualizacion } = await supabase
      .from('progreso_lecciones')
      .update(datosActualizacion)
      .eq('id', progresoExistente.id)
      .select()
      .single();

    if (errorActualizacion) {
      console.error('Error actualizando progreso:', errorActualizacion);
      return res.status(500).json({ error: 'Error al actualizar progreso' });
    }

    // Si completó la lección, crear notificación
    if (estado_leccion === 'completada') {
      const { data: leccionData } = await supabase
        .from('lecciones')
        .select('titulo, profesor_id')
        .eq('id', leccionId)
        .single();

      if (leccionData?.profesor_id) {
        await supabase
          .from('notificaciones')
          .insert([{
            usuario_id: leccionData.profesor_id,
            tipo_notificacion: 'leccion_completada',
            titulo: 'Lección completada',
            mensaje: `Un estudiante ha completado tu lección "${leccionData.titulo}"`,
            relacionado_id: leccionId,
            relacionado_tipo: 'leccion'
          }]);
      }

      // Otorgar puntos al estudiante
      if (puntuacion_quiz && total_preguntas_quiz) {
        const porcentaje = (puntuacion_quiz / total_preguntas_quiz) * 100;
        const puntosGanados = Math.round(porcentaje / 10); // 10 puntos por 100%

        await supabase
          .from('historial_puntos')
          .insert([{
            usuario_id,
            puntos_ganados: puntosGanados,
            motivo: 'leccion_completada',
            descripcion: `Completaste la lección con ${porcentaje.toFixed(0)}% de aciertos`
          }]);
      }
    }

    res.json({
      message: 'Progreso actualizado exitosamente',
      progreso: progresoActualizado
    });

  } catch (error) {
    console.error('Error actualizando progreso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   GET /api/progreso/mis-lecciones
 * @desc    Obtener lecciones en las que el usuario está inscrito
 * @access  Private
 */
router.get('/mis-lecciones', authenticateToken, async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const { data: progresos, error } = await supabase
      .from('progreso_lecciones')
      .select(`
        *,
        leccion:leccion_id (
          id,
          titulo,
          descripcion,
          categoria,
          nivel,
          duracion_estimada,
          profesor:profesor_id (
            nombre_completo,
            username,
            url_avatar
          )
        )
      `)
      .eq('usuario_id', usuario_id)
      .order('fecha_ultima_actividad', { ascending: false });

    if (error) {
      console.error('Error obteniendo mis lecciones:', error);
      return res.status(500).json({ error: 'Error al obtener lecciones' });
    }

    res.json({ lecciones: progresos });

  } catch (error) {
    console.error('Error en mis lecciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @route   GET /api/progreso/estudiantes/:leccionId
 * @desc    Obtener estudiantes inscritos en una lección (solo profesor)
 * @access  Private (profesor de la lección)
 */
router.get('/estudiantes/:leccionId', authenticateToken, async (req, res) => {
  try {
    const { leccionId } = req.params;
    const usuario_id = req.user.id;

    // Verificar que el usuario es el profesor de la lección
    const { data: leccion, error: errorLeccion } = await supabase
      .from('lecciones')
      .select('profesor_id')
      .eq('id', leccionId)
      .single();

    if (errorLeccion || !leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    if (leccion.profesor_id !== usuario_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para ver estos datos' });
    }

    // Obtener estudiantes inscritos
    const { data: estudiantes, error } = await supabase
      .from('progreso_lecciones')
      .select(`
        *,
        estudiante:usuario_id (
          id,
          nombre_completo,
          username,
          email,
          url_avatar
        )
      `)
      .eq('leccion_id', leccionId)
      .order('fecha_inicio', { ascending: false });

    if (error) {
      console.error('Error obteniendo estudiantes:', error);
      return res.status(500).json({ error: 'Error al obtener estudiantes' });
    }

    // Calcular estadísticas
    const totalEstudiantes = estudiantes.length;
    const completados = estudiantes.filter(e => e.estado_leccion === 'completada').length;
    const enProgreso = estudiantes.filter(e => e.estado_leccion === 'en_progreso').length;
    const promedioQuiz = estudiantes.length > 0
      ? estudiantes.reduce((sum, e) => sum + (e.puntuacion_quiz || 0), 0) / estudiantes.length
      : 0;

    res.json({
      estudiantes,
      estadisticas: {
        total: totalEstudiantes,
        completados,
        enProgreso,
        promedioQuiz: Math.round(promedioQuiz * 10) / 10
      }
    });

  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
