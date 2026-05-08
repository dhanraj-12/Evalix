import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

export default function TestEdit() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionForm, setSectionForm] = useState({ title: '', titleMr: '', order: 0 });
  const [questionForm, setQuestionForm] = useState({ text: '', textMr: '', type: 'SCMCQ', marks: 1, correctAnswer: '' });
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [optionForm, setOptionForm] = useState({ text: '', textMr: '', isCorrect: false });
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');

  useEffect(() => { loadTest(); }, [id]);
  const loadTest = async () => {
    const r = await api.get(`/tests/${id}`);
    setTest(r.data);
    setSections(r.data.sections || []);
  };

  const addSection = async (e) => {
    e.preventDefault();
    await api.post('/sections', { ...sectionForm, test: id });
    setSectionForm({ title: '', titleMr: '', order: sections.length });
    loadTest();
  };

  const deleteSection = async (sid) => {
    if (!window.confirm('Delete section?')) return;
    await api.delete(`/sections/${sid}`);
    loadTest();
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    await api.post('/questions', { ...questionForm, section: activeSectionId });
    setQuestionForm({ text: '', textMr: '', type: 'SCMCQ', marks: 1, correctAnswer: '' });
    loadTest();
  };

  const deleteQuestion = async (qid) => {
    if (!window.confirm('Delete question?')) return;
    await api.delete(`/questions/${qid}`);
    loadTest();
  };

  const addOption = async (e) => {
    e.preventDefault();
    await api.post('/options', { ...optionForm, question: activeQuestionId });
    setOptionForm({ text: '', textMr: '', isCorrect: false });
    loadTest();
  };

  const deleteOption = async (oid) => {
    await api.delete(`/options/${oid}`);
    loadTest();
  };

  const uploadMedia = async (qid) => {
    if (!mediaFile) return;
    const fd = new FormData();
    fd.append('file', mediaFile);
    fd.append('type', mediaType);
    fd.append('questionId', qid);
    await api.post('/media/upload', fd);
    setMediaFile(null);
    loadTest();
  };

  if (!test) return (
    <div className="p-8">
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="skeleton h-4 w-32 mb-6" />
      <div className="skeleton h-20 rounded-2xl mb-4" />
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  );

  return (
    <div className="p-8 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">{test.title}</h1>
        <p className="text-xs text-neutral-500 mt-0.5">{test.type} · {test.totalMarks} marks</p>
      </div>

      {/* Add section form */}
      <form onSubmit={addSection} className="card-static mb-6">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Add Section</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="label">Title (EN)</label>
            <input value={sectionForm.title} onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })} required className="input-field" placeholder="Section title" />
          </div>
          <div className="flex-1">
            <label className="label">Title (MR)</label>
            <input value={sectionForm.titleMr} onChange={e => setSectionForm({ ...sectionForm, titleMr: e.target.value })} className="input-field" placeholder="विभाग शीर्षक" />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap">+ Section</button>
        </div>
      </form>

      {/* Sections */}
      {sections.map(section => (
        <div key={section._id} className="card-static mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              {section.title}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setActiveSectionId(activeSectionId === section._id ? null : section._id)} className="badge badge-blue cursor-pointer text-[11px]">+ Question</button>
              <button onClick={() => deleteSection(section._id)} className="badge badge-red cursor-pointer text-[11px]">Delete</button>
            </div>
          </div>

          {/* Add question form */}
          {activeSectionId === section._id && (
            <form onSubmit={addQuestion} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 mb-4 space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Question (EN)</label>
                  <input placeholder="Question text" value={questionForm.text} onChange={e => setQuestionForm({ ...questionForm, text: e.target.value })} required className="input-field" />
                </div>
                <div>
                  <label className="label">Question (MR)</label>
                  <input placeholder="प्रश्न" value={questionForm.textMr} onChange={e => setQuestionForm({ ...questionForm, textMr: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select value={questionForm.type} onChange={e => setQuestionForm({ ...questionForm, type: e.target.value })} className="input-field">
                    <option value="SCMCQ">Single MCQ</option><option value="MCMCQ">Multi MCQ</option><option value="Numerical">Numerical</option><option value="Text">Text</option><option value="FileUpload">File Upload</option>
                  </select>
                </div>
                <div>
                  <label className="label">Marks</label>
                  <input type="number" value={questionForm.marks} onChange={e => setQuestionForm({ ...questionForm, marks: e.target.value })} className="input-field" />
                </div>
                {questionForm.type === 'Numerical' && (
                  <div>
                    <label className="label">Correct Answer</label>
                    <input placeholder="Correct answer" value={questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} className="input-field" />
                  </div>
                )}
              </div>
              <button type="submit" className="btn-primary text-xs">Add Question</button>
            </form>
          )}

          {/* Questions */}
          {section.questions?.map((q, qi) => (
            <div key={q._id} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-200">
                  <span className="font-semibold text-white">Q{qi + 1}</span>
                  <span className="badge badge-neutral ml-2 text-[10px]">{q.type}</span>
                  <span className="ml-2">{q.text}</span>
                  <span className="text-neutral-600 ml-1">({q.marks}pts)</span>
                </span>
                <div className="flex gap-1.5 flex-shrink-0 ml-3">
                  <button onClick={() => setActiveQuestionId(activeQuestionId === q._id ? null : q._id)} className="badge badge-violet cursor-pointer text-[10px]">Options</button>
                  <button onClick={() => deleteQuestion(q._id)} className="badge badge-red cursor-pointer text-[10px]">Del</button>
                </div>
              </div>

              {q.media?.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {q.media.map(m => <span key={m._id} className="badge badge-neutral text-[10px]">📎 {m.type}</span>)}
                </div>
              )}

              {/* Media upload */}
              <div className="flex items-center gap-2 mb-2">
                <input type="file" onChange={e => setMediaFile(e.target.files[0])} className="text-xs text-neutral-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-white/[0.06] file:text-neutral-400 hover:file:bg-white/[0.1]" />
                <select value={mediaType} onChange={e => setMediaType(e.target.value)} className="input-field !py-1.5 !text-xs !w-24">
                  <option value="image">Image</option><option value="audio">Audio</option><option value="video">Video</option>
                </select>
                <button onClick={() => uploadMedia(q._id)} className="badge badge-green cursor-pointer text-[10px]">Upload</button>
              </div>

              {/* Options */}
              {activeQuestionId === q._id && (q.type === 'SCMCQ' || q.type === 'MCMCQ') && (
                <div className="mt-3 space-y-2 pl-4" style={{ borderLeft: '2px solid rgba(255,255,255,0.06)' }}>
                  {q.options?.map(opt => (
                    <div key={opt._id} className="flex items-center gap-2.5 text-sm">
                      <span className={opt.isCorrect ? 'text-green-400' : 'text-neutral-600'}>
                        {opt.isCorrect ? '✓' : '○'}
                      </span>
                      <span className="text-neutral-300 flex-1">{opt.text}</span>
                      <button onClick={() => deleteOption(opt._id)} className="text-red-400/60 hover:text-red-400 text-xs transition-colors">×</button>
                    </div>
                  ))}
                  <form onSubmit={addOption} className="flex gap-2 items-center pt-2">
                    <input placeholder="Option (EN)" value={optionForm.text} onChange={e => setOptionForm({ ...optionForm, text: e.target.value })} required className="input-field !py-1.5 !text-xs flex-1" />
                    <input placeholder="(MR)" value={optionForm.textMr} onChange={e => setOptionForm({ ...optionForm, textMr: e.target.value })} className="input-field !py-1.5 !text-xs w-28" />
                    <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer">
                      <input type="checkbox" checked={optionForm.isCorrect} onChange={e => setOptionForm({ ...optionForm, isCorrect: e.target.checked })} className="rounded" />
                      Correct
                    </label>
                    <button type="submit" className="btn-primary !px-3 !py-1.5 text-[11px]">Add</button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
