// frontend/src/pages/CreateFinalExam.js
import React, { useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const CreateFinalExam = () => {
  const [questionsGenerated, setQuestionsGenerated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateExamAutomatically = async () => {
    setLoading(true);
    setProgress(0);
    setQuestionsGenerated([]);
  
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 4;
      setProgress((prev) => Math.min(progressValue, 95));
    }, 200);
  
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/generate-dynamic`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setQuestionsGenerated(data.flatMap(module => module.questions));
      } else {
        alert('❌ Error al generar el examen');
      }
    } catch (error) {
      console.error('Error al generar examen:', error);
      alert('❌ Error de conexión al generar examen');
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setLoading(false), 500); // un pequeño respiro visual
    }
  };  

  const handleSaveExam = async () => {
    try {
      const token = localStorage.getItem('token');

      const formattedQuestions = questionsGenerated.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.answer // ⚠️ aquí trasladamos la respuesta correcta
      }));
      

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Examen generado con OpenAI',
          questions: formattedQuestions,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('✅ Examen guardado correctamente');
      } else {
        console.error(data);
        alert('❌ Error al guardar el examen');
      }
    } catch (error) {
      console.error('Error en handleSaveExam:', error);
      alert('❌ Error al guardar el examen');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">
        Gestionar Examen Final
      </h2>

      {/* Botón para generar automáticamente */}
      <div className="flex justify-center mb-8">
        <button
          onClick={generateExamAutomatically}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Generar examen automáticamente
        </button>
      </div>

      {/* Mostrar preguntas generadas automáticamente */}
      {loading && (
  <div className="w-32 mx-auto my-8">
    <CircularProgressbar
      value={progress}
      text={`${progress}%`}
      styles={buildStyles({
        pathColor: '#22c55e', // verde
        textColor: '#22c55e',
        trailColor: '#d1fae5',
        textSize: '16px',
      })}
    />
    <p className="text-center mt-2 text-green-600 font-medium">Generando examen...</p>
  </div>
)}

      {!loading && questionsGenerated.length > 0 && (
        <div className="bg-gray-100 shadow-md rounded p-6">
          <h3 className="text-xl font-semibold mb-4">Preguntas generadas automáticamente:</h3>
          <ol className="list-decimal list-inside space-y-4">
          {Array.isArray(questionsGenerated) && questionsGenerated.length > 0 && (
              questionsGenerated.map((q, index) => (
                <li key={index}>
                  <p className="font-semibold">{q.question}</p>
                  <ul className="list-disc ml-6 text-sm">
                    {q.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-green-600">Respuesta correcta: {q.answer}</p>
                </li>
              ))
            )}
          </ol>

          {/* Botón para guardar examen */}
          <div className="mt-6">
            <button
              onClick={handleSaveExam}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            >
              Guardar examen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFinalExam;
