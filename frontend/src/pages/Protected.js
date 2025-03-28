import React, { useEffect, useState } from 'react';

function Protected() {
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No tienes token, por favor inicia sesión.');
      return;
    }

    // Hacer la petición al backend con la ruta en minúsculas
    fetch(`${process.env.REACT_APP_BACKEND_URL}/protected`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.message && data.userData) {
          setMessage(data.message);
          setUserData(data.userData);
        } else {
          setMessage(data.message || 'Error al acceder');
        }
      })
      .catch(error => {
        setMessage('Error de conexión');
      });
  }, []);

  return (
    <div>
      <h2>Ruta Protegida</h2>
      <p>{message}</p>
      {userData && (
        <div>
          <p>Email: {userData.email}</p>
          <p>Nombre: {userData.name}</p>
        </div>
      )}
    </div>
  );
}

export default Protected;
