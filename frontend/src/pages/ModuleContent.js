import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ModuleContent = () => {
  const { order } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/modules`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.json())
    .then(modules => {
      const mod = modules.find(m => m.order === parseInt(order));
      setModule({
        ...mod,
        questions: mod.questions ? mod.questions.sort(() => 0.5 - Math.random()).slice(0,2) : []
      });
      setLoading(false);
    })
    .catch(() => {
      setError('Error al obtener el módulo');
      setLoading(false);
    });
  }, [order]);

  const handleAnswer = (qIndex, option) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const checkQuiz = () => {
    const passed = module.questions.every((q, idx) => selectedAnswers[idx] === q.answer);
    if (passed) {
      alert('¡Has superado el cuestionario!');
      setQuizPassed(true);
      const token = localStorage.getItem('token');
      fetch('https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ moduleId: module._id })
      });
    } else {
      alert('Respuestas incorrectas. Inténtalo de nuevo.');
    }
  };

  if (loading) return <div className="text-center py-6">Cargando módulo...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{module.title}</h2>
      <div className="prose mb-6" dangerouslySetInnerHTML={{ __html: module.content }} />
      
      {module.questions && module.questions.length > 0 && !quizPassed && (
        <div className="mt-8 p-4 border rounded bg-gray-100">
          <h3 className="text-xl font-bold mb-4">Cuestionario del módulo</h3>
          {module.questions.map((q, idx) => (
            <div key={idx} className="mb-4">
              <p className="font-semibold">{q.question}</p>
              {q.options.map((opt, oIdx) => (
                <label key={oIdx} className="block">
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    onChange={() => handleAnswer(idx, opt)}
                  /> {opt}
                </label>
              ))}
            </div>
          ))}
          <button className="bg-primary text-white py-2 px-4 rounded" onClick={checkQuiz}>
            Enviar respuestas
          </button>
        </div>
      )}

      {quizPassed && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded">✅ Cuestionario superado.</div>
      )}

      <button className="bg-primary text-white py-2 px-4 rounded mt-4" onClick={() => navigate('/modules')}>
        ← Regresar a módulos
      </button>
    </div>
  );
};

export default ModuleContent;
