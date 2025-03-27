// src/pages/ProgressView.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ProgressView() {
  const [progressRecords, setProgressRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No se encontró un token. Por favor, inicia sesión.');
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        setIsAdmin(decoded?.role === 'admin');

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

  const allModulesCompleted = progressRecords.length === 9;

  if (loading) {
    return <div>Cargando progreso...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Progreso del Usuario</h2>

      {progressRecords.length === 0 ? (
        <p>No se ha registrado progreso aún.</p>
      ) : (
        <>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">ID del Progreso</th>
                <th className="border border-gray-300 px-4 py-2">Módulo</th>
                <th className="border border-gray-300 px-4 py-2">Fecha Completada</th>
              </tr>
            </thead>
            <tbody>
              {progressRecords
                .filter(record => record.module)
                .map(record => (
                  <tr key={record._id}>
                    <td className="border border-gray-300 px-4 py-2">{record._id}</td>
                    <td className="border border-gray-300 px-4 py-2">{record.module.title || 'Sin título'}</td>
                    <td className="border border-gray-300 px-4 py-2">{new Date(record.dateCompleted).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {(isAdmin || allModulesCompleted) && (
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/final-exam')}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Ir al Examen Final
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProgressView;
