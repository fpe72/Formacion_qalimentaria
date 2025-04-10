// backend/models/Company.js

const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  cif: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  }
  // (Opcional) puedes añadir módulos asignados:
  // modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }]
});

module.exports = mongoose.model('Company', companySchema);
