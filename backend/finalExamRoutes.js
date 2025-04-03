// backend/finalExamRoutes.js
const express = require('express');
const router = express.Router();
const FinalExam = require('./models/FinalExam');
const Attempt = require('./models/Attempt');
const User = require('./models/User');
const authMiddleware = require('./middleware/auth'); // Ajusta si está en otra ruta

// GET /final-exam/active
router.get('/active', authMiddleware, async (req, res) => {
  try {
    const exam = await FinalExam.findOne({ isActive: true });
    if (!exam) return res.status(404).json({ error: 'No hay examen activo.' });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el examen activo.' });
  }
});

// POST /final-exam/start-attempt
router.post('/start-attempt', authMiddleware, async (req, res) => {
  try {
    const { examId } = req.body;
    if (!examId) return res.status(400).json({ error: 'Falta examId.' });



    // 1. Buscar intentos anteriores fallidos
      const failedAttempts = await Attempt.find({
        userId: req.user._id,
        examId,
        passed: false,
        status: 'finished',
      }).sort({ endTime: -1 });

      if (failedAttempts.length >= 2) {
        return res.status(403).json({ error: 'Has agotado tus 2 intentos. Debes repetir la formación.' });
      }

     // 2. Crear nuevo intento
      const attempt = new Attempt({
        userId: req.user._id,
        examId,
        status: 'in-progress',
        startTime: new Date(),
      });

await attempt.save();
res.json({ attemptId: attempt._id });



  } catch (error) {
    console.error("❌ Error al iniciar intento:", error); // Añadido
    res.status(500).json({ error: 'No se pudo iniciar el intento.' });
  }
});

// POST /final-exam/end-attempt
router.post('/end-attempt', authMiddleware, async (req, res) => {
  try {
    let { attemptId, score, totalQuestions } = req.body;

    // Añadido para depuración
    console.log("Datos recibidos del frontend:", { attemptId, score, totalQuestions });

    score = Number(score);
    totalQuestions = Number(totalQuestions);

    if (!attemptId || isNaN(score) || isNaN(totalQuestions)) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ error: 'Intento no encontrado.' });

    const passingScore = Math.round(totalQuestions * 0.75);
    attempt.status = 'finished';
    attempt.score = score;
    attempt.passed = score >= passingScore;
    attempt.endTime = new Date();

    await attempt.save();
    res.json({ message: 'Intento finalizado', attempt });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo finalizar el intento.' });
  }
});

// GET /final-exam/my-latest-attempt
router.get('/my-latest-attempt', authMiddleware, async (req, res) => {
  try {
    const latestAttempt = await Attempt.findOne({ userId: req.user._id })
      .sort({ endTime: -1 })
      .populate('examId', 'title');

    res.json({ attempt: latestAttempt || null });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener intento' });
  }
});

module.exports = router;
