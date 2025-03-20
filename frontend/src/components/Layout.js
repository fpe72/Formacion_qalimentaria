import React from 'react';
import Navigation from './Navigation';
import IdleTimer from './IdleTimer';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header fijo */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <Navigation />
      </header>

      {/* IdleTimer se puede mantener global */}
      <IdleTimer />

      {/* Área principal: añadimos padding superior e inferior para compensar el header y el footer */}
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        {children}
      </main>

      {/* Footer fijo */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-200 text-center py-4">
        &copy; {new Date().getFullYear()} Q-Alimentaria. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default Layout;
