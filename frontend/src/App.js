// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Aquí se importan los componentes finales:
import ModulesView from './pages/ModulesView';      // (Nuevo/actualizado para listar módulos con array de lecciones)
import ProgressView from './pages/ProgressView';    // (Muestra el progreso, sin cambios mayores salvo adaptarlo si hace falta)
import CreateModule from './pages/CreateModule';    // (Formulario para crear un módulo con varias lecciones)
import ModuleDetail from './components/ModuleDetail'; // (Nuevo/actualizado para mostrar un solo módulo y sus lecciones)
import Module1 from './components/Module1/Module1';   // (Puede seguir usándose como prototipo o demo)

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Página de inicio */}
          <Route path="/" element={<Home />} />

          {/* Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Módulos */}
          <Route path="/modules" element={<ModulesView />} />
          <Route path="/modules/:id" element={<ModuleDetail />} />

          {/* Progreso */}
          <Route path="/progress" element={<ProgressView />} />

          {/* Creación de módulos (sólo para admin) */}
          <Route path="/create-module" element={<CreateModule />} />

          {/* Ejemplo de un módulo prototipo */}
          <Route path="/modulo1" element={<Module1 />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
