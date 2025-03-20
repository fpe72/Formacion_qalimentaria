// frontend/src/components/Module1/Lesson3.jsx
import React, { useState } from 'react';

const Lesson3 = ({ onNext, onPrev }) => {
  const [quizFeedback, setQuizFeedback] = useState("");

  const handleOptionClick = (answer) => {
    setQuizFeedback(answer === "correct" ? "¡Correcto!" : "Incorrecto, intenta de nuevo.");
  };

  return (
    <div className="lesson-screen">
      <header>
        <h2>Lección 3: Introducción al Sistema APPCC/HACCP</h2>
        <div className="progress-bar">
          <div className="progress" style={{ width: '75%' }}></div>
        </div>
      </header>
      <main>
        <p>
          Aquí se mostrará el contenido textual original sobre la introducción al sistema APPCC/HACCP.
        </p>
        <p><strong>Quiz:</strong> Ordena los pasos del proceso APPCC.</p>
        <button onClick={() => handleOptionClick("correct")}>Orden Correcta</button>
        <button onClick={() => handleOptionClick("incorrect")}>Orden Incorrecta</button>
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

export default Lesson3;
