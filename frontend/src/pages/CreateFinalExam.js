// frontend/src/pages/CreateFinalExam.js
import React, { useState } from 'react';

const CreateFinalExam = () => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showAutoMessage, setShowAutoMessage] = useState(false);

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
            setShowAutoMessage(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Crear examen manualmente
        </button>

        <button
          onClick={() => {
            setShowAutoMessage(true);
            setShowManualForm(false);
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
          
          <div className="mb-4">
            <label className="block text-gray-700">Pregunta:</label>
            <input
              type="text"
              placeholder="Escribe la pregunta aquí..."
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Opción A:</label>
            <input
              type="text"
              placeholder="Respuesta A..."
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Opción B:</label>
            <input
              type="text"
              placeholder="Respuesta B..."
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Opción C:</label>
            <input
              type="text"
              placeholder="Respuesta C..."
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Respuesta correcta:</label>
            <select className="w-full p-2 border rounded">
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </div>

          <button
            className="bg-primary hover:bg-secondary text-white py-2 px-4 rounded transition"
            onClick={() => alert('Funcionalidad aún no implementada')}
          >
            Guardar pregunta
          </button>
        </div>
      )}

      {/* Mensaje Generación Automática (visual, sin funcionalidad aún) */}
      {showAutoMessage && (
        <div className="bg-gray-100 shadow-md rounded p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Generar Examen Automáticamente</h3>
          <p className="text-gray-600">
            Al pulsar aquí, la aplicación generará automáticamente un examen con preguntas extraídas de los módulos existentes.
            (Funcionalidad aún no implementada)
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateFinalExam;
