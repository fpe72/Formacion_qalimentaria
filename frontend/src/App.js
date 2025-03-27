// frontend/src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ModulesView from './pages/ModulesView';
import ProgressView from './pages/ProgressView';
import CreateModule from './pages/CreateModule';
import ModuleContent from './pages/ModuleContent';
import FinalExam from './pages/FinalExam';
import AuthContext from './context/AuthContext';

function ProtectedFinalExamRoute({ children }) {
  const { user } = useContext(AuthContext);
  const progress = JSON.parse(localStorage.getItem('progress') || '[]');

  const isAdmin = user?.role === 'admin';
  const allModulesCompleted = progress.length === 9; // Ajustar según cantidad real de módulos

  if (isAdmin || allModulesCompleted) {
    return children;
  } else {
    return <div className="text-center mt-10 text-red-600">Acceso denegado. Debes completar todos los módulos.</div>;
  }
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/modules" element={<ModulesView />} />
          <Route path="/modules/:order" element={<ModuleContent />} />
          <Route path="/progress" element={<ProgressView />} />
          <Route path="/create-module" element={<CreateModule />} />
          <Route
            path="/final-exam"
            element={
              <ProtectedFinalExamRoute>
                <FinalExam />
              </ProtectedFinalExamRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
