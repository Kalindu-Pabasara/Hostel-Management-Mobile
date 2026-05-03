const router  = require('express').Router();
const Booking = require('../models/Booking');
const Room    = require('../models/Room');
const { authenticate, requireAdmin } = require('../middleware/auth');

// ── GET /api/bookings ───────────────────────────────────────────
// Admin sees ALL bookings. Students see only their own.
// .populate() replaces the stored ID with the actual user/room data.
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { studentId: req.user.id };
    const bookings = await Booking.find(filter)
      .populate('studentId', 'name email')   // show student name + email
      .populate('roomId', 'roomNumber type price floor')  // show room details
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/bookings ──────────────────────────────────────────
// Student requests to book a room. Status starts as 'pending'.
// Checks: room exists, has free beds, student has no active booking.
router.post('/', authenticate, async (req, res) => {
  try {
    const { roomId, startDate, endDate, notes } = req.body;
    if (!roomId || !startDate || !endDate)
      return res.status(400).json({ message: 'roomId, startDate, endDate required.' });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    // Count currently approved bookings for this room
    const approvedCount = await Booking.countDocuments({ roomId, status: 'approved' });
    if (approvedCount >= room.capacity)
      return res.status(400).json({ message: 'Room is fully booked.' });

    // Prevent student from double-booking
    const hasActive = await Booking.findOne({ studentId: req.user.id, status: { $in: ['pending', 'approved'] } });
    if (hasActive) return res.status(400).json({ message: 'You already have an active booking.' });

    const booking = await Booking.create({
      studentId: req.user.id, roomId, startDate, endDate, notes: notes || ''
    });
    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/bookings/:id/approve ────────────────────────────
// Admin approves a booking. Updates room occupancy automatically.
router.patch('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    booking.status = 'approved';
    await booking.save();

    // Recalculate room occupancy
    const room = await Room.findById(booking.roomId);
    if (room) {
      const count  = await Booking.countDocuments({ roomId: room._id, status: 'approved' });
      room.currentOccupancy = count;
      room.status = count >= room.capacity ? 'occupied' : 'available';
      await room.save();
    }
    res.json({ message: 'Booking approved.', booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/bookings/:id/reject ─────────────────────────────
router.patch('/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ message: 'Booking rejected.', booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/bookings/:id ────────────────────────────────────
// Student cancels their own booking. Admin can cancel any booking.
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (req.user.role !== 'admin' && booking.studentId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not allowed.' });

    await booking.deleteOne();

    // Update room occupancy after cancellation
    const room = await Room.findById(booking.roomId);
    if (room) {
      const count  = await Booking.countDocuments({ roomId: room._id, status: 'approved' });
      room.currentOccupancy = count;
      room.status = count < room.capacity ? 'available' : 'occupied';
      await room.save();
    }
    res.json({ message: 'Booking cancelled.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/bookings/direct ───────────────────────────────────
// Admin directly allocates a room to a student. Bypasses request flow.
router.post('/direct', authenticate, requireAdmin, async (req, res) => {
  try {
    const { studentId, roomId, startDate, endDate, notes } = req.body;
    if (!studentId || !roomId || !startDate || !endDate)
      return res.status(400).json({ message: 'studentId, roomId, startDate, endDate required.' });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    const approvedCount = await Booking.countDocuments({ roomId, status: 'approved' });
    if (approvedCount >= room.capacity)
      return res.status(400).json({ message: 'Room is fully booked.' });

    const booking = await Booking.create({
      studentId, roomId, startDate, endDate, status: 'approved', notes: notes || 'Directly allocated by Admin.'
    });

    // Update room occupancy
    const count = approvedCount + 1;
    room.currentOccupancy = count;
    room.status = count >= room.capacity ? 'occupied' : 'available';
    await room.save();

    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
