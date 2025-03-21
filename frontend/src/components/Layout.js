// frontend/src/components/Layout.js
import React from 'react';
import Navigation from './Navigation';
import IdleTimer from './IdleTimer';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header fijo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <Navigation />
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
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-200 text-center py-4">
        &copy; {new Date().getFullYear()} Q-Alimentaria. Todos los derechos reservados.
      </footer>

      {/* Espaciador para compensar el footer fijo */}
      <div className="h-16"></div>
    </div>
  );
}

export default Layout;
