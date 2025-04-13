const mongoose = require("mongoose");

const companyCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company", // O el nombre real de tu modelo
    required: true
  },
  formationType: {
    type: String,
    required: true
  },
  email: { 
    type: String, 
    required: function () { return this.createdByStripe; }
  },
  maxUsers: {
    type: Number,
    required: true
  },
  usedUsers: {
    type: Number,
    default: 0
  },
  users: [
    {
      name: String,
      email: String,
      dni: String,
      registeredAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  expiresAt: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  auditTrail: [
    {
      action: {
        type: String,
        enum: ["created", "modified", "deleted"],
        required: true
      },
      byAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      details: String
    }
  ]
});

const CompanyCode = mongoose.model("CompanyCode", companyCodeSchema);
module.exports = CompanyCode;
