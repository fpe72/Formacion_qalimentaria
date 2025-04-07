const mongoose = require("mongoose");

const diplomaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // un diploma por usuario
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FinalExam",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  dni: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  serial: {
    type: String,
    required: true,
    unique: true,
  },
  verificationURL: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Diploma", diplomaSchema);
