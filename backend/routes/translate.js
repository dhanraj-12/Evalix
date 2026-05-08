const express = require('express');
const router = express.Router();
const { translateStrings, getSupportedLanguages } = require('../controllers/translateController');

// POST /api/translate — Translate a batch of UI strings
router.post('/', translateStrings);

// GET /api/translate/languages — Get supported language list
router.get('/languages', getSupportedLanguages);

module.exports = router;
