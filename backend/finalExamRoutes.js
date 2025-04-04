// backend/finalExamRoutes.js
const express = require('express');
const router = express.Router();
const FinalExam = require('./models/FinalExam');
const Attempt = require('./models/Attempt');
const User = require('./models/User');
const Company = require('./models/Company');
const authMiddleware = require('./middleware/auth'); // Ajusta si está en otra ruta
const PDFDocument = require('pdfkit');
const generateDiplomaPDF = require("./utils/generateDiploma"); // al principio del archivo
const moment = require("moment");
const fs = require("fs");
const path = require("path")

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
router.get("/diploma/:attemptId", authMiddleware, async (req, res) => {
  try {
    console.log("🟢 Entrando en /diploma/:attemptId", req.params.attemptId);
    const attempt = await Attempt.findById(req.params.attemptId).populate("userId examId");
    if (!attempt) {
      console.error("❌ Intento no encontrado");
      return res.status(404).json({ message: "Intento no encontrado" });
    }
    
    if (!attempt.passed) {
      console.warn("⚠️ Intento no aprobado");
      return res.status(403).json({ message: "Intento no aprobado" });
    }
    


    if (!attempt || !attempt.passed) {
      return res.status(403).json({ message: "Este intento no ha sido aprobado." });
    }

    const user = attempt.userId;
    const company = await Company.findById(user.company);

    const serial = attempt._id.toString().slice(-6).toUpperCase();
    const date = moment(attempt.endTime || new Date()).format("D [de] MMMM [de] YYYY");
    const verificationURL = `https://certificados.q-alimentaria.com/${serial}`;
    const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(verificationURL)}&size=150x150`;

    // Leer imágenes como base64
    const logoBuffer = fs.readFileSync(path.join(__dirname, "assets/logo.png"));
    const firmaBuffer = fs.readFileSync(path.join(__dirname, "assets/firma-eva.png"));

    const data = {
      name: `${user.name} ${user.firstSurname} ${user.secondSurname}`,
      dni: user.dni,
      company: company.name,
      date: date,
      serial: `QA-${serial}`,
      verificationURL,
      logoSrc: `data:image/png;base64,${logoBuffer.toString('base64')}`,
      firmaSrc: `data:image/png;base64,${firmaBuffer.toString('base64')}`,
      qrSrc: qrCodeURL
    };

    console.log("📦 Datos que se pasan a generateDiplomaPDF:", data);

    const pdfBuffer = await generateDiplomaPDF(data);

    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      console.error("❌ PDF buffer inválido o vacío");
      return res.status(500).json({ message: "Error generando PDF (buffer vacío)" });
    }
    

    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      return res.status(500).json({ message: "Error generando PDF (buffer vacío)" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=diploma.pdf");
    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ Error inesperado generando diploma:", err);
    res.status(500).json({ message: "Error generando diploma" });
  }
});

module.exports = router;
