// frontend/src/pages/CreateModule.js
import React, { useState } from "react";

function CreateModule() {
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const moduleData = {
      title,
      description,
      content,  // <--- un solo HTML
      order: order ? Number(order) : 0
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
        setTitle("");
        setDescription("");
        setContent("");
        setOrder("");
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

        <div style={{ marginBottom: "10px" }}>
          <label>Contenido HTML:</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
          />
        </div>

        <button type="submit">Guardar Módulo</button>
      </form>
    </div>
  );
}

export default CreateModule;
