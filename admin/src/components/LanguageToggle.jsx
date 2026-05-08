import { useLang } from '../context/LangContext';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-neutral-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
      aria-label="Toggle language"
    >
      <span className="text-base leading-none">{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
      <span className="text-xs">{lang === 'en' ? 'मराठी' : 'EN'}</span>
    </button>
  );
}
