import React, { useEffect, useState } from 'react';

const CompanyCodeList = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const token = localStorage.getItem('token'); // JWT
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/company-codes/admin/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('No autorizado o error de conexión');

        const data = await res.json();
        setCodes(data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los códigos');
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, []);

  if (loading) return <p className="text-center mt-8">Cargando códigos...</p>;
  if (error) return <p className="text-center text-red-600 mt-8">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Códigos de Empresa</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Código</th>
              <th className="p-2 border">Tipo</th>
              <th className="p-2 border">Empresa / Email</th>
              <th className="p-2 border">Cupo</th>
              <th className="p-2 border">Emails registrados</th>
            </tr>
          </thead>
          <tbody>
  {codes.map((code) => (
    <tr key={code.code} className="border-t">
      <td className="p-2 border font-mono">{code.code}</td>
      <td className="p-2 border">{code.tipo}</td> {/* NUEVO */}
      <td className="p-2 border">{code.company}</td> {/* NUEVO */}
      <td className="p-2 border text-center">
        {code.usedUsers} / {code.maxUsers}
      </td>
      <td className="p-2 border">
        <ul className="list-disc list-inside space-y-1">
          {code.users.length > 0 ? (
            code.users.map((u, i) => (
              <li key={i} className="text-sm text-gray-800">
                {u.name} – <span className="font-mono">{u.email}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-400 italic">Ningún usuario registrado aún</p>
          )}
        </ul>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyCodeList;
