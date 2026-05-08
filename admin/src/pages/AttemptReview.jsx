import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function AttemptReview() {
  const [attempts, setAttempts] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    api.get(`/attempts/all${params}`).then(r => { setAttempts(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [filter]);

  const filters = [
    { value: '', label: 'All' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'graded', label: 'Graded' },
  ];

  const statusBadge = (status) => {
    if (status === 'graded') return 'badge-green';
    if (status === 'submitted') return 'badge-yellow';
    return 'badge-blue';
  };

  return (
    <div className="p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Attempt Review</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{attempts.length} attempts found</p>
        </div>
        <div className="flex gap-1.5">
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                filter === f.value
                  ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03] border border-transparent'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map(a => (
            <div key={a._id} className="card-static flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-white truncate">{a.test?.title || 'Unknown Test'}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{a.user?.name} ({a.user?.email})</p>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Score: {a.totalScore}/{a.maxScore} · {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0 ml-4">
                <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
                {a.status === 'submitted' && (
                  <Link to={`/attempts/${a._id}/grade`} className="btn-primary text-xs !px-3 !py-1.5">Grade</Link>
                )}
                {a.status === 'graded' && (
                  <Link to={`/attempts/${a._id}/grade`} className="btn-secondary text-xs !px-3 !py-1.5">View</Link>
                )}
              </div>
            </div>
          ))}
          {attempts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" />
                </svg>
              </div>
              <p className="text-sm text-neutral-500">No attempts found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
