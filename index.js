const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aiqitkcpdwdbdbeavyys.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'TU_SERVICE_ROLE_KEY_AQUI';

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
app.get('/api/dictionary/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';

  fs.readFile(dictionaryPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al leer los datos del diccionario.');
    }
    
    const dictionary = JSON.parse(data);
    
    if (!query) {
      // Devuelve una pequeña parte si no hay consulta, para no enviar todo el archivo
      return res.json(dictionary.slice(0, 20)); 
    }

        const lowerQuery = query.toLowerCase();

    const scoredResults = dictionary
      .map(entry => {
        let score = 0;
        const word = entry.word.toLowerCase();
        
        // Prioritize exact matches and then starting matches
        if (word === lowerQuery) score = 100;
        else if (word.startsWith(lowerQuery)) score = Math.max(score, 90);

        // Score matches in other fields
        if (entry.variants && entry.variants.some(v => v.toLowerCase().includes(lowerQuery))) score = Math.max(score, 80);
        if (entry.synonyms && entry.synonyms.some(s => s.toLowerCase().includes(lowerQuery))) score = Math.max(score, 70);
        if (entry.roots && entry.roots.some(r => r.toLowerCase().includes(lowerQuery))) score = Math.max(score, 60);
        if (word.includes(lowerQuery)) score = Math.max(score, 50); // General inclusion has lower priority
        if (entry.definition && entry.definition.toLowerCase().includes(lowerQuery)) score = Math.max(score, 10);

        return { ...entry, score };
      })
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    res.json(scoredResults);
  });
});

// Endpoint de registro
app.post('/api/register', async (req, res) => {
  const { email, username, password, full_name } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }
  // Verificar si ya existe el usuario
  try {
    const { data: existing, error: findError } = await supabase
      .from('profiles')
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
      .from('profiles')
      .insert([{ email, username, password, full_name }])
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
      .from('profiles')
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
  const { user_id, title, content, category, priority } = req.body;

  if (!user_id || !title || !content) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert({ user_id, title, content, category, priority })
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

// Endpoint para dar/quitar like a una sugerencia
app.post('/api/feedback/like', async (req, res) => {
  const { user_id, feedback_id } = req.body;

  if (!user_id || !feedback_id) {
    return res.status(400).json({ error: 'Faltan user_id o feedback_id.' });
  }

  try {
    // Verificar si ya existe el like
    const { data: existingLike, error: findError } = await supabase
      .from('feedback_likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('feedback_id', feedback_id)
      .maybeSingle();

    if (findError) {
      console.error('Supabase error al buscar like:', findError);
      return res.status(500).json({ error: 'Error al verificar el like.', details: findError.message });
    }

    if (existingLike) {
      // Si existe, lo borramos (unlike)
      const { error: deleteError } = await supabase
        .from('feedback_likes')
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
        .from('feedback_likes')
        .insert({ user_id, feedback_id })
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
  const { user_id, feedback_id, content } = req.body;
  if (!user_id || !feedback_id || !content) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }
  try {
    const { data, error } = await supabase
      .from('feedback_replies')
      .insert({ user_id, feedback_id, content })
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
  const { user_id, content, title } = req.body;
  if (!user_id || (!content && !title)) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }
  // Verificar si es autor o admin
  const { data: profile } = await supabase.from('profiles').select('id, is_admin').eq('id', user_id).maybeSingle();
  const { data: feedback } = await supabase.from('feedback').select('user_id').eq('id', id).maybeSingle();
  if (!profile || !feedback) return res.status(404).json({ error: 'No encontrado.' });
  if (profile.id !== feedback.user_id && !profile.is_admin) return res.status(403).json({ error: 'No autorizado.' });
  const { data, error } = await supabase
    .from('feedback')
    .update({ content, title })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Eliminar feedback principal
app.delete('/api/feedback/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Falta user_id.' });
  const { data: profile } = await supabase.from('profiles').select('id, is_admin').eq('id', user_id).maybeSingle();
  const { data: feedback } = await supabase.from('feedback').select('user_id').eq('id', id).maybeSingle();
  if (!profile || !feedback) return res.status(404).json({ error: 'No encontrado.' });
  if (profile.id !== feedback.user_id && !profile.is_admin) return res.status(403).json({ error: 'No autorizado.' });
  const { error } = await supabase.from('feedback').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Eliminado' });
});

// Editar reply
app.put('/api/feedback/reply/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, content } = req.body;
  if (!user_id || !content) return res.status(400).json({ error: 'Faltan campos requeridos.' });
  const { data: profile } = await supabase.from('profiles').select('id, is_admin').eq('id', user_id).maybeSingle();
  const { data: reply } = await supabase.from('feedback_replies').select('user_id').eq('id', id).maybeSingle();
  if (!profile || !reply) return res.status(404).json({ error: 'No encontrado.' });
  if (profile.id !== reply.user_id && !profile.is_admin) return res.status(403).json({ error: 'No autorizado.' });
  const { data, error } = await supabase
    .from('feedback_replies')
    .update({ content })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Eliminar reply
app.delete('/api/feedback/reply/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'Falta user_id.' });
  const { data: profile } = await supabase.from('profiles').select('id, is_admin').eq('id', user_id).maybeSingle();
  const { data: reply } = await supabase.from('feedback_replies').select('user_id').eq('id', id).maybeSingle();
  if (!profile || !reply) return res.status(404).json({ error: 'No encontrado.' });
  if (profile.id !== reply.user_id && !profile.is_admin) return res.status(403).json({ error: 'No autorizado.' });
  const { error } = await supabase.from('feedback_replies').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Eliminado' });
});

// Guardar palabra en favoritos
app.post('/api/dictionary/save', async (req, res) => {
  const { user_id, dictionary_id } = req.body;
  if (!user_id || !dictionary_id) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    await supabase
      .from('saved_words')
      .insert({ user_id, dictionary_id })
      .select();
    res.json({ success: true });
  } catch (err) {
    console.error('Error al guardar palabra:', err);
    res.status(500).json({ error: 'Error al guardar palabra' });
  }
});

// Listar palabras guardadas de un usuario
app.get('/api/dictionary/saved/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('saved_words')
      .select('dictionary_id')
      .eq('user_id', user_id);
    if (error) throw error;
    const dictionaryIds = data.map(row => row.dictionary_id);
    if (dictionaryIds.length === 0) return res.json([]);
    // Obtener detalles de las palabras guardadas
    const { data: words, error: dictError } = await supabase
      .from('dictionary')
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
  const { user_id, dictionary_id } = req.body;
  if (!user_id || !dictionary_id) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    await supabase
      .from('saved_words')
      .delete()
      .eq('user_id', user_id)
      .eq('dictionary_id', dictionary_id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar palabra guardada:', err);
    res.status(500).json({ error: 'Error al eliminar palabra guardada' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
