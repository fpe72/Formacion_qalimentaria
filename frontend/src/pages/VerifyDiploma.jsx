import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const VerifyDiploma = () => {
  const { serial } = useParams();
  const [diploma, setDiploma] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiploma = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/diplomas/serial/${serial}`);
        if (!response.ok) {
          throw new Error("Diploma no encontrado");
        }
        const data = await response.json();
        setDiploma(data);
      } catch (err) {
        setError(err.message);
      }
    };
  
    fetchDiploma();
  }, [serial]);
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-8">
      {error ? (
        <div className="text-red-600 font-semibold text-lg">
          ❌ {error}
        </div>
      ) : diploma ? (
        <div className="bg-white shadow-md rounded-xl p-6 max-w-lg w-full text-center border border-green-500">
          <h1 className="text-2xl font-bold text-green-700 mb-4">✅ Diploma verificado correctamente</h1>
          <p className="text-gray-700 mb-2"><strong>Nombre:</strong> {diploma.name}</p>
          <p className="text-gray-700 mb-2"><strong>DNI:</strong> {diploma.dni}</p>
          <p className="text-gray-700 mb-2"><strong>Empresa:</strong> {diploma.company}</p>
          <p className="text-gray-700 mb-2"><strong>Fecha de emisión:</strong> {diploma.date}</p>
          <p className="text-gray-700 mt-4"><strong>Nº de Registro:</strong> {diploma.serial}</p>
          <p className="text-green-600 font-medium mt-6">
            Este diploma ha sido emitido oficialmente por <strong>Q-Alimentaria</strong>.
          </p>
        </div>
      ) : (
        <div className="text-gray-500">Cargando información...</div>
      )}
    </div>
  );
};

export default VerifyDiploma;
