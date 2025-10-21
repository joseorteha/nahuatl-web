const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Obtener módulos de un curso
 * GET /api/cursos/:cursoId/modulos
 */
const obtenerModulos = async (req, res) => {
  try {
    const { cursoId } = req.params;

    const { data, error } = await supabase
      .from('modulos')
      .select(`
        *,
        temas:lecciones(
          id, titulo, descripcion, nivel, duracion_estimada,
          orden_tema, es_obligatorio, estado
        )
      `)
      .eq('curso_id', cursoId)
      .order('orden_modulo', { ascending: true });

    if (error) throw error;

    // Ordenar temas dentro de cada módulo
    data.forEach(modulo => {
      if (modulo.temas) {
        modulo.temas.sort((a, b) => a.orden_tema - b.orden_tema);
      }
    });

    res.json({ modulos: data });
  } catch (error) {
    console.error('Error en obtenerModulos:', error);
    res.status(500).json({ error: 'Error al obtener módulos' });
  }
};

/**
 * Obtener un módulo específico
 * GET /api/modulos/:id
 */
const obtenerModulo = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('modulos')
      .select(`
        *,
        curso:cursos(id, titulo, profesor_id),
        temas:lecciones(
          id, titulo, descripcion, nivel, duracion_estimada,
          orden_tema, es_obligatorio, estado, contenido_texto,
          objetivos_aprendizaje, palabras_clave
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    // Ordenar temas
    if (data.temas) {
      data.temas.sort((a, b) => a.orden_tema - b.orden_tema);
    }

    res.json({ modulo: data });
  } catch (error) {
    console.error('Error en obtenerModulo:', error);
    res.status(500).json({ error: 'Error al obtener módulo' });
  }
};

/**
 * Crear un nuevo módulo
 * POST /api/cursos/:cursoId/modulos
 */
const crearModulo = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const profesor_id = req.user.id;
    const datosNuevoModulo = req.body;

    // Verificar que el curso existe y pertenece al profesor
    const { data: curso, error: errorCurso } = await supabase
      .from('cursos')
      .select('profesor_id')
      .eq('id', cursoId)
      .single();

    if (errorCurso || !curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (curso.profesor_id !== profesor_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para agregar módulos a este curso' });
    }

    // Validaciones
    if (!datosNuevoModulo.titulo) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    // Obtener el siguiente orden
    const { data: ultimoModulo } = await supabase
      .from('modulos')
      .select('orden_modulo')
      .eq('curso_id', cursoId)
      .order('orden_modulo', { ascending: false })
      .limit(1)
      .single();

    const orden_modulo = datosNuevoModulo.orden_modulo || (ultimoModulo ? ultimoModulo.orden_modulo + 1 : 1);

    const moduloData = {
      curso_id: cursoId,
      titulo: datosNuevoModulo.titulo,
      descripcion: datosNuevoModulo.descripcion,
      objetivos_modulo: datosNuevoModulo.objetivos_modulo || [],
      orden_modulo,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('modulos')
      .insert([moduloData])
      .select()
      .single();

    if (error) {
      console.error('Error creando módulo:', error);
      return res.status(500).json({ error: 'Error al crear módulo' });
    }

    res.status(201).json({
      message: 'Módulo creado exitosamente',
      modulo: data
    });
  } catch (error) {
    console.error('Error en crearModulo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Actualizar un módulo
 * PUT /api/modulos/:id
 */
const actualizarModulo = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor_id = req.user.id;
    const datosActualizacion = req.body;

    // Verificar permisos
    const { data: modulo, error: errorModulo } = await supabase
      .from('modulos')
      .select('curso_id, curso:cursos(profesor_id)')
      .eq('id', id)
      .single();

    if (errorModulo || !modulo) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    if (modulo.curso.profesor_id !== profesor_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para editar este módulo' });
    }

    // Campos permitidos
    const camposPermitidos = ['titulo', 'descripcion', 'objetivos_modulo', 'orden_modulo'];
    const datosLimpios = {};
    
    camposPermitidos.forEach(campo => {
      if (datosActualizacion[campo] !== undefined) {
        datosLimpios[campo] = datosActualizacion[campo];
      }
    });

    datosLimpios.fecha_actualizacion = new Date().toISOString();

    const { data, error } = await supabase
      .from('modulos')
      .update(datosLimpios)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando módulo:', error);
      return res.status(500).json({ error: 'Error al actualizar módulo' });
    }

    res.json({
      message: 'Módulo actualizado exitosamente',
      modulo: data
    });
  } catch (error) {
    console.error('Error en actualizarModulo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Eliminar un módulo
 * DELETE /api/modulos/:id
 */
const eliminarModulo = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor_id = req.user.id;

    // Verificar permisos
    const { data: modulo, error: errorModulo } = await supabase
      .from('modulos')
      .select('curso_id, curso:cursos(profesor_id)')
      .eq('id', id)
      .single();

    if (errorModulo || !modulo) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    if (modulo.curso.profesor_id !== profesor_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este módulo' });
    }

    // Desvincular lecciones (no las elimina, solo quita modulo_id)
    await supabase
      .from('lecciones')
      .update({ modulo_id: null })
      .eq('modulo_id', id);

    // Eliminar módulo
    const { error } = await supabase
      .from('modulos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando módulo:', error);
      return res.status(500).json({ error: 'Error al eliminar módulo' });
    }

    res.json({ message: 'Módulo eliminado exitosamente' });
  } catch (error) {
    console.error('Error en eliminarModulo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Agregar lección (tema) a un módulo
 * POST /api/modulos/:id/temas
 */
const agregarTema = async (req, res) => {
  try {
    const { id } = req.params;
    const { leccion_id, orden_tema, es_obligatorio } = req.body;
    const profesor_id = req.user.id;

    // Verificar permisos del módulo
    const { data: modulo, error: errorModulo } = await supabase
      .from('modulos')
      .select('curso_id, curso:cursos(profesor_id)')
      .eq('id', id)
      .single();

    if (errorModulo || !modulo) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    if (modulo.curso.profesor_id !== profesor_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos' });
    }

    // Verificar que la lección existe y pertenece al profesor
    const { data: leccion, error: errorLeccion } = await supabase
      .from('lecciones')
      .select('id, profesor_id')
      .eq('id', leccion_id)
      .single();

    if (errorLeccion || !leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    if (leccion.profesor_id !== profesor_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos sobre esta lección' });
    }

    // Obtener siguiente orden si no se especifica
    let ordenFinal = orden_tema;
    if (!ordenFinal) {
      const { data: ultimoTema } = await supabase
        .from('lecciones')
        .select('orden_tema')
        .eq('modulo_id', id)
        .order('orden_tema', { ascending: false })
        .limit(1)
        .single();
      
      ordenFinal = ultimoTema ? ultimoTema.orden_tema + 1 : 1;
    }

    // Actualizar lección
    const { data, error } = await supabase
      .from('lecciones')
      .update({
        modulo_id: id,
        orden_tema: ordenFinal,
        es_obligatorio: es_obligatorio !== undefined ? es_obligatorio : true
      })
      .eq('id', leccion_id)
      .select()
      .single();

    if (error) {
      console.error('Error agregando tema:', error);
      return res.status(500).json({ error: 'Error al agregar tema' });
    }

    res.json({
      message: 'Tema agregado exitosamente',
      tema: data
    });
  } catch (error) {
    console.error('Error en agregarTema:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Quitar lección (tema) de un módulo
 * DELETE /api/modulos/:id/temas/:leccionId
 */
const quitarTema = async (req, res) => {
  try {
    const { id, leccionId } = req.params;
    const profesor_id = req.user.id;

    // Verificar permisos
    const { data: modulo, error: errorModulo } = await supabase
      .from('modulos')
      .select('curso_id, curso:cursos(profesor_id)')
      .eq('id', id)
      .single();

    if (errorModulo || !modulo) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    if (modulo.curso.profesor_id !== profesor_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos' });
    }

    // Desvincular lección
    const { error } = await supabase
      .from('lecciones')
      .update({ modulo_id: null, orden_tema: 1 })
      .eq('id', leccionId)
      .eq('modulo_id', id);

    if (error) {
      console.error('Error quitando tema:', error);
      return res.status(500).json({ error: 'Error al quitar tema' });
    }

    res.json({ message: 'Tema quitado del módulo exitosamente' });
  } catch (error) {
    console.error('Error en quitarTema:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Reordenar temas en un módulo
 * PUT /api/modulos/:id/reordenar
 */
const reordenarTemas = async (req, res) => {
  try {
    const { id } = req.params;
    const { temas } = req.body; // Array de { leccion_id, orden_tema }
    const profesor_id = req.user.id;

    // Verificar permisos
    const { data: modulo, error: errorModulo } = await supabase
      .from('modulos')
      .select('curso_id, curso:cursos(profesor_id)')
      .eq('id', id)
      .single();

    if (errorModulo || !modulo) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    if (modulo.curso.profesor_id !== profesor_id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos' });
    }

    // Actualizar orden de cada tema
    for (const tema of temas) {
      await supabase
        .from('lecciones')
        .update({ orden_tema: tema.orden_tema })
        .eq('id', tema.leccion_id)
        .eq('modulo_id', id);
    }

    res.json({ message: 'Temas reordenados exitosamente' });
  } catch (error) {
    console.error('Error en reordenarTemas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerModulos,
  obtenerModulo,
  crearModulo,
  actualizarModulo,
  eliminarModulo,
  agregarTema,
  quitarTema,
  reordenarTemas
};
