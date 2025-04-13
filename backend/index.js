// backend/index.js
const dotenv = require('dotenv');
const express = require('express');
const app = express();
dotenv.config({ path: './.env' });

const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const companyCodesRoutes = require("./routes/companyCodes");
const paymentRoutes = require('./routes/paymentRoutes');
const bodyParser = require('body-parser'); // ✅ usaremos esto en vez de express.raw()

// Modelos del proyecto
const User = require('./models/User');
const Module = require('./models/Module');
const Progress = require('./models/Progress');
const FinalExam = require('./models/FinalExam');
const companyRoutes = require('./companyRoutes');
const Company = require('./models/Company');
const Attempt = require('./models/Attempt');
const CompanyCode = require('./models/CompanyCode');

// ⚠️ Puerto
const PORT = process.env.PORT || 5000;

app.use('/stripe/webhook', express.raw({ type: 'application/json' }));


// ✅ Stripe necesita RAW body para validar firma → USAMOS body-parser
app.post(
  '/stripe/webhook',
  bodyParser.raw({ type: 'application/json' })
);

// ✅ Luego montamos la ruta stripe que usará ese rawBody
const stripeRoutes = require('./routes/stripeRoutes');
app.use('/stripe', stripeRoutes);

// ✅ Resto de middlewares normales
app.use(cors());
app.use(express.json());


