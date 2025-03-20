// frontend/src/components/Module1/Lesson4.jsx
import React, { useState } from 'react';

const Lesson4 = ({ onNext, onPrev }) => {
  const [quizFeedback, setQuizFeedback] = useState("");

  const handleOptionClick = (answer) => {
    setQuizFeedback(answer === "correct" ? "¡Correcto!" : "Incorrecto, intenta de nuevo.");
  };

  return (
    <div className="lesson-screen">
      <header>
        <h2>Lección 4: Beneficios y Aplicación del Sistema APPCC</h2>
        <div className="progress-bar">
          <div className="progress" style={{ width: '100%' }}></div>
        </div>
      </header>
      <main>
        <p>
          Aquí se muestra el contenido textual original relacionado con los beneficios y la aplicación del sistema APPCC.
        </p>
        <p><strong>Quiz:</strong> Responde para consolidar lo aprendido.</p>
        <button onClick={() => handleOptionClick("correct")}>Opción Correcta</button>
        <button onClick={() => handleOptionClick("incorrect")}>Opción Incorrecta</button>
        <div className="quiz-feedback" style={{ color: quizFeedback === "¡Correcto!" ? 'green' : 'red' }}>
          {quizFeedback}
        </div>
      </main>
      <footer>
        <button onClick={onPrev}>Anterior</button>
        <button onClick={onNext}>Finalizar Módulo</button>
      </footer>
    </div>
  );
};

export default Lesson4;
