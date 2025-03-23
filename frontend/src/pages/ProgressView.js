// src/pages/ProgressView.js
import React, { useState, useEffect } from 'react';

function ProgressView() {
  const [progressRecords, setProgressRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // Obtener el token guardado en localStorage (asegúrate de haber hecho login)
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No se encontró un token. Por favor, inicia sesión.');
          setLoading(false);
          return;
        }

        // Hacer la petición GET al endpoint /progress de tu backend
        const response = await fetch('https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/progress', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          setError('Error al obtener el progreso.');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setProgressRecords(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Error de conexión al obtener el progreso.');
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return <div>Cargando progreso...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Progreso del Usuario</h2>
      {progressRecords.length === 0 ? (
        <p>No se ha registrado progreso aún.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>ID del Progreso</th>
              <th>Módulo</th>
              <th>Fecha Completada</th>
            </tr>
          </thead>
          <tbody>
            {progressRecords.map(record => (
              <tr key={record._id}>
                <td>{record._id}</td>
                <td>{record.module.title || 'Sin título'}</td>
                <td>{new Date(record.dateCompleted).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProgressView;
