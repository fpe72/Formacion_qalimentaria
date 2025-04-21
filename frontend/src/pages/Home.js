import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/images/logo2.png';
import { useState, useRef, useEffect } from 'react';

function Home() {
  const { auth } = useContext(AuthContext);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (showVideo && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // reproducción OK
          })
          .catch((error) => {
            console.warn("Reproducción automática bloqueada por el navegador:", error);
          });
      }
    }
  }, [showVideo]);  

  // Cerrar modal con Escape o clic fuera
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setShowVideo(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOutsideClick = (e) => {
    if (e.target.id === 'videoModal') {
      setShowVideo(false);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };
  
  const handleVideoEnd = () => {
    setShowVideo(false);
  };

  return (
    <>
      {auth.token && auth.user?.role === "admin" && (
        <div className="w-full bg-blue-100 border-b border-blue-300 py-4 text-center shadow-sm">
          <p className="text-blue-800 font-semibold text-sm md:text-base">
            👨‍💼 Estás en <strong>modo administrador</strong>. Usa el menú para acceder a las funciones de gestión.
          </p>
        </div>
      )}

      <main className="p-6">
        <div className="min-h-[90vh] bg-white flex flex-col items-center justify-start text-center px-4 py-8 pt-12">
        <img src={logo} alt="Curso de Manipulador de Alimentos - Qalimentaria" className="w-80 mb-6" />

        <div className="mb-8">
            <p className="text-lg font-semibold text-gray-700 mb-2">
              ¿Eres nuevo?
            </p>
            <button
              onClick={() => setShowVideo(true)}
              className="bg-primary text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-primary/90 transition duration-300"
            >
              Mira nuestro vídeo explicativo sobre el curso
            </button>

            <div className="mt-6 text-sm text-gray-700 max-w-2xl mx-auto text-center">
              <p className="mb-2 font-semibold">Resumen del vídeo:</p>
              <ul className="list-disc list-inside text-left">
                <li>Visión general del <strong>Curso de Manipulador de Alimentos</strong> impartido por Q-Alimentaria.</li>
                <li>Resumen de los módulos formativos incluidos en la plataforma.</li>
                <li>Información básica para obtener el <strong>Carnet de Manipulador de Alimentos</strong>.</li>
              </ul>
            </div>

            {showVideo && (
              <div
                id="videoModal"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                onClick={handleOutsideClick}
              >
                <div className="relative w-full max-w-2xl mx-4">
                 
                <video
                    ref={videoRef}
                    className="w-full rounded-xl shadow-lg"
                    controls
                    onClick={(e) => e.stopPropagation()}
                    onEnded={handleVideoEnd}
                  >

                    <source
                      src="/videos/video_formacion_qalimentaria.mp4"
                      type="video/mp4"
                    />
                    Tu navegador no soporta la reproducción de vídeo.
                  </video>
                </div>
              </div>
            )}

          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
              Curso de Manipulador de Alimentos Online
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
              ¡Transforma tu futuro en el sector alimentario!
            </h2>

            <p className="text-center text-lg text-gray-700 mb-4">
              Haz el <strong>Curso de Manipulador de Alimentos online</strong> con expertos y obtén tu <strong>Carnet de Manipulador de Alimentos</strong> 100% válido en toda España. Fórmate hoy y mejora tu futuro profesional.
            </p>
            <p className="text-center text-lg text-gray-700 mb-4">
              Acompañamos a personas y empresas del sector alimentario en su camino hacia la excelencia, garantizando la seguridad, la higiene y la calidad de los alimentos.
            </p>

          {!auth.token && (
            <Link
              to="/register"
              className="bg-[#76b82a] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-[#66a825] transition duration-300"
            >
              Empieza ahora
            </Link>
          )}

          {auth.token && auth.user?.role === 'student' && (
            <div className="text-primary text-xl font-semibold">
              ¡Ya estás dentro de la formación, accede a los módulos formativos!
            </div>
          )}

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-gray-700 text-center">
            <div>
              <div className="text-4xl mb-2">⭐️</div>
              <p className="font-semibold text-lg">Certificación Profesional</p>
              <p className="text-sm">Diploma con QR de verificación y validez legal.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📚</div>
              <p className="font-semibold text-lg">Contenido actualizado</p>
              <p className="text-sm">Módulos prácticos adaptados a la normativa vigente.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🚀</div>
              <p className="font-semibold text-lg">Fácil y rápido</p>
              <p className="text-sm">Regístrate y accede desde cualquier dispositivo.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">💬</div>
              <p className="font-semibold text-lg">Soporte humano</p>
              <p className="text-sm">Te acompañamos en cada paso.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
  
}

export default Home;
