import React, { createContext, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { loginRequest, fetchCurrentUser, logoutRequest } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = Cookies.get('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => Cookies.get('token') || null);

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginRequest({ email, password });

      setToken(data.accessToken);
      Cookies.set('token', data.accessToken, {
        expires: data.expiresIn / (24 * 60 * 60)
      });

      const userData = await fetchCurrentUser(data.accessToken);
      setUser(userData);
      Cookies.set('user', JSON.stringify(userData), {
        expires: data.expiresIn / (24 * 60 * 60)
      });

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
    try {
      if (token) {
        await logoutRequest(token);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setToken(null);
      Cookies.remove('user');
      Cookies.remove('token');
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
