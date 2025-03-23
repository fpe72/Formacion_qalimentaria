// frontend/src/components/ModuleDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ModuleDetail() {
  const { id } = useParams(); // /modules/:id
  const token = localStorage.getItem("token");

  const [moduleData, setModuleData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/modules/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setModuleData(data))
      .catch(err => console.error("Error al obtener el módulo:", err));
  }, [id, token]);

  if (!moduleData) {
    return <div style={{ padding: 20 }}>Cargando o no encontrado...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{moduleData.title}</h1>
      <p>{moduleData.description}</p>

      {/* Renderizar el HTML del campo content */}
      {moduleData.content && (
        <div
          dangerouslySetInnerHTML={{ __html: moduleData.content }}
        />
      )}
    </div>
  );
}

export default ModuleDetail;
