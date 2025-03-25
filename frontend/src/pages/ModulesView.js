import React, { useContext, useState, useEffect } from 'react';
import ModuleCard from '../components/ModuleCard';
import AuthContext from '../context/AuthContext';

function ModulesView() {
  const { auth } = useContext(AuthContext);
  const [modules, setModules] = useState([]);
  const [completedModules, setCompletedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Obtener módulos
        const modulesResponse = await fetch('https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/modules', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const modulesData = await modulesResponse.json();
        setModules(modulesData);

        // Obtener progreso del usuario
        const progressResponse = await fetch('https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const progressData = await progressResponse.json();
        setCompletedModules(progressData.map(p => p.module._id));

        setLoading(false);
      } catch (err) {
        setError('Error de conexión');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-6">Cargando módulos...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      {auth && auth.user && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-primary">
            Bienvenido, {auth.user.name}
          </h2>
        </div>
      )}
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">Lista de Módulos</h2>
      {modules.length === 0 ? (
        <p className="text-center">No hay módulos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(module => (
            <ModuleCard
              key={module._id}
              module={module}
              completed={completedModules.includes(module._id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ModulesView;
