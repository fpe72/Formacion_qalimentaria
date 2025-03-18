// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Protected from './pages/Protected';
import ModulesView from './pages/ModulesView';
import ProgressView from './pages/ProgressView';
import CreateModule from './pages/CreateModule'; // Importamos el nuevo componente

function App() {
  return (
    <Router>
      <nav style={{ margin: '10px' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
        <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
        <Link to="/register" style={{ marginRight: '10px' }}>Register</Link>
        <Link to="/protected" style={{ marginRight: '10px' }}>Protected</Link>
        <Link to="/modules" style={{ marginRight: '10px' }}>Módulos</Link>
        <Link to="/progress" style={{ marginRight: '10px' }}>Progreso</Link>
        <Link to="/create-module">Crear Módulo</Link>
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
