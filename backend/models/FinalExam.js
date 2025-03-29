// backend/models/FinalExam.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number,
});

const finalExamSchema = new mongoose.Schema({
  title: String,
  questions: [questionSchema],
  isActive: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('FinalExam', finalExamSchema);
