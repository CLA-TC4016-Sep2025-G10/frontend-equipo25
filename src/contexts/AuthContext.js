import React, { createContext, useState, useCallback } from 'react';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    // Intenta obtener el usuario de las cookies al cargar el componente
    const storedUser = Cookies.get('username');
    return storedUser ? storedUser : null;
  });

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000'; // Valor por defecto
  console.log(apiBaseUrl);

  const login = useCallback(async (username, password) => {
    try {
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setUser(username);
        // Guarda el username en una cookie
        Cookies.set('username', username, { expires: 7 }); // Expira en 7 días
        return true;
      } else {
        const data = await response.json();
        console.error('Inicio con error:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Error durante inicio:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    // Elimina la cookie del username al cerrar sesión
    Cookies.remove('username');
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
