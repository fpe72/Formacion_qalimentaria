import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Guardar token y actualizar el contexto
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        setAuth({ token: data.token, user: decoded });
        setMessage('Login exitoso');
        // Redirigir a la vista de módulos
        if (decoded.role === 'admin') {
          navigate('/'); // ✅ redirige a la raíz
        } else {
          navigate('/modules');
        }
                
      } else {
        setMessage(data.message || 'Error en el login');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          Iniciar Sesión
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email:</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Contraseña:</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
              required 
            />
          </div>
          {message && (
            <p className="text-red-500 mb-4">{message}</p>
          )}
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-2 rounded hover:bg-secondary transition duration-300"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
