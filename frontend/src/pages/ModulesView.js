// src/pages/ModulesView.js
import React, { useState, useEffect } from 'react';

function ModulesView() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/modules');
        if (!response.ok) {
          setError('Error al obtener los módulos');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setModules(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error de conexión');
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  if (loading) return <div>Cargando módulos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Lista de Módulos</h2>
      {modules.length === 0 ? (
        <p>No hay módulos disponibles.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descripción</th>
              <th>Orden</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(mod => (
              <tr key={mod._id}>
                <td>{mod.title}</td>
                <td>{mod.description || 'Sin descripción'}</td>
                <td>{mod.order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ModulesView;
