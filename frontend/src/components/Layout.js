// frontend/src/components/Layout.js
import React, { useContext } from 'react';
import Navigation from './Navigation';
import IdleTimer from './IdleTimer';
import AuthContext from '../context/AuthContext';

function Layout({ children }) {
  const { auth } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <Navigation />
        {auth?.user && (
          <div className="text-right pr-4 pb-1">
            <span className="text-gray-500 text-xs">
              Sesión iniciada como: {auth.user.email}
            </span>
          </div>
        )}
      </header>

      {/* Espaciador para compensar la altura del header */}
      <div className="h-24"></div>

      {/* IdleTimer se activa globalmente */}
      <IdleTimer />

      {/* Área principal */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer fijo */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-200 text-center py-4 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Q-Alimentaria. Todos los derechos reservados. |
        <a href="/legal/aviso-legal" className="text-blue-600 hover:underline ml-2">Aviso legal</a> |
        <a href="/legal/politica-privacidad" className="text-blue-600 hover:underline ml-2">Política de privacidad</a> |
        <a href="/legal/politica-cookies" className="text-blue-600 hover:underline ml-2">Política de cookies</a>
      </footer>

      {/* Espaciador para compensar el footer fijo */}
      <div className="h-16"></div>
    </div>
  );
}

export default Layout;
