// backend/models/Progress.js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },  // Puede ser el email o el ID del usuario
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  dateCompleted: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);
