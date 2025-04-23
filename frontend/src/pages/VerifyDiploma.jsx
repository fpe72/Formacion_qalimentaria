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
          <div className="mt-6 bg-white border border-green-500 rounded-xl shadow-sm p-6 text-left w-full">
            <h2 className="text-xl font-semibold text-green-700 mb-4 border-b border-green-200 pb-2">
              Informe de asistencia al curso
            </h2>
            <table className="w-full text-sm text-gray-700 border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left">
                  <th className="font-medium pb-1">Contenido del módulo</th>
                  <th className="font-medium pb-1">Fecha completada</th>
                </tr>
              </thead>
              <tbody>
                {completedModules.map((mod, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="pr-4">{mod.title}</td>
                    <td>{new Date(mod.completedOn).toLocaleDateString("es-ES")}</td>
                  </tr>
                ))}
                </tbody>
              </table>

              {/* Firma de Eva */}
              <div className="mt-6 text-center">
                <img
                 src="/assets/images/firma-eva-bloque.png"
                 alt="Firma Eva María Martín Cruz - Gerente de Q-Alimentaria"
                 className="mx-auto max-h-28 object-contain"
               />
                <p className="mt-2 text-sm text-gray-800 font-semibold">Eva María Martín Cruz</p>
                <p className="text-sm text-gray-600">Gerente</p>
                <p className="text-sm text-gray-500">Ing. Agrónoma | Lic. Tecnología de Alimentos</p>
              </div>
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
