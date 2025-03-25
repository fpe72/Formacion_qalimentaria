const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Importar modelos
const User = require('./models/User');
const Module = require('./models/Module');
const Progress = require('./models/Progress');

dotenv.config({ path: './.env' });

const app = express();
app.use(express.json());
app.use(cors());
app.options('*', cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Backend de Formacion Qalimentaria');
});

// Middleware autenticación
function authMiddleware(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token inválido' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// Middleware admin
function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
}

// Crear módulo (ADMIN)
app.post('/modules', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, content, order, questions } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Falta el título del módulo' });
    }
    const newModule = new Module({ title, description, content, order, questions });
    await newModule.save();
    return res.status(201).json({ message: 'Módulo creado con éxito', module: newModule });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al crear el módulo', details: error });
  }
});

// Actualizar módulo (ADMIN)
app.put('/modules/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updatedModule = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedModule);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando módulo', details: error });
  }
});

// Eliminar módulo (ADMIN)
app.delete('/modules/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Módulo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando módulo', details: error });
  }
});

// Listar módulos (usuario autenticado)
app.get('/modules', authMiddleware, async (req, res) => {
  try {
    const modules = await Module.find({}).sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los módulos' });
  }
});

// Conexión MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB Atlas', err));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
