// frontend/src/pages/FinalExam.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';


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
  const [examTimeLeft, setExamTimeLeft] = useState(null); // tiempo restante mientras se realiza el examen
  const [isGenerating, setIsGenerating] = useState(false);
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

  const fetchRetryDeadline = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/final-exam/${examId}/last-failed-attempt`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (res.ok) {
        const data = await res.json();
        if (data?.endTime) {
          const deadline = new Date(new Date(data.endTime).getTime() + 72 * 60 * 60 * 1000); // +72 h
          setRetryDeadline(deadline);
        }
      }
    } catch (err) {
      console.error('Error obteniendo deadline:', err);
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
        await fetchRetryDeadline(data._id);
   
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, []);

// 🔄 LIMPIAR localStorage Y sessionStorage AL CARGAR LA PÁGINA
  useEffect(() => {
    localStorage.removeItem('examState');
    localStorage.removeItem('answersBuffer');
    sessionStorage.clear();
  }, []);


  useEffect(() => {
    const fetchLatestAttempt = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/final-exam/my-latest-attempt`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        if (res.data.attempt && res.data.attempt.passed) {
          setAttemptId(res.data.attempt._id);       // esto ya lo usas para generar el diploma
          setExamPassed(true);                      // fuerza la vista del botón
        }
      } catch (err) {
        console.error("No se pudo obtener el último intento aprobado:", err);
      }
    };
  
    fetchLatestAttempt();
  }, []);
  

  useEffect(() => {
    if (!retryDeadline) return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(retryDeadline) - new Date()) / 1000));
      setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [retryDeadline]);

  useEffect(() => {
    if (!started || examTimeLeft === null) return;
  
    if (examTimeLeft <= 0) {
      finishExam();
      return;
    }
  
    const interval = setInterval(() => {
      setExamTimeLeft((prev) => prev - 1);
    }, 1000);
  
    return () => clearInterval(interval);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, examTimeLeft]);
  
  

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

  const downloadDiploma = async () => {
    try {
      setIsGenerating(true); // ⏳ Mostrar barra de progreso visual
  
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/final-exam/diploma/${attemptId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) throw new Error("Error al generar el diploma.");
  
      const blob = await response.blob();
      const secureBlob = new Blob([blob], { type: "application/pdf" });
      const url = window.URL.createObjectURL(secureBlob);
  
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "diploma.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("No se pudo descargar el diploma.");
    } finally {
      setIsGenerating(false); // ✅ Ocultar barra una vez finalice
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

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
  
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };
  
  if (loading) return <p className="text-center mt-10">Cargando examen...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  const handleDownloadClick = async () => {
    setIsGenerating(true);
    const minimumDelay = new Promise((resolve) => setTimeout(resolve, 15000));
    await Promise.all([downloadDiploma(), minimumDelay]);
    setIsGenerating(false);
  };
  

  if (!started && examPassed) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold text-green-700">✅ Ya has aprobado el examen final</h2>
        <p className="mt-4">No es necesario repetirlo.</p>
  
        {isGenerating ? (
          <ProgressBar />
        ) : (
          <button
            onClick={downloadDiploma}
            className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Descargar diploma
          </button>
        )}
      </div>
    );
  }  

  if (!started) {
    const tiempoTotalMinutos = exam.questions.length + 3;
  
    return (
      <div className="text-center mt-10 max-w-2xl mx-auto space-y-6">
  
        {/* BLOQUE DE INSTRUCCIONES MEJORADO */}
          <div className="p-6 border-2 border-gray-300 rounded-xl bg-white shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">📝 Instrucciones antes de comenzar el examen</h2>
            <ul className="text-left list-disc list-inside text-gray-700 text-lg space-y-2">
              <li>📌 El examen contiene <strong>{exam.questions.length}</strong> preguntas tipo test.</li>
              <li>✅ Debes acertar al menos el <strong>75 %</strong> para aprobar.</li>
              <li>🎯 Dispones de <strong>2 intentos</strong>.</li>
              <li>⏳ Si suspendes el primer intento, <strong>dispones de 72 horas</strong> para realizar el segundo intento. Si no lo haces en ese plazo, deberás repetir toda la formación.</li>
              <li>⚠️🔃 <strong>Si actualizas la página</strong>, perderás tu progreso.</li>
              <li>⚠️🔙 <strong>Si pulsas la flecha “Atrás”</strong> del navegador, perderás tu progreso.</li>
              <li>⚠️🚪 <strong>Si cierras sesión</strong> (o la sesión se cierra tras <strong>10 minutos</strong> de inactividad), perderás tu progreso.</li>
              <li>⚠️🖥️ <strong>Si abres el examen en dos pestañas o dispositivos al mismo tiempo</strong>, se invalidará el intento y perderás tu progreso.</li>
              <li>⚠️⚡ Cualquier cierre inesperado del navegador o caída de conexión finaliza el intento y el progreso se perderá.</li>
              <li>⚠️🎓 Una vez aprobado, no podrás repetir el examen.</li>
            </ul>
          </div>

        {/* TIEMPO TOTAL DISPONIBLE */}
        <div className="p-5 border-2 border-blue-500 rounded-lg bg-blue-50 text-blue-900 font-semibold text-xl">
          ⏱️ Tiempo total disponible para realizar el examen: <strong>{tiempoTotalMinutos} minutos</strong>
        </div>
  
        {/* TIEMPO RESTANTE PARA REPETIR */}
        {retryDeadline && (
        <p className="text-base text-red-600">
          ⏳ Tiempo restante para repetir el examen: <strong>{formatTime(timeLeft)}</strong> (HH:MM:SS)
        </p>
      )}

  
        {/* BOTÓN PARA COMENZAR */}
        <button
          onClick={async () => {
    if (retryDeadline && new Date() > retryDeadline) {
      const confirmReset = window.confirm('⏱ El tiempo para repetir el examen ha expirado.\n¿Deseas reiniciar la formación ahora?');
      if (confirmReset) {
        await resetUserProgress();
      }
      return;
    }

    // ⏱ INICIAR TEMPORIZADOR
    const totalSeconds = (exam.questions.length + 3) * 60;
    setExamTimeLeft(totalSeconds);

    startAttempt();
    }}
    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
    >
    Comenzar examen
    </button>

      </div>
    );
  }

  const finishExam = () => {
    calculateScoreManually();
  };
  
  if (score !== null) {
    const questionCount = exam.questions.length;
    const passingScore = Math.round(questionCount * 0.75);
    const passed = score >= passingScore;
    const percentage = Math.round((score / questionCount) * 100);

   
  
    return (
      <div className="text-center mt-10 space-y-4">
        {passed ? (
          <>
            <p className="text-green-600 text-2xl font-semibold">✅ ¡Has aprobado!</p>
            <p className="text-gray-800 text-lg">
              Has acertado <strong>{score}</strong> de <strong>{questionCount}</strong> preguntas.
            </p>
            <p className="text-gray-800 text-lg">Resultado: <strong>{percentage}%</strong></p>
           
            {isGenerating ? (
                <ProgressBar />
              ) : (
                <button
                onClick={handleDownloadClick}
                className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Descargar diploma
              </button>              
              )}
          </>
        ) : (
          <>
            <p className="text-red-600 text-2xl font-semibold">❌ No has aprobado.</p>
            <p className="text-gray-800 text-lg">
              Has acertado <strong>{score}</strong> de <strong>{questionCount}</strong> preguntas.
            </p>
            <p className="text-gray-800 text-lg">Resultado: <strong>{percentage}%</strong></p>
            <p className="mt-2 text-gray-700">
              Tienes <strong>72 horas (3 días)</strong> para repetir el examen. Si no lo haces a tiempo, tendrás que repetir toda la formación.
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
      <h2 className="text-xl font-bold mb-2">
      Pregunta {currentQuestion + 1} de {exam.questions.length}
      </h2>
      <p className="text-base text-gray-600 mb-4">
       Progreso: <strong>{currentQuestion + 1}</strong> / {exam.questions.length}
    </p>
    <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
  <div
    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
    style={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
   ></div>
  </div>

      {examTimeLeft !== null && (
       <div className="text-right text-red-600 font-semibold mb-4">
         ⏱ Tiempo restante: {Math.floor(examTimeLeft / 60)}:{String(examTimeLeft % 60).padStart(2, '0')}
          </div>
      )}

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

const ProgressBar = () => (
  <div className="mt-6 w-64 mx-auto">
    <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
      <div
        className="bg-green-500 h-4 animate-pulse"
        style={{ width: '100%' }}
      ></div>
    </div>
    <p className="mt-2 text-sm text-gray-600">Generando diploma, por favor espera...</p>
  </div>
);

export default FinalExam;