// src/components/ModuleDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ModuleDetail() {
  // Obtenemos el ID del módulo desde la URL
  const { id } = useParams();  // asumiendo la ruta /modules/:id
  const token = localStorage.getItem("token");

  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al montar, obtener info del módulo
    fetch(`${process.env.REACT_APP_API_URL}/modules/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setModuleData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al obtener el módulo:", err);
        setLoading(false);
      });
  }, [id, token]);

  if (loading) {
    return <div style={{ padding: 20 }}>Cargando módulo...</div>;
  }

  if (!moduleData || !moduleData._id) {
    return <div style={{ padding: 20 }}>No se encontró el módulo</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{moduleData.title}</h1>
      <p>{moduleData.description}</p>

      {/* Aquí mostramos las lecciones */}
      {moduleData.lessons && moduleData.lessons.length > 0 ? (
        moduleData.lessons.map((lesson) => (
          <div
            key={lesson.lessonId}
            style={{
              border: "1px solid #ccc",
              margin: "10px 0",
              padding: "10px",
              borderRadius: "4px"
            }}
          >
            <h2>{lesson.lessonTitle}</h2>
            {/* Suponemos que lessonContent es HTML.
                Usamos dangerouslySetInnerHTML con precaución. */}
            <div
              dangerouslySetInnerHTML={{
                __html: lesson.lessonContent
              }}
            />
          </div>
        ))
      ) : (
        <p>No hay lecciones en este módulo.</p>
      )}
    </div>
  );
}

export default ModuleDetail;
