// src/pages/Register.js
import React, { useState } from 'react';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // Asegúrate de usar el puerto donde corre tu backend, por defecto 5000
      const response = await fetch('https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Usuario registrado con éxito');
        // Limpia los campos
        setEmail('');
        setPassword('');
        setName('');
      } else {
        setMessage(data.message || 'Error en el registro');
      }
    } catch (error) {
      setMessage('Error de conexión');
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Nombre:</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>
        <button type="submit">Registrarse</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default Register;
