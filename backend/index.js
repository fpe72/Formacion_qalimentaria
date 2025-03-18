// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Protected from './pages/Protected';
import ModulesView from './pages/ModulesView';
import ProgressView from './pages/ProgressView';
import CreateModule from './pages/CreateModule';

function App() {
  // Obtener el token de localStorage
  const token = localStorage.getItem('token');
  let role = null;
  if (token) {
    try {
      const decoded = jwt_decode(token);
      role = decoded.role;  // Se espera que el token incluya "role"
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
  }

  return (
    <Router>
      <nav style={{ margin: '10px' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
        <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
        <Link to="/register" style={{ marginRight: '10px' }}>Register</Link>
        <Link to="/protected" style={{ marginRight: '10px' }}>Protected</Link>
        <Link to="/modules" style={{ marginRight: '10px' }}>Módulos</Link>
        <Link to="/progress" style={{ marginRight: '10px' }}>Progreso</Link>
        {/* Solo se muestra si el rol es admin */}
        {role === 'admin' && <Link to="/create-module">Crear Módulo</Link>}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/protected" element={<Protected />} />
        <Route path="/modules" element={<ModulesView />} />
        <Route path="/progress" element={<ProgressView />} />
        <Route path="/create-module" element={<CreateModule />} />
      </Routes>
    </Router>
  );
}

export default App;
