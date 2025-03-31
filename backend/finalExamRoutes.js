// backend/finalExamRoutes.js
const express = require('express');
const router = express.Router();

// Importar tus modelos
const FinalExam = require('./models/FinalExam'); 
const Attempt = require('./models/Attempt'); 
// ... si necesitas también tu modelo de usuario, etc.

// 1. GET /final-exam/active => obtener el examen activo
router.get('/active', async (req, res) => {
  try {
    const exam = await FinalExam.findOne({ isActive: true });
    if (!exam) {
      return res.status(404).json({ error: 'No hay examen activo.' });
    }
    return res.json(exam);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener examen activo.' });
  }
});

// 2. POST /final-exam/start-attempt => crear un Attempt
router.post('/start-attempt', async (req, res) => {
  try {
    // Si tienes auth, extrae userId de req.user._id
    // Por ahora, simulemos algo:
    const userId = 'FAKE_USER_ID';
    const { examId } = req.body;

    if (!examId) {
      return res.status(400).json({ error: 'Falta examId en el body.' });
    }

    // Creamos Attempt en DB
    const attempt = new Attempt({
      userId,
      examId,
      status: 'in-progress',
      startTime: new Date(),
    });
    await attempt.save();

    return res.json({ attemptId: attempt._id, message: 'Intento iniciado' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo iniciar el intento.' });
  }
});

// 3. POST /final-exam/end-attempt => finalizar Attempt
router.post('/end-attempt', async (req, res) => {
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

    return res.json({ message: 'Intento finalizado', attempt });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudo finalizar el intento.' });
  }
});

// Exportamos el router
module.exports = router;
