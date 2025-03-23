// models/Progress.js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userEmail: { type: String, ref: 'User', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  // Array donde guardamos los IDs o nombres de lecciones completadas
  lessonsCompleted: [{ type: String }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);
