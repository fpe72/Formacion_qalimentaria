import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from 'moment';


const VerifyDiploma = () => {
  const { serial } = useParams();
  const [diploma, setDiploma] = useState(null);
  const [error, setError] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);


  useEffect(() => {
    const fetchDiploma = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/diplomas/serial/${serial}`);
        if (!response.ok) {
          throw new Error("Diploma no encontrado");
        }
    
        const data = await response.json();
        setDiploma(data);
    
        // ✅ Fetch de módulos completados
        const modulesRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/final-exam/diplomas/serial/${serial}/modules`);
        const modulesData = await modulesRes.json();
        setCompletedModules(modulesData);
    
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
          <p className="text-gray-700 mb-2"><strong>Empresa:</strong> {diploma.company === "Sin empresa" ? "Particular" : diploma.company}</p>
          <p className="text-gray-700 mb-2"><strong>Fecha de emisión:</strong> {moment(diploma.date).format('DD/MM/YYYY')}</p>
          <p className="text-gray-700 mt-4"><strong>Nº de Registro:</strong> {diploma.serial}</p>
          <p className="text-green-600 font-medium mt-6"> 
          Este diploma ha sido emitido oficialmente por <span className="whitespace-nowrap">Q–Alimentaria.</span>
          </p>
          {completedModules.length > 0 && (
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 text-left rounded-md shadow-sm">
                <h2 className="text-lg font-semibold text-blue-700 mb-2">Contenido del curso:</h2>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {completedModules.map((mod, idx) => (
                    <li key={idx}>
                      {mod.title} – {new Date(mod.completedOn).toLocaleDateString("es-ES")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

        </div>
      ) : (
        <div className="text-gray-500">Cargando información...</div>
      )}
    </div>
  );
};

export default VerifyDiploma;
