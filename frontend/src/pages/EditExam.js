// frontend/src/pages/EditExam.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditExam = () => {
  const { id } = useParams(); // ID del examen
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (res.ok) {
          setExam(data);
        } else {
          alert('Error al obtener el examen');
        }
      } catch (error) {
        console.error(error);
        alert('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, token]);

  const handleInputChange = (e, index, field) => {
    const updatedQuestions = [...exam.questions];
    updatedQuestions[index][field] = e.target.value;
    setExam({ ...exam, questions: updatedQuestions });
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = exam.questions.filter((_, i) => i !== index);
    setExam({ ...exam, questions: updatedQuestions });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ questions: exam.questions })
      });

      if (res.ok) {
        alert('✅ Examen actualizado correctamente');
        navigate('/exams');
      } else {
        alert('❌ Error al actualizar el examen');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error al conectar con el servidor');
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando examen...</p>;
  if (!exam) return <p className="text-center text-red-600">Examen no encontrado.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Editar Examen</h2>

      {exam.questions.map((q, index) => (
        <div key={index} className="bg-white p-4 mb-4 border rounded shadow-sm">
          <label className="block font-semibold mb-1">Pregunta {index + 1}</label>
          <input
            type="text"
            value={q.question}
            onChange={(e) => handleInputChange(e, index, 'question')}
            className="w-full border p-2 mb-2"
          />

          <label className="block font-medium">Opciones:</label>
          {q.options.map((opt, optIndex) => (
            <input
              key={optIndex}
              type="text"
              value={opt}
              onChange={(e) => {
                const updatedOptions = [...q.options];
                updatedOptions[optIndex] = e.target.value;
                const updatedQuestions = [...exam.questions];
                updatedQuestions[index].options = updatedOptions;
                setExam({ ...exam, questions: updatedQuestions });
              }}
              className="w-full border p-1 mb-1"
            />
          ))}

          <label className="block font-medium mt-2">Respuesta correcta:</label>
          <input
            type="text"
            value={q.answer}
            onChange={(e) => handleInputChange(e, index, 'answer')}
            className="w-full border p-2 mb-2"
          />

          <button
            onClick={() => handleDeleteQuestion(index)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Eliminar pregunta
          </button>
        </div>
      ))}

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default EditExam;
