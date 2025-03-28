import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FinalExamList = () => {
  const [exams, setExams] = useState([]);
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
      }
    };

    fetchExams();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Exámenes Guardados</h2>
      {exams.length === 0 ? (
        <p>No hay exámenes guardados.</p>
      ) : (
        <ul className="space-y-4">
          {exams.map((exam) => (
            <li key={exam._id} className="bg-white p-4 rounded shadow border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{exam.title}</h3>
                <p className="text-sm text-gray-500">Creado: {new Date(exam.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => navigate(`/edit-final-exam/${exam._id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Editar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FinalExamList;
