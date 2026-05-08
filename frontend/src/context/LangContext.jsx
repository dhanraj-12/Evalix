import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import en from '../i18n/en.json';
import mr from '../i18n/mr.json';
import api from '../utils/api';

/**
 * Enhanced i18n system:
 * - 'en' and 'mr' use local JSON files (manual, clinically accurate translations)
 * - Any other language auto-translates via Google Translate API on the backend
 * - Translations are cached in localStorage to avoid redundant API calls
 */

const staticLangs = { en, mr };

// Supported languages for the selector dropdown
export const LANGUAGES = [
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
];

/** Flatten nested object: { nav: { dashboard: "x" } } → { "nav.dashboard": "x" } */
function flatten(obj, prefix = '') {
  const result = {};
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flatten(obj[key], fullKey));
    } else {
      result[fullKey] = obj[key];
    }
  }
  return result;
}

/** Unflatten dot-notation keys: { "nav.dashboard": "x" } → { nav: { dashboard: "x" } } */
function unflatten(obj) {
  const result = {};
  for (const key of Object.keys(obj)) {
    const keys = key.split('.');
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = obj[key];
  }
  return result;
}

const CACHE_PREFIX = 'evalix_i18n_';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('evalix_lang') || 'en');
  const [dynamicLangs, setDynamicLangs] = useState({});
  const [translating, setTranslating] = useState(false);
  const abortRef = useRef(null);

  // Load cached translations from localStorage on mount
  useEffect(() => {
    const cached = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(CACHE_PREFIX)) {
        const code = key.replace(CACHE_PREFIX, '');
        try {
          cached[code] = JSON.parse(localStorage.getItem(key));
        } catch { /* ignore corrupt cache */ }
      }
    }
    if (Object.keys(cached).length > 0) {
      setDynamicLangs(cached);
    }
  }, []);

  // Persist language choice
  useEffect(() => {
    localStorage.setItem('evalix_lang', lang);
  }, [lang]);

  // Auto-translate when language changes to a non-static language
  useEffect(() => {
    if (staticLangs[lang] || dynamicLangs[lang]) return;

    // Need to fetch translation from backend
    const fetchTranslation = async () => {
      setTranslating(true);
      try {
        const flatEn = flatten(en);
        const res = await api.post('/translate', {
          strings: flatEn,
          targetLang: lang,
        });

        const translated = unflatten(res.data.translations);

        setDynamicLangs(prev => ({ ...prev, [lang]: translated }));
        localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(translated));
      } catch (err) {
        console.error('Translation failed, falling back to English:', err);
      }
      setTranslating(false);
    };

    fetchTranslation();
  }, [lang]);

  // Resolve the current language's translation object
  const currentLangData = staticLangs[lang] || dynamicLangs[lang] || en;

  /**
   * Translation function — resolves dot-notation keys like "auth.loginBtn".
   * Falls back to English, then to the raw key path.
   */
  const t = useCallback((path) => {
    const keys = path.split('.');

    // Try current language first
    let val = currentLangData;
    for (const k of keys) {
      val = val?.[k];
    }
    if (val !== undefined && val !== null) return val;

    // Fallback to English
    let fallback = en;
    for (const k of keys) {
      fallback = fallback?.[k];
    }
    if (fallback !== undefined && fallback !== null) return fallback;

    // Last resort: return the key path itself
    return path;
  }, [currentLangData]);

  const toggleLang = () => setLang(l => l === 'en' ? 'mr' : 'en');

  return (
    <LangContext.Provider value={{ lang, setLang, t, toggleLang, translating, LANGUAGES }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
