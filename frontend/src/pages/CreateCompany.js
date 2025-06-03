import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom'; // Asegúrate de tenerlo arriba

function CreateCompany() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [companies, setCompanies] = useState([]);
  const { auth } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Empresa "${name}" creada con éxito`);
        setName('');
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Error de conexión');
    }
  };

  // Obtener empresas ya creadas
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/companies`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setCompanies(data);
        } else if (Array.isArray(data.companies)) {
          setCompanies(data.companies);
        } else {
          console.error("❌ Formato inesperado al cargar empresas:", data);
          setCompanies([]);
        }
      } catch (err) {
        console.error('Error al cargar empresas:', err);
      }
    };

    fetchCompanies();
  }, [auth.token, message]); // Refresca la lista al crear una nueva

  // Función para activar/desactivar una empresa
  const toggleCompany = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/companies/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setCompanies((prev) =>
          prev.map((c) => (c._id === data.company._id ? data.company : c))
        );
      } else {
        setMessage('❌ Error al actualizar la empresa');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Error de conexión');
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Crear nueva empresa</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-gray-700">Nombre de la empresa:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Crear Empresa
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}

      <h3 className="text-xl font-semibold mt-8 mb-4">Empresas registradas</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded border text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-center">Estado</th>
                <th className="px-4 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 max-w-xs truncate" title={company.name}>
                    {company.name}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={company.active ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {company.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => toggleCompany(company._id)}
                        className={`px-4 py-1 rounded text-white text-xs whitespace-nowrap ${
                          company.active
                            ? "bg-gray-500 hover:bg-gray-600"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {company.active ? "Desactivar" : "Activar"}
                      </button>
                      <Link
                        to={`/admin/company/${company._id}`}
                        className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded whitespace-nowrap"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
          </div>
      </div>
  );
}

export default CreateCompany;