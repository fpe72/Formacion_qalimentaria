const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Importar modelos
const User = require('./models/User');
const Module = require('./models/Module');    // <-- IMPORTANTE: ya con lessons
const Progress = require('./models/Progress');

// Cargar variables de entorno (.env)
dotenv.config({ path: './.env' });

const app = express();
app.use(express.json());
app.use(cors());
app.options('*', cors());

// Configuración de puerto y JWT
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';

// Ruta básica
app.get('/', (req, res) => {
  res.send('Backend de Formacion Qalimentaria');
});

// ---------------------------------------------------
// 1. Endpoints Públicos: Registro & Login
// ---------------------------------------------------
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
    });
    await newUser.save();

    return res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error en /register:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

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
    console.error('Error en /login:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ---------------------------------------------------
// 2. Middlewares de Autenticación y Autorización
// ---------------------------------------------------
function authMiddleware(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
}

// ---------------------------------------------------
// 3. Endpoints Protegidos: Módulos
// ---------------------------------------------------

// (A) Listar todos los módulos (incluye lessons si existen)
app.get('/modules', authMiddleware, async (req, res) => {
  try {
    const modules = await Module.find({}).sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    console.error('Error al obtener módulos:', error);
    res.status(500).json({ message: 'Error al obtener los módulos' });
  }
});

// (B) Obtener un módulo por ID (con sus lecciones)
app.get('/modules/:moduleId', authMiddleware, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const mod = await Module.findById(moduleId);
    if (!mod) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }
    res.json(mod);
  } catch (error) {
    console.error('Error al obtener el módulo:', error);
    res.status(500).json({ message: 'Error al obtener el módulo' });
  }
});

// (C) Crear un módulo (solo admin). Puede incluir un array de lecciones.
app.post('/modules', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Ahora aceptamos un array 'lessons' en el body
    const { title, description, order, lessons } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Falta el título del módulo' });
    }
    // 'lessons' puede ser un array de objetos con: lessonId, lessonTitle, lessonContent

    const newModule = new Module({
      title,
      description,
      order,
      lessons
    });
    await newModule.save();

    return res.status(201).json({
      message: 'Módulo creado con éxito',
      module: newModule
    });
  } catch (error) {
    console.error('Error al crear el módulo:', error);
    return res.status(500).json({ message: 'Error al crear el módulo' });
  }
});

// ---------------------------------------------------
// 4. Endpoints Protegidos: Progreso
// ---------------------------------------------------
// (Usando tu modelo Progress, con la lógica de lecciones completadas)

app.get('/progress', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const progressRecords = await Progress.find({ userEmail }).populate('module');
    res.json(progressRecords);
  } catch (error) {
    console.error('Error al obtener el progreso:', error);
    res.status(500).json({ message: 'Error al obtener el progreso' });
  }
});

// Obtener progreso de un módulo en concreto
app.get('/progress/:moduleId', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { moduleId } = req.params;
    const progressDoc = await Progress.findOne({ userEmail, module: moduleId });
    if (!progressDoc) {
      return res.json({ lessonsCompleted: [] });
    }
    return res.json({
      lessonsCompleted: progressDoc.lessonsCompleted || []
    });
  } catch (error) {
    console.error('Error al obtener progreso de un módulo:', error);
    res.status(500).json({ message: 'Error al obtener el progreso' });
  }
});

// Marcar una lección como completada
app.put('/progress/:moduleId/lesson', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { moduleId } = req.params;
    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({ message: 'Falta el ID de la lección' });
    }

    let progressDoc = await Progress.findOne({ userEmail, module: moduleId });
    if (!progressDoc) {
      progressDoc = new Progress({
        userEmail,
        module: moduleId,
        lessonsCompleted: [lessonId]
      });
    } else {
      if (!progressDoc.lessonsCompleted.includes(lessonId)) {
        progressDoc.lessonsCompleted.push(lessonId);
      }
    }
    await progressDoc.save();
    return res.json({
      message: 'Lección completada con éxito',
      lessonsCompleted: progressDoc.lessonsCompleted
    });
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
    res.status(500).json({ message: 'Error al actualizar el progreso' });
  }
});

// ---------------------------------------------------
// Ejemplo de ruta protegida
// ---------------------------------------------------
app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Accediste a la ruta protegida con éxito',
    userData: req.user
  });
});

// ---------------------------------------------------
// Conexión a MongoDB
// ---------------------------------------------------
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB Atlas', err));

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
