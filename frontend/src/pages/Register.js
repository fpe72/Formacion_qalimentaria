import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import isValidDNIorNIE from '../utils/validateDNI';


function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [firstSurname, setFirstSurname] = useState('');
  const [secondSurname, setSecondSurname] = useState('');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState('');
  const [activationCode, setActivationCode] = useState("");
  const [dniError, setDniError] = useState('');


  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    const passwordRegex = /^[A-Za-z0-9]{6,8}$/;
    if (!passwordRegex.test(password)) {
      setMessage('La contraseña debe tener entre 6 y 8 caracteres y solo contener letras y números.');
      return;
    }

    if (!email || !name || !firstSurname || !secondSurname || !dni || !password) {
      setMessage('Todos los campos son obligatorios.');
      return;
    }

    if (!company) {
      setMessage('El nombre de la empresa es obligatorio');
      setSuccess(false);
      return;
    }

    try {
      console.log("🟢 Datos que se van a enviar al backend:");
      console.log({
        email,
        password,
        name,
        firstSurname,
        secondSurname,
        dni,
        companyCode: company
      });

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, firstSurname, secondSurname, dni, companyCode: company }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setMessage("Nuevo usuario correctamente registrado");
        setEmail('');
        setName('');
        setFirstSurname('');
        setSecondSurname('');
        setDni('');
        setPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setSuccess(false);
        setMessage(data.message || 'Error en el registro');
      }
    } catch (error) {
      setSuccess(false);
      setMessage('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-center text-cyan-700 mb-6">
          Registro de Usuario
        </h2>
        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Primer Apellido</label>
              <input
                type="text"
                value={firstSurname}
                onChange={(e) => setFirstSurname(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Segundo Apellido</label>
              <input
                type="text"
                value={secondSurname}
                onChange={(e) => setSecondSurname(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">DNI / Documento de identificación</label>

              <input
                  type="text"
                  className="form-input w-full"
                  placeholder="12345678A"
                  value={dni}
                  onChange={(e) => {
                    setDni(e.target.value);
                    setDniError(''); // limpia el error al escribir
                  }}
                  onBlur={() => {
                    if (dni && !isValidDNIorNIE(dni)) {
                      setDniError('❌ DNI o NIE no válido');
                    }
                  }}
                />
                {dniError && <p className="text-red-600 text-sm mt-1">{dniError}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="activationCode" className="block text-sm font-medium text-gray-700">
              Código de activación
            </label>
            <input
              type="text"
              id="activationCode"
              name="activationCode"
              placeholder="Ej: EMPRESA-XXX"
              value={activationCode}
              onChange={(e) => {
                setActivationCode(e.target.value);
                setCompany(e.target.value); // sincronización necesaria
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este código te lo facilitará tu empresa o se generará automáticamente tras el pago de la formación.
            </p>
          </div>

          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              ¿Eres un usuario particular sin empresa?
            </p>
            <Link
              to="/pago-particular"
              className="text-sm text-blue-600 hover:underline font-semibold"
            >
              Paga aquí para obtener tu código de activación
            </Link>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Repetir Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          {message && (
            <p className={`mt-4 text-sm font-medium ${success ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
