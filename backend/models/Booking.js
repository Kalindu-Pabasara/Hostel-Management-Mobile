const mongoose = require('mongoose');

// ── Booking Schema ──────────────────────────────────────────────
// Links a student to a room. Status starts as 'pending' and
// admin changes it to 'approved' or 'rejected'.
// ref: 'User' and ref: 'Room' create relationships between collections.
const bookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  status:    { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  notes:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
