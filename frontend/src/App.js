// frontend/src/App.js
import React, { useEffect, useState } from 'react';
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
import CreateFinalExam from './pages/CreateFinalExam';
import FinalExamList from './pages/FinalExamList'; // ✅ Importa el componente
import EditFinalExam from './pages/EditFinalExam';
import { jwtDecode } from 'jwt-decode';
import CreateCompany from './pages/CreateCompany';
import LegalPage from './pages/LegalPage'; // ✅ NUEVA IMPORTACIÓN


// Ruta protegida mejorada para examen final
function ProtectedFinalExamRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem('token');
      let isAdmin = false;

      if (token) {
        try {
          const decoded = jwtDecode(token);
          isAdmin = decoded?.role === 'admin';
        } catch (err) {
          console.error("Error al decodificar el token:", err);
        }
      }

      if (isAdmin) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const progress = await res.json();
          setHasAccess(progress.length === 9);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error al obtener el progreso:", error);
        setHasAccess(false);
      }

      setLoading(false);
    };

    checkAccess();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Cargando...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="text-center mt-10 text-red-600">
        Acceso denegado. Debes completar todos los módulos.
      </div>
    );
  }

  return children;
}

// Ruta protegida para administradores
function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('token');
  try {
    const decoded = jwtDecode(token);
    if (decoded?.role === 'admin') {
      return children;
    }
  } catch (err) {
    console.error("Error al decodificar el token:", err);
  }
  return <div className="text-center mt-10 text-red-600">Acceso solo para administradores.</div>;
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
          <Route path="/admin/create-company" element={<CreateCompany />} />
          <Route path="/legal/:file" element={<LegalPage />} />
          <Route 
            path="/final-exam" 
            element={
              <ProtectedFinalExamRoute>
                <FinalExam />
              </ProtectedFinalExamRoute>
            } 
          />
          <Route 
            path="/create-final-exam" 
            element={
              <ProtectedAdminRoute>
                <CreateFinalExam />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/exams" 
            element={
              <ProtectedAdminRoute>
                <FinalExamList />
              </ProtectedAdminRoute>
            }
          />
          <Route 
           path="/edit-final-exam/:id" 
           element={
           <ProtectedAdminRoute>
           <EditFinalExam />
           </ProtectedAdminRoute>
         }   
       />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
// Forzar redeploy en Vercel
