import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/images/logo2.png';

function Home() {
  const { auth } = useContext(AuthContext);

  return (
    <>
      {/* 🔵 Mensaje destacado arriba */}
      {auth.token && auth.user?.role === "admin" && (
        <div className="w-full bg-blue-100 border-b border-blue-300 py-4 text-center shadow-sm">
          <p className="text-blue-800 font-semibold text-sm md:text-base">
            👨‍💼 Estás en <strong>modo administrador</strong>. Usa el menú para acceder a las funciones de gestión.
          </p>
        </div>
      )}

      <main className="p-6">
        <div className="min-h-screen bg-gradient-to-r from-primary to-secondary flex flex-col items-center justify-center text-center px-4">
          <img src={logo} alt="Logo corporativo" className="w-90 mb-4" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Bienvenido a Formación Q-Alimentaria
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl">
            Acompañamos a las empresas del sector alimentario en su camino hacia la excelencia, garantizando la seguridad y calidad alimentaria.
          </p>

          {!auth.token && (
            <Link 
              to="/register" 
              className="bg-white text-primary font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
            >
              Regístrate Ahora
            </Link>
          )}

          {auth.token && auth.user?.role === 'student' && (
            <div className="text-white text-xl font-semibold">
              ¡Ya estás dentro de la formación, accede a los módulos formativos!
            </div>
          )}
        </div>
      </main>
    </>
  );
}



export default Home;
