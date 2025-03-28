// frontend/src/pages/CreateFinalExam.js
import React, { useState } from 'react';

const CreateFinalExam = () => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateExamAutomatically = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/generate`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestionsGenerated(data);
      } else {
        alert('Error al generar examen automáticamente.');
      }
    } catch (error) {
      console.error(error);
      alert('Error al conectar con el servidor.');
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">
        Gestionar Examen Final
      </h2>

      {/* Botones principales */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => {
            setShowManualForm(true);
            setQuestionsGenerated([]);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Crear examen manualmente
        </button>

        <button
          onClick={() => {
            setShowManualForm(false);
            generateExamAutomatically();
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Generar examen automáticamente
        </button>
      </div>

      {/* Formulario Manual (visual, sin funcionalidad aún) */}
      {showManualForm && (
        <div className="bg-gray-100 shadow-md rounded p-6">
          <h3 className="text-xl font-semibold mb-4">Crear Examen Manualmente</h3>
          <p className="text-gray-500">(Formulario manual, funcionalidad no implementada)</p>
        </div>
      )}

      {/* Mostrar preguntas generadas automáticamente */}
      {loading && <p className="text-center text-gray-600">Generando examen...</p>}

      {!loading && questionsGenerated.length > 0 && (
        <div className="bg-gray-100 shadow-md rounded p-6">
          <h3 className="text-xl font-semibold mb-4">Preguntas generadas automáticamente:</h3>
          <ol className="list-decimal list-inside space-y-4">
            {questionsGenerated.map((q, index) => (
              <li key={q._id}>
                <p className="font-semibold">{q.question}</p>
                <ul className="list-disc ml-6 text-sm">
                  {q.options.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
                <p className="text-sm text-green-600">Respuesta correcta: {q.answer}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default CreateFinalExam;
