const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const Room    = require('../models/Room');
const Booking = require('../models/Booking');
const { authenticate, requireAdmin } = require('../middleware/auth');

// ── Multer: Image Upload Config ─────────────────────────────────
// Multer handles file uploads. We save images to /uploads/rooms/
// with a timestamp-based filename to avoid name conflicts.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/rooms');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `room_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_, file, cb) => {
    if (/image\/(jpeg|jpg|png|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// ── GET /api/rooms ──────────────────────────────────────────────
// Returns all rooms with live bed counts calculated from bookings.
router.get('/', authenticate, async (req, res) => {
  try {
    const rooms           = await Room.find();
    const approved        = await Booking.find({ status: 'approved' });
    const pending         = await Booking.find({ status: 'pending' });

    const result = rooms.map(r => {
      const id            = r._id.toString();
      const confirmedBeds = approved.filter(b => b.roomId.toString() === id).length;
      const pendingBeds   = pending.filter(b => b.roomId.toString() === id).length;
      const joinableBeds  = r.capacity - confirmedBeds;
      
      let userBookingStatus = null;
      if (approved.some(b => b.roomId.toString() === id && b.studentId.toString() === req.user.id)) {
        userBookingStatus = 'Allocated';
      } else if (pending.some(b => b.roomId.toString() === id && b.studentId.toString() === req.user.id)) {
        userBookingStatus = 'Pending';
      }

      return { ...r.toObject(), confirmedBeds, pendingBeds, joinableBeds, userBookingStatus };
    });
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/rooms/:id ──────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json(room);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/rooms ─────────────────────────────────────────────
// Admin creates a new room. upload.single('image') processes the
// uploaded photo and saves it to disk before this handler runs.
router.post('/', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { roomNumber, type, floor, capacity, price, amenities, description } = req.body;
    if (!roomNumber || !type || !floor || !capacity || !price)
      return res.status(400).json({ message: 'roomNumber, type, floor, capacity, price required.' });
    if (await Room.findOne({ roomNumber }))
      return res.status(409).json({ message: 'Room number already exists.' });

    const room = await Room.create({
      roomNumber, type,
      floor: Number(floor), capacity: Number(capacity), price: Number(price),
      amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
      description: description || '',
      image: req.file ? req.file.filename : null,
    });
    res.status(201).json(room);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PUT /api/rooms/:id ──────────────────────────────────────────
// Admin updates an existing room. Only changed fields are updated.
router.put('/:id', authenticate, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const updates = {};
    const fields  = ['roomNumber','type','floor','capacity','price','status','description'];
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (req.body.amenities) updates.amenities = req.body.amenities.split(',').map(a => a.trim());
    if (req.file)           updates.image     = req.file.filename;

    const room = await Room.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json(room);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/rooms/:id ───────────────────────────────────────
// Admin deletes a room permanently.
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.json({ message: `Room ${room.roomNumber} deleted.` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
