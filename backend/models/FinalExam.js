const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String,
});

const finalExamSchema = new mongoose.Schema({
  title: { type: String, default: 'Examen final' },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FinalExam', finalExamSchema);
