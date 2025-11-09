import React, { createContext, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { loginRequest } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = Cookies.get('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(null);

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginRequest({ email, password });
      const userData = data.user || {
        email,
        name: data.nombre || data.mensaje || 'User'
      };

      setUser(userData);
      Cookies.set('user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Error durante inicio:', error);
      return {
        success: false,
        error: error.message || 'Error de conexión al servidor'
      };
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    Cookies.remove('user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
