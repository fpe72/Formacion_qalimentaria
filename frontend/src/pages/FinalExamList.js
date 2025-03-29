import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FinalExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setExams(data);
      } catch (error) {
        console.error('Error al obtener exámenes:', error);
        setError('No se pudieron cargar los exámenes');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [token]);

  const handleActivate = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/${id}/activate`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Recargar exámenes después de activar uno
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setExams(data);
    } catch (error) {
      console.error('Error al activar el examen:', error);
      alert('No se pudo activar el examen');
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando exámenes...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Exámenes Guardados</h2>
      {exams.length === 0 ? (
        <p>No hay exámenes guardados.</p>
      ) : (
        <ul className="space-y-4">
          {exams.map((exam) => (
            <li key={exam._id} className={`bg-white p-4 rounded shadow border flex justify-between items-center ${exam.isActive ? 'border-green-500' : ''}`}>
              <div>
                <h3 className="text-lg font-semibold">{exam.title}</h3>
                <p className="text-sm text-gray-500">Creado: {new Date(exam.createdAt).toLocaleString()}</p>
                {exam.isActive && <p className="text-green-600 text-sm font-bold">✅ Examen activo</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit-final-exam/${exam._id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Editar
                </button>
                {!exam.isActive && (
                  <button
                    onClick={() => handleActivate(exam._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Activar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FinalExamList;
