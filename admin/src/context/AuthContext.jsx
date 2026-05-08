import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('evalix_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(res => {
          if (res.data.role === 'admin' || res.data.role === 'tester') setUser(res.data);
          else { localStorage.removeItem('evalix_admin_token'); setToken(null); }
        })
        .catch(() => { localStorage.removeItem('evalix_admin_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.user.role !== 'admin' && res.data.user.role !== 'tester') throw new Error('Access denied');
    localStorage.setItem('evalix_admin_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => { localStorage.removeItem('evalix_admin_token'); setToken(null); setUser(null); };

  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
