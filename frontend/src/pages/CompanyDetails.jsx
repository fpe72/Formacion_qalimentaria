import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function CompanyDetails() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Cargar datos de empresa
    fetch(`${process.env.REACT_APP_BACKEND_URL}/companies/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCompany(data))
      .catch((err) => console.error("Error cargando empresa", err));

    // Cargar códigos de empresa
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/company-codes/by-company/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCodes(data))
      .catch((err) => console.error("Error cargando códigos", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-4">Cargando...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          {company ? (
            <>
              <h2 className="text-2xl font-bold">{company.name}</h2>
              <p className={`font-semibold ${company.active ? 'text-green-600' : 'text-red-600'}`}>
                {company.active ? '✅ Activa' : '❌ Inactiva'}
              </p>
            </>
          ) : (
            <p className="text-red-600">❌ Empresa no encontrada</p>
          )}
        </div>
        <Link
          to="/admin/create-company"
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
        >
          ← Volver a empresas
        </Link>
      </div>

      <h3 className="text-xl font-semibold mb-2">Códigos de empresa</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Código</th>
              <th className="px-4 py-2 text-left">Formación</th>
              <th className="px-4 py-2 text-left">Cupo</th>
              <th className="px-4 py-2 text-left">Caduca</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr key={code._id} className="border-t">
                <td className="px-4 py-2">{code.code}</td>
                <td className="px-4 py-2 capitalize">{code.formationType}</td>
                <td className="px-4 py-2">{code.usedUsers} / {code.maxUsers}</td>
                <td className="px-4 py-2">{code.expiresAt?.substring(0, 10)}</td>
                <td className="px-4 py-2">
                  {code.active && new Date(code.expiresAt) > new Date()
                    ? "✅ Activo"
                    : "❌ Inactivo"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompanyDetails;
