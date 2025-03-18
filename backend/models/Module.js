// backend/models/Module.js
const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String }, // Puedes usarlo para almacenar texto, HTML o URL de recursos multimedia.
  order: { type: Number, default: 0 } // Para definir el orden de presentación de los módulos.
});

module.exports = mongoose.model('Module', moduleSchema);
