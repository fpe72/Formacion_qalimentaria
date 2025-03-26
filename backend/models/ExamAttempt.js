// backend/models/ExamAttempt.js
const mongoose = require('mongoose');

const ExamAttemptSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  answers: [{ questionId: String, selected: String }],
  score: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  attemptNumber: { type: Number, required: true }, // 1 o 2
  expiresAt: { type: Date }, // Solo para segundo intento
});

module.exports = mongoose.model('ExamAttempt', ExamAttemptSchema);
