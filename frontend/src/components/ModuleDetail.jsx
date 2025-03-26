// frontend/src/components/ModuleDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// Importa tu logo. Ajusta la ruta según tu estructura real.
import logo from '/workspaces/Formacion_qalimentaria/frontend/src/assets/images/logo.png';
import './ModuleDetail.css';

// Datos simulados para el ejemplo
const dummyModules = {
  "67dc20699407adcce19b9816": {
    title: "Introducción a la Seguridad Alimentaria",
    subtitle: "Capítulo 1: Buenas Prácticas en la Restauración",
    description: "Este módulo aborda la importancia de la seguridad alimentaria, las normativas vigentes y las mejores prácticas para garantizar que los alimentos sean seguros para el consumo. Aquí se explica el sistema APPCC y sus aplicaciones en la industria restaurantera."
  }
  // Puedes añadir más módulos simulados si lo deseas
};

const ModuleDetail = () => {
  const { id } = useParams();
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulamos una llamada "asíncrona" con un setTimeout
    setTimeout(() => {
      const data = dummyModules[id];
      if (data) {
        setModuleData(data);
        setLoading(false);
      } else {
        setError("No se encontró el módulo.");
        setLoading(false);
      }
    }, 1000);
  }, [id]);

  if (loading) {
    return <div className="module-detail-loading">Cargando...</div>;
  }

  if (error) {
    return <div className="module-detail-error">Error: {error}</div>;
  }

  return (
    <div className="module-detail-container">
      <header className="module-detail-header">
        <img 
          src={logo} 
          alt="Q-Alimentaria Logo" 
          className="logo"
        />
        <h1>{moduleData.title}</h1>
      </header>
      <section className="module-detail-content">
        <h2>{moduleData.subtitle}</h2>
        <p>{moduleData.description}</p>
      </section>
      <footer className="module-detail-footer">
        <p>Q-Alimentaria - Calidad, Higiene y Seguridad</p>
      </footer>
    </div>
  );
};

export default ModuleDetail;
