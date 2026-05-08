import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import api from '../utils/api';
import Timer from '../components/Timer';
import QuestionRenderer from '../components/QuestionRenderer';

export default function TestTake() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const testRes = await api.get(`/tests/${testId}`);
        setTest(testRes.data);
        const attemptRes = await api.post('/attempts/start', { testId });
        setAttempt(attemptRes.data);
        const respRes = await api.get(`/responses/attempt/${attemptRes.data._id}`);
        const respMap = {};
        respRes.data.forEach(r => { respMap[r.question?._id || r.question] = r; });
        setResponses(respMap);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    init();
  }, [testId]);

  if (loading || !test) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="skeleton h-6 w-48 mb-2" />
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="skeleton h-10 w-36 rounded-xl" />
        </div>
        <div className="skeleton h-8 w-full mb-6 rounded-xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const sections = test.sections || [];
  const section = sections[currentSection];
  const questions = section?.questions || [];
  const question = questions[currentQuestion];
  const allQuestions = sections.flatMap(s => s.questions || []);
  const currentGlobalIdx = sections.slice(0, currentSection).reduce((sum, s) => sum + (s.questions?.length || 0), 0) + currentQuestion;

  const handleResponseChange = async (data) => {
    const qId = question._id;
    setResponses(prev => ({ ...prev, [qId]: { ...prev[qId], ...data } }));
    try {
      await api.post('/responses', { attempt: attempt._id, question: qId, ...data });
    } catch (err) { console.error(err); }
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(q => q + 1);
    else if (currentSection < sections.length - 1) { setCurrentSection(s => s + 1); setCurrentQuestion(0); }
  };

  const goPrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(q => q - 1);
    else if (currentSection > 0) {
      const prevSection = sections[currentSection - 1];
      setCurrentSection(s => s - 1);
      setCurrentQuestion((prevSection.questions?.length || 1) - 1);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm(t('test.confirmSubmit'))) return;
    try {
      await api.put(`/attempts/${attempt._id}/submit`);
      navigate(`/result/${attempt._id}`);
    } catch (err) { console.error(err); }
  };

  const isLast = currentSection === sections.length - 1 && currentQuestion === questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">
            {lang === 'mr' && test.titleMr ? test.titleMr : test.title}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {lang === 'mr' && section?.titleMr ? section.titleMr : section?.title}
          </p>
        </div>
        {test.duration > 0 && <Timer duration={test.duration} onTimeUp={handleSubmit} />}
      </div>

      {/* Section tabs */}
      {sections.length > 1 && (
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-thin">
          {sections.map((s, si) => (
            <button key={s._id} onClick={() => { setCurrentSection(si); setCurrentQuestion(0); }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                si === currentSection
                  ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03] border border-transparent'
              }`}>
              {lang === 'mr' && s.titleMr ? s.titleMr : s.title}
            </button>
          ))}
        </div>
      )}

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {allQuestions.map((_, i) => (
          <div key={i}
            className={`stepper-dot ${
              i === currentGlobalIdx ? 'stepper-dot-active'
              : i < currentGlobalIdx ? 'stepper-dot-done'
              : 'stepper-dot-pending'
            }`}
            onClick={() => {
              let count = 0;
              for (let si = 0; si < sections.length; si++) {
                const qs = sections[si].questions || [];
                if (count + qs.length > i) { setCurrentSection(si); setCurrentQuestion(i - count); return; }
                count += qs.length;
              }
            }}
          />
        ))}
      </div>

      {/* Progress indicator text */}
      <div className="flex items-center justify-between text-xs text-neutral-600 mb-5 font-medium">
        <span>{t('test.question')} {currentGlobalIdx + 1} {t('test.of')} {allQuestions.length}</span>
        <span>{t('test.section')} {currentSection + 1} {t('test.of')} {sections.length}</span>
      </div>

      {/* Question card */}
      {question && (
        <div className="card-static mb-8">
          <QuestionRenderer question={question} response={responses[question._id]} onResponseChange={handleResponseChange} attemptId={attempt._id} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goPrev} disabled={currentSection === 0 && currentQuestion === 0}
          className="btn-secondary disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('test.prev')}
        </button>
        {isLast ? (
          <button onClick={handleSubmit} className="btn-success flex items-center gap-2">
            {t('test.submit')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        ) : (
          <button onClick={goNext} className="btn-primary flex items-center gap-2">
            {t('test.next')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
