const router  = require('express').Router();
const Visitor = require('../models/Visitor');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET all visitors (admin: all, student: own)
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { hostStudentId: req.user.id };
    const visitors = await Visitor.find(filter)
      .populate('hostStudentId', 'name email')
      .sort({ createdAt: -1 });
    res.json(visitors);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST register visitor (student)
router.post('/', authenticate, async (req, res) => {
  try {
    const { visitorName, visitorNic, visitorPhone, relationship, visitPurpose, visitDate, visitTime, numVisitors } = req.body;
    if (!visitorName || !visitorNic || !visitorPhone || !relationship || !visitPurpose || !visitDate || !visitTime)
      return res.status(400).json({ message: 'All visitor fields are required.' });

    const visitor = await Visitor.create({
      hostStudentId: req.user.id,
      visitorName, visitorNic, visitorPhone, relationship,
      visitPurpose, visitDate, visitTime, numVisitors: numVisitors || 1,
    });
    res.status(201).json(visitor);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH approve (admin)
router.patch('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const targetVisitor = await Visitor.findById(req.params.id);
    if (!targetVisitor) return res.status(404).json({ message: 'Not found.' });

    // Sum currently approved visitors for this specific date
    const currentlyApproved = await Visitor.find({
      visitDate: targetVisitor.visitDate,
      status: 'approved'
    });
    const currentTotal = currentlyApproved.reduce((sum, v) => sum + (v.numVisitors || 1), 0);
    const targetCount = targetVisitor.numVisitors || 1;

    if (currentTotal + targetCount > 5) {
      return res.status(400).json({ message: `Cannot approve. This brings total visitors to ${currentTotal + targetCount} (Maximum 5 allowed per day).` });
    }

    targetVisitor.status = 'approved';
    await targetVisitor.save();
    
    res.json({ message: 'Visitor approved.', visitor: targetVisitor });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH reject (admin)
router.patch('/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const v = await Visitor.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!v) return res.status(404).json({ message: 'Not found.' });
    res.json({ message: 'Visitor rejected.', visitor: v });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const v = await Visitor.findByIdAndDelete(req.params.id);
    if (!v) return res.status(404).json({ message: 'Not found.' });
    res.json({ message: 'Deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
