import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { io } from 'socket.io-client';


function AdminProgress() {
  const { auth } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [onlineNow, setOnlineNow] = useState(new Set());

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/user-progress`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        const json = await res.json();
        setData(json);

        const empresasUnicas = [...new Set(json.map(u => u.company))].filter(Boolean).sort();
        setEmpresas(empresasUnicas);


      } catch (err) {
        console.error("Error al obtener progreso:", err);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchProgress();
    
      // ✅ Socket realtime para detectar usuarios online
      const socket = io(process.env.REACT_APP_BACKEND_URL.replace(/\/api.*$/, ''));
    
      socket.emit('auth', auth.token);
    
      socket.on('user-online', ({ email }) => {
        setOnlineNow((prev) => new Set(prev).add(email));
      });
    
      socket.on('user-offline', ({ email }) => {
        setOnlineNow((prev) => {
          const next = new Set(prev);
          next.delete(email);
          return next;
        });
      });
    
      return () => socket.disconnect();
    }
    
  }, [auth]);

  const dataFiltrada = filtroEmpresa
    ? data.filter(u => u.company.toLowerCase().includes(filtroEmpresa.toLowerCase()))
    : data;

    const exportToCSV = () => {
      const headers = [
        "Nombre",
        "Email",
        "Empresa",
        "% Módulos",
        "Estado examen",
        "Fecha intento",
        "Diploma",
        "Enlace diploma"
      ];
    
      const rows = dataFiltrada.map((u) => [
        u.name,
        u.email,
        u.company,
        `${u.modulesCompleted?.percentage || 0}%`,
        u.exam?.passed ? "Aprobado" : u.exam ? "Suspendido" : "",
        u.exam?.date ? new Date(u.exam.date).toLocaleDateString("es-ES") : "",
        u.diploma.issued ? "Sí" : "No",
        u.diploma.issued ? u.diploma.url : ""
      ]);
    
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
    
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "progreso_usuarios.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Progreso de Usuarios</h1>

      <div className="flex items-center gap-4 mb-4">
        <select
          className="border px-3 py-2 rounded max-w-sm"
          value={filtroEmpresa}
          onChange={(e) => setFiltroEmpresa(e.target.value)}
        >
        <option value="">Todas las empresas</option>
        {empresas.map((empresa, idx) => (
          <option key={idx} value={empresa}>{empresa}</option>
        ))}
      </select>

      <button
        onClick={exportToCSV}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Exportar CSV
      </button>
    </div>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border text-center">●</th>
                <th className="px-3 py-2 border">Nombre</th>
                <th className="px-3 py-2 border">Email</th>
                <th className="px-3 py-2 text-center">Empresa</th>
                <th className="px-3 py-2 border">% Módulos</th>
                <th className="px-3 py-2 border">Examen</th>
                <th className="px-3 py-2 border">Fecha intento</th>
                <th className="px-3 py-2 border">Diploma</th>
              </tr>
            </thead>
            <tbody>
              {dataFiltrada.map((u, idx) => (
                <tr key={idx} className="text-sm">
                  <td className="border px-2 py-1 text-center">
                      {onlineNow.has(u.email) ? (
                        <span className="text-green-600 text-xl">●</span>
                      ) : (
                        <span className="text-gray-300 text-xl">○</span>
                      )}
                 </td>
                  <td className="border px-2 py-1">{u.name}</td>
                  <td className="border px-2 py-1">{u.email}</td>
                  <td className="border px-2 py-1 text-center">{u.company}</td>
                  <td className="border px-2 py-1 text-center">{u.modulesCompleted.percentage}%</td>
                  <td className="border px-2 py-1 text-center">
                    {u.exam?.passed ? "✅ Aprobado" : u.exam ? "❌ Suspendido" : "—"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {u.exam?.date ? new Date(u.exam.date).toLocaleDateString("es-ES") : "—"}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {u.diploma.issued ? (
                      <a
                        href={u.diploma.url}
                        className="text-blue-600 underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminProgress;
