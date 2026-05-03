require('dotenv').config();           // Load .env variables
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors());                             // Allow React Native to call this API
app.use(express.json({ limit: '10mb' }));   // Parse JSON request bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// ── API Routes ──────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/rooms',       require('./routes/rooms'));
app.use('/api/bookings',    require('./routes/bookings'));
app.use('/api/fees',        require('./routes/fees'));
app.use('/api/visitors',    require('./routes/visitors'));
app.use('/api/maintenance', require('./routes/maintenance'));

app.get('/api/test', (req, res) => res.json({ message: 'API is working' }));

// ── Health Check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ── Connect MongoDB & Start Server ──────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected to Atlas');
    app.listen(PORT, () => console.log(`🏨 HostelMS Mobile API running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
