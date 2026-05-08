import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);
  const loadUsers = () => api.get('/users').then(r => { setUsers(r.data); setLoading(false); }).catch(() => setLoading(false));

  const changeRole = async (id, role) => {
    await api.put(`/users/${id}/role`, { role });
    loadUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    loadUsers();
  };

  const roleBadge = {
    admin: 'badge-red',
    tester: 'badge-violet',
    participant: 'badge-blue',
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-18 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">User Management</h1>
        <p className="text-sm text-neutral-500 mt-0.5">{users.length} registered users</p>
      </div>

      <div className="space-y-3">
        {users.map(u => (
          <div key={u._id} className="card-static flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/60 to-violet-500/60 flex items-center justify-center text-sm font-semibold text-white ring-1 ring-white/10 flex-shrink-0">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-white truncate">{u.name}</h3>
                <p className="text-xs text-neutral-500 truncate">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <select value={u.role} onChange={e => changeRole(u._id, e.target.value)} className="input-field !py-1.5 !text-xs !w-32">
                <option value="participant">Participant</option>
                <option value="tester">Tester</option>
                <option value="admin">Admin</option>
              </select>
              <span className={`badge ${roleBadge[u.role] || 'badge-neutral'}`}>{u.role}</span>
              <button onClick={() => deleteUser(u._id)} className="btn-ghost text-xs text-red-400 hover:text-red-300 !px-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
