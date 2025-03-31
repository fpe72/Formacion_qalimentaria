// backend/models/Attempt.js
const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinalExam', // asumiendo que la colección es 'finalexams'
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
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date
});

module.exports = mongoose.model('Attempt', attemptSchema);
