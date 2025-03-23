// frontend/src/pages/ModulesView.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ModulesView() {
  const [modules, setModules] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Petición GET /modules
    fetch(`${process.env.REACT_APP_API_URL}/modules`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setModules(data);
      })
      .catch(err => console.error("Error al obtener módulos:", err));
  }, [token]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Lista de Módulos</h1>
      {modules.map((mod) => (
        <div
          key={mod._id}
          style={{
            border: "1px solid #ccc",
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "4px"
          }}
        >
          <h2>{mod.title}</h2>
          <p>{mod.description}</p>
          {/* Enlace al detalle */}
          <Link to={`/modules/${mod._id}`}>
            <button>Ver Detalle</button>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default ModulesView;
