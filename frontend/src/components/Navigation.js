// frontend/src/components/Navigation.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '/workspaces/Formacion_qalimentaria/frontend/src/assets/images/logo.png';

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
          <img src={logo} alt="Logo corporativo" className="w-24 mr-4" />
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary">Home</Link>
            {isLoggedIn && (
              <>
                <Link to="/modules" className="text-gray-700 hover:text-primary">Módulos</Link>
                <Link to="/progress" className="text-gray-700 hover:text-primary">Progreso</Link>
                {isAdmin && (
                  <Link to="/create-module" className="text-gray-700 hover:text-primary">Crear Módulo</Link>
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
      </div>
    </nav>
  );
}

export default Navigation;
