// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// GET /api/admin/contributions - Obtener contribuciones para admin
router.get('/contributions', async (req, res) => {
  const { adminId } = req.query;

  if (!adminId) {
    return res.status(400).json({ error: 'adminId es requerido' });
  }

  try {
    const { data, error } = await supabase
      .from('contribuciones')
      .select(`
        *,
        perfiles!user_id (
          nombre_completo,
          email,
          username
        ),
        admin_revisor:perfiles!admin_revisor_id (
          nombre_completo
        )
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Supabase error al obtener contribuciones:', error);
      return res.status(500).json({ error: 'Error al obtener contribuciones.', details: error.message });
    }

    res.json(data);
  } catch (e) {
    console.error('Error inesperado en GET /api/admin/contributions:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

// PUT /api/admin/contributions/:id - Revisar contribución
router.put('/contributions/:id', async (req, res) => {
  const { id } = req.params;
  const { adminId, estado, comentarios_admin } = req.body;

  if (!adminId || !estado || !['aprobada', 'rechazada'].includes(estado)) {
    return res.status(400).json({ error: 'Datos de revisión inválidos' });
  }

  try {
    const { data, error } = await supabase
      .from('contribuciones')
      .update({
        estado,
        comentarios_admin,
        admin_revisor_id: adminId,
        fecha_revision: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error al revisar contribución:', error);
      return res.status(500).json({ error: 'Error al revisar contribución.', details: error.message });
    }

    res.json(data);
  } catch (e) {
    console.error('Error inesperado en PUT /api/admin/contributions:', e);
    return res.status(500).json({ error: 'Error inesperado en el servidor.', details: e.message });
  }
});

module.exports = router;
