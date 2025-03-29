// frontend/src/pages/FinalExam.js
import React, { useEffect, useState } from 'react';

const FinalExam = () => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/active`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('No se pudo obtener el examen activo.');
        }

        const data = await response.json();
        setExam(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, []);

  const handleStartExam = () => {
    setStarted(true);
  };

  const handleAnswer = (selectedIndex) => {
    const updated = [...answers];
    updated[currentQuestion] = selectedIndex;
    setAnswers(updated);
  };

  const nextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      alert('¡Examen completado! Evaluación pendiente.');
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando examen...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  if (!started) {
    return (
      <div className="container mx-auto p-6 max-w-3xl text-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">Bienvenido al Examen Final</h2>

        <div className="bg-white shadow-md rounded p-6 mb-6">
          <h3 className="text-xl font-semibold mb-2">Instrucciones del examen:</h3>
          <ul className="list-disc pl-6 space-y-2 text-left">
            <li>El examen consta de <strong>25 preguntas tipo test</strong>.</li>
            <li>Cada pregunta tiene <strong>3 opciones</strong>, pero solo <strong>una respuesta correcta</strong>.</li>
            <li>Para aprobar, deberás responder correctamente al <strong>75%</strong> del examen: al menos <strong>18 preguntas correctas</strong>.</li>
            <li>Tendrás un <strong>tiempo máximo de 30 minutos</strong>. Al agotarse, se evaluarán automáticamente tus respuestas.</li>
            <li>Si no alcanzas el 75%, tendrás <strong>una segunda oportunidad</strong> dentro de las siguientes <strong>72 horas</strong>.</li>
            <li>Si tampoco superas el segundo intento, deberás <strong>repetir toda la formación</strong>.</li>
            <li>Si apruebas, <strong>Q-Alimentaria emitirá un diploma</strong> a tu nombre.</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-lg font-semibold">Examen activo: <span className="text-primary">{exam.title}</span></p>
          <p className="text-sm text-gray-600">Preguntas cargadas: {exam.questions.length}</p>
        </div>

        <div className="text-center">
          <button
            onClick={handleStartExam}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            Comenzar Examen
          </button>
        </div>
      </div>
    );
  }

  const current = exam.questions[currentQuestion];

  return (
    <div className="container mx-auto p-6 max-w-3xl text-gray-800">
      <h2 className="text-2xl font-bold mb-4">Pregunta {currentQuestion + 1} de {exam.questions.length}</h2>
      <div className="bg-white p-6 rounded shadow mb-6">
        <p className="text-lg font-medium mb-4">{current.question}</p>
        <ul className="space-y-3">
          {current.options.map((option, index) => (
            <li key={index}>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  checked={answers[currentQuestion] === index}
                  onChange={() => handleAnswer(index)}
                />
                <span>{option}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-right">
        <button
          onClick={nextQuestion}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          {currentQuestion < exam.questions.length - 1 ? 'Siguiente' : 'Finalizar'}
        </button>
      </div>
    </div>
  );
};

export default FinalExam;
