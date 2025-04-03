// backend/finalExamRoutes.js
const express = require('express');
const router = express.Router();
const FinalExam = require('./models/FinalExam');
const Attempt = require('./models/Attempt');
const User = require('./models/User');
const authMiddleware = require('./middleware/auth'); // Ajusta si está en otra ruta
const PDFDocument = require('pdfkit');

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

// GET /final-exam/diploma/:attemptId
router.get('/diploma/:attemptId', authMiddleware, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await Attempt.findById(attemptId).populate('userId');

    if (!attempt || !attempt.passed) {
      return res.status(403).json({ error: 'Examen no aprobado o intento no válido.' });
    }

    const user = attempt.userId;

    // Configurar headers de PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="diploma.pdf"');

    // Crear documento PDF
    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(24).text('DIPLOMA DE APROVECHAMIENTO', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(16).text(`Otorgado a: ${user.name} ${user.firstSurname} ${user.secondSurname}`, { align: 'center' });
    doc.moveDown();
    doc.text(`Por haber superado satisfactoriamente la formación.`, { align: 'center' });
    doc.moveDown();
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.end();

    // Marcar que ya se ha emitido el diploma
    attempt.diplomaIssued = true;
    await attempt.save();

  } catch (error) {
    console.error("Error generando el diploma:", error);
    res.status(500).json({ error: 'No se pudo generar el diploma.' });
  }
});

module.exports = router;
