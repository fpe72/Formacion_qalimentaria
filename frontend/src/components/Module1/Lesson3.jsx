// src/components/Module1/Lesson1.jsx (ejemplo)
import React from "react";

function Lesson3({ onComplete, isCompleted }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        margin: "10px 0",
        padding: "10px",
        borderRadius: "5px"
      }}
    >
      <h2>Lección 3: Introducción</h2>
      <p>
        Aquí va el contenido de la lección 1: texto, imágenes, cualquier material
        de formación que necesites.
      </p>

      {isCompleted ? (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ¡Lección completada!
        </p>
      ) : (
        <button
          onClick={onComplete}
          style={{
            backgroundColor: "#4caf50",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Marcar como completada
        </button>
      )}
    </div>
  );
}

export default Lesson3;
