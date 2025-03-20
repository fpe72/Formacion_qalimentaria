import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo2.png'; // Si deseas incluir el logo

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary to-secondary flex flex-col items-center justify-center text-center px-4">
      {/* Opcional: mostrar el logo */}
      <img src={logo} alt="Logo corporativo" className="w-90 mb-4" />

      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
        Bienvenido a la Formación de Q-Alimentaria
      </h1>
      <p className="text-lg md:text-xl text-white mb-8 max-w-2xl">
        Acompañamos a las empresas del sector alimentario en su camino hacia la excelencia, garantizando la seguridad y calidad alimentaria.
      </p>
      <Link 
        to="/register" 
        className="bg-white text-primary font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
      >
        Regístrate Ahora
      </Link>
    </div>
  );
}

export default Home;
