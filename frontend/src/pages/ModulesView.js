import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleCard from '../components/ModuleCard';
import AuthContext from '../context/AuthContext';

function ModulesView() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate(); 
  if (auth.user?.role === 'admin') {
    return (
      <div className="text-center text-red-500 p-6">
        Tu rol de administrador no requiere acceso a esta sección de formación.
      </div>
    );
  }

  const [modules, setModules] = useState([]);
  const [completedModules, setCompletedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPassedFinalExam, setHasPassedFinalExam] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión.');
        setLoading(false);
        return;
      }

      try {
        // Obtener módulos
        const modulesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/modules`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!modulesResponse.ok) {
          throw new Error('Error al obtener los módulos');
        }

        const modulesData = await modulesResponse.json();

        // Filtramos módulos válidos que tengan _id
        const validModules = modulesData.filter(m => m && m._id);
        setModules(validModules);

        // Obtener progreso del usuario
        const progressResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!progressResponse.ok) {
          throw new Error('Error al obtener el progreso');
        }

        const progressData = await progressResponse.json();
        setCompletedModules(progressData.map(p => p.module?._id));

        // Verificar si ha aprobado el examen final
        try {
          const finalRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/my-latest-attempt`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const finalData = await finalRes.json();
          if (finalData.attempt && finalData.attempt.passed) {
            setHasPassedFinalExam(true);
          }
        } catch (err) {
          console.error('Error al verificar el examen final:', err);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error al cargar módulos:', err);
        setError('Error de conexión');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-6">Cargando módulos...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;

  // Calcular progreso:
  const totalModules = modules.length;
  const completedCount = completedModules.length;
  const allModulesCompleted = totalModules > 0 && completedCount === totalModules;
  const progressPercentage = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {auth && auth.user && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-primary">
            Bienvenido, {auth.user.name}
          </h2>
        </div>
      )}

      {/* Botón para descargar diploma si ya aprobó */}
      {hasPassedFinalExam && (
        <div className="text-center mb-6">
          <a
            href="/final-exam"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            🎓 Descargar diploma
          </a>
        </div>
      )}

      {/* Barra visual de progreso */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Progreso General</h3>
        <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-width duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-gray-600 mt-1">
          {completedCount} de {totalModules} módulos completados ({progressPercentage.toFixed(1)}%)
        </div>
        {!hasPassedFinalExam && (
          <div className="mt-4 text-center">
            <button
              onClick={() => allModulesCompleted && navigate('/final-exam')}
              disabled={!allModulesCompleted}
              className={`px-6 py-2 rounded font-semibold transition ${
                allModulesCompleted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Ir al Examen Final
            </button>
          </div>
        )}
      </div>

      <h2 className="text-3xl font-bold text-primary mb-6 text-center">Lista de Módulos</h2>
      {modules.length === 0 ? (
        <p className="text-center">No hay módulos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(module =>
            module && module._id ? (
              <ModuleCard
                key={module._id}
                module={module}
                completed={completedModules.includes(module._id)} 
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

export default ModulesView;