// models/Module.js (DESPUÉS)
const mongoose = require('mongoose');

// Subdocumento para cada lección
const lessonSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    required: true
  },
  lessonTitle: {
    type: String,
    required: true
  },
  // El contenido puede ser HTML, Markdown o texto plano
  lessonContent: {
    type: String,
    required: true
  }
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  order: Number,
  // Array de lecciones
  lessons: [lessonSchema]
});

module.exports = mongoose.model('Module', moduleSchema);
