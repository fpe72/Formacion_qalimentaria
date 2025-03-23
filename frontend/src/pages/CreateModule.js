// src/pages/CreateModule.js
import React, { useState } from "react";

function CreateModule() {
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");

  // Para manejar un array "lessons"
  const [lessons, setLessons] = useState([]);
  const [lessonId, setLessonId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  const handleAddLesson = () => {
    // Agregamos un objeto lección al array 'lessons'
    if (!lessonId || !lessonTitle) {
      alert("Completa al menos lessonId y lessonTitle");
      return;
    }
    const newLesson = {
      lessonId,
      lessonTitle,
      lessonContent
    };
    setLessons([...lessons, newLesson]);
    // Limpiar campos
    setLessonId("");
    setLessonTitle("");
    setLessonContent("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const moduleData = {
      title,
      description,
      order: order ? Number(order) : 0,
      lessons
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(moduleData)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Módulo creado con éxito");
        // Resetear campos
        setTitle("");
        setDescription("");
        setOrder("");
        setLessons([]);
      } else {
        alert("Error al crear módulo: " + (data.message || "Desconocido"));
      }
    } catch (error) {
      console.error("Error al crear módulo:", error);
      alert("Ocurrió un error al crear el módulo");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Crear Módulo (solo admin)</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>Título:</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Descripción:</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Orden:</label>
          <input
            type="number"
            value={order}
            onChange={e => setOrder(e.target.value)}
          />
        </div>

        <hr />

        <h2>Lecciones del Módulo</h2>
        <div style={{ marginBottom: "10px" }}>
          <label>lessonId:</label>
          <input
            type="text"
            value={lessonId}
            onChange={e => setLessonId(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Título de la lección:</label>
          <input
            type="text"
            value={lessonTitle}
            onChange={e => setLessonTitle(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Contenido de la lección (HTML o texto):</label>
          <textarea
            value={lessonContent}
            onChange={e => setLessonContent(e.target.value)}
            rows={4}
          />
        </div>
        <button type="button" onClick={handleAddLesson}>
          Agregar Lección al array
        </button>

        {/* Mostrar lecciones añadidas */}
        {lessons.length > 0 && (
          <ul>
            {lessons.map((l, i) => (
              <li key={i}>
                <strong>{l.lessonId}:</strong> {l.lessonTitle}
              </li>
            ))}
          </ul>
        )}

        <hr />

        <button type="submit">Guardar Módulo</button>
      </form>
    </div>
  );
}

export default CreateModule;
