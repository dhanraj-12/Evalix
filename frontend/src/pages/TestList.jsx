import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

export default function TestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLang();

  useEffect(() => {
    api.get('/tests/published').then(r => { setTests(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const typeConfig = {
    MMSE:     { icon: '🧠', accent: 'blue' },
    MoCA:     { icon: '🔬', accent: 'violet' },
    'ACE-III': { icon: '📋', accent: 'cyan' },
    CDR:      { icon: '💊', accent: 'yellow' },
    Custom:   { icon: '📝', accent: 'neutral' },
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="skeleton h-8 w-56 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">{t('dashboard.availableTests')}</h1>
        <p className="text-sm text-neutral-500 mt-1">{tests.length} assessments available</p>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3" />
            </svg>
          </div>
          <p className="text-neutral-500">{t('dashboard.noTests')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {tests.map(test => {
            const config = typeConfig[test.type] || typeConfig.Custom;
            return (
              <Link key={test._id} to={`/test/${test._id}`} className="card group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-lg group-hover:bg-white/[0.08] transition-colors duration-200">
                      {config.icon}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">{test.type}</span>
                      <h3 className="text-sm font-semibold text-white leading-tight mt-0.5 group-hover:text-white/90 transition-colors">
                        {lang === 'mr' && test.titleMr ? test.titleMr : test.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 mb-5 line-clamp-2 leading-relaxed">
                  {lang === 'mr' && test.descriptionMr ? test.descriptionMr : test.description}
                </p>

                <div className="flex items-center justify-between text-xs pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-4 text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                      {test.totalMarks} {t('test.marks')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {test.duration} {t('test.minutes')}
                    </span>
                  </div>
                  <span className="text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                    {t('test.start')}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
