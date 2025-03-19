const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Importar modelos
const User = require('./models/User');      // Modelo de usuario
const Module = require('./models/Module');    // Modelo de módulos
const Progress = require('./models/Progress'); // Modelo de progreso

// Cargar variables de entorno (.env debe estar en la carpeta backend)
dotenv.config({ path: './.env' });

const app = express();
app.use(express.json());

// Configurar CORS para pruebas
app.use(cors());
app.options('*', cors());

// Definir puerto y clave secreta
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';

// Ruta raíz para comprobar que el backend funciona
app.get('/', (req, res) => {
  res.send('Backend de Formacion Qalimentaria');
});

// -------------------
// Endpoints Públicos
// -------------------

// Registro de usuario
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Faltan datos' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();
    return res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Login de usuario
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan datos' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    // Generar token incluyendo el campo role
    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.status(200).json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// -------------------
// Endpoints Públicos (consulta de módulos)
// -------------------

// Listar módulos
app.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find({}).sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los módulos' });
  }
});

// -------------------
// Middleware de Autenticación
// -------------------
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

// Middleware para verificar rol admin
function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
}

// -------------------
// Endpoints Protegidos (requieren autenticación)
// -------------------

// Registrar progreso del usuario
app.post('/progress', authMiddleware, async (req, res) => {
  try {
    const { moduleId } = req.body;
    if (!moduleId) {
      return res.status(400).json({ message: 'Falta el ID del módulo' });
    }
    const userEmail = req.user.email;
    const progressRecord = new Progress({ userEmail, module: moduleId });
    await progressRecord.save();
    res.status(201).json({ message: 'Progreso registrado con éxito', progress: progressRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el progreso' });
  }
});

// Consultar progreso del usuario
app.get('/progress', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const progressRecords = await Progress.find({ userEmail }).populate('module');
    res.json(progressRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el progreso' });
  }
});

// Ruta protegida de ejemplo
app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Accediste a la ruta protegida con éxito',
    userData: req.user
  });
});

// -------------------
// Endpoint Exclusivo para Administradores: Crear Módulos
// -------------------
app.post('/modules', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, content, order } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Falta el título del módulo' });
    }
    const newModule = new Module({ title, description, content, order });
    await newModule.save();
    return res.status(201).json({ message: 'Módulo creado con éxito', module: newModule });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al crear el módulo' });
  }
});

// -------------------
// Conexión a MongoDB Atlas
// -------------------
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error al conectar a MongoDB Atlas', err));

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
