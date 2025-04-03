const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinalExam',
    required: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'finished'],
    default: 'in-progress'
  },
  score: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  diplomaIssued: {               // Campo NUEVO propuesto
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Attempt', attemptSchema);
