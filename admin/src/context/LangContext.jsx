import { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import mr from '../i18n/mr.json';

const langs = { en, mr };
const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('evalix_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('evalix_lang', lang);
  }, [lang]);

  const t = (path) => {
    const keys = path.split('.');
    let val = langs[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    return val || path;
  };

  const toggleLang = () => setLang(l => l === 'en' ? 'mr' : 'en');

  return (
    <LangContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
