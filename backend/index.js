// backend/index.js

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Modelos del proyecto
const User = require('./models/User');
const Module = require('./models/Module');
const Progress = require('./models/Progress');
const FinalExam = require('./models/FinalExam');

// MOD: Importamos Attempt, que debe referir a 'FinalExam' en su examId
// (asegúrate de que en Attempt.js tengas ref: 'FinalExam')
const Attempt = require('./models/Attempt');

const app = express();
app.use(express.json());
app.use(cors());
app.options('*', cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';

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

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Backend de Formacion Qalimentaria');
});

// ===================== REGISTRO =====================
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

    // Validar que la contraseña sea alfanumérica
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

// ===================== LOGIN =====================
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.status(200).json({ message: 'Login exitoso', token });
  } catch (error) {
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// ===================== MÓDULOS =====================
app.get('/modules', authMiddleware, async (req, res) => {
  try {
    const modules = await Module.find({}).sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los módulos' });
  }
});

app.post('/modules', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, content, order, questions } = req.body;
    const newModule = new Module({ title, description, content, order, questions });
    await newModule.save();
    res.status(201).json({ message: 'Módulo creado con éxito', module: newModule });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el módulo' });
  }
});

app.put('/modules/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updated = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando módulo' });
  }
});

app.delete('/modules/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: 'Módulo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando módulo' });
  }
});

// ===================== PROGRESO =====================
app.post('/progress', authMiddleware, async (req, res) => {
  try {
    const { moduleId } = req.body;
    const userEmail = req.user.email;
    const exists = await Progress.findOne({ userEmail, module: moduleId });
    if (exists) return res.status(400).json({ message: 'Ya has superado este módulo anteriormente.' });
    const progress = new Progress({ userEmail, module: moduleId });
    await progress.save();
    res.status(201).json({ message: 'Progreso registrado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el progreso' });
  }
});

app.get('/progress', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const records = await Progress.find({ userEmail }).populate('module');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el progreso' });
  }
});

// ===================== HTML de módulos =====================
app.get('/modules-content', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const modules = await Module.find({}, 'title content order').sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener contenido de módulos' });
  }
});

// ===================== EXAMEN FINAL DINÁMICO (OpenAI) =====================
app.get('/final-exam/generate-dynamic', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const modules = await Module.find({}, 'title content order').sort({ order: 1 });
    const allQuestions = [];

    for (const mod of modules) {
      const prompt = `
Eres un experto en Seguridad Alimentaria. A partir del siguiente contenido formativo, genera exactamente 3 preguntas tipo test, imaginativas y variadas, con 3 opciones cada una y una única respuesta correcta. Las preguntas deben estar inspiradas exclusivamente en el texto proporcionado, sin inventar datos no presentes en él. Sé creativo y evita repetir estructuras o conceptos entre módulos.

Contenido:
${mod.content}

Devuelve las preguntas en formato JSON exactamente así:
[
  {
    "question": "Texto de la pregunta",
    "options": ["Opción A", "Opción B", "Opción C"],
    "answer": "Respuesta correcta exacta"
  }
]
`;
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        });

        const content = response.choices[0].message.content.trim();
        console.log(`📦 Respuesta cruda del módulo "${mod.title}":`, content);

        const moduleQuestions = JSON.parse(content);
        if (!Array.isArray(moduleQuestions)) {
          throw new Error('La respuesta no es un array');
        }

        allQuestions.push({ moduleTitle: mod.title, questions: moduleQuestions });
      } catch (err) {
        console.error(`❌ Error generando preguntas para el módulo "${mod.title}":`, err.message);
        allQuestions.push({ moduleTitle: mod.title, questions: [], error: err.message });
      }
    }

    res.status(200).json(allQuestions);
  } catch (error) {
    console.error('❌ Error general en /generate-dynamic:', error);
    res.status(500).json({ message: 'Error generando preguntas dinámicas', error: error.message });
  }
});

// ===================== GUARDAR EXAMEN FINAL =====================
app.post('/final-exam/save', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, questions } = req.body;
    const exam = new FinalExam({ title, questions });
    await exam.save();
    res.status(201).json({ message: 'Examen guardado correctamente', exam });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el examen', error });
  }
});

