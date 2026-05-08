import { useState, useRef, useEffect } from 'react';
import { useLang, LANGUAGES } from '../context/LangContext';

export default function LanguageToggle() {
  const { lang, setLang, translating } = useLang();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (code) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
        aria-label="Select language"
        aria-expanded={open}
      >
        {translating ? (
          <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-base leading-none">{current.flag}</span>
        )}
        <span className="text-xs">{current.nativeName}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-1 left-0 w-52 py-1 rounded-xl border border-white/[0.08] shadow-xl z-[100] max-h-72 overflow-y-auto"
          style={{ background: '#141416' }}
        >
          {/* Section: Manual (Clinical) */}
          <div className="px-3 py-1.5">
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 font-semibold">Clinical (Manual)</span>
          </div>
          {LANGUAGES.filter(l => ['en', 'mr'].includes(l.code)).map(l => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-150 ${
                lang === l.code
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="flex-1 text-left">{l.nativeName}</span>
              <span className="text-[10px] text-neutral-600">{l.name}</span>
              {lang === l.code && (
                <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}

          {/* Divider */}
          <div className="my-1 border-t border-white/[0.06]" />

          {/* Section: Auto-translated */}
          <div className="px-3 py-1.5">
            <span className="text-[10px] uppercase tracking-wider text-neutral-600 font-semibold">Auto-Translated</span>
          </div>
          {LANGUAGES.filter(l => !['en', 'mr'].includes(l.code)).map(l => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-150 ${
                lang === l.code
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="flex-1 text-left">{l.nativeName}</span>
              <span className="text-[10px] text-neutral-600">{l.name}</span>
              {lang === l.code && (
                <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
