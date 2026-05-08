const translate = require('google-translate-api-x');

/**
 * Translates a flat object of key-value UI strings to the target language.
 * Uses the free Google Translate API (no API key needed).
 * Results are cached in-memory on the server to avoid redundant API calls.
 */

// In-memory cache: { "hi": { "nav.dashboard": "डैशबोर्ड", ... }, ... }
const translationCache = {};

exports.translateStrings = async (req, res) => {
  try {
    const { strings, targetLang } = req.body;

    if (!strings || !targetLang) {
      return res.status(400).json({ error: 'strings and targetLang are required' });
    }

    if (targetLang === 'en') {
      return res.json({ translations: strings });
    }

    // Check cache first
    if (translationCache[targetLang]) {
      const cached = translationCache[targetLang];
      const allCached = Object.keys(strings).every(k => cached[k] !== undefined);
      if (allCached) {
        const result = {};
        for (const key of Object.keys(strings)) {
          result[key] = cached[key];
        }
        return res.json({ translations: result, cached: true });
      }
    }

    // Prepare batch — translate all values at once
    const entries = Object.entries(strings);
    const values = entries.map(([_, v]) => v);

    // google-translate-api-x supports array input for batch translation
    const results = await translate(values, { from: 'en', to: targetLang });

    const translations = {};
    entries.forEach(([key], i) => {
      const translated = Array.isArray(results) ? results[i].text : results.text;
      translations[key] = translated;
    });

    // Store in cache
    if (!translationCache[targetLang]) translationCache[targetLang] = {};
    Object.assign(translationCache[targetLang], translations);

    res.json({ translations, cached: false });
  } catch (err) {
    console.error('Translation error:', err.message);
    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
};

/**
 * Returns the list of supported languages for the UI dropdown.
 */
exports.getSupportedLanguages = (req, res) => {
  res.json({
    languages: [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
      { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    ]
  });
};
