import React, { useState, useContext } from 'react';
import useIdleTimer from '../hooks/useIdleTimer';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function IdleTimer() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Callback que se llama cuando el usuario ha estado inactivo
  const handleIdle = (promptTime) => {
    setShowPrompt(true);
    // Si el usuario no responde en 'promptTime', se cierra sesión automáticamente.
    // Guardamos el timer para poder cancelarlo si el usuario decide continuar.
    idlePromptTimer = setTimeout(() => {
      handleLogout();
    }, promptTime);
  };

  // Variable para almacenar el timer del prompt
  let idlePromptTimer = null;

  // Usamos nuestro hook; los tiempos pueden ajustarse según tus necesidades.
  useIdleTimer(handleIdle, 600000, 60000);

  const handleContinue = () => {
    // Si el usuario elige continuar, cancelamos el timer y ocultamos el prompt.
    if (idlePromptTimer) clearTimeout(idlePromptTimer);
    setShowPrompt(false);
    // Simulamos actividad para reiniciar el temporizador.
    window.dispatchEvent(new Event('mousemove'));
  };

  const handleLogout = () => {
    if (idlePromptTimer) clearTimeout(idlePromptTimer);
    // Limpiamos el contexto y el token, y redirigimos a la página de inicio
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
    setShowPrompt(false);
    navigate('/');
  };

  if (!showPrompt) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <p>Has estado inactivo por un tiempo. ¿Deseas continuar o prefieres cerrar sesión?</p>
        <button onClick={handleContinue} style={modalStyles.button}>Continuar</button>
        <button onClick={handleLogout} style={modalStyles.button}>Cerrar Sesión</button>
      </div>
    </div>
  );
}

// Estilos simples para el modal (puedes ajustarlos según tu diseño)
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: '#fff',
    padding: '20px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  button: {
    margin: '5px',
    padding: '10px 20px',
  },
};

export default IdleTimer;
