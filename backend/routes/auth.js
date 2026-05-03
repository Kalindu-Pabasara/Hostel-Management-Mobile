const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const { authenticate } = require('../middleware/auth');

// ── POST /api/auth/register ─────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, nic, phone, password, role } = req.body;
    if (!name || !email || !nic || !phone || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email already registered.' });

    const user  = await User.create({ name, email, nic, phone, password, role: role || 'student' });
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, nic: user.nic, phone: user.phone, role: user.role }, token });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/auth/login ────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password.' });
    if (user.status !== 'active')
      return res.status(403).json({ message: 'Account inactive. Contact admin.' });

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, nic: user.nic, phone: user.phone }, token });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/auth/me ────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/auth/users ──────────────────────────────────────────
router.get('/users', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });
    
    const users = await User.find().select('_id name email nic phone role status createdAt').sort({ createdAt: -1 });
    
    // Fetch all approved bookings to link users to rooms
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ status: 'approved' }).populate('roomId', 'roomNumber');
    
    console.log(`[AdminUserList] Found ${bookings.length} approved bookings for room mapping.`);

    const result = users.map(u => {
      const uObj = u.toObject();
      const booking = bookings.find(b => b.studentId.toString() === u._id.toString());
      return {
        ...uObj,
        roomNumber: booking?.roomId?.roomNumber || null
      };
    });

    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/auth/available-students ─────────────────────────────
router.get('/available-students', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });
    const Booking = require('../models/Booking');
    const bookedStudentIds = await Booking.find({ status: { $in: ['approved', 'pending'] } }).distinct('studentId');
    const availableStudents = await User.find({
      role: 'student', status: 'active', _id: { $nin: bookedStudentIds }
    }).select('_id name email nic phone').sort({ name: 1 });
    res.json(availableStudents);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/auth/users/:id/status ────────────────────────────
router.patch('/users/:id/status', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });
    const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/auth/profile ─────────────────────────────────────
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (phone) user.phone = phone;
    if (password) user.password = password; // User model handles hashing on .save()

    await user.save();
    res.json({ message: 'Profile updated successfully.', user: { id: user._id, name: user.name, email: user.email, phone: user.phone, nic: user.nic, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/auth/users/:id ──────────────────────────────────
router.delete('/users/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied.' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
