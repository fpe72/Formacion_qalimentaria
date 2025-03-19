import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Navigation() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(auth?.token);
  const isAdmin = auth?.user?.role === 'admin';

  const handleLogout = () => {
    // Eliminar token del localStorage
    localStorage.removeItem('token');
    // Actualizar el contexto para limpiar la información del usuario
    setAuth({ token: null, user: null });
    // Redirigir a la página de inicio
    navigate('/');
  };

  return (
    <nav style={{ margin: '10px' }}>
      <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
      <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
      <Link to="/register" style={{ marginRight: '10px' }}>Register</Link>
      <Link to="/protected" style={{ marginRight: '10px' }}>Protected</Link>
      <Link to="/modules" style={{ marginRight: '10px' }}>Módulos</Link>
      <Link to="/progress" style={{ marginRight: '10px' }}>Progreso</Link>
      {isAdmin && <Link to="/create-module" style={{ marginRight: '10px' }}>Crear Módulo</Link>}
      {isLoggedIn && <button onClick={handleLogout}>Cerrar Sesión</button>}
    </nav>
  );
}

export default Navigation;
