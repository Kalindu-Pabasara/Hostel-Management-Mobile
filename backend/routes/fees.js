const router     = require('express').Router();
const FeePayment = require('../models/FeePayment');
const { authenticate, requireAdmin } = require('../middleware/auth');
const multer     = require('multer');
const fs         = require('fs');

// Ensure uploads folder exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ── GET /api/fees/payments ──────────────────────────────────────
// Admin: all payments. Student: only their own.
router.get('/payments', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { studentId: req.user.id };
    const payments = await FeePayment.find(filter)
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST /api/fees/payment ──────────────────────────────────────
// Records a new payment. Admin payments are auto-approved ('paid').
// Student payments start as 'pending' until admin approves.
router.post('/payment', authenticate, upload.single('paymentProof'), async (req, res) => {
  try {
    const { studentId, feeType, amount, paymentMethod, paymentDate, billingMonth, referenceNo, notes } = req.body;
    if (!feeType || !amount || !paymentMethod || !paymentDate)
      return res.status(400).json({ message: 'feeType, amount, paymentMethod, paymentDate required.' });

    let proofPath = null;
    if (req.file) {
      proofPath = req.file.filename;
    }

    const payment = await FeePayment.create({
      studentId:     studentId || req.user.id,
      feeType, amount, paymentMethod, paymentDate,
      billingMonth:  billingMonth || '',
      referenceNo:   referenceNo || null,
      paymentProof:  proofPath,
      notes:         notes || '',
      status: req.user.role === 'admin' ? 'paid' : 'pending',
    });
    res.status(201).json(payment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/fees/payments/:id/approve ───────────────────────
router.patch('/payments/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const p = await FeePayment.findByIdAndUpdate(req.params.id, { status: 'paid' }, { new: true });
    if (!p) return res.status(404).json({ message: 'Payment not found.' });
    res.json({ message: 'Payment approved.', payment: p });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DELETE /api/fees/payments/:id ──────────────────────────────
// Admin initiates deletion -> sets status to delete_requested
router.delete('/payments/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const p = await FeePayment.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Payment not found.' });

    p.prevStatus = p.status;
    p.status = 'delete_requested';
    await p.save();
    
    res.json({ message: 'Deletion requested. Waiting for student approval.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/fees/payments/:id/delete_approve ─────────────────
// Student approves deletion
router.patch('/payments/:id/delete_approve', authenticate, async (req, res) => {
  try {
    const p = await FeePayment.findOne({ _id: req.params.id, studentId: req.user.id });
    if (!p) return res.status(404).json({ message: 'Payment not found.' });
    if (p.status !== 'delete_requested') return res.status(400).json({ message: 'Not in delete requested state.' });

    await FeePayment.findByIdAndDelete(p._id);
    res.json({ message: 'Payment deleted permanently.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH /api/fees/payments/:id/delete_reject ──────────────────
// Student rejects deletion
router.patch('/payments/:id/delete_reject', authenticate, async (req, res) => {
  try {
    const p = await FeePayment.findOne({ _id: req.params.id, studentId: req.user.id });
    if (!p) return res.status(404).json({ message: 'Payment not found.' });
    if (p.status !== 'delete_requested') return res.status(400).json({ message: 'Not in delete requested state.' });

    p.status = p.prevStatus || 'pending';
    p.prevStatus = null;
    await p.save();
    res.json({ message: 'Deletion rejected. Payment restored.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET /api/fees/structure ─────────────────────────────────────
// Static fee catalog — no need to store in DB for now.
router.get('/structure', authenticate, (req, res) => {
  res.json([
    { id:1, name:'Accommodation - Single', category:'accommodation', amount:15000 },
    { id:2, name:'Accommodation - Double', category:'accommodation', amount:22000 },
    { id:3, name:'Accommodation - Suite',  category:'accommodation', amount:35000 },
    { id:4, name:'Mess Fee',               category:'meals',         amount:8000  },
    { id:5, name:'Electricity & Water',    category:'utilities',     amount:2500  },
    { id:6, name:'Laundry Service',        category:'laundry',       amount:1500  },
    { id:7, name:'Security Deposit',       category:'security',      amount:30000 },
  ]);
});

module.exports = router;
