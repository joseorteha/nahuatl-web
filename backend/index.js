const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Verificar que las variables de entorno están configuradas
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === 'TU_SERVICE_ROLE_KEY_AQUI') {
  console.error('❌ ERROR: Variables de entorno de Supabase no configuradas correctamente');
  console.error('Por favor, configura SUPABASE_URL y SUPABASE_SERVICE_KEY en el archivo .env');
  process.exit(1);
}

console.log('✅ Conectando a Supabase:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Middleware
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Permite al servidor entender JSON

const dictionaryPath = path.join(__dirname, 'data', 'dictionary.json');
const lessonsPath = path.join(__dirname, 'data', 'lessons.json');

// --- Lessons API ---

// Endpoint para obtener la lista de todas las lecciones (sin el contenido)
app.get('/api/lessons', (req, res) => {
  fs.readFile(lessonsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading lessons data:', err);
      return res.status(500).send('Error al leer los datos de las lecciones.');
    }
    const lessons = JSON.parse(data);
    // Devolvemos solo los campos necesarios para la lista
    const lessonsList = lessons.map(({ id, slug, title, description }) => ({ id, slug, title, description }));
    res.json(lessonsList);
  });
});

// Endpoint para obtener una lección específica por su slug
app.get('/api/lessons/:slug', (req, res) => {
  fs.readFile(lessonsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading lesson data:', err);
      return res.status(500).send('Error al leer los datos de la lección.');
    }
    const lessons = JSON.parse(data);
    const lesson = lessons.find(l => l.slug === req.params.slug);
    if (!lesson) {
      return res.status(404).send('Lección no encontrada.');
    }
    res.json(lesson);
  });
});

// --- Helper Functions ---
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// --- API Endpoints ---

// --- Practice API ---

// Endpoint para generar un quiz dinámico desde el diccionario
app.get('/api/practice/quiz', (req, res) => {
  fs.readFile(dictionaryPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading dictionary for quiz:', err);
      return res.status(500).send('Error al generar el quiz.');
    }

    const dictionary = JSON.parse(data);
    const quizSize = 10; // Número de preguntas en el quiz

    // Filtrar entradas que sean buenas candidatas para un quiz (definición simple, no muy larga)
    const validEntries = dictionary.filter(entry => entry.definition && !entry.definition.includes(';') && !entry.definition.includes('('));
    
    if (validEntries.length < quizSize) {
        return res.status(500).send('No hay suficientes datos en el diccionario para generar un quiz.');
    }

    const selectedEntries = shuffleArray(validEntries).slice(0, quizSize);

    const quiz = selectedEntries.map(correctEntry => {
      // Obtener 3 distractores aleatorios que no sean la respuesta correcta
      const distractors = shuffleArray(validEntries)
        .filter(d => d.word !== correctEntry.word) 
        .slice(0, 3)
        .map(d => d.definition.split(',')[0].trim()); // Tomar la primera parte de la definición

      const options = shuffleArray([
        ...distractors, 
        correctEntry.definition.split(',')[0].trim()
      ]);

      return {
        question: correctEntry.word,
        options: options,
        answer: correctEntry.definition.split(',')[0].trim()
      };
    });

    res.json(quiz);
  });
});

// --- Dictionary API ---

