// frontend/src/components/Navigation.js
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/images/logo.png';

function Navigation() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = Boolean(auth?.token);
  const isAdmin = auth?.user?.role === 'admin';


  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Bloque izquierdo: logo y botón hamburguesa */}
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Logo corporativo" className="w-48" />
  
          {/* Botón hamburguesa visible SOLO en móvil */}
          <button
            className="md:hidden text-3xl text-gray-700 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
  
          {/* Menú de navegación - SOLO en escritorio */}
          <div className="hidden md:flex space-x-4 items-center">
              <Link to="/" className="text-gray-700 hover:text-primary">Home</Link>

              {isLoggedIn ? (
                <>
                  <Link to="/modules" className="text-gray-700 hover:text-primary">Módulos</Link>
                  <Link to="/progress" className="text-gray-700 hover:text-primary">Progreso</Link>
                  {isAdmin && (
                    <>
                      <Link to="/create-module" className="text-gray-700 hover:text-primary">Crear Módulo</Link>
                      <Link to="/create-final-exam" className="text-gray-700 hover:text-primary">Gestionar Examen Final</Link>
                      <Link to="/exams" className="text-gray-700 hover:text-primary">Ver Exámenes</Link>
                      <Link to="/admin/create-company" className="text-gray-700 hover:text-primary">Crear Empresa</Link>
                      <Link to="/admin/company-codes" className="text-gray-700 hover:text-primary">Ver Códigos de Empresa</Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded">Login</Link>
                  <Link to="/register" className="px-4 py-2 bg-green-500 text-white rounded">Register</Link>
                </>
              )}
            </div>

        </div>
  
        {/* Botón cerrar sesión - SOLO escritorio */}
        {isLoggedIn && (
          <div className="hidden md:flex">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors duration-300"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
  
      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center space-y-2 bg-white shadow-md py-4">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-700">Home</Link>
          {isLoggedIn && (
            <>
              <Link to="/modules" onClick={() => setMenuOpen(false)} className="text-gray-700">Módulos</Link>
              <Link to="/progress" onClick={() => setMenuOpen(false)} className="text-gray-700">Progreso</Link>
              {isAdmin && (
                <>
                  <Link to="/create-module" onClick={() => setMenuOpen(false)} className="text-gray-700">Crear Módulo</Link>
                  <Link to="/create-final-exam" onClick={() => setMenuOpen(false)} className="text-gray-700">Gestionar Examen Final</Link>
                  <Link to="/exams" onClick={() => setMenuOpen(false)} className="text-gray-700">Ver Exámenes</Link>                  
                  <Link to="/admin/create-company" onClick={() => setMenuOpen(false)} className="text-gray-700">Crear Empresa</Link>
                  <Link to="/admin/company-codes" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ver Códigos de Empresa</Link>
                </>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Cerrar Sesión
              </button>
            </>
          )}
          {!isLoggedIn && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 bg-blue-500 text-white rounded w-full max-w-xs text-center">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2 bg-green-500 text-white rounded w-full max-w-xs text-center">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
  
}

export default Navigation;