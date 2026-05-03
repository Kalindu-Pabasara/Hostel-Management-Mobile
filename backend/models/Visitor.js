const mongoose = require('mongoose');

// ── Visitor Schema ──────────────────────────────────────────────
// Student registers a visitor. Admin approves or rejects.
// hostStudentId links to the student who registered the visitor.
const visitorSchema = new mongoose.Schema({
  hostStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitorName:   { type: String, required: true },
  visitorNic:    { type: String, required: true },
  visitorPhone:  { type: String, required: true },
  relationship:  { type: String, required: true },  // e.g. "Father", "Friend"
  visitPurpose:  { type: String, required: true },
  visitDate:     { type: Date,   required: true },
  visitTime:     { type: String, required: true },
  numVisitors:   { type: Number, default: 1 },
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
