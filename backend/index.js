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
    const { email, password, name, firstSurname, secondSurname, dni } = req.body;
    if (!email || !password || !name || !firstSurname || !secondSurname || !dni) {
      return res.status(400).json({ message: 'Faltan datos' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }
    // Validar que la contraseña solo contenga caracteres alfanuméricos
    const passwordRegex = /^[A-Za-z0-9]+$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'La contraseña debe contener solo caracteres alfanuméricos.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name, firstSurname, secondSurname, dni });
    await newUser.save();
    return res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
<<<<<<< HEAD
    console.error(error);
=======
    console.error('Error en /register:', error);
>>>>>>> 3c58e4d (ok)
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

<<<<<<< HEAD
// Login de usuario
=======
>>>>>>> 3c58e4d (ok)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan datos' });
    }
<<<<<<< HEAD
=======

>>>>>>> 3c58e4d (ok)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
<<<<<<< HEAD
=======

>>>>>>> 3c58e4d (ok)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
<<<<<<< HEAD
    // Generar token incluyendo el campo role
=======

    // Generar token
>>>>>>> 3c58e4d (ok)
    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
<<<<<<< HEAD
    return res.status(200).json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error(error);
=======

    return res.status(200).json({
      message: 'Login exitoso',
      token
    });
  } catch (error) {
    console.error('Error en /login:', error);
>>>>>>> 3c58e4d (ok)
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

<<<<<<< HEAD
// -------------------
// Endpoints Públicos (consulta de módulos)
// -------------------

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

// -------------------
// Middleware de Autenticación
// -------------------
function authMiddleware(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token inválido' });
=======
// -------------------------------------------------------
// 2. Middlewares de Autenticación / Autorización
// -------------------------------------------------------
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

>>>>>>> 3c58e4d (ok)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

<<<<<<< HEAD
// Middleware para verificar rol admin
=======
>>>>>>> 3c58e4d (ok)
function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
<<<<<<< HEAD
  return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
}

// -------------------
// Endpoints Protegidos (requieren autenticación)
// -------------------

// Registrar progreso del usuario
=======
  return res.status(403).json({ message: 'No tienes permisos para realizar esta acción (se requiere rol admin)' });
}

// -------------------------------------------------------
// 3. Endpoints Protegidos: Módulos (campo único content)
// -------------------------------------------------------

// (A) Listar todos los módulos
app.get('/modules', authMiddleware, async (req, res) => {
  try {
    const modules = await Module.find({}).sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    console.error('Error al obtener módulos:', error);
    res.status(500).json({ message: 'Error al obtener los módulos' });
  }
});

// (B) Obtener un módulo por su ID
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

// (C) Crear un módulo (requiere rol admin)
app.post('/modules', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, content, order } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Falta el título del módulo' });
    }

    const newModule = new Module({
      title,
      description,
      content, // aquí guardas HTML o texto
      order
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

// (Opcional) Podrías agregar PUT /modules/:moduleId para editar el módulo
// y DELETE /modules/:moduleId para eliminar, si lo deseas.

// -------------------------------------------------------
// 4. Endpoints de Progreso (opcional, "módulo completo")
// -------------------------------------------------------
//
// A) Marcar un módulo como completado
// B) Ver el progreso total del usuario
//
// Si no necesitas el progreso, puedes eliminar estos endpoints.

>>>>>>> 3c58e4d (ok)
app.post('/progress', authMiddleware, async (req, res) => {
  try {
    const { moduleId } = req.body;
    if (!moduleId) {
      return res.status(400).json({ message: 'Falta el ID del módulo' });
    }
<<<<<<< HEAD
    const userEmail = req.user.email;
    const progressRecord = new Progress({ userEmail, module: moduleId });
    await progressRecord.save();
    res.status(201).json({ message: 'Progreso registrado con éxito', progress: progressRecord });
  } catch (error) {
    console.error(error);
=======

    const userEmail = req.user.email;
    // Revisamos si ya existe un progreso para (userEmail, moduleId)
    let existing = await Progress.findOne({ userEmail, module: moduleId });
    if (existing) {
      return res.status(400).json({ message: 'Ya se registró este módulo como completado' });
    }

    const progressRecord = new Progress({
      userEmail,
      module: moduleId,
      dateCompleted: new Date()
    });
    await progressRecord.save();

    res.status(201).json({
      message: 'Progreso registrado con éxito',
      progress: progressRecord
    });
  } catch (error) {
    console.error('Error al registrar el progreso:', error);
>>>>>>> 3c58e4d (ok)
    res.status(500).json({ message: 'Error al registrar el progreso' });
  }
});

<<<<<<< HEAD
// Consultar progreso del usuario
=======
// Obtener todo el progreso del usuario
>>>>>>> 3c58e4d (ok)
app.get('/progress', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const progressRecords = await Progress.find({ userEmail }).populate('module');
    res.json(progressRecords);
  } catch (error) {
<<<<<<< HEAD
    console.error(error);
=======
    console.error('Error al obtener el progreso:', error);
>>>>>>> 3c58e4d (ok)
    res.status(500).json({ message: 'Error al obtener el progreso' });
  }
});

<<<<<<< HEAD
// Ruta protegida de ejemplo
=======
// -------------------------------------------------------
// 5. Ruta protegida de ejemplo
// -------------------------------------------------------
>>>>>>> 3c58e4d (ok)
app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Accediste a la ruta protegida con éxito',
    userData: req.user
  });
});

<<<<<<< HEAD
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
=======
// -------------------------------------------------------
// Conexión a MongoDB
// -------------------------------------------------------
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error al conectar a MongoDB Atlas', err));

>>>>>>> 3c58e4d (ok)
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
