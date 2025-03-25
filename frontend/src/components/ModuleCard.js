import React from 'react';
import { Link } from 'react-router-dom';

function ModuleCard({ module, completed }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xl font-bold text-primary mb-2">{module.title}</h3>
        <p className="text-gray-700 mb-2">
          {module.description || 'Sin descripción'}
        </p>
        <p className="text-sm text-gray-500 mb-2">Orden: {module.order}</p>
      </div>

      <div className="flex flex-col items-center justify-center">
        {completed && (
          <div className="py-1 px-3 mb-3 rounded bg-green-100 text-green-700 font-semibold text-sm inline-block text-center">
            ✅ Módulo Superado
          </div>
        )}

        <Link 
          to={`/modules/${module.order}`} 
          className="bg-primary text-white py-2 px-4 rounded hover:bg-secondary transition-colors duration-300 w-full text-center"
        >
          Ver más
        </Link>
      </div>
    </div>
  );
}

export default ModuleCard;