// Listar exámenes
app.get('/final-exam/list', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const exams = await FinalExam.find({}, 'title createdAt isActive');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener exámenes', error: error.message });
  }
});

// Obtener el examen activo
app.get('/final-exam/active', authMiddleware, async (req, res) => {
  try {
    const activeExam = await FinalExam.findOne({ isActive: true });
    if (!activeExam) return res.status(404).json({ message: 'No hay examen activo' });
    res.status(200).json(activeExam);
  } catch (error) {
    console.error('Error obteniendo examen activo:', error);
    res.status(500).json({ message: 'Error al obtener el examen activo' });
  }
});

// Obtener examen por ID
app.get('/final-exam/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const exam = await FinalExam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Examen no encontrado' });
    res.json(exam);
  } catch (error) {
    console.error('❌ Error al buscar examen por ID:', error);
    res.status(500).json({ message: 'Error al obtener el examen', error: error.message });
  }
});

// Actualizar examen
app.put('/final-exam/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updatedExam = await FinalExam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Examen actualizado', exam: updatedExam });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando examen', error });
  }
});

// Eliminar examen
app.delete('/final-exam/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await FinalExam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Examen eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando examen', error });
  }
});

// Actualizar examen parcial
app.patch('/final-exam/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const examId = req.params.id;
    const { title, questions } = req.body;

    if (!title || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Título o preguntas inválidas' });
    }

    const updatedExam = await FinalExam.findByIdAndUpdate(
      examId,
      { title, questions },
      { new: true }
    );

    if (!updatedExam) {
      return res.status(404).json({ message: 'Examen no encontrado' });
    }

    res.json({ message: '✅ Examen actualizado correctamente', exam: updatedExam });
  } catch (error) {
    console.error('❌ Error al actualizar examen:', error);
    res.status(500).json({ message: 'Error al actualizar el examen', error: error.message });
  }
});

// Activar un examen específico
app.patch('/final-exam/:id/activate', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await FinalExam.updateMany({}, { isActive: false });
    const activatedExam = await FinalExam.findByIdAndUpdate(id, { isActive: true }, { new: true });
    if (!activatedExam) return res.status(404).json({ message: 'Examen no encontrado' });
    res.status(200).json({ message: 'Examen activado correctamente', exam: activatedExam });
  } catch (error) {
    console.error('Error activando el examen:', error);
    res.status(500).json({ message: 'Error al activar el examen' });
  }
});

// ===================== NUEVO: Rutas Attempt =====================
app.post('/final-exam/start-attempt', authMiddleware, async (req, res) => {
  try {
    // Obtenemos email del token
    const email = req.user.email;
    const { examId } = req.body;

    // Buscar usuario por email para obtener su _id
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!examId) {
      return res.status(400).json({ error: 'Falta examId' });
    }

    // Creamos Attempt con userId = user._id
    const attempt = new Attempt({
      userId: user._id,
      examId,
      status: 'in-progress',
      startTime: new Date(),
    });
    await attempt.save();

    res.json({ attemptId: attempt._id, message: 'Intento iniciado' });
  } catch (error) {
    console.error('❌ Error al iniciar intento:', error);
    res.status(500).json({ error: 'No se pudo iniciar el intento.' });
  }
});

app.post('/final-exam/end-attempt', authMiddleware, async (req, res) => {
  try {
    const { attemptId, score } = req.body;
    if (!attemptId) {
      return res.status(400).json({ error: 'Falta attemptId.' });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Intento no encontrado.' });
    }

    attempt.status = 'finished';
    attempt.score = score || 0;
    attempt.endTime = new Date();
    await attempt.save();

    res.json({ message: 'Intento finalizado', attempt });
  } catch (error) {
    console.error('❌ Error al finalizar intento:', error);
    res.status(500).json({ error: 'No se pudo finalizar el intento.' });
  }
});
// ===================== FIN Rutas Attempt =====================

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch((err) => console.error('Error al conectar a MongoDB Atlas', err));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
