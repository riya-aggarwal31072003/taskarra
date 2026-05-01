import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('taskarra_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('taskarra_token', token);
    localStorage.setItem('taskarra_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('taskarra_token');
    localStorage.removeItem('taskarra_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);