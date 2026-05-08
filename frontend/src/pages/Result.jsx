import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

export default function Result() {
  const { attemptId } = useParams();
  const { t, lang } = useLang();
  const [attempt, setAttempt] = useState(null);
  const [responses, setResponses] = useState([]);
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    api.get(`/attempts/${attemptId}`).then(r => {
      setAttempt(r.data);
      if (r.data.aiSummary) setAiSummary(r.data.aiSummary);
    }).catch(() => {});
    api.get(`/responses/attempt/${attemptId}`).then(r => setResponses(r.data)).catch(() => {});
    // Also try to fetch AI summary
    api.get(`/ai/summary/${attemptId}`).then(r => {
      if (r.data.summary) setAiSummary(r.data.summary);
    }).catch(() => {});
  }, [attemptId]);

  if (!attempt) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="skeleton h-8 w-48 mx-auto mb-8" />
        <div className="skeleton h-40 rounded-2xl mb-8" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const pct = attempt.maxScore > 0 ? Math.round((attempt.totalScore / attempt.maxScore) * 100) : 0;

  const statusInfo = () => {
    if (attempt.status === 'graded') return { text: t('result.graded'), cls: 'badge-green' };
    if (attempt.status === 'submitted') return { text: t('result.pending'), cls: 'badge-yellow' };
    return { text: t('result.submitted'), cls: 'badge-blue' };
  };
  const si = statusInfo();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-white tracking-tight mb-1.5">{t('result.title')}</h1>
        <p className="text-sm text-neutral-500">{lang === 'mr' && attempt.test?.titleMr ? attempt.test.titleMr : attempt.test?.title}</p>
      </div>

      {/* Score card */}
      <div className="card-static mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-semibold text-white tracking-tight mb-1">
              {attempt.totalScore}
              <span className="text-base text-neutral-600 font-normal">/{attempt.maxScore}</span>
            </div>
            <div className="text-xs text-neutral-500 font-medium">{t('result.totalScore')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-semibold text-blue-400 tracking-tight mb-1">{pct}%</div>
            <div className="text-xs text-neutral-500 font-medium">{lang === 'mr' ? 'टक्केवारी' : 'Percentage'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-400 tracking-tight mb-1">{attempt.autoScore || 0}</div>
            <div className="text-xs text-neutral-500 font-medium">{t('result.autoScore')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-violet-400 tracking-tight mb-1">{(attempt.aiScore || 0) + (attempt.manualScore || 0)}</div>
            <div className="text-xs text-neutral-500 font-medium">{lang === 'mr' ? 'AI + मॅन्युअल' : 'AI + Manual'}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-5 text-center">
          <span className={`badge ${si.cls}`}>{si.text}</span>
        </div>
      </div>

      {/* AI Cognitive Summary */}
      {aiSummary && (
        <div className="card-static mb-8 animate-fadeIn" style={{ borderColor: 'rgba(6, 182, 212, 0.15)', background: 'rgba(6, 182, 212, 0.03)' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-cyan-300">
              {lang === 'mr' ? 'AI संज्ञानात्मक सारांश' : 'AI Cognitive Summary'}
            </h3>
            <span className="badge text-[10px]" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee' }}>Gemini</span>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{aiSummary}</p>
        </div>
      )}

      {/* Response details */}
      <div className="card-static mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white">
            {lang === 'mr' ? 'प्रतिसाद तपशील' : 'Response Details'}
          </h2>
          <span className="text-xs text-neutral-500 font-medium">{responses.length} {lang === 'mr' ? 'प्रश्न' : 'questions'}</span>
        </div>

        <div className="space-y-3">
          {responses.map((r, i) => {
            const qText = lang === 'mr' && r.question?.textMr ? r.question.textMr : r.question?.text;
            const graded = r.isAutoGraded || r.isManuallyGraded || r.isAiGraded;
            return (
              <div key={r._id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.03]">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="text-xs font-semibold text-neutral-500 mt-0.5 flex-shrink-0">Q{i + 1}</span>
                    <div>
                      <span className="text-sm font-medium text-neutral-200 leading-relaxed">{qText}</span>
                      {r.isAiGraded && (
                        <span className="badge text-[9px] ml-2" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>AI</span>
                      )}
                    </div>
                  </div>
                  <span className={`badge flex-shrink-0 ${
                    graded ? (r.isCorrect ? 'badge-green' : (r.marksAwarded > 0 ? 'badge-blue' : 'badge-red')) : 'badge-neutral'
                  }`}>
                    {r.marksAwarded || 0}/{r.question?.marks || 0}
                  </span>
                </div>

                {r.textAnswer && (
                  <p className="text-sm text-neutral-400 ml-7">
                    <span className="text-neutral-600">{lang === 'mr' ? 'उत्तर' : 'Answer'}:</span> {r.textAnswer}
                  </p>
                )}
                {r.numericalAnswer !== undefined && r.numericalAnswer !== null && (
                  <p className="text-sm text-neutral-400 ml-7">
                    <span className="text-neutral-600">{lang === 'mr' ? 'उत्तर' : 'Answer'}:</span> {r.numericalAnswer}
                  </p>
                )}
                {r.fileUrl && (
                  <div className="mt-2 ml-7">
                    <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline inline-flex items-center gap-1.5 font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                      </svg>
                      {lang === 'mr' ? 'अपलोड केलेली फाइल पहा' : 'View uploaded file'}
                    </a>
                    {r.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <img src={r.fileUrl} alt="response" className="mt-2 max-h-40 rounded-lg border border-white/[0.06]" />
                    )}
                  </div>
                )}

                {/* AI Feedback */}
                {r.aiFeedback && (
                  <div className="mt-3 ml-7 flex items-start gap-2 rounded-lg p-3" style={{ background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                    <svg className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <div>
                      <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">AI Analysis</span>
                      <p className="text-sm text-violet-300/80 mt-0.5">{r.aiFeedback}</p>
                    </div>
                  </div>
                )}

                {/* Manual feedback */}
                {r.feedback && (
                  <div className="mt-2 ml-7 flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <p className="text-sm text-yellow-300/70">{r.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Back */}
      <div className="text-center">
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('result.backToDashboard')}
        </Link>
      </div>
    </div>
  );
}
