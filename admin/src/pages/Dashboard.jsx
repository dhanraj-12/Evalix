import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tests: 0, users: 0, attempts: 0, pendingGrading: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tests'),
      api.get('/users'),
      api.get('/attempts/all')
    ]).then(([tests, users, attempts]) => {
      setStats({
        tests: tests.data.length,
        users: users.data.length,
        attempts: attempts.data.length,
        pendingGrading: attempts.data.filter(a => a.status === 'submitted').length
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Total Tests',
      value: stats.tests,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3" />
        </svg>
      ),
      color: 'text-blue-400',
      bg: 'bg-blue-500/[0.06]',
    },
    {
      label: 'Total Users',
      value: stats.users,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: 'text-violet-400',
      bg: 'bg-violet-500/[0.06]',
    },
    {
      label: 'Total Attempts',
      value: stats.attempts,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: 'text-green-400',
      bg: 'bg-green-500/[0.06]',
    },
    {
      label: 'Pending Grading',
      value: stats.pendingGrading,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-amber-400',
      bg: 'bg-amber-500/[0.06]',
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <div className="skeleton h-8 w-64 mb-2" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Welcome, <span className="text-gradient-accent">{user?.name}</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1">Admin Dashboard Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {cards.map(c => (
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
    </div>
  );
}
