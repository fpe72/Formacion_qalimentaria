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
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
}

// Registro usuario
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
      return res.status(400).json({ message: 'La contraseña debe contener solo caracteres alfanuméricos.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name, firstSurname, secondSurname, dni });
    await newUser.save();
    return res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Login usuario
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

// Listar módulos
app.get('/modules', authMiddleware, async (req, res) => {
  try {
    const modules = await Module.find({}).sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los módulos' });
  }
});

// Crear módulo (ADMIN) ahora con soporte para preguntas
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
    return res.status(500).json({ message: 'Error al crear el módulo' });
  }
});

// Actualizar módulo (ADMIN) ahora con soporte para preguntas
app.put('/modules/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updatedModule = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedModule);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando módulo', details: error });
  }
});

// Eliminar módulo (ADMIN)
app.delete('/modules/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Módulo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando módulo', details: error });
  }
});

// Registrar progreso usuario (solo si no lo ha completado antes)
app.post('/progress', authMiddleware, async (req, res) => {
  try {
    const { moduleId } = req.body;
    const userEmail = req.user.email;

    // Verificar si ya existe progreso para este módulo y usuario
    const progressExists = await Progress.findOne({ userEmail, module: moduleId });

    if (progressExists) {
      return res.status(400).json({ message: 'Ya has superado este módulo anteriormente.' });
    }

    // Si no existe, crear el nuevo progreso
    const progressRecord = new Progress({ userEmail, module: moduleId });
    await progressRecord.save();

    res.status(201).json({ message: 'Progreso registrado con éxito', progress: progressRecord });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el progreso', error });
  }
});

// Consultar progreso usuario
app.get('/progress', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const progressRecords = await Progress.find({ userEmail }).populate('module');
    res.json(progressRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el progreso' });
  }
});

// Conexión MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error al conectar a MongoDB Atlas', err));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
