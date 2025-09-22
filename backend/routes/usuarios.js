const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// GET /api/usuarios/search - Buscar usuarios por nombre o username
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    // Buscar usuarios que coincidan con el término de búsqueda
    const { data: usuarios, error } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, username, email, url_avatar, verificado')
      .or(`nombre_completo.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(10);

    if (error) {
      console.error('Error searching usuarios:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor al buscar usuarios'
      });
    }

    res.status(200).json({
      success: true,
      data: usuarios || []
    });

  } catch (error) {
    console.error('Error in usuarios search:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
