// src/pages/ProgressView.js (ejemplo)
import React, { useEffect, useState } from "react";

function ProgressView() {
  const [progressList, setProgressList] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Al montar, obtenemos todos los documentos de progreso del usuario
    fetch(`${process.env.REACT_APP_API_URL}/progress`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        // data debe ser un array de documentos de progreso
        setProgressList(data);
      })
      .catch((err) => console.error("Error al obtener progress:", err));
  }, [token]);

  // Función auxiliar para obtener el total de lecciones de cada módulo
  // (puedes cambiarla si el total se encuentra en la DB)
  const getTotalLessons = (moduleDoc) => {
    // Si en tu modelo Module guardas "totalLessons", úsalo:
    // return moduleDoc?.totalLessons || 4;
    return 4; // Por defecto, 4
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mi Progreso</h1>
      {progressList.length === 0 && (
        <p>No hay registros de progreso aún (o aún no has completado nada).</p>
      )}

      {progressList.map((record) => {
        const { _id, module, lessonsCompleted } = record;
        // Suponemos que el módulo viene populado (.populate('module'))
        const total = getTotalLessons(module);
        const completedCount = lessonsCompleted?.length || 0;
        const percentage = Math.round((completedCount / total) * 100);

        return (
          <div
            key={_id}
            style={{
              border: "1px solid #ccc",
              margin: "10px 0",
              padding: "10px",
              borderRadius: "5px"
            }}
          >
            <h2>{module?.title || "Módulo sin título"}</h2>
            <p>Lecciones completadas: {completedCount} / {total}</p>
            <p>Progreso: <strong>{percentage}%</strong></p>
            {lessonsCompleted?.length > 0 && (
              <p>
                <em>Lecciones: {lessonsCompleted.join(", ")}</em>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProgressView;
