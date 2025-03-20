// frontend/src/components/Module1/Lesson1.jsx
import React, { useState } from 'react';

const Lesson1 = ({ onNext, onPrev }) => {
  const [quizFeedback, setQuizFeedback] = useState("");

  const handleOptionClick = (answer) => {
    setQuizFeedback(answer === "correct" ? "¡Correcto!" : "Incorrecto, revisa el contenido y vuelve a intentarlo.");
  };

  return (
    <div className="lesson-screen">
      <header>
        <h2>Lección 1: Introducción a la Seguridad Alimentaria</h2>
        <div className="progress-bar">
          <div className="progress" style={{ width: '25%' }}></div>
        </div>
      </header>
      <main>
        <p>
          Aquí se mostrará el contenido textual original sobre la definición y relevancia de la seguridad alimentaria.
        </p>
        <p><strong>Quiz:</strong> Selecciona la afirmación correcta sobre seguridad alimentaria.</p>
        <button onClick={() => handleOptionClick("incorrect")} className="quiz-option">Opción 1</button>
        <button onClick={() => handleOptionClick("correct")} className="quiz-option">Opción 2</button>
        <div className="quiz-feedback" style={{ color: quizFeedback === "¡Correcto!" ? 'green' : 'red' }}>
          {quizFeedback}
        </div>
      </main>
      <footer>
        <button onClick={onPrev}>Anterior</button>
        <button onClick={onNext}>Siguiente</button>
      </footer>
    </div>
  );
};

export default Lesson1;
