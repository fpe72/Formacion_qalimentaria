// backend/models/Module.js

const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  content: String, // <--- campo único para HTML
  order: Number,
});

module.exports = mongoose.model('Module', moduleSchema);
