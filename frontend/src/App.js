// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ModulesView from './pages/ModulesView';
import ProgressView from './pages/ProgressView';
import CreateModule from './pages/CreateModule';
import ModuleDetail from './components/ModuleDetail';
import Module1 from './components/Module1/Module1';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/modules" element={<ModulesView />} />
          <Route path="/modules/:id" element={<ModuleDetail />} />
          <Route path="/progress" element={<ProgressView />} />
          <Route path="/create-module" element={<CreateModule />} />
          <Route path="/modulo1" element={<Module1 />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
