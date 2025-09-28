// routes/dictionaryRoutes.js
const express = require('express');
const router = express.Router();
const dictionaryController = require('../controllers/dictionaryController');

// GET /api/dictionary/search - Buscar palabras
router.get('/search', dictionaryController.searchWords);

// GET /api/dictionary/saved/:userId - Obtener palabras guardadas
router.get('/saved/:userId', dictionaryController.getSavedWords);

// POST /api/dictionary/save - Guardar palabra
router.post('/save', dictionaryController.saveWord);

// DELETE /api/dictionary/save - Eliminar palabra guardada
router.delete('/save', dictionaryController.unsaveWord);

module.exports = router;
