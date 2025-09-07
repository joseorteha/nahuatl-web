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
    user_id, 
    word, 
    definition, 
    info_gramatical, 
    razon_contribucion, 
    fuente, 
    nivel_confianza 
  } = req.body;

  if (!user_id || !word || !definition || !info_gramatical) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  try {
    const { data, error } = await supabase
      .from('contribuciones_diccionario')
      .insert({
        usuario_id: user_id,
        usuario_email: '', // Necesitaremos obtener esto del perfil
        word,
        definition,
        info_gramatical,
        razon_contribucion,
        fuente,
        nivel_confianza,
        estado: 'pendiente'
      })
      .select();

    if (error) {
      console.error('Supabase error al crear contribución:', error);
      return res.status(500).json({ error: 'Error al crear contribución.', details: error.message });
    }

    res.status(201).json(data);
  } catch (e) {
    console.error('Error inesperado en POST /api/contributions:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

module.exports = router;
