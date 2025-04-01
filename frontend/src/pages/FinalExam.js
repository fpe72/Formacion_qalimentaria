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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const checkAttempt = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/my-latest-attempt`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.attempt?.passed) {
          setExamPassed(true);
        }
      } catch (err) {
        console.error('Error revisando intento previo:', err);
      }
    };

    fetchExam();
    checkAttempt();
  }, []);

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
      setAttemptId(data.attemptId);
      setStarted(true);
    } catch (err) {
      console.error('Error iniciando intento:', err);
      alert('Error al iniciar el intento de examen.');
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
      </div>
    );
  }

  if (!started) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold">Bienvenido al examen final</h2>
        <button onClick={startAttempt} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg">
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
          </>
        ) : (
          <>
            <p className="text-red-600 text-2xl font-semibold">❌ No has aprobado.</p>
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