// Endpoint para buscar en el diccionario
app.get('/api/dictionary/search', async (req, res) => {
  const query = req.query.query?.toLowerCase() || '';

  try {
    let data, error;
    
    if (!query) {
      // Devuelve primeras 20 entradas si no hay consulta específica
      ({ data, error } = await supabase
        .from('diccionario')
        .select('*')
        .limit(20));
    } else {
      // Buscar por palabra o definición
      ({ data, error } = await supabase
        .from('diccionario')
        .select('*')
        .or(`word.ilike.%${query}%,definition.ilike.%${query}%`)
        .limit(50));
    }
    
    if (error) {
      console.error('Error al buscar en diccionario:', error);
      return res.status(500).json({ error: 'Error al buscar en el diccionario.' });
    }
    
    return res.json(data || []);
  } catch (err) {
    console.error('Error inesperado en búsqueda de diccionario:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Endpoint de registro
app.post('/api/register', async (req, res) => {
  const { email, username, password, nombre_completo } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }
  // Verificar si ya existe el usuario
  try {
    const { data: existing, error: findError } = await supabase
      .from('perfiles')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();
    if (findError) {
      console.error('Supabase error al buscar usuario:', findError);
      return res.status(500).json({ error: 'Error al buscar usuario.', details: findError.message });
    }
    if (existing) return res.status(409).json({ error: 'El email o usuario ya está registrado.' });

    // Crear usuario
    const { data, error } = await supabase
      .from('perfiles')
      .insert([{ email, username, password, nombre_completo }])
      .select()
      .maybeSingle();
    if (error) {
       console.error('Supabase error al registrar usuario:', error);
      return res.status(500).json({ error: 'Error al registrar usuario.', details: error.message });
    }
    res.json({ user: { id: data.id, email: data.email, username: data.username, full_name: data.full_name } });
  } catch (e) {
    console.error('Error inesperado en /api/register:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// Endpoint de login
app.post('/api/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  console.log('Intento de login para:', emailOrUsername);

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  try {
    // Buscar usuario por email o username
    const { data: user, error } = await supabase
      .from('perfiles')
      .select('*')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .maybeSingle();

    if (error) {
      console.error('Supabase error al buscar usuario en login:', error);
      return res.status(500).json({ error: 'Error al buscar usuario.', details: error.message });
    }

    if (!user) {
      console.log('Usuario no encontrado:', emailOrUsername);
      return res.status(401).json({ error: 'Credenciales incorrectas (usuario no existe).' });
    }
    
    console.log('Usuario encontrado:', user.email);
    console.log('Contraseña recibida:', password);
    console.log('Contraseña en BD:', user.password);

    if (user.password !== password) {
      console.log('La contraseña no coincide.');
      return res.status(401).json({ error: 'Credenciales incorrectas (contraseña errónea).' });
    }
    
    console.log('Login exitoso para:', user.email);
    // No regreses la contraseña
    const { password: _, ...userData } = user;
    res.json({ user: userData });

  } catch (e) {
    console.error('Error inesperado en /api/login:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// Endpoint para crear feedback
app.post('/api/feedback', async (req, res) => {
  const { usuario_id, titulo, contenido, categoria, prioridad } = req.body;

  if (!usuario_id || !titulo || !contenido) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  try {
    const { data, error } = await supabase
      .from('retroalimentacion')
      .insert({ usuario_id, titulo, contenido, categoria, prioridad })
      .select();

    if (error) {
      console.error('Supabase error al crear feedback:', error);
      return res.status(500).json({ error: 'Error al crear la sugerencia.', details: error.message });
    }

    res.status(201).json(data);
  } catch (e) {
    console.error('Error inesperado en /api/feedback:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// Endpoint para obtener todos los feedbacks
app.get('/api/feedback', async (req, res) => {
  try {
    console.log('Obteniendo feedbacks...');
    
    const { data, error } = await supabase
      .from('retroalimentacion')
      .select(`
        *,
        perfiles (nombre_completo, username),
        retroalimentacion_respuestas (
          id,
          contenido,
          fecha_creacion,
          es_respuesta_admin,
          perfiles (nombre_completo)
        ),
        retroalimentacion_likes (usuario_id)
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Supabase error al obtener feedbacks:', error);
      return res.status(500).json({ error: 'Error al obtener feedbacks.', details: error.message });
    }

    console.log(`Feedbacks obtenidos exitosamente: ${data?.length || 0} items`);
    res.json(data || []);
  } catch (e) {
    console.error('Error inesperado en /api/feedback GET:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// Endpoint para dar/quitar like a una sugerencia
app.post('/api/feedback/like', async (req, res) => {
  const { usuario_id, retroalimentacion_id } = req.body;

  if (!usuario_id || !retroalimentacion_id) {
    return res.status(400).json({ error: 'Faltan usuario_id o retroalimentacion_id.' });
  }

  try {
    // Verificar si ya existe el like
    const { data: existingLike, error: findError } = await supabase
      .from('retroalimentacion_likes')
      .select('id')
      .eq('usuario_id', usuario_id)
      .eq('retroalimentacion_id', retroalimentacion_id)
      .maybeSingle();

    if (findError) {
      console.error('Supabase error al buscar like:', findError);
      return res.status(500).json({ error: 'Error al verificar el like.', details: findError.message });
    }

    if (existingLike) {
      // Si existe, lo borramos (unlike)
      const { error: deleteError } = await supabase
        .from('retroalimentacion_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (deleteError) {
        console.error('Supabase error al quitar like:', deleteError);
        return res.status(500).json({ error: 'Error al quitar el like.', details: deleteError.message });
      }
      res.status(200).json({ message: 'Like removido' });
    } else {
      // Si no existe, lo creamos (like)
      const { data, error: insertError } = await supabase
        .from('retroalimentacion_likes')
        .insert({ usuario_id, retroalimentacion_id })
        .select();

      if (insertError) {
        console.error('Supabase error al dar like:', insertError);
        return res.status(500).json({ error: 'Error al dar like.', details: insertError.message });
      }
      res.status(201).json(data);
    }
  } catch (e) {
    console.error('Error inesperado en /api/feedback/like:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// Crear respuesta a feedback
app.post('/api/feedback/reply', async (req, res) => {
  const { usuario_id, retroalimentacion_id, contenido } = req.body;
  if (!usuario_id || !retroalimentacion_id || !contenido) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }
  try {
    const { data, error } = await supabase
      .from('retroalimentacion_respuestas')
      .insert({ usuario_id, retroalimentacion_id, contenido })
      .select();
    if (error) {
      console.error('Supabase error al crear reply:', error);
      return res.status(500).json({ error: 'Error al crear la respuesta.', details: error.message });
    }
    res.status(201).json(data);
  } catch (e) {
    console.error('Error inesperado en /api/feedback/reply:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// Editar feedback principal
app.put('/api/feedback/:id', async (req, res) => {
  const { id } = req.params;
  const { usuario_id, contenido, titulo } = req.body;
  if (!usuario_id || (!contenido && !titulo)) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }
  // Verificar si es autor o admin
  const { data: profile } = await supabase.from('perfiles').select('id, is_admin').eq('id', usuario_id).maybeSingle();
  const { data: feedback } = await supabase.from('retroalimentacion').select('usuario_id').eq('id', id).maybeSingle();
  if (!profile || !feedback) return res.status(404).json({ error: 'No encontrado.' });
  if (profile.id !== feedback.usuario_id && !profile.is_admin) return res.status(403).json({ error: 'No autorizado.' });
  const { data, error } = await supabase
    .from('retroalimentacion')
    .update({ contenido, titulo })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Eliminar feedback principal
app.delete('/api/feedback/:id', async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'Falta usuario_id.' });
  const { data: profile } = await supabase.from('perfiles').select('id, is_admin').eq('id', usuario_id).maybeSingle();
  const { data: feedback } = await supabase.from('retroalimentacion').select('usuario_id').eq('id', id).maybeSingle();
  if (!profile || !feedback) return res.status(404).json({ error: 'No encontrado.' });
  if (profile.id !== feedback.usuario_id && !profile.is_admin) return res.status(403).json({ error: 'No autorizado.' });
  const { error } = await supabase.from('retroalimentacion').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Eliminado' });
});

// Editar reply
app.put('/api/feedback/reply/:id', async (req, res) => {
  const { id } = req.params;
  const { usuario_id, contenido } = req.body;
  if (!usuario_id || !contenido) return res.status(400).json({ error: 'Faltan campos requeridos.' });
  const { data: profile } = await supabase.from('perfiles').select('id, is_admin').eq('id', usuario_id).maybeSingle();
  const { data: reply } = await supabase.from('retroalimentacion_respuestas').select('usuario_id').eq('id', id).maybeSingle();
  if (!profile || !reply) return res.status(404).json({ error: 'No encontrado.' });
  if (profile.id !== reply.usuario_id && !profile.is_admin) return res.status(403).json({ error: 'No autorizado.' });
  const { data, error } = await supabase
    .from('retroalimentacion_respuestas')
    .update({ contenido })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Eliminar reply
app.delete('/api/feedback/reply/:id', async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ error: 'Falta usuario_id.' });
  const { data: profile } = await supabase.from('perfiles').select('id, is_admin').eq('id', usuario_id).maybeSingle();
  const { data: reply } = await supabase.from('retroalimentacion_respuestas').select('usuario_id').eq('id', id).maybeSingle();
  if (!profile || !reply) return res.status(404).json({ error: 'No encontrado.' });
  if (profile.id !== reply.usuario_id && !profile.is_admin) return res.status(403).json({ error: 'No autorizado.' });
  const { error } = await supabase.from('retroalimentacion_respuestas').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Eliminado' });
});

// Guardar palabra en favoritos
app.post('/api/dictionary/save', async (req, res) => {
  const { usuario_id, diccionario_id } = req.body;
  
  console.log('Datos recibidos en /api/dictionary/save:', { usuario_id, diccionario_id });
  
  if (!usuario_id || !diccionario_id) {
    console.log('Faltan datos:', { usuario_id: !!usuario_id, diccionario_id: !!diccionario_id });
    return res.status(400).json({ error: 'Faltan datos' });
  }
  
  try {
    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('perfiles')
      .select('id')
      .eq('id', usuario_id)
      .maybeSingle();
      
    if (userError) {
      console.error('Error al verificar usuario:', userError);
      return res.status(500).json({ error: 'Error al verificar usuario' });
    }
    
    if (!user) {
      console.log('Usuario no encontrado:', usuario_id);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar que la palabra existe
    const { data: word, error: wordError } = await supabase
      .from('diccionario')
      .select('id')
      .eq('id', diccionario_id)
      .maybeSingle();
      
    if (wordError) {
      console.error('Error al verificar palabra:', wordError);
      return res.status(500).json({ error: 'Error al verificar palabra' });
    }
    
    if (!word) {
      console.log('Palabra no encontrada:', diccionario_id);
      return res.status(404).json({ error: 'Palabra no encontrada' });
    }
    
    // Verificar si ya existe
    const { data: existing, error: checkError } = await supabase
      .from('palabras_guardadas')
      .select('id')
      .eq('usuario_id', usuario_id)
      .eq('diccionario_id', diccionario_id)
      .maybeSingle();

    if (checkError) {
      console.error('Error al verificar palabra guardada:', checkError);
      return res.status(500).json({ error: 'Error al verificar palabra guardada' });
    }

    if (existing) {
      console.log('Palabra ya guardada:', { usuario_id, diccionario_id });
      return res.status(400).json({ error: 'La palabra ya está guardada' });
    }

    const { data, error } = await supabase
      .from('palabras_guardadas')
      .insert({ usuario_id, diccionario_id })
      .select();

    if (error) {
      console.error('Error al guardar palabra:', error);
      return res.status(500).json({ error: 'Error al guardar palabra' });
    }

    console.log('Palabra guardada exitosamente:', data);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error inesperado al guardar palabra:', err);
    res.status(500).json({ error: 'Error inesperado al guardar palabra' });
  }
});

// Listar palabras guardadas de un usuario
app.get('/api/dictionary/saved/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('palabras_guardadas')
      .select('diccionario_id')
      .eq('usuario_id', user_id);
    if (error) throw error;
    const dictionaryIds = data.map(row => row.diccionario_id);
    if (dictionaryIds.length === 0) return res.json([]);
    // Obtener detalles de las palabras guardadas
    const { data: words, error: dictError } = await supabase
      .from('diccionario')
      .select('*')
      .in('id', dictionaryIds);
    if (dictError) throw dictError;
    res.json(words);
  } catch (err) {
    console.error('Error al obtener palabras guardadas:', err);
    res.status(500).json({ error: 'Error al obtener palabras guardadas' });
  }
});

// Eliminar palabra guardada
app.delete('/api/dictionary/save', async (req, res) => {
  const { usuario_id, diccionario_id } = req.body;
  if (!usuario_id || !diccionario_id) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    await supabase
      .from('palabras_guardadas')
      .delete()
      .eq('usuario_id', usuario_id)
      .eq('diccionario_id', diccionario_id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar palabra guardada:', err);
    res.status(500).json({ error: 'Error al eliminar palabra guardada' });
  }
});

// --- CONTRIBUCIONES API ---

// Endpoint para crear una nueva contribución
app.post('/api/contributions', async (req, res) => {
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

  // Validar campos requeridos
  if (!usuario_id || !usuario_email || !word || !definition) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos: usuario_id, usuario_email, word, definition' 
    });
  }

  try {
    const { data, error } = await supabase
      .from('contribuciones_diccionario')
      .insert({
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
        nivel_confianza: nivel_confianza || 'medio'
      })
      .select();

    if (error) {
      console.error('Error al crear contribución:', error);
      return res.status(500).json({ 
        error: 'Error al enviar la contribución', 
        details: error.message 
      });
    }

    res.status(201).json({
      message: 'Contribución enviada exitosamente. Será revisada por nuestros moderadores.',
      data: data[0]
    });

  } catch (e) {
    console.error('Error inesperado en /api/contributions:', e);
    return res.status(500).json({ 
      error: 'Error inesperado en el servidor', 
      details: e.message 
    });
  }
});

// Endpoint para obtener contribuciones del usuario
app.get('/api/contributions/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from('contribuciones_diccionario')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al obtener contribuciones del usuario:', error);
      return res.status(500).json({ 
        error: 'Error al obtener las contribuciones', 
        details: error.message 
      });
    }

    // Enriquecer con datos del admin revisor si existe
    const enrichedContributions = [];
    for (const contribution of data || []) {
      let adminRevisor = null;
      if (contribution.admin_revisor_id) {
        const { data: reviewer } = await supabase
          .from('perfiles')
          .select('nombre_completo')
          .eq('id', contribution.admin_revisor_id)
          .single();
        adminRevisor = reviewer;
      }

      enrichedContributions.push({
        ...contribution,
        perfiles: adminRevisor
      });
    }

    res.json(enrichedContributions);

  } catch (e) {
    console.error('Error inesperado en /api/contributions/user:', e);
    return res.status(500).json({ 
      error: 'Error inesperado en el servidor', 
      details: e.message 
    });
  }
});

// Endpoint para que los admins vean todas las contribuciones pendientes
app.get('/api/admin/contributions', async (req, res) => {
  const { adminId } = req.query;

  if (!adminId) {
    return res.status(400).json({ error: 'Se requiere adminId' });
  }

  try {
    // Verificar que el usuario es admin o moderador
    const { data: admin, error: adminError } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !['admin', 'moderador'].includes(admin.rol)) {
      return res.status(403).json({ error: 'No autorizado. Se requieren permisos de administrador.' });
    }

    // Obtener contribuciones sin JOINs complejos
    const { data: contributions, error } = await supabase
      .from('contribuciones_diccionario')
      .select('*')
      .in('estado', ['pendiente', 'aprobada', 'rechazada'])
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al obtener contribuciones para admin:', error);
      return res.status(500).json({ 
        error: 'Error al obtener las contribuciones', 
        details: error.message 
      });
    }

    // Enriquecer con datos de usuarios por separado
    const enrichedContributions = [];
    for (const contribution of contributions || []) {
      // Obtener datos del usuario que contribuyó
      const { data: user } = await supabase
        .from('perfiles')
        .select('nombre_completo, email, username')
        .eq('id', contribution.usuario_id)
        .single();

      // Obtener datos del admin revisor si existe
      let adminRevisor = null;
      if (contribution.admin_revisor_id) {
        const { data: reviewer } = await supabase
          .from('perfiles')
          .select('nombre_completo')
          .eq('id', contribution.admin_revisor_id)
          .single();
        adminRevisor = reviewer;
      }

      enrichedContributions.push({
        ...contribution,
        perfiles: user || { nombre_completo: 'Usuario desconocido', email: contribution.usuario_email, username: '' },
        admin_revisor: adminRevisor
      });
    }

    res.json(enrichedContributions);

  } catch (e) {
    console.error('Error inesperado en /api/admin/contributions:', e);
    return res.status(500).json({ 
      error: 'Error inesperado en el servidor', 
      details: e.message 
    });
  }
});

// Endpoint para que los admins revisen una contribución
app.put('/api/admin/contributions/:id', async (req, res) => {
  const { id } = req.params;
  const { adminId, estado, comentarios_admin } = req.body;

  if (!adminId || !estado || !['aprobada', 'rechazada'].includes(estado)) {
    return res.status(400).json({ 
      error: 'Se requiere adminId, estado (aprobada/rechazada)' 
    });
  }

  try {
    // Verificar que el usuario es admin o moderador
    const { data: admin, error: adminError } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', adminId)
      .single();

    if (adminError || !admin || !['admin', 'moderador'].includes(admin.rol)) {
      return res.status(403).json({ error: 'No autorizado. Se requieren permisos de administrador.' });
    }

    // Actualizar la contribución
    const { data, error } = await supabase
      .from('contribuciones_diccionario')
      .update({
        estado,
        admin_revisor_id: adminId,
        comentarios_admin,
        fecha_revision: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error al actualizar contribución:', error);
      return res.status(500).json({ 
        error: 'Error al actualizar la contribución', 
        details: error.message 
      });
    }

    // Si fue aprobada, agregar al diccionario principal
    if (estado === 'aprobada') {
      const contribucion = data[0];
      
      const { error: insertError } = await supabase
        .from('diccionario')
        .insert({
          word: contribucion.word,
          variants: contribucion.variants,
          info_gramatical: contribucion.info_gramatical,
          definition: contribucion.definition,
          nombre_cientifico: contribucion.nombre_cientifico,
          examples: contribucion.examples,
          synonyms: contribucion.synonyms,
          roots: contribucion.roots,
          ver_tambien: contribucion.ver_tambien,
          ortografias_alternativas: contribucion.ortografias_alternativas,
          notes: contribucion.notes,
          usuario_id: contribucion.usuario_id
        });

      if (insertError) {
        console.error('Error al agregar palabra al diccionario:', insertError);
        return res.status(500).json({ 
          error: 'Contribución aprobada pero error al agregar al diccionario', 
          details: insertError.message 
        });
      }

      // Marcar como publicada
      await supabase
        .from('contribuciones_diccionario')
        .update({ estado: 'publicada' })
        .eq('id', id);
    }

    res.json({
      message: estado === 'aprobada' 
        ? 'Contribución aprobada y agregada al diccionario' 
        : 'Contribución rechazada',
      data: data[0]
    });

  } catch (e) {
    console.error('Error inesperado en /api/admin/contributions:', e);
    return res.status(500).json({ 
      error: 'Error inesperado en el servidor', 
      details: e.message 
    });
  }
});

// ENDPOINT TEMPORAL PARA VER USUARIOS
app.get('/api/admin/check-users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, email, username, rol, password')
      .limit(10);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ENDPOINT TEMPORAL PARA HACER ADMIN
app.post('/api/admin/make-admin', async (req, res) => {
  try {
    const { email, adminKey } = req.body;
    
    if (adminKey !== 'make-admin-nahuatl-2025') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { data, error } = await supabase
      .from('perfiles')
      .update({ rol: 'admin' })
      .eq('email', email)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, message: `Usuario ${email} ahora es admin`, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ENDPOINT TEMPORAL PARA MIGRACIÓN EN PRODUCCIÓN
app.post('/api/admin/migrate-dictionary', async (req, res) => {
  try {
    // Solo permitir en desarrollo o con una clave especial
    const { adminKey } = req.body;
    if (adminKey !== 'migrate-nahuatl-2025') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const fs = require('fs');
    const path = require('path');
    
    // Leer el archivo JSON
    const dictionaryPath = path.join(__dirname, 'data', 'dictionary.json');
    const rawData = fs.readFileSync(dictionaryPath, 'utf8');
    const dictionaryData = JSON.parse(rawData);
    
    console.log(`📚 Migrando ${dictionaryData.length} entradas en producción...`);
    
    // Función para mapear campos
    function mapToSpanishFields(entry) {
      return {
        word: entry.word || '',
        variants: entry.variants || null,
        info_gramatical: entry.grammar_info || '',
        definition: entry.definition || '',
        nombre_cientifico: entry.scientific_name || null,
        examples: entry.examples || null,
        synonyms: entry.synonyms || null,
        roots: entry.roots || null,
        ver_tambien: entry.see_also || null,
        ortografias_alternativas: entry.alt_spellings || null,
        notes: entry.notes || null
      };
    }
    
    // Limpiar tabla primero
    await supabase.from('diccionario').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Procesar en lotes
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < dictionaryData.length; i += batchSize) {
      const batch = dictionaryData.slice(i, i + batchSize);
      const mappedBatch = batch.map(mapToSpanishFields);
      
      const { error } = await supabase.from('diccionario').insert(mappedBatch);
      
      if (error) {
        console.error(`Error en lote ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        totalInserted += batch.length;
      }
    }
    
    res.json({ 
      success: true, 
      message: `Migración completada. ${totalInserted} entradas insertadas.` 
    });
    
  } catch (error) {
    console.error('Error en migración:', error);
    res.status(500).json({ error: 'Error en migración', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
