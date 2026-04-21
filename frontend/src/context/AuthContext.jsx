import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on page refresh
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setUser({
        username: localStorage.getItem('username'),
        role: localStorage.getItem('user_role'),
        id: localStorage.getItem('user_id'),
      });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await apiClient.post('auth/login/', { username, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('username', data.username);
    const me = { username: data.username, role: data.role };
    setUser(me);
    return me;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}