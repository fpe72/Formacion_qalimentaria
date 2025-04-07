// frontend/src/components/Navigation.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/images/logo.png';


function Navigation() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
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
        {/* Bloque izquierdo: logo y navegación principal */}
        <div className="flex items-center">
          <img src={logo} alt="Logo corporativo" className="w-48 mr-4" />
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary">Home</Link>
            {isLoggedIn && (
              <>
                <Link to="/modules" className="text-gray-700 hover:text-primary">Módulos</Link>
                <Link to="/progress" className="text-gray-700 hover:text-primary">Progreso</Link>
                {isAdmin && (
                  <>
                    <Link to="/create-module" className="text-gray-700 hover:text-primary">Crear Módulo</Link>
                    <Link to="/create-final-exam" className="text-gray-700 hover:text-primary">Gestionar Examen Final</Link>
                    <Link to="/exams" className="text-gray-700 hover:text-primary">Ver Exámenes</Link>
                    <Link to="/admin/create-company" className="text-gray-700 hover:text-primary">Crear Empresa</Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bloque derecho: Login/Register o botón de Logout */}
        <div className="flex items-center">
          {!isLoggedIn ? (
            <div className="hidden md:flex space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary">Login</Link>
              <Link to="/register" className="text-gray-700 hover:text-primary">Register</Link>
            </div>
          ) : (
            <button 
              onClick={handleLogout} 
              className="bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition-colors duration-300"
            >
              Cerrar Sesión
            </button>
          )}
        
        </div>

        {/* Versión móvil del menú de autenticación */}
        <div className="flex flex-col md:hidden items-center space-y-2 mt-4">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded w-full max-w-xs text-center">Login</Link>
              <Link to="/register" className="px-4 py-2 bg-green-500 text-white rounded w-full max-w-xs text-center">Register</Link>
            </>
          ) : (
            <>
              {isAdmin && <Link to="/admin" className="text-gray-700 text-center w-full">Panel admin</Link>}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded w-full max-w-xs"
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;