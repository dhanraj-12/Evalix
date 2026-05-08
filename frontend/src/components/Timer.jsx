import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';

export default function Timer({ duration, onTimeUp }) {
  const [seconds, setSeconds] = useState(duration * 60);
  const { t } = useLang();

  useEffect(() => {
    if (seconds <= 0) { onTimeUp?.(); return; }
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds < 120;
  const pct = (seconds / (duration * 60)) * 100;

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
      isLow
        ? 'bg-red-500/[0.08] border border-red-500/20 pulse-glow'
        : 'bg-white/[0.04] border border-white/[0.06]'
    }`}>
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <circle
            cx="12" cy="12" r="10" fill="none"
            stroke={isLow ? '#ef4444' : '#3b82f6'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (1 - pct / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
      </div>
      <span className={`font-mono text-base font-semibold tracking-wider ${
        isLow ? 'text-red-400' : 'text-white'
      }`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
        {t('test.timeLeft')}
      </span>
    </div>
  );
}
