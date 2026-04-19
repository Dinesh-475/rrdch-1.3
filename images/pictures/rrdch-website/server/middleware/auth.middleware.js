/**
 * RRDCH — auth.middleware.js
 * JWT verification and role-based access guard.
 */
const jwt = require('jsonwebtoken');

/**
 * Verify JWT from Authorization header.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, msg: 'No token provided. Please log in.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, msg: 'Invalid or expired token. Please log in again.' });
  }
};

/**
 * Restrict route to specific roles.
 * @param {...string} roles - Allowed roles.
 */
const roleGuard = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ ok: false, msg: `Forbidden: requires role ${roles.join(' or ')}` });
  next();
};

module.exports = { authMiddleware, roleGuard };
