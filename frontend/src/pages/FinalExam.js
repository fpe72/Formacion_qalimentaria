// frontend/src/pages/FinalExam.js
import React, { useEffect, useState } from 'react';

const FinalExam = () => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);

  // Temporizador en segundos
  const [timeLeft, setTimeLeft] = useState(null);

  // Nuevo: Estado para controlar si ya mostramos el aviso de 3 minutos restantes
  const [warning3MinShown, setWarning3MinShown] = useState(false);

  // 1. Cargar el examen activo
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

  // 2. Cuando exam se cargue, definimos el tiempo disponible
  useEffect(() => {
    if (exam) {
      const questionCount = exam.questions.length;
      const baseTime = questionCount + 3; // 1 minuto por pregunta + 3 min extra
      setTimeLeft(baseTime * 60);        // Convertimos a segundos
    }
  }, [exam]);

  // 3. Iniciar el examen
  const handleStartExam = () => {
    setStarted(true);
  };

  // 4. Guardar respuesta
  const handleAnswer = (selectedIndex) => {
    const updated = [...answers];
    updated[currentQuestion] = selectedIndex;
    setAnswers(updated);
  };

  // 5. Corrección manual (botón "Finalizar")
  const calculateScoreManually = () => {
    if (!exam) return;
    const correct = exam.questions.reduce((acc, q, idx) => {
      const selected = answers[idx];
      const correctIndex = q.options.findIndex(
        (opt) => opt.trim() === q.correctAnswer?.trim()
      );
      return acc + (selected === correctIndex ? 1 : 0);
    }, 0);
    setScore(correct);
  };

  // 6. Avanzar o finalizar
  const nextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      calculateScoreManually();
    }
  };

  // 7. Resetear
  const resetExam = () => {
    setStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setScore(null);
    setWarning3MinShown(false); // Reiniciamos el aviso
    if (exam) {
      const questionCount = exam.questions.length;
      const baseTime = questionCount + 3;
      setTimeLeft(baseTime * 60);
    }
  };

  // 8. useEffect para temporizador => cuenta atrás y corrección automática
  useEffect(() => {
    if (!started || score !== null) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);

          // Corrección automática cuando llega a 0
          if (exam) {
            const correct = exam.questions.reduce((acc, q, idx) => {
              const selected = answers[idx];
              const correctIndex = q.options.findIndex(
                (opt) => opt.trim() === q.correctAnswer?.trim()
              );
              return acc + (selected === correctIndex ? 1 : 0);
            }, 0);
            setScore(correct);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [started, score, exam, answers]);

  // Nuevo: 9. useEffect para mostrar un aviso cuando quedan 3 minutos (180 seg)
  useEffect(() => {
    // Si no ha empezado, ya terminó, no hay tiempo definido o ya mostramos el aviso => no hacemos nada
    if (!started || score !== null || timeLeft === null || warning3MinShown) return;

    if (timeLeft <= 180) {
      alert("¡Atención! Te quedan 3 minutos para finalizar el examen.");
      setWarning3MinShown(true);
    }
  }, [timeLeft, started, score, warning3MinShown]);

  // Renderizado condicional
  if (loading) {
    return <p className="text-center mt-10">Cargando examen...</p>;
  }
  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }
  if (!exam) {
    return <p className="text-center mt-10 text-red-600">No se ha encontrado examen activo.</p>;
  }

  // Si no ha iniciado, mostramos instrucciones
  if (!started) {
    const questionCount = exam.questions.length;
    const passingScore = Math.round(questionCount * 0.75);
    const timeLimit = questionCount + 3;

    return (
      <div className="container mx-auto p-6 max-w-3xl text-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">Bienvenido al Examen Final</h2>

        <div className="bg-white shadow-md rounded p-6 mb-6">
          <h3 className="text-xl font-semibold mb-2">Instrucciones del examen:</h3>
          <ul className="list-disc pl-6 space-y-2 text-left">
            <li>El examen consta de <strong>{questionCount} preguntas tipo test</strong>.</li>
            <li>Cada pregunta tiene <strong>3 opciones</strong>, pero solo <strong>una respuesta correcta</strong>.</li>
            <li>Para aprobar, deberás responder correctamente al <strong>75%</strong> del examen: al menos <strong>{passingScore} preguntas correctas</strong>.</li>
            <li>Tendrás un <strong>tiempo máximo de {timeLimit} minutos</strong>. Al agotarse, se evaluarán automáticamente tus respuestas.</li>
            <li>Si no alcanzas el 75%, tendrás <strong>una segunda oportunidad</strong> dentro de las siguientes <strong>72 horas</strong>.</li>
            <li>Si tampoco superas el segundo intento, deberás <strong>repetir toda la formación</strong>.</li>
            <li>Si apruebas, <strong>Q-Alimentaria emitirá un diploma</strong> a tu nombre.</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-lg font-semibold">Examen activo: <span className="text-primary">{exam.title}</span></p>
          <p className="text-sm text-gray-600">Preguntas cargadas: {questionCount}</p>
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

  // Si ya tenemos score, mostramos resultado
  if (score !== null) {
    const questionCount = exam.questions.length;
    const passingScore = Math.round(questionCount * 0.75);
    const passed = score >= passingScore;

    return (
      <div className="container mx-auto p-6 max-w-2xl text-center">
        <h2 className="text-3xl font-bold mb-6">Resultado del examen</h2>
        <p className={`text-2xl font-semibold mb-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed ? '✅ ¡Has aprobado!' : '❌ No has alcanzado el mínimo para aprobar.'}
        </p>
        <p className="mb-6">
          Has respondido correctamente <strong>{score}</strong> de <strong>{questionCount}</strong> preguntas.
        </p>
        <button
          onClick={resetExam}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Repetir Examen
        </button>
      </div>
    );
  }

  // Si el examen está en curso (started y score===null)
  const current = exam.questions[currentQuestion];

  return (
    <div className="container mx-auto p-6 max-w-3xl text-gray-800">
      <div className="text-right mb-4">
        <p className="font-semibold">
          Tiempo restante: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        Pregunta {currentQuestion + 1} de {exam.questions.length}
      </h2>

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
