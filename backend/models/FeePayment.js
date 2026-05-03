const mongoose = require('mongoose');

// ── Fee Payment Schema ──────────────────────────────────────────
// Records every payment made by a student.
// paymentProof stores the filename of uploaded bank slip image.
// prevStatus is used in the delete-approval workflow.
const feePaymentSchema = new mongoose.Schema({
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feeType:       { type: String, required: true },
  amount:        { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'online', 'cheque'], required: true },
  paymentDate:   { type: Date, required: true },
  billingMonth:  { type: String, default: '' },
  referenceNo:   { type: String, default: null },
  paymentProof:  { type: String, default: null }, // image filename
  status:        { type: String, enum: ['pending', 'paid', 'delete_requested'], default: 'pending' },
  prevStatus:    { type: String, default: null },
  notes:         { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
