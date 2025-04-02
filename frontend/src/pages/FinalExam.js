// frontend/src/pages/FinalExam.js
import React, { useEffect, useState, useCallback } from 'react';

const FinalExam = () => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [examPassed, setExamPassed] = useState(false);
  const [retryDeadline, setRetryDeadline] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const checkAttemptStatus = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/${examId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'passed') {
        setExamPassed(true);
      }
    } catch (err) {
      console.error('Error consultando estado del examen:', err);
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/active`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('No se pudo obtener el examen activo.');
        const data = await response.json();
        setExam(data);

        await checkAttemptStatus(data._id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, []);

  useEffect(() => {
    if (!retryDeadline) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(retryDeadline) - new Date()) / 1000));
      setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [retryDeadline]);

  const startAttempt = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/start-attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examId: exam._id })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Has alcanzado el número máximo de intentos. Debes repetir la formación.') {
          const confirmReset = window.confirm('❌ Has agotado tus 2 intentos.\n¿Deseas reiniciar la formación para volver a empezar?');
          if (confirmReset) {
            await resetUserProgress();
          }
        } else if (data.error === 'Ya has aprobado este examen. No puedes volver a realizarlo.') {
          alert('✅ Ya has aprobado el examen. No puedes repetirlo.');
        } else if (data.error === 'Ha pasado el plazo de 72 horas desde tu primer intento fallido. Debes repetir la formación.') {
          alert('❌ Se te ha pasado el tiempo para repetir. Debes reiniciar la formación.');
        } else if (data.error?.includes('Tienes hasta')) {
          const deadline = new Date(data.retryDeadline);
          setRetryDeadline(deadline);
          alert(data.error);
        } else {
          alert(`Error al iniciar intento: ${data.error || 'desconocido'}`);
        }
        return;
      }

      setAttemptId(data.attemptId);
      setStarted(true);
    } catch (err) {
      console.error('Error iniciando intento:', err);
      alert('Error al iniciar el intento de examen.');
    }
  };

  const resetUserProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/reset-user-progress`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Error reiniciando formación');
      alert('✅ Formación reiniciada correctamente. Puedes empezar de nuevo.');
      window.location.reload();
    } catch (err) {
      console.error('Error reiniciando formación:', err);
      alert('❌ Hubo un error al intentar reiniciar la formación.');
    }
  };

  const handleAnswer = (selectedIndex) => {
    const updated = [...answers];
    updated[currentQuestion] = selectedIndex;
    setAnswers(updated);
  };

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

  const endAttemptOnBackend = useCallback(async (finalScore, totalQuestions) => {
    if (!attemptId) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/end-attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          attemptId,
          score: finalScore,
          totalQuestions
        })
      });
    } catch (err) {
      console.error('Error al finalizar attempt:', err);
    }
  }, [attemptId]);

  const calculateScoreManually = async () => {
    if (!exam) return;
    const finalScore = calculateCurrentScore();
    const totalQuestions = exam?.questions?.length || 0;
    setScore(finalScore);
    await endAttemptOnBackend(finalScore, totalQuestions);
  };

  const nextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      calculateScoreManually();
    }
  };

  const resetExam = () => {
    setStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setScore(null);
    setAttemptId(null);
  };

  if (loading) return <p className="text-center mt-10">Cargando examen...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  if (!started && examPassed) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold text-green-700">✅ Ya has aprobado el examen final</h2>
        <p className="mt-4">No es necesario repetirlo.</p>
        <button
          className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg"
          disabled
        >
          Descargar diploma (próximamente)
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="text-center mt-10 max-w-xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">📝 Instrucciones antes de comenzar el examen</h2>
        <ul className="text-left list-disc list-inside text-gray-700 text-base">
          <li>El examen contiene <strong>{exam.questions.length}</strong> preguntas tipo test.</li>
          <li>Debes acertar al menos el <strong>75%</strong> para aprobar.</li>
          <li>Solo dispones de <strong>2 intentos</strong>.</li>
          <li>Si suspendes el primer intento, tendrás <strong>1 minuto</strong> para realizar el segundo (solo para pruebas).</li>
          <li>Si actualizas la página durante el examen, se perderá tu progreso.</li>
          <li>Una vez aprobado, no podrás repetir el examen.</li>
        </ul>
        {retryDeadline && (
          <p className="text-sm text-red-600">
            ⏳ Tiempo restante para repetir el examen: <strong>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</strong> minutos
          </p>
        )}

<button
          onClick={async () => {
            if (retryDeadline && new Date() > retryDeadline) {
              const confirmReset = window.confirm('⏱ El tiempo para repetir el examen ha expirado.\n¿Deseas reiniciar la formación ahora?');
              if (confirmReset) {
                await resetUserProgress();
              }
              return;
            }
            startAttempt();
          }}
          
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Comenzar examen
        </button>
      </div>
    );
  }

  if (score !== null) {
    const questionCount = exam.questions.length;
    const passingScore = Math.round(questionCount * 0.75);
    const passed = score >= passingScore;

    return (
      <div className="text-center mt-10">
        {passed ? (
          <>
            <p className="text-green-600 text-2xl font-semibold">✅ ¡Has aprobado!</p>
            <p className="mt-4">No necesitas repetir el examen.</p>
            <button
              className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg"
              disabled
            >
              Descargar diploma (próximamente)
            </button>
          </>
        ) : (
          <>
            <p className="text-red-600 text-2xl font-semibold">❌ No has aprobado.</p>
            <p className="mt-2 text-gray-700">
              Tienes <strong>1 minuto</strong> para repetir el examen. Si no lo haces a tiempo, tendrás que repetir toda la formación.
            </p>
            <button onClick={resetExam} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Repetir Examen</button>
          </>
        )}
      </div>
    );
  }

  const current = exam.questions[currentQuestion];
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Pregunta {currentQuestion + 1}</h2>
      <p className="mb-4">{current.question}</p>
      <ul>
        {current.options.map((option, index) => (
          <li key={index}>
            <label>
              <input
                type="radio"
                name={`q-${currentQuestion}`}
                checked={answers[currentQuestion] === index}
                onChange={() => handleAnswer(index)}
              />{' '}
              {option}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={nextQuestion} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
        {currentQuestion < exam.questions.length - 1 ? 'Siguiente' : 'Finalizar'}
      </button>
    </div>
  );
};

export default FinalExam;
