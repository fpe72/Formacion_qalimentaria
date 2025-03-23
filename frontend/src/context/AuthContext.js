// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null });

  // Al montar, buscamos el token en localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAuth({ token, user: decoded });
      } catch (err) {
        console.error('Error al decodificar el token:', err);
        setAuth({ token: null, user: null });
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
