// frontend/src/pages/FinalExam.js
import React, { useEffect, useState, useCallback } from 'react';

const FinalExam = () => {
  // Estado para el examen
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de control de examen
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);

  // Temporizador y aviso 3 min
  const [timeLeft, setTimeLeft] = useState(null);
  const [warning3MinShown, setWarning3MinShown] = useState(false);

  // Para vincular intento en backend
  const [attemptId, setAttemptId] = useState(null);

  // 1. Cargar examen activo
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/final-exam/active`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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

  // 2. Definir el tiempo (timeLeft) cuando tengamos exam
  useEffect(() => {
    if (exam) {
      const questionCount = exam.questions.length;
      const baseTime = questionCount + 3; // 1 min/pregunta + 3 extra
      setTimeLeft(baseTime * 60);        // en segundos
    }
  }, [exam]);

  // 3. Función para iniciar el examen => start-attempt en backend
  const handleStartExam = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/final-exam/start-attempt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ examId: exam._id })
        }
      );

      if (!response.ok) {
        throw new Error('No se pudo iniciar el intento de examen en backend.');
      }

      const data = await response.json(); // { attemptId: "...", ... }
      setAttemptId(data.attemptId);

      setStarted(true);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  // 4. Guardar respuesta elegida
  const handleAnswer = (selectedIndex) => {
    const updated = [...answers];
    updated[currentQuestion] = selectedIndex;
    setAnswers(updated);
  };

  // 5. Calcular puntuación actual (sin setScore), envuelta en useCallback
  const calculateCurrentScore = useCallback(() => {
    if (!exam) return 0;
    return exam.questions.reduce((acc, q, idx) => {
      const selected = answers[idx];
      const correctIndex = q.options.findIndex(
        (opt) => opt.trim() === q.correctAnswer?.trim()
      );
      return acc + (selected === correctIndex ? 1 : 0);
    }, 0);
  }, [exam, answers]);

  // 6. Llamada al backend para cerrar intento, envuelta en useCallback
  const endAttemptOnBackend = useCallback(async (finalScore) => {
    if (!attemptId) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/final-exam/end-attempt`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ attemptId, score: finalScore })
        }
      );
    } catch (err) {
      console.error('Error al finalizar attempt:', err);
    }
  }, [attemptId]);

  // 7. Finalizar examen manualmente (botón "Finalizar" o última pregunta)
  const calculateScoreManually = async () => {
    if (!exam) return;
    const finalScore = calculateCurrentScore();
    setScore(finalScore);
    await endAttemptOnBackend(finalScore);
  };

  // Avanzar a la siguiente pregunta
  const nextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      calculateScoreManually();
    }
  };

  // 8. Reset (para volver a empezar)
  const resetExam = () => {
    setStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setScore(null);
    setWarning3MinShown(false);

    // Si quieres empezar un intento nuevo la próxima vez que inicien
    setAttemptId(null);

    if (exam) {
      const questionCount = exam.questions.length;
      const baseTime = questionCount + 3;
      setTimeLeft(baseTime * 60);
    }
  };

  // 9. Temporizador => se corrige auto al llegar a 0
  useEffect(() => {
    if (!started || score !== null) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);

          const finalScore = calculateCurrentScore();
          setScore(finalScore);
          endAttemptOnBackend(finalScore);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);

    // Aquí incluyo todos los deps que usamos dentro
  }, [
    started,
    score,
    calculateCurrentScore,
    endAttemptOnBackend
  ]);

  // 10. Aviso de 3 min
  useEffect(() => {
    if (!started || score !== null || timeLeft === null || warning3MinShown) return;

    if (timeLeft <= 180) {
      alert('¡Atención! Te quedan 3 minutos para finalizar el examen.');
      setWarning3MinShown(true);
    }
  }, [timeLeft, started, score, warning3MinShown]);

  // 11. onbeforeunload => intenta cerrar intento si refresca/cierra
  useEffect(() => {
    if (!started || score !== null) return;

    const beforeUnloadHandler = (e) => {
      e.preventDefault();
      e.returnValue = 'Si sales, se finaliza el examen. ¿Estás seguro?';

      // Calculamos nota parcial y finalizamos
      const partialScore = calculateCurrentScore();
      endAttemptOnBackend(partialScore);
    };

    window.addEventListener('beforeunload', beforeUnloadHandler);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, [started, score, calculateCurrentScore, endAttemptOnBackend]);

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

  // Si no ha iniciado, mostrar instrucciones
  if (!started) {
    const questionCount = exam.questions.length;
    const passingScore = Math.round(questionCount * 0.75);
    const timeLimit = questionCount + 3;

    return (
      <div className="container mx-auto p-6 max-w-3xl text-gray-800">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">
          Bienvenido al Examen Final
        </h2>

        <div className="bg-white shadow-md rounded p-6 mb-6">
          <h3 className="text-xl font-semibold mb-2">Instrucciones del examen:</h3>
          <ul className="list-disc pl-6 space-y-2 text-left">
            <li>El examen consta de <strong>{questionCount}</strong> preguntas.</li>
            <li>Cada pregunta tiene una sola respuesta correcta.</li>
            <li>Necesitas al menos <strong>{passingScore}</strong> aciertos (75%).</li>
            <li>Tendrás un máximo de <strong>{timeLimit} minutos</strong>.</li>
            <li>Si refrescas o cierras, el examen se da por terminado.</li>
          </ul>
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

  // Si ya hay score => mostrar resultado
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

  // Examen en curso
  const current = exam.questions[currentQuestion];

  return (
    <div className="container mx-auto p-6 max-w-3xl text-gray-800">
      <div className="text-right mb-4">
        <p className="font-semibold">
          Tiempo restante: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, '0')}
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
