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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          Registro de Usuario
        </h2>
        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Nombre:</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
                required 
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Primer Apellido:</label>
              <input 
                type="text"
                value={firstSurname}
                onChange={(e) => setFirstSurname(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
                required 
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Segundo Apellido:</label>
              <input 
                type="text"
                value={secondSurname}
                onChange={(e) => setSecondSurname(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
                required 
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">DNI / Documento de identificación:</label>
              <input 
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
                required 
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 mb-2">Email:</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
              required 
            />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Contraseña:</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
                required 
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Repetir Contraseña:</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
                required 
              />
            </div>
          </div>
          {message && (
            <p className="text-red-500 mt-4">{message}</p>
          )}
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-2 mt-6 rounded hover:bg-secondary transition duration-300"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
