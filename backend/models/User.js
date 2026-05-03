const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── User Schema ─────────────────────────────────────────────────
// Defines the structure of a user document in MongoDB.
// Each field has a type, validation rules, and defaults.
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  nic:      { type: String, required: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'student'], default: 'student' },
  status:   { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true }); // adds createdAt + updatedAt automatically

// ── Auto-hash password before saving ───────────────────────────
// This runs automatically every time a user is saved.
// It only hashes if the password was changed (prevents double-hashing).
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Method: Compare passwords at login ─────────────────────────
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
