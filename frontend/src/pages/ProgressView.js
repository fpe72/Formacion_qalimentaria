import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Ojo: la importación de jwt-decode es un poco distinta. Normalmente es:
// import jwtDecode from 'jwt-decode';
import { jwtDecode } from 'jwt-decode';  // si así te funciona, déjalo

function ProgressView() {
  const [progressRecords, setProgressRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  // NUEVO: controlar si ya aprobó el examen
  const [examPassed, setExamPassed] = useState(false);

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

        // Llamada para obtener los progresos de módulos
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
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

    // NUEVO: Comprobar si el examen ya fue aprobado con /final-exam/my-latest-attempt
    const checkExamStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // si no hay token, salimos

        const attemptRes = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/final-exam/my-latest-attempt`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!attemptRes.ok) {
          // Si 404 o similar, no pasa nada
          console.warn('No se pudo comprobar el estado del examen.');
          return;
        }
        const attemptData = await attemptRes.json();
        console.log("attemptData:", attemptData);
        // Si attemptData.attempt existe y attemptData.attempt.passed = true => ya aprobó
        if (attemptData.attempt?.passed) {
          setExamPassed(true);
        }
      } catch (err) {
        console.error('Error revisando estado de examen:', err);
      }
    };

    fetchProgress();
    checkExamStatus();
  }, []);

  // Chequeamos si completó todos los módulos
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
                    <td className="border border-gray-300 px-4 py-2">
                      {record.module.title || 'Sin título'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(record.dateCompleted).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* NUEVO: ocultamos el botón si examPassed = true */}
          {(isAdmin || allModulesCompleted) && !examPassed && (
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/final-exam')}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Ir al Examen Final
              </button>
            </div>
          )}

          {examPassed && (
            <div className="mt-8 text-center text-green-600 font-bold">
              ✅ Ya has aprobado el examen final
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProgressView;
