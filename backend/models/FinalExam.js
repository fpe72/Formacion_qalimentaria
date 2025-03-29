// backend/models/FinalExam.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String, // suponiendo que ahora es texto
});

const finalExamSchema = new mongoose.Schema({
  title: String,
  questions: [questionSchema],
  isActive: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FinalExam', finalExamSchema);
