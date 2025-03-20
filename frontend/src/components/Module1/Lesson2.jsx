// frontend/src/components/Module1/Lesson2.jsx
import React, { useState } from 'react';

const Lesson2 = ({ onNext, onPrev }) => {
  const [quizFeedback, setQuizFeedback] = useState("");

  const handleOptionClick = (answer) => {
    setQuizFeedback(answer === "correct" ? "¡Correcto!" : "Incorrecto, intenta de nuevo.");
  };

  return (
    <div className="lesson-screen">
      <header>
        <h2>Lección 2: Buenas Prácticas en Restauración</h2>
        <div className="progress-bar">
          <div className="progress" style={{ width: '50%' }}></div>
        </div>
      </header>
      <main>
        <p>
          Aquí se presentarán las directrices y ejemplos textuales originales sobre las buenas prácticas en la restauración.
        </p>
        <p><strong>Quiz:</strong> Selecciona la práctica correcta para garantizar la seguridad alimentaria.</p>
        <button onClick={() => handleOptionClick("incorrect")}>Opción 1</button>
        <button onClick={() => handleOptionClick("correct")}>Opción 2</button>
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

export default Lesson2;
