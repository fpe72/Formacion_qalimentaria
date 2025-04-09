import React, { useState, useEffect } from 'react';

const CreateModule = () => {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState('');
  const [questions, setQuestions] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/modules`, {
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
      setQuestions(mod.questions || []);
    } else {
      setSelectedModuleId('');
      setTitle('');
      setDescription('');
      setContent('');
      setOrder('');
      setQuestions([]);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setContent(e.target.result);
      reader.readAsText(file);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addNewQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', ''], answer: '' }]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = selectedModuleId ? 'PUT' : 'POST';
    const url = selectedModuleId
      ? `${process.env.REACT_APP_BACKEND_URL}/modules/${selectedModuleId}`
      : `${process.env.REACT_APP_BACKEND_URL}/modules`;

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, content, order: Number(order), questions })
    })
    .then(res => res.json())
    .then(data => {
      alert(`Módulo ${selectedModuleId ? 'actualizado' : 'creado'} exitosamente`);
      window.location.reload();
    });
  };

const generateQuestionFromContent = async () => {
  if (!content) {
    alert('Por favor, introduce primero el contenido HTML del módulo.');
    return;
  }

  try {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/modules/generate-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    const data = await res.json();

    if (res.ok && data?.question) {
      setQuestions([...questions, data]);
    } else {
      alert('No se pudo generar la pregunta. Revisa el contenido HTML.');
    }
  } catch (error) {
    console.error('Error generando pregunta:', error);
    alert('Ocurrió un error al generar la pregunta.');
  }
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
        setQuestions([]);
        setSelectedModuleId('');
        window.location.reload();
      });
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

        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-bold mb-2">Preguntas del módulo</h3>
          {questions.map((q, idx) => (
              <div key={idx} className="mb-4 p-2 border-b">
                <input
                  type="text"
                  className="p-2 border w-full"
                  placeholder={`Pregunta ${idx + 1}`}
                  value={q.question}
                  onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                />
                {q.options.map((opt, oIdx) => (
                  <input
                    key={oIdx}
                    type="text"
                    className="p-2 border w-full mt-2"
                    placeholder={`Opción ${oIdx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...q.options];
                      newOpts[oIdx] = e.target.value;
                      handleQuestionChange(idx, 'options', newOpts);
                    }}
                  />
                ))}
                <input
                  type="text"
                  className="p-2 border w-full mt-2 bg-green-50"
                  placeholder="Respuesta correcta"
                  value={q.answer}
                  onChange={(e) => handleQuestionChange(idx, 'answer', e.target.value)}
                />
                {/* ✅ Botón de eliminar correctamente ubicado dentro del map */}
                <button
                  type="button"
                  className="mt-2 bg-red-500 text-white py-1 px-3 rounded"
                  onClick={() => removeQuestion(idx)}
                >
                  🗑 Eliminar
                </button>
              </div>
            ))}
  
          <button type="button" className="bg-secondary text-white py-2 px-4 rounded" onClick={addNewQuestion}>
            + Añadir Pregunta
          </button>

          <button
              type="button"
              className="bg-blue-500 text-white py-2 px-4 rounded ml-4"
              onClick={generateQuestionFromContent}
            >
              🧠 Generar pregunta automáticamente
          </button>

        </div>

        <div className="mt-6 flex gap-4">
          <button type="submit" className="bg-primary text-white py-2 px-4 rounded">
            {selectedModuleId ? 'Actualizar módulo' : 'Crear módulo'}
          </button>

          {selectedModuleId && (
            <button
              type="button"
              className="bg-red-500 text-white py-2 px-4 rounded"
              onClick={handleDelete}
            >
              Eliminar módulo
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateModule;
