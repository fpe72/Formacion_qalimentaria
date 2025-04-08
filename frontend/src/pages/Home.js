import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from '../assets/images/logo2.png';

function Home() {
  const { auth } = useContext(AuthContext);

  return (
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
     {auth.token && auth.user?.role === 'admin' && (
        <div className="text-blue-700 bg-blue-100 p-4 rounded-lg mb-6 text-center shadow font-semibold">
          Estás en modo administrador. Usa el menú para acceder a las funciones de gestión.
        </div>
      )}
      {auth.token && auth.user?.role === 'student' && (
        <div className="text-white text-xl font-semibold">
          ¡Ya estás dentro de la formación, accede a los módulos formativos!
        </div>
      )}
    </div>
  );
}

export default Home;
