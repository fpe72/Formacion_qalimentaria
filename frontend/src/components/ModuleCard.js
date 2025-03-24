// frontend/src/components/ModuleCard.js
import React from 'react';
import { Link } from 'react-router-dom';

function ModuleCard({ module }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-bold text-primary mb-2">{module.title}</h3>
      <p className="text-gray-700 mb-4">
        {module.description ? module.description : 'Sin descripción'}
      </p>
      <p className="text-sm text-gray-500 mb-4">Orden: {module.order}</p>
      <Link 
        to={`/modules/${module.order}`} 
        className="bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition-colors duration-300"
      >
        Ver más
      </Link>
    </div>
  );
}

export default ModuleCard;
