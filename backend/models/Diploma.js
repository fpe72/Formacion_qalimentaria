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
  serial: {
    type: String,
    required: true,
    unique: true, // número de registro único
  },
  pdfPath: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("Diploma", diplomaSchema);
