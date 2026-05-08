import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function TestBuilder() {
  const [tests, setTests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', titleMr: '', description: '', descriptionMr: '', type: 'Custom', duration: 15, totalMarks: 30 });

  useEffect(() => { loadTests(); }, []);
  const loadTests = () => api.get('/tests').then(r => setTests(r.data)).catch(() => {});

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tests', form);
      setShowForm(false);
      setForm({ title: '', titleMr: '', description: '', descriptionMr: '', type: 'Custom', duration: 15, totalMarks: 30 });
      loadTests();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test?')) return;
    await api.delete(`/tests/${id}`);
    loadTests();
  };

  const handlePublish = async (id, isPublished) => {
    await api.put(`/tests/${id}`, { isPublished: !isPublished });
    loadTests();
  };

  return (
    <div className="p-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text">Test Builder</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-6 py-2 rounded-xl gradient-btn text-white font-medium">+ Create Test</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Title (EN)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="input-field" />
            <input placeholder="Title (MR)" value={form.titleMr} onChange={e => setForm({ ...form, titleMr: e.target.value })} className="input-field" />
            <input placeholder="Description (EN)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" />
            <input placeholder="Description (MR)" value={form.descriptionMr} onChange={e => setForm({ ...form, descriptionMr: e.target.value })} className="input-field" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
              <option value="Custom">Custom</option><option value="MMSE">MMSE</option><option value="MoCA">MoCA</option><option value="ACE-III">ACE-III</option><option value="CDR">CDR</option>
            </select>
            <input type="number" placeholder="Duration (min)" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="input-field" />
            <input type="number" placeholder="Total Marks" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} className="input-field" />
          </div>
          <button type="submit" className="px-6 py-2 rounded-xl gradient-btn text-white font-medium">Create</button>
        </form>
      )}

      <div className="space-y-4">
        {tests.map(test => (
          <div key={test._id} className="card flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">{test.title}</h3>
              <p className="text-sm text-slate-400">{test.type} • {test.totalMarks} marks • {test.duration} min</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePublish(test._id, test.isPublished)}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${test.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/50 text-slate-400'}`}>
                {test.isPublished ? 'Published' : 'Draft'}
              </button>
              <Link to={`/tests/${test._id}`} className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium">Edit</Link>
              <button onClick={() => handleDelete(test._id)} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
