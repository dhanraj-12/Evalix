import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [attempts, setAttempts] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/attempts/my').catch(() => ({ data: [] })),
      api.get('/tests/published').catch(() => ({ data: [] }))
    ]).then(([attRes, testRes]) => {
      setAttempts(attRes.data);
      setTests(testRes.data);
      setLoading(false);
    });
  }, []);

  const statusLabel = (s) => {
    if (s === 'graded') return { text: lang === 'mr' ? 'मूल्यांकन पूर्ण' : 'Graded', cls: 'badge-green' };
    if (s === 'submitted') return { text: lang === 'mr' ? 'सबमिट केले' : 'Submitted', cls: 'badge-yellow' };
    return { text: lang === 'mr' ? 'चालू' : 'In Progress', cls: 'badge-blue' };
  };

  const statCards = [
    {
      label: t('dashboard.availableTests'),
      value: tests.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.002.001A11.934 11.934 0 0112 21c-2.632 0-5.095-.846-7.133-2.289a1.593 1.593 0 01-.067-2.511l1.2-1.2" />
        </svg>
      ),
      color: 'text-blue-400',
      bg: 'bg-blue-500/[0.06]',
    },
    {
      label: t('dashboard.recentAttempts'),
      value: attempts.length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: 'text-violet-400',
      bg: 'bg-violet-500/[0.06]',
    },
    {
      label: t('result.graded'),
      value: attempts.filter(a => a.status === 'graded').length,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-400',
      bg: 'bg-green-500/[0.06]',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="skeleton h-8 w-64 mb-2" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fadeIn">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {t('dashboard.welcome')}, <span className="text-gradient-accent">{user?.name}</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Clinical Cognitive Screening Platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 stagger-children">
        {statCards.map(c => (
          <div key={c.label} className="card-static">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.color}`}>
                {c.icon}
              </div>
              <div>
                <div className="text-2xl font-semibold text-white tracking-tight">{c.value}</div>
                <div className="text-xs text-neutral-500 font-medium">{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Tests */}
        <div className="card-static">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">{t('dashboard.availableTests')}</h2>
            <Link to="/tests" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
              View all →
            </Link>
          </div>
          {tests.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m0 0l3-3m-3 3l3 3m-8.25-6.75h1.5a1.125 1.125 0 001.125-1.125V4.125A1.125 1.125 0 005.625 3H4.5m0 0h2.25m-2.25 0v2.25" />
                </svg>
              </div>
              <p className="text-sm text-neutral-500">{t('dashboard.noTests')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tests.map(test => (
                <Link key={test._id} to={`/test/${test._id}`} className="block rounded-xl p-4 -mx-1 transition-all duration-200 hover:bg-white/[0.03] group">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors truncate">
                        {lang === 'mr' && test.titleMr ? test.titleMr : test.title}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-1">
                        {test.type} · {test.totalMarks} {t('test.marks')} · {test.duration} {t('test.minutes')}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-neutral-600 group-hover:text-blue-400 transition-all duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attempts */}
        <div className="card-static">
          <h2 className="text-base font-semibold text-white mb-5">{t('dashboard.recentAttempts')}</h2>
          {attempts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-neutral-500">{t('dashboard.noAttempts')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attempts.slice(0, 5).map(a => {
                const st = statusLabel(a.status);
                return (
                  <Link key={a._id} to={a.status !== 'in_progress' ? `/result/${a._id}` : `/test/${a.test?._id}`} className="block rounded-xl p-4 -mx-1 transition-all duration-200 hover:bg-white/[0.03] group">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors truncate">
                          {lang === 'mr' && a.test?.titleMr ? a.test.titleMr : a.test?.title}
                        </h3>
                        <p className="text-xs text-neutral-600 mt-1">
                          {t('dashboard.score')}: {a.totalScore}/{a.maxScore}
                        </p>
                      </div>
                      <span className={`badge ${st.cls}`}>{st.text}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
