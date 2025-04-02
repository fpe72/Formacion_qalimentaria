import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';

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
        setCompanies(data);
      } catch (err) {
        console.error('Error al cargar empresas:', err);
      }
    };

    fetchCompanies();
  }, [auth.token, message]); // Refresca la lista al crear una nueva

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

      <h3 className="text-xl font-semibold mt-8 mb-2">Empresas registradas</h3>
      <ul className="list-disc pl-5 text-gray-700">
        {companies.map((company) => (
          <li key={company._id}>
            {company.name} {company.active ? '(activa)' : '(inactiva)'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CreateCompany;
