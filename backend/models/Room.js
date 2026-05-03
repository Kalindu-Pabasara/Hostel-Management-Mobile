const mongoose = require('mongoose');

// ── Room Schema ─────────────────────────────────────────────────
// Stores all room details. 'capacity' is max beds, 'currentOccupancy'
// is updated automatically when bookings are approved/cancelled.
const roomSchema = new mongoose.Schema({
  roomNumber:       { type: String, required: true, unique: true },
  type:             { type: String, enum: ['Single', 'Double', 'Suite'], required: true },
  floor:            { type: Number, required: true },
  capacity:         { type: Number, required: true },
  currentOccupancy: { type: Number, default: 0 },
  price:            { type: Number, required: true },
  status:           { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  amenities:        [String],       // e.g. ["WiFi", "AC", "Attached Bathroom"]
  image:            { type: String, default: null }, // filename of uploaded image
  description:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
