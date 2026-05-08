import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function GradeAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [responses, setResponses] = useState([]);
  const [grading, setGrading] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => { loadData(); }, [id]);

  const loadData = () => {
    api.get(`/attempts/${id}`).then(r => setAttempt(r.data)).catch(() => {});
    api.get(`/responses/attempt/${id}`).then(r => setResponses(r.data)).catch(() => {});
  };

  const handleAutoGrade = async () => {
    await api.post(`/grading/auto/${id}`);
    loadData();
  };

  const handleAiGrade = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      await api.post(`/ai/grade/${id}`);
      loadData();
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI grading failed');
    }
    setAiLoading(false);
  };

  const handleAiSummary = async () => {
    setSummaryLoading(true);
    setAiError('');
    try {
      await api.post(`/ai/summary/${id}`);
      loadData();
    } catch (err) {
      setAiError(err.response?.data?.message || 'Summary generation failed');
    }
    setSummaryLoading(false);
  };

  const handleManualGrade = async (responseId) => {
    const g = grading[responseId];
    if (!g) return;
    await api.post('/grading/manual', { responseId, marksAwarded: parseFloat(g.marks) || 0, feedback: g.feedback || '' });
    loadData();
  };

  if (!attempt) return (
    <div className="p-8">
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="skeleton h-4 w-64 mb-6" />
      <div className="skeleton h-24 rounded-2xl mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    </div>
  );

  const hasTextOrFile = responses.some(r => r.question?.type === 'Text' || r.question?.type === 'FileUpload');

  return (
    <div className="p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Grade Attempt</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{attempt.test?.title} — {attempt.user?.name}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAutoGrade} className="btn-success flex items-center gap-2 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Auto Grade
          </button>
          {hasTextOrFile && (
            <button onClick={handleAiGrade} disabled={aiLoading} className="flex items-center gap-2 text-xs px-5 py-2.5 rounded-xl font-medium text-white transition-all duration-200 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
              {aiLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Grading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  ✨ AI Grade
                </>
              )}
            </button>
          )}
          <button onClick={handleAiSummary} disabled={summaryLoading} className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
            style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', color: '#22d3ee' }}>
            {summaryLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
                AI Summary
              </>
            )}
          </button>
          <button onClick={() => navigate('/attempts')} className="btn-secondary text-xs flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* AI error */}
      {aiError && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.06] border border-red-500/10 mb-6 animate-fadeIn">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm text-red-400">{aiError}</span>
        </div>
      )}

      {/* AI Cognitive Summary */}
      {attempt.aiSummary && (
        <div className="card-static mb-8 animate-fadeIn" style={{ borderColor: 'rgba(6, 182, 212, 0.15)', background: 'rgba(6, 182, 212, 0.03)' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-cyan-300">AI Cognitive Summary</h3>
            <span className="badge text-[10px]" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee' }}>Gemini</span>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{attempt.aiSummary}</p>
        </div>
      )}

      {/* Score summary */}
      <div className="card-static mb-8">
        <div className="grid grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-white tracking-tight">{attempt.totalScore}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mt-1">Total</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-blue-400 tracking-tight">{attempt.autoScore}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mt-1">Auto</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-violet-400 tracking-tight">{attempt.aiScore || 0}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mt-1">AI</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-amber-400 tracking-tight">{attempt.manualScore}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mt-1">Manual</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-neutral-500 tracking-tight">{attempt.maxScore}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mt-1">Max</div>
          </div>
        </div>
      </div>

      {/* Responses */}
      <div className="space-y-4">
        {responses.map((r, i) => (
          <div key={r._id} className="card-static">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="text-xs font-semibold text-neutral-500 mt-0.5">Q{i + 1}</span>
                <div>
                  <span className="text-sm font-medium text-white">{r.question?.text}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="badge badge-neutral text-[10px]">{r.question?.type}</span>
                    {r.isAiGraded && <span className="badge text-[10px]" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>AI Graded</span>}
                    {r.isAutoGraded && <span className="badge badge-blue text-[10px]">Auto</span>}
                    {r.isManuallyGraded && <span className="badge badge-green text-[10px]">Manual</span>}
                  </div>
                </div>
              </div>
              <span className={`text-sm font-semibold flex-shrink-0 ${
                r.isAutoGraded || r.isManuallyGraded || r.isAiGraded ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {r.marksAwarded}/{r.question?.marks}
              </span>
            </div>

            {r.selectedOptions?.length > 0 && (
              <p className="text-sm text-neutral-400 mb-2 ml-7">
                <span className="text-neutral-600">Selected:</span> {r.question?.options?.filter(o => r.selectedOptions.includes(o._id)).map(o => o.text).join(', ')}
              </p>
            )}
            {r.textAnswer && <p className="text-sm text-neutral-400 mb-2 ml-7"><span className="text-neutral-600">Answer:</span> <span className="text-neutral-200">{r.textAnswer}</span></p>}
            {r.numericalAnswer !== undefined && r.numericalAnswer !== null && <p className="text-sm text-neutral-400 mb-2 ml-7"><span className="text-neutral-600">Answer:</span> <span className="text-neutral-200">{r.numericalAnswer}</span></p>}
            {r.fileUrl && (
              <div className="mb-2 ml-7">
                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline inline-flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                  </svg>
                  View file
                </a>
                {r.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && <img src={r.fileUrl} alt="response" className="mt-2 max-h-48 rounded-lg border border-white/[0.06]" />}
              </div>
            )}

            {/* AI Feedback */}
            {r.aiFeedback && (
              <div className="mt-2 ml-7 flex items-start gap-2 rounded-lg p-3" style={{ background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                <svg className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <p className="text-sm text-violet-300/80">{r.aiFeedback}</p>
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

            {/* Manual grading form (show for ungraded Text/FileUpload) */}
            {(r.question?.type === 'Text' || r.question?.type === 'FileUpload') && !r.isManuallyGraded && !r.isAiGraded && (
              <div className="flex gap-3 items-end mt-4 pt-4 ml-7" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-24">
                  <label className="label">Marks</label>
                  <input type="number" max={r.question?.marks} min={0} className="input-field !py-2 !text-sm"
                    value={grading[r._id]?.marks || ''} onChange={e => setGrading({ ...grading, [r._id]: { ...grading[r._id], marks: e.target.value } })} />
                </div>
                <div className="flex-1">
                  <label className="label">Feedback</label>
                  <input className="input-field !py-2 !text-sm" placeholder="Optional feedback"
                    value={grading[r._id]?.feedback || ''} onChange={e => setGrading({ ...grading, [r._id]: { ...grading[r._id], feedback: e.target.value } })} />
                </div>
                <button onClick={() => handleManualGrade(r._id)} className="btn-primary text-xs !px-4 !py-2">Grade</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
