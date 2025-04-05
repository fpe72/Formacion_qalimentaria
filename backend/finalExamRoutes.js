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
const Diploma = require('./models/Diploma'); // al principio del archivo

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
    const attempt = await Attempt.findById(req.params.attemptId).populate("userId examId");

    if (!attempt) return res.status(404).json({ message: "Intento no encontrado" });
    if (!attempt.passed) return res.status(403).json({ message: "Intento no aprobado" });

    const user = attempt.userId;

    // Buscar si ya existe un diploma para este usuario
    let diploma = await Diploma.findOne({ userId: user._id });

    if (diploma) {
      // Ya existe → devolver PDF existente
      const pdfBuffer = require("fs").readFileSync(diploma.pdfPath);
      res.setHeader("Content-Type", "application/pdf");
      return res.send(pdfBuffer);
    }

    // Generar nuevo número de serie único
    const serial = `QA-${user.dni}-${Date.now()}`;

    // Crear PDF
    const generateDiplomaPDF = require("./utils/generateDiploma");
    const pdfBuffer = await generateDiplomaPDF({
      name: `${user.name} ${user.firstSurname} ${user.secondSurname}`,
      dni: user.dni,
      company: user.companyName || "Sin empresa",
      date: new Date().toLocaleDateString(),
      serial,
      verificationURL: `https://tuweb.com/verificar/${serial}`,
      logoSrc: "logo.png",
      firmaSrc: "firma eva.png",
      qrSrc: "qr temporal.png"
    });

    if (!pdfBuffer) return res.status(500).json({ message: "Error generando el diploma" });

    // Guardar el PDF localmente
    const path = require("path");
    const fs = require("fs");
    const outputPath = path.join(__dirname, "templates", `diploma_${user._id}.pdf`);
    fs.writeFileSync(outputPath, pdfBuffer);

    // Guardar el diploma en la base de datos
    diploma = new Diploma({
      userId: user._id,
      examId: attempt.examId._id,
      serial,
      pdfPath: outputPath
    });
    await diploma.save();

    // Devolver el PDF generado
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ Error generando/consultando diploma:", error);
    res.status(500).json({ message: "Error generando/consultando diploma" });
  }
});

module.exports = router;
