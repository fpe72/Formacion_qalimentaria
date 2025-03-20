import React from 'react';
import Navigation from './Navigation';
import IdleTimer from './IdleTimer';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      {/* IdleTimer se mantiene global para la detección de inactividad */}
      <IdleTimer />
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-gray-200 text-center py-4">
        &copy; {new Date().getFullYear()} Q-Alimentaria. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default Layout;
