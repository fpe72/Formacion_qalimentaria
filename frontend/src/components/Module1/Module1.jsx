// src/components/Module1/Module1.jsx
import React, { useEffect, useState } from "react";
import Lesson1 from "./Lesson1";
import Lesson2 from "./Lesson2";
import Lesson3 from "./Lesson3";
import Lesson4 from "./Lesson4";

function Module1() {
  // Identificador real del Módulo 1 en tu BD
  // Puede venir de la ruta, de props, etc. Aquí lo definimos fijo a modo de ejemplo
  const moduleId = "643f96797e5af6a2fa1386fc"; 
  const [lessonsCompleted, setLessonsCompleted] = useState([]);
  const token = localStorage.getItem("token");

  // Suponemos que hay 4 lecciones para Módulo 1
  const totalLessons = 4;

  // 1) Al montar, traemos las lecciones completadas desde el backend
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/progress/${moduleId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        // data = { lessonsCompleted: ["lesson1", "lesson2", ...] }
        if (data.lessonsCompleted) {
          setLessonsCompleted(data.lessonsCompleted);
        }
      })
      .catch((err) => console.error("Error al obtener lecciones completadas:", err));
  }, [moduleId, token]);

  // 2) Marcar lección como completada
  const handleCompleteLesson = async (lessonId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/progress/${moduleId}/lesson`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ lessonId })
        }
      );
      const data = await response.json();
      if (data.lessonsCompleted) {
        // Actualizamos el estado local con el nuevo array de lecciones completadas
        setLessonsCompleted(data.lessonsCompleted);
      }
    } catch (error) {
      console.error("Error al completar lección:", error);
    }
  };

  // 3) Calcular porcentaje del módulo
  const progressPercentage = Math.round(
    (lessonsCompleted.length / totalLessons) * 100
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "10px" }}>Módulo 1: Higiene Alimentaria</h1>

      {/* Barra de progreso */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#e2e2e2",
          height: "20px",
          borderRadius: "5px",
          marginBottom: "10px"
        }}
      >
        <div
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: "#2196f3",
            height: "100%",
            borderRadius: "5px"
          }}
        />
      </div>
      <p style={{ marginBottom: "20px" }}>
        Progreso: <strong>{progressPercentage}%</strong>
      </p>

      {/* Render de cada lección. 
          Pasamos: isCompleted => boolean 
                   onComplete => la función que hace PUT en el backend.
      */}
      <Lesson1
        isCompleted={lessonsCompleted.includes("lesson1")}
        onComplete={() => handleCompleteLesson("lesson1")}
      />
      <Lesson2
        isCompleted={lessonsCompleted.includes("lesson2")}
        onComplete={() => handleCompleteLesson("lesson2")}
      />
      <Lesson3
        isCompleted={lessonsCompleted.includes("lesson3")}
        onComplete={() => handleCompleteLesson("lesson3")}
      />
      <Lesson4
        isCompleted={lessonsCompleted.includes("lesson4")}
        onComplete={() => handleCompleteLesson("lesson4")}
      />
    </div>
  );
}

export default Module1;
