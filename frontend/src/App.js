// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout y otros componentes base
import Layout from './components/Layout';

// Páginas y componentes
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ModulesView from './pages/ModulesView';
import ProgressView from './pages/ProgressView';
import CreateModule from './pages/CreateModule';
import ModuleDetail from './components/ModuleDetail';

// (Opcional) Componente antiguo, prototipo de Módulo 1
import Module1 from './components/Module1/Module1';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Ruta de inicio */}
          <Route path="/" element={<Home />} />

          {/* Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Módulos */}
          <Route path="/modules" element={<ModulesView />} />
          <Route path="/modules/:id" element={<ModuleDetail />} />

          {/* Progreso global (si lo usas) */}
          <Route path="/progress" element={<ProgressView />} />

          {/* Creación de módulos (HTML en 'content'), solo admin */}
          <Route path="/create-module" element={<CreateModule />} />

          {/* Demostración o prototipo anterior */}
          <Route path="/modulo1" element={<Module1 />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
