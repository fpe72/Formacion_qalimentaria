// backend/finalExamRoutes.js
const express = require('express');
const router = express.Router();
const FinalExam = require('./models/FinalExam');
const Attempt = require('./models/Attempt');
const User = require('./models/User');
const Company = require('./models/Company');
const authMiddleware = require('./middleware/auth'); // Ajusta si está en otra ruta
const PDFDocument = require('pdfkit');

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
    const attempt = await Attempt.findById(req.params.attemptId).populate("userId examId");

    if (!attempt || !attempt.passed) {
      return res.status(403).json({ message: "Este intento no ha sido aprobado." });
    }

    const user = attempt.userId;
    const company = await Company.findById(user.company);

    const doc = new PDFDocument({ size: "A4", layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=diploma.pdf");

    // Colores corporativos
    const colorTurquesa = "#0f9aa9";
    const colorVerde = "#76b82a";
    const colorGris = "#6f7c7c";

    // Fondo blanco
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");

    // Marca de agua (texto muy claro)
    doc
      .fontSize(60)
      .fillColor("#eeeeee")
      .rotate(-30, { origin: [300, 200] })
      .text("CERTIFICADO Q-ALIMENTARIA", 100, 200, { opacity: 0.2 });

    doc.rotate(0); // restaurar rotación

    // Logo
    doc.image(path.join(__dirname, "assets/logo.png"), 40, 40, { width: 100 });

    // Título principal
    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor(colorTurquesa)
      .text("DIPLOMA", { align: "center", lineGap: 10 });

    // Nombre completo
    doc
      .moveDown(0.5)
      .font("Helvetica-Bold")
      .fontSize(34)
      .fillColor("#000000")
      .text(`${user.name} ${user.firstSurname} ${user.secondSurname}`, { align: "center" });

    // DNI
    doc
      .moveDown(0.2)
      .font("Helvetica")
      .fontSize(16)
      .text(`DNI: ${user.dni}`, { align: "center" });

    // Texto descriptivo
    doc
      .moveDown(0.5)
      .fontSize(16)
      .fillColor("#000000")
      .text(`Por haber completado la formación de Seguridad Alimentaria`, { align: "center" });

    // Curso
    doc
      .moveDown(0.2)
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor(colorTurquesa)
      .text("BUENAS PRÁCTICAS EN LA SEGURIDAD ALIMENTARIA", { align: "center" });

    // Empresa
    doc
      .moveDown(0.5)
      .font("Helvetica")
      .fontSize(14)
      .fillColor(colorGris)
      .text(`Empresa: ${company.name}`, { align: "center" });

    // Firma
    doc.image(path.join(__dirname, "assets/firma-eva.png"), 500, 320, { width: 150 });

    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#000000")
      .text("Eva María Martín Cruz", 500, 380)
      .text("Gerente de Q-Alimentaria", 500, 395)
      .text("Agrónoma y Licenciada en Tecnología de los Alimentos", 500, 410);

    // Fecha
    const fecha = moment(attempt.endTime || new Date()).format("D [de] MMMM [de] YYYY");
    doc
      .fontSize(12)
      .fillColor("#000000")
      .text(`Fecha de emisión: ${fecha}`, 40, 400);

    // Número de serie
    const serial = attempt._id.toString().slice(-6).toUpperCase();
    doc
      .fontSize(10)
      .fillColor("#555555")
      .text(`N.º de serie: ${serial}`, 40, 415);

    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error("Error generando diploma:", err);
    res.status(500).json({ message: "Error generando diploma" });
  }
});

module.exports = router;
