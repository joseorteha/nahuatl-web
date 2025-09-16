// routes/contributionRoutes.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

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
