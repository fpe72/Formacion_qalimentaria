// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null });

  /** 🔐 Cierre de sesión centralizado */
  const logout = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
  };
  

  /** Al montar, buscamos y validamos el token */
  useEffect(() => {
    const token = localStorage.getItem('token');

    // 🛑 Si el token está vacío, "null" o es cadena vacía → limpiamos y salimos
    if (!token || token === 'null' || token.trim() === '') {
      logout();
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // ⏳ Comprobamos expiración (exp es en segundos)
      if (decoded.exp && Date.now() / 1000 > decoded.exp) {
        console.warn('🔔 Token expirado — cerrando sesión automáticamente');
        logout();
      } else {
        // 🔌 Conectar socket en producción y local
          if (!socket) {
            socket = io(process.env.REACT_APP_BACKEND_URL.replace(/\/api.*$/, ''));
            socket.emit('auth', token);
          }
      }
    } catch (err) {
      console.error('Error al decodificar el token:', err);
      logout(); // token corrupto → limpiar
    }
  }, []);

  let socket = null;

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
