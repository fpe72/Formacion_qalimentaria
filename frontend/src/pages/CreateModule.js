// src/pages/CreateModule.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateModule() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState(0);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // Se asume que ya tienes un token admin en localStorage tras hacer login
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Debes iniciar sesión como administrador.');
        return;
      }

      const response = await fetch('https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, content, order })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Módulo creado con éxito');
        // Puedes limpiar los campos o redireccionar a la lista de módulos
        setTitle('');
        setDescription('');
        setContent('');
        setOrder(0);
        // Por ejemplo, redireccionar a la vista de módulos:
        // navigate('/modules');
      } else {
        setMessage(data.message || 'Error al crear el módulo');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error de conexión');
    }
  };

  return (
    <div>
      <h2>Crear Nuevo Módulo</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Descripción:</label>
          <input 
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Contenido:</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div>
          <label>Orden:</label>
          <input 
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
        <button type="submit">Crear Módulo</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateModule;
