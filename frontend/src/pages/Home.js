import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/images/logo2.png';

function Home() {
  const { auth } = useContext(AuthContext);

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
          <img src={logo} alt="Logo corporativo" className="w-80 mb-6" />

          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            ¡Transforma tu futuro en el sector alimentario!
          </h1>

          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-2">
            La formación que está revolucionando la seguridad alimentaria. Aprende con expertos, certifica tus conocimientos y haz crecer tu carrera profesional desde hoy.
          </p>

          <p className="text-base md:text-lg text-gray-700 max-w-2xl mb-8">
            Acompañamos a las empresas del sector alimentario en su camino hacia la excelencia, garantizando la seguridad y calidad alimentaria.
          </p>

          {!auth.token && (
            <Link
              to="/register"
              className="bg-white text-primary font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
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
              <p className="font-semibold">Certificación Profesional</p>
              <p className="text-sm">Diploma con QR de verificación y validez legal.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📚</div>
              <p className="font-semibold">Contenido actualizado</p>
              <p className="text-sm">Módulos prácticos adaptados a la normativa vigente.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🚀</div>
              <p className="font-semibold">Fácil y rápido</p>
              <p className="text-sm">Regístrate y accede desde cualquier dispositivo.</p>
            </div>
            <div>
              <div className="text-4xl mb-2">💬</div>
              <p className="font-semibold">Soporte humano</p>
              <p className="text-sm">Te acompañamos en cada paso.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;
