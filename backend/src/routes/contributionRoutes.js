// routes/contributionRoutes.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/contributions/stats/:userId - Obtener estadísticas de contribuciones
router.get('/stats/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Debug logs detallados
    console.log('🔍 Debug contributions/stats - req.user:', req.user);
    console.log('🔍 Debug contributions/stats - userId from params:', userId);
    console.log('🔍 Debug contributions/stats - req.user.id:', req.user?.id);
    console.log('🔍 Debug contributions/stats - req.user.rol:', req.user?.rol);
    console.log('🔍 Debug contributions/stats - tipos:', {
      userIdType: typeof req.user?.id,
      paramsUserIdType: typeof userId,
      userIdValue: req.user?.id,
      paramsUserIdValue: userId,
      areEqual: req.user?.id === userId,
      areEqualStrict: String(req.user?.id) === String(userId)
    });
    
    // Comparación más robusta usando strings
    const userIdString = String(req.user.id);
    const paramsUserIdString = String(userId);
    
    // Verificar que el usuario esté accediendo a sus propias estadísticas o sea admin
    if (userIdString !== paramsUserIdString && req.user.rol !== 'admin') {
      console.log('❌ Debug contributions/stats - Sin permisos:', {
        reqUserId: req.user.id,
        paramsUserId: userId,
        userRole: req.user.rol,
        userIdString,
        paramsUserIdString,
        originalComparison: req.user.id !== userId,
        stringComparison: userIdString !== paramsUserIdString
      });
      return res.status(403).json({ error: 'No tienes permisos para acceder a estas estadísticas' });
    }
    
    console.log('✅ Debug contributions/stats - Permisos OK, continuando...');

    // Obtener estadísticas de contribuciones
    const { data: contribuciones, error: contribucionesError } = await supabase
      .from('contribuciones_diccionario')
      .select('estado')
      .eq('usuario_id', userId);

    if (contribucionesError) {
      throw contribucionesError;
    }

    // Calcular estadísticas
    const totalContributions = contribuciones.length;
    const approvedContributions = contribuciones.filter(c => c.estado === 'aprobada').length;
    const pendingContributions = contribuciones.filter(c => c.estado === 'pendiente').length;
    const rejectedContributions = contribuciones.filter(c => c.estado === 'rechazada').length;

    // Obtener puntos totales de recompensas
    const { data: recompensas, error: recompensasError } = await supabase
      .from('recompensas_usuario')
      .select('puntos_totales, nivel, experiencia')
      .eq('usuario_id', userId)
      .single();

    if (recompensasError && recompensasError.code !== 'PGRST116') {
      throw recompensasError;
    }

    const stats = {
      totalContributions,
      approvedContributions,
      pendingContributions,
      rejectedContributions,
      totalPoints: recompensas?.puntos_totales || 0,
      level: recompensas?.nivel || 'principiante',
      experience: recompensas?.experiencia || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting contribution stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/contributions/historial/:userId - Obtener historial de contribuciones
router.get('/historial/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Comparación más robusta usando strings
    const userIdString = String(req.user.id);
    const paramsUserIdString = String(userId);
    
    // Verificar que el usuario esté accediendo a su propio historial o sea admin
    if (userIdString !== paramsUserIdString && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para acceder a este historial' });
    }

    // Obtener historial de contribuciones
    const { data: contribuciones, error: contribucionesError } = await supabase
      .from('contribuciones_diccionario')
      .select('id, estado, fecha_creacion, comentarios_admin')
      .eq('usuario_id', userId)
      .order('fecha_creacion', { ascending: false });

    if (contribucionesError) {
      throw contribucionesError;
    }

    // Mapear a formato de historial
    const historial = contribuciones.map(contribucion => ({
      puntos_ganados: contribucion.estado === 'aprobada' ? 10 : 0,
      motivo: `contribucion_${contribucion.estado}`,
      descripcion: contribucion.estado === 'aprobada' 
        ? 'Contribución aprobada' 
        : contribucion.estado === 'rechazada' 
        ? 'Contribución rechazada' 
        : 'Contribución pendiente',
      fecha_creacion: contribucion.fecha_creacion
    }));

    res.json({ historial });
  } catch (error) {
    console.error('Error getting contribution history:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/contributions/:id - Editar contribución (solo admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { word, definition, info_gramatical, razon_contribucion, fuente } = req.body;
    
    // Verificar que el usuario sea admin
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden editar contribuciones' });
    }

    // Actualizar la contribución
    const { data, error } = await supabase
      .from('contribuciones_diccionario')
      .update({
        word: word,
        definition: definition,
        info_gramatical: info_gramatical,
        razon_contribucion: razon_contribucion,
        fuente: fuente,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      message: 'Contribución actualizada exitosamente',
      contribution: data
    });
  } catch (error) {
    console.error('Error updating contribution:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/contributions/user/:userId - Obtener contribuciones del usuario
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('contribuciones_diccionario')
      .select(`
        *,
        perfiles!admin_revisor_id (
          nombre_completo
        )
      `)
      .eq('usuario_id', userId)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Supabase error al obtener contribuciones de usuario:', error);
      return res.status(500).json({ error: 'Error al obtener contribuciones.', details: error.message });
    }

    res.json(data);
  } catch (e) {
    console.error('Error inesperado en GET /api/contributions/user:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// POST /api/contributions - Crear nueva contribución
router.post('/', async (req, res) => {
  const { 
    usuario_id, 
    usuario_email,
    word, 
    variants,
    info_gramatical, 
    definition,
    nombre_cientifico,
    examples,
    synonyms,
    roots,
    ver_tambien,
    ortografias_alternativas,
    notes,
    razon_contribucion, 
    fuente, 
    nivel_confianza 
  } = req.body;

  if (!usuario_id || !word || !definition) {
    return res.status(400).json({ error: 'Faltan campos requeridos: usuario_id, word, definition.' });
  }

  try {
    // Procesar arrays de strings para campos que lo requieren
    const processedVariants = variants && Array.isArray(variants) ? variants : 
                             variants ? variants.split(',').map(v => v.trim()).filter(v => v) : null;
    
    const processedSynonyms = synonyms && Array.isArray(synonyms) ? synonyms : 
                             synonyms ? synonyms.split(',').map(s => s.trim()).filter(s => s) : null;
    
    const processedRoots = roots && Array.isArray(roots) ? roots : 
                          roots ? roots.split(',').map(r => r.trim()).filter(r => r) : null;
    
    const processedVerTambien = ver_tambien && Array.isArray(ver_tambien) ? ver_tambien : 
                               ver_tambien ? ver_tambien.split(',').map(v => v.trim()).filter(v => v) : null;
    
    const processedOrtografias = ortografias_alternativas && Array.isArray(ortografias_alternativas) ? ortografias_alternativas : 
                                ortografias_alternativas ? ortografias_alternativas.split(',').map(o => o.trim()).filter(o => o) : null;
    
    const processedNotes = notes && Array.isArray(notes) ? notes : 
                          notes ? notes.split('\n').map(n => n.trim()).filter(n => n) : null;

    // Procesar ejemplos como JSON
    let processedExamples = null;
    if (examples) {
      try {
        // Si examples es string, intentar parsearlo como líneas separadas
        if (typeof examples === 'string') {
          const exampleLines = examples.split('\n').map(line => line.trim()).filter(line => line);
          if (exampleLines.length > 0) {
            processedExamples = exampleLines.map((line, index) => {
              // Formato: "frase_nahuatl = traducción_español"
              const parts = line.split('=').map(part => part.trim());
              return {
                id: index + 1,
                nahuatl: parts[0] || line,
                español: parts[1] || '',
                original: line
              };
            });
          }
        } else if (Array.isArray(examples)) {
          processedExamples = examples;
        }
      } catch (e) {
        console.warn('Error procesando examples, usando formato original:', e);
        processedExamples = examples;
      }
    }

    const { data, error } = await supabase
      .from('contribuciones_diccionario')
      .insert({
        usuario_id: usuario_id,
        usuario_email: usuario_email || '',
        word: word.trim(),
        variants: processedVariants,
        info_gramatical: info_gramatical || null,
        definition: definition.trim(),
        nombre_cientifico: nombre_cientifico || null,
        examples: processedExamples,
        synonyms: processedSynonyms,
        roots: processedRoots,
        ver_tambien: processedVerTambien,
        ortografias_alternativas: processedOrtografias,
        notes: processedNotes,
        razon_contribucion: razon_contribucion || null,
        fuente: fuente || null,
        nivel_confianza: nivel_confianza || 'medio',
        estado: 'pendiente'
      })
      .select();

    if (error) {
      console.error('Supabase error al crear contribución:', error);
      return res.status(500).json({ error: 'Error al crear contribución.', details: error.message });
    }

    console.log('✅ Contribución creada exitosamente:', data[0]?.word);
    res.status(201).json(data[0]);
  } catch (e) {
    console.error('Error inesperado en POST /api/contributions:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

module.exports = router;
