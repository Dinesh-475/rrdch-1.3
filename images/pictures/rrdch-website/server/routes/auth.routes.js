/**
 * RRDCH — auth.routes.js
 * POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
 * POST /api/auth/patient/otp/send, POST /api/auth/patient/otp/verify
 */
const crypto  = require('crypto');
const router  = require('express').Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../database');
const { emitAdminRealtime } = require('../utils/socketHandlers');

// In-memory OTP store (demo only — use Redis in production)
const otpStore = {};

/** POST /api/auth/login */
router.post('/login', (req, res) => {
  const { identifier, password, role } = req.body;
  if (!identifier || !password)
    return res.status(400).json({ ok: false, msg: 'Missing credentials.' });

  db.get('SELECT * FROM users WHERE id = ? AND is_active = 1', [identifier], (err, user) => {
    if (err)   return res.status(500).json({ ok: false, msg: 'Database error.' });
    if (!user) return res.status(401).json({ ok: false, msg: 'Account not found.' });

    bcrypt.compare(password, user.password, (bErr, match) => {
      if (bErr || !match)
        return res.status(401).json({ ok: false, msg: 'Incorrect password.' });

      // Optional role check
      if (role && user.role !== role && !(role === 'admin' && user.role === 'hod'))
        return res.status(401).json({ ok: false, msg: 'Wrong role selected for this account.' });

      const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name, portal: user.portal },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last_login
      db.run('UPDATE users SET last_login = datetime("now") WHERE id = ?', [user.id]);

      const sessionToken = 'sess_' + crypto.randomBytes(16).toString('hex');
      const ua = (req.get('user-agent') || '').slice(0, 400);
      const ip = (req.ip || req.connection?.remoteAddress || '').slice(0, 64);
      db.run(
        `INSERT INTO login_sessions (user_id, role, ip, user_agent, session_token) VALUES (?,?,?,?,?)`,
        [user.id, user.role, ip, ua, sessionToken]
      );

      // Log activity
      db.run(
        `INSERT INTO activity_log (type,actor_id,actor_name,action,ip) VALUES ('LOGIN',?,?,?,?)`,
        [user.id, user.name, `Logged in as ${user.role}`, req.ip]
      );

      emitAdminRealtime('user_login', {
        user_id: user.id,
        name: user.name,
        role: user.role,
        ip,
        session_token: sessionToken,
      });

      res.json({
        ok: true, token,
        user: { name: user.name, role: user.role, portal: user.portal, id: user.id }
      });
    });
  });
});

/** POST /api/auth/patient/otp/send — Simulate OTP (log to console) */
router.post('/patient/otp/send', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ ok: false, msg: 'Phone required.' });
  const otp = '123456'; // Hardcoded for demo
  otpStore[phone] = { otp, expires: Date.now() + 300000 };
  console.log(`📱 OTP for ${phone}: ${otp}`);
  res.json({ ok: true, msg: `OTP sent to ${phone} (demo: 123456)` });
});

/** POST /api/auth/patient/otp/verify */
router.post('/patient/otp/verify', (req, res) => {
  const { phone, otp } = req.body;
  const isDemo = (phone === '9876543210' && otp === '123456');
  const entry = otpStore[phone];
  if (!isDemo && (!entry || entry.otp !== otp || Date.now() > entry.expires)) {
    return res.status(401).json({ ok: false, msg: 'Invalid or expired OTP.' });
  }

  if (entry) delete otpStore[phone];

  db.get('SELECT * FROM users WHERE id = ? AND role = "patient"', [phone], (err, user) => {
    const name = user ? user.name : 'Patient';
    const token = jwt.sign({ id: phone, role: 'patient', name, portal: 'patient' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const sessionToken = 'sess_' + crypto.randomBytes(16).toString('hex');
    const ua = (req.get('user-agent') || '').slice(0, 400);
    const ip = (req.ip || '').slice(0, 64);
    db.run(
      `INSERT INTO login_sessions (user_id, role, ip, user_agent, session_token) VALUES (?,?,?,?,?)`,
      [phone, 'patient', ip, ua, sessionToken]
    );
    // Log OTP login
    db.run(
      `INSERT INTO activity_log (type,actor_id,actor_name,action,ip) VALUES ('LOGIN',?,?,?,?)`,
      [phone, name, 'Patient OTP login', req.ip]
    );
    emitAdminRealtime('user_login', {
      user_id: phone,
      name,
      role: 'patient',
      ip,
      method: 'otp',
      session_token: sessionToken,
    });
    res.json({ ok: true, token, user: { name, role: 'patient', portal: 'patient', id: phone } });
  });
});

/** GET /api/auth/me */
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, msg: 'No token.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ ok: true, user: { id: payload.id, name: payload.name, role: payload.role, portal: payload.portal } });
  } catch {
    res.status(401).json({ ok: false, msg: 'Invalid token.' });
  }
});

/** POST /api/auth/logout — instruction to clear token client-side */
router.post('/logout', (req, res) => {
  res.json({ ok: true, msg: 'Logged out. Clear token from localStorage.' });
});

module.exports = router;