const allowedOrigins = [
  'http://localhost:3000',
  'https://formacion-qalimentaria.vercel.app',
  'https://reimagined-giggle-5gx75pv6r69xc4xvw-3000.app.github.dev'
];

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||
      /\.github\.dev$/.test(origin)
    ) {
      callback(null, true);
    } else {
      console.warn('❌ CORS rechazado para origen:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use('/companies', companyRoutes);
app.use("/api/company-codes", companyCodesRoutes);
app.use('/payment', paymentRoutes);


// ✅ Ruta para mantener el backend vivo con UptimeRobot
app.get("/", (req, res) => {
  res.send("✅ Backend de Formación Qalimentaria activo.");
});

// Rutas del proyecto
app.use('/companies', companyRoutes);
const finalExamRoutes = require('./finalExamRoutes');
app.use('/final-exam', finalExamRoutes);

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
    const { email, password, name, firstSurname, secondSurname, dni, companyCode } = req.body;

    console.log("🟡 Datos recibidos en /register:", { email, password, name, firstSurname, secondSurname, dni, companyCode });

    // Validación de campos básicos
    if (!email || !password || !name || !firstSurname || !secondSurname || !dni || !companyCode) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    // Verificar que el código de empresa existe y es válido
    const codeData = await CompanyCode.findOne({ code: companyCode }).populate('company');
    if (!codeData) {
      return res.status(400).json({ message: 'Código de empresa inválido' });
    }

    const isParticular = codeData.maxUsers === 1;

  // Código inactivo
    if (!codeData.active) {
      return res.status(400).json({
        message: isParticular ? 'Código incorrecto' : 'Código inactivo. Contacta con tu empresa'
      });
    }

    // Caducado
    if (new Date(codeData.expiresAt) < new Date()) {
      return res.status(400).json({
        message: isParticular ? 'Código incorrecto' : 'Código caducado'
      });
    }

    // Cupo superado
    if (codeData.usedUsers >= codeData.maxUsers) {
      return res.status(400).json({
        message: isParticular ? 'Código incorrecto' : 'Cupo máximo de usuarios alcanzado para este código'
      });
    }

    // Validar existencia de usuario
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }

    // Validar formato de contraseña
    const passwordRegex = /^[a-zA-Z0-9]{6,8}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "La contraseña debe tener entre 6 y 8 caracteres y solo puede contener letras y números.",
      });
    }

    // Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      firstSurname,
      secondSurname,
      dni,
      company: codeData.company._id
    });

    await newUser.save();

    // Añadir usuario al código y actualizar cupo
    codeData.usedUsers += 1;
      codeData.users.push({
        name,
        email,
        dni
      });
      await codeData.save();

    return res.status(201).json({ message: 'Usuario registrado con éxito' });

  } catch (error) {
    console.error("❌ Error en /register:", error);
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
      { _id: user._id, email: user.email, name: user.name, role: user.role },
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

// ===================== GENERAR PREGUNTA DESDE CONTENIDO HTML DEL MÓDULO =====================
app.post('/modules/generate-question', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Contenido del módulo vacío.' });
    }

    const prompt = `
Eres un experto en formación alimentaria. A partir del siguiente contenido HTML, genera una sola pregunta tipo test con tres opciones, y marca cuál es la correcta. No inventes información, usa solo el contenido proporcionado.

Contenido HTML:
${content}

Devuelve el resultado exactamente en este formato JSON:
{
  "question": "Texto de la pregunta",
  "options": ["Opción A", "Opción B", "Opción C"],
  "answer": "Respuesta correcta"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);

    if (
      !parsed.question ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 3 ||
      !parsed.answer
    ) {
      return res.status(400).json({ message: 'Formato de pregunta inválido' });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('❌ Error generando pregunta del módulo:', error);
    return res.status(500).json({ message: 'Error al generar la pregunta', error: error.message });
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
// Reemplaza el POST /final-exam/start-attempt por este:
app.post('/final-exam/start-attempt', authMiddleware, async (req, res) => {
  try {
    const email = req.user.email;
    const { examId } = req.body;

    if (!examId) return res.status(400).json({ error: 'Falta examId' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // ✅ Si ya aprobó: bloquear
    const approvedAttempt = await Attempt.findOne({
      userId: user._id,
      examId,
      passed: true,
    });
    if (approvedAttempt) {
      return res.status(403).json({
        error: 'Ya has aprobado este examen. No puedes volver a realizarlo.',
      });
    }

    // ✅ Obtener intentos fallidos anteriores
    const failedAttempts = await Attempt.find({
      userId: user._id,
      examId,
      passed: false,
    }).sort({ endTime: 1 });

    // ❌ Si tiene 2 o más fallos → repetir formación
    if (failedAttempts.length >= 2) {
      return res.status(403).json({
        error: 'Has alcanzado el número máximo de intentos. Debes repetir la formación.',
      });
    }

    // ⏱ Si solo falló una vez → validar si está dentro del plazo
    if (failedAttempts.length === 1) {
      const firstAttemptTime = new Date(failedAttempts[0].endTime);
      const now = new Date();
      const retryDeadline = new Date(firstAttemptTime.getTime() + 72 * 60 * 60 * 1000); // 72 horas

      const timeLeftMs = retryDeadline - now;

      if (timeLeftMs <= 0) {
        return res.status(403).json({
          error: 'Ha pasado el plazo de 72 horas desde tu primer intento fallido. Debes repetir la formación.',
        });
      }

      // ✅ Si está dentro del tiempo → se permite crear el segundo intento (no retornamos nada aquí)
    }

    // ✅ Si todo bien, crear nuevo intento
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


// ===================== FIN Rutas Attempt =====================


// ===================== ESTADO DEL EXAMEN PARA USUARIO ACTUAL =====================
app.get('/final-exam/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id: examId } = req.params;
    const email = req.user.email;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const attempt = await Attempt.findOne({ userId: user._id, examId }).sort({ endTime: -1 });

    if (!attempt) {
      return res.json({ status: 'not_attempted' }); // nunca hizo el examen
    }

    if (attempt.passed) {
      return res.json({ status: 'passed' }); // aprobado
    } else {
      return res.json({ status: 'failed' }); // intentó pero no aprobó
    }
  } catch (error) {
    console.error('❌ Error consultando estado del examen:', error);
    res.status(500).json({ error: 'Error consultando estado del examen' });
  }
});

// ===================== REPETIR FORMACION =====================
app.post('/reset-user-progress', authMiddleware, async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await Progress.deleteMany({ userEmail: email });
    await Attempt.deleteMany({ userId: user._id });

    res.status(200).json({ message: 'Formación reiniciada correctamente' });
  } catch (error) {
    console.error('❌ Error al resetear progreso:', error);
    res.status(500).json({ error: 'Error al resetear la formación' });
  }
});

// Obtener el último intento fallido del usuario para ese examen
app.get('/final-exam/:id/last-failed-attempt', authMiddleware, async (req, res) => {
  try {
    const examId = req.params.id;
    const email = req.user.email;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const failedAttempt = await Attempt.findOne({
      userId: user._id,
      examId,
      passed: false,
    }).sort({ endTime: -1 });

    if (!failedAttempt) {
      return res.status(404).json({ error: 'No hay intento fallido registrado' });
    }

    return res.json({ endTime: failedAttempt.endTime });
  } catch (error) {
    console.error('❌ Error obteniendo intento fallido:', error);
    return res.status(500).json({ error: 'Error al obtener el intento fallido' });
  }
});

// Ruta de test para marcar todos los módulos como completados
app.post('/progress/fake-complete-all', authMiddleware, async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const modules = await Module.find();
    const completions = modules.map((m) => ({
      userEmail: email,
      module: m._id,
      dateCompleted: new Date()
    }));

    await Progress.insertMany(completions);

    res.json({ message: '✅ Progreso simulado con éxito', count: completions.length });
  } catch (err) {
    console.error('❌ Error al simular progreso:', err);
    res.status(500).json({ error: 'No se pudo simular el progreso' });
  }
});

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
