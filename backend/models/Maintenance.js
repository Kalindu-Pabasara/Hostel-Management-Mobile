const mongoose = require('mongoose');

// ── Maintenance Schema ──────────────────────────────────────────
// Student submits a repair/issue request. Admin updates the status.
// priority helps admin decide what to fix first.
const maintenanceSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomNumber:  { type: String, required: true },
  category:    { type: String, enum: ['electrical', 'plumbing', 'ac', 'furniture', 'cleaning', 'wifi', 'meals', 'laundry', 'other'], required: true },
  description: { type: String, required: true },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status:      { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  adminNotes:  { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
