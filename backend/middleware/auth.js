const jwt = require('jsonwebtoken');

// ── Middleware 1: Verify JWT token ──────────────────────────────
// Every protected route runs this first. It reads the token from
// the request header, verifies it, and attaches the user info.
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // decode token
    next(); // valid → continue to the route
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// ── Middleware 2: Admin only ────────────────────────────────────
// Runs AFTER authenticate. Blocks students from admin routes.
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required.' });
  next();
};

module.exports = { authenticate, requireAdmin };
