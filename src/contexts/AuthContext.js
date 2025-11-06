import React, { createContext, useState, useCallback } from 'react';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = Cookies.get('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return Cookies.get('token') || null;
  });

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.equipo25.edu/rag';

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store token
        setToken(data.accessToken);
        Cookies.set('token', data.accessToken, {
          expires: data.expiresIn / (24 * 60 * 60) // Convert seconds to days
        });

        // Get user info using the token
        const userResponse = await fetch(`${apiBaseUrl}/users/me`, {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          Cookies.set('user', JSON.stringify(userData), {
            expires: data.expiresIn / (24 * 60 * 60)
          });
          return { success: true };
        }
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Credenciales inválidas'
        };
      }
    } catch (error) {
      console.error('Error durante inicio:', error);
      return { 
        success: false, 
        error: 'Error de conexión al servidor'
      };
    }
  }, [apiBaseUrl]);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint
      if (token) {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state and cookies regardless of server response
      setUser(null);
      setToken(null);
      Cookies.remove('user');
      Cookies.remove('token');
    }
  }, [apiBaseUrl, token]);
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
