const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String,
  order: Number,
  questions: [{
    question: String,
    options: [String],
    answer: String
  }]
});

module.exports = mongoose.model('Module', ModuleSchema);
