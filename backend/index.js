/********************************************************************
 * index.js (Backend con módulos usando un único campo content)
 ********************************************************************/

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Modelos
const User = require('./models/User');
const Module = require('./models/Module');    // <-- campo "content" en lugar de array de lecciones
const Progress = require('./models/Progress'); // <-- Si deseas manejar "módulo completo" en progreso

dotenv.config({ path: './.env' });

const app = express();
app.use(express.json());
app.use(cors());
app.options('*', cors());

// Variables de entorno
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';

// ------------------------------
// Ruta raíz (prueba)
// ------------------------------
app.get('/', (req, res) => {
  res.send('Backend de Formacion Qalimentaria (versión contenido único)');
});

// -------------------------------------------------------
// 1. Endpoints Públicos: Registro & Login
// -------------------------------------------------------
app.post('/register', async (req, res) => {
  try {
    const { email, password, name, firstSurname, secondSurname, dni } = req.body;
    if (!email || !password || !name || !firstSurname || !secondSurname || !dni) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }

    const passwordRegex = /^[A-Za-z0-9]+$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'La contraseña debe contener solo caracteres alfanuméricos.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      firstSurname,
      secondSurname,
      dni
      // role se setea por defecto en el modelo, o lo puedes especificar aquí
    });
    await newUser.save();

    return res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(500
