// src/pages/Register.js
import React, { useState } from 'react';

function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [firstSurname, setFirstSurname] = useState('');
  const [secondSurname, setSecondSurname] = useState('');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    // Validar que la contraseña solo tenga caracteres alfanuméricos
    const passwordRegex = /^[A-Za-z0-9]+$/;
    if (!passwordRegex.test(password)) {
      setMessage('La contraseña debe contener solo caracteres alfanuméricos.');
      return;
    }

    // Verificar que todos los campos estén completos
    if (!email || !name || !firstSurname || !secondSurname || !dni || !password) {
      setMessage('Todos los campos son obligatorios.');
      return;
    }

    try {
      const response = await fetch('https://reimagined-giggle-5gx75pv6r69xc4xvw-5000.app.github.dev/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, firstSurname, secondSurname, dni }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Usuario registrado con éxito');
        // Limpiar campos
        setEmail('');
        setName('');
        setFirstSurname('');
        setSecondSurname('');
        setDni('');
        setPassword('');
        setConfirmPassword('');
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
          <label>Nombre:</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Primer Apellido:</label>
          <input 
            type="text"
            value={firstSurname}
            onChange={(e) => setFirstSurname(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>Segundo Apellido:</label>
          <input 
            type="text"
            value={secondSurname}
            onChange={(e) => setSecondSurname(e.target.value)}
            required 
          />
        </div>
        <div>
          <label>DNI / Documento de identificación:</label>
          <input 
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
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
          <label>Repetir Contraseña:</label>
          <input 
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
