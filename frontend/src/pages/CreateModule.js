// frontend/src/pages/CreateModule.js
import React, { useState, useEffect } from 'react';

const CreateModule = () => {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/modules', {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.json())
    .then(setModules);
  }, [token]);

  const handleSelectModule = (id) => {
    const mod = modules.find(m => m._id === id);

    if (mod) {
      setSelectedModuleId(id);
      setTitle(mod.title);
      setDescription(mod.description);
      setContent(mod.content);
      setOrder(mod.order);
    } else {
      setSelectedModuleId('');
      setTitle('');
      setDescription('');
      setContent('');
      setOrder('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = selectedModuleId ? 'PUT' : 'POST';
    const url = selectedModuleId
      ? `https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/modules/${selectedModuleId}`
      : 'https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/modules';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, content, order: Number(order) })
    })
    .then(res => res.json())
    .then(data => {
      alert(`Módulo ${selectedModuleId ? 'actualizado' : 'creado'} exitosamente`);
      setTitle('');
      setDescription('');
      setContent('');
      setOrder('');
      setSelectedModuleId('');
      window.location.reload();
    });
  };

  const handleDelete = () => {
    if (window.confirm('¿Seguro que quieres eliminar este módulo?')) {
      fetch(`https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/modules/${selectedModuleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(() => {
        alert('Módulo eliminado exitosamente');
        setTitle('');
        setDescription('');
        setContent('');
        setOrder('');
        setSelectedModuleId('');
        window.location.reload();
      });
    }
  };

  // ← NUEVA FUNCIÓN PARA CARGAR ARCHIVO HTML →
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Crear o Editar Módulo</h2>

      <select
        className="mb-4 p-2 border"
        value={selectedModuleId}
        onChange={(e) => handleSelectModule(e.target.value)}
      >
        <option value="">-- Crear nuevo módulo --</option>
        {modules.map(m => (
          <option key={m._id} value={m._id}>{m.title}</option>
        ))}
      </select>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Título del módulo"
          className="mb-4 p-2 border w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Descripción"
          className="mb-4 p-2 border w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <textarea
          placeholder="Contenido HTML"
          className="mb-4 p-2 border w-full h-48"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        {/* NUEVO: Opción subir archivo HTML */}
        <input
          type="file"
          accept=".html"
          className="mb-4 p-2 border w-full"
          onChange={handleFileUpload}
        />

        <input
          type="number"
          placeholder="Orden del módulo (número)"
          className="mb-4 p-2 border w-full"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          required
        />

        <button type="submit" className="bg-primary text-white py-2 px-4 rounded">
          {selectedModuleId ? 'Actualizar módulo' : 'Crear módulo'}
        </button>

        {selectedModuleId && (
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white py-2 px-4 rounded ml-4"
          >
            Eliminar módulo
          </button>
        )}
      </form>
    </div>
  );
};

export default CreateModule;
