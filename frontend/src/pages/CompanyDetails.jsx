import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function CompanyDetails() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formationType, setFormationType] = useState("basica");
  const [maxUsers, setMaxUsers] = useState("10");
  const [expiresAt, setExpiresAt] = useState("");
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cif, setCif] = useState("");
  const [email, setEmail] = useState("");


  useEffect(() => {
    const token = localStorage.getItem("token");

    // Cargar datos de empresa
    fetch(`${process.env.REACT_APP_BACKEND_URL}/companies/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCompany(data);
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setCif(data.cif || "");
        setEmail(data.email || "");
      })
      
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
    

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const body = {
      code: `${company.name.toUpperCase().replace(/\s/g, '-')}-${Math.floor(Math.random() * 1000)}`,
      companyId: company._id,
      formationType: formationType,
      maxUsers: parseInt(maxUsers),
      expiresAt,
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/company-codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        alert("✅ Código creado correctamente");
        setCodes((prev) => [data.code, ...prev]);
        setFormationType("basica");
        setMaxUsers("10");
        setExpiresAt("");
      } else {
        const data = await res.json();
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error("Error creando código:", err);
      alert("❌ Error al crear código");
    }
  };
  // ⬇️ ESTA FUNCIÓN DEBE IR AQUÍ, FUERA DE `handleCreate`
const handleSave = () => {
  const token = localStorage.getItem("token");

  fetch(`${process.env.REACT_APP_BACKEND_URL}/companies/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ address, phone, cif, email }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error guardando");
      return res.json();
    })
    .then((updated) => {
      setCompany(updated);
      setEditing(false);
      alert("Empresa actualizada correctamente");
    })
    .catch((err) => {
      console.error("Error actualizando empresa", err);
      alert("Hubo un error al guardar los cambios");
    });
};

  if (loading) return <p className="p-4">Cargando...</p>;

  const handleDeactivate = async (codeId) => {
    if (!window.confirm("¿Estás seguro de desactivar este código?")) return;
  
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/company-codes/deactivate/${codeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Respuesta inesperada del backend:", errorText);
        alert("❌ Error al desactivar el código.");
        return;
      }
  
      const updated = await res.json();
      setCodes((prev) =>
        prev.map((code) => (code._id === updated._id ? updated : code))
      );
      alert("✅ Código desactivado");
    } catch (err) {
      console.error("Error inesperado al desactivar el código:", err);
      alert("❌ Error inesperado al desactivar el código");
    }
  };

  const handleActivate = async (codeId) => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/company-codes/activate/${codeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Respuesta inesperada al activar:", errorText);
        alert("❌ Error al activar el código.");
        return;
      }
  
      const updated = await res.json();
      setCodes((prev) =>
        prev.map((code) => (code._id === updated._id ? updated : code))
      );
      alert("✅ Código activado correctamente");
    } catch (error) {
      console.error("Error al activar código:", error);
      alert("❌ Error inesperado al activar código");
    }
  };

  const handleDelete = async (codeId) => {
    if (!window.confirm("¿Eliminar este código definitivamente? Esta acción no se puede deshacer.")) return;
  
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/company-codes/${codeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        setCodes((prev) => prev.filter((c) => c._id !== codeId));
        alert("✅ Código eliminado");
      } else {
        const error = await res.json();
        alert(`❌ Error al eliminar: ${error.message}`);
      }
    } catch (error) {
      console.error("Error al eliminar código:", error);
      alert("❌ Error inesperado al eliminar código");
    }
  };
  
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
      <h2 className="text-xl font-semibold mt-6 mb-2">Datos de contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Dirección:</label>
            {editing ? (
              <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
            ) : (
              <p>{address}</p>
            )}
          </div>
          <div>
            <label className="block font-medium">Teléfono:</label>
            {editing ? (
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            ) : (
              <p>{phone}</p>
            )}
          </div>
          <div>
            <label className="block font-medium">CIF:</label>
            {editing ? (
              <input className="input" value={cif} onChange={(e) => setCif(e.target.value)} />
            ) : (
              <p>{cif}</p>
            )}
          </div>
          <div>
            <label className="block font-medium">Email:</label>
            {editing ? (
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            ) : (
              <p>{email}</p>
            )}
          </div>
        </div>

<div className="mt-4">
  {!editing ? (
    <button onClick={() => setEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
      Editar empresa
    </button>
  ) : (
    <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
      Guardar cambios
    </button>
  )}
</div>




      <div className="bg-gray-50 p-4 border rounded mb-6">
        <h3 className="text-lg font-semibold mb-2">Crear nuevo código de empresa</h3>
        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-sm">Formación</label>
              <select
                value={formationType}
                onChange={(e) => setFormationType(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="basica">Básica</option>
                <option value="avanzada">Avanzada</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm">Cupo máximo</label>
              <input
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                className="w-full border px-2 py-1 rounded"
                min={1}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Fecha de caducidad</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Crear código
          </button>
        </form>
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
        
                    <div className="flex items-center gap-2">
                      {code.active && new Date(code.expiresAt) > new Date() ? (
                        <>
                          <span>✅ Activo</span>
                          <button
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={() => handleDeactivate(code._id)}
                          >
                            Desactivar
                          </button>
                        </>
                      ) : (
                        <>
                          <span>❌ Inactivo</span>
                          <button
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={() => handleActivate(code._id)}
                          >
                            Activar
                          </button>
                          <button
                                className="ml-2 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                onClick={() => handleDelete(code._id)}
                              >
                                Eliminar
                              </button>
                        </>
                      )}
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

export default CompanyDetails;
