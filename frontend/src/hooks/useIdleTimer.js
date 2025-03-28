import { useEffect, useRef, useCallback } from 'react';

function useIdleTimer(onIdle, idleTime = 600000, promptTime = 60000) {
  const timerId = useRef(null);
  const promptTimerId = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerId.current) clearTimeout(timerId.current);
    if (promptTimerId.current) clearTimeout(promptTimerId.current);
    timerId.current = setTimeout(() => {
      onIdle(promptTime);
    }, idleTime);
  }, [idleTime, onIdle, promptTime]); // dependencias añadidas claramente

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const handleActivity = resetTimer;
    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timerId.current) clearTimeout(timerId.current);
      if (promptTimerId.current) clearTimeout(promptTimerId.current);
    };
  }, [resetTimer]); // resetTimer añadido claramente aquí

  return {
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
