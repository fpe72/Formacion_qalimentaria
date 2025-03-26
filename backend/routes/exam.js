// backend/routes/exam.js
const express = require('express');
const router = express.Router();
const ExamAttempt = require('../models/ExamAttempt');
const Progress = require('../models/Progress');
const authMiddleware = require('../middleware/authMiddleware');

// Constantes del examen
const TOTAL_QUESTIONS = 25;
const PASS_SCORE = 18;
const MAX_ATTEMPTS = 2;
const RETRY_WINDOW_HOURS = 72;

// Comprobar estado del examen
router.get('/status', authMiddleware, async (req, res) => {
  const attempts = await ExamAttempt.find({ userEmail: req.user.email });
  const passed = attempts.some(a => a.passed);
  const lastAttempt = attempts[attempts.length - 1];

  // Si ya aprobó
  if (passed) return res.json({ status: 'passed' });

  // Si nunca intentó
  if (attempts.length === 0) return res.json({ status: 'can_start' });

  // Si falló uno y aún puede repetir
  if (attempts.length === 1 && !lastAttempt.passed) {
    const retryDeadline = new Date(lastAttempt.startTime);
    retryDeadline.setHours(retryDeadline.getHours() + RETRY_WINDOW_HOURS);
    const now = new Date();

    if (now <= retryDeadline) {
      return res.json({ status: 'can_retry', retryUntil: retryDeadline });
    } else {
      return res.json({ status: 'reset_required' });
    }
  }

  // Si ya hizo 2 intentos
  if (attempts.length >= MAX_ATTEMPTS) {
    return res.json({ status: 'reset_required' });
  }

  res.json({ status: 'unknown' });
});

// Iniciar nuevo intento de examen
router.post('/start', authMiddleware, async (req, res) => {
  const attempts = await ExamAttempt.find({ userEmail: req.user.email });

  if (attempts.length >= MAX_ATTEMPTS) {
    return res.status(403).json({ message: 'Máximo de intentos alcanzado' });
  }

  const attemptNumber = attempts.length + 1;
  const expiresAt = attemptNumber === 2
    ? new Date(Date.now() + RETRY_WINDOW_HOURS * 60 * 60 * 1000)
    : null;

  const newAttempt = new ExamAttempt({
    userEmail: req.user.email,
    attemptNumber,
    expiresAt,
  });

  await newAttempt.save();
  res.json({ message: 'Intento iniciado', attemptNumber });
});

// Enviar respuestas del examen
router.post('/submit', authMiddleware, async (req, res) => {
  const { answers } = req.body; // Array de {questionId, selected}
  const correctAnswers = req.body.correctAnswers; // En una versión real, lo ideal es que esto esté validado en backend

  const correctCount = answers.filter(a =>
    correctAnswers.some(c => c.questionId === a.questionId && c.correct === a.selected)
  ).length;

  const passed = correctCount >= PASS_SCORE;

  const attempts = await ExamAttempt.find({ userEmail: req.user.email });
  const currentAttempt = attempts[attempts.length - 1];
  currentAttempt.answers = answers;
  currentAttempt.score = correctCount;
  currentAttempt.passed = passed;
  await currentAttempt.save();

  if (!passed && currentAttempt.attemptNumber === 2) {
    // Eliminar progreso del usuario
    await Progress.deleteMany({ userEmail: req.user.email });
  }

  res.json({ passed, correctCount });
});

module.exports = router;
