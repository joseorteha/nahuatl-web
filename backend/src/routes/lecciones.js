const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Cargar lecciones desde el archivo JSON
let leccionesData = null;

try {
  const leccionesPath = path.join(__dirname, '../../lecciones.json');
  const leccionesContent = fs.readFileSync(leccionesPath, 'utf8');
  leccionesData = JSON.parse(leccionesContent);
} catch (error) {
  console.error('Error al cargar lecciones:', error);
  // Datos de ejemplo si no se encuentra el archivo
  leccionesData = {
    lecciones: [
      {
        id: 'leccion-1',
        titulo: 'Adverbios Básicos',
        descripcion: 'Aprende los adverbios más comunes en náhuatl con ejemplos de uso',
        nivel: 'principiante',
        duracion: '20 minutos',
        categoria: 'gramatica',
        palabras: [
          {
            nahuatl: 'nikan',
            espanol: 'aquí',
            pronunciacion: 'NI-kan',
            ejemplo: 'Nikan kochi – aquí duerme'
          },
          {
            nahuatl: 'kualkan',
            espanol: 'temprano',
            pronunciacion: 'KU-al-kan',
            ejemplo: 'Kualkan nias – iré temprano'
          },
          {
            nahuatl: 'yolik',
            espanol: 'despacio',
            pronunciacion: 'YO-lik',
            ejemplo: 'Yolik xinehnemi – camina despacio'
          }
        ],
        ejercicios: [
          {
            tipo: 'traduccion',
            pregunta: '¿Cómo se dice "aquí" en náhuatl?',
            opciones: ['nikan', 'kualkan', 'yolik'],
            respuesta_correcta: 'nikan',
            explicacion: '"nikan" significa "aquí" en náhuatl.'
          }
        ]
      }
    ]
  };
}

// GET /api/lecciones - Obtener todas las lecciones
router.get('/', (req, res) => {
  try {
    res.json(leccionesData);
  } catch (error) {
    console.error('Error al obtener lecciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/lecciones/:id - Obtener una lección específica
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const leccion = leccionesData.lecciones.find(l => l.id === id);
    
    if (!leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }
    
    res.json(leccion);
  } catch (error) {
    console.error('Error al obtener lección:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/lecciones/:id/ejercicio - Verificar respuesta de ejercicio
router.post('/:id/ejercicio', (req, res) => {
  try {
    const { id } = req.params;
    const { ejercicioIndex, respuesta } = req.body;
    
    const leccion = leccionesData.lecciones.find(l => l.id === id);
    
    if (!leccion) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }
    
    const ejercicio = leccion.ejercicios[ejercicioIndex];
    
    if (!ejercicio) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }
    
    const esCorrecta = respuesta === ejercicio.respuesta_correcta;
    
    res.json({
      esCorrecta,
      explicacion: ejercicio.explicacion,
      respuesta_correcta: ejercicio.respuesta_correcta
    });
  } catch (error) {
    console.error('Error al verificar ejercicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
