// frontend/src/components/Module1/WelcomeScreen.jsx
import React from 'react';

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="welcome-screen">
      <header>
        <img 
          src="https://via.placeholder.com/150?text=Logo+Q-Alimentaria" 
          alt="Q-Alimentaria Logo" 
          className="logo"
        />
      </header>
      <main>
        <h1>SEGURANÇA ALIMENTAR NA RESTAURAÇÃO</h1>
        <h2>BUENAS PRÁCTICAS EN LA RESTAURAÇÃO | CAPÍTULO 1</h2>
        <p>
          Bienvenido al módulo 1. En este módulo aprenderás sobre la seguridad alimentaria y su relevancia en la restauración. Pulsa el botón para comenzar.
        </p>
        <button onClick={onStart}>Comenzar Módulo</button>
      </main>
      <footer>
        <p>Q-Alimentaria - Calidad, Higiene y Seguridad</p>
      </footer>
    </div>
  );
};

export default WelcomeScreen;
