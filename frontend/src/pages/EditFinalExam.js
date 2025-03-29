// frontend/src/pages/EditFinalExam.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditFinalExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchExam = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();

          // Asegurar que cada pregunta tenga correctAnswer (copiar answer si existe)
          const normalizedQuestions = data.questions.map((q) => {
            let corrected = { ...q };
            if (!corrected.correctAnswer && q.answer) {
              corrected.correctAnswer = q.answer;
            }
            return corrected;
          });

          setExam({ ...data, questions: normalizedQuestions });
          setTitle(data.title);
        } else {
          console.error('No se pudo cargar el examen');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  const handleSaveChanges = async () => {
    const token = localStorage.getItem('token');
    try {
      const preparedQuestions = exam.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        answer: q.correctAnswer // mantener compatibilidad
      }));

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          questions: preparedQuestions,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Examen actualizado correctamente');
        navigate('/exams');
      } else {
        console.error(data);
        alert('❌ Error al actualizar el examen');
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      alert('❌ Error al guardar los cambios');
    }
  };

  const handleDeleteExam = async () => {
    const confirm = window.confirm('¿Estás seguro de que quieres eliminar este examen?');
    if (!confirm) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('✅ Examen eliminado');
        navigate('/exams');
      } else {
        alert('❌ Error al eliminar el examen');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error al eliminar el examen');
    }
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = [...exam.questions];
    updatedQuestions.splice(index, 1);
    setExam({ ...exam, questions: updatedQuestions });
  };

  if (loading) return <p className="text-center">Cargando examen...</p>;
  if (!exam) return <p className="text-center text-red-600">Examen no encontrado</p>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h2 className="text-3xl font-bold mb-6">Editar Examen</h2>

      <div className="mb-6">
        <label className="block font-semibold mb-2">Título del examen:</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      <h3 className="text-xl font-semibold mb-4">Preguntas:</h3>
      {exam.questions.map((q, index) => (
        <div key={index} className="mb-6 bg-gray-100 p-4 rounded shadow relative">
          <button
            onClick={() => handleDeleteQuestion(index)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800"
          >
            🗑 Eliminar
          </button>

          <label className="block font-semibold mb-2">Pregunta {index + 1}:</label>
          <input
            type="text"
            value={q.question}
            onChange={e => {
              const newQuestions = [...exam.questions];
              newQuestions[index].question = e.target.value;
              setExam({ ...exam, questions: newQuestions });
            }}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
          <label className="block text-sm mb-1">Opciones:</label>
          {q.options.map((opt, i) => (
            <input
              key={i}
              type="text"
              value={opt}
              onChange={e => {
                const newQuestions = [...exam.questions];
                newQuestions[index].options[i] = e.target.value;
                setExam({ ...exam, questions: newQuestions });
              }}
              className="w-full border border-gray-300 rounded p-2 mb-2"
            />
          ))}
          <label className="block text-sm mb-1">Respuesta correcta:</label>
          <select
            value={q.correctAnswer || ''}
            onChange={e => {
              const newQuestions = [...exam.questions];
              newQuestions[index].correctAnswer = e.target.value;
              setExam({ ...exam, questions: newQuestions });
            }}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="" disabled>Selecciona la respuesta correcta</option>
            {q.options.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}

      <div className="flex space-x-4">
        <button
          onClick={handleSaveChanges}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Guardar cambios
        </button>
        <button
          onClick={handleDeleteExam}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
        >
          Eliminar examen
        </button>
      </div>
    </div>
  );
};

export default EditFinalExam;
