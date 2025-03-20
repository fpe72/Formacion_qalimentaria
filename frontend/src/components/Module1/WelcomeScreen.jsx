// frontend/src/components/Module1/WelcomeScreen.jsx
import React from 'react';
import logo from '/workspaces/Formacion_qalimentaria/frontend/src/assets/images/logo.png';

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="welcome-screen">
      <header>
        <img 
          src={logo} 
          alt="Q-Alimentaria Logo" 
          className="logo"
        />
      </header>
      <main>
        <h1>SEGURIDAD ALIMENTARIA EN RESTAURACIÓN</h1>
        <h2>BUENAS PRÁCTICAS EN LA RESTAURACIÓN | CAPÍTULO 1</h2>
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
