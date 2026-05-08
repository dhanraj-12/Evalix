import { useState, useRef, useEffect } from 'react';
import MediaPlayer from './MediaPlayer';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

export default function QuestionRenderer({ question, response, onResponseChange, attemptId }) {
  const { lang, t } = useLang();
  const [uploading, setUploading] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const qText = lang === 'mr' && question.textMr ? question.textMr : question.text;

  // Canvas drawing setup
  useEffect(() => {
    if (!showCanvas || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, [showCanvas]);

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current = getCanvasPos(e);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const stopDraw = () => { isDrawingRef.current = false; };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const submitDrawing = async () => {
    if (!canvasRef.current) return;
    setUploading(true);
    try {
      const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));
      const formData = new FormData();
      formData.append('file', blob, 'drawing.png');
      formData.append('attempt', attemptId);
      formData.append('question', question._id);
      const res = await api.post('/responses/upload', formData);
      onResponseChange({ ...response, fileUrl: res.data.fileUrl });
    } catch (err) { console.error('Drawing upload failed:', err); }
    setUploading(false);
  };

  const handleOptionToggle = (optId) => {
    if (question.type === 'SCMCQ') {
      onResponseChange({ ...response, selectedOptions: [optId] });
    } else {
      const current = response?.selectedOptions || [];
      const updated = current.includes(optId)
        ? current.filter(id => id !== optId)
        : [...current, optId];
      onResponseChange({ ...response, selectedOptions: updated });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('attempt', attemptId);
      formData.append('question', question._id);
      const res = await api.post('/responses/upload', formData);
      onResponseChange({ ...response, fileUrl: res.data.fileUrl });
    } catch (err) { console.error('Upload failed:', err); }
    setUploading(false);
  };

  return (
    <div className="animate-fadeIn">
      {/* Question header */}
      <div className="flex items-center justify-between mb-5">
        <span className="badge badge-neutral text-[11px] uppercase tracking-wider">{question.type}</span>
        <span className="text-xs text-neutral-500 font-medium">{question.marks} {t('test.marks')}</span>
      </div>

      {/* Question text */}
      <h3 className="text-lg font-medium text-white mb-5 leading-relaxed tracking-tight">{qText}</h3>

      <MediaPlayer media={question.media} className="mb-5" />

      {/* MCQ Options */}
      {(question.type === 'SCMCQ' || question.type === 'MCMCQ') && (
        <div className="space-y-2.5">
          {question.options?.map(opt => {
            const optText = lang === 'mr' && opt.textMr ? opt.textMr : opt.text;
            const isSelected = response?.selectedOptions?.includes(opt._id);
            return (
              <button
                key={opt._id}
                onClick={() => handleOptionToggle(opt._id)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 group ${
                  isSelected
                    ? 'border-blue-500/30 bg-blue-500/[0.08] text-white'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-5 h-5 flex-shrink-0 ${
                    question.type === 'SCMCQ' ? 'rounded-full' : 'rounded-[5px]'
                  } border-2 flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-neutral-600 group-hover:border-neutral-500'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{optText}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Text answer */}
      {question.type === 'Text' && (
        <textarea
          value={response?.textAnswer || ''}
          onChange={e => onResponseChange({ ...response, textAnswer: e.target.value })}
          placeholder={t('test.typeAnswer')}
          rows={4}
          className="input-field resize-none"
        />
      )}

      {/* Numerical answer */}
      {question.type === 'Numerical' && (
        <input
          type="number"
          value={response?.numericalAnswer ?? ''}
          onChange={e => onResponseChange({ ...response, numericalAnswer: e.target.value })}
          placeholder={t('test.enterNumber')}
          className="input-field"
        />
      )}

      {/* File upload / Drawing */}
      {question.type === 'FileUpload' && (
        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowCanvas(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !showCanvas
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {t('test.uploadFile')}
              </span>
            </button>
            <button
              onClick={() => setShowCanvas(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showCanvas
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-neutral-500 hover:text-neutral-300 border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {lang === 'mr' ? 'चित्र काढा' : 'Draw'}
              </span>
            </button>
          </div>

          {!showCanvas ? (
            <div className="border border-dashed border-white/[0.08] rounded-xl p-8 text-center hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all duration-300 group cursor-pointer">
              <input type="file" id={`file-${question._id}`} accept="image/*,audio/*,video/*,.pdf" capture="environment" onChange={handleFileUpload} className="hidden" />
              <label htmlFor={`file-${question._id}`} className="cursor-pointer flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-blue-500/10 transition-colors duration-200">
                  <svg className="w-6 h-6 text-neutral-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </div>
                <span className="text-sm text-neutral-500 font-medium">
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('common.loading')}
                    </span>
                  ) : t('test.uploadFile')}
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white">
                <canvas ref={canvasRef} width={500} height={350}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                  style={{ width: '100%', maxHeight: '350px', cursor: 'crosshair', touchAction: 'none' }} />
              </div>
              <div className="flex gap-2">
                <button onClick={clearCanvas} className="btn-secondary text-xs">
                  {lang === 'mr' ? 'पुसा' : 'Clear'}
                </button>
                <button onClick={submitDrawing} disabled={uploading} className="btn-primary text-xs">
                  {uploading ? t('common.loading') : (lang === 'mr' ? 'जतन करा' : 'Save Drawing')}
                </button>
              </div>
            </div>
          )}

          {/* Upload success */}
          {response?.fileUrl && (
            <div className="rounded-xl border border-green-500/10 bg-green-500/[0.04] p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-neutral-300 font-medium">{lang === 'mr' ? 'फाइल अपलोड झाली' : 'File uploaded successfully'}</span>
                <a href={response.fileUrl} target="_blank" rel="noreferrer" className="text-blue-400 text-xs ml-auto hover:underline font-medium">
                  {lang === 'mr' ? 'पहा' : 'View'}
                </a>
              </div>
              {response.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                <img src={response.fileUrl} alt="Uploaded" className="max-h-40 rounded-lg mt-2 border border-white/[0.06]" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
