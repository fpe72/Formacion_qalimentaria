import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function VerifyDiploma() {
  const { serial } = useParams();
  const [diploma, setDiploma] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendURL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetch(`${backendURL}/diplomas/serial/${serial}`)
      .then(res => res.json())
      .then(data => {
        setDiploma(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [serial]);

  if (loading) return <p className="text-center">Verificando diploma...</p>;
  if (!diploma) return <p className="text-center text-red-500">Diploma no encontrado.</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-center text-green-700 mb-4">Diploma verificado</h1>
      <p><strong>Nombre:</strong> {diploma.name}</p>
      <p><strong>DNI:</strong> {diploma.dni}</p>
      <p><strong>Empresa:</strong> {diploma.company}</p>
      <p><strong>Fecha:</strong> {diploma.date}</p>
      <p className="mt-4 text-sm text-gray-500">Nº de Registro: {diploma.serial}</p>
      <a
        href={`${backendURL}/final-exam/diploma/download/${diploma.serial}`}
        target="_blank"
        className="mt-6 inline-block bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
      >
        Descargar Diploma PDF
      </a>
    </div>
  );
}
