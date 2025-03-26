import { useEffect, useRef } from 'react';

function useIdleTimer(onIdle, idleTime = 600000, promptTime = 60000) {
  // idleTime: tiempo (en ms) de inactividad antes de mostrar el prompt (10 minutos por defecto)
  // promptTime: tiempo (en ms) para esperar la respuesta del usuario (1 minuto por defecto)
  const timerId = useRef(null);
  const promptTimerId = useRef(null);

  const resetTimer = () => {
    if (timerId.current) clearTimeout(timerId.current);
    if (promptTimerId.current) clearTimeout(promptTimerId.current);
    timerId.current = setTimeout(() => {
      // Se activa el prompt de inactividad
      onIdle(promptTime); // Llamamos al callback y le pasamos el tiempo de espera para respuesta
    }, idleTime);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const handleActivity = () => resetTimer();
    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timerId.current) clearTimeout(timerId.current);
      if (promptTimerId.current) clearTimeout(promptTimerId.current);
    };
  }, []);

  return {
    // Permite, si se requiere, cancelar el prompt externamente
    cancelPrompt: () => {
      if (promptTimerId.current) {
        clearTimeout(promptTimerId.current);
        promptTimerId.current = null;
      }
    },
    resetTimer,
  };
}

export default useIdleTimer;
