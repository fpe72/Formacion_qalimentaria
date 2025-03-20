// frontend/src/components/Module1/Module1.jsx
import React, { useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import Lesson1 from './Lesson1';
import Lesson2 from './Lesson2';
import Lesson3 from './Lesson3';
import Lesson4 from './Lesson4';
import './Module1.css';

const Module1 = () => {
  const screens = ["welcome", "lesson1", "lesson2", "lesson3", "lesson4"];
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  const goToScreen = (index) => {
    if (index >= 0 && index < screens.length) {
      setCurrentScreenIndex(index);
    }
  };

  const renderScreen = () => {
    switch (screens[currentScreenIndex]) {
      case "welcome":
        return <WelcomeScreen onStart={() => goToScreen(1)} />;
      case "lesson1":
        return <Lesson1 onNext={() => goToScreen(2)} onPrev={() => goToScreen(0)} />;
      case "lesson2":
        return <Lesson2 onNext={() => goToScreen(3)} onPrev={() => goToScreen(1)} />;
      case "lesson3":
        return <Lesson3 onNext={() => goToScreen(4)} onPrev={() => goToScreen(2)} />;
      case "lesson4":
        return <Lesson4 onNext={() => alert("¡Módulo completado!")} onPrev={() => goToScreen(3)} />;
      default:
        return <div>No se encontró la pantalla.</div>;
    }
  };

  return (
    <div className="module1-container">
      {renderScreen()}
    </div>
  );
};

export default Module1;
