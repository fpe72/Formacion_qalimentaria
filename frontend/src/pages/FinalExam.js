// frontend/src/pages/FinalExam.js
import React from 'react';

const FinalExam = () => {
  const handleStartExam = () => {
    alert("Aquí comenzará el examen (funcionalidad aún no implementada).");
  };

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
          <li>Si tampoco superas el segundo intento, deberás <strong>repetir toda la formación</strong> para volver a tener derecho a dos nuevos intentos.</li>
          <li>Si apruebas, <strong>Q-Alimentaria emitirá un diploma de superación</strong> a tu nombre, que podrás <strong>descargar desde la aplicación</strong> y también recibirás <strong>por correo electrónico</strong>.</li>
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
};

export default FinalExam;
