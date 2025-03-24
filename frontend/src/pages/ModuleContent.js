// frontend/src/pages/ModuleContent.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ModuleContent = () => {
  const { order } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/modules`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          setError('Error al obtener el módulo');
          setLoading(false);
          return;
        }

        const modules = await response.json();
        const mod = modules.find(m => m.order === parseInt(order));

        if (!mod) {
          setError('Módulo no encontrado');
          setLoading(false);
          return;
        }

        setModule(mod);
        setLoading(false);
      } catch (err) {
        setError('Error de conexión');
        setLoading(false);
      }
    };

    fetchModule();
  }, [order]);

  if (loading) return <div className="text-center py-6">Cargando módulo...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{module.title}</h2>
      <div
        className="prose mb-6"
        dangerouslySetInnerHTML={{ __html: module.content }}
      />
      <button
        className="bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition-colors duration-300"
        onClick={() => navigate('/modules')}
      >
        ← Regresar a módulos
      </button>
    </div>
  );
};

export default ModuleContent;
