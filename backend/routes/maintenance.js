const router      = require('express').Router();
const Maintenance = require('../models/Maintenance');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET all (admin: all, student: own)
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { studentId: req.user.id };
    const items = await Maintenance.find(filter)
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST new request (student)
router.post('/', authenticate, async (req, res) => {
  try {
    const { roomNumber, category, description, priority } = req.body;
    if (!roomNumber || !category || !description)
      return res.status(400).json({ message: 'roomNumber, category, description required.' });
    const item = await Maintenance.create({
      studentId: req.user.id, roomNumber, category, description, priority: priority || 'medium',
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH update status (admin)
router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const item = await Maintenance.findByIdAndUpdate(req.params.id, { status, adminNotes }, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found.' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const item = await Maintenance.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found.' });
    res.json({ message: 'Deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
