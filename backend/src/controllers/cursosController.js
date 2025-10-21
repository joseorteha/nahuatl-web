const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Obtener todos los cursos (públicos o del profesor)
 * GET /api/cursos
 */
const obtenerCursos = async (req, res) => {
  try {
    const { estado, nivel, categoria, destacados, profesor_id } = req.query;
    
    console.log('🔍 Parámetros recibidos:', { estado, nivel, categoria, destacados, profesor_id });
    
    // Query con filtros
    let query = supabase
      .from('cursos')
      .select('*')
      .order('orden_visualizacion', { ascending: true });
    
    // Aplicar filtros
    if (estado) query = query.eq('estado', estado);
    if (nivel) query = query.eq('nivel', nivel);
    if (categoria) query = query.eq('categoria', categoria);
    if (destacados === 'true') query = query.eq('es_destacado', true);
    if (profesor_id) query = query.eq('profesor_id', profesor_id);

    const { data, error } = await query;
    
    console.log('📚 Cursos encontrados:', data?.length || 0);
    
    // Obtener datos de profesores y módulos manualmente
    let cursosFiltrados = data || [];
    
    if (cursosFiltrados.length > 0) {
      // Obtener IDs únicos de profesores
      const profesorIds = [...new Set(cursosFiltrados.map(c => c.profesor_id))];
      
      // Obtener datos de profesores
      const { data: profesores } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, url_avatar')
        .in('id', profesorIds);
      
      // Obtener conteo de módulos
      const cursoIds = cursosFiltrados.map(c => c.id);
      const { data: modulos } = await supabase
        .from('modulos')
        .select('curso_id')
        .in('curso_id', cursoIds);
      
      // Mapear datos
      cursosFiltrados = cursosFiltrados.map(curso => ({
        ...curso,
        profesor: profesores?.find(p => p.id === curso.profesor_id) || {
          id: curso.profesor_id,
          nombre_completo: 'Profesor',
          url_avatar: null
        },
        modulos: [{ count: modulos?.filter(m => m.curso_id === curso.id).length || 0 }]
      }));
    }

    if (error) {
      console.error('❌ Error en query:', error);
      throw error;
    }

    console.log('✅ Cursos finales a devolver:', cursosFiltrados.length);
    if (cursosFiltrados.length > 0) {
      console.log('📖 Primer curso:', cursosFiltrados[0].titulo, '- Estado:', cursosFiltrados[0].estado);
    }

    res.json({ cursos: cursosFiltrados });
  } catch (error) {
    console.error('Error en obtenerCursos:', error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
};

/**
 * Obtener un curso completo con módulos y temas
 * GET /api/cursos/:id
 */
const obtenerCursoCompleto = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener curso
    const { data: curso, error: errorCurso } = await supabase
      .from('cursos')
      .select(`
        *,
        profesor:perfiles!cursos_profesor_fkey(id, nombre_completo, url_avatar, biografia)
      `)
      .eq('id', id)
      .single();

    if (errorCurso || !curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    // Obtener módulos
    const { data: modulos, error: errorModulos } = await supabase
      .from('modulos')
      .select('*')
      .eq('curso_id', id)
      .order('orden_modulo', { ascending: true });

    if (errorModulos) throw errorModulos;

    // Obtener lecciones de cada módulo desde modulos_lecciones
    if (modulos && modulos.length > 0) {
      for (const modulo of modulos) {
        const { data: leccionesModulo } = await supabase
          .from('modulos_lecciones')
          .select(`
            orden_en_modulo,
            es_obligatoria,
            leccion:lecciones(
              id, titulo, descripcion, nivel, duracion_estimada, estado
            )
          `)
          .eq('modulo_id', modulo.id)
          .order('orden_en_modulo', { ascending: true });

        // Mapear lecciones con el formato esperado
        modulo.temas = (leccionesModulo || []).map(ml => ({
          id: ml.leccion.id,
          titulo: ml.leccion.titulo,
          descripcion: ml.leccion.descripcion,
          nivel: ml.leccion.nivel,
          duracion_estimada: ml.leccion.duracion_estimada,
          estado: ml.leccion.estado,
          orden_tema: ml.orden_en_modulo,
          es_obligatorio: ml.es_obligatoria
        }));
      }
    }

    // Obtener calificaciones
    const { data: calificaciones } = await supabase
      .from('calificaciones_cursos')
      .select('calificacion, comentario, fecha_calificacion, usuario:perfiles(nombre_completo, url_avatar)')
      .eq('curso_id', id)
      .order('fecha_calificacion', { ascending: false })
      .limit(10);

    res.json({
      curso: {
        ...curso,
        modulos: modulos || [],
        calificaciones: calificaciones || []
      }
    });
  } catch (error) {
    console.error('Error en obtenerCursoCompleto:', error);
    res.status(500).json({ error: 'Error al obtener curso' });
  }
};

/**
 * Crear un nuevo curso
 * POST /api/cursos
 */
const crearCurso = async (req, res) => {
  try {
    const profesor_id = req.user.id;
    const datosNuevoCurso = req.body;

    // Validaciones básicas
    if (!datosNuevoCurso.titulo || !datosNuevoCurso.categoria) {
      return res.status(400).json({ error: 'Título y categoría son requeridos' });
    }

    const cursoData = {
      ...datosNuevoCurso,
      profesor_id,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('cursos')
      .insert([cursoData])
      .select()
      .single();

    if (error) {
      console.error('Error creando curso:', error);
      return res.status(500).json({ error: 'Error al crear curso', details: error });
    }

    res.status(201).json({
      message: 'Curso creado exitosamente',
      curso: data
    });
  } catch (error) {
    console.error('Error en crearCurso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Actualizar un curso
 * PUT /api/cursos/:id
 */
const actualizarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor_id = req.user.id;
    const datosActualizacion = req.body;

    // Verificar que el curso existe y pertenece al profesor
    const { data: cursoExistente, error: errorVerificacion } = await supabase
      .from('cursos')
      .select('profesor_id')
      .eq('id', id)
      .single();

    if (errorVerificacion || !cursoExistente) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (cursoExistente.profesor_id !== profesor_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para editar este curso' });
    }

    // Campos permitidos
    const camposPermitidos = [
      'titulo', 'descripcion', 'imagen_portada', 'nivel', 'categoria',
      'objetivos_curso', 'requisitos_previos', 'palabras_clave',
      'orden_visualizacion', 'es_destacado', 'es_gratuito', 'estado'
    ];

    const datosLimpios = {};
    camposPermitidos.forEach(campo => {
      if (datosActualizacion[campo] !== undefined) {
        datosLimpios[campo] = datosActualizacion[campo];
      }
    });

    datosLimpios.fecha_actualizacion = new Date().toISOString();

    if (datosActualizacion.estado === 'publicado' && !cursoExistente.fecha_publicacion) {
      datosLimpios.fecha_publicacion = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('cursos')
      .update(datosLimpios)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando curso:', error);
      return res.status(500).json({ error: 'Error al actualizar curso' });
    }

    res.json({
      message: 'Curso actualizado exitosamente',
      curso: data
    });
  } catch (error) {
    console.error('Error en actualizarCurso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Eliminar un curso
 * DELETE /api/cursos/:id
 */
const eliminarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor_id = req.user.id;

    // Verificar permisos
    const { data: curso, error: errorVerificacion } = await supabase
      .from('cursos')
      .select('profesor_id')
      .eq('id', id)
      .single();

    if (errorVerificacion || !curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (curso.profesor_id !== profesor_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este curso' });
    }

    // Eliminar (CASCADE eliminará módulos y desvinculará lecciones)
    const { error } = await supabase
      .from('cursos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando curso:', error);
      return res.status(500).json({ error: 'Error al eliminar curso' });
    }

    res.json({ message: 'Curso eliminado exitosamente' });
  } catch (error) {
    console.error('Error en eliminarCurso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Verificar si un usuario está inscrito en un curso
 * GET /api/cursos/:id/verificar-inscripcion
 */
const verificarInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    const { data, error } = await supabase
      .from('inscripciones_cursos')
      .select('id, estado, progreso_porcentaje, fecha_inscripcion')
      .eq('usuario_id', usuario_id)
      .eq('curso_id', id)
      .maybeSingle();

    if (error) {
      console.error('Error verificando inscripción:', error);
      return res.status(500).json({ error: 'Error al verificar inscripción' });
    }

    res.json({
      inscrito: !!data,
      inscripcion: data || null
    });
  } catch (error) {
    console.error('Error en verificarInscripcion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Obtener cursos del profesor autenticado
 * GET /api/cursos/mis-cursos
 */
const obtenerMisCursos = async (req, res) => {
  try {
    const profesor_id = req.user.id;
    const { page = 1, limit = 10, estado } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('cursos')
      .select(`
        *,
        modulos:modulos(count),
        inscripciones:inscripciones_cursos(count)
      `, { count: 'exact' })
      .eq('profesor_id', profesor_id)
      .order('fecha_creacion', { ascending: false })
      .range(offset, offset + limit - 1);

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      cursos: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error en obtenerMisCursos:', error);
    res.status(500).json({ error: 'Error al obtener cursos' });
  }
};

/**
 * Inscribir estudiante en un curso
 * POST /api/cursos/:id/inscribir
 */
const inscribirEnCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    // Verificar que el curso existe y está publicado
    const { data: curso, error: errorCurso } = await supabase
      .from('cursos')
      .select('id, estado')
      .eq('id', id)
      .single();

    if (errorCurso || !curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (curso.estado !== 'publicado') {
      return res.status(400).json({ error: 'El curso no está disponible' });
    }

    // Verificar si ya está inscrito
    const { data: inscripcionExistente } = await supabase
      .from('inscripciones_cursos')
      .select('id')
      .eq('usuario_id', usuario_id)
      .eq('curso_id', id)
      .single();

    if (inscripcionExistente) {
      return res.status(400).json({ error: 'Ya estás inscrito en este curso' });
    }

    // Crear inscripción
    const { data, error } = await supabase
      .from('inscripciones_cursos')
      .insert([{
        usuario_id,
        curso_id: id,
        fecha_inscripcion: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Actualizar contador de estudiantes
    await supabase.rpc('increment', {
      table_name: 'cursos',
      row_id: id,
      column_name: 'estudiantes_inscritos'
    });

    res.status(201).json({
      message: 'Inscripción exitosa',
      inscripcion: data
    });
  } catch (error) {
    console.error('Error en inscribirEnCurso:', error);
    res.status(500).json({ error: 'Error al inscribirse en el curso' });
  }
};

module.exports = {
  obtenerCursos,
  obtenerCursoCompleto,
  crearCurso,
  actualizarCurso,
  eliminarCurso,
  obtenerMisCursos,
  inscribirEnCurso,
  verificarInscripcion
};
